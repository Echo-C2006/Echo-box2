import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const body = await req.json();
    const { nickname, grade, major, bio, skills, experience, interests, timeCommitment } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname,
        grade,
        major,
        bio,
        skills: skills ? JSON.stringify(skills) : undefined,
        experience,
        interests: interests ? JSON.stringify(interests) : undefined,
        timeCommitment,
      },
      omit: { password: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
