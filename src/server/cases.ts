import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createCaseSchema, type CreateCaseInput } from "@/lib/schemas";
import type { SessionUser } from "@/server/auth";
import { audit } from "@/server/audit";

export interface CaseRow {
  id: string; ownerId: string; assignedReviewerId: string | null; title: string; disputeType: string; status: string;
  eligibilityJson: string; detailsJson: string; timelineConfirmedAt: string | null; expiresAt: string; createdAt: string; updatedAt: string;
}

const selectFields = `id, owner_id AS ownerId, assigned_reviewer_id AS assignedReviewerId, title, dispute_type AS disputeType,
 status, eligibility_json AS eligibilityJson, details_json AS detailsJson, timeline_confirmed_at AS timelineConfirmedAt,
 expires_at AS expiresAt, created_at AS createdAt, updated_at AS updatedAt`;

export function createCase(owner: SessionUser, raw: CreateCaseInput): CaseRow {
  if (owner.role !== "USER" && owner.role !== "ADMIN") throw new AppError("FORBIDDEN", "当前角色不能创建案件", 403);
  const input = createCaseSchema.parse(raw);
  const id = randomUUID(); const now = new Date();
  const expiresAt = new Date(now.getTime() + getEnv().RETENTION_DAYS * 86_400_000).toISOString();
  getDb().prepare(`INSERT INTO cases
    (id, owner_id, title, dispute_type, status, eligibility_json, details_json, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'PENDING_UPLOAD', ?, ?, ?, ?, ?)`
  ).run(id, owner.id, input.title, input.disputeType, JSON.stringify(input.screening), JSON.stringify(input.details), expiresAt, now.toISOString(), now.toISOString());
  audit(owner, "CASE_CREATED", "CASE", id, "SUCCESS");
  return getCaseForActor(owner, id);
}

export function listCasesForActor(actor: SessionUser): CaseRow[] {
  const db = getDb();
  if (actor.role === "ADMIN") return db.prepare(`SELECT ${selectFields} FROM cases ORDER BY updated_at DESC`).all() as unknown as CaseRow[];
  if (actor.role === "REVIEWER") return db.prepare(`SELECT ${selectFields} FROM cases WHERE assigned_reviewer_id = ? ORDER BY updated_at DESC`).all(actor.id) as unknown as CaseRow[];
  return db.prepare(`SELECT ${selectFields} FROM cases WHERE owner_id = ? ORDER BY updated_at DESC`).all(actor.id) as unknown as CaseRow[];
}

export function getCaseForActor(actor: SessionUser, caseId: string): CaseRow {
  const row = getDb().prepare(`SELECT ${selectFields} FROM cases WHERE id = ?`).get(caseId) as unknown as CaseRow | undefined;
  const allowed = row && (actor.role === "ADMIN" || row.ownerId === actor.id || (actor.role === "REVIEWER" && row.assignedReviewerId === actor.id));
  if (!allowed) {
    audit(actor, "CASE_READ", "CASE", caseId, "DENIED");
    throw new AppError("CASE_NOT_FOUND", "案件不存在或无权访问", 404);
  }
  if (actor.role === "ADMIN" || actor.role === "REVIEWER") audit(actor, "CASE_READ", "CASE", caseId, "SUCCESS");
  return row;
}

export const caseStatuses = ["DRAFT","PENDING_UPLOAD","PENDING_EXTRACTION","EXTRACTING","PENDING_USER_CONFIRMATION","PENDING_TIMELINE_CONFIRMATION","PENDING_GENERATION","PENDING_MANUAL_REVIEW","WAITING_MORE_MATERIALS","COMPLETED","CLOSED","PENDING_DELETION","DELETED"] as const;
