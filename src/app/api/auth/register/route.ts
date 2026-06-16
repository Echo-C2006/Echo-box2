import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname, grade, major } = await req.json();

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: "请填写必填项" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, nickname, grade, major },
      omit: { password: true },
    });

    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
