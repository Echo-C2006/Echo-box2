import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultCompetitions } from "../src/lib/competitions";

const prisma = new PrismaClient();

const NOW = new Date();
const DAY = 86400000;

function daysFromNow(n: number) {
  return new Date(NOW.getTime() + n * DAY);
}

function daysAgo(n: number) {
  return new Date(NOW.getTime() - n * DAY);
}

const COMPETITION_IDS: Record<string, number> = {};

/* ---------- 用户数据 ---------- */

interface UserSeed {
  nickname: string;
  grade: string;
  major: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience: string;
  timeCommitment: string;
  profileTipSeen: boolean;
  createdAt: Date;
}

const USERS: UserSeed[] = [
  {
    nickname: "张明", grade: "大三", major: "计算机科学与技术",
    bio: "ACM金牌选手，省级数模一等奖，擅长算法建模与数据分析。",
    skills: ["Python", "PyTorch", "MATLAB", "LaTeX", "C++"],
    interests: ["数学建模", "程序设计"],
    experience: "全国大学生数学建模竞赛省一、ACM-ICPC区域赛银牌",
    timeCommitment: "每周可投入20小时",
    profileTipSeen: true,
    createdAt: daysAgo(60),
  },
  {
    nickname: "李雪", grade: "大二", major: "软件工程",
    bio: "全栈开发经验丰富，参与过多个校园创业项目，执行力强。",
    skills: ["Java", "Spring Boot", "Vue.js", "MySQL", "Git"],
    interests: ["程序设计", "创新创业"],
    experience: "校级创新创业项目负责人",
    timeCommitment: "每周可投入15小时",
    profileTipSeen: true,
    createdAt: daysAgo(55),
  },
  {
    nickname: "王浩然", grade: "研一", major: "数学",
    bio: "本科数学专业保研，数模竞赛经验丰富，擅长论文写作与模型推导。",
    skills: ["Python", "R", "LaTeX", "MATLAB", "SPSS"],
    interests: ["数学建模"],
    experience: "国赛省一、美赛M奖、研究生建模国赛二等奖",
    timeCommitment: "每周可投入25小时",
    profileTipSeen: true,
    createdAt: daysAgo(50),
  },
  {
    nickname: "陈思琪", grade: "大四", major: "电子信息工程",
    bio: "保研中科院，电子设计竞赛国二，嵌入式开发经验丰富。",
    skills: ["C++", "仿真", "电路设计", "嵌入式", "PCB设计"],
    interests: ["电子工程", "机器人"],
    experience: "全国大学生电子设计竞赛国家二等奖",
    timeCommitment: "每周可投入20小时",
    profileTipSeen: true,
    createdAt: daysAgo(45),
  },
  {
    nickname: "刘宇轩", grade: "大三", major: "机械工程",
    bio: "机械设计能力突出，熟练使用三维建模软件，有竞赛获奖经历。",
    skills: ["SolidWorks", "AutoCAD", "C++", "ANSYS", "3D打印"],
    interests: ["机械工程", "机器人"],
    experience: "全国大学生机械创新设计大赛省一等奖",
    timeCommitment: "每周可投入18小时",
    profileTipSeen: true,
    createdAt: daysAgo(40),
  },
  {
    nickname: "赵雨桐", grade: "大三", major: "自动化",
    bio: "RoboMaster参赛经历，负责视觉与控制算法，熟悉ROS系统。",
    skills: ["Python", "ROS", "嵌入式", "OpenCV", "Linux"],
    interests: ["机器人", "电子工程"],
    experience: "RoboMaster 2025 机甲大师赛全国二等奖",
    timeCommitment: "每周可投入20小时",
    profileTipSeen: true,
    createdAt: daysAgo(35),
  },
  {
    nickname: "杨诗涵", grade: "大二", major: "英语",
    bio: "英语专业成绩前5%，外研社演讲省一等奖，擅长英文写作与口语表达。",
    skills: ["英语写作", "演讲", "翻译", "文案策划", "Office"],
    interests: ["英语", "创新创业"],
    experience: "外研社·国才杯英语演讲大赛省一等奖",
    timeCommitment: "每周可投入12小时",
    profileTipSeen: true,
    createdAt: daysAgo(30),
  },
  {
    nickname: "郑子豪", grade: "大四", major: "土木工程",
    bio: "结构设计竞赛国赛经验，已获央企offer，想在校最后阶段再冲一次竞赛。",
    skills: ["MIDAS", "CAD", "Revit", "PKPM", "MATLAB"],
    interests: ["土木工程", "创新创业"],
    experience: "全国大学生结构设计竞赛国家二等奖",
    timeCommitment: "每周可投入15小时",
    profileTipSeen: true,
    createdAt: daysAgo(25),
  },
  {
    nickname: "孙雨薇", grade: "研一", major: "艺术设计",
    bio: "视觉设计专业研究生，擅长UI/UX与品牌设计，有互联网公司实习经验。",
    skills: ["Photoshop", "Illustrator", "Figma", "Premiere", "UI设计"],
    interests: ["艺术设计", "创新创业"],
    experience: "全国大学生广告艺术大赛国家三等奖",
    timeCommitment: "每周可投入20小时",
    profileTipSeen: true,
    createdAt: daysAgo(20),
  },
  {
    nickname: "周博文", grade: "大三", major: "计算机科学与技术",
    bio: "Codeforces 1800+，擅长算法竞赛与高性能计算，在投CCF论文一篇。",
    skills: ["C++", "Python", "CUDA", "算法", "数据结构"],
    interests: ["程序设计", "数学建模"],
    experience: "ACM-ICPC区域赛银牌、CCPC省赛金奖",
    timeCommitment: "每周可投入25小时",
    profileTipSeen: true,
    createdAt: daysAgo(15),
  },
  {
    nickname: "吴佳怡", grade: "大二", major: "数学",
    bio: "数学专业大二，数模入门一年已获省奖，学习能力强、时间充裕。",
    skills: ["Python", "SPSS", "统计分析", "LaTeX", "Excel"],
    interests: ["数学建模"],
    experience: "全国大学生数学建模竞赛省三等奖",
    timeCommitment: "每周可投入20小时",
    profileTipSeen: true,
    createdAt: daysAgo(10),
  },
  {
    nickname: "林志远", grade: "大三", major: "软件工程",
    bio: "微服务与云原生方向，参与过开源项目贡献，后端开发经验丰富。",
    skills: ["Go", "微服务", "Docker", "Kubernetes", "Redis"],
    interests: ["程序设计", "创新创业"],
    experience: "腾讯开源之夏参与者、蓝桥杯省一等奖",
    timeCommitment: "每周可投入18小时",
    profileTipSeen: true,
    createdAt: daysAgo(5),
  },
];

