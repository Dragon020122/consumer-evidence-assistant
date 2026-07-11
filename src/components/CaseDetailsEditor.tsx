"use client";
import { useState } from "react";
import { caseFields } from "@/components/CaseCreateForm";
import { evidenceSupportLabels, fieldStateLabels } from "@/lib/labels";
import { normalizeDetails, type CaseDetailField, type FieldState } from "@/lib/field-state";

export function CaseDetailsEditor({caseId,initial,readOnly=false}:{caseId:string;initial:Record<string,CaseDetailField>;readOnly?:boolean}){
  const[details,setDetails]=useState(()=>normalizeDetails(initial));const[message,setMessage]=useState("");
  async function save(key:string,raw:string,type:string,requested?:FieldState){const current=details[key];const value=raw?(type==="number"?Number(raw):raw):null;const state=value===null?(requested==="UNABLE_TO_CONFIRM"?"UNABLE_TO_CONFIRM":"EMPTY"):(requested??(current.state==="USER_CONFIRMED"?"USER_EDITED":current.state==="EMPTY"?"USER_CONFIRMED":"USER_EDITED"));setMessage("正在自动保存…");const response=await fetch(`/api/cases/${caseId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fieldName:key,value,state})});const data=await response.json();if(!response.ok)return setMessage(data.error?.message??"自动保存失败，请重试");setDetails(normalizeDetails(JSON.parse(data.case.detailsJson)));setMessage(`已自动保存 · ${new Date().toLocaleTimeString("zh-CN")}`);}
  return <div><div className="section-head"><h2>基础信息</h2>{!readOnly&&<span className="save-state" aria-live="polite">{message||"修改后离开输入框自动保存"}</span>}</div><div className="detail-editor">{caseFields.map(([key,label,type])=>{const field=details[key];return <div className="field-with-state" key={key}><label>{label}<input type={type} step={type==="number"?"0.01":undefined} defaultValue={field.value===null?"":String(field.value)} disabled={readOnly} onBlur={event=>save(key,event.currentTarget.value,type)}/></label><div className="field-statuses"><span className="status neutral">{fieldStateLabels[field.state]}</span><span className="status neutral">{evidenceSupportLabels[field.evidenceSupport]}</span>{!readOnly&&<button type="button" className="text-button" onClick={()=>save(key,"",type,"UNABLE_TO_CONFIRM")}>无法确认</button>}</div></div>})}</div></div>;
}
