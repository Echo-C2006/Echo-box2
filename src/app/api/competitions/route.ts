import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    });
    return NextResponse.json({ competitions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
