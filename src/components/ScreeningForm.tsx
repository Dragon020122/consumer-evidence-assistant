"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScreeningResult } from "@/lib/schemas";

export function ScreeningForm() {
  const [result, setResult] = useState<ScreeningResult | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget);
    const payload = { disputeType: form.get("disputeType"), amountYuan: form.get("amountYuan") ? Number(form.get("amountYuan")) : null,
      isConsumerService: form.get("isConsumerService") === "true", merchantOperating: form.get("merchantOperating"),
      hasPaymentRecord: form.get("hasPaymentRecord") === "true", hasContractOrChat: form.get("hasContractOrChat") === "true",
      desiredOutcome: form.get("desiredOutcome"), hasNegotiated: form.get("hasNegotiated") === "true", excludedArea: form.get("excludedArea") };
    const response = await fetch("/api/screening", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error?.message ?? "预筛失败，请重试"); setResult(data); if (data.eligible) sessionStorage.setItem("screening", JSON.stringify({ input: payload, result: data }));
  }
  if (result) return <div className="card result-card"><span className={`status ${result.eligible ? "success" : "neutral"}`}>{result.eligible ? "适合使用本工具" : "暂不适合"}</span>
    <h2>{result.reasons.join("；")}</h2>{result.safetyNotice && <p className="notice">{result.safetyNotice}</p>}
    {result.eligible && <><h3>建议准备</h3><ul>{result.suggestedMaterials.map(x=><li key={x}>{x}</li>)}</ul><button className="button" onClick={()=>router.push("/cases/new")}>登录并创建案件</button></>}
    <p className="muted">{result.boundary}</p><button className="button ghost" onClick={()=>setResult(null)}>重新填写</button></div>;
  return <form className="form card" onSubmit={submit}>
    <div className="form-grid"><label>纠纷类型<select name="disputeType" required><option value="GYM">健身预付服务</option><option value="BEAUTY">美容美发</option><option value="TRAINING">培训课程</option><option value="PHOTOGRAPHY">摄影服务</option><option value="PET">宠物服务</option><option value="HOUSEKEEPING">家政服务</option><option value="OTHER">其他一般预付服务</option></select></label>
    <label>涉及金额（元，可不填）<input name="amountYuan" type="number" min="0" step="0.01" /></label></div>
    <fieldset><legend>是否属于消费服务？</legend><label className="choice"><input type="radio" name="isConsumerService" value="true" required />是</label><label className="choice"><input type="radio" name="isConsumerService" value="false" />否</label></fieldset>
    <label>商家是否仍在经营？<select name="merchantOperating"><option value="YES">是</option><option value="NO">否</option><option value="UNKNOWN">无法确认</option></select></label>
    <div className="form-grid"><label>有付款记录？<select name="hasPaymentRecord"><option value="true">有</option><option value="false">没有</option></select></label><label>有合同或聊天记录？<select name="hasContractOrChat"><option value="true">有</option><option value="false">没有</option></select></label></div>
    <label>希望达到的结果<textarea name="desiredOutcome" required maxLength={500} placeholder="例如：整理现有材料，继续与商家协商退费" /></label>
    <label>是否已经协商或投诉？<select name="hasNegotiated"><option value="false">尚未</option><option value="true">已经进行过</option></select></label>
    <label>是否涉及以下特殊事项？<select name="excludedArea"><option value="NONE">均不涉及</option><option value="MEDICAL">医疗纠纷</option><option value="FINANCE">金融、投资或借贷</option><option value="LABOR">劳动争议</option><option value="CRIMINAL">刑事事项</option><option value="SERIOUS_INJURY">严重人身伤害</option><option value="OTHER_EXCLUDED">婚姻家庭或房屋买卖等其他排除范围</option></select></label>
    {error && <p className="form-error">{error}</p>}<button className="button" disabled={loading}>{loading ? "正在评估…" : "查看预筛结果"}</button>
  </form>;
}

