import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rm } from "node:fs/promises";
import { closeDb, getDb, migrate } from "@/lib/db";
import { evaluateScreening } from "@/lib/screening";
import type { CreateCaseInput } from "@/lib/schemas";
import type { SessionUser } from "@/server/auth";
import { createCase, getCaseForActor } from "@/server/cases";
import { deleteEvidence, listEvidence, storeEvidence } from "@/server/storage";

const owner: SessionUser = { id: "owner-a", email: "owner-a@test.local", displayName: "虚构用户甲", role: "USER" };
const other: SessionUser = { id: "owner-b", email: "owner-b@test.local", displayName: "虚构用户乙", role: "USER" };
const screeningInput = { disputeType: "GYM" as const, amountYuan: 2999, isConsumerService: true, merchantOperating: "YES" as const,
  hasPaymentRecord: true, hasContractOrChat: true, desiredOutcome: "整理材料", hasNegotiated: true, excludedArea: "NONE" as const };

function caseInput(): CreateCaseInput {
  const field = <T>(value: T) => ({ value, state: "CONFIRMED" as const });
  return {
    title: "虚构健身年卡退费",
    disputeType: "GYM",
    screening: evaluateScreening(screeningInput),
    details: {
      merchantLegalName: field("星云健康管理有限公司（虚构）"), storeName: field("星云健身中心（虚构）"), serviceName: field("年度健身服务"),
      paymentAmountYuan: field(2999), paymentDate: field("2026-01-15"), orderOrContractNumber: field("DEMO-2026-001"),
      usedAmountOrCount: field("4 次"), remainingAmountOrCount: field("8 个月（用户填写）"), firstRefundRequestDate: field("2026-05-20"),
      merchantResponse: field("表示暂不接受退费（虚构陈述）"), desiredResolution: field("整理材料并继续协商")
    }
  };
}

beforeEach(() => {
  closeDb(); migrate(); const db = getDb();
  for (const user of [owner, other]) db.prepare("INSERT INTO users (id,email,display_name,role,password_hash,created_at) VALUES (?,?,?,?,?,?)")
    .run(user.id, user.email, user.displayName, user.role, "test-only", new Date().toISOString());
});

afterEach(async () => { closeDb(); await rm(".data/test-storage", { recursive: true, force: true }); });

describe("案件与私有证据集成", () => {
  it("创建案件并阻止其他用户读取", () => {
    const item = createCase(owner, caseInput());
    expect(getCaseForActor(owner, item.id).title).toContain("虚构");
    expect(() => getCaseForActor(other, item.id)).toThrow("案件不存在或无权访问");
  });

  it("保存、查重并删除案件所有者的证据", async () => {
    const item = createCase(owner, caseInput());
    const bytes = new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,1,2,3]);
    const file = new File([bytes], "虚构付款记录.png", { type: "image/png" });
    const stored = await storeEvidence(owner, item.id, file, "PAYMENT_ORDER");
    expect(listEvidence(owner, item.id)).toHaveLength(1);
    await expect(storeEvidence(owner, item.id, file, "PAYMENT_ORDER")).rejects.toThrow("该文件已上传");
    await deleteEvidence(owner, stored.id);
    expect(listEvidence(owner, item.id)).toHaveLength(0);
  });
});

