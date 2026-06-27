import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role?: string;
  content?: string;
};

const MAX_CONTENT_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_CONTEXT_CHARS = 6000;
const MIN_AI_TIMEOUT_MS = 30000;

function getOpenAIClient() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || process.env.AI_API_URL,
    timeout: Math.max(Number(process.env.AI_TIMEOUT_MS || MIN_AI_TIMEOUT_MS), MIN_AI_TIMEOUT_MS),
  });
}

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, MAX_CONTEXT_CHARS);
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
  const [profile, teams, myApplications, receivedApplications, recentPosts, competitions] = await Promise.all([
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
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, nickname: true, grade: true, major: true } },
        competition: { select: { id: true, name: true, category: true } },
        _count: { select: { applications: true } },
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
    recentRecruitingPosts: recentPosts.map((post) => ({
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
    competitions,
  };
}

function buildMessages(messages: ChatMessage[], content: string, nickname: string, systemContext: unknown): ChatCompletionMessageParam[] {
  const history: ChatCompletionMessageParam[] = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((msg) => typeof msg.content === "string" && msg.content.trim())
    .map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content!.trim().slice(0, MAX_CONTENT_LENGTH),
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
        "你的回答必须优先围绕下面提供的 Echo-box 平台真实数据，包括当前用户资料、队伍、申请、招募帖和竞赛信息。",
        "不要编造平台里不存在的队伍、成员、申请、比赛或截止日期；如果数据里没有，就明确说“当前系统数据里没有看到”。",
        "当用户问“我”“我的队伍”“我的申请”“推荐谁/哪个队伍/哪个帖子”时，必须结合系统数据回答。",
        "只有在用户明确要求通用建议，或系统数据不足时，才补充通用建议，并说明这是基于经验的建议。",
        "回复必须使用中文，语气专业、直接、可执行。",
        "回答尽量短，先给结论，再列 2-4 条理由或下一步。",
        "",
        "Echo-box 当前系统数据：",
        safeJson(systemContext),
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

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "消息过长" }, { status: 400 });
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ error: "AI_API_KEY 未配置" }, { status: 500 });
    }

    const systemContext = await buildSystemContext(user.id);

    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: buildMessages(messages, content, user.nickname, systemContext),
      temperature: 0.2,
      max_tokens: 800,
      stream: true,
    });

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
