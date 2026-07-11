import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createCaseSchema, type CreateCaseInput } from "@/lib/schemas";
import type { SessionUser } from "@/server/auth";
import { audit } from "@/server/audit";
import { normalizeDetails, normalizeField, type EvidenceSupportState, type FieldState } from "@/lib/field-state";

export interface CaseRow {
  id: string; ownerId: string; assignedReviewerId: string | null; title: string; disputeType: string; status: string;
  eligibilityJson: string; detailsJson: string; timelineConfirmedAt: string | null; isDemo:number; expiresAt: string; createdAt: string; updatedAt: string;
}

const selectFields = `id, owner_id AS ownerId, assigned_reviewer_id AS assignedReviewerId, title, dispute_type AS disputeType,
 status, eligibility_json AS eligibilityJson, details_json AS detailsJson, timeline_confirmed_at AS timelineConfirmedAt, is_demo AS isDemo,
 expires_at AS expiresAt, created_at AS createdAt, updated_at AS updatedAt`;

export function createCase(owner: SessionUser, raw: CreateCaseInput): CaseRow {
  if (owner.role !== "USER" && owner.role !== "ADMIN") throw new AppError("FORBIDDEN", "当前角色不能创建案件", 403);
  const input = createCaseSchema.parse(raw);
  const id = randomUUID(); const now = new Date();
  const expiresAt = new Date(now.getTime() + getEnv().RETENTION_DAYS * 86_400_000).toISOString();
  getDb().prepare(`INSERT INTO cases
    (id, owner_id, title, dispute_type, status, eligibility_json, details_json, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'PENDING_UPLOAD', ?, ?, ?, ?, ?)`
  ).run(id, owner.id, input.title, input.disputeType, JSON.stringify(input.screening), JSON.stringify(normalizeDetails(input.details)), expiresAt, now.toISOString(), now.toISOString());
  audit(owner, "CASE_CREATED", "CASE", id, "SUCCESS");
  return getCaseForActor(owner, id);
}

export function listCasesForActor(actor: SessionUser): CaseRow[] {
  const db = getDb();
  if (actor.role === "ADMIN") return db.prepare(`SELECT ${selectFields} FROM cases ORDER BY updated_at DESC`).all() as unknown as CaseRow[];
  if (actor.role === "REVIEWER") return db.prepare(`SELECT ${selectFields} FROM cases WHERE assigned_reviewer_id = ? ORDER BY updated_at DESC`).all(actor.id) as unknown as CaseRow[];
  return db.prepare(`SELECT ${selectFields} FROM cases WHERE owner_id = ? ORDER BY updated_at DESC`).all(actor.id) as unknown as CaseRow[];
}

export function getCaseForActor(actor: SessionUser, caseId: string): CaseRow {
  if (!/^[A-Za-z0-9-]{1,100}$/.test(caseId)) throw new AppError("CASE_NOT_FOUND", "案件不存在或无权访问", 404);
  const row = getDb().prepare(`SELECT ${selectFields} FROM cases WHERE id = ?`).get(caseId) as unknown as CaseRow | undefined;
  const allowed = row && (actor.role === "ADMIN" || row.ownerId === actor.id || (actor.role === "REVIEWER" && row.assignedReviewerId === actor.id));
  if (!allowed) {
    audit(actor, "CASE_READ", "CASE", caseId, "DENIED");
    throw new AppError("CASE_NOT_FOUND", "案件不存在或无权访问", 404);
  }
  if (actor.role === "ADMIN" || actor.role === "REVIEWER") audit(actor, "CASE_READ", "CASE", caseId, "SUCCESS");
  return row;
}

export const caseStatuses = ["DRAFT","PENDING_UPLOAD","PENDING_EXTRACTION","EXTRACTING","PENDING_USER_CONFIRMATION","PENDING_TIMELINE_CONFIRMATION","PENDING_GENERATION","PENDING_MANUAL_REVIEW","WAITING_MORE_MATERIALS","COMPLETED","CLOSED","PENDING_DELETION","DELETED"] as const;

export function updateCaseField(actor:SessionUser,caseId:string,fieldName:string,input:{value:unknown;state:FieldState}):CaseRow{
  const item=getCaseForActor(actor,caseId);if(actor.role!=="ADMIN"&&item.ownerId!==actor.id)throw new AppError("FORBIDDEN","只有案件所有者可以修改基础信息",403);
  const parsed=createCaseSchema.shape.details.keyof().parse(fieldName);const details=normalizeDetails(JSON.parse(item.detailsJson));
  const current=normalizeField(details[parsed]);const value=input.value===undefined||input.value===""?null:input.value;const state=value===null?"EMPTY":input.state;
  details[parsed]={...current,value,state,evidenceSupport:value===null?"NONE":current.evidenceSupport,savedAt:new Date().toISOString()};
  const validated=createCaseSchema.shape.details.parse(details);getDb().prepare("UPDATE cases SET details_json=?,updated_at=? WHERE id=?").run(JSON.stringify(validated),new Date().toISOString(),caseId);
  audit(actor,"CASE_FIELD_UPDATED","CASE",caseId,"SUCCESS",{fieldName:parsed,state});return getCaseForActor(actor,caseId);
}

const supportCategories:Record<string,string[]>={merchantLegalName:["MERCHANT_STATUS","PAYMENT_ORDER"],storeName:["MERCHANT_STATUS","REFUND_COMMUNICATION"],serviceName:["CONTRACT","PROMISE"],paymentAmountYuan:["PAYMENT_ORDER"],paymentDate:["PAYMENT_ORDER"],orderOrContractNumber:["PAYMENT_ORDER","CONTRACT"],usedAmountOrCount:["SERVICE_USAGE"],remainingAmountOrCount:["SERVICE_USAGE"],firstRefundRequestDate:["REFUND_COMMUNICATION"],merchantResponse:["REFUND_COMMUNICATION"],desiredResolution:[]};
export function refreshCaseEvidenceSupport(caseId:string):void{const db=getDb();const row=db.prepare("SELECT details_json AS detailsJson FROM cases WHERE id=?").get(caseId)as{detailsJson:string}|undefined;if(!row)return;const categories=new Set((db.prepare("SELECT category FROM evidence WHERE case_id=?").all(caseId)as{category:string}[]).map(x=>x.category));const details=normalizeDetails(JSON.parse(row.detailsJson));for(const[key,field]of Object.entries(details)){const expected=supportCategories[key]??[];let support:EvidenceSupportState=field.value===null?"NONE":field.evidenceSupport;const matches=expected.filter(x=>categories.has(x));if(matches.length)support=matches[0]===expected[0]?"DIRECT":"PARTIAL";else if(field.value!==null)support="USER_STATEMENT";details[key]={...field,evidenceSupport:support};}db.prepare("UPDATE cases SET details_json=? WHERE id=?").run(JSON.stringify(details),caseId);}
