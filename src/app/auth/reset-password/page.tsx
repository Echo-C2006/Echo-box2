"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/Icons";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("重置令牌缺失");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "重置失败");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-slate-950">密码重置成功</h2>
        <p className="mt-2 text-sm text-slate-500">请使用新密码登录。</p>
        <Link
          href="/auth/login"
          className="mt-5 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">重置令牌</label>
        <input
          type="text"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="粘贴重置令牌"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">新密码</label>
        <input
          type="password"
          required
          minLength={6}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="至少 6 位"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? "重置中..." : "重置密码"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <BrandMark className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-black text-slate-950">重置密码</h1>
          <p className="mt-2 text-sm text-slate-500">输入重置令牌和新密码。</p>
        </div>
        <Suspense fallback={<p className="py-6 text-center text-sm text-slate-500">加载中...</p>}>
          <ResetForm />
        </Suspense>
        <p className="mt-5 text-center text-sm text-slate-600">
          <Link href="/auth/login" className="font-bold text-teal-700 hover:underline">返回登录</Link>
        </p>
      </div>
    </div>
  );
}
