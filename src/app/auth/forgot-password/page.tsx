"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/Icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [debugToken, setDebugToken] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "请求失败");
      return;
    }
    setSent(true);
    if (data.debugToken) {
      setDebugToken(data.debugToken);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <BrandMark className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-black text-slate-950">忘记密码</h1>
          <p className="mt-2 text-sm text-slate-500">输入注册邮箱，我们将发送密码重置链接。</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">邮件已发送</p>
            <p className="mt-1 text-sm text-slate-500">如果该邮箱已注册，重置链接已发送。</p>

            {debugToken && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left">
                <p className="mb-1 text-xs font-bold text-slate-500">开发模式 - 重置令牌</p>
                <p className="break-all font-mono text-xs text-slate-700">{debugToken}</p>
                <Link
                  href={`/auth/reset-password?token=${debugToken}`}
                  className="mt-3 inline-block rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700"
                >
                  前往重置密码
                </Link>
              </div>
            )}

            <p className="mt-5 text-center text-sm text-slate-600">
              <Link href="/auth/login" className="font-bold text-teal-700 hover:underline">返回登录</Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">注册邮箱</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? "发送中..." : "发送重置链接"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-600">
              想起密码了？
              <Link href="/auth/login" className="font-bold text-teal-700 hover:underline">返回登录</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
