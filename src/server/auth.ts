import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { signValue, verifyPassword } from "@/lib/security";
import { roles, type Role } from "@/lib/schemas";

const COOKIE_NAME = "evidence_session";
interface DeletableCookieStore { delete(name:string):void }

export interface SessionUser { id: string; email: string; displayName: string; role: Role }
interface SessionPayload { userId: string; expiresAt: number }

function sessionSecret(): string {
  const secret = getEnv().DEV_AUTH_SECRET;
  if (!secret) throw new AppError("AUTH_NOT_CONFIGURED", "开发登录未配置", 503);
  return secret;
}

function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${signValue(data, sessionSecret())}`;
}

function decodeSession(value: string): SessionPayload | null {
  const [data, signature] = value.split(".");
  if (!data || !signature) return null;
  const expected = signValue(data, sessionSecret());
  if (signature.length !== expected.length || !timingSafeString(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch { return null; }
}

function timingSafeString(a: string, b: string): boolean {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const env = getEnv();
  if (env.NODE_ENV === "production" || env.DEV_AUTH_ENABLED !== "true") {
    throw new AppError("DEV_AUTH_DISABLED", "开发登录未启用", 403);
  }
  const row = getDb().prepare(
    "SELECT id, email, display_name AS displayName, role, password_hash AS passwordHash FROM users WHERE email = ?"
  ).get(email.toLowerCase()) as ({ id:string;email:string;displayName:string;role:string;passwordHash:string }) | undefined;
  if (!row || !verifyPassword(password, row.passwordHash)) throw new AppError("INVALID_CREDENTIALS", "账号或密码不正确", 401);
  if (!roles.includes(row.role as Role)) throw new AppError("INVALID_ACCOUNT_ROLE", "账号角色配置无效", 403);
  return { id: row.id, email: row.email, displayName: row.displayName, role: row.role as Role };
}

export async function createSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession({ userId: user.id, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }), {
    httpOnly: true, sameSite: "strict", secure: getEnv().NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60
  });
}

export async function clearSession(): Promise<void> {
  deleteSessionCookie(await cookies());
}

export function deleteSessionCookie(store:DeletableCookieStore):void{store.delete(COOKIE_NAME);}

export async function getSessionUser(): Promise<SessionUser | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;
  const payload = decodeSession(value);
  if (!payload) return null;
  return (getDb().prepare("SELECT id, email, display_name AS displayName, role FROM users WHERE id = ?").get(payload.userId) as SessionUser | undefined) ?? null;
}

export async function requireSession(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "请先登录", 401);
  if (roles && !roles.includes(user.role)) throw new AppError("FORBIDDEN", "没有执行此操作的权限", 403);
  return user;
}
