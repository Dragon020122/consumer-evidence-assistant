import { z } from "zod";
import { toExtractedFieldDTO } from "@/lib/dto";
import { getEnv } from "@/lib/env";
import { errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/security";
import { requireSession } from "@/server/auth";
import { confirmAllDemoExtractions, regenerateDemoExtractions } from "@/server/demo";

const schema = z.object({ action: z.enum(["regenerate", "confirm-all"]) });

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    assertSameOrigin(request, getEnv().APP_URL);
    const actor = await requireSession(["USER"]);
    const { action } = schema.parse(await request.json());
    const caseId = (await params).caseId;
    const extractions = action === "regenerate"
      ? await regenerateDemoExtractions(actor, caseId)
      : confirmAllDemoExtractions(actor, caseId);
    return Response.json({ extractions: extractions.map(toExtractedFieldDTO) });
  } catch (error) {
    return errorResponse(error);
  }
}
