import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            targetSize: true,
            currentSize: true,
            competition: { select: { id: true, name: true } },
            author: { select: { id: true, nickname: true } },
          },
        },
        members: {
          include: {
            user: { select: { id: true, nickname: true, avatar: true, grade: true, major: true } },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "队伍不存在" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: { members: true },
    });

    if (!team) return NextResponse.json({ error: "队伍不存在" }, { status: 404 });

    const isCaptain = team.members.some((m) => m.userId === user.id && m.role === "captain");
    if (!isCaptain) return NextResponse.json({ error: "无权操作" }, { status: 403 });

    const body = await req.json();
    const { name, status, announcement, progress, externalLinks } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (announcement !== undefined) updateData.announcement = announcement;
    if (progress !== undefined) updateData.progress = progress;
    if (externalLinks !== undefined) updateData.externalLinks = JSON.stringify(externalLinks);

    const updated = await prisma.team.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({ team: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
