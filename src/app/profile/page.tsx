"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SparkIcon, TrophyIcon, UserIcon, UsersIcon } from "@/components/Icons";

interface User {
  id: number;
  email: string;
  nickname: string;
  grade: string | null;
  major: string | null;
  bio: string | null;
  skills: string | null;
  experience: string | null;
  interests: string | null;
  timeCommitment: string | null;
  realName: string | null;
  school: string | null;
  studentId: string | null;
  idVerified: boolean;
}

interface MyTeam {
  id: number;
  name: string;
  status: string;
  role: string;
  post: { id: number; title: string };
  _count: { members: number };
}

interface MyApplication {
  id: number;
  status: string;
  reason: string;
  createdAt: string;
  post: { id: number; title: string; status: string; competition: { name: string }; team: { id: number; name: string } | null; author: { id: number; nickname: string } };
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [tab, setTab] = useState<"profile" | "joined" | "created">("profile");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setForm(data.user);
        } else router.push("/auth/login");
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/teams?mine=true").then((r) => r.json()).then((data) => setTeams(data.teams || []));
    fetch("/api/applications?mine=true").then((r) => r.json()).then((data) => setApplications(data.applications || []));
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    const skills = typeof form.skills === "string" ? form.skills.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean) : [];
    const interests = typeof form.interests === "string" ? form.interests.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean) : [];
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, skills, interests }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setForm(data.user);
      setEditMode(false);
    } else alert("保存失败");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">正在加载...</p>;
  if (!user) return null;

  const skillsArr = parseList(user.skills);
  const interestsArr = parseList(user.interests);
  const joinedTeams = teams.filter((t) => t.role === "member");
  const createdTeams = teams.filter((t) => t.role === "captain");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const joinedCount = joinedTeams.length + pendingApps.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-black">{user.nickname[0]}</div>
              <div>
                <h1 className="text-2xl font-black">{user.nickname}</h1>
                <p className="mt-1 text-sm text-slate-300">{user.grade || "年级未填"}{user.major ? ` · ${user.major}` : ""}</p>
                <div className="mt-2">
                  {user.idVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-teal-600/20 px-2.5 py-1 text-xs font-bold text-teal-300">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      已实名 · {user.realName} · {user.school}
                    </span>
                  ) : (
                    <Link href="/auth/verify" className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/30">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      去实名认证
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">退出登录</button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <button onClick={() => setTab("profile")} className={`p-4 text-sm font-black ${tab === "profile" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>个人资料</button>
          <button onClick={() => setTab("joined")} className={`p-4 text-sm font-black ${tab === "joined" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>参与队伍 ({joinedCount})</button>
          <button onClick={() => setTab("created")} className={`p-4 text-sm font-black ${tab === "created" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>管理队伍 ({createdTeams.length})</button>
        </div>
      </div>

      {tab === "profile" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><UserIcon className="h-5 w-5 text-teal-700" />我的资料</h2>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">编辑</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">保存</button>
                <button onClick={() => { setForm(user); setEditMode(false); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">取消</button>
              </div>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["nickname", "昵称"],
              ["grade", "年级"],
              ["major", "专业"],
              ["experience", "竞赛经历"],
              ["timeCommitment", "可投入时间"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
                {editMode ? <input name={name} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={(form as any)[name] || ""} onChange={handleChange} /> : <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{(user as any)[name] || "未填写"}</p>}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-bold text-slate-700">实名认证</label>
              {user.idVerified ? (
                <div className="rounded-xl bg-teal-50 px-3 py-2.5 text-sm text-teal-700">
                  已认证 · {user.realName} · {user.school} · {user.studentId}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                  未认证
                  <Link href="/auth/verify" className="ml-2 font-bold text-amber-800 underline hover:text-amber-900">去认证</Link>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-bold text-slate-700">个人简介</label>
              {editMode ? <textarea name="bio" rows={4} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.bio || ""} onChange={handleChange} /> : <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700">{user.bio || "未填写"}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">技能标签</label>
              {editMode ? <input name="skills" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={typeof form.skills === "string" ? form.skills : skillsArr.join(", ")} onChange={handleChange} placeholder="Python, 数据分析" /> : <TagList items={skillsArr} empty="未填写" color="teal" />}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">竞赛意向</label>
              {editMode ? <input name="interests" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={typeof form.interests === "string" ? form.interests : interestsArr.join(", ")} onChange={handleChange} placeholder="数学建模, ACM" /> : <TagList items={interestsArr} empty="未填写" color="amber" />}
            </div>
          </div>
        </div>
      )}

      {tab === "joined" && <TeamList empty="还没有加入或申请任何队伍" items={[...joinedTeams, ...pendingApps.map((a) => ({ id: a.id, name: a.post.title, status: "pending", role: "applicant", post: { id: a.post.id, title: a.post.competition.name }, _count: { members: 0 } }))]} pending />}
      {tab === "created" && <TeamList empty="还没有创建过队伍" items={createdTeams} />}
    </div>
  );
}

function TagList({ items, empty, color }: { items: string[]; empty: string; color: "teal" | "amber" }) {
  if (items.length === 0) return <span className="text-sm text-slate-400">{empty}</span>;
  const cls = color === "teal" ? "bg-teal-50 text-teal-700" : "bg-amber-100 text-amber-800";
  return <div className="flex flex-wrap gap-2">{items.map((s) => <span key={s} className={`rounded-md px-2.5 py-1 text-xs font-bold ${cls}`}>{s}</span>)}</div>;
}

function TeamList({ items, empty, pending = false }: { items: MyTeam[]; empty: string; pending?: boolean }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
        <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-600">{empty}</p>
        <Link href={pending ? "/square" : "/post/new"} className="mt-3 inline-block text-sm font-bold text-teal-700 hover:underline">{pending ? "去广场看看" : "发布招募"}</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((team) => (
        <Link key={`${team.role}-${team.id}`} href={team.role === "applicant" ? `/post/${team.post.id}` : `/team/${team.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-200 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-black text-slate-950">{team.name}</h3>
            <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">{team.role === "applicant" ? "待回复" : statusMap[team.status] || team.status}</span>
          </div>
          <p className="line-clamp-1 text-sm text-slate-500">{team.post.title}</p>
          {team.role !== "applicant" && <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-500"><TrophyIcon className="h-4 w-4" />{team._count.members} 人</p>}
        </Link>
      ))}
    </div>
  );
}
