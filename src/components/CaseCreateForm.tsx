"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ScreeningInput, ScreeningResult } from "@/lib/schemas";

const fields = [
  ["merchantLegalName", "商家主体名称", "text"], ["storeName", "门店名称", "text"], ["serviceName", "商品或服务名称", "text"],
  ["paymentAmountYuan", "支付金额（元）", "number"], ["paymentDate", "支付日期", "date"], ["orderOrContractNumber", "订单号或合同号", "text"],
  ["usedAmountOrCount", "已使用次数或金额", "text"], ["remainingAmountOrCount", "剩余次数或金额", "text"],
  ["firstRefundRequestDate", "首次提出退费日期", "date"], ["merchantResponse", "商家回复", "text"], ["desiredResolution", "用户具体诉求", "text"]
] as const;
export function CaseCreateForm() {
  const storedScreening = useSyncExternalStore(
    () => () => undefined,
    () => sessionStorage.getItem("screening"),
    () => null
  );
  const screening = useMemo(() => storedScreening ? JSON.parse(storedScreening) as {
    input: ScreeningInput; result: ScreeningResult
  } : null, [storedScreening]);
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(!screening?.result?.eligible)return setError("请先完成适用性预筛");setLoading(true);setError("");const form=new FormData(event.currentTarget);const details=Object.fromEntries(fields.map(([key,,type])=>{const raw=form.get(key);const state=form.get(`${key}State`);return [key,{value:raw ? (type==="number"?Number(raw):String(raw)):null,state}];}));
    const response=await fetch("/api/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:form.get("title"),disputeType:screening.input.disputeType,screening:screening.result,details})});const data=await response.json();setLoading(false);if(response.status===401)return router.push("/login?next=/cases/new");if(!response.ok)return setError(data.error?.message??"创建失败");sessionStorage.removeItem("screening");router.push(`/cases/${data.case.id}`);router.refresh();}
  if(!screening)return <div className="empty"><h2>需要先完成适用性预筛</h2><button className="button" onClick={()=>router.push("/screening")}>前往预筛</button></div>;
  return <form className="form card" onSubmit={submit}><label>案件名称<input name="title" required minLength={2} maxLength={100} placeholder="例如：健身年卡退费材料整理" /></label>
    {fields.map(([key,label,type])=><div className="field-with-state" key={key}><label>{label}<input name={key} type={type} step={type==="number"?"0.01":undefined}/></label><label className="state-label">确认状态<select name={`${key}State`} defaultValue="PENDING"><option value="CONFIRMED">已确认</option><option value="PENDING">待确认</option><option value="UNKNOWN">无法确认</option></select></label></div>)}
    {error&&<p className="form-error">{error}</p>}<button className="button" disabled={loading}>{loading?"正在安全保存…":"创建案件"}</button></form>;
}
