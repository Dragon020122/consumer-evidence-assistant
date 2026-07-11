import Link from "next/link";
import { AccessNotice } from "@/components/AccessNotice";
import { caseStatusLabels } from "@/lib/labels";
import { reviewerQueue } from "@/server/backoffice";
import { requirePageRole } from "@/server/page-access";
export const dynamic="force-dynamic";export default async function ReviewQueuePage({searchParams}:{searchParams:Promise<{notice?:string}>}){const actor=await requirePageRole(["REVIEWER","ADMIN"],"/review");const query=await searchParams;const cases=reviewerQueue(actor);return <div><AccessNotice code={query.notice}/><div className="eyebrow">{actor.role==="ADMIN"?"管理员复核视图":"人工复核员"}</div><h1 className="page-title">{actor.role==="ADMIN"?"全部测试案件复核入口":"只显示分配给你的案件"}</h1>{cases.length===0?<div className="empty card">当前没有分配的待复核案件。</div>:<div className="case-list">{cases.map(item=><Link className="card case-row" href={`/review/${item.id}`} key={item.id}><div><span className="status neutral">{caseStatusLabels[item.status]??item.status}</span><h3>{item.title}</h3></div><span>开始复核 →</span></Link>)}</div>}</div>}
