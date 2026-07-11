import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { AppError } from "@/lib/errors";

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 32);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function signValue(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function safeStorageSegment(value: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) throw new AppError("INVALID_PATH", "无效的存储路径", 400);
  return value;
}

export function sha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function assertSameOrigin(request: Request, appUrl: string): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(appUrl).origin) {
    throw new AppError("INVALID_ORIGIN", "请求来源校验失败", 403);
  }
}

export function redactBeforeModel(value: string): string {
  return value
    .replace(/(?<!\d)\d{17}[\dXx](?!\d)/g, "[身份证号已脱敏]")
    .replace(/(?<!\d)\d{16,19}(?!\d)/g, "[银行卡号已脱敏]")
    .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, "[手机号已脱敏]")
    .replace(/(?:家庭住址|住址|地址)[:：]\s*[^\n]{6,200}/g, "地址：[详细地址已脱敏]");
}
