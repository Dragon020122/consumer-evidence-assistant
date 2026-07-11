import { AdminPanel } from "@/components/AdminPanel";
import { AccessNotice } from "@/components/AccessNotice";
import { getSystemSummary, listAuditLogs, listReviewers } from "@/server/backoffice";
import { listCasesForActor } from "@/server/cases";
import { listAllOrders } from "@/server/plans";
import { requirePageRole } from "@/server/page-access";

export const dynamic = "force-dynamic";
export default async function AdminPage({searchParams}:{searchParams:Promise<{notice?:string}>}) {
  const actor = await requirePageRole(["ADMIN"],"/admin"); const query=await searchParams;
  const summary = getSystemSummary(actor); const logs = listAuditLogs(actor, 50) as Array<{ id:string;actorRole:string|null;action:string;resourceType:string;outcome:string;createdAt:string }>;
  return <div><AccessNotice code={query.notice}/><div className="eyebrow">管理员后台 · 脱敏测试环境</div><h1 className="page-title">案例、分配与审计</h1>
    <div className="metric-grid">{Object.entries(summary).map(([key, value]) => <div className="card" key={key}><span className="muted">{key}</span><strong>{value}</strong></div>)}</div>
    <h2>案件分配</h2><AdminPanel cases={listCasesForActor(actor)} reviewers={listReviewers(actor)} orders={listAllOrders(actor)} />
    <h2>最近审计</h2><div className="audit-list">{logs.map(log => <div key={log.id}><code>{log.createdAt}</code><strong>{log.action}</strong><span>{log.actorRole ?? "ANON"} · {log.resourceType} · {log.outcome}</span></div>)}</div>
  </div>;
}
