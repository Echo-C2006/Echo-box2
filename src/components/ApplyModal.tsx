"use client";

import { useState } from "react";
import { SendIcon, XIcon } from "@/components/Icons";

interface ApplyModalProps {
  postTitle: string;
  postId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ postTitle, postId, onClose, onSuccess }: ApplyModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reason: reason.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error || "申请失败");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <SendIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-slate-950">申请加入</h3>
            <p className="mt-1 text-sm text-slate-500">
              向 <span className="font-bold text-slate-700">{postTitle}</span> 的队伍提交申请
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="关闭">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">申请理由</label>
            <textarea
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="简述你的优势和相关经验，让队长更了解你。"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
              {loading ? "提交中..." : "提交申请"}
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
