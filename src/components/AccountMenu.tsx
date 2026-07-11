"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/schemas";
import { roleLabels } from "@/lib/access";

export function AccountMenu({email,displayName,role}:{email:string;displayName:string;role:Role}){const[busy,setBusy]=useState(false);const[error,setError]=useState("");const router=useRouter();async function logout(){setBusy(true);setError("");try{const response=await fetch("/api/auth/logout",{method:"POST",headers:{"Content-Type":"application/json"}});const data=await response.json();if(!response.ok)throw new Error(data.error?.message??"退出失败");router.replace("/login?notice=logged-out");router.refresh();}catch(reason){setBusy(false);setError(reason instanceof Error?reason.message:"退出失败，请重试");}}
return <details className="account-menu"><summary><span>{displayName}</span><small>{roleLabels[role]}</small></summary><div className="account-popover"><strong>{email}</strong><span>{roleLabels[role]}</span><button className="button secondary" onClick={logout} disabled={busy}>{busy?"正在安全退出…":"退出登录"}</button>{error&&<div className="form-error" role="alert"><span>{error}</span><button type="button" onClick={logout}>重试</button></div>}</div></details>}

