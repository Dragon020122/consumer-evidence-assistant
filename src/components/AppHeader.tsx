import Link from "next/link";
import { navigationForRole } from "@/lib/access";
import { getSessionUser } from "@/server/auth";
import { AccountMenu } from "@/components/AccountMenu";

export async function AppHeader(){const user=await getSessionUser();const items=navigationForRole(user?.role??null);return <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">理</span><span>材料整理助手</span></Link><div className="topbar-actions"><nav className="nav" aria-label="主导航">{items.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>{user&&<AccountMenu email={user.email} displayName={user.displayName} role={user.role}/>}</div></header>}

