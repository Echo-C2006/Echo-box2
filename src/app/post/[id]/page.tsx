"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  author: {
    id: number;
    nickname: string;
    grade: string | null;
    major: string | null;
    bio: string | null;
    skills: string | null;
  };
  competition: { id: number; name: string; category: string };
  team: {
    id: number;
    name: string;
    members: { role: string; user: { id: number; nickname: string } }[];
  } | null;
  applications: { id: number; status: string; applicantId: number }[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [applyReason, setApplyReason] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.post) {
          setPost(data.post);
        } else {
          setError("帖子不存在");
        }
        setLoading(false);
      });
  }, [id]);

  async function handleApply() {
    if (!applyReason.trim()) return;
    setApplyLoading(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: Number(id), reason: applyReason }),
    });
    setApplyLoading(false);
    if (res.ok) {
      alert("申请已提交");
      setApplyOpen(false);
      setApplyReason("");
      // refresh
      const data = await fetch(`/api/posts/${id}`).then((r) => r.json());
      setPost(data.post);
    } else {
      const err = await res.json();
      alert(err.error || "申请失败");
    }
  }

  if (loading) return <p className="py-12 text-center text-gray-500">加载中...</p>;
  if (error || !post) return <p className="py-12 text-center text-red-500">{error || "加载失败"}</p>;

  const skills: string[] = post.skills ? JSON.parse(post.skills) : [];
  const isAuthor = currentUserId === post.author.id;
  const hasApplied = post.applications.some((a) => a.applicantId === currentUserId && a.status === "pending");
  const isFull = post.status === "full";

  const daysLeft = Math.ceil((new Date(post.expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {post.competition.name}
          </span>
          {post.status === "full" ? (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">已满</span>
          ) : (
            <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">招募中</span>
          )}
        </div>

        <h1 className="mb-4 text-xl font-bold text-gray-900">{post.title}</h1>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {post.author.nickname[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              <Link href={`/profile/${post.author.id}`} className="hover:text-indigo-600 hover:underline">
                {post.author.nickname}
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              {post.author.grade || ""} {post.author.major || ""}
            </p>
          </div>
        </div>

        <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {post.description || "暂无详细描述"}
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">需求技能</h3>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((s) => (
                <span key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">未指定</span>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">队伍规模</p>
            <p className="text-sm font-semibold text-gray-900">
              {post.currentSize} / {post.targetSize} 人
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">有效期</p>
            <p className="text-sm font-semibold text-gray-900">
              {daysLeft > 0 ? `还剩 ${daysLeft} 天` : "已过期"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">发布时间</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {post.team && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">现有成员</h3>
            <div className="flex flex-wrap gap-3">
              {post.team.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {m.user.nickname[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{m.user.nickname}</p>
                    <p className="text-[10px] text-gray-500">{m.role === "captain" ? "队长" : "队员"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAuthor && (
          <div className="flex gap-3">
            {hasApplied ? (
              <button disabled className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500">
                已申请，等待回复
              </button>
            ) : isFull ? (
              <button disabled className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500">
                已满
              </button>
            ) : (
              <>
                {!applyOpen ? (
                  <button
                    onClick={() => setApplyOpen(true)}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    申请加入
                  </button>
                ) : (
                  <div className="w-full space-y-3">
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="请简述你的优势和相关经验（50-200字）"
                      value={applyReason}
                      onChange={(e) => setApplyReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleApply}
                        disabled={applyLoading || !applyReason.trim()}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {applyLoading ? "提交中..." : "提交申请"}
                      </button>
                      <button
                        onClick={() => setApplyOpen(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <Link
              href={`/messages?to=${post.author.id}`}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              私信队长
            </Link>
          </div>
        )}

        {isAuthor && post.team && (
          <div className="flex gap-3">
            <Link
              href={`/team/${post.team.id}`}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              管理队伍
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
