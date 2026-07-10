import { closeDb, getDb, migrate } from "../src/lib/db";

migrate(getDb());
console.log("数据库迁移完成。");
closeDb();

