import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadCenterBoundary as DownloadCenter } from "@/components/DtoBoundaries";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listGenerated } from "@/server/export";
import { getCaseWorkflowState } from "@/server/workflow";

export const dynamic = "force-dynamic";
export default async function DownloadsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const actor = await requirePageRole(["USER", "REVIEWER", "ADMIN"], `/cases/${caseId}/downloads`);
  try { getCaseForActor(actor, caseId); } catch { notFound(); }
  const workflow = getCaseWorkflowState(actor, caseId);
  const missing = [workflow.snapshot.confirmedTimelineCount === 0 ? "至少确认一条时间线事件" : null, workflow.snapshot.matrixCount === 0 ? "生成事实—证据矩阵" : null].filter(Boolean);
  return <div><div className="eyebrow">步骤 8 / 8</div><h1 className="page-title">生成和下载</h1><p className="lead">包含 6 份中文 PDF、完整材料包、精简提交版和完整留存版；所有内容都是需要用户核对的材料草稿。</p>
    {missing.length > 0 && <section className="card notice warning"><h2>还不能生成草稿材料</h2><p>请先完成：{missing.join("、")}。材料类别不齐不会阻止导出，系统会在草稿中明确标记材料缺口。</p><Link className="button" href={`/cases/${caseId}/timeline`}>返回确认时间线</Link></section>}
    {missing.length === 0 && <DownloadCenter caseId={caseId} initial={listGenerated(actor, caseId)} readOnly={actor.role === "REVIEWER"} />}
  </div>;
}
