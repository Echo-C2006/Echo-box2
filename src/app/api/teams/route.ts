import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");

    if (mine === "true") {
      // 返回当前用户所在的队伍（作为队长或队员）
      const memberships = await prisma.teamMember.findMany({
        where: { userId: user.id },
        include: {
          team: {
            include: {
              post: { select: { id: true, title: true } },
              _count: { select: { members: true } },
            },
          },
        },
      });
      const teams = memberships.map((m) => m.team);
      return NextResponse.json({ teams });
    }

    return NextResponse.json({ teams: [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
