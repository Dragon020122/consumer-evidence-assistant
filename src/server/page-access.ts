import { redirect } from "next/navigation";
import type { Role } from "@/lib/schemas";
import { pageAccessRedirect } from "@/lib/access";
import { getSessionUser, type SessionUser } from "@/server/auth";

export async function requirePageRole(allowedRoles:Role[],currentPath:string):Promise<SessionUser>{const user=await getSessionUser();const destination=pageAccessRedirect(user?.role??null,allowedRoles,currentPath);if(destination)redirect(destination);return user!;}

