import { z } from "zod";

export const extractionFieldNames = [
  "date", "time", "amount", "merchantName", "storeName", "payer", "payee", "orderNumber", "contractNumber",
  "serviceName", "serviceCount", "remainingCount", "merchantPromise", "refundRequest", "merchantResponse", "participants", "summary"
] as const;

export const extractedFieldSchema = z.object({
  fieldName: z.enum(extractionFieldNames),
  value: z.union([z.string(), z.number()]).nullable(),
  evidenceId: z.string().uuid(),
  sourcePageOrImage: z.string().min(1).max(100),
  sourceLocator: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
  needsHumanConfirmation: z.boolean()
}).superRefine((field, context) => {
  if (field.value === null && !field.needsHumanConfirmation) {
    context.addIssue({ code: "custom", message: "空值必须进入人工确认" });
  }
});

export const extractionPayloadSchema = z.object({
  evidenceId: z.string().uuid(),
  classification: z.string().min(1).max(100),
  fields: z.array(extractedFieldSchema).max(100),
  requiresManualProcessing: z.boolean(),
  provider: z.string().min(1).max(50)
});
export type ExtractionPayload = z.infer<typeof extractionPayloadSchema>;

export function parseMoney(text: string): number | null {
  const normalized = text.replace(/[,，\s]/g, "");
  const match = normalized.match(/(?:人民币|¥|￥)?(\d+(?:\.\d{1,2})?)(?:元|RMB|CNY)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 0 && value <= 10_000_000 ? Math.round(value * 100) / 100 : null;
}

export function parseDate(text: string): string | null {
  const match = text.match(/(20\d{2})[年\-/.](\d{1,2})[月\-/.](\d{1,2})日?/);
  if (!match) return null;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function locate(text: string, value: string): string {
  const index = text.indexOf(value);
  return index < 0 ? "未定位" : `字符 ${index + 1}-${index + value.length}`;
}

