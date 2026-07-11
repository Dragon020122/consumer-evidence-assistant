import "./load-env";
import { closeDb, getDb, migrate } from "../src/lib/db";
import type { SessionUser } from "../src/server/auth";
import { createOrRestoreDemoCase } from "../src/server/demo";

async function main(){migrate();const row=getDb().prepare("SELECT id,email,display_name AS displayName,role FROM users WHERE email='user@demo.local' AND role='USER'").get()as SessionUser|undefined;if(!row)throw new Error("普通用户演示账号不存在，请先运行 npm run db:seed");const item=await createOrRestoreDemoCase(row);const evidence=(getDb().prepare("SELECT COUNT(*) AS count FROM evidence WHERE case_id=?").get(item.id)as{count:number}).count;const extractions=(getDb().prepare("SELECT COUNT(*) AS count FROM extractions WHERE case_id=?").get(item.id)as{count:number}).count;console.log(`演示案件已创建或恢复：模板 prepaid-gym-v1，证据 ${evidence}/8，提取结果 ${extractions} 条。`);}
main().catch(error=>{console.error(error instanceof Error?error.message:"演示案件初始化失败");process.exitCode=1;}).finally(()=>closeDb());
