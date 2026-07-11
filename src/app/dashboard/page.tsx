import Link from "next/link";
import { AccessNotice } from "@/components/AccessNotice";
import { DemoCaseActions } from "@/components/DemoCaseActions";
import { demoModeEnabled } from "@/lib/demo";
import { caseStatusLabels } from "@/lib/labels";
import { requirePageRole } from "@/server/page-access";
import { listCasesForActor } from "@/server/cases";

export const dynamic="force-dynamic";
export default async function DashboardPage({searchParams}:{searchParams:Promise<{notice?:string}>}){
  const user=await requirePageRole(["USER"],"/dashboard");const query=await searchParams;const cases=listCasesForActor(user);const demoCase=cases.find(item=>Boolean(item.isDemo));
  return <div><AccessNotice code={query.notice}/><div className="page-head"><div><div className="eyebrow">普通用户 · 开发环境</div><h1 className="page-title">{user.displayName}的案件</h1><p className="lead">继续已有整理，或使用全套虚构资料体验八步流程。</p></div><Link className="button" href="/screening">新建空白案件</Link></div>{demoModeEnabled()&&<DemoCaseActions existingCaseId={demoCase?.id}/>}
    {cases.length===0?<div className="empty card"><h2>还没有可查看的案件</h2><p className="muted">可以新建空白案件，也可以从上方演示测试工具创建只包含虚构资料的完整案例。</p></div>:<div className="case-list">{cases.map(item=><Link className="card case-row" key={item.id} href={`/cases/${item.id}`}><div><span className="status neutral">{caseStatusLabels[item.status]??item.status}</span>{Boolean(item.isDemo)&&<span className="status demo">虚构演示案件</span>}<h3>{item.title}</h3><p className="muted">更新于 {new Date(item.updatedAt).toLocaleString("zh-CN")}</p></div><span>查看 →</span></Link>)}</div>}
  </div>;
}
