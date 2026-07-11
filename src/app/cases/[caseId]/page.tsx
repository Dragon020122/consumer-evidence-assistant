import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseDetailsEditor } from "@/components/CaseDetailsEditor";
import { DemoEvidenceTools } from "@/components/DemoEvidenceTools";
import { EvidenceList } from "@/components/EvidenceList";
import { EvidenceUploader } from "@/components/EvidenceUploader";
import { demoModeEnabled } from "@/lib/demo";
import { normalizeDetails } from "@/lib/field-state";
import { caseStatusLabels } from "@/lib/labels";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listEvidence } from "@/server/storage";

export const dynamic="force-dynamic";
export default async function CasePage({params}:{params:Promise<{caseId:string}>}){
  const{caseId}=await params;const user=await requirePageRole(["USER","REVIEWER","ADMIN"],`/cases/${caseId}`);let item;try{item=getCaseForActor(user,caseId)}catch{notFound()}const evidence=listEvidence(user,caseId);const details=normalizeDetails(JSON.parse(item.detailsJson));const categories=new Set(evidence.map(file=>file.category));const checks=[{label:"付款记录",done:categories.has("PAYMENT_ORDER"),why:"核对金额、日期和收款方",optional:false},{label:"商家名称或主体信息",done:categories.has("MERCHANT_STATUS")||categories.has("CONTRACT"),why:"区分门店、收款方和经营主体",optional:false},{label:"至少一份退费沟通",done:categories.has("REFUND_COMMUNICATION"),why:"核对诉求与商家回复",optional:false},{label:"合同或服务约定",done:categories.has("CONTRACT"),why:"补充服务期限和一般约定",optional:true},{label:"服务使用记录",done:categories.has("SERVICE_USAGE"),why:"说明已使用和剩余服务",optional:true},{label:"销售宣传或沟通",done:categories.has("PROMISE"),why:"保留购买前服务介绍",optional:true}];const minimum=checks.filter(x=>!x.optional);const completed=minimum.filter(x=>x.done).length;const canEdit=item.ownerId===user.id||user.role==="ADMIN";
  return <div><div className="page-head"><div><div className="eyebrow">上传证据 · {caseStatusLabels[item.status]??item.status}</div><h1 className="page-title">{item.title}</h1><p className="muted">案件编号 {item.id}{Boolean(item.isDemo)?" · 全部内容均为虚构测试数据":""}</p></div><div className="compact-actions"><Link className="button secondary" href={`/cases/${caseId}/plans`}>测试套餐</Link>{canEdit&&<Link className="button secondary" href={`/cases/${caseId}/delete`}>数据删除</Link>}<Link className="button secondary" href={user.role==="USER"?"/dashboard":user.role==="REVIEWER"?"/review":"/admin"}>返回工作台</Link></div></div>
    {completed<minimum.length&&<div className="notice warning"><strong>当前材料不完整，后续结果仅为初步整理版本。</strong><p>最低建议材料完成 {completed}/{minimum.length} 项，仍可进入提取、时间线和缺口页面；缺少的内容会降低事实核对和证据支持的完整性。</p></div>}
    <section className="card checklist"><div className="section-head"><div><h2>本步骤检查清单</h2><p>最低建议材料完成 {completed}/{minimum.length} 项；可选材料可稍后补充。</p></div><span className="status neutral">{completed===minimum.length?"可以继续":"可以带缺口继续"}</span></div><div className="check-grid">{checks.map(check=><div key={check.label} className={check.done?"done":"missing"}><span>{check.done?"✓":"○"}</span><div><strong>{check.label}{check.optional?"（可选）":""}</strong><small>{check.why}{!check.done&&!check.optional?"；可暂时跳过，将在缺口清单中提示。":""}</small></div></div>)}</div></section>
    <div className="workspace-grid"><section className="card"><CaseDetailsEditor caseId={caseId} initial={details} readOnly={!canEdit}/></section><section className="card"><div className="section-head"><div><h2>证据材料</h2><p>上传后先显示成功状态，再由 Mock 提取；图片/PDF 需要人工核对。</p></div><span className="status neutral">{evidence.length} 份</span></div>{canEdit?<><EvidenceUploader caseId={caseId}/>{demoModeEnabled()&&Boolean(item.isDemo)&&user.role==="USER"&&<DemoEvidenceTools caseId={caseId}/>}</>:<p className="notice">复核员只能查看已分配案件，不能上传或修改原始证据。</p>}<EvidenceList initial={evidence} readOnly={!canEdit}/><div className="actions"><Link className="button secondary" href="/dashboard">保存并稍后继续</Link><Link className="button" href={`/cases/${caseId}/extractions`}>下一步：提取与确认</Link></div></section></div>
  </div>;
}
