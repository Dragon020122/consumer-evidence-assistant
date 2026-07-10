import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { sanitizeForLog } from "@/lib/logger";
import type { SessionUser } from "@/server/auth";

export function audit(
  actor: SessionUser | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  outcome: "SUCCESS" | "DENIED" | "FAILED",
  metadata: Record<string, unknown> = {}
): void {
  getDb().prepare(`INSERT INTO audit_logs
    (id, actor_id, actor_role, action, resource_type, resource_id, outcome, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), actor?.id ?? null, actor?.role ?? null, action, resourceType, resourceId, outcome, JSON.stringify(sanitizeForLog(metadata)), new Date().toISOString());
}

