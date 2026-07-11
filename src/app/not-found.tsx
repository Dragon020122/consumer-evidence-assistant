import Link from"next/link";export default function NotFound(){return <div className="empty card"><h1 className="page-title">未找到可访问的内容</h1><p>资源不存在，或当前账号没有访问权限。</p><Link className="button" href="/dashboard">返回工作台</Link></div>}

