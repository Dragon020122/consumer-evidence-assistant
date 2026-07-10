import { getEnv } from "@/lib/env";import { errorResponse } from "@/lib/errors";import { assertSameOrigin } from "@/lib/security";import { requireSession } from "@/server/auth";import { extractCase } from "@/server/extraction";
export const runtime="nodejs";export async function POST(request:Request,{params}:{params:Promise<{caseId:string}>}){try{assertSameOrigin(request,getEnv().APP_URL);const actor=await requireSession(["USER","ADMIN"]);return Response.json({extractions:await extractCase(actor,(await params).caseId)});}catch(error){return errorResponse(error)}}

