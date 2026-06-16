import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get("competitionId");
    const sort = searchParams.get("sort") || "latest"; // latest, hot, deadline

    const where: any = { status: { in: ["recruiting", "full"] } };
    if (competitionId) {
      where.competitionId = Number(competitionId);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "deadline") {
      orderBy = { expiresAt: "asc" };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      include: {
        author: { select: { id: true, nickname: true, grade: true, major: true } },
        competition: { select: { id: true, name: true, category: true } },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ posts });
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

    const body = await req.json();
    const { title, description, skills, currentSize, targetSize, competitionId, expiresDays } = body;

    if (!title || !competitionId || !targetSize) {
      return NextResponse.json({ error: "请填写必填项" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresDays || 14));

    const post = await prisma.post.create({
      data: {
        title,
        description: description || "",
        skills: skills ? JSON.stringify(skills) : null,
        currentSize: Number(currentSize) || 1,
        targetSize: Number(targetSize),
        competitionId: Number(competitionId),
        authorId: user.id,
        expiresAt,
      },
    });

    // 自动创建队伍
    await prisma.team.create({
      data: {
        name: title,
        postId: post.id,
        members: {
          create: {
            userId: user.id,
            role: "captain",
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