/* ---------- 帖子数据 ---------- */

interface PostSeed {
  title: string;
  description: string;
  skills: string[];
  currentSize: number;
  targetSize: number;
  status: string;
  competitionIndex: number; // index in defaultCompetitions
  authorIndex: number;     // index in USERS
  memberIndices: number[]; // additional team members (index)
  createdAt: Date;
  expiresAt: Date;
}

const POSTS: PostSeed[] = [
  {
    title: "数学建模国赛队友招募",
    description: "今年数模国赛（9月）目标冲击国一！目前已有两位核心成员：一名建模手（数模省一）和一名编程手（ACM银牌），现招募一名论文写作/英文翻译同学。要求：有数模参赛经验，熟悉LaTeX排版，英语阅读能力强。有意向的同学欢迎联系！",
    skills: ["LaTeX", "MATLAB", "论文写作", "英文阅读"],
    currentSize: 2,
    targetSize: 3,
    status: "recruiting",
    competitionIndex: 0, // 全国大学生数学建模竞赛
    authorIndex: 0,      // 张明(队长)
    memberIndices: [9],  // 周博文
    createdAt: daysAgo(7),
    expiresAt: daysFromNow(30),
  },
  {
    title: "美赛MCM/ICM 冲刺F奖",
    description: "美赛2027年2月开赛，目前已有一名建模手（研一数学，美赛M奖）和一名编程手（国赛省一），需再找一名英文写作能力强的队友。要求：理工科背景，CET-6 550+或雅思6.5+，有美赛或英语论文写作经验优先。",
    skills: ["英语写作", "LaTeX", "MATLAB", "R"],
    currentSize: 2,
    targetSize: 4,
    status: "recruiting",
    competitionIndex: 1, // 美国大学生数学建模竞赛
    authorIndex: 2,      // 王浩然(队长)
    memberIndices: [10], // 吴佳怡
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(60),
  },
  {
    title: "挑战杯创业计划赛招募队友",
    description: "项目主题是AI+教育，目前已完成技术原型（Web端+小程序），有成熟的产品Demo。现招募：商业计划书撰写1人（商科/有创业赛经验优先）、视觉设计1人（PPT美化/UI设计）。项目已进入校赛复赛，目标冲击省金！",
    skills: ["商业计划", "PPT设计", "Figma", "文案策划"],
    currentSize: 3,
    targetSize: 4,
    status: "full",
    competitionIndex: 2, // 挑战杯
    authorIndex: 3,      // 陈思琪(队长)
    memberIndices: [1, 8], // 李雪、孙雨薇
    createdAt: daysAgo(14),
    expiresAt: daysFromNow(20),
  },
  {
    title: "ACM-ICPC 区域赛冲刺队友",
    description: "本人Codeforces 1800+，去年区域赛银牌，今年目标冲金。想找1-2名算法基础扎实的同学组队参加下半年区域赛。要求：CF 1600+ 或同等水平，熟悉各类算法与数据结构，肯刷题肯复盘。一起打训练赛！",
    skills: ["C++", "算法", "数据结构", "DP", "图论"],
    currentSize: 1,
    targetSize: 3,
    status: "recruiting",
    competitionIndex: 4, // ACM-ICPC
    authorIndex: 9,      // 周博文(队长)
    memberIndices: [],
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(45),
  },
  {
    title: "蓝桥杯省赛保奖冲刺组队",
    description: "蓝桥杯省赛还剩两个月，想找1名队友一起刷题备赛。本人Java组省一，计划每天2-3道真题，周末集中复盘。最好同报Java组或C/C++组，可以互相讲题、分享解题思路。目标：省一冲击国赛！",
    skills: ["Java", "算法", "刷题", "LeetCode"],
    currentSize: 1,
    targetSize: 2,
    status: "recruiting",
    competitionIndex: 6, // 蓝桥杯
    authorIndex: 11,     // 林志远(队长)
    memberIndices: [],
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(50),
  },
  {
    title: "RoboMaster 2027 机甲大师赛",
    description: "去年国二，今年目标冠军！现有老队员4人（控制/视觉/机械/电控各一），需招募机械设计1人负责云台和底盘结构优化。要求：熟练SolidWorks，有机械竞赛经验，能暑期留校备赛。",
    skills: ["SolidWorks", "机械设计", "3D打印", "ANSYS"],
    currentSize: 4,
    targetSize: 5,
    status: "recruiting",
    competitionIndex: 8, // RoboMaster
    authorIndex: 5,      // 赵雨桐(队长)
    memberIndices: [4],  // 刘宇轩
    createdAt: daysAgo(10),
    expiresAt: daysFromNow(90),
  },
  {
    title: "电子设计竞赛国赛组队",
    description: "电赛国二团队招募新队员！我们去年做的无人机测距项目获国二，今年想做智能车方向。目前有嵌入式、电路、算法各一人，需要再招一名机械结构设计同学。有电赛/智能车经验者优先。",
    skills: ["电路设计", "嵌入式", "C++", "PCB设计"],
    currentSize: 3,
    targetSize: 3,
    status: "full",
    competitionIndex: 7, // 全国大学生电子设计竞赛
    authorIndex: 4,      // 刘宇轩(队长)
    memberIndices: [3, 5], // 陈思琪、赵雨桐
    createdAt: daysAgo(12),
    expiresAt: daysFromNow(40),
  },
  {
    title: "外研社英语演讲大赛备赛小组",
    description: "想找一名同样热爱英语演讲的同学一起备赛外研社·国才杯。我们可以每周线下对练、互相点评、模拟即兴演讲。本人去年省一等奖，今年目标冲国赛。希望你英语口语流利、有参赛热情。",
    skills: ["英语演讲", "英语写作", "口语表达"],
    currentSize: 1,
    targetSize: 2,
    status: "recruiting",
    competitionIndex: 10, // 外研社·国才杯
    authorIndex: 6,       // 杨诗涵(队长)
    memberIndices: [],
    createdAt: daysAgo(4),
    expiresAt: daysFromNow(60),
  },
  {
    title: "互联网+大赛全能团队补位",
    description: "项目是做智慧校园Saas平台，目前已有完整产品。团队5人缺一位擅长UI/UX设计的同学，负责产品界面美化和路演PPT包装。如果你会Figma或Sketch，对校园创业感兴趣，欢迎加入我们！",
    skills: ["Figma", "UI设计", "品牌设计", "Premiere"],
    currentSize: 4,
    targetSize: 5,
    status: "recruiting",
    competitionIndex: 3, // 互联网+
    authorIndex: 7,      // 郑子豪(队长)
    memberIndices: [1, 9], // 李雪、周博文
    createdAt: daysAgo(6),
    expiresAt: daysFromNow(25),
  },
  {
    title: "计算机设计大赛-微课赛项",
    description: "做一门关于《计算机组成原理》的交互式微课，结合动画演示和互动小游戏。目前已有策划和编程同学，需要一名美术功底好的同学负责角色设计、场景绘制和动效制作。限大二大三，时间充裕者优先。",
    skills: ["Photoshop", "Illustrator", "动画设计", "Premiere"],
    currentSize: 2,
    targetSize: 3,
    status: "recruiting",
    competitionIndex: 5, // 中国大学生计算机设计大赛
    authorIndex: 8,      // 孙雨薇(队长)
    memberIndices: [1],  // 李雪
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(35),
  },
];

