import{getEnv}from"@/lib/env";import{errorResponse}from"@/lib/errors";import{assertSameOrigin}from"@/lib/security";import{requireSession}from"@/server/auth";import{deleteCaseData}from"@/server/deletion";
export async function DELETE(request:Request,{params}:{params:Promise<{caseId:string}>}){try{assertSameOrigin(request,getEnv().APP_URL);const actor=await requireSession(["USER","ADMIN"]);return Response.json({summary:await deleteCaseData(actor,(await params).caseId)});}catch(error){return errorResponse(error)}}

