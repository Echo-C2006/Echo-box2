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

  const categoryCount = useMemo(() => new Set(competitions.map((c) => c.category)).size, [competitions]);
  const allCompetitions = [{ id: 0, name: "全部赛事", category: "" }, ...competitions];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              <SparkIcon className="h-4 w-4" />
              校内学科竞赛智能组队平台
            </div>
            <h1 className="max-w-2xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              找到技能互补、时间合拍、目标一致的竞赛队友
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              赛搭把招募、人才检索、申请审批和私信沟通放在同一个工作台里，让建模、程序设计、创新创业等校内竞赛组队更清晰。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/post/new"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700"
              >
                <PlusIcon className="h-4 w-4" />
                发布招募
              </Link>
              <Link
                href="/talent"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                <UsersIcon className="h-4 w-4" />
                浏览人才库
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50 lg:grid-cols-1 lg:border-l lg:border-t-0">
            {[
              { label: "招募中", value: posts.filter((p) => p.status !== "full").length },
              { label: "赛事方向", value: categoryCount || "-" },
              { label: "活跃申请", value: posts.reduce((sum, p) => sum + p._count.applications, 0) },
            ].map((item) => (
              <div key={item.label} className="border-r border-slate-100 p-5 last:border-r-0 lg:border-b lg:border-r-0 lg:last:border-b-0">
                <div className="text-2xl font-black text-slate-950">{item.value}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allCompetitions.map((c) => {
            const active = (c.id === 0 && filterComp === null) || filterComp === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilterComp(c.id === 0 ? null : c.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                  active
                    ? "bg-teal-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: "latest", label: "最新发布" },
            { key: "deadline", label: "即将截止" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                sort === s.key ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const skills = parseList(post.skills);
            const daysLeft = Math.ceil((new Date(post.expiresAt).getTime() - Date.now()) / 86400000);
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="line-clamp-2 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
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