/* ---------- 申请数据 ---------- */

const APPLICATIONS: { postIndex: number; applicantIndex: number; status: string; createdAt: Date }[] = [
  { postIndex: 0, applicantIndex: 10, status: "pending", createdAt: daysAgo(1) },     // 吴佳怡 -> 张明队伍
  { postIndex: 1, applicantIndex: 6, status: "accepted", createdAt: daysAgo(3) },     // 杨诗涵 -> 王浩然队伍
  { postIndex: 3, applicantIndex: 11, status: "pending", createdAt: daysAgo(1) },     // 林志远 -> 周博文队伍
  { postIndex: 4, applicantIndex: 10, status: "accepted", createdAt: daysAgo(1) },    // 吴佳怡 -> 林志远队伍
  { postIndex: 5, applicantIndex: 2, status: "pending", createdAt: daysAgo(2) },      // 王浩然 -> 赵雨桐队伍
  { postIndex: 7, applicantIndex: 0, status: "rejected", createdAt: daysAgo(5) },     // 张明 -> 杨诗涵队伍
  { postIndex: 8, applicantIndex: 11, status: "pending", createdAt: daysAgo(1) },     // 林志远 -> 郑子豪队伍
  { postIndex: 9, applicantIndex: 6, status: "accepted", createdAt: daysAgo(1) },     // 杨诗涵 -> 孙雨薇队伍
];

