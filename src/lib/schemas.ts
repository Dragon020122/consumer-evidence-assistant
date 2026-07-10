import { z } from "zod";

export const roles = ["USER", "REVIEWER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export const disputeTypes = ["GYM", "BEAUTY", "TRAINING", "PHOTOGRAPHY", "PET", "HOUSEKEEPING", "OTHER"] as const;

export const screeningInputSchema = z.object({
  disputeType: z.enum(disputeTypes),
  amountYuan: z.coerce.number().min(0).max(10_000_000).nullable(),
  isConsumerService: z.boolean(),
  merchantOperating: z.enum(["YES", "NO", "UNKNOWN"]),
  hasPaymentRecord: z.boolean(),
  hasContractOrChat: z.boolean(),
  desiredOutcome: z.string().trim().min(1).max(500),
  hasNegotiated: z.boolean(),
  excludedArea: z.enum(["NONE", "MEDICAL", "FINANCE", "LABOR", "CRIMINAL", "SERIOUS_INJURY", "OTHER_EXCLUDED"])
});

export const screeningResultSchema = z.object({
  eligible: z.boolean(),
  reasons: z.array(z.string()),
  suggestedMaterials: z.array(z.string()),
  safetyNotice: z.string().nullable(),
  boundary: z.string()
});
export type ScreeningInput = z.infer<typeof screeningInputSchema>;
export type ScreeningResult = z.infer<typeof screeningResultSchema>;

export const fieldStateSchema = z.enum(["CONFIRMED", "PENDING", "UNKNOWN"]);
const statedField = <T extends z.ZodType>(value: T) => z.object({ value: value.nullable(), state: fieldStateSchema });

export const caseDetailsSchema = z.object({
  merchantLegalName: statedField(z.string().trim().max(200)),
  storeName: statedField(z.string().trim().max(200)),
  serviceName: statedField(z.string().trim().max(200)),
  paymentAmountYuan: statedField(z.number().min(0).max(10_000_000)),
  paymentDate: statedField(z.string().date()),
  orderOrContractNumber: statedField(z.string().trim().max(100)),
  usedAmountOrCount: statedField(z.string().trim().max(100)),
  remainingAmountOrCount: statedField(z.string().trim().max(100)),
  firstRefundRequestDate: statedField(z.string().date()),
  merchantResponse: statedField(z.string().trim().max(2000)),
  desiredResolution: statedField(z.string().trim().max(1000))
});

export const createCaseSchema = z.object({
  title: z.string().trim().min(2).max(100),
  disputeType: z.enum(disputeTypes),
  screening: screeningResultSchema.refine((value) => value.eligible, "不适用案件不能进入自动整理流程"),
  details: caseDetailsSchema
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const evidenceCategories = [
  "PAYMENT_ORDER", "CONTRACT", "PROMISE", "REFUND_COMMUNICATION", "SERVICE_USAGE", "MERCHANT_STATUS", "USER_STATEMENT", "OTHER"
] as const;
export const evidenceCategorySchema = z.enum(evidenceCategories);
export type EvidenceCategory = z.infer<typeof evidenceCategorySchema>;

