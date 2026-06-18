import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const mine = searchParams.get("mine");

    // 查看自己的申请记录
    if (mine === "true") {
      const applications = await prisma.application.findMany({
        where: { applicantId: user.id },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              status: true,
              currentSize: true,
              targetSize: true,
              competition: { select: { id: true, name: true } },
              author: { select: { id: true, nickname: true } },
              team: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ applications });
    }

    // 队长查看某队伍的申请
    if (!teamId) {
      return NextResponse.json({ error: "缺少 teamId 参数" }, { status: 400 });
    }

    // 验证队长身份
    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) },
      include: { members: true },
    });

    if (!team) return NextResponse.json({ error: "队伍不存在" }, { status: 404 });

    const isCaptain = team.members.some((m) => m.userId === user.id && m.role === "captain");
    if (!isCaptain) return NextResponse.json({ error: "只有队长可以查看申请" }, { status: 403 });

    // 获取该队伍关联帖子的所有申请（含申请人信息）
    const applications = await prisma.application.findMany({
      where: { postId: team.postId },
      include: {
        applicant: {
          select: { id: true, nickname: true, avatar: true, grade: true, major: true, skills: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

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

    if (post.status === "full" || post.currentSize >= post.targetSize) {
      return NextResponse.json({ error: "该队伍已满员，暂不接受申请" }, { status: 409 });
    }

    if (post.authorId === user.id) {
      return NextResponse.json({ error: "不能申请自己的队伍" }, { status: 400 });
    }

    // 检查是否已经是队员
    if (post.team) {
      const alreadyMember = await prisma.teamMember.findFirst({
        where: { teamId: post.team.id, userId: user.id },
      });
      if (alreadyMember) {
        return NextResponse.json({ error: "你已经是该队伍的成员了" }, { status: 409 });
      }
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

    // 创建通知给队长
    await prisma.notification.create({
      data: {
        type: "apply",
        userId: post.authorId,
        title: "新的申请",
        content: `${user.nickname} 申请加入你的队伍「${post.title}」`,
        link: `/post/${post.id}`,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "申请失败" }, { status: 500 });
  }
}
