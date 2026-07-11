import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtractionReview } from "@/components/ExtractionReview";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listExtractions } from "@/server/extraction";

export const dynamic="force-dynamic";
export default async function ExtractionsPage({params}:{params:Promise<{caseId:string}>}){const{caseId}=await params;const user=await requirePageRole(["USER","REVIEWER","ADMIN"],`/cases/${caseId}/extractions`);try{getCaseForActor(user,caseId)}catch{notFound()}return <div><div className="eyebrow">步骤 4 / 8</div><h1 className="page-title">逐项核对提取结果</h1><p className="lead">AI/Mock 提取默认是“待确认·材料提取”。确认、修改、无法确认和来源都保留审计；图片与 PDF 在 Mock 模式不会猜测内容。</p><p className="notice">材料不齐也可以继续：至少上传一份文件即可开始提取。没有可确认结果时，可以进入下一步手动补充“用户陈述”时间线。</p><ExtractionReview caseId={caseId} initial={listExtractions(user,caseId)} readOnly={user.role==="REVIEWER"}/>{user.role!=="REVIEWER"&&<div className="actions"><Link className="button secondary" href={`/cases/${caseId}`}>返回补充材料</Link><Link className="button" href={`/cases/${caseId}/timeline`}>跳过未识别项，进入时间线</Link></div>}</div>}
