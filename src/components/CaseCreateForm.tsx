"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { evidenceSupportLabels, fieldStateLabels } from "@/lib/labels";
import type { FieldState } from "@/lib/field-state";
import type { ScreeningInput, ScreeningResult } from "@/lib/schemas";

export const caseFields = [
  ["merchantLegalName", "商家主体名称", "text"], ["storeName", "门店名称", "text"], ["serviceName", "商品或服务名称", "text"],
  ["paymentAmountYuan", "支付金额（元）", "number"], ["paymentDate", "支付日期", "date"], ["orderOrContractNumber", "订单号或合同号", "text"],
  ["usedAmountOrCount", "已使用次数或金额", "text"], ["remainingAmountOrCount", "剩余次数或金额", "text"],
  ["firstRefundRequestDate", "首次提出退费日期", "date"], ["merchantResponse", "商家回复", "text"], ["desiredResolution", "用户具体诉求", "text"]
] as const;

export function CaseCreateForm() {
  const storedScreening = useSyncExternalStore(() => () => undefined, () => sessionStorage.getItem("screening"), () => null);
  const screening = useMemo(() => storedScreening ? JSON.parse(storedScreening) as {input:ScreeningInput;result:ScreeningResult} : null, [storedScreening]);
  const [states,setStates]=useState<Record<string,FieldState>>({});const [error,setError]=useState("");const [loading,setLoading]=useState(false);const router=useRouter();
  function mark(key:string,value:string){setStates(current=>({...current,[key]:value?"USER_CONFIRMED":"EMPTY"}));}
  function unable(key:string){setStates(current=>({...current,[key]:current[key]==="UNABLE_TO_CONFIRM"?"EMPTY":"UNABLE_TO_CONFIRM"}));}
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(!screening?.result?.eligible)return setError("请先完成适用性预筛");setLoading(true);setError("");const form=new FormData(event.currentTarget);const now=new Date().toISOString();const details=Object.fromEntries(caseFields.map(([key,,type])=>{const raw=String(form.get(key)??"");const value=raw?(type==="number"?Number(raw):raw):null;return[key,{value,state:value===null?(states[key]==="UNABLE_TO_CONFIRM"?"UNABLE_TO_CONFIRM":"EMPTY"):(states[key]??"USER_CONFIRMED"),evidenceSupport:value===null?"NONE":"USER_STATEMENT",savedAt:now}];}));
    const response=await fetch("/api/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:form.get("title"),disputeType:screening.input.disputeType,screening:screening.result,details})});const data=await response.json();setLoading(false);if(response.status===401)return router.push("/login?next=/cases/new");if(!response.ok)return setError(data.error?.message??"创建失败");sessionStorage.removeItem("screening");router.push(`/cases/${data.case.id}`);router.refresh();}
  if(!screening)return <div className="empty"><h2>需要先完成适用性预筛</h2><p>适用性检查只判断本工具是否适合整理材料，不作法律结论。</p><button className="button" onClick={()=>router.push("/screening")}>前往适用性检查</button></div>;
  return <form className="form card" onSubmit={submit}><label>案件名称<input name="title" required minLength={2} maxLength={100} placeholder="例如：健身年卡退费材料整理" /></label><p className="notice">你亲自填写的有效内容在离开输入框后自动标记为“已确认·用户填写”，不代表已有客观证据。</p>
    <div className="form-section">{caseFields.map(([key,label,type])=><div className="field-with-state" key={key}><label>{label}<input name={key} type={type} step={type==="number"?"0.01":undefined} onBlur={event=>mark(key,event.currentTarget.value)} /></label><div className="field-statuses"><span className="status neutral">{fieldStateLabels[states[key]??"EMPTY"]}</span><span className="status neutral">{evidenceSupportLabels[states[key]&&states[key]!=="EMPTY"?"USER_STATEMENT":"NONE"]}</span><button className="text-button" type="button" onClick={()=>unable(key)}>{states[key]==="UNABLE_TO_CONFIRM"?"恢复填写":"标记无法确认"}</button></div></div>)}</div>
    {error&&<p className="form-error" role="alert">{error}</p>}<div className="actions"><button className="button" disabled={loading}>{loading?"正在安全保存…":"创建案件并继续"}</button><button className="button secondary" type="button" onClick={()=>router.push("/dashboard")}>保存以后再开始</button></div></form>;
}
