import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "竞赛组队工具",
  description: "帮助在校学生找到学科竞赛队友",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
