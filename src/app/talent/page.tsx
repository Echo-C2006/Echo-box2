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
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder={item.placeholder}
            value={item.value}
            onChange={(e) => item.set(e.target.value)}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button onClick={fetchUsers} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-teal-700">
          应用筛选
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            清除
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <SparkIcon className="h-4 w-4" />
            智能匹配候选队友
          </div>
          <h1 className="text-3xl font-black text-slate-950">人才库</h1>
          <p className="mt-2 text-sm text-slate-600">按技能、专业、年级和竞赛意向筛选校内队友。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-2xl font-black text-slate-950">{visibleUsers.length}</div>
          <div className="text-xs font-bold text-slate-500">可联系同学</div>
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="搜索昵称、专业、简介..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
        </div>
        <button onClick={fetchUsers} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
          搜索
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold md:hidden ${
            hasActiveFilters ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <FilterIcon className="h-4 w-4" />
          筛选
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-950">
              <FilterIcon className="h-4 w-4 text-teal-700" />
              筛选条件
            </div>
            {filterPanel}
          </div>
        </aside>

        <section>
          {loading ? (
            <p className="py-16 text-center text-sm font-medium text-slate-500">正在加载人才画像...</p>
          ) : visibleUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
              <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">暂无匹配的人才</p>
              <button onClick={() => { clearFilters(); fetchUsers(); }} className="mt-3 text-sm font-bold text-teal-700 hover:underline">
                清除筛选条件
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleUsers.map((user) => {
                const skills = parseList(user.skills);
                const interests = parseList(user.interests);
                return (
                  <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/profile/${user.id}`} className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-black text-teal-700">
                          {user.nickname[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950 hover:text-teal-700">{user.nickname}</h3>
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
                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
                      >
                        邀请组队
                      </button>
                    </div>

                    {skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((s) => (
                          <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{s}</span>
                        ))}
                        {skills.length > 4 && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">+{skills.length - 4}</span>}
                      </div>
                    )}

                    {interests.length > 0 && (
                      <p className="mt-3 text-xs font-medium text-teal-700">意向：{interests.join("、")}</p>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{user.bio || "这位同学还没有填写个人简介。"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-2xl md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-950">筛选条件</h3>
              <button onClick={() => setShowFilters(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
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
