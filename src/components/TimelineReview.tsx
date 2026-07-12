"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TimelineEventDTO as TimelineRow } from "@/lib/dto";

export function TimelineReview({ caseId, initial, readOnly = false }: { caseId: string; initial: TimelineRow[]; readOnly?: boolean }) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function request(url: string, options: RequestInit, apply: (data: { event?: TimelineRow; timeline?: TimelineRow[] }) => void) {
    try { const response = await fetch(url, options); const data = await response.json() as { event?: TimelineRow; timeline?: TimelineRow[]; error?: { message?: string } }; if (!response.ok) return setMessage(data.error?.message ?? "操作失败，请重试。"); apply(data); router.refresh(); } catch { setMessage("无法连接本地服务，请稍后重试。"); }
  }
  async function remove(id: string) { if (!confirm("删除这条时间线事件？原始证据不会被删除。")) return; await request(`/api/timeline/${id}`, { method: "DELETE" }, () => setItems((current) => current.filter((item) => item.id !== id))); }
  async function save(item: TimelineRow, description: string) { await request(`/api/timeline/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventDate: item.eventDate, dateEnd: item.dateEnd, description, eventType: item.eventType, amountYuan: item.amountCents === null ? null : item.amountCents / 100, sourceType: item.sourceType, evidenceIds: item.evidenceIds, isUserStatement: Boolean(item.isUserStatement) }) }, (data) => data.event && setItems((current) => current.map((entry) => entry.id === item.id ? data.event! : entry))); }
  async function edit(item: TimelineRow) { const description = prompt("修改事件描述。不得写入材料中不存在的日期、金额或承诺。", item.description); if (description && description !== item.description) await save(item, description); }
  async function add() { const description = prompt("补充一条用户陈述（请只填写你能确认的事实）"); if (!description) return; const eventDate = prompt("事件日期 YYYY-MM-DD；无法确认请留空") || null; await request(`/api/cases/${caseId}/timeline/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventDate, dateEnd: null, description, eventType: "OTHER", amountYuan: null, sourceType: "USER_STATEMENT", evidenceIds: [], isUserStatement: true }) }, (data) => data.event && setItems((current) => [...current, data.event!])); }
  async function move(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; await request(`/api/cases/${caseId}/timeline/reorder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventIds: next.map((item) => item.id) }) }, (data) => data.timeline && setItems(data.timeline)); }
  async function confirm(id: string) { await request(`/api/timeline/${id}/confirm`, { method: "POST" }, (data) => data.event && setItems((current) => current.map((item) => item.id === id ? data.event! : item))); }
  async function confirmAll() { await request(`/api/cases/${caseId}/timeline/confirm`, { method: "POST" }, () => { setItems((current) => current.map((item) => ({ ...item, isConfirmed: true }))); router.push(`/cases/${caseId}/matrix`); }); }

  return <div>
    {readOnly && <p className="notice">人工复核员仅查看时间线及关联证据，不能代替用户修改或确认内容。</p>}{message && <p className="notice">{message}</p>}
    {!readOnly && <div className="actions"><button className="button secondary" onClick={add}>补充用户陈述事件</button><span className="muted">仅用于补充现有证据中没有记录的事件，不替代材料提取确认。</span></div>}
    <div className="timeline">{items.map((item, index) => <article className="timeline-item" key={item.id}><div className="timeline-dot">{index + 1}</div><div className="card"><span className="status neutral">{item.isConfirmed ? "已确认" : "待确认"} · {item.isUserStatement ? "用户陈述" : "证据支持"} · {item.eventType}</span><h3>{item.description}</h3><p>{item.eventDate ?? "日期无法确认"}{item.amountCents !== null ? ` · ¥${(item.amountCents / 100).toFixed(2)}` : ""}</p><p className="muted">关联证据 {item.evidenceIds.length} 份</p>{item.evidenceIds.map((id) => <a className="text-link" key={id} href={`/api/evidence/${id}`} target="_blank">查看证据 →</a>)}{!readOnly && <div className="compact-actions">{!item.isConfirmed && <button onClick={() => confirm(item.id)}>确认这条事件</button>}<button onClick={() => edit(item)}>修改描述</button><button onClick={() => move(index, -1)} disabled={index === 0}>上移</button><button onClick={() => move(index, 1)} disabled={index === items.length - 1}>下移</button><button onClick={() => remove(item.id)}>删除事件</button></div>}</div></article>)}</div>
    {!readOnly && items.length > 0 && <div className="actions"><button className="button" onClick={confirmAll}>确认全部已核对事件</button></div>}
  </div>;
}
