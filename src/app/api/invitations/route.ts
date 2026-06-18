import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { targetUserId, teamId, message } = await req.json();
    if (!targetUserId || !teamId) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) },
      include: { post: true, members: true },
    });

    if (!team) {
      return NextResponse.json({ error: "队伍不存在" }, { status: 404 });
    }

    if (team.post.status === "full" || team.post.currentSize >= team.post.targetSize) {
      return NextResponse.json({ error: "该队伍已满员，无法邀请新成员" }, { status: 409 });
    }

    const isCaptain = team.members.some((m) => m.userId === user.id && m.role === "captain");
    if (!isCaptain) {
      return NextResponse.json({ error: "只有队长可以邀请" }, { status: 403 });
    }

    // 检查是否已在队伍中
    const alreadyMember = team.members.some((m) => m.userId === Number(targetUserId));
    if (alreadyMember) {
      return NextResponse.json({ error: "该用户已在队伍中" }, { status: 409 });
    }

    // 检查是否已邀请过
    const existing = await prisma.application.findFirst({
      where: {
        postId: team.postId,
        applicantId: Number(targetUserId),
        status: "pending",
      },
    });
    if (existing) {
      return NextResponse.json({ error: "已向该用户发出过邀请" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        postId: team.postId,
        applicantId: Number(targetUserId),
        captainId: user.id,
        reason: message || `${user.nickname} 邀请你加入队伍「${team.name}」`,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "邀请失败" }, { status: 500 });
  }
}
