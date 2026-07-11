"use client";
/* eslint-disable @next/next/no-img-element -- authenticated private demo thumbnails are intentionally unoptimized */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { demoAssets } from "@/lib/demo";

export function DemoEvidenceTools({caseId}:{caseId:string}){
  const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");const router=useRouter();
  async function load(assetIds?:string[]){setBusy(true);setMessage("正在按普通上传规则校验并载入…");const response=await fetch(`/api/demo/cases/${caseId}/evidence`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assetIds})});const data=await response.json();setBusy(false);if(!response.ok)return setMessage(data.error?.message??"载入失败，请重试");setMessage(`已载入 ${data.evidence.length} 份材料；图片/PDF 在 Mock 模式进入人工处理，TXT 可执行结构化提取。`);router.refresh();}
  async function clear(){if(!confirm("清空当前演示案件的全部证据？基础信息不会删除。"))return;setBusy(true);const response=await fetch(`/api/demo/cases/${caseId}/evidence`,{method:"DELETE"});setBusy(false);if(!response.ok)return setMessage("清空失败，请重试");setMessage("演示证据已清空。");router.refresh();}
  return <details className="demo-tools"><summary>演示资料与快捷测试 <span>仅开发测试环境可见</span></summary><p>一键载入和单份载入都调用与手工上传相同的文件校验、摘要去重和私有存储服务。</p><div className="actions"><button type="button" className="button" disabled={busy} onClick={()=>load()}>一键载入全部演示证据</button><button type="button" className="button secondary" disabled={busy} onClick={clear}>清空演示证据</button></div><div className="demo-asset-grid">{demoAssets.map(asset=><article className="demo-asset" key={asset.id}>{asset.mimeType==="image/png"?<img src={`/api/demo/assets/${asset.id}`} alt={`${asset.title}虚构示例缩略图`}/>:<div className="asset-placeholder">{asset.mimeType==="application/pdf"?"PDF":"TXT"}</div>}<strong>{asset.fileName}</strong><span>{asset.reason}</span><button type="button" disabled={busy} onClick={()=>load([asset.id])}>载入此材料</button></article>)}</div>{message&&<p className="notice" aria-live="polite">{message}</p>}</details>;
}
