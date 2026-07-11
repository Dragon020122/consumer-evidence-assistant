import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { requireSession } from "@/server/auth";
import {z}from"zod";import{evidenceCategories}from"@/lib/schemas";import { deleteEvidence, readEvidence,updateEvidenceMetadata } from "@/server/storage";

export const runtime = "nodejs";
export async function GET(_: Request, context: { params: Promise<{ evidenceId: string }> }) {
  try {
    const actor = await requireSession(); const { evidenceId } = await context.params; const { row, bytes } = await readEvidence(actor, evidenceId);
    return new Response(new Blob([new Uint8Array(bytes)]), { headers: { "Content-Type": row.mimeType, "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.originalName)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request, context: { params: Promise<{ evidenceId: string }> }) {
  try { assertSameOrigin(request, getEnv().APP_URL); const actor = await requireSession(["USER", "ADMIN"]); const { evidenceId } = await context.params; await deleteEvidence(actor, evidenceId); return Response.json({ ok: true }); }
  catch (error) { return errorResponse(error); }
}
const patchSchema=z.object({originalName:z.string().trim().min(1).max(255),category:z.enum(evidenceCategories)});export async function PATCH(request:Request,context:{params:Promise<{evidenceId:string}>}){try{assertSameOrigin(request,getEnv().APP_URL);const actor=await requireSession(["USER","ADMIN"]);return Response.json({evidence:updateEvidenceMetadata(actor,(await context.params).evidenceId,patchSchema.parse(await request.json()))});}catch(error){return errorResponse(error)}}
