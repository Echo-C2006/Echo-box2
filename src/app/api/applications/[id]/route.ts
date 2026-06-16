import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json(); // "accept" | "reject"

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "无效操作，请使用 accept 或 reject" }, { status: 400 });
    }

    // 获取申请记录
    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        post: {
          include: { team: { include: { members: true } } },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "申请不存在" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "该申请已被处理" }, { status: 409 });
    }

    // 验证操作者是该帖子的队长
    const team = application.post.team;
    if (!team) return NextResponse.json({ error: "队伍不存在" }, { status: 404 });

    const isCaptain = team.members.some((m) => m.userId === user.id && m.role === "captain");
    if (!isCaptain) return NextResponse.json({ error: "只有队长可以处理申请" }, { status: 403 });

    if (action === "accept") {
      // 检查是否已满
      const memberCount = team.members.length;
      const targetSize = application.post.targetSize;
      if (memberCount >= targetSize) {
        return NextResponse.json({ error: "队伍已满" }, { status: 409 });
      }

      // 检查是否已在队伍中
      const alreadyMember = team.members.some((m) => m.userId === application.applicantId);
      if (alreadyMember) {
        return NextResponse.json({ error: "该用户已在队伍中" }, { status: 409 });
      }

      // 事务：更新申请状态 + 添加成员 + 更新帖子当前人数
      await prisma.$transaction([
        prisma.application.update({
          where: { id: Number(id) },
          data: { status: "accepted" },
        }),
        prisma.teamMember.create({
          data: {
            userId: application.applicantId,
            teamId: team.id,
            role: "member",
          },
        }),
        prisma.post.update({
          where: { id: application.postId },
          data: { currentSize: { increment: 1 } },
        }),
      ]);

      // 如果队伍已满，自动关闭帖子
      if (memberCount + 1 >= targetSize) {
        await prisma.post.update({
          where: { id: application.postId },
          data: { status: "full" },
        });
        await prisma.team.update({
          where: { id: team.id },
          data: { status: "preparing" },
        });
      }

      return NextResponse.json({ success: true, status: "accepted" });
    } else {
      // reject
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status: "rejected" },
      });

      return NextResponse.json({ success: true, status: "rejected" });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
