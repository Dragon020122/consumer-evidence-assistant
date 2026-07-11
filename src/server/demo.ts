import { readFile } from "node:fs/promises";
import { AppError } from "@/lib/errors";
import { getDb } from "@/lib/db";
import { assertDemoMode, DEMO_CASE_TITLE, demoAssetPath, demoAssets } from "@/lib/demo";
import type { SessionUser } from "@/server/auth";
import { createCase, getCaseForActor, listCasesForActor, type CaseRow } from "@/server/cases";
import { deleteCaseData } from "@/server/deletion";
import { deleteEvidence, listEvidence, storeEvidence, type EvidenceRow } from "@/server/storage";

function requireDemoUser(actor:SessionUser):void{assertDemoMode();if(actor.role!=="USER")throw new AppError("FORBIDDEN","演示案件仅供普通用户测试",403);}
const field=<T extends string|number>(value:T)=>({value,state:"USER_CONFIRMED" as const,evidenceSupport:"USER_STATEMENT" as const,savedAt:new Date().toISOString()});
export function demoCaseInput(){return{title:DEMO_CASE_TITLE,disputeType:"GYM"as const,screening:{eligible:true,reasons:["虚构健身预付服务演示案例"],suggestedMaterials:["付款记录","商家主体信息","至少一份沟通记录","合同与服务使用记录"],safetyNotice:null,boundary:"只整理材料，不提供法律结论。"},details:{merchantLegalName:field("星云健康管理有限公司（虚构）"),storeName:field("星云健身天府店（虚构）"),serviceName:field("健身年卡"),paymentAmountYuan:field(2999),paymentDate:field("2026-05-15"),orderOrContractNumber:field("DEMO-2026-001 / DEMO-CONTRACT-001"),usedAmountOrCount:field("已使用约1个半月"),remainingAmountOrCount:field("仍有剩余服务，具体待核对"),firstRefundRequestDate:field("2026-07-01"),merchantResponse:field("已办理年卡原则上不予退费"),desiredResolution:field("退还未消费部分费用")}};}

export function getMyDemoCase(actor:SessionUser):CaseRow|undefined{requireDemoUser(actor);return listCasesForActor(actor).find(item=>Boolean(item.isDemo));}
export function createOrRestoreDemoCase(actor:SessionUser):CaseRow{requireDemoUser(actor);const existing=getMyDemoCase(actor);if(existing)return existing;const item=createCase(actor,demoCaseInput());getDb().prepare("UPDATE cases SET is_demo=1 WHERE id=? AND owner_id=?").run(item.id,actor.id);return getCaseForActor(actor,item.id);}
export async function resetMyDemoCase(actor:SessionUser):Promise<CaseRow>{requireDemoUser(actor);const existing=getMyDemoCase(actor);if(existing)await deleteCaseData(actor,existing.id);return createOrRestoreDemoCase(actor);}
export async function loadDemoEvidence(actor:SessionUser,caseId:string,assetIds:string[]=demoAssets.map(x=>x.id)):Promise<EvidenceRow[]>{requireDemoUser(actor);const item=getCaseForActor(actor,caseId);if(!item.isDemo||item.ownerId!==actor.id)throw new AppError("NOT_DEMO_CASE","只能向自己的演示案件载入演示材料",403);const selected=demoAssets.filter(asset=>assetIds.includes(asset.id));if(!selected.length)throw new AppError("NO_DEMO_ASSET","请选择至少一份演示材料",400);const existing=new Set(listEvidence(actor,caseId).map(x=>x.originalName));for(const asset of selected){if(existing.has(asset.fileName))continue;const bytes=await readFile(demoAssetPath(asset.fileName));await storeEvidence(actor,caseId,new File([bytes],asset.fileName,{type:asset.mimeType}),asset.category);}return listEvidence(actor,caseId);}
export async function clearDemoEvidence(actor:SessionUser,caseId:string):Promise<void>{requireDemoUser(actor);const item=getCaseForActor(actor,caseId);if(!item.isDemo||item.ownerId!==actor.id)throw new AppError("NOT_DEMO_CASE","只能清空自己的演示案件材料",403);for(const file of listEvidence(actor,caseId))await deleteEvidence(actor,file.id);}
