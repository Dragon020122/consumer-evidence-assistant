import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { requireSession } from "@/server/auth";
import { listEvidence, storeEvidence } from "@/server/storage";

export const runtime = "nodejs";
export async function GET(_: Request, context: { params: Promise<{ caseId: string }> }) {
  try { const actor = await requireSession(); const { caseId } = await context.params; return Response.json({ evidence: listEvidence(actor, caseId) }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request, context: { params: Promise<{ caseId: string }> }) {
  try {
    assertSameOrigin(request, getEnv().APP_URL); const actor = await requireSession(["USER", "ADMIN"]); const { caseId } = await context.params;
    const form = await request.formData(); const file = form.get("file"); const category = form.get("category");
    if (!(file instanceof File) || typeof category !== "string") throw new Error("缺少文件或分类");
    return Response.json({ evidence: await storeEvidence(actor, caseId, file, category as never) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

