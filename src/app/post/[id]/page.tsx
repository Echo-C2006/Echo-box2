"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ClockIcon, MessageIcon, SendIcon, TrophyIcon, UsersIcon } from "@/components/Icons";
import ApplyModal from "@/components/ApplyModal";

interface PostDetail {
  id: number;
  title: string;
  description: string;
  skills: string | null;
  currentSize: number;
  targetSize: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  author: { id: number; nickname: string; grade: string | null; major: string | null; bio: string | null; skills: string | null };
  competition: { id: number; name: string; category: string };
  team: { id: number; name: string; members: { role: string; user: { id: number; nickname: string } }[] } | null;
  applications: { id: number; status: string; applicantId: number }[];
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  async function fetchPost() {
    const data = await fetch(`/api/posts/${id}`).then((r) => (r.ok ? r.json() : null));
    if (data?.post) setPost(data.post);
    else setError("招募不存在");
    setLoading(false);
  }

  useEffect(() => {
    if (id) fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">正在加载...</p>;
  if (error || !post) return <p className="py-12 text-center text-sm text-red-500">{error || "加载失败"}</p>;

  const skills = parseList(post.skills);
  const isAuthor = currentUserId === post.author.id;
  const isFull = post.status === "full";
  const isMember = post.team?.members.some((m) => m.user.id === currentUserId) ?? false;
  const appStatus = post.applications.find((a) => a.applicantId === currentUserId)?.status || null;
  const daysLeft = Math.ceil((new Date(post.expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{post.competition.name}</span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${isFull ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-800"}`}>{isFull ? "已满员" : "招募中"}</span>
          </div>
          <h1 className="text-3xl font-black leading-tight text-slate-950">{post.title}</h1>
          <Link href={`/profile/${post.author.id}`} className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-teal-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-sm font-black text-teal-700">{post.author.nickname[0]}</div>
            <div>
              <p className="text-sm font-black text-slate-950">{post.author.nickname}</p>
              <p className="text-xs text-slate-500">{post.author.grade || "年级未填"} {post.author.major || ""}</p>
            </div>
          </Link>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.description || "队长暂未填写详细说明。"}</div>
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-black text-slate-950">需求技能</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{s}</span>) : <span className="text-sm text-slate-400">未指定</span>}
            </div>
          </div>
          {post.team && (
            <div className="mt-7">
              <h2 className="mb-3 text-sm font-black text-slate-950">现有成员</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {post.team.members.map((m) => (
                  <div key={m.user.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">{m.user.nickname[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.user.nickname}</p>
                      <p className="text-xs text-slate-500">{m.role === "captain" ? "队长" : "队员"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-black text-slate-950">招募概览</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><UsersIcon className="h-4 w-4" />队伍规模</span><b>{post.currentSize}/{post.targetSize} 人</b></div>
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><ClockIcon className="h-4 w-4" />有效期</span><b>{daysLeft > 0 ? `${daysLeft} 天` : "已截止"}</b></div>
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-slate-500"><TrophyIcon className="h-4 w-4" />发布</span><b>{new Date(post.createdAt).toLocaleDateString()}</b></div>
            </div>
          </div>

          {!isAuthor ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {isMember || appStatus || isFull ? (
                <button disabled className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500">
                  {isMember ? "已是队员" : appStatus === "pending" ? "申请待回复" : appStatus === "accepted" ? "申请已通过" : appStatus === "rejected" ? "申请已拒绝" : "队伍已满"}
                </button>
              ) : (
                <button onClick={() => setApplyOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                  <SendIcon className="h-4 w-4" />申请加入
                </button>
              )}
              {applyOpen && (
                <ApplyModal
                  postTitle={post.title}
                  postId={post.id}
                  onClose={() => setApplyOpen(false)}
                  onSuccess={fetchPost}
                />
              )}
              <Link href={`/messages?to=${post.author.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <MessageIcon className="h-4 w-4" />私信队长
              </Link>
            </div>
          ) : post.team ? (
            <Link href={`/team/${post.team.id}`} className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">管理队伍</Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
