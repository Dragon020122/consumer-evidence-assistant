import { getEnv } from "@/lib/env";import { errorResponse } from "@/lib/errors";import { assertSameOrigin } from "@/lib/security";import { requireSession } from "@/server/auth";import { confirmTimeline } from "@/server/timeline";
export async function POST(request:Request,{params}:{params:Promise<{caseId:string}>}){try{assertSameOrigin(request,getEnv().APP_URL);const actor=await requireSession(["USER","ADMIN"]);confirmTimeline(actor,(await params).caseId);return Response.json({ok:true});}catch(error){return errorResponse(error)}}

