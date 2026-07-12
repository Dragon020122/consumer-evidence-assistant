export type WorkflowStatus = "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_CONFIRMATION" | "NEEDS_SUPPLEMENT" | "CONFLICT" | "COMPLETED";

export interface WorkflowSnapshot {
  fieldCount: number;
  confirmedFieldCount: number;
  fieldConflictCount: number;
  evidenceCount: number;
  evidenceCategories: string[];
  extractionCount: number;
  confirmedExtractionCount: number;
  modifiedExtractionCount: number;
  unableExtractionCount: number;
  conflictExtractionCount: number;
  pendingExtractionCount: number;
  timelineCount: number;
  confirmedTimelineCount: number;
  matrixCount: number;
  priorityGapCount: number;
  exportCount: number;
}

export interface WorkflowStep {
  id: number;
  label: string;
  href: string;
  status: WorkflowStatus;
  note: string;
}

export function deriveWorkflow(caseId: string, snapshot: WorkflowSnapshot): WorkflowStep[] {
  const has = (category: string) => snapshot.evidenceCategories.includes(category);
  const recommendedMissing = [has("PAYMENT_ORDER"), has("MERCHANT_STATUS") || has("CONTRACT"), has("REFUND_COMMUNICATION")].filter((present) => !present).length;
  const processedExtractions = snapshot.confirmedExtractionCount + snapshot.modifiedExtractionCount + snapshot.unableExtractionCount;
  const extractionStatus: WorkflowStatus = snapshot.extractionCount === 0
    ? "NOT_STARTED"
    : snapshot.conflictExtractionCount > 0
      ? "CONFLICT"
      : snapshot.pendingExtractionCount > 0
        ? "NEEDS_CONFIRMATION"
        : "COMPLETED";
  const timelineStatus: WorkflowStatus = snapshot.timelineCount === 0
    ? "NOT_STARTED"
    : snapshot.confirmedTimelineCount === 0
      ? "NEEDS_CONFIRMATION"
      : "COMPLETED";
  const matrixStatus: WorkflowStatus = snapshot.matrixCount > 0
    ? "COMPLETED"
    : snapshot.confirmedTimelineCount > 0
      ? "IN_PROGRESS"
      : "NOT_STARTED";
  const gapsStatus: WorkflowStatus = snapshot.matrixCount === 0
    ? "NOT_STARTED"
    : snapshot.priorityGapCount > 0
      ? "NEEDS_SUPPLEMENT"
      : "COMPLETED";
  const missingExportConditions = [
    snapshot.confirmedTimelineCount === 0 ? "至少确认一条时间线事件" : null,
    snapshot.matrixCount === 0 ? "生成事实—证据矩阵" : null
  ].filter(Boolean) as string[];

  return [
    { id: 1, label: "适用性检查", href: "/screening", status: "COMPLETED", note: "已通过工具适用范围检查" },
    {
      id: 2,
      label: "创建案件",
      href: `/cases/${caseId}`,
      status: snapshot.fieldConflictCount > 0 ? "CONFLICT" : snapshot.confirmedFieldCount > 0 ? "COMPLETED" : "IN_PROGRESS",
      note: `已确认 ${snapshot.confirmedFieldCount}/${snapshot.fieldCount} 项基础信息`
    },
    {
      id: 3,
      label: "上传证据",
      href: `/cases/${caseId}`,
      status: snapshot.evidenceCount === 0 ? "NOT_STARTED" : recommendedMissing > 0 ? "NEEDS_SUPPLEMENT" : "COMPLETED",
      note: recommendedMissing > 0 ? `建议补充 ${recommendedMissing} 类材料；仍可继续整理` : `已有 ${snapshot.evidenceCount} 份材料`
    },
    {
      id: 4,
      label: "确认提取结果",
      href: `/cases/${caseId}/extractions`,
      status: extractionStatus,
      note: snapshot.extractionCount === 0 ? "尚未生成提取结果" : `已处理 ${processedExtractions}/${snapshot.extractionCount} 项`
    },
    {
      id: 5,
      label: "确认时间线",
      href: `/cases/${caseId}/timeline`,
      status: timelineStatus,
      note: snapshot.timelineCount === 0 ? "请先确认提取结果并生成时间线" : snapshot.confirmedTimelineCount === 0 ? "时间线草稿待确认" : `已确认 ${snapshot.confirmedTimelineCount}/${snapshot.timelineCount} 条事件`
    },
    {
      id: 6,
      label: "查看证据矩阵",
      href: `/cases/${caseId}/matrix`,
      status: matrixStatus,
      note: snapshot.matrixCount > 0 ? `已建立 ${snapshot.matrixCount} 项事实—证据关系` : snapshot.confirmedTimelineCount > 0 ? "可根据已确认事件生成" : "至少确认一条时间线事件后可生成"
    },
    {
      id: 7,
      label: "补充材料",
      href: `/cases/${caseId}/gaps`,
      status: gapsStatus,
      note: snapshot.matrixCount === 0 ? "生成矩阵后检查材料缺口" : snapshot.priorityGapCount > 0 ? `建议优先补充 ${snapshot.priorityGapCount} 项材料` : "未发现优先材料缺口"
    },
    {
      id: 8,
      label: "生成和下载",
      href: `/cases/${caseId}/downloads`,
      status: snapshot.exportCount > 0 ? "COMPLETED" : missingExportConditions.length ? "NOT_STARTED" : "IN_PROGRESS",
      note: snapshot.exportCount > 0 ? `已生成 ${snapshot.exportCount} 个文件` : missingExportConditions.length ? `还需：${missingExportConditions.join("、")}` : "可生成带完整性提示的草稿材料"
    }
  ];
}
