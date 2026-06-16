"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    grade: "",
    major: "",
  });
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
    <div className="mx-auto mt-12 max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-900">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">邮箱</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.password}
            onChange={handleChange}
            placeholder="至少6位"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">昵称</label>
          <input
            type="text"
            name="nickname"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.nickname}
            onChange={handleChange}
            placeholder="怎么称呼你"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">年级</label>
            <input
              type="text"
              name="grade"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.grade}
              onChange={handleChange}
              placeholder="如：大三"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">专业</label>
            <input
              type="text"
              name="major"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.major}
              onChange={handleChange}
              placeholder="如：计算机"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        已有账号？{" "}
        <Link href="/auth/login" className="text-indigo-600 hover:underline">
          直接登录
        </Link>
      </p>
    </div>
  );
}