/* ---------- 消息数据 ---------- */

const MESSAGES: { from: number; to: number; content: string; createdAt: Date }[] = [
  { from: 10, to: 0, content: "学长你好，我对数学建模国赛很感兴趣，目前正在学习LaTeX和MATLAB，可以申请加入吗？", createdAt: daysAgo(1) },
  { from: 0, to: 10, content: "你好！有数模基础吗？之前参加过什么比赛？", createdAt: daysAgo(0.9) },
  { from: 10, to: 0, content: "参加过国赛省三，会基本的LaTeX排版，模型写作方面有一定经验。", createdAt: daysAgo(0.8) },
  { from: 6, to: 2, content: "学长好，我是英语专业的，美赛的英文论文写作我可以负责。雅思6.5，参加过英语演讲省赛。", createdAt: daysAgo(3) },
  { from: 2, to: 6, content: "太好了！我们正缺英语写作的同学，欢迎加入！", createdAt: daysAgo(3) },
  { from: 11, to: 9, content: "博文，你ACM队还缺人吗？最近在刷CF，rating 1500了。", createdAt: daysAgo(1) },
  { from: 9, to: 11, content: "还在招，这周末有个训练赛，来试试？", createdAt: daysAgo(0.9) },
];

/* ---------- 通知数据 ---------- */

const NOTIFICATIONS: { userIdIndex: number; type: string; title: string; content: string; link: string | null; read: boolean; createdAt: Date }[] = [
  { userIdIndex: 0, type: "apply", title: "新队员申请", content: "吴佳怡申请加入你的队伍「数学建模国赛队友招募」", link: "/team/1", read: false, createdAt: daysAgo(1) },
  { userIdIndex: 2, type: "system", title: "申请已通过", content: "杨诗涵已通过你队伍的申请，你的队伍已满员。", link: "/team/2", read: true, createdAt: daysAgo(3) },
  { userIdIndex: 9, type: "apply", title: "新队员申请", content: "林志远申请加入你的队伍「ACM-ICPC区域赛冲刺队友」", link: "/team/4", read: false, createdAt: daysAgo(1) },
  { userIdIndex: 5, type: "apply", title: "新队员申请", content: "王浩然申请加入你的队伍「RoboMaster机甲大师赛」", link: "/team/6", read: false, createdAt: daysAgo(2) },
  { userIdIndex: 6, type: "system", title: "申请已拒绝", content: "张明的队伍拒绝了你的入队申请。", link: null, read: true, createdAt: daysAgo(4) },
];

