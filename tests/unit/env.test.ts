import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("环境安全", () => {
  it("生产环境拒绝开发登录", () => {
    expect(() => getEnv({ NODE_ENV: "production", DEV_AUTH_ENABLED: "true", DEV_AUTH_SECRET: "x".repeat(32) })).toThrow(
      "生产环境禁止启用开发登录"
    );
  });
  it("生产环境拒绝演示模式",()=>{expect(()=>getEnv({NODE_ENV:"production",DEV_AUTH_ENABLED:"false",DEMO_MODE_ENABLED:"true"})).toThrow("生产环境禁止启用演示模式")});
});
