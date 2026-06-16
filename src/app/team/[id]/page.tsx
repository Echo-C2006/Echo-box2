"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface TeamDetail {
  id: number;
  name: string;
  status: string;
  announcement: string | null;
  progress: string | null;
  externalLinks: string | null;
  post: {
    id: number;
    title: string;
    competition: { id: number; name: string };
    author: { id: number; nickname: string };
  };
  members: {
    role: string;
    skills: string | null;
    user: { id: number; nickname: string; grade: string | null; major: string | null };
  }[];
}

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", status: "", announcement: "", progress: "" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/teams/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.team) {
          setTeam(data.team);
          setForm({
            name: data.team.name,
            status: data.team.status,
            announcement: data.team.announcement || "",
            progress: data.team.progress || "",
          });
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (team && currentUserId) {
      setIsCaptain(team.members.some((m) => m.user.id === currentUserId && m.role === "captain"));
    }
  }, [team, currentUserId]);

  async function handleSave() {
    const res = await fetch(`/api/teams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setTeam((prev) => (prev ? { ...prev, ...data.team } : prev));
      setEditMode(false);
    } else {
      alert("保存失败");
    }
  }

  if (loading) return <p className="py-12 text-center text-gray-500">加载中...</p>;
  if (!team) return <p className="py-12 text-center text-red-500">队伍不存在</p>;

  const links = team.externalLinks ? JSON.parse(team.externalLinks) : {};

  const statusMap: Record<string, string> = {
    recruiting: "招募中",
    preparing: "备赛中",
    competing: "比赛中",
    finished: "已完赛",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <Link href={`/post/${team.post.id}`} className="text-sm text-gray-500 hover:text-indigo-600">
          ← 返回招募帖
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            {editMode ? (
              <input
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-lg font-bold outline-none focus:border-indigo-500"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
            )}
            <p className="text-sm text-gray-500">
              参赛：{team.post.competition.name} · 队长：{team.post.author.nickname}
            </p>
          </div>
          <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {statusMap[team.status] || team.status}
          </span>
        </div>

        {isCaptain && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="mb-4 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
          >
            编辑信息
          </button>
        )}

        {editMode && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              保存
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        )}

        {editMode && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">状态</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="recruiting">招募中</option>
                <option value="preparing">备赛中</option>
                <option value="competing">比赛中</option>
                <option value="finished">已完赛</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">当前阶段</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                value={form.progress}
                onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))}
                placeholder="如：选题阶段"
              />
            </div>
          </div>
        )}

        {!editMode && team.progress && (
          <div className="mb-4 rounded-lg bg-indigo-50 p-3">
            <p className="text-xs text-indigo-700">当前阶段：{team.progress}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">队伍公告</h3>
          {editMode ? (
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={form.announcement}
              onChange={(e) => setForm((p) => ({ ...p, announcement: e.target.value }))}
              placeholder="输入公告内容..."
            />
          ) : (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {team.announcement || "暂无公告"}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">成员列表</h3>
          <div className="space-y-2">
            {team.members.map((m) => (
              <div key={m.user.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                    {m.user.nickname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.user.nickname}
                      {m.role === "captain" && (
                        <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-700">队长</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.user.grade || ""} {m.user.major || ""}
                    </p>
                  </div>
                </div>
                {m.skills && <span className="text-xs text-gray-500">承担：{m.skills}</span>}
              </div>
            ))}
          </div>
        </div>

        {Object.keys(links).length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">外部协作</h3>
            <div className="space-y-2">
              {links.wechat && (
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <span className="text-gray-500">微信群：</span>
                  <span className="text-gray-700">{links.wechat}</span>
                </div>
              )}
              {links.doc && (
                <a href={links.doc} target="_blank" rel="noreferrer" className="block rounded-lg bg-gray-50 p-3 text-sm text-indigo-600 hover:underline">
                  腾讯文档 / 协作文档 →
                </a>
              )}
              {links.github && (
                <a href={links.github} target="_blank" rel="noreferrer" className="block rounded-lg bg-gray-50 p-3 text-sm text-indigo-600 hover:underline">
                  GitHub →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
