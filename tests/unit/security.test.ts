import { describe,expect,it } from "vitest";import { hashPassword,safeStorageSegment,verifyPassword } from "@/lib/security";
describe("安全工具",()=>{it("使用 scrypt 验证密码",()=>{const value=hashPassword("test-password","fixed-salt");expect(verifyPassword("test-password",value)).toBe(true);expect(verifyPassword("bad-password",value)).toBe(false)});it("拒绝路径穿越片段",()=>{expect(()=>safeStorageSegment("../secret")).toThrow()})});

