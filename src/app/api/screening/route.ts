import { errorResponse } from "@/lib/errors";
import { evaluateScreening } from "@/lib/screening";

export async function POST(request: Request) {
  try { return Response.json(evaluateScreening(await request.json())); }
  catch (error) { return errorResponse(error); }
}

