import { describe, expect, it } from "vitest";
import { defaultPathForRole, navigationForRole, pageAccessRedirect, postLoginPath, roleLabels } from "@/lib/access";
import { deleteSessionCookie } from "@/server/auth";

const labels=(role:"USER"|"REVIEWER"|"ADMIN"|null)=>navigationForRole(role).map(item=>item.label);
describe("统一角色导航与页面权限",()=>{
  it("普通用户显示开始整理和我的案件",()=>{expect(labels("USER")).toEqual(expect.arrayContaining(["开始整理","我的案件"]));expect(labels("USER")).not.toEqual(expect.arrayContaining(["复核工作台","管理后台"]));});
  it("复核员只显示复核工作台，不显示创建入口",()=>{expect(labels("REVIEWER")).toContain("复核工作台");expect(labels("REVIEWER")).not.toContain("开始整理");expect(labels("REVIEWER")).not.toContain("管理后台");});
  it("管理员显示管理和复核入口，不显示开始整理",()=>{expect(labels("ADMIN")).toEqual(expect.arrayContaining(["管理后台","复核工作台"]));expect(labels("ADMIN")).not.toContain("开始整理");});
  it("未登录用户显示公共信息、开始整理和登录",()=>expect(labels(null)).toEqual(expect.arrayContaining(["服务说明","隐私与边界","开始整理","登录"])));
  it("三种角色使用不同默认页且仅返回有权访问的原页面",()=>{expect(defaultPathForRole("USER")).toBe("/dashboard");expect(defaultPathForRole("REVIEWER")).toBe("/review");expect(defaultPathForRole("ADMIN")).toBe("/admin");expect(postLoginPath("REVIEWER","/cases/new")).toBe("/review");expect(postLoginPath("REVIEWER","/review/demo")).toBe("/review/demo");expect(postLoginPath("USER","https://evil.example")).toBe("/dashboard");});
  it("页面加载阶段给出角色化重定向",()=>{expect(pageAccessRedirect("REVIEWER",["USER","ADMIN"],"/cases/new")).toBe("/review?notice=reviewer-cannot-create");expect(pageAccessRedirect("USER",["REVIEWER","ADMIN"],"/review")).toBe("/dashboard?notice=user-cannot-review");expect(pageAccessRedirect("USER",["ADMIN"],"/admin")).toBe("/dashboard?notice=admin-only");expect(pageAccessRedirect(null,["USER"],"/dashboard")).toBe("/login?next=%2Fdashboard");});
  it("切换角色时导航完全由新会话角色生成",()=>{expect(labels("USER")).toContain("开始整理");expect(labels("REVIEWER")).not.toContain("开始整理");expect(labels("ADMIN")).not.toContain("我的案件");expect(roleLabels.REVIEWER).toBe("人工复核员");});
  it("退出会删除服务端会话 Cookie 名",()=>{const deleted:string[]=[];deleteSessionCookie({delete:name=>deleted.push(name)});expect(deleted).toEqual(["evidence_session"]);});
});

