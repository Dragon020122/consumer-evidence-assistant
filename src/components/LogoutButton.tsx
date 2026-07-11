"use client";import{useState}from"react";import{useRouter}from"next/navigation";
export function LogoutButton(){const[busy,setBusy]=useState(false);const router=useRouter();async function logout(){setBusy(true);await fetch("/api/auth/logout",{method:"POST"});router.push("/");router.refresh();}return <button className="button secondary" onClick={logout} disabled={busy}>{busy?"正在退出…":"退出测试账号"}</button>}

