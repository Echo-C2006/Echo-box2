import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
