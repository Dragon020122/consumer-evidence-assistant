import { errorResponse } from "@/lib/errors";import { requireSession } from "@/server/auth";import { listExtractions } from "@/server/extraction";
export async function GET(_:Request,{params}:{params:Promise<{caseId:string}>}){try{const actor=await requireSession();return Response.json({extractions:listExtractions(actor,(await params).caseId)});}catch(error){return errorResponse(error)}}

