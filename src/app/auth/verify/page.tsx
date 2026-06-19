"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark, UserIcon } from "@/components/Icons";

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realName, setRealName] = useState("");
  const [school, setSchool] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.idVerified) {
            setSuccess(true);
          }
        } else {
          router.push("/auth/login?redirect=/auth/verify");
        }
        setLoading(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/auth/verify-identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realName, school, studentId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "认证失败");
      return;
    }
    setSuccess(true);
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">加载中...</p>;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-950">实名认证成功</h1>
          {user?.realName && (
            <p className="mt-2 text-sm text-slate-500">
              {user.realName} · {user.school} · {user.studentId}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">你的身份信息已通过认证。</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/profile" className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
              返回个人主页
            </Link>
            <Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              回到首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7 text-center">
          <BrandMark className="mx-auto mb-3 h-12 w-12" />
          <h1 className="text-2xl font-black text-slate-950">实名认证</h1>
          <p className="mt-2 text-sm text-slate-500">认证后队友可见你的真实姓名和学校，提升可信度。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">真实姓名</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="请输入真实姓名"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">学校</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="如：浙江大学"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">学号</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="请输入学号"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? "提交中..." : "提交认证"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          <Link href="/profile" className="font-bold text-teal-700 hover:underline">稍后再说</Link>
        </p>
      </div>
    </div>
  );
}
