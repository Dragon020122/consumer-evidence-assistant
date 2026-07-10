"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const data = await response.json(); setLoading(false); if (!response.ok) return setError(data.error?.message ?? "登录失败"); router.push("/dashboard"); router.refresh();
  }
  return <form className="form card" onSubmit={submit}>
    <label>开发账号邮箱<input name="email" type="email" required autoComplete="username" placeholder="user@demo.local" /></label>
    <label>密码<input name="password" type="password" required minLength={8} autoComplete="current-password" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" disabled={loading}>{loading ? "正在验证…" : "登录测试环境"}</button>
  </form>;
}

