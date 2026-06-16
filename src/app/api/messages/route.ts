import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    if (Number(receiverId) === user.id) {
      return NextResponse.json({ error: "不能给自己发消息" }, { status: 400 });
    }

    // 检查接收者是否存在
    const receiver = await prisma.user.findUnique({ where: { id: Number(receiverId) } });
    if (!receiver) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        receiverId: Number(receiverId),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get("with");

    if (!withUserId) {
      return NextResponse.json({ error: "缺少参数 with" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: Number(withUserId) },
          { senderId: Number(withUserId), receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    // 将对方发送的未读消息标记为已读
    await prisma.message.updateMany({
      where: {
        senderId: Number(withUserId),
        receiverId: user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ messages });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
