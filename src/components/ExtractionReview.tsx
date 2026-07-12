"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractionFieldLabels, fieldStateLabels } from "@/lib/labels";
import type { ExtractedFieldDTO as ExtractionRow } from "@/lib/dto";

function valueOf(raw: string | null) { if (raw === null) return null; try { return JSON.parse(raw) as string | number; } catch { return null; } }
const confirmedStates = new Set(["CONFIRMED", "AI_CONFIRMED"]);
const modifiedStates = new Set(["MODIFIED", "USER_EDITED"]);
const unableStates = new Set(["UNABLE_TO_CONFIRM", "DELETED"]);
const pendingStates = new Set(["PENDING", "AI_PENDING", "MANUAL_REQUIRED"]);

export function ExtractionReview({ caseId, initial, readOnly = false, demoTools = false }: { caseId: string; initial: ExtractionRow[]; readOnly?: boolean; demoTools?: boolean }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const counts = {
    confirmed: items.filter((item) => confirmedStates.has(item.state)).length,
    modified: items.filter((item) => modifiedStates.has(item.state)).length,
    unable: items.filter((item) => unableStates.has(item.state)).length,
    conflict: items.filter((item) => item.state === "CONFLICT").length,
    pending: items.filter((item) => pendingStates.has(item.state)).length
  };
  const processed = counts.confirmed + counts.modified + counts.unable;
  const canGenerateTimeline = counts.confirmed + counts.modified > 0;

  async function request(url: string, options: RequestInit, success: (data: { extractions?: ExtractionRow[] }) => void) {
    setBusy(true);
    try {
      const response = await fetch(url, options);
      const data = await response.json() as { extractions?: ExtractionRow[]; error?: { message?: string } };
      if (!response.ok) return setMessage(data.error?.message ?? "操作失败，请稍后重试。");
      success(data);
    } catch { setMessage("无法连接本地服务，请确认开发服务正在运行后重试。"); }
    finally { setBusy(false); }
  }

  async function extract() {
    setMessage("正在逐份处理材料：TXT 执行结构化提取，图片和 PDF 标记为待人工核对。");
    await request(`/api/cases/${caseId}/extract`, { method: "POST" }, (data) => {
      setItems(data.extractions ?? []);
      setMessage("提取完成。请逐项核对来源、定位和数值；未经确认的内容不会进入时间线。");
    });
  }

  async function demoAction(action: "regenerate" | "confirm-all") {
    setMessage(action === "regenerate" ? "正在重新生成演示提取结果；后续时间线、矩阵和旧草稿会同步失效。" : "正在按普通确认规则处理演示提取结果。");
    await request(`/api/demo/cases/${caseId}/extractions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }, (data) => {
      setItems(data.extractions ?? []);
      setMessage(action === "regenerate" ? "已重新生成演示提取结果。" : "已处理全部演示提取结果；请继续生成事件时间线。");
      router.refresh();
    });
  }

  async function act(item: ExtractionRow, action: "CONFIRM" | "MODIFY" | "DELETE" | "UNKNOWN") {
    let value: string | undefined;
    if (action === "MODIFY") { value = prompt("请输入经你核对后的值；只能填写原始材料中存在或你能确认的内容。", String(valueOf(item.originalValueJson) ?? "")) ?? undefined; if (value === undefined) return; }
    setMessage("正在保存确认状态…");
    await request(`/api/extractions/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, value }) }, (data) => {
      const row = data.extractions?.[0] as ExtractionRow | undefined;
      if (row) setItems((current) => current.map((entry) => entry.id === item.id ? row : entry));
      setMessage(`已保存 · ${new Date().toLocaleTimeString("zh-CN")}`);
      router.refresh();
    });
  }

  async function next() {
    setBusy(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/timeline`, { method: "POST" });
      const data = await response.json() as { error?: { message?: string } };
      if (!response.ok) return setMessage(data.error?.message ?? "时间线生成失败，请返回确认材料后重试。");
      router.push(`/cases/${caseId}/timeline`);
      router.refresh();
    } catch { setMessage("无法连接本地服务，请确认开发服务正在运行后重试。"); }
    finally { setBusy(false); }
  }

  return <div>
    <section className="card checklist" aria-label="提取结果状态汇总"><h2>提取结果状态</h2><div className="check-grid">
      <div><span>总计</span><strong>{items.length} 项</strong></div><div><span>已确认</span><strong>{counts.confirmed} 项</strong></div>
      <div><span>待确认</span><strong>{counts.pending} 项</strong></div><div><span>用户修改</span><strong>{counts.modified} 项</strong></div>
      <div><span>无法确认</span><strong>{counts.unable} 项</strong></div><div><span>存在冲突</span><strong>{counts.conflict} 项</strong></div>
    </div></section>
    {readOnly ? <p className="notice">人工复核员只能查看来源和置信度，不能代替用户确认、修改或重新提取。</p> : <div className="actions">
      <button className="button secondary" onClick={extract} disabled={busy}>{items.length ? "重新提取待确认项目" : "开始 Mock 提取"}</button>
      {demoTools && <><button className="button secondary" onClick={() => demoAction("regenerate")} disabled={busy}>重新生成演示提取结果</button><button className="button secondary" onClick={() => demoAction("confirm-all")} disabled={busy || items.length === 0}>一键确认全部演示提取结果</button></>}
      <button className="button" onClick={next} disabled={busy || !canGenerateTimeline}>生成事件时间线</button>
    </div>}
    {!readOnly && <p className="notice">{canGenerateTimeline ? "已有可用于时间线的已确认信息。生成后仍需确认至少一条事件，才会解锁证据矩阵。" : `目前已处理 ${processed}/${items.length} 项；请至少确认一项带明确值的材料提取结果后生成时间线。`}</p>}
    {message && <p className="notice" aria-live="polite">{message}</p>}
    {!items.length ? <div className="empty card"><h3>尚无提取结果</h3><p>请先上传材料并启动 Mock 提取。系统不会为图片或 PDF 猜测内容，无法识别时会保留为待人工确认。</p></div> : <div className="review-list">{items.map((item) => <article className="card review-row" key={item.id}><div>
      <span className="status neutral">{extractionFieldLabels[item.fieldName] ?? item.fieldName} · {fieldStateLabels[item.state] ?? item.state}</span>
      <h3>{String(valueOf(item.confirmedValueJson) ?? valueOf(item.originalValueJson) ?? "无法识别")}</h3>
      <p className="muted">来源定位：{item.sourceLocator} · 置信度 {Math.round(item.confidence * 100)}% · 证据支持：{item.evidenceId ? "材料提取" : "用户陈述"}</p>
      <a className="text-link" href={`/api/evidence/${item.evidenceId}`} target="_blank">查看原始证据 →</a>
    </div>{!readOnly && <div className="compact-actions"><button onClick={() => act(item, "CONFIRM")}>确认材料提取</button><button onClick={() => act(item, "MODIFY")}>修改并确认</button><button onClick={() => act(item, "UNKNOWN")}>无法确认</button><button onClick={() => act(item, "DELETE")}>删除错误提取</button></div>}</article>)}</div>}
  </div>;
}
