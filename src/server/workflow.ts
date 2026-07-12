import { detectMaterialGaps } from "@/lib/gaps";
import { isConfirmedField, normalizeDetails } from "@/lib/field-state";
import { deriveWorkflow, type WorkflowSnapshot, type WorkflowStep } from "@/lib/workflow";
import type { SessionUser } from "@/server/auth";
import { getCaseForActor } from "@/server/cases";
import { listExtractions } from "@/server/extraction";
import { listMatrix } from "@/server/matrix";
import { listEvidence } from "@/server/storage";
import { listTimeline } from "@/server/timeline";
import { listGenerated } from "@/server/export";

const confirmedExtractionStates = new Set(["CONFIRMED", "MODIFIED", "AI_CONFIRMED"]);
const modifiedExtractionStates = new Set(["USER_EDITED"]);
const unableExtractionStates = new Set(["UNABLE_TO_CONFIRM", "DELETED"]);
const pendingExtractionStates = new Set(["PENDING", "AI_PENDING", "MANUAL_REQUIRED"]);

export interface CaseWorkflowState {
  snapshot: WorkflowSnapshot;
  steps: WorkflowStep[];
}

/**
 * The sole server-side source for the eight-step user workflow. Database case
 * status remains a processing/audit field and is deliberately not reused as UI
 * progress, preventing two drifting state machines.
 */
export function getCaseWorkflowState(actor: SessionUser, caseId: string): CaseWorkflowState {
  const item = getCaseForActor(actor, caseId);
  const details = normalizeDetails(JSON.parse(item.detailsJson));
  const evidence = listEvidence(actor, caseId);
  const extractions = listExtractions(actor, caseId);
  const timeline = listTimeline(actor, caseId);
  const matrix = listMatrix(actor, caseId);
  const gaps = detectMaterialGaps(evidence, extractions, timeline, details);
  const snapshot: WorkflowSnapshot = {
    fieldCount: Object.keys(details).length,
    confirmedFieldCount: Object.values(details).filter((field) => isConfirmedField(field.state)).length,
    fieldConflictCount: Object.values(details).filter((field) => field.state === "CONFLICT").length,
    evidenceCount: evidence.length,
    evidenceCategories: [...new Set(evidence.map((file) => file.category))],
    extractionCount: extractions.length,
    confirmedExtractionCount: extractions.filter((row) => confirmedExtractionStates.has(row.state)).length,
    modifiedExtractionCount: extractions.filter((row) => modifiedExtractionStates.has(row.state)).length,
    unableExtractionCount: extractions.filter((row) => unableExtractionStates.has(row.state)).length,
    conflictExtractionCount: extractions.filter((row) => row.state === "CONFLICT").length,
    pendingExtractionCount: extractions.filter((row) => pendingExtractionStates.has(row.state)).length,
    timelineCount: timeline.length,
    confirmedTimelineCount: timeline.filter((event) => Boolean(event.isConfirmed)).length,
    matrixCount: matrix.length,
    priorityGapCount: gaps.filter((gap) => gap.priority === "PRIORITY").length,
    exportCount: listGenerated(actor, caseId).length
  };
  return { snapshot, steps: deriveWorkflow(caseId, snapshot) };
}
