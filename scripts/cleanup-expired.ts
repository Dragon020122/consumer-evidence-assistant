import "./load-env";
import { closeDb, migrate } from "../src/lib/db";
import { cleanupExpiredCases } from "../src/server/deletion";

migrate();
const result = await cleanupExpiredCases();
console.log(`到期清理完成：删除 ${result.deleted.length} 个，失败 ${result.failed.length} 个。`);
if (result.failed.length) process.exitCode = 1;
closeDb();
