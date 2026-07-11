import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "材料整理助手｜预付式消费纠纷",
  description: "整理一般预付服务纠纷材料的脱敏测试版工具"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <AppHeader />
          <main className="main">{children}</main>
          <footer className="footer">测试版 · 仅整理材料，不提供法律结论，不保证投诉或退款结果</footer>
        </div>
      </body>
    </html>
  );
}
