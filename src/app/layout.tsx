import type { Metadata } from "next";

import { SiteNav } from "@/components/ui/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "唐氏杯 | Tangshi Cup",
    template: "%s | 唐氏杯",
  },
  description: "唐氏杯私人无畏契约赛事网站，支持选人、战力平衡、赛制推荐、趣味机制和赛季编年史。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">
        <div className="min-h-screen">
          <SiteNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
