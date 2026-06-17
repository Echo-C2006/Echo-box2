"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SparkIcon, TrophyIcon, UserIcon, UsersIcon } from "@/components/Icons";

interface TeamDetail {
  id: number;
  name: string;
  status: string;
  announcement: string | null;
  progress: string | null;
  externalLinks: string | null;
  post: { id: number; title: string; targetSize: number; currentSize: number; competition: { id: number; name: string }; author: { id: number; nickname: string } };
  members: { role: string; skills: string | null; user: { id: number; nickname: string; grade: string | null; major: string | null } }[];
}

interface ApplicationItem {
  id: number;
  status: string;
  reason: string;
  createdAt: string;
  applicant: { id: number; nickname: string; avatar: string | null; grade: string | null; major: string | null; skills: string | null; bio: string | null };
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}

const statusMap: Record<string, string> = {
  recruiting: "招募中",
  preparing: "备赛中",
  competing: "比赛中",
  finished: "已完赛",
};

export default function TeamPage() {
  const params = useParams();
  const id = params.id as string;
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", status: "", announcement: "", progress: "" });
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  async function fetchTeam() {
    const data = await fetch(`/api/teams/${id}`).then((r) => (r.ok ? r.json() : null));
    if (data?.team) {
      setTeam(data.team);
      setForm({ name: data.team.name, status: data.team.status, announcement: data.team.announcement || "", progress: data.team.progress || "" });
    }
    setLoading(false);
  }

  async function fetchApplications() {
    const res = await fetch(`/api/applications?teamId=${id}`);
    if (res.ok) setApplications((await res.json()).applications || []);
  }

  useEffect(() => {
    if (id) fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!team || !currentUserId) return;
    const captain = team.members.some((m) => m.user.id === currentUserId && m.role === "captain");
    setIsCaptain(captain);
    if (captain) fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, currentUserId]);

  async function handleSave() {
    const res = await fetch(`/api/teams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchTeam();
      setEditMode(false);
    } else alert("保存失败");
  }

  async function handleApplication(applicationId: number, action: "accept" | "reject") {
    setProcessingId(applicationId);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setProcessingId(null);
    if (res.ok) {
      await Promise.all([fetchApplications(), fetchTeam()]);
    } else {
      const err = await res.json();
      alert(err.error || "操作失败");
    }
  }

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">正在加载...</p>;
  if (!team) return <p className="py-12 text-center text-sm text-red-500">队伍不存在</p>;

  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href={`/post/${team.post.id}`} className="mb-5 inline-block text-sm font-bold text-teal-700 hover:underline">返回招募详情</Link>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {editMode ? (
                <input className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-2xl font-black text-white outline-none" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              ) : (
                <h1 className="text-3xl font-black">{team.name}</h1>
              )}
              <p className="mt-2 text-sm text-slate-300">参赛：{team.post.competition.name} · 队长：{team.post.author.nickname}</p>
            </div>
            <span className="rounded-xl bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950">{statusMap[team.status] || team.status}</span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_18rem]">
          <section className="space-y-6">
            {isCaptain && (
              <div className="flex gap-2">
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">编辑队伍信息</button>
                ) : (
                  <>
                    <button onClick={handleSave} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">保存</button>
                    <button onClick={() => setEditMode(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">取消</button>
                  </>
                )}
              </div>
            )}

            {editMode && (
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">状态</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="recruiting">招募中</option>
                    <option value="preparing">备赛中</option>
                    <option value="competing">比赛中</option>
                    <option value="finished">已完赛</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">当前阶段</label>
                  <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={form.progress} onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))} placeholder="如：选题阶段" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">队伍公告</label>
                  <textarea rows={4} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm" value={form.announcement} onChange={(e) => setForm((p) => ({ ...p, announcement: e.target.value }))} />
                </div>
              </div>
            )}

            {!editMode && team.progress && (
              <div className="rounded-2xl bg-teal-50 p-4 text-sm font-bold text-teal-700">当前阶段：{team.progress}</div>
            )}

            {isCaptain && pendingApps.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-amber-900"><SparkIcon className="h-4 w-4" />待处理申请 ({pendingApps.length})</h2>
                <div className="space-y-3">
                  {pendingApps.map((app) => {
                    const skills = parseList(app.applicant.skills);
                    return (
                      <div key={app.id} className="rounded-2xl border border-amber-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/profile/${app.applicant.id}`} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-800">{app.applicant.nickname[0]}</div>
                            <div>
                              <p className="text-sm font-black text-slate-950">{app.applicant.nickname}</p>
                              <p className="text-xs text-slate-500">{app.applicant.grade || "年级未填"} {app.applicant.major || ""}</p>
                            </div>
                          </Link>
                        </div>
                        {skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{skills.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{s}</span>)}</div>}
                        <p className="mt-3 text-sm leading-6 text-slate-700">{app.reason}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleApplication(app.id, "accept")} disabled={processingId === app.id} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{processingId === app.id ? "处理中..." : "同意"}</button>
                          <button onClick={() => handleApplication(app.id, "reject")} disabled={processingId === app.id} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">拒绝</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><UsersIcon className="h-4 w-4 text-teal-700" />成员列表 ({team.members.length}/{team.post.targetSize})</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {team.members.map((m) => (
                  <Link key={m.user.id} href={`/profile/${m.user.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-sm font-black text-teal-700">{m.user.nickname[0]}</div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{m.user.nickname}</p>
                        <p className="text-xs text-slate-500">{m.user.grade || ""} {m.user.major || ""}</p>
                      </div>
                    </div>
                    {m.role === "captain" && <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">队长</span>}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><TrophyIcon className="h-4 w-4 text-teal-700" />队伍公告</h2>
              <p className="text-sm leading-6 text-slate-600">{team.announcement || "暂无公告"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><UserIcon className="h-4 w-4 text-teal-700" />原始招募</h2>
              <Link href={`/post/${team.post.id}`} className="text-sm font-bold text-teal-700 hover:underline">{team.post.title}</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
