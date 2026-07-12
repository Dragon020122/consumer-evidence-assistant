import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { requireSession } from "@/server/auth";
import { confirmTimelineEvent } from "@/server/timeline";
import { toTimelineEventDTO } from "@/lib/dto";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    assertSameOrigin(request, getEnv().APP_URL);
    const actor = await requireSession(["USER", "ADMIN"]);
    return Response.json({ event: toTimelineEventDTO(confirmTimelineEvent(actor, (await params).eventId)) });
  } catch (error) {
    return errorResponse(error);
  }
}
