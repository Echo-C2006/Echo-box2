"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nickname: string;
  grade: string | null;
  major: string | null;
  bio: string | null;
  skills: string | null;
  interests: string | null;
  avatar: string | null;
  experience: string | null;
  timeCommitment: string | null;
}

interface Team {
  id: number;
  name: string;
  post: { id: number; title: string };
  _count: { members: number };
}

export default function TalentPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Invite modal state
  const [inviteTarget, setInviteTarget] = useState<User | null>(null);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  function fetchUsers() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search.trim()) qs.set("search", search.trim());
    if (skillFilter.trim()) qs.set("skills", skillFilter.trim());
    if (gradeFilter.trim()) qs.set("grade", gradeFilter.trim());
    if (majorFilter.trim()) qs.set("major", majorFilter.trim());
    if (interestFilter.trim()) qs.set("interest", interestFilter.trim());
    fetch(`/api/users?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleSearch() {
    fetchUsers();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function parseSkills(user: User): string[] {
    if (!user.skills) return [];
    try {
      return JSON.parse(user.skills);
    } catch {
      return [];
    }
  }

  function parseInterests(user: User): string[] {
    if (!user.interests) return [];
    try {
      return JSON.parse(user.interests);
    } catch {
      return [];
    }
  }

  function clearFilters() {
    setSkillFilter("");
    setGradeFilter("");
    setMajorFilter("");
    setInterestFilter("");
  }

  // Invite logic
  async function openInviteModal(user: User) {
    setInviteTarget(user);
    setSelectedTeamId("");
    setInviteMessage("");
    setInviteError("");
    setInviteLoading(false);
    try {
      const res = await fetch("/api/teams?mine=true");
      const data = await res.json();
      setMyTeams(data.teams || []);
    } catch {
      setMyTeams([]);
    }
  }

  async function handleInvite() {
    if (!selectedTeamId || !inviteTarget) return;
    setInviteLoading(true);
    setInviteError("");
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUserId: inviteTarget.id,
        teamId: Number(selectedTeamId),
        message: inviteMessage.trim() || undefined,
      }),
    });
    setInviteLoading(false);
    if (res.ok) {
      alert(`已向 ${inviteTarget.nickname} 发出邀请`);
      setInviteTarget(null);
    } else {
      const err = await res.json();
      setInviteError(err.error || "邀请失败");
    }
  }

  const hasActiveFilters = skillFilter || gradeFilter || majorFilter || interestFilter;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">人才库</h1>

      {/* Search bar */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="搜索昵称、专业、个人简介..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          搜索
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium md:hidden ${
            showFilters || hasActiveFilters
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          筛选{hasActiveFilters ? " ✓" : ""}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar - desktop */}
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">筛选条件</h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">技能</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="Python, MATLAB..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">年级</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="大三、研一..."
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">专业</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="计算机、数学..."
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">竞赛意向</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="数学建模、ACM..."
                  value={interestFilter}
                  onChange={(e) => setInterestFilter(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={fetchUsers}
                  className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  应用筛选
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => { clearFilters(); }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Filter drawer - mobile */}
        {showFilters && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-xl md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">筛选条件</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">技能</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="Python, MATLAB..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">年级</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="大三、研一..."
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">专业</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="计算机、数学..."
                    value={majorFilter}
                    onChange={(e) => setMajorFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">竞赛意向</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="数学建模、ACM..."
                    value={interestFilter}
                    onChange={(e) => setInterestFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { fetchUsers(); setShowFilters(false); }}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  应用筛选
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => clearFilters()}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Talent list */}
        <div className="flex-1">
          {loading ? (
            <p className="py-12 text-center text-gray-500">加载中...</p>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">暂无匹配的人才</p>
              <button
                onClick={() => { clearFilters(); fetchUsers(); }}
                className="mt-2 text-sm text-indigo-600 hover:underline"
              >
                清除筛选条件
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {users
                .filter((u) => u.id !== currentUserId)
                .map((user) => {
                  const skills = parseSkills(user);
                  const interests = parseInterests(user);
                  return (
                    <div
                      key={user.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700">
                            {user.nickname[0]}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                              {user.nickname}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {user.grade || ""}{user.grade && user.major ? " · " : ""}{user.major || ""}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            if (!currentUserId) {
                              router.push("/auth/login?redirect=/talent");
                              return;
                            }
                            openInviteModal(user);
                          }}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          邀请组队
                        </button>
                      </div>

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                            >
                              {s}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Interests */}
                      {interests.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">
                          想找：{interests.join("、")}
                        </p>
                      )}

                      {/* Bio */}
                      {user.bio && (
                        <p className="mt-1.5 text-xs text-gray-600 line-clamp-1">{user.bio}</p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {inviteTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setInviteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              邀请 {inviteTarget.nickname} 组队
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">选择队伍</label>
                {myTeams.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    还没有可邀请的队伍，请先{" "}
                    <Link href="/post/new" className="text-indigo-600 hover:underline" onClick={() => setInviteTarget(null)}>
                      发布招募帖
                    </Link>
                    ，系统会自动创建队伍。
                  </p>
                ) : (
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    <option value="">请选择队伍</option>
                    {myTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}（{t._count.members} 人）
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">附言（选填）</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder="简单介绍一下你的队伍..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>

              {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleInvite}
                  disabled={inviteLoading || !selectedTeamId}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {inviteLoading ? "发送中..." : "发送邀请"}
                </button>
                <button
                  onClick={() => setInviteTarget(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
