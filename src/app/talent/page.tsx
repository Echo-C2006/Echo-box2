"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InviteModal from "@/components/InviteModal";
import { FilterIcon, SearchIcon, SparkIcon, UsersIcon, XIcon } from "@/components/Icons";

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

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
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
  const [inviteTarget, setInviteTarget] = useState<User | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFilters() {
    setSkillFilter("");
    setGradeFilter("");
    setMajorFilter("");
    setInterestFilter("");
  }

  const visibleUsers = users.filter((u) => u.id !== currentUserId);
  const hasActiveFilters = Boolean(skillFilter || gradeFilter || majorFilter || interestFilter);

  const filterPanel = (
    <div className="space-y-4">
      {[
        { label: "技能", value: skillFilter, set: setSkillFilter, placeholder: "Python, MATLAB" },
        { label: "年级", value: gradeFilter, set: setGradeFilter, placeholder: "大三、研一" },
        { label: "专业", value: majorFilter, set: setMajorFilter, placeholder: "计算机、数学" },
        { label: "竞赛意向", value: interestFilter, set: setInterestFilter, placeholder: "数模、ACM" },
      ].map((item) => (
        <div key={item.label}>
          <label className="mb-1.5 block text-xs font-bold text-slate-500">{item.label}</label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder={item.placeholder}
            value={item.value}
            onChange={(e) => item.set(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button onClick={fetchUsers} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700">
          应用筛选
        </button>
        {hasActiveFilters && (
          <button onClick={() => { clearFilters(); setTimeout(fetchUsers, 0); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
            清除
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 两栏布局 */}
      <div className="flex gap-6">
        {/* ========== 左侧：筛选面板 ========== */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">筛选条件</h2>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); setTimeout(fetchUsers, 0); }}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  清除
                </button>
              )}
            </div>
            <div className="mt-3">
              {filterPanel}
            </div>
          </div>
        </aside>

        {/* ========== 右侧：人才列表 ========== */}
        <main className="min-w-0 flex-1">
          {/* 顶栏：标题 + 搜索 */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-950">人才库</h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {loading ? "加载中..." : `共 ${visibleUsers.length} 位同学`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-48 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:w-64 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="搜索昵称、专业..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                />
              </div>
              <button onClick={fetchUsers} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700">
                搜索
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-colors md:hidden ${
                  hasActiveFilters ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <FilterIcon className="h-4 w-4" />
                筛选
              </button>
            </div>
          </div>

          {/* 人才卡片列表 */}
          {loading ? (
            <p className="py-16 text-center text-sm font-medium text-slate-500">正在加载人才画像...</p>
          ) : visibleUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
              <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">暂无匹配的人才</p>
              <button onClick={() => { clearFilters(); setTimeout(fetchUsers, 0); }} className="mt-3 text-sm font-bold text-teal-700 hover:underline">
                清除筛选条件
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleUsers.map((user) => {
                const skills = parseList(user.skills);
                const interests = parseList(user.interests);
                return (
                  <div
                    key={user.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    {/* 头部：头像 + 信息 + 邀请按钮 */}
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/profile/${user.id}`} className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-black text-teal-700 transition-colors group-hover:bg-teal-100">
                          {user.nickname[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950 transition-colors group-hover:text-teal-700">
                            {user.nickname}
                          </h3>
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {user.grade || "年级未填"}{user.major ? ` · ${user.major}` : ""}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          if (!currentUserId) {
                            router.push("/auth/login?redirect=/talent");
                            return;
                          }
                          setInviteTarget(user);
                        }}
                        className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
                      >
                        邀请组队
                      </button>
                    </div>

                    {/* 技能标签 */}
                    {skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((s) => (
                          <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {s}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">+{skills.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* 竞赛意向 */}
                    {interests.length > 0 && (
                      <p className="mt-3 text-xs font-medium text-teal-700">意向：{interests.join("、")}</p>
                    )}

                    {/* 简介 */}
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {user.bio || "这位同学还没有填写个人简介。"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 移动端：筛选底部弹窗 */}
      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-2xl md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-950">筛选条件</h3>
              <button onClick={() => setShowFilters(false)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </>
      )}

      <InviteModal targetUser={inviteTarget} onClose={() => setInviteTarget(null)} onSuccess={() => alert("邀请已发送")} />
    </div>
  );
}
