"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/Icons";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", nickname: "", grade: "", major: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "注册失败");
      return;
    }
    router.push("/square");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <BrandMark className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-black text-slate-950">创建赛搭账号</h1>
          <p className="mt-2 text-sm text-slate-500">建立你的竞赛画像，方便队友快速判断匹配度。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">邮箱</label>
            <input type="email" name="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.email} onChange={handleChange} placeholder="your@email.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">密码</label>
            <input type="password" name="password" required minLength={6} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.password} onChange={handleChange} placeholder="至少 6 位" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">昵称</label>
            <input type="text" name="nickname" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.nickname} onChange={handleChange} placeholder="队友如何称呼你" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">年级</label>
              <input type="text" name="grade" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.grade} onChange={handleChange} placeholder="如：大三" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">专业</label>
              <input type="text" name="major" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.major} onChange={handleChange} placeholder="如：计算机" />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
            {loading ? "注册中..." : "注册并进入"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          已有账号？
          <Link href="/auth/login" className="font-bold text-teal-700 hover:underline">直接登录</Link>
        </p>
      </div>
    </div>
  );
}
