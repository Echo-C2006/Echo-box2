import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { postId, reason } = await req.json();
    if (!postId || !reason?.trim()) {
      return NextResponse.json({ error: "请填写申请理由" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: { team: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    if (post.authorId === user.id) {
      return NextResponse.json({ error: "不能申请自己的队伍" }, { status: 400 });
    }

    const existing = await prisma.application.findFirst({
      where: { postId: Number(postId), applicantId: user.id, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "你已经申请过了" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        postId: Number(postId),
        applicantId: user.id,
        captainId: post.authorId,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "申请失败" }, { status: 500 });
  }
}
