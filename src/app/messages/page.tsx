"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageIcon, SendIcon, UserIcon } from "@/components/Icons";

interface OtherUser {
  id: number;
  nickname: string;
  avatar: string | null;
}

interface LastMessage {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
}

interface Conversation {
  user: OtherUser;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: { id: number; nickname: string; avatar: string | null };
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (d.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
}

function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("to");
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<{ id: number; nickname: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
        else router.push("/auth/login?redirect=/messages");
      });
  }, [router]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) setConversations((await res.json()).conversations || []);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
      setNotifUnread(data.unreadCount || 0);
    }
  }, []);

  const openChat = useCallback(async (userId: number) => {
    setActiveKey(`user-${userId}`);
    setMessagesLoading(true);
    setShowMobileList(false);
    const existing = conversations.find((c) => c.user.id === userId);
    if (existing) setActiveUser(existing.user);
    else {
      const userRes = await fetch(`/api/users/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setActiveUser(userData.user || userData);
      }
    }
    const res = await fetch(`/api/messages?with=${userId}`);
    if (res.ok) setMessages((await res.json()).messages || []);
    setMessagesLoading(false);
  }, [conversations]);

  const openNotifications = useCallback(async () => {
    setActiveKey("system");
    setShowMobileList(false);
    const res = await fetch("/api/notifications");
    if (res.ok) {
      setNotifications((await res.json()).notifications || []);
      setNotifUnread(0);
    }
    await fetch("/api/notifications", { method: "PUT" });
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
  }, [fetchConversations, fetchNotifications]);

  useEffect(() => {
    if (toUserId && currentUser && Number(toUserId) !== currentUser.id && !conversationsLoading) openChat(Number(toUserId));
  }, [toUserId, currentUser, conversationsLoading, openChat]);

  useEffect(() => {
    if (!activeKey || activeKey === "system") return;
    const userId = Number(activeKey.replace("user-", ""));
    const iv = window.setInterval(async () => {
      const res = await fetch(`/api/messages?with=${userId}`);
      if (res.ok) setMessages((await res.json()).messages || []);
    }, 3000);
    return () => window.clearInterval(iv);
  }, [activeKey]);

  useEffect(() => {
    const iv = window.setInterval(() => {
      fetchConversations();
      fetchNotifications();
    }, 5000);
    return () => window.clearInterval(iv);
  }, [fetchConversations, fetchNotifications]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !activeKey?.startsWith("user-") || sending) return;
    setSending(true);
    const userId = Number(activeKey.replace("user-", ""));
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId, content: input.trim() }),
    });
    if (res.ok) {
      setInput("");
      const msgRes = await fetch(`/api/messages?with=${userId}`);
      if (msgRes.ok) setMessages((await msgRes.json()).messages || []);
      fetchConversations();
    }
    setSending(false);
  }

  const activeConversation = conversations.find((c) => `user-${c.user.id}` === activeKey);

  return (
    <div className="mx-auto grid h-[calc(100vh-64px)] max-w-6xl border-x border-slate-200 bg-white md:grid-cols-[20rem_1fr]">
      <aside className={`${showMobileList ? "block" : "hidden md:block"} border-r border-slate-200`}>
        <div className="border-b border-slate-200 p-5">
          <h1 className="text-xl font-black text-slate-950">消息中心</h1>
          <p className="mt-1 text-xs text-slate-500">队伍通知、私信沟通和申请反馈</p>
        </div>
        {conversationsLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">正在加载...</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-y-auto">
            <button onClick={openNotifications} className={`flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 ${activeKey === "system" ? "bg-teal-50" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <MessageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-950">系统通知</span>
                  {notifUnread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{notifUnread > 99 ? "99+" : notifUnread}</span>}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{notifications[0]?.content || "暂无系统通知"}</p>
              </div>
            </button>
            {conversations.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <UserIcon className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">暂无私信</p>
                <Link href="/talent" className="mt-2 inline-block text-sm font-bold text-teal-700 hover:underline">去人才库找队友</Link>
              </div>
            ) : (
              conversations.map((conv) => (
                <button key={conv.user.id} onClick={() => openChat(conv.user.id)} className={`flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 ${activeKey === `user-${conv.user.id}` ? "bg-teal-50" : ""}`}>
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-teal-700">{conv.user.nickname[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-black text-slate-950">{conv.user.nickname}</span>
                      {conv.lastMessage && <span className="text-xs text-slate-400">{formatTime(conv.lastMessage.createdAt)}</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{conv.lastMessage?.content || "暂无消息"}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{conv.unreadCount > 99 ? "99+" : conv.unreadCount}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </aside>

      <section className={`${!showMobileList ? "flex" : "hidden md:flex"} min-w-0 flex-col bg-slate-50`}>
        {!activeKey ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <MessageIcon className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-black text-slate-950">选择一个会话</h2>
              <p className="mt-2 text-sm text-slate-500">从左侧打开通知或私信。</p>
            </div>
          </div>
        ) : activeKey === "system" ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4">
              <button onClick={() => setShowMobileList(true)} className="text-sm font-bold text-slate-500 md:hidden">返回</button>
              <MessageIcon className="h-5 w-5 text-amber-700" />
              <span className="font-black text-slate-950">系统通知</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">暂无系统通知</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${notif.read ? "border-slate-200" : "border-teal-200"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-black text-slate-950">{notif.title}</h3>
                      <span className="text-xs text-slate-400">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{notif.content}</p>
                    {notif.link && <Link href={notif.link} className="mt-3 inline-block text-sm font-bold text-teal-700 hover:underline">查看详情</Link>}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4">
              <button onClick={() => setShowMobileList(true)} className="text-sm font-bold text-slate-500 md:hidden">返回</button>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-teal-700">
                {activeUser?.nickname[0] || activeConversation?.user.nickname[0] || "?"}
              </div>
              <Link href={`/profile/${activeUser?.id || activeConversation?.user.id}`} className="font-black text-slate-950 hover:text-teal-700">
                {activeUser?.nickname || activeConversation?.user.nickname || "用户"}
              </Link>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? (
                <p className="py-12 text-center text-sm text-slate-500">正在加载...</p>
              ) : messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">还没有消息，发送第一条吧。</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <p className={`text-[10px] ${isMe ? "text-teal-600" : "text-slate-400"} mb-1 px-1`}>{formatTime(msg.createdAt)}</p>
                      <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${isMe ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md bg-white text-slate-900"}`}>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="输入消息..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button onClick={handleSend} disabled={!input.trim() || sending} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                  <SendIcon className="h-4 w-4" />
                  {sending ? "发送中" : "发送"}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-sm text-slate-500">加载中...</p>}>
      <MessagesView />
    </Suspense>
  );
}
