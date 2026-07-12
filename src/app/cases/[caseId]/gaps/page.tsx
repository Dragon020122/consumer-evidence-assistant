import Link from "next/link";
import { notFound } from "next/navigation";
import { detectMaterialGaps } from "@/lib/gaps";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listEvidence } from "@/server/storage";
import { listExtractions } from "@/server/extraction";
import { listTimeline } from "@/server/timeline";
import { getCaseWorkflowState } from "@/server/workflow";

export const dynamic = "force-dynamic";
const label = { PRIORITY: "建议优先补充", OPTIONAL: "可选补充", UNKNOWN: "当前无法确认" };
export default async function GapsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const actor = await requirePageRole(["USER", "REVIEWER", "ADMIN"], `/cases/${caseId}/gaps`);
  let item; try { item = getCaseForActor(actor, caseId); } catch { notFound(); }
  const workflow = getCaseWorkflowState(actor, caseId);
  const gaps = detectMaterialGaps(listEvidence(actor, caseId), listExtractions(actor, caseId), listTimeline(actor, caseId), JSON.parse(item.detailsJson));
  return <div><div className="eyebrow">步骤 7 / 8</div><h1 className="page-title">材料缺口清单</h1><p className="lead">以下只是材料整理建议，不是确定法律意见。缺口不会阻止生成明确标记为不完整的草稿。</p>
    {workflow.snapshot.matrixCount === 0 && <section className="card notice warning"><h2>请先生成事实—证据矩阵</h2><p>矩阵会把已确认事件和材料对应起来，再据此检查缺口；在此之前，本页不会把材料状态标为完成。</p><Link className="button" href={`/cases/${caseId}/matrix`}>返回证据矩阵</Link></section>}
    {gaps.length === 0 ? <div className="notice">当前规则未识别优先材料缺口，仍请人工逐份核对材料完整性。</div> : <div className="gap-list">{gaps.map((gap) => <article className="card" key={gap.code}><span className="status neutral">{label[gap.priority]}</span><h3>{gap.title}</h3><p>{gap.recommendation}</p><p className="muted">检查依据：{gap.basis}</p></article>)}</div>}
    <div className="actions"><Link className="button" href={`/cases/${caseId}/results`}>预览案件摘要和事实说明草稿</Link></div>
  </div>;
}
