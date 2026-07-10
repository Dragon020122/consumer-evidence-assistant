import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { authenticate, createSession } from "@/server/auth";
import { audit } from "@/server/audit";
import { z } from "zod";

const inputSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request, getEnv().APP_URL); const input = inputSchema.parse(await request.json());
    const user = await authenticate(input.email, input.password); await createSession(user); audit(user, "AUTH_LOGIN", "SESSION", null, "SUCCESS");
    return Response.json({ user });
  } catch (error) { return errorResponse(error); }
}

