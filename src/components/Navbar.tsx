"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BrandMark,
  GridIcon,
  MenuIcon,
  MessageIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "@/components/Icons";

interface User {
  id: number;
  nickname: string;
  email: string;
}

const navLinks = [
  { href: "/square", label: "组队广场", icon: GridIcon },
  { href: "/talent", label: "人才库", icon: UsersIcon },
  { href: "/post/new", label: "发布招募", icon: PlusIcon },
  { href: "/messages", label: "消息", icon: MessageIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null));
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-lg font-black tracking-wide text-slate-950">赛搭</div>
            <div className="hidden text-[11px] font-medium text-slate-500 sm:block">智能竞赛组队</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive(link.href)
                    ? "bg-teal-50 text-teal-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/profile"
              className={`ml-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                isActive("/profile")
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              {user.nickname}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              登录
            </Link>
          )}
        </nav>

        <button
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="打开菜单"
        >
          {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive(link.href) ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                <UserIcon className="h-4 w-4" />
                我的主页
              </Link>
            ) : (
              <Link href="/auth/login" className="rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
