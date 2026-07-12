import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtractionReviewBoundary as ExtractionReview } from "@/components/DtoBoundaries";
import { demoModeEnabled } from "@/lib/demo";
import { requirePageRole } from "@/server/page-access";
import { getCaseForActor } from "@/server/cases";
import { listExtractions } from "@/server/extraction";

export const dynamic = "force-dynamic";

export default async function ExtractionsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const user = await requirePageRole(["USER", "REVIEWER", "ADMIN"], `/cases/${caseId}/extractions`);
  let item;
  try { item = getCaseForActor(user, caseId); } catch { notFound(); }
  const rows = listExtractions(user, caseId);
  return <div>
    <div className="eyebrow">步骤 4 / 8</div><h1 className="page-title">逐项核对提取结果</h1>
    <p className="lead">Mock/AI 提取默认处于“待确认·材料提取”。确认、修改、删除错误项、无法确认和来源定位都会保留审计记录；图片和 PDF 在 Mock 模式下不会被猜测。</p>
    <ExtractionReview caseId={caseId} initial={rows} readOnly={user.role === "REVIEWER"} demoTools={user.role === "USER" && Boolean(item.isDemo) && demoModeEnabled()} />
    {user.role !== "REVIEWER" && <div className="actions"><Link className="button secondary" href={`/cases/${caseId}`}>返回上传证据</Link><Link className="button secondary" href={`/cases/${caseId}/timeline`}>查看时间线前置条件</Link></div>}
  </div>;
}
