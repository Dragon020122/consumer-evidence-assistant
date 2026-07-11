import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { extractionPayloadSchema, locate, parseDate, parseMoney, type ExtractionPayload } from "@/lib/extraction";
import { redactBeforeModel } from "@/lib/security";
import type { SessionUser } from "@/server/auth";
import { audit } from "@/server/audit";
import { getCaseForActor } from "@/server/cases";
import { listEvidence, readEvidence, type EvidenceRow } from "@/server/storage";

export interface ExtractionAdapter {
  readonly name: string;
  extract(input: { evidence: EvidenceRow; text: string | null }): Promise<unknown>;
}

function matchValue(text: string, pattern: RegExp): string | null { return text.match(pattern)?.[1]?.trim() ?? null; }

export class MockExtractionAdapter implements ExtractionAdapter {
  readonly name = "mock";
  async extract({ evidence, text }: { evidence: EvidenceRow; text: string | null }): Promise<unknown> {
    if (!text) return extractionPayloadSchema.parse({
      evidenceId: evidence.id, classification: evidence.category, requiresManualProcessing: true, provider: this.name,
      fields: [{ fieldName: "summary", value: null, evidenceId: evidence.id, sourcePageOrImage: "文件 1", sourceLocator: "Mock 模式不解析图片/PDF内容", confidence: 0, needsHumanConfirmation: true }]
    });
    const date = parseDate(text); const amount = parseMoney(text);
    const candidates: Array<[string, string | number | null, string]> = [
      ["date", date, date ?? ""], ["amount", amount, amount === null ? "" : String(amount)],
      ["merchantName", matchValue(text, /(?:商家|收款方|商户)[:：]\s*([^\n]{1,100})/), ""],
      ["payer", matchValue(text, /付款方[:：]\s*([^\n]{1,100})/), ""], ["payee", matchValue(text, /收款方[:：]\s*([^\n]{1,100})/), ""],
      ["orderNumber", matchValue(text, /订单号[:：]\s*([A-Za-z0-9_-]{3,100})/), ""], ["contractNumber", matchValue(text, /合同号[:：]\s*([A-Za-z0-9_-]{3,100})/), ""],
      ["serviceName", matchValue(text, /(?:服务|商品)[:：]\s*([^\n]{1,100})/), ""], ["remainingCount", matchValue(text, /剩余(?:次数|课时|期限)[:：]\s*([^\n]{1,100})/), ""],
      ["merchantPromise", matchValue(text, /商家承诺[:：]\s*([^\n]{1,300})/), ""], ["refundRequest", matchValue(text, /退费请求[:：]\s*([^\n]{1,300})/), ""],
      ["merchantResponse", matchValue(text, /商家回复[:：]\s*([^\n]{1,300})/), ""], ["summary", text.slice(0, 180).replace(/\s+/g, " "), text.slice(0, 30)]
    ];
    const fields = candidates.filter(([, value]) => value !== null).map(([fieldName, value, raw]) => ({
      fieldName, value, evidenceId: evidence.id, sourcePageOrImage: "文本文件", sourceLocator: locate(text, raw || String(value)),
      confidence: fieldName === "summary" ? 0.6 : 0.88, needsHumanConfirmation: true
    }));
    return { evidenceId: evidence.id, classification: evidence.category, fields, requiresManualProcessing: fields.length <= 1, provider: this.name };
  }
}

export interface ExtractionRow { id:string;caseId:string;evidenceId:string;fieldName:string;originalValueJson:string|null;confirmedValueJson:string|null;sourceLocator:string;confidence:number;needsReview:number;state:string;confirmedBy:string|null;confirmedAt:string|null;createdAt:string }
const fields = `id,case_id AS caseId,evidence_id AS evidenceId,field_name AS fieldName,original_value_json AS originalValueJson,
 confirmed_value_json AS confirmedValueJson,source_locator AS sourceLocator,confidence,needs_review AS needsReview,state,
 confirmed_by AS confirmedBy,confirmed_at AS confirmedAt,created_at AS createdAt`;

