import { beforeEach, describe, expect, it } from "vitest";
import { closeDb, getDb, migrate } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { authenticate } from "@/server/auth";

beforeEach(()=>{
  closeDb();migrate();
  getDb().prepare("INSERT INTO users(id,email,display_name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)")
    .run("auth-reviewer","reviewer@demo.local","演示复核员","REVIEWER",hashPassword("reviewer-test-password","auth-test-salt"),new Date().toISOString());
});

describe("开发登录鉴权",()=>{
  it("使用正确密码查询账号并返回复核员角色",async()=>{
    await expect(authenticate("REVIEWER@DEMO.LOCAL","reviewer-test-password")).resolves.toEqual({id:"auth-reviewer",email:"reviewer@demo.local",displayName:"演示复核员",role:"REVIEWER"});
  });
  it("错误密码不会绕过 scrypt 校验",async()=>{
    await expect(authenticate("reviewer@demo.local","wrong-password")).rejects.toMatchObject({code:"INVALID_CREDENTIALS",status:401});
  });
  it("开发登录关闭时拒绝认证",async()=>{
    const previous=process.env.DEV_AUTH_ENABLED;process.env.DEV_AUTH_ENABLED="false";
    try{await expect(authenticate("reviewer@demo.local","reviewer-test-password")).rejects.toMatchObject({code:"DEV_AUTH_DISABLED",status:403});}
    finally{process.env.DEV_AUTH_ENABLED=previous;}
  });
});
