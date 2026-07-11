import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { clearSession, getSessionUser } from "@/server/auth";
import { audit } from "@/server/audit";

export async function POST(request: Request) {
  try { assertSameOrigin(request, getEnv().APP_URL); const user = await getSessionUser().catch(()=>null); if(user)audit(user, "AUTH_LOGOUT", "SESSION", null, "SUCCESS"); await clearSession(); return Response.json({ ok: true },{headers:{"Cache-Control":"no-store","Clear-Site-Data":"\"cache\""}}); }
  catch (error) { return errorResponse(error); }
}
