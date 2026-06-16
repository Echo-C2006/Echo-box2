"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  nickname: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null));
  }, []);

  const navLinks = [
    { href: "/square", label: "广场" },
    { href: "/talent", label: "人才库" },
    { href: "/post/new", label: "+ 发帖" },
    { href: "/messages", label: "消息" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/square" className="text-lg font-bold text-indigo-600">
          竞赛组队
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/profile"
              className={`ml-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/profile")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {user.nickname}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              登录
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                我的 ({user.nickname})
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
