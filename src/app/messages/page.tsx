"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

const NOTIF_ICONS: Record<string, string> = {
  apply: "📩",
  system: "📢",
  message: "💬",
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("to");

  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // 选中项: "system" 或 用户ID
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
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/auth/login");
        }
      });
  }, [router]);

  // 获取会话列表
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // ignore
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // 获取通知（含未读数）
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotifUnread(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
  }, [fetchConversations, fetchNotifications]);

  // 从 URL ?to= 自动打开对话（等待会话列表加载完成）
  useEffect(() => {
    if (toUserId && currentUser && Number(toUserId) !== currentUser.id && !conversationsLoading) {
      openChat(Number(toUserId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toUserId, currentUser, conversationsLoading]);

  // 打开聊天
  const openChat = useCallback(async (userId: number) => {
    setActiveKey(`user-${userId}`);
    setMessagesLoading(true);
    setShowMobileList(false);

    // 尽量从已加载的会话列表取用户信息
    const existing = conversations.find((c) => c.user.id === userId);
    if (existing) {
      setActiveUser(existing.user);
    } else {
      setActiveUser(null);
      try {
        const userRes = await fetch(`/api/users/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setActiveUser(userData.user || userData);
        }
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch(`/api/messages?with=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [conversations]);

  // 打开系统通知
  const openNotifications = useCallback(async () => {
    setActiveKey("system");
    setShowMobileList(false);
    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotifUnread(0);
      }
      // 标记已读
      await fetch("/api/notifications", { method: "PUT" });
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // 轮询新消息和未读
  useEffect(() => {
    if (!activeKey || activeKey === "system") return;
    const userId = Number(activeKey.replace("user-", ""));
    const iv = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?with=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => window.clearInterval(iv);
  }, [activeKey]);

  // 轮询会话列表 + 通知未读数
  useEffect(() => {
    const iv = window.setInterval(() => {
      fetchConversations();
      fetchNotifications();
    }, 5000);
    return () => window.clearInterval(iv);
  }, [fetchConversations, fetchNotifications]);

  // 自动滚到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !activeKey?.startsWith("user-") || sending) return;
    setSending(true);
    const userId = Number(activeKey.replace("user-", ""));
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId, content: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        const msgRes = await fetch(`/api/messages?with=${userId}`);
        if (msgRes.ok) {
          const data = await msgRes.json();
          setMessages(data.messages || []);
        }
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (d.toDateString() === now.toDateString()) return `今天 ${time}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;
    return `${date} ${time}`;
  }

  const activeConversation = conversations.find(
    (c) => `user-${c.user.id}` === activeKey
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-4xl">
      {/* 会话列表 */}
      <div
        className={`w-full flex-shrink-0 border-r border-gray-200 bg-white md:w-80 ${
          showMobileList ? "block" : "hidden md:block"
        }`}
      >
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold text-gray-900">消息</h2>
        </div>

        {conversationsLoading ? (
          <p className="py-8 text-center text-sm text-gray-400">加载中...</p>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
            {/* 系统消息 - 始终在第一个 */}
            <button
              onClick={openNotifications}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                activeKey === "system" ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                🔔
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">系统消息</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {notifications.length > 0
                    ? notifications[0].content
                    : "暂无系统消息"}
                </p>
              </div>
              {notifUnread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                  {notifUnread > 99 ? "99+" : notifUnread}
                </span>
              )}
            </button>

            {/* 用户对话列表 */}
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <p className="text-sm">暂无私信</p>
                <p className="mt-1 text-xs">去广场或人才库找人聊聊吧</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => openChat(conv.user.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    activeKey === `user-${conv.user.id}` ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {conv.user.nickname[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{conv.user.nickname}</span>
                      {conv.lastMessage && (
                        <span className="flex-shrink-0 text-xs text-gray-400">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {conv.lastMessage?.content || "暂无消息"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 右侧面板 - 只有选中了才展示 */}
      {activeKey && (
        <div
          className={`flex flex-1 flex-col bg-gray-50 ${
            !showMobileList ? "block" : "hidden md:flex"
          }`}
        >

        {/* ===== 系统通知面板 ===== */}
        {activeKey === "system" && (
          <>
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <button
                onClick={() => setShowMobileList(true)}
                className="mr-1 text-gray-500 md:hidden"
              >
                ←
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-base">
                🔔
              </div>
              <span className="text-sm font-medium text-gray-900">系统消息</span>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ maxHeight: "calc(100vh - 190px)" }}
            >
              {notifLoading ? (
                <p className="py-8 text-center text-sm text-gray-400">加载中...</p>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">暂无系统消息</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-xl border bg-white p-4 shadow-sm ${
                        notif.read ? "border-gray-200" : "border-indigo-200 bg-indigo-50/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-lg">
                          {NOTIF_ICONS[notif.type] || "📢"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              {notif.title}
                            </span>
                            <span className="flex-shrink-0 text-[10px] text-gray-400">
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-gray-600">
                            {notif.content}
                          </p>
                          {notif.link && (
                            <Link
                              href={notif.link}
                              className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                            >
                              查看详情 →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== 聊天面板 ===== */}
        {activeKey?.startsWith("user-") && (
          <>
            {messagesLoading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                加载中...
              </div>
            ) : (
              <>
                {/* 聊天头部 */}
                <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="mr-1 text-gray-500 md:hidden"
                  >
                    ←
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {activeUser?.nickname[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/profile/${activeUser?.id || activeConversation?.user.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 hover:underline"
                    >
                      {activeUser?.nickname || activeConversation?.user.nickname || "用户"}
                    </Link>
                  </div>
                </div>

                {/* 消息列表 */}
                <div
                  className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
                  style={{ maxHeight: "calc(100vh - 190px)" }}
                >
                  {messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                      暂无消息，发送第一条消息吧
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs rounded-xl px-3 py-2 text-sm leading-relaxed ${
                              isMe
                                ? "rounded-br-sm bg-indigo-600 text-white"
                                : "rounded-bl-sm bg-white text-gray-900 shadow-sm"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`mt-1 text-right text-[10px] ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* 快捷短语 */}
                {messages.length === 0 && (
                  <div className="flex gap-2 overflow-x-auto border-t border-gray-200 bg-white px-4 py-2">
                    {[
                      "你好，我对你的招募很感兴趣",
                      "请问还有名额吗？",
                      "方便聊聊吗？",
                    ].map((text) => (
                      <button
                        key={text}
                        onClick={() => setInput(text)}
                        className="flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}

                {/* 输入框 */}
                <div className="border-t border-gray-200 bg-white px-4 py-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="输入消息..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {sending ? "发送中..." : "发送"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    )}
    </div>
  );
}
