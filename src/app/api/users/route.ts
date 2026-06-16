import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const skills = searchParams.get("skills") || "";
    const grade = searchParams.get("grade") || "";
    const major = searchParams.get("major") || "";
    const interest = searchParams.get("interest") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { bio: { contains: search } },
        { major: { contains: search } },
      ];
    }

    if (grade) {
      where.grade = { contains: grade };
    }

    if (major) {
      where.major = { contains: major };
    }

    // skills and interests are JSON strings, filter in application layer
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      omit: { password: true },
    });

    let filtered = users;

    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (skillList.length > 0) {
        filtered = filtered.filter((u) => {
          if (!u.skills) return false;
          try {
            const userSkills: string[] = JSON.parse(u.skills);
            return skillList.some((s) => userSkills.some((us) => us.toLowerCase().includes(s)));
          } catch {
            return false;
          }
        });
      }
    }

    if (interest) {
      const interestList = interest.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (interestList.length > 0) {
        filtered = filtered.filter((u) => {
          if (!u.interests) return false;
          try {
            const userInterests: string[] = JSON.parse(u.interests);
            return interestList.some((s) => userInterests.some((ui) => ui.toLowerCase().includes(s)));
          } catch {
            return false;
          }
        });
      }
    }

    return NextResponse.json({ users: filtered });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
