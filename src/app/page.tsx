"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClockIcon,
  PlusIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/Icons";

/* ---------- types ---------- */

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

interface TalentUser {
  id: number;
  nickname: string;
  grade: string | null;
  major: string | null;
  bio: string | null;
  skills: string | null;
  interests: string | null;
}

/* ---------- helpers ---------- */

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

/* ---------- component ---------- */

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [talents, setTalents] = useState<TalentUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [postRes, talentRes] = await Promise.all([
        fetch("/api/posts?sort=latest"),
        fetch("/api/users?sort=teams"),
      ]);
      const postData = await postRes.json();
      const talentData = await talentRes.json();
      setPosts((postData.posts || []).slice(0, 3));
      setTalents((talentData.users || []).slice(0, 3));
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ========== Hero ========== */}
      <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              赛搭把招募、人才检索、申请审批和私信沟通放在同一个工作台里，
              让建模、程序设计、创新创业等校内竞赛组队更清晰。
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
                href="/square"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                浏览全部招募
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50 lg:grid-cols-1 lg:border-l lg:border-t-0">
            <div className="border-r border-slate-100 p-5 lg:border-b lg:border-r-0">
              <div className="text-2xl font-black text-slate-950">
                {loaded ? posts.length : "-"}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                最新招募
              </div>
            </div>
            <div className="p-5 lg:border-b lg:border-r-0">
              <div className="text-2xl font-black text-slate-950">
                {loaded ? talents.length : "-"}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                推荐人才
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 最新招募 ========== */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">最新招募</h2>
          <Link
            href="/square"
            className="text-sm font-bold text-teal-700 transition-colors hover:text-teal-600"
          >
            查看更多 →
          </Link>
        </div>

        {!loaded ? (
          <p className="py-12 text-center text-sm font-medium text-slate-500">
            正在加载...
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">暂无招募</p>
            <Link
              href="/post/new"
              className="mt-2 inline-block text-sm font-bold text-teal-700 hover:underline"
            >
              发布第一个招募
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const skills = parseList(post.skills);
              const daysLeft = Math.ceil(
                (new Date(post.expiresAt).getTime() - Date.now()) / 86400000,
              );
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                      {post.competition.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        post.status === "full"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {post.status === "full" ? "已满员" : "招募中"}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-base font-black leading-6 text-slate-950 group-hover:text-teal-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {post.description || "队长暂未填写详细说明。"}
                  </p>
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skills.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 2 && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                          +{skills.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-auto border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span className="truncate">
                        {post.author.nickname}
                      </span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {post.currentSize}/{post.targetSize} 人
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {daysLeft > 0 ? `${daysLeft} 天` : "已截止"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ========== 推荐人才 ========== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">推荐人才</h2>
          <Link
            href="/talent"
            className="text-sm font-bold text-teal-700 transition-colors hover:text-teal-600"
          >
            查看更多 →
          </Link>
        </div>

        {!loaded ? (
          <p className="py-12 text-center text-sm font-medium text-slate-500">
            正在加载...
          </p>
        ) : talents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm">
            <UsersIcon className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              暂无人才数据
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {talents.map((user) => {
              const skills = parseList(user.skills);
              const interests = parseList(user.interests);
              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-base font-black text-teal-700 transition-colors group-hover:bg-teal-100">
                      {user.nickname[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-slate-950 transition-colors group-hover:text-teal-700">
                        {user.nickname}
                      </h3>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                        {user.grade || "年级未填"}
                        {user.major ? ` · ${user.major}` : ""}
                      </p>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                          +{skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {interests.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-teal-700">
                      意向：{interests.join("、")}
                    </p>
                  )}

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {user.bio || "这位同学还没有填写个人简介。"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