export async function extractCase(actor: SessionUser, caseId: string, adapter: ExtractionAdapter = new MockExtractionAdapter()): Promise<ExtractionRow[]> {
  const item = getCaseForActor(actor, caseId); if (actor.role !== "ADMIN" && item.ownerId !== actor.id) throw new AppError("FORBIDDEN", "只有案件所有者可以启动提取", 403);
  const evidence = listEvidence(actor, caseId); if (!evidence.length) throw new AppError("NO_EVIDENCE", "请先上传证据", 409);
  const db = getDb(); db.prepare("UPDATE cases SET status='EXTRACTING',updated_at=? WHERE id=?").run(new Date().toISOString(),caseId);
  db.prepare("DELETE FROM extractions WHERE case_id=? AND state='PENDING'").run(caseId);
  for (const file of evidence) {
    let text: string | null = null; if (file.mimeType === "text/plain") { const result = await readEvidence(actor,file.id); text = result.bytes.toString("utf8",0,100_000); if(getEnv().MODEL_REDACTION_ENABLED==="true")text=redactBeforeModel(text); }
    let payload: ExtractionPayload | null = null; let lastError: unknown;
    for (let attempt=0;attempt<=getEnv().MODEL_MAX_RETRIES;attempt++) { try { payload=extractionPayloadSchema.parse(await adapter.extract({evidence:file,text})); break; } catch(error){lastError=error;} }
    if (!payload) { db.prepare(`INSERT INTO extractions (id,case_id,evidence_id,field_name,original_value_json,source_locator,confidence,needs_review,state,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(randomUUID(),caseId,file.id,"summary",null,"结构化校验失败",0,1,"MANUAL_REQUIRED",new Date().toISOString()); audit(actor,"EXTRACTION_VALIDATION_FAILED","EVIDENCE",file.id,"FAILED",{errorType:lastError instanceof Error?lastError.name:"unknown"}); continue; }
    for (const field of payload.fields) db.prepare(`INSERT INTO extractions (id,case_id,evidence_id,field_name,original_value_json,source_locator,confidence,needs_review,state,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(randomUUID(),caseId,file.id,field.fieldName,field.value===null?null:JSON.stringify(field.value),`${field.sourcePageOrImage} · ${field.sourceLocator}`,field.confidence,field.needsHumanConfirmation?1:0,"PENDING",new Date().toISOString());
  }
  db.prepare("UPDATE cases SET status='PENDING_USER_CONFIRMATION',updated_at=? WHERE id=?").run(new Date().toISOString(),caseId); audit(actor,"CASE_EXTRACTED","CASE",caseId,"SUCCESS",{provider:adapter.name,fileCount:evidence.length}); return listExtractions(actor,caseId);
}

export function listExtractions(actor:SessionUser,caseId:string):ExtractionRow[]{getCaseForActor(actor,caseId);return getDb().prepare(`SELECT ${fields} FROM extractions WHERE case_id=? ORDER BY created_at,field_name`).all(caseId) as unknown as ExtractionRow[];}

export function confirmExtraction(actor:SessionUser,extractionId:string,input:{action:"CONFIRM"|"MODIFY"|"DELETE"|"UNKNOWN";value?:string|number|null}):ExtractionRow{
  const row=getDb().prepare(`SELECT ${fields} FROM extractions WHERE id=?`).get(extractionId) as unknown as ExtractionRow|undefined;if(!row)throw new AppError("EXTRACTION_NOT_FOUND","提取结果不存在",404);
  const item=getCaseForActor(actor,row.caseId);if(actor.role!=="ADMIN"&&item.ownerId!==actor.id)throw new AppError("FORBIDDEN","只有案件所有者可以确认提取结果",403);
  const state={CONFIRM:"CONFIRMED",MODIFY:"MODIFIED",DELETE:"DELETED",UNKNOWN:"UNKNOWN"}[input.action];let confirmed:string|null=null;
  if(input.action==="CONFIRM")confirmed=row.originalValueJson;if(input.action==="MODIFY"){if(input.value===undefined||input.value===null||String(input.value).length>2000)throw new AppError("INVALID_VALUE","请填写有效修正值",400);confirmed=JSON.stringify(input.value);}
  getDb().prepare("UPDATE extractions SET confirmed_value_json=?,state=?,confirmed_by=?,confirmed_at=? WHERE id=?").run(confirmed,state,actor.id,new Date().toISOString(),extractionId);
  audit(actor,"EXTRACTION_CONFIRMED","EXTRACTION",extractionId,"SUCCESS",{action:input.action});return getDb().prepare(`SELECT ${fields} FROM extractions WHERE id=?`).get(extractionId) as unknown as ExtractionRow;
}
