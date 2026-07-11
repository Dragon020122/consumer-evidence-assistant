import type { Role } from "@/lib/schemas";

export interface NavigationItem { href:string; label:string }

export const roleLabels:Record<Role,string>={USER:"普通用户",REVIEWER:"人工复核员",ADMIN:"管理员"};
const publicItems:NavigationItem[]=[{href:"/about",label:"服务说明"},{href:"/privacy",label:"隐私与边界"}];
const roleItems:Record<Role,NavigationItem[]>={
  USER:[{href:"/screening",label:"开始整理"},{href:"/dashboard",label:"我的案件"}],
  REVIEWER:[{href:"/review",label:"复核工作台"}],
  ADMIN:[{href:"/admin",label:"管理后台"},{href:"/review",label:"复核工作台"}]
};
const roleHomes:Record<Role,string>={USER:"/dashboard",REVIEWER:"/review",ADMIN:"/admin"};

export function navigationForRole(role:Role|null):NavigationItem[]{return role?[...publicItems,...roleItems[role]]:[...publicItems,{href:"/screening",label:"开始整理"},{href:"/login",label:"登录"}];}
export function defaultPathForRole(role:Role):string{return roleHomes[role];}
function cleanPath(value:string):string|null{if(!value.startsWith("/")||value.startsWith("//"))return null;return value.split(/[?#]/,1)[0]||"/";}
export function isPathAllowedForRole(role:Role,path:string):boolean{const clean=cleanPath(path);if(!clean)return false;if(["/","/about","/privacy","/screening"].includes(clean))return true;if(role==="USER")return clean==="/dashboard"||clean==="/cases/new"||clean.startsWith("/cases/");if(role==="REVIEWER")return clean==="/review"||clean.startsWith("/review/")||(clean.startsWith("/cases/")&&!clean.startsWith("/cases/new"));return clean==="/admin"||clean.startsWith("/admin/")||clean==="/review"||clean.startsWith("/review/")||clean.startsWith("/cases/");}
export function postLoginPath(role:Role,requested?:string|null):string{return requested&&isPathAllowedForRole(role,requested)?requested:defaultPathForRole(role);}
export function deniedPageDestination(role:Role,attemptedPath:string):string{let notice="role-access-denied";if(role==="REVIEWER"&&attemptedPath.startsWith("/cases/new"))notice="reviewer-cannot-create";else if(role==="USER"&&attemptedPath.startsWith("/review"))notice="user-cannot-review";else if(role!=="ADMIN"&&attemptedPath.startsWith("/admin"))notice="admin-only";return `${defaultPathForRole(role)}?notice=${notice}`;}
export function pageAccessRedirect(role:Role|null,allowedRoles:Role[],currentPath:string):string|null{if(!role)return `/login?next=${encodeURIComponent(currentPath)}`;return allowedRoles.includes(role)?null:deniedPageDestination(role,currentPath);}
export function accessNoticeMessage(code?:string):string|null{return({"reviewer-cannot-create":"当前账号为人工复核员，不能创建消费纠纷案件，已为你返回复核工作台。","user-cannot-review":"当前账号为普通用户，不能进入人工复核工作台，已为你返回我的案件。","admin-only":"当前账号不能进入管理后台，已返回你的工作台。","role-access-denied":"当前账号没有访问该页面的权限，已返回你的工作台。","logged-out":"你已安全退出登录。"}as Record<string,string>)[code??""]??null;}
