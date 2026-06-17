"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SendIcon, UsersIcon, XIcon } from "@/components/Icons";

interface Team {
  id: number;
  name: string;
  post: { id: number; title: string };
  _count: { members: number };
}

interface InviteModalProps {
  targetUser: { id: number; nickname: string } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteModal({ targetUser, onClose, onSuccess }: InviteModalProps) {
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!targetUser) return;
    setSelectedTeamId("");
    setMessage("");
    setError("");
    fetch("/api/teams?mine=true")
      .then((r) => r.json())
      .then((data) => setMyTeams(data.teams || []));
  }, [targetUser]);

  async function handleInvite() {
    if (!selectedTeamId || !targetUser) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUserId: targetUser.id,
        teamId: Number(selectedTeamId),
        message: message.trim() || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess?.();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error || "邀请发送失败");
    }
  }

  if (!targetUser) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UsersIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-slate-950">邀请 {targetUser.nickname} 入队</h3>
            <p className="mt-1 text-sm text-slate-500">选择一个你管理的队伍，并补充一句邀请说明。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="关闭">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">选择队伍</label>
            {myTeams.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                你还没有可邀请的队伍。先去
                <Link href="/post/new" className="px-1 font-bold text-teal-700 hover:underline" onClick={onClose}>
                  发布招募
                </Link>
                ，系统会自动创建队伍。
              </div>
            ) : (
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">请选择队伍</option>
                {myTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}（{t._count.members} 人）
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">附言</label>
            <textarea
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="例如：我们正在准备数模校赛，缺一位擅长数据处理的队友。"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleInvite}
              disabled={loading || !selectedTeamId}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
              {loading ? "发送中..." : "发送邀请"}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
