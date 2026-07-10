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
console.log("虚构开发账号已创建：user@demo.local、reviewer@demo.local、admin@demo.local（密码来自本地环境变量）。");
closeDb();

