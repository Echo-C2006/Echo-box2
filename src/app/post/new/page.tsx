"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrophyIcon } from "@/components/Icons";

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
    skills: "",
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
    const skills = form.skills.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean);
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <TrophyIcon className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-950">发布招募</h1>
        <p className="mt-2 text-sm text-slate-600">说清楚目标、缺口和期待，赛搭会把信息展示给合适的队友。</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">选择竞赛 *</label>
            <select name="competitionId" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.competitionId} onChange={handleChange}>
              <option value="">请选择竞赛</option>
              {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">招募标题 *</label>
            <input type="text" name="title" required maxLength={100} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.title} onChange={handleChange} placeholder="如：数学建模校赛求队友，缺编程位" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">详细说明</label>
            <textarea name="description" rows={5} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.description} onChange={handleChange} placeholder="队伍现状、分工计划、期望队友、训练节奏等。" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">需求技能</label>
            <input type="text" name="skills" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.skills} onChange={handleChange} placeholder="Python, 数据分析, 论文写作" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">已有人数</label>
              <input type="number" name="currentSize" min={1} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.currentSize} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">目标人数</label>
              <input type="number" name="targetSize" min={1} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.targetSize} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">有效期</label>
              <select name="expiresDays" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.expiresDays} onChange={handleChange}>
                <option value="7">7 天</option>
                <option value="14">14 天</option>
                <option value="30">30 天</option>
              </select>
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
              <PlusIcon className="h-4 w-4" />
              {loading ? "发布中..." : "发布招募"}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              取消
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
