import Link from "next/link";
import { notFound } from "next/navigation";
import { TimelineReviewBoundary as TimelineReview } from "@/components/DtoBoundaries";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listTimeline } from "@/server/timeline";
import { getCaseWorkflowState } from "@/server/workflow";

export const dynamic = "force-dynamic";

export default async function TimelinePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const user = await requirePageRole(["USER", "REVIEWER", "ADMIN"], `/cases/${caseId}/timeline`);
  try { getCaseForActor(user, caseId); } catch { notFound(); }
  const workflow = getCaseWorkflowState(user, caseId);
  const processed = workflow.snapshot.confirmedExtractionCount + workflow.snapshot.modifiedExtractionCount + workflow.snapshot.unableExtractionCount;
  const blockedByExtraction = workflow.snapshot.confirmedExtractionCount + workflow.snapshot.modifiedExtractionCount === 0;
  return <div>
    <div className="eyebrow">步骤 5 / 8</div><h1 className="page-title">核对事件时间线</h1>
    <p className="lead">证据支持事件可回到原文件；没有客观证据的内容必须标记为“用户陈述”。确认至少一条事件后，才能生成事实—证据矩阵。</p>
    {blockedByExtraction && user.role !== "REVIEWER" && <section className="card notice warning"><h2>请先确认材料提取结果</h2><p>系统已从 {workflow.snapshot.evidenceCount} 份证据中提取 {workflow.snapshot.extractionCount} 项信息，目前 {processed} 项已处理。确认日期、金额、商家信息和沟通内容后，系统才能生成事件时间线。</p><div className="actions"><Link className="button" href={`/cases/${caseId}/extractions`}>返回确认提取结果</Link><Link className="button secondary" href={`/cases/${caseId}`}>查看已上传证据</Link><Link className="button secondary" href="/dashboard">保存并稍后继续</Link></div></section>}
    <TimelineReview caseId={caseId} initial={listTimeline(user, caseId)} readOnly={user.role === "REVIEWER"} />
  </div>;
}
