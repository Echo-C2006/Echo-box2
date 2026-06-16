"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function SquarePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filterComp, setFilterComp] = useState<number | null>(null);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(data.competitions || []));
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

  function formatTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "刚刚";
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  }

  const allCompetitions = [{ id: 0, name: "全部", category: "" }, ...competitions];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900">广场</h1>
        <Link
          href="/post/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 发布招募帖
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allCompetitions.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterComp(c.id === 0 ? null : c.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                (c.id === 0 && filterComp === null) || filterComp === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: "latest", label: "最新发布" },
            { key: "deadline", label: "即将截止" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-xs font-medium ${sort === s.key ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      {loading ? (
        <p className="py-12 text-center text-gray-500">加载中...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">暂无招募帖，来做第一个发帖的人吧</p>
          <Link href="/post/new" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
            立即发帖
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const skills: string[] = post.skills ? JSON.parse(post.skills) : [];
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {post.competition.name}
                  </span>
                  {post.status === "full" && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">已满</span>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600">
                  {post.title}
                </h3>
                <p className="mb-3 text-xs text-gray-500 line-clamp-2">{post.description || "暂无描述"}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                      {s}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">+{skills.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {post.author.nickname} · {post.author.grade || ""} {post.author.major || ""}
                  </span>
                  <span>{formatTime(post.createdAt)}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>已有 {post.currentSize}/{post.targetSize} 人</span>
                  <span>申请 {post._count.applications}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
