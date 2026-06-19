import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "请填写邮箱" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // 不暴露邮箱是否存在，统一返回成功
      return NextResponse.json({ message: "如果该邮箱已注册，重置链接已发送" });
    }

    // 过期旧的未使用的 token
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    // 生成新 token（1 小时有效）
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // 开发环境直接返回 token，方便测试
    // 生产环境应通过邮件发送
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "如果该邮箱已注册，重置链接已发送",
        debugToken: token,
      });
    }

    // TODO: 发送邮件
    // await sendResetEmail(email, token);

    return NextResponse.json({ message: "如果该邮箱已注册，重置链接已发送" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "请求失败，请稍后重试" }, { status: 500 });
  }
}
