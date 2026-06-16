"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Competition {
  id: number;
  name: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    competitionId: "",
    title: "",
    description: "",
    skills: "" as string,
    currentSize: "1",
    targetSize: "3",
    expiresDays: "14",
  });

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(data.competitions || []));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const skills = form.skills
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        competitionId: Number(form.competitionId),
        currentSize: Number(form.currentSize),
        targetSize: Number(form.targetSize),
        expiresDays: Number(form.expiresDays),
        skills,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "发布失败");
      return;
    }

    router.push("/square");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-gray-900">发布招募帖</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">选择竞赛 *</label>
          <select
            name="competitionId"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.competitionId}
            onChange={handleChange}
          >
            <option value="">请选择</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">标题 *</label>
          <input
            type="text"
            name="title"
            required
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.title}
            onChange={handleChange}
            placeholder="如：数学建模求队友，缺编程位"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">详细描述</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.description}
            onChange={handleChange}
            placeholder="队伍现状、分工计划、对队友的期望..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">需求技能（用逗号分隔）</label>
          <input
            type="text"
            name="skills"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={form.skills}
            onChange={handleChange}
            placeholder="Python, 数据分析, 论文写作"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">已有几人</label>
            <input
              type="number"
              name="currentSize"
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.currentSize}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">共需几人</label>
            <input
              type="number"
              name="targetSize"
              min={1}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.targetSize}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">有效期</label>
            <select
              name="expiresDays"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.expiresDays}
              onChange={handleChange}
            >
              <option value="7">7天</option>
              <option value="14">14天</option>
              <option value="30">30天</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "发布中..." : "发布"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
