"use client";
import Link from "next/link";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="empty card"><h2>这一步暂时没有完成</h2><p>当前操作未完成，但已有数据不会因此自动删除。请重试；如果是演示案件初始化，请返回“我的案件”查看具体错误编号和恢复入口。</p>{process.env.NODE_ENV!=="production"&&error.digest&&<p className="muted">错误编号：{error.digest}</p>}<div className="actions"><button className="button" onClick={reset}>重试当前操作</button><Link className="button secondary" href="/dashboard">返回我的案件</Link></div></div>}
