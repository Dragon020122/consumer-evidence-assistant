import{getEnv}from"@/lib/env";import{errorResponse}from"@/lib/errors";import{assertSameOrigin}from"@/lib/security";import{requireSession}from"@/server/auth";import{activateTestOrder}from"@/server/plans";
export async function POST(request:Request,{params}:{params:Promise<{orderId:string}>}){try{assertSameOrigin(request,getEnv().APP_URL);const admin=await requireSession(["ADMIN"]);activateTestOrder(admin,(await params).orderId);return Response.json({ok:true});}catch(error){return errorResponse(error)}}

