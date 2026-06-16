import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取当前用户参与的所有会话：
    // - 自己发送的消息 → receiver 就是对话对象
    // - 自己接收的消息 → sender 就是对话对象
    // 去重后拿到每个对话方的最新消息和未读数
    const sent = await prisma.message.findMany({
      where: { senderId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        receiver: { select: { id: true, nickname: true, avatar: true } },
      },
      distinct: ["receiverId"],
      take: 50,
    });

    const received = await prisma.message.findMany({
      where: { receiverId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, nickname: true, avatar: true } },
      },
      distinct: ["senderId"],
      take: 50,
    });

    // 合并用户列表（去重）
    const userMap = new Map<number, { id: number; nickname: string; avatar: string | null }>();

    for (const m of sent) {
      userMap.set(m.receiver.id, m.receiver);
    }
    for (const m of received) {
      userMap.set(m.sender.id, m.sender);
    }

    // 为每个对话方获取最新消息和未读数量
    const conversations = await Promise.all(
      Array.from(userMap.keys()).map(async (otherUserId) => {
        const [lastMessage] = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: user.id,
            readAt: null,
          },
        });

        const otherUser = userMap.get(otherUserId)!;

        return {
          user: otherUser,
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    // 按最后消息时间倒序排列
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt.getTime() || 0;
      const timeB = b.lastMessage?.createdAt.getTime() || 0;
      return timeB - timeA;
    });

    return NextResponse.json({ conversations });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
