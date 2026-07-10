import { describe, expect, it } from "vitest";
import { redactText, sanitizeForLog } from "@/lib/logger";

describe("日志脱敏", () => {
  it("脱敏身份证、银行卡、手机号和令牌", () => {
    const value = redactText("证件 110101199001011234 手机 13812345678 卡号 6222021234567890 Bearer secret-token");
    expect(value).not.toContain("110101199001011234");
    expect(value).toContain("138****5678");
    expect(value).not.toContain("6222021234567890");
    expect(value).not.toContain("secret-token");
  });

  it("递归移除敏感字段", () => {
    expect(sanitizeForLog({ caseId: "case-1", evidenceText: "不应记录", nested: { password: "secret" } })).toEqual({
      caseId: "case-1",
      evidenceText: "[敏感字段已移除]",
      nested: { password: "[敏感字段已移除]" }
    });
  });
});

