import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { getCaseForActor } from "@/server/cases";
import { listEvidence } from "@/server/storage";
import { EvidenceUploader } from "@/components/EvidenceUploader";
import { caseStatusLabels, evidenceCategoryLabels, fieldStateLabels } from "@/lib/labels";

const fieldLabels: Record<string,string> = { merchantLegalName:"商家主体名称",storeName:"门店名称",serviceName:"商品或服务",paymentAmountYuan:"支付金额（元）",paymentDate:"支付日期",orderOrContractNumber:"订单号或合同号",usedAmountOrCount:"已使用次数或金额",remainingAmountOrCount:"剩余次数或金额",firstRefundRequestDate:"首次提出退费日期",merchantResponse:"商家回复",desiredResolution:"用户具体诉求" };
export const dynamic="force-dynamic";

export default async function CasePage({ params }: { params:Promise<{caseId:string}> }) {
  const user=await getSessionUser(); if(!user) redirect("/login"); const {caseId}=await params;
  let item; try { item=getCaseForActor(user,caseId); } catch { notFound(); }
  const evidence=listEvidence(user,caseId); const details=JSON.parse(item.detailsJson) as Record<string,{value:unknown;state:string}>;
  return <div><div className="page-head"><div><div className="eyebrow">步骤 3 / 9 · {caseStatusLabels[item.status]??item.status}</div><h1 className="page-title">{item.title}</h1><p className="muted">案件编号 {item.id}</p></div><div className="compact-actions"><Link className="button secondary" href={`/cases/${caseId}/plans`}>测试套餐</Link>{(item.ownerId===user.id||user.role==="ADMIN")&&<Link className="button secondary" href={`/cases/${caseId}/delete`}>数据删除</Link>}<Link className="button secondary" href="/dashboard">返回工作台</Link></div></div>
    <div className="workspace-grid"><section className="card"><h2>基础信息</h2><div className="detail-list">{Object.entries(details).map(([key,field])=><div key={key}><span className="muted">{fieldLabels[key]??key}</span><strong>{String(field.value??"未填写")}</strong><span className="status neutral">{fieldStateLabels[field.state]??field.state}</span></div>)}</div></section>
      <section className="card"><h2>证据材料</h2>{item.ownerId===user.id||user.role==="ADMIN"?<EvidenceUploader caseId={caseId}/>:<p className="notice">复核员只能查看已分配案件，不能上传或修改原始证据。</p>}
        {evidence.length===0?<div className="empty"><p>尚未上传材料。支持 JPG、PNG、WebP、PDF、TXT，单文件默认不超过 10MB。</p></div>:<><div className="file-list">{evidence.map(file=><a key={file.id} href={`/api/evidence/${file.id}`} target="_blank" rel="noreferrer"><strong>{file.originalName}</strong><span>{evidenceCategoryLabels[file.category]??file.category} · {(file.byteSize/1024).toFixed(1)} KB</span></a>)}</div><div className="actions"><Link className="button" href={`/cases/${caseId}/extractions`}>继续：提取与确认</Link></div></>}
      </section></div>
  </div>;
}
