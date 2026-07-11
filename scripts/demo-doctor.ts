import "./load-env";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { closeDb, getDb } from "../src/lib/db";
import { getEnv } from "../src/lib/env";
import { DEMO_TEMPLATE_KEY, demoAssetPath, demoAssets } from "../src/lib/demo";
import { validateUpload } from "../src/server/storage";

async function main(){
  const env=getEnv();const failures:string[]=[];
  const ok=(label:string,value:string)=>console.log(`通过 | ${label} | ${value}`);
  const fail=(label:string,value:string)=>{failures.push(label);console.log(`失败 | ${label} | ${value}`);};
  if(env.NODE_ENV==="production")fail("运行环境","production 禁止演示模式");else ok("运行环境",env.NODE_ENV);
  if(env.DEMO_MODE_ENABLED==="true")ok("演示开关","DEMO_MODE_ENABLED=true");else fail("演示开关","请在 .env.local 设置 DEMO_MODE_ENABLED=true 并重启服务");
  try{
    const db=getDb();db.prepare("SELECT 1").get();ok("数据库连接","SQLite 可读写");
    const versions=new Set((db.prepare("SELECT version FROM schema_migrations").all()as{version:string}[]).map(x=>x.version));
    for(const version of["001_initial.sql","002_demo_case.sql","003_demo_template_state.sql"]){if(versions.has(version))ok("数据库迁移",version);else fail("数据库迁移",`缺少 ${version}，请运行 npm run db:migrate`);}
    const columns=new Set((db.prepare("PRAGMA table_info(cases)").all()as{name:string}[]).map(x=>x.name));for(const column of["is_demo","demo_template_key","demo_setup_state"])if(!columns.has(column))fail("数据库结构",`缺少 cases.${column}`);
    const user=db.prepare("SELECT id FROM users WHERE email='user@demo.local' AND role='USER'").get()as{id:string}|undefined;
    if(!user)fail("演示账号","请运行 npm run db:seed");else{
      ok("演示账号","user@demo.local 存在且角色为 USER");const item=db.prepare("SELECT id,demo_setup_state AS state FROM cases WHERE owner_id=? AND demo_template_key=?").get(user.id,DEMO_TEMPLATE_KEY)as{id:string;state:string}|undefined;
      if(!item)ok("演示案件","当前没有，可安全创建");else{const evidence=(db.prepare("SELECT COUNT(*) AS count FROM evidence WHERE case_id=?").get(item.id)as{count:number}).count;const extraction=(db.prepare("SELECT COUNT(*) AS count FROM extractions WHERE case_id=?").get(item.id)as{count:number}).count;if(item.state==="READY"&&evidence===8&&extraction>0)ok("演示案件",`可恢复，证据 ${evidence}/8，提取 ${extraction} 条`);else fail("演示案件",`状态 ${item.state}，证据 ${evidence}/8，运行 npm run demo:seed 可安全修复`);}
    }
  }catch{fail("数据库连接","无法检查数据库，请确认 DATABASE_PATH 与迁移状态");}
  const root=resolve(env.PRIVATE_STORAGE_PATH);const probe=join(root,`.demo-doctor-${randomUUID()}`);
  try{await mkdir(root,{recursive:true});await writeFile(probe,"demo-doctor",{flag:"wx"});await access(probe,constants.R_OK|constants.W_OK);await rm(probe,{force:true});ok("私有存储","目录存在且可写");}catch{await rm(probe,{force:true}).catch(()=>undefined);fail("私有存储","目录不可写，请检查 PRIVATE_STORAGE_PATH 权限");}
  for(const asset of demoAssets){try{const bytes=await readFile(demoAssetPath(asset.fileName));validateUpload(new File([new Uint8Array(bytes)],asset.fileName,{type:asset.mimeType}),bytes);ok("演示资料",asset.fileName);}catch{fail("演示资料",`${asset.fileName} 缺失或校验失败，请运行 npm run demo:generate-assets`);}}
  if(env.OCR_PROVIDER==="mock")ok("Mock OCR","mock");else fail("Mock OCR",`当前为 ${env.OCR_PROVIDER}`);
  if(env.EXTRACTION_PROVIDER==="mock")ok("Mock 提取","mock");else fail("Mock 提取",`当前为 ${env.EXTRACTION_PROVIDER}`);
  ok("演示模板",DEMO_TEMPLATE_KEY);if(failures.length)throw new Error(`演示环境自检失败：${[...new Set(failures)].join("、")}`);console.log("演示环境自检通过，未输出密码、签名密钥或绝对存储路径。");
}
main().catch(error=>{console.error(error instanceof Error?error.message:"演示环境自检失败");process.exitCode=1;}).finally(()=>closeDb());
