import { getDb, migrate, closeDb } from "../src/lib/db";
import { getEnv } from "../src/lib/env";
import { hashPassword } from "../src/lib/security";

const env = getEnv();
if (env.NODE_ENV === "production" || env.DEV_AUTH_ENABLED !== "true") throw new Error("种子账号只能在启用开发登录的非生产环境中创建");
const accounts = [
  ["demo-user", "user@demo.local", "演示用户", "USER", env.DEV_USER_PASSWORD],
  ["demo-reviewer", "reviewer@demo.local", "演示复核员", "REVIEWER", env.DEV_REVIEWER_PASSWORD],
  ["demo-admin", "admin@demo.local", "演示管理员", "ADMIN", env.DEV_ADMIN_PASSWORD]
] as const;
if (accounts.some((account) => !account[4])) throw new Error("请在 .env.local 配置三个 DEV_*_PASSWORD（至少 8 位）");
migrate(); const db = getDb();
for (const [id, email, displayName, role, password] of accounts) {
  db.prepare(`INSERT INTO users (id, email, display_name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email, display_name=excluded.display_name, role=excluded.role, password_hash=excluded.password_hash`
  ).run(id, email, displayName, role, hashPassword(password!, `demo-${id}-salt`), new Date().toISOString());
}
const plans = [
  ["plan-free", "FREE_CHECK", "免费证据检查", "材料分类和基础缺口提示", "不生成完整材料包，不含人工复核"],
  ["plan-auto", "AUTO", "自动整理版", "提取确认、时间线、矩阵和材料草稿", "不含人工复核，不保证任何处理结果"],
  ["plan-complete", "COMPLETE", "完整材料包", "6 份 PDF 与精简/完整 ZIP", "不代为提交，不提供法律结论"],
  ["plan-review", "HUMAN_REVIEW", "人工复核版", "由分配复核员检查来源关系和中性表述", "不修改原始证据，不保证投诉或退款成功"]
] as const;
for (const plan of plans) db.prepare("INSERT INTO plans(id,code,name,description,limitations,active)VALUES(?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET code=excluded.code,name=excluded.name,description=excluded.description,limitations=excluded.limitations,active=1").run(...plan);
const now=new Date().toISOString();const eligibility=JSON.stringify({eligible:true,reasons:["虚构健身预付服务演示案例"],suggestedMaterials:["付款记录","服务约定","退款沟通"],safetyNotice:null,boundary:"只整理材料，不提供法律结论。"});const detail=(value:unknown)=>({value,state:"CONFIRMED"});const details=JSON.stringify({merchantLegalName:detail("星云健康管理有限公司（虚构）"),storeName:detail("星云健身中心（虚构）"),serviceName:detail("年度健身服务"),paymentAmountYuan:detail(2999),paymentDate:detail("2026-01-15"),orderOrContractNumber:detail("DEMO-2026-001"),usedAmountOrCount:detail("4 次"),remainingAmountOrCount:{value:"8 个月",state:"PENDING"},firstRefundRequestDate:detail("2026-05-20"),merchantResponse:{value:"暂不接受退费（用户填写）",state:"PENDING"},desiredResolution:detail("整理材料并继续协商退费")});db.prepare("INSERT INTO cases(id,owner_id,title,dispute_type,status,eligibility_json,details_json,expires_at,created_at,updated_at)VALUES('demo-case-gym','demo-user','虚构健身年卡 2999 元退费演示','GYM','PENDING_UPLOAD',?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,details_json=excluded.details_json,updated_at=excluded.updated_at").run(eligibility,details,new Date(Date.now()+30*86400000).toISOString(),now,now);
console.log("虚构开发账号已创建：user@demo.local、reviewer@demo.local、admin@demo.local（密码来自本地环境变量）。");
console.log("虚构演示案件已创建：demo-case-gym；测试套餐已初始化，不会发生真实支付。");
closeDb();
