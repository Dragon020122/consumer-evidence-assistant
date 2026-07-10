import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { clearSession, requireSession } from "@/server/auth";
import { audit } from "@/server/audit";

export async function POST(request: Request) {
  try { assertSameOrigin(request, getEnv().APP_URL); const user = await requireSession(); audit(user, "AUTH_LOGOUT", "SESSION", null, "SUCCESS"); await clearSession(); return Response.json({ ok: true }); }
  catch (error) { return errorResponse(error); }
}

