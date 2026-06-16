"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileUser {
  id: number;
  nickname: string;
  email: string;
  grade: string | null;
  major: string | null;
  bio: string | null;
  skills: string | null;
  experience: string | null;
  interests: string | null;
  timeCommitment: string | null;
  avatar: string | null;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push("/square");
        }
        setLoading(false);
      });
  }, [id, router]);

  // 如果是自己，跳转到编辑页
  useEffect(() => {
    if (user && currentUserId === user.id) {
      router.push("/profile");
    }
  }, [user, currentUserId, router]);

  if (loading) return <p className="py-12 text-center text-gray-500">加载中...</p>;
  if (!user) return null;

  const skills: string[] = (() => {
    if (!user.skills) return [];
    try { return JSON.parse(user.skills); } catch { return []; }
  })();

  const interests: string[] = (() => {
    if (!user.interests) return [];
    try { return JSON.parse(user.interests); } catch { return []; }
  })();

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
            {user.nickname[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.nickname}</h1>
            <p className="text-sm text-gray-500">
              {user.grade || ""}{user.grade && user.major ? " · " : ""}{user.major || ""}
            </p>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-5">
          {/* 个人简介 */}
          <div>
            <h3 className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">个人简介</h3>
            <p className="text-sm text-gray-900">{user.bio || "未填写"}</p>
          </div>

          {/* 技能标签 */}
          <div>
            <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">技能标签</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">未填写</p>
            )}
          </div>

          {/* 竞赛意向 */}
          <div>
            <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">竞赛意向</h3>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((s) => (
                  <span key={s} className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">未填写</p>
            )}
          </div>

          {/* 竞赛经历 */}
          <div>
            <h3 className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">竞赛经历</h3>
            <p className="text-sm text-gray-900">{user.experience || "未填写"}</p>
          </div>

          {/* 可投入时间 */}
          {user.timeCommitment && (
            <div>
              <h3 className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">可投入时间</h3>
              <p className="text-sm text-gray-900">{user.timeCommitment}</p>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="mt-6">
          <Link
            href="/talent"
            className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600"
          >
            ← 返回人才库
          </Link>
        </div>
      </div>
    </div>
  );
}
