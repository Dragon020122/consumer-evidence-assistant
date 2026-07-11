"use client";export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="empty card"><h2>这一步暂时没有完成</h2><p>数据没有被自动丢弃。请检查网络或本地服务后重试。</p><button className="button" onClick={reset}>重试当前操作</button></div>}

