import type { SessionUser } from "@/server/auth";
import { getCaseForActor } from "@/server/cases";
import { getCaseWorkflowState } from "@/server/workflow";
import { WorkflowNav } from "@/components/WorkflowNav";

export function CaseWorkflow({ actor, caseId }: { actor: SessionUser; caseId: string }) {
  const item = getCaseForActor(actor, caseId);
  const { steps } = getCaseWorkflowState(actor, caseId);
  return <WorkflowNav steps={steps} isDemo={Boolean(item.isDemo)} />;
}
