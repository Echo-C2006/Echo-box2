"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockIcon, PlusIcon, SparkIcon, TrophyIcon, UsersIcon } from "@/components/Icons";

interface Post {
  id: number;
  title: string;
  description: string;
  skills: string | null;
  currentSize: number;
  targetSize: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  author: { id: number; nickname: string; grade: string | null; major: string | null };
  competition: { id: number; name: string; category: string };
  _count: { applications: number };
}

interface Competition {
  id: number;
  name: string;
  category: string;
  _count: { posts: number };
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export default function SquarePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterComp, setFilterComp] = useState<number | null>(null);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [showProfileTip, setShowProfileTip] = useState(false);

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(data.competitions || []));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user && !data.user.profileTipSeen) setShowProfileTip(true);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filterComp) qs.set("competitionId", String(filterComp));
    qs.set("sort", sort);
    fetch(`/api/posts?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      });
  }, [filterComp, sort]);

  const activeCompetition = competitions.find((c) => c.id === filterComp);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 两栏布局 */}
      <div className="flex gap-6">
        {/* ========== 左侧：竞赛列表 ========== */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">赛事方向</h2>
              <span className="text-xs font-semibold text-slate-400">{competitions.length}</span>
            </div>
            <div className="mt-3 space-y-0.5">
              {/* 全部 */}
              <button
                onClick={() => setFilterComp(null)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  filterComp === null
                    ? "bg-teal-700 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50 font-medium"
                }`}
              >
                <span>全部赛事</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs tabular-nums ${
                    filterComp === null
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {competitions.reduce((sum, c) => sum + c._count.posts, 0)}
                </span>
              </button>
              {/* 分割线 */}
              <div className="my-1 border-t border-slate-100" />
              {/* 各竞赛 */}
              {competitions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterComp(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filterComp === c.id
                      ? "bg-teal-700 text-white font-bold"
                      : "text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs tabular-nums ${
                      filterComp === c.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c._count.posts}
                  </span>
                </button>
              ))}
            </div>

            {/* 发布招募入口 */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link
                href="/post/new"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700"
              >
                <PlusIcon className="h-4 w-4" />
                发布招募
              </Link>
            </div>
          </div>
        </aside>

        {/* ========== 右侧：帖子列表 ========== */}
        <main className="min-w-0 flex-1">
          {/* 顶栏：标题 + 排序 */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-950">
                {activeCompetition ? activeCompetition.name : "全部招募"}
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {loading ? "加载中..." : `共 ${posts.length} 个招募`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[
                { key: "latest", label: "最新发布" },
                { key: "deadline", label: "即将截止" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                    sort === s.key
                      ? "bg-teal-700 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 移动端：竞赛选择横向滚动 */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {[{ id: 0, name: "全部赛事", _count: { posts: competitions.reduce((s, c) => s + c._count.posts, 0) } }, ...competitions].map((c) => {
              const active = (c.id === 0 && filterComp === null) || filterComp === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setFilterComp(c.id === 0 ? null : c.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                    active
                      ? "bg-teal-700 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c.name}
                  <span className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}>
                    {c._count.posts}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 帖子列表 */}
          {loading ? (
            <p className="py-16 text-center text-sm font-medium text-slate-500">正在加载招募信息...</p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
              <TrophyIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">当前筛选下还没有招募</p>
              <Link href="/post/new" className="mt-3 inline-flex text-sm font-bold text-teal-700 hover:underline">
                发起第一个队伍
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => {
                const skills = parseList(post.skills);
                const daysLeft = Math.ceil((new Date(post.expiresAt).getTime() - Date.now()) / 86400000);
                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                        {post.competition.name}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${post.status === "full" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-800"}`}>
                        {post.status === "full" ? "已满员" : "招募中"}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-black leading-6 text-slate-950 group-hover:text-teal-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.description || "队长暂未填写详细说明。"}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                      {skills.length > 3 && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">+{skills.length - 3}</span>}
                    </div>
                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                        <span className="truncate">{post.author.nickname} · {post.author.grade || "年级未填"} {post.author.major || ""}</span>
                        <span>{formatTime(post.createdAt)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><UsersIcon className="h-4 w-4" />{post.currentSize}/{post.targetSize} 人</span>
                        <span className="inline-flex items-center gap-1"><ClockIcon className="h-4 w-4" />{daysLeft > 0 ? `${daysLeft} 天` : "已截止"}</span>
                        <span>{post._count.applications} 申请</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 完善画像弹窗 */}
      {showProfileTip && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={() => setShowProfileTip(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <SparkIcon className="h-7 w-7" />
            </div>
            <h2 className="text-center text-lg font-black text-slate-950">完善你的组队画像</h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-600">
              添加技能标签、竞赛经历和可投入时间后，队长更容易判断你是否适合当前队伍。
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  fetch("/api/auth/profile-tip-seen", { method: "PATCH" });
                  router.push("/profile");
                }}
                className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
              >
                去完善
              </button>
              <button
                onClick={() => {
                  fetch("/api/auth/profile-tip-seen", { method: "PATCH" });
                  setShowProfileTip(false);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                稍后再说
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
