import { describe, expect, it } from "vitest";
import { assertSameOrigin, hashPassword, redactBeforeModel, safeStorageSegment, verifyPassword } from "@/lib/security";

describe("安全工具", () => {
  it("使用 scrypt 验证密码", () => {
    const value = hashPassword("test-password", "fixed-salt");
    expect(verifyPassword("test-password", value)).toBe(true);
    expect(verifyPassword("bad-password", value)).toBe(false);
  });
  it("拒绝路径穿越片段", () => expect(() => safeStorageSegment("../secret")).toThrow());
  it("拒绝跨站和缺少 Origin 的写请求", () => {
    expect(() => assertSameOrigin(new Request("http://localhost/api", { headers: { origin: "https://evil.example" } }), "http://localhost:3000")).toThrow("请求来源校验失败");
    expect(() => assertSameOrigin(new Request("http://localhost/api"), "http://localhost:3000")).toThrow("请求来源校验失败");
    expect(() => assertSameOrigin(new Request("http://localhost/api", { headers: { origin: "http://localhost:3000" } }), "http://localhost:3000")).not.toThrow();
  });
  it("模型调用前脱敏证件、银行卡、手机号和详细地址", () => {
    const output = redactBeforeModel("身份证 110101199001011234 卡 6222021234567890 手机 13812345678 地址：某市某区某街道 99 号 1 单元");
    expect(output).not.toContain("110101199001011234"); expect(output).not.toContain("6222021234567890"); expect(output).not.toContain("13812345678"); expect(output).not.toContain("99 号");
  });
});

