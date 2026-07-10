import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { requireSession } from "@/server/auth";
import { createCase, listCasesForActor } from "@/server/cases";

export async function GET() {
  try { const actor = await requireSession(); return Response.json({ cases: listCasesForActor(actor) }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { assertSameOrigin(request, getEnv().APP_URL); const actor = await requireSession(["USER", "ADMIN"]); return Response.json({ case: createCase(actor, await request.json()) }, { status: 201 }); }
  catch (error) { return errorResponse(error); }
}

