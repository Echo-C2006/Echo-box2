import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (user.idVerified) {
      return NextResponse.json({ error: "您已通过实名认证" }, { status: 400 });
    }

    const { realName, school, studentId } = await req.json();

    if (!realName || !school || !studentId) {
      return NextResponse.json({ error: "请填写姓名、学校和学号" }, { status: 400 });
    }

    // 检查学号是否已被其他用户认证
    const existing = await prisma.user.findFirst({
      where: { studentId, idVerified: true, id: { not: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "该学号已被其他账号认证" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { realName, school, studentId, idVerified: true },
      omit: { password: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "实名认证失败" }, { status: 500 });
  }
}
