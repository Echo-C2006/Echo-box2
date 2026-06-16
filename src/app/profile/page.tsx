"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  post: {
    id: number;
    title: string;
    status: string;
    competition: { name: string };
    team: { id: number; name: string } | null;
    author: { id: number; nickname: string };
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});

  // Teams
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  // Applications
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Tab
  const [tab, setTab] = useState<"profile" | "joined" | "created">("profile");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setForm(data.user);
        } else {
          router.push("/auth/login");
        }
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setTeamsLoading(true);
    fetch("/api/teams?mine=true")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams || []);
        setTeamsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setAppsLoading(true);
    fetch("/api/applications?mine=true")
      .then((r) => r.json())
      .then((data) => {
        setApplications(data.applications || []);
        setAppsLoading(false);
      });
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    const skills = form.skills
      ? (form.skills as string)
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const interests = form.interests
      ? (form.interests as string)
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, skills, interests }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setEditMode(false);
    } else {
      alert("保存失败");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/square");
    router.refresh();
  }

  if (loading) return <p className="py-12 text-center text-gray-500">加载中...</p>;
  if (!user) return null;

  const skillsArr: string[] = user.skills ? JSON.parse(user.skills) : [];
  const interestsArr: string[] = user.interests ? JSON.parse(user.interests) : [];

  const fields = [
    { label: "昵称", name: "nickname", required: true },
    { label: "年级", name: "grade" },
    { label: "专业", name: "major" },
    { label: "竞赛经历", name: "experience" },
    { label: "可投入时间", name: "timeCommitment", placeholder: "如：每周10小时" },
  ];

  const joinedTeams = teams.filter((t) => t.role === "member");
  const createdTeams = teams.filter((t) => t.role === "captain");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const joinedCount = joinedTeams.length + pendingApps.length;

  const statusMap: Record<string, string> = {
    recruiting: "招募中",
    preparing: "备赛中",
    competing: "比赛中",
    finished: "已完赛",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab("profile")}
          className={`pb-2 text-sm font-medium ${
            tab === "profile"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          个人信息
        </button>
        <button
          onClick={() => setTab("joined")}
          className={`pb-2 text-sm font-medium ${
            tab === "joined"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          我加入的队伍 ({joinedCount})
        </button>
        <button
          onClick={() => setTab("created")}
          className={`pb-2 text-sm font-medium ${
            tab === "created"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          我创建的队伍 ({createdTeams.length})
        </button>
      </div>

      {/* Tab: 个人信息 */}
      {tab === "profile" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">我的资料</h1>
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setForm(user);
                      setEditMode(false);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                {editMode ? (
                  <input
                    type="text"
                    name={f.name}
                    required={f.required}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={(form as any)[f.name] || ""}
                    onChange={handleChange}
                    placeholder={f.placeholder || ""}
                  />
                ) : (
                  <p className="text-sm text-gray-900">{(user as any)[f.name] || "未填写"}</p>
                )}
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">个人简介</label>
              {editMode ? (
                <textarea
                  name="bio"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={form.bio || ""}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-sm text-gray-900">{user.bio || "未填写"}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">技能标签</label>
              {editMode ? (
                <input
                  type="text"
                  name="skills"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={typeof form.skills === "string" ? form.skills : skillsArr.join(", ")}
                  onChange={handleChange}
                  placeholder="用逗号分隔，如：Python, 数据分析"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillsArr.length > 0 ? (
                    skillsArr.map((s) => (
                      <span key={s} className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">未填写</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">竞赛意向</label>
              {editMode ? (
                <input
                  type="text"
                  name="interests"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={typeof form.interests === "string" ? form.interests : interestsArr.join(", ")}
                  onChange={handleChange}
                  placeholder="用逗号分隔"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interestsArr.length > 0 ? (
                    interestsArr.map((s) => (
                      <span key={s} className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">未填写</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 我加入的队伍 */}
      {tab === "joined" && (
        <div>
          {teamsLoading || appsLoading ? (
            <p className="py-8 text-center text-gray-500">加载中...</p>
          ) : joinedCount === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">还没有加入或申请任何队伍</p>
              <Link href="/square" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                去广场看看
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 已加入的队伍 */}
              {joinedTeams.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    已加入的队伍
                  </h3>
                  <div className="space-y-3">
                    {joinedTeams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/team/${team.id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {team.post.title} · {team._count.members} 人
                            </p>
                          </div>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {statusMap[team.status] || team.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 待处理的申请 */}
              {pendingApps.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    待回复的申请
                  </h3>
                  <div className="space-y-3">
                    {pendingApps.map((app) => (
                      <Link
                        key={app.id}
                        href={`/post/${app.post.id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{app.post.title}</h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {app.post.competition.name} · 队长：{app.post.author.nickname}
                            </p>
                          </div>
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            待回复
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: 我创建的队伍 */}
      {tab === "created" && (
        <div>
          {teamsLoading ? (
            <p className="py-8 text-center text-gray-500">加载中...</p>
          ) : createdTeams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">还没有创建过队伍</p>
              <Link href="/post/new" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                发布招募帖
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {createdTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {team.post.title} · {team._count.members} 人
                      </p>
                    </div>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      队长
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
