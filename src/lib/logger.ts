const sensitiveKey = /(?:password|secret|token|authorization|cookie|evidenceText|chat|content|address)/i;
const idCard = /(?<!\d)\d{17}[\dXx](?!\d)/g;
const mobile = /(?<!\d)1[3-9]\d{9}(?!\d)/g;
const bankCard = /(?<!\d)\d{16,19}(?!\d)/g;
const bearer = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;

export function redactText(value: string): string {
  return value
    .replace(idCard, "[身份证号已脱敏]")
    .replace(mobile, (match) => `${match.slice(0, 3)}****${match.slice(-4)}`)
    .replace(bankCard, "[银行卡号已脱敏]")
    .replace(bearer, "Bearer [令牌已脱敏]");
}

export function sanitizeForLog(value: unknown, key = ""): unknown {
  if (sensitiveKey.test(key)) return "[敏感字段已移除]";
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeForLog(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        sanitizeForLog(childValue, childKey)
      ])
    );
  }
  return value;
}

export const logger = {
  info(event: string, data: Record<string, unknown> = {}) {
    console.info(JSON.stringify({ level: "info", event, data: sanitizeForLog(data), at: new Date().toISOString() }));
  },
  error(event: string, error: unknown, data: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({
        level: "error",
        event,
        error: error instanceof Error ? { name: error.name, message: redactText(error.message) } : "unknown",
        data: sanitizeForLog(data),
        at: new Date().toISOString()
      })
    );
  }
};

