"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
      setError(err.error || "邀请失败");
    }
  }

  if (!targetUser) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          邀请 {targetUser.nickname} 组队
        </h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">选择队伍</label>
            {myTeams.length === 0 ? (
              <p className="text-xs text-gray-500">
                还没有可邀请的队伍，请先{" "}
                <Link
                  href="/post/new"
                  className="text-indigo-600 hover:underline"
                  onClick={onClose}
                >
                  发布招募帖
                </Link>
                ，系统会自动创建队伍。
              </p>
            ) : (
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
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
            <label className="mb-1 block text-xs font-medium text-gray-700">附言（选填）</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="简单介绍一下你的队伍..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleInvite}
              disabled={loading || !selectedTeamId}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "发送中..." : "发送邀请"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
