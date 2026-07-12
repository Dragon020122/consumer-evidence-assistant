import Link from "next/link";
import { notFound } from "next/navigation";
import { MatrixPanelBoundary as MatrixPanel } from "@/components/DtoBoundaries";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listMatrix } from "@/server/matrix";
import { getCaseWorkflowState } from "@/server/workflow";

export const dynamic = "force-dynamic";

export default async function MatrixPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const actor = await requirePageRole(["USER", "REVIEWER", "ADMIN"], `/cases/${caseId}/matrix`);
  try { getCaseForActor(actor, caseId); } catch { notFound(); }
  const workflow = getCaseWorkflowState(actor, caseId);
  const locked = workflow.snapshot.confirmedTimelineCount === 0;
  return <div><div className="eyebrow">步骤 6 / 8</div><h1 className="page-title">事实—证据矩阵</h1><p className="lead">矩阵说明材料支持程度和缺口，不对事实作法律认定。</p>
    {locked && actor.role !== "REVIEWER" ? <section className="card notice warning"><h2>请先确认至少一条时间线事件</h2><p>确认后的事件才能作为矩阵中的事实来源。材料缺口不会阻止确认，但未确认事件不会进入矩阵。</p><Link className="button" href={`/cases/${caseId}/timeline`}>返回确认时间线</Link></section> : <MatrixPanel caseId={caseId} initial={listMatrix(actor, caseId)} readOnly={actor.role === "REVIEWER"} />}
  </div>;
}
