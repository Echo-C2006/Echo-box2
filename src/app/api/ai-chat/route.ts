import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role?: string;
  content?: string;
};

const MAX_HISTORY_MESSAGES = 10;

function getOpenAIClient() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || process.env.AI_API_URL,
  });
}

type SystemContext = Awaited<ReturnType<typeof buildSystemContext>>;

function fmtDate(value: Date | string | null | undefined) {
  if (!value) return "未设置";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "未设置" : date.toISOString().slice(0, 10);
}

function fmtArr(value: unknown) {
  return Array.isArray(value) && value.length ? value.join("、") : "无";
}

function formatContextText(context: SystemContext) {
  const lines: string[] = [];

  const me = context.currentUser;
  lines.push("【当前用户资料】");
  if (me) {
    lines.push(
      `昵称：${me.nickname}；年级：${me.grade || "未填写"}；专业：${me.major || "未填写"}；实名认证：${me.idVerified ? "已认证" : "未认证"}`,
      `简介：${me.bio || "无"}`,
      `技能：${fmtArr(me.skills)}；兴趣：${fmtArr(me.interests)}`,
      `经历：${me.experience || "无"}；时间投入：${me.timeCommitment || "未填写"}`
    );
  } else {
    lines.push("无");
  }

  lines.push("", "【我的队伍】");
  if (context.myTeams.length) {
    context.myTeams.forEach((team, i) => {
      lines.push(
        `${i + 1}. 队伍「${team.name}」(ID:${team.id})，状态：${team.status}，进度：${team.progress || "无"}`,
        `   关联帖子：${team.post.title}（竞赛：${team.post.competition?.name || "无"}），招募 ${team.post.currentSize}/${team.post.targetSize}`,
        `   成员：${team.members.map((m) => `${m.user.nickname}(${m.role}，${m.user.major || "未知专业"}，技能:${fmtArr(m.user.skills)})`).join("；") || "无"}`
      );
    });
  } else {
    lines.push("无");
  }

  lines.push("", "【我发出的申请】");
  if (context.myApplications.length) {
    context.myApplications.forEach((app, i) => {
      lines.push(`${i + 1}. 申请帖子「${app.post?.title || "未知"}」，状态：${app.status}，理由：${app.reason || "无"}`);
    });
  } else {
    lines.push("无");
  }

  lines.push("", "【收到的入队申请】");
  if (context.applicationsToMyTeams.length) {
    context.applicationsToMyTeams.forEach((app, i) => {
      lines.push(
        `${i + 1}. 申请人 ${app.applicant.nickname}（${app.applicant.grade || "未知年级"} ${app.applicant.major || "未知专业"}，技能:${fmtArr(app.applicant.skills)}）申请「${app.post?.title || "未知"}」，状态：${app.status}，理由：${app.reason || "无"}`
      );
    });
  } else {
    lines.push("无");
  }

  lines.push("", "【招募中的帖子】");
  if (context.recruitingPosts.length) {
    context.recruitingPosts.forEach((post, i) => {
      lines.push(
        `${i + 1}. 「${post.title}」(ID:${post.id})，发布者：${post.author?.nickname || "未知"}，竞赛：${post.competition?.name || "无"}`,
        `   需求技能：${fmtArr(post.skills)}，招募 ${post.currentSize}/${post.targetSize}，已有申请 ${post.applicationCount} 人，截止：${fmtDate(post.expiresAt)}`,
        `   描述：${post.description || "无"}`
      );
    });
  } else {
    lines.push("无");
  }

  lines.push("", `【人才库（共 ${context.talentPool.length} 位注册用户，已全部列出）】`);
  if (context.talentPool.length) {
    context.talentPool.forEach((u, i) => {
      lines.push(
        `${i + 1}. ${u.nickname}(ID:${u.id})｜${u.grade || "未知年级"}｜${u.major || "未知专业"}｜技能:${fmtArr(u.skills)}｜兴趣:${fmtArr(u.interests)}｜时间投入:${u.timeCommitment || "未填写"}`,
        `   简介:${u.bio || "无"}；经历:${u.experience || "无"}`
      );
    });
  } else {
    lines.push("无");
  }

  lines.push("", "【竞赛信息】");
  if (context.competitions.length) {
    context.competitions.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.name}（${c.category}），截止：${fmtDate(c.deadline)}`);
    });
  } else {
    lines.push("无");
  }

  return lines.join("\n");
}

function parseJsonList(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function buildSystemContext(userId: number) {
  const [profile, teams, myApplications, receivedApplications, posts, users, competitions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        grade: true,
        major: true,
        bio: true,
        skills: true,
        experience: true,
        interests: true,
        timeCommitment: true,
        idVerified: true,
      },
    }),
    prisma.team.findMany({
      where: { members: { some: { userId } } },
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
            currentSize: true,
            targetSize: true,
            status: true,
            expiresAt: true,
            competition: { select: { id: true, name: true, category: true } },
          },
        },
        members: {
          select: {
            role: true,
            user: { select: { id: true, nickname: true, grade: true, major: true, skills: true } },
          },
        },
      },
    }),
    prisma.application.findMany({
      where: { applicantId: userId },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            status: true,
            currentSize: true,
            targetSize: true,
            competition: { select: { id: true, name: true, category: true } },
            author: { select: { id: true, nickname: true } },
          },
        },
      },
    }),
    prisma.application.findMany({
      where: { captainId: userId },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        applicant: { select: { id: true, nickname: true, grade: true, major: true, skills: true, bio: true } },
        post: { select: { id: true, title: true, status: true } },
      },
    }),
    prisma.post.findMany({
      where: { status: "recruiting" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, nickname: true, grade: true, major: true } },
        competition: { select: { id: true, name: true, category: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.user.findMany({
      where: { id: { not: userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nickname: true,
        grade: true,
        major: true,
        bio: true,
        skills: true,
        interests: true,
        experience: true,
        timeCommitment: true,
      },
    }),
    prisma.competition.findMany({
      take: 20,
      orderBy: { deadline: "asc" },
      select: { id: true, name: true, category: true, deadline: true },
    }),
  ]);

  return {
    currentUser: profile
      ? {
          ...profile,
          skills: parseJsonList(profile.skills),
          interests: parseJsonList(profile.interests),
        }
      : null,
    myTeams: teams.map((team) => ({
      id: team.id,
      name: team.name,
      status: team.status,
      announcement: team.announcement,
      progress: team.progress,
      post: {
        ...team.post,
        skills: parseJsonList(team.post.skills),
      },
      members: team.members.map((member) => ({
        role: member.role,
        user: {
          ...member.user,
          skills: parseJsonList(member.user.skills),
        },
      })),
    })),
    myApplications: myApplications.map((application) => ({
      id: application.id,
      reason: application.reason,
      status: application.status,
      createdAt: application.createdAt,
      post: application.post,
    })),
    applicationsToMyTeams: receivedApplications.map((application) => ({
      id: application.id,
      reason: application.reason,
      status: application.status,
      createdAt: application.createdAt,
      applicant: {
        ...application.applicant,
        skills: parseJsonList(application.applicant.skills),
      },
      post: application.post,
    })),
    recruitingPosts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      skills: parseJsonList(post.skills),
      currentSize: post.currentSize,
      targetSize: post.targetSize,
      expiresAt: post.expiresAt,
      author: post.author,
      competition: post.competition,
      applicationCount: post._count.applications,
    })),
    talentPool: users.map((user) => ({
      ...user,
      skills: parseJsonList(user.skills),
      interests: parseJsonList(user.interests),
    })),
    competitions,
  };
}

function buildMessages(messages: ChatMessage[], content: string, nickname: string, systemContext: SystemContext): ChatCompletionMessageParam[] {
  const history: ChatCompletionMessageParam[] = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((msg) => typeof msg.content === "string" && msg.content.trim())
    .map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content!.trim(),
    }));

  if (history.length === 0 || history.at(-1)?.content !== content) {
    history.push({ role: "user", content });
  }

  return [
    {
      role: "system",
      content: [
        "你是 Echo-box 的 AI 助手，服务于高校竞赛组队平台。",
        `当前用户昵称：${nickname}。`,
        "你的回答必须优先围绕下面提供的 Echo-box 平台真实数据，包括当前用户资料、队伍、申请、招募帖、竞赛信息和人才库（talentPool，即所有注册用户）。",
        "当用户要求从人才库找人、推荐队友、筛选合适人选时，你必须从 talentPool 数据中查找匹配的用户，不要回答“没有提供这个数据”。",
        "不要编造平台里不存在的队伍、成员、申请、比赛、用户或截止日期；如果数据里没有，就明确说“当前系统数据里没有看到”。",
        "当用户问“我”“我的队伍”“我的申请”“推荐谁/哪个队伍/哪个帖子”时，必须结合系统数据回答。",
        "只有在用户明确要求通用建议，或系统数据不足时，才补充通用建议，并说明这是基于经验的建议。",
        "回复必须使用中文，语气专业、直接、可执行。",
        "回答尽量短，先给结论，再列 2-4 条理由或下一步。",
        "",
        "Echo-box 当前系统数据：",
        formatContextText(systemContext),
      ].join("\n"),
    },
    ...history,
  ];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];

    if (!content) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ error: "AI_API_KEY 未配置" }, { status: 500 });
    }

    const systemContext = await buildSystemContext(user.id);

    const params: ChatCompletionCreateParamsStreaming = {
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: buildMessages(messages, content, user.nickname, systemContext),
      temperature: 0.2,
      max_tokens: 8192,
      stream: true,
    };
    // 关闭 deepseek 思考模式，正文直接走 content
    Object.assign(params, { thinking: { type: "disabled" } });

    const stream = await client.chat.completions.create(params);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (error) {
          console.error("AI stream failed:", error);
          controller.enqueue(encoder.encode("\n\n模型连接中断，请稍后重试。"));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("AI chat failed:", error);
    return NextResponse.json({ error: "AI 助手暂时不可用" }, { status: 500 });
  }
}
