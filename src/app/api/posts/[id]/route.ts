import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: { id: true, nickname: true, grade: true, major: true, bio: true, skills: true },
        },
        competition: { select: { id: true, name: true, category: true } },
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, nickname: true, avatar: true } },
              },
            },
          },
        },
        applications: {
          select: { id: true, status: true, applicantId: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
