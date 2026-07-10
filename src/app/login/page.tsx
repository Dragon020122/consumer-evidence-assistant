import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import { getSessionUser } from "@/server/auth";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard"); const env = getEnv();
  return <div className="narrow"><div className="eyebrow">开发环境功能</div><h1 className="page-title">登录脱敏测试空间</h1>
    <p className="lead">生产环境默认禁用。账号为虚构角色，密码只从服务端环境变量读取。</p>
    {env.NODE_ENV === "production" || env.DEV_AUTH_ENABLED !== "true" ? <div className="notice">开发登录未启用。</div> : <LoginForm />}
  </div>;
}

