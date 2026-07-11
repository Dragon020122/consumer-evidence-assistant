import "./load-env";
import { closeDb, getDb, migrate } from "../src/lib/db";
import { deleteCaseData } from "../src/server/deletion";

migrate();
const exists = getDb().prepare("SELECT id FROM cases WHERE id='demo-case-gym'").get();
if (exists) await deleteCaseData({ id:"demo-reset",email:"demo-reset@local.invalid",displayName:"演示重置",role:"ADMIN" }, "demo-case-gym");
console.log("仅虚构演示案件 demo-case-gym 已清理；其他案件未改动。重新执行 npm run db:seed 可恢复。");
closeDb();
