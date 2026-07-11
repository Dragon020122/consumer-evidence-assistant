import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_PATH: z.string().default(".data/prepaid-refund.db"),
  PRIVATE_STORAGE_PATH: z.string().default("storage/private"),
  GENERATED_STORAGE_PATH: z.string().default("storage/generated"),
  DEV_AUTH_ENABLED: z.enum(["true", "false"]).default("false"),
  DEV_AUTH_SECRET: z.string().min(32).optional(),
  DEV_USER_PASSWORD: z.string().min(8).optional(),
  DEV_REVIEWER_PASSWORD: z.string().min(8).optional(),
  DEV_ADMIN_PASSWORD: z.string().min(8).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  EXTRACTION_PROVIDER: z.enum(["mock", "external"]).default("mock"),
  OCR_PROVIDER: z.enum(["mock", "external"]).default("mock"),
  MODEL_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  MODEL_REDACTION_ENABLED: z.enum(["true", "false"]).default("true"),
  PDF_FONT_PATH: z.string().optional(),
  RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  MAX_UPLOAD_BYTES: z.coerce.number().int().min(1024).max(25 * 1024 * 1024).default(10 * 1024 * 1024),
  MAX_FILES_PER_CASE: z.coerce.number().int().min(1).max(100).default(30),
  MAX_EXPORT_SOURCE_BYTES: z.coerce.number().int().min(1024).max(500 * 1024 * 1024).default(100 * 1024 * 1024)
});

export type AppEnv = z.infer<typeof schema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const value = schema.parse(source);
  if (value.NODE_ENV === "production" && value.DEV_AUTH_ENABLED === "true") {
    throw new Error("生产环境禁止启用开发登录");
  }
  return value;
}
