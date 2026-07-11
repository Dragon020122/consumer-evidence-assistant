import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { evidenceCategorySchema, type EvidenceCategory } from "@/lib/schemas";
import { safeStorageSegment, sha256 } from "@/lib/security";
import type { SessionUser } from "@/server/auth";
import { audit } from "@/server/audit";
import { getCaseForActor } from "@/server/cases";

const allowed: Record<string, { extensions: string[]; signatures?: number[][] }> = {
  "image/jpeg": { extensions: [".jpg", ".jpeg"], signatures: [[0xff, 0xd8, 0xff]] },
  "image/png": { extensions: [".png"], signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  "image/webp": { extensions: [".webp"], signatures: [[0x52, 0x49, 0x46, 0x46]] },
  "application/pdf": { extensions: [".pdf"], signatures: [[0x25, 0x50, 0x44, 0x46, 0x2d]] },
  "text/plain": { extensions: [".txt"] }
};

export interface EvidenceRow {
  id: string; caseId: string; originalName: string; storageKey: string; mimeType: string; byteSize: number; sha256: string; category: string; status: string; createdAt: string;
}

function rootPath(): string { return resolve(getEnv().PRIVATE_STORAGE_PATH); }
function absolutePath(storageKey: string): string {
  const target = resolve(rootPath(), ...storageKey.split("/").map(safeStorageSegment));
  if (!target.startsWith(`${rootPath()}${process.platform === "win32" ? "\\" : "/"}`)) throw new AppError("INVALID_PATH", "无效的文件路径", 400);
  return target;
}
function matches(bytes: Uint8Array, signature: number[]): boolean { return signature.every((value, index) => bytes[index] === value); }

export function validateUpload(file: File, bytes: Uint8Array): void {
  const env = getEnv(); const config = allowed[file.type]; const extension = extname(file.name).toLowerCase();
  if (!config || !config.extensions.includes(extension)) throw new AppError("UNSUPPORTED_FILE", "仅支持 JPG、JPEG、PNG、WebP、PDF 和 TXT", 415);
  if (file.size < 1 || file.size > env.MAX_UPLOAD_BYTES) throw new AppError("FILE_SIZE", `单个文件必须小于 ${Math.floor(env.MAX_UPLOAD_BYTES / 1024 / 1024)}MB`, 413);
  if (config.signatures && !config.signatures.some((signature) => matches(bytes, signature))) throw new AppError("FILE_SIGNATURE", "文件内容与声明类型不一致", 415);
  if (file.type === "image/webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") throw new AppError("FILE_SIGNATURE", "WebP 文件签名无效", 415);
  if (file.type === "text/plain" && bytes.includes(0)) throw new AppError("MALICIOUS_FILE", "文本文件包含不支持的二进制内容", 415);
}

export async function storeEvidence(actor: SessionUser, caseId: string, file: File, rawCategory: EvidenceCategory): Promise<EvidenceRow> {
  const ownerCase = getCaseForActor(actor, caseId);
  if (actor.role !== "ADMIN" && ownerCase.ownerId !== actor.id) throw new AppError("FORBIDDEN", "只有案件所有者可以上传证据", 403);
  const category = evidenceCategorySchema.parse(rawCategory); const bytes = new Uint8Array(await file.arrayBuffer());
  validateUpload(file, bytes);
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) AS count FROM evidence WHERE case_id = ?").get(caseId) as { count: number }).count;
  if (count >= getEnv().MAX_FILES_PER_CASE) throw new AppError("FILE_LIMIT", "案件文件数量已达上限", 409);
  const digest = sha256(bytes);
  if (db.prepare("SELECT id FROM evidence WHERE case_id = ? AND sha256 = ?").get(caseId, digest)) throw new AppError("DUPLICATE_FILE", "该文件已上传", 409);
  const id = randomUUID(); const storageKey = `${safeStorageSegment(caseId)}/${id}`;
  const target = absolutePath(storageKey); await mkdir(dirname(target), { recursive: true }); await writeFile(target, bytes, { flag: "wx" });
  try {
    db.prepare(`INSERT INTO evidence (id, case_id, original_name, storage_key, mime_type, byte_size, sha256, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED', ?)`
    ).run(id, caseId, file.name.slice(0, 255), storageKey, file.type, file.size, digest, category, new Date().toISOString());
    db.prepare("UPDATE cases SET status = 'PENDING_EXTRACTION', updated_at = ? WHERE id = ?").run(new Date().toISOString(), caseId);
  } catch (error) { await rm(target, { force: true }); throw error; }
  audit(actor, "EVIDENCE_UPLOADED", "EVIDENCE", id, "SUCCESS", { caseId, mimeType: file.type, byteSize: file.size });
  return getEvidenceForActor(actor, id);
}

export function listEvidence(actor: SessionUser, caseId: string): EvidenceRow[] {
  getCaseForActor(actor, caseId);
  return getDb().prepare(`SELECT id, case_id AS caseId, original_name AS originalName, storage_key AS storageKey, mime_type AS mimeType,
    byte_size AS byteSize, sha256, category, status, created_at AS createdAt FROM evidence WHERE case_id = ? ORDER BY created_at`).all(caseId) as unknown as EvidenceRow[];
}

export function getEvidenceForActor(actor: SessionUser, evidenceId: string): EvidenceRow {
  const row = getDb().prepare(`SELECT id, case_id AS caseId, original_name AS originalName, storage_key AS storageKey, mime_type AS mimeType,
    byte_size AS byteSize, sha256, category, status, created_at AS createdAt FROM evidence WHERE id = ?`).get(evidenceId) as unknown as EvidenceRow | undefined;
  if (!row) throw new AppError("EVIDENCE_NOT_FOUND", "文件不存在", 404);
  getCaseForActor(actor, row.caseId); return row;
}

export async function readEvidence(actor: SessionUser, evidenceId: string): Promise<{ row: EvidenceRow; bytes: Buffer }> {
  const row = getEvidenceForActor(actor, evidenceId); return { row, bytes: await readFile(absolutePath(row.storageKey)) };
}

export async function deleteEvidence(actor: SessionUser, evidenceId: string): Promise<void> {
  const row = getEvidenceForActor(actor, evidenceId); const ownerCase = getCaseForActor(actor, row.caseId);
  if (actor.role !== "ADMIN" && ownerCase.ownerId !== actor.id) throw new AppError("FORBIDDEN", "只有案件所有者可以删除证据", 403);
  getDb().prepare("DELETE FROM evidence WHERE id = ?").run(evidenceId); await rm(absolutePath(row.storageKey), { force: true });
  audit(actor, "EVIDENCE_DELETED", "EVIDENCE", evidenceId, "SUCCESS", { caseId: row.caseId });
}

export async function deleteEvidenceStorageKeys(storageKeys: string[]): Promise<void> {
  for (const key of storageKeys) await rm(absolutePath(key), { force: true });
}
