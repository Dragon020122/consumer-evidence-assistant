import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { getSessionUser } from "@/server/auth";
import { getSystemSummary, listAuditLogs, listReviewers } from "@/server/backoffice";
import { listCasesForActor } from "@/server/cases";
import { listAllOrders } from "@/server/plans";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const actor = await getSessionUser(); if (!actor || actor.role !== "ADMIN") redirect("/login");
  const summary = getSystemSummary(actor); const logs = listAuditLogs(actor, 50) as Array<{ id:string;actorRole:string|null;action:string;resourceType:string;outcome:string;createdAt:string }>;
  return <div><div className="eyebrow">管理员后台 · 脱敏测试环境</div><h1 className="page-title">案例、分配与审计</h1>
    <div className="metric-grid">{Object.entries(summary).map(([key, value]) => <div className="card" key={key}><span className="muted">{key}</span><strong>{value}</strong></div>)}</div>
    <h2>案件分配</h2><AdminPanel cases={listCasesForActor(actor)} reviewers={listReviewers(actor)} orders={listAllOrders(actor)} />
    <h2>最近审计</h2><div className="audit-list">{logs.map(log => <div key={log.id}><code>{log.createdAt}</code><strong>{log.action}</strong><span>{log.actorRole ?? "ANON"} · {log.resourceType} · {log.outcome}</span></div>)}</div>
  </div>;
}

