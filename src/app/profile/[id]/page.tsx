"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InviteModal from "@/components/InviteModal";
import { MessageIcon, SendIcon, SparkIcon, UserIcon } from "@/components/Icons";

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

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteTarget, setInviteTarget] = useState<{ id: number; nickname: string } | null>(null);

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
        if (data?.user) setUser(data.user);
        else router.push("/");
        setLoading(false);
      });
  }, [id, router]);

  useEffect(() => {
    if (user && currentUserId === user.id) router.push("/profile");
  }, [user, currentUserId, router]);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">正在加载...</p>;
  if (!user) return null;

  const skills = parseList(user.skills);
  const interests = parseList(user.interests);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-black text-white">
                {user.nickname[0]}
              </div>
              <div>
                <h1 className="text-2xl font-black">{user.nickname}</h1>
                <p className="mt-1 text-sm text-slate-300">{user.grade || "年级未填"}{user.major ? ` · ${user.major}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/messages?to=${user.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-50">
                <MessageIcon className="h-4 w-4" />
                私信
              </Link>
              <button
                onClick={() => {
                  if (!currentUserId) router.push(`/auth/login?redirect=/profile/${id}`);
                  else setInviteTarget({ id: user.id, nickname: user.nickname });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-200"
              >
                <SendIcon className="h-4 w-4" />
                邀请组队
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_18rem]">
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                <UserIcon className="h-4 w-4 text-teal-700" />
                个人简介
              </h2>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{user.bio || "这位同学还没有填写个人简介。"}</p>
            </div>
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                <SparkIcon className="h-4 w-4 text-teal-700" />
                竞赛经历
              </h2>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{user.experience || "暂未填写竞赛经历。"}</p>
            </div>
          </section>
          <aside className="space-y-5">
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">技能标签</h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((s) => <span key={s} className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{s}</span>) : <span className="text-sm text-slate-400">未填写</span>}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">竞赛意向</h3>
              <div className="flex flex-wrap gap-2">
                {interests.length > 0 ? interests.map((s) => <span key={s} className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{s}</span>) : <span className="text-sm text-slate-400">未填写</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">可投入时间</h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">{user.timeCommitment || "未填写"}</p>
            </div>
          </aside>
        </div>
      </div>
      <Link href="/talent" className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline">返回人才库</Link>
      <InviteModal targetUser={inviteTarget} onClose={() => setInviteTarget(null)} onSuccess={() => alert("邀请已发送")} />
    </div>
  );
}