/* ==================================================== */

async function main() {
  console.log("🧹 清空旧数据...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.post.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();
  // 重置 SQLite 自增序列
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");
  console.log("✅ 旧数据已清空");

  // ---------- 竞赛 ----------
  console.log("📋 创建竞赛...");
  for (const comp of defaultCompetitions) {
    const created = await prisma.competition.create({ data: comp });
    COMPETITION_IDS[comp.name] = created.id;
  }
  console.log(`✅ 已创建 ${defaultCompetitions.length} 个竞赛`);

  // ---------- 用户 ----------
  console.log("👤 创建用户...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  const createdUsers: { id: number; email: string }[] = [];

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const email = `user${i + 1}@test.com`;
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: u.nickname,
        grade: u.grade,
        major: u.major,
        bio: u.bio,
        skills: JSON.stringify(u.skills),
        interests: JSON.stringify(u.interests),
        experience: u.experience,
        timeCommitment: u.timeCommitment,
        profileTipSeen: u.profileTipSeen,
        createdAt: u.createdAt,
      },
    });
    createdUsers.push({ id: user.id, email: user.email });
  }
  console.log(`✅ 已创建 ${createdUsers.length} 个用户（全部密码：123456）`);

  // ---------- 帖子 + 队伍 + 队员 ----------
  console.log("📝 创建帖子...");
  const createdPostIds: number[] = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const authorId = createdUsers[p.authorIndex].id;
    const competitionId = COMPETITION_IDS[defaultCompetitions[p.competitionIndex].name];

    const post = await prisma.post.create({
      data: {
        title: p.title,
        description: p.description,
        skills: JSON.stringify(p.skills),
        currentSize: p.currentSize,
        targetSize: p.targetSize,
        status: p.status,
        authorId,
        competitionId,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
      },
    });
    createdPostIds.push(post.id);

    // 创建队伍 + 队长
    await prisma.team.create({
      data: {
        name: p.title,
        postId: post.id,
        status: p.status === "full" ? "preparing" : "recruiting",
        announcement: `欢迎加入「${p.title}」！`,
        createdAt: p.createdAt,
        members: {
          create: [
            { userId: authorId, role: "captain", joinedAt: p.createdAt },
            ...p.memberIndices.map((mi) => ({
              userId: createdUsers[mi].id,
              role: "member" as const,
              joinedAt: new Date(p.createdAt.getTime() + DAY),
            })),
          ],
        },
      },
    });
  }
  console.log(`✅ 已创建 ${POSTS.length} 个帖子及对应队伍`);

  // ---------- 申请 ----------
  console.log("📨 创建申请...");
  for (const app of APPLICATIONS) {
    const postId = createdPostIds[app.postIndex];
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) continue;

    const applicantId = createdUsers[app.applicantIndex].id;
    const captainId = post.authorId;

    await prisma.application.create({
      data: {
        reason: "希望加入你们的队伍一起学习进步！",
        status: app.status,
        applicantId,
        captainId,
        postId: post.id,
        createdAt: app.createdAt,
      },
    });
  }
  console.log(`✅ 已创建 ${APPLICATIONS.length} 条申请`);

  // ---------- 私信 ----------
  console.log("💬 创建私信...");
  for (const msg of MESSAGES) {
    await prisma.message.create({
      data: {
        content: msg.content,
        senderId: createdUsers[msg.from].id,
        receiverId: createdUsers[msg.to].id,
        createdAt: msg.createdAt,
      },
    });
  }
  console.log(`✅ 已创建 ${MESSAGES.length} 条私信`);

  // ---------- 通知 ----------
  console.log("🔔 创建通知...");
  for (const n of NOTIFICATIONS) {
    await prisma.notification.create({
      data: {
        type: n.type,
        title: n.title,
        content: n.content,
        link: n.link,
        read: n.read,
        userId: createdUsers[n.userIdIndex].id,
        createdAt: n.createdAt,
      },
    });
  }
  console.log(`✅ 已创建 ${NOTIFICATIONS.length} 条通知`);

  console.log("🎉 数据填充完成！");
  console.log("📌 所有用户密码均为：123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
