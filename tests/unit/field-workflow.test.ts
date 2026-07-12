import { describe, expect, it } from "vitest";
import { normalizeField } from "@/lib/field-state";
import { deriveWorkflow } from "@/lib/workflow";

const snapshot = (overrides: Record<string, unknown> = {}) => ({
  fieldCount: 11, confirmedFieldCount: 11, fieldConflictCount: 0,
  evidenceCount: 8, evidenceCategories: ["PAYMENT_ORDER", "CONTRACT", "REFUND_COMMUNICATION"],
  extractionCount: 18, confirmedExtractionCount: 0, modifiedExtractionCount: 0, unableExtractionCount: 0, conflictExtractionCount: 0, pendingExtractionCount: 18,
  timelineCount: 0, confirmedTimelineCount: 0, matrixCount: 0, priorityGapCount: 0, exportCount: 0,
  ...overrides
});

describe("字段状态与统一八步工作流", () => {
  it("兼容旧三态并区分填写与证据", () => {
    expect(normalizeField({ value: "虚构商家", state: "CONFIRMED" })).toMatchObject({ state: "USER_CONFIRMED", evidenceSupport: "USER_STATEMENT" });
    expect(normalizeField({ value: null, state: "PENDING" }).state).toBe("EMPTY");
    expect(normalizeField({ value: null, state: "UNKNOWN" }).state).toBe("UNABLE_TO_CONFIRM");
  });
  it("清空字段恢复待补充", () => expect(normalizeField({ value: null, state: "EMPTY", evidenceSupport: "NONE" })).toEqual({ value: null, state: "EMPTY", evidenceSupport: "NONE" }));
  it("八步状态把待确认、时间线、矩阵和缺口明确分开", () => {
    const initial = deriveWorkflow("case", snapshot());
    expect(initial[3]).toMatchObject({ status: "NEEDS_CONFIRMATION", note: "已处理 0/18 项" });
    expect(initial[4].status).toBe("NOT_STARTED");
    expect(initial[6].status).toBe("NOT_STARTED");
    expect(initial[7].note).toContain("至少确认一条时间线事件");
    const confirmed = deriveWorkflow("case", snapshot({ confirmedExtractionCount: 10, pendingExtractionCount: 0, timelineCount: 3, confirmedTimelineCount: 1, matrixCount: 3, priorityGapCount: 2 }));
    expect(confirmed[3].status).toBe("COMPLETED");
    expect(confirmed[4].status).toBe("COMPLETED");
    expect(confirmed[5].status).toBe("COMPLETED");
    expect(confirmed[6].status).toBe("NEEDS_SUPPLEMENT");
  });
});
