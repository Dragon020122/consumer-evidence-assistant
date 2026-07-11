import Link from "next/link";
import { caseStatusLabels } from "@/lib/labels";
import { requirePageRole } from "@/server/page-access";
import { listCasesForActor } from "@/server/cases";
import { AccessNotice } from "@/components/AccessNotice";

export const dynamic="force-dynamic";
export default async function DashboardPage({searchParams}:{searchParams:Promise<{notice?:string}>}){const user=await requirePageRole(["USER"],"/dashboard");const query=await searchParams;const cases=listCasesForActor(user);return <div><AccessNotice code={query.notice}/><div className="page-head"><div><div className="eyebrow">普通用户 · 开发环境</div><h1 className="page-title">{user.displayName}的案件</h1></div><Link className="button" href="/screening">开始整理</Link></div>
  {cases.length===0?<div className="empty card"><h2>还没有可查看的案件</h2><p className="muted">从适用性预筛开始，创建一个只包含虚构或脱敏材料的测试案件。</p></div>:<div className="case-list">{cases.map(item=><Link className="card case-row" key={item.id} href={`/cases/${item.id}`}><div><span className="status neutral">{caseStatusLabels[item.status]??item.status}</span><h3>{item.title}</h3><p className="muted">更新于 {new Date(item.updatedAt).toLocaleString("zh-CN")}</p></div><span>查看 →</span></Link>)}</div>}</div>}
