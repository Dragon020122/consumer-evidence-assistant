import "./load-env";
import { closeDb, getDb, migrate } from "../src/lib/db";
import { getEnv } from "../src/lib/env";
import { verifyPassword } from "../src/lib/security";

const env = getEnv();
const expected = [
  { email:"user@demo.local", role:"USER", source:"DEV_USER_PASSWORD", password:env.DEV_USER_PASSWORD },
  { email:"reviewer@demo.local", role:"REVIEWER", source:"DEV_REVIEWER_PASSWORD", password:env.DEV_REVIEWER_PASSWORD },
  { email:"admin@demo.local", role:"ADMIN", source:"DEV_ADMIN_PASSWORD", password:env.DEV_ADMIN_PASSWORD }
] as const;
const failures:string[]=[];
if(env.NODE_ENV==="production")failures.push("NODE_ENV 被设置为 production");
if(env.DEV_AUTH_ENABLED!=="true")failures.push("DEV_AUTH_ENABLED 未设置为 true");
if(!env.DEV_AUTH_SECRET)failures.push("DEV_AUTH_SECRET 未配置");
migrate();const db=getDb();
for(const account of expected){
  const row=db.prepare("SELECT email,role,password_hash AS passwordHash FROM users WHERE email=?").get(account.email)as{email:string;role:string;passwordHash:string}|undefined;
  const exists=Boolean(row);const roleMatches=row?.role===account.role;const passwordConfigured=Boolean(account.password);const passwordMatches=Boolean(row&&account.password&&verifyPassword(account.password,row.passwordHash));
  console.log(`${account.email} | ${account.role} | 密码来源 ${account.source} | 存在=${exists} | 角色=${roleMatches} | 密码哈希=${passwordMatches}`);
  if(!exists)failures.push(`${account.email} 不存在`);else{if(!roleMatches)failures.push(`${account.email} 角色不匹配`);if(!passwordConfigured)failures.push(`${account.source} 未配置`);else if(!passwordMatches)failures.push(`${account.email} 的数据库哈希与 ${account.source} 不匹配，请运行 npm run db:seed`);}
}
closeDb();
if(failures.length){console.error(`鉴权自检失败：\n- ${failures.join("\n- ")}`);process.exitCode=1;}else console.log(`鉴权自检通过：NODE_ENV=${env.NODE_ENV}，DEV_AUTH_ENABLED=${env.DEV_AUTH_ENABLED}。`);

