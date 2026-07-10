"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseRow } from "@/server/cases";
import type { UserOption } from "@/server/backoffice";
import type { OrderRow } from "@/server/plans";

export function AdminPanel({ cases, reviewers, orders }: { cases: CaseRow[]; reviewers: UserOption[]; orders: OrderRow[] }) {
  const [message, setMessage] = useState(""); const router = useRouter();
  async function assign(caseId: string, reviewerId: string) {
    if (!reviewerId) return;
    const response = await fetch(`/api/admin/cases/${caseId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewerId }) });
    const data = await response.json(); setMessage(response.ok ? "复核员已分配并写入审计日志。" : data.error?.message ?? "分配失败"); if (response.ok) router.refresh();
  }
  async function activate(orderId: string) {
    const response = await fetch(`/api/admin/orders/${orderId}/activate`, { method: "POST" });
    const data = await response.json(); setMessage(response.ok ? "测试套餐已由管理员开通，没有发生收款。" : data.error?.message ?? "开通失败"); if (response.ok) router.refresh();
  }
  return <div>{message && <p className="notice">{message}</p>}
    <div className="admin-table">{cases.map(item => <article className="card" key={item.id}><div><span className="status neutral">{item.status}</span><h3>{item.title}</h3><p className="muted">案件 {item.id}</p></div><label>分配复核员<select defaultValue={item.assignedReviewerId ?? ""} onChange={event => assign(item.id, event.target.value)}><option value="">未分配</option>{reviewers.map(user => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></label></article>)}</div>
    <h2>测试套餐订单</h2><div className="admin-table">{orders.length === 0 ? <p className="muted">暂无测试订单。</p> : orders.map(order => <article className="card" key={order.id}><div><span className="status neutral">{order.status}</span><h3>{order.planName}</h3><p className="muted">案件 {order.caseId} · 不涉及支付</p></div>{order.status === "PENDING_TEST_ACTIVATION" && <button className="button secondary" onClick={() => activate(order.id)}>管理员测试开通</button>}</article>)}</div>
  </div>;
}

