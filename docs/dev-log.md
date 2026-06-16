# 竞赛组队工具 —— 开发进展记录

> 本文档用于保存开发上下文，方便下次恢复工作。  
> 最后更新：2026-05-27  
> **下次对话时，请对 AI 说："继续竞赛组队工具"**，AI 会读取本文档恢复上下文。

---

## 一、项目概况

- **项目位置**：`C:\Users\Echo\competition-team-tool`
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Prisma 6 + SQLite
- **数据库**：`prisma/dev.db`（SQLite 文件）
- **启动命令**：`npm run dev`（开发模式）或 `npm run build` + `npm start`（生产模式）
- **访问地址**：`http://localhost:3000`

---

## 二、已完成的功能（截至 2026-05-27）

### 核心基础设施
- [x] Next.js 项目初始化（Turbopack）
- [x] Prisma ORM 配置 + SQLite 数据库
- [x] 数据库 Schema（8 张表）+ 迁移 + 种子数据
- [x] 内置竞赛库（15 个常见竞赛，见 `src/lib/competitions.ts`）

### 数据库表结构
| 表名 | 用途 |
|------|------|
| User | 用户（邮箱、密码、昵称、年级、专业、技能等） |
| Competition | 竞赛库（名称、分类、描述） |
| Post | 招募帖（标题、描述、技能需求、人数、状态、过期时间） |
| Team | 队伍（名称、公告、进度、外部链接） |
| TeamMember | 队伍成员（角色：队长/队员、承担技能） |
| Application | 入队申请（理由、状态：待回复/已通过/已拒绝） |
| Message | 私信（发件人、收件人、内容、已读时间） |
| Notification | 通知（类型、标题、内容、已读状态） |

### 已实现页面 & API
- [x] **认证系统**
  - 页面：`/auth/login`、`/auth/register`
  - API：`POST /api/auth/login`、`POST /api/auth/register`、`GET /api/auth/me`、`POST /api/auth/logout`
  - 机制：JWT（jose）+ httpOnly Cookie
- [x] **响应式导航栏**（`src/components/Navbar.tsx`）
  - 桌面端：顶部固定导航
  - 移动端：折叠菜单
  - 入口：广场、人才库、+发帖、消息、我的
- [x] **广场首页**（`/square`）
  - 帖子卡片网格（2-3 列响应式）
  - 竞赛分类筛选标签
  - 排序：最新发布 / 即将截止
  - 空状态提示
- [x] **发帖流程**（`/post/new`）
  - 选择竞赛（下拉框，来自竞赛库）
  - 标题、详细描述、需求技能
  - 已有几人 / 共需几人
  - 有效期：7/14/30 天
  - 提交后自动生成初始队伍，发帖人自动成为队长
- [x] **帖子详情页**（`/post/[id]`）
  - 竞赛徽章、帖子标题、发帖人信息
  - 详细描述、需求技能标签
  - 队伍规模、有效期、发布时间
  - 现有成员列表
  - **申请加入**按钮（弹出申请理由输入框）
  - **私信队长**按钮
  - 队长视角显示"管理队伍"入口
- [x] **队伍主页**（`/team/[id]`）
  - 队伍信息（名称、参赛竞赛、状态）
  - 当前阶段/进度展示
  - 队伍公告（队长可编辑）
  - 成员列表（头像、昵称、角色、承担技能）
  - 外部协作链接展示（预留）
  - 队长可编辑信息
- [x] **个人中心**（`/profile`）
  - 查看/编辑个人档案
  - 技能标签、竞赛意向编辑
  - 退出登录

### API 路由清单
```
/api/auth/register      POST    注册
/api/auth/login         POST    登录
/api/auth/me            GET     获取当前用户
/api/auth/logout        POST    退出登录
/api/competitions       GET     获取竞赛列表
/api/posts              GET     获取帖子列表（支持筛选/排序）
/api/posts              POST    创建帖子
/api/posts/[id]         GET     获取帖子详情
/api/applications       POST    提交入队申请
/api/teams/[id]         GET     获取队伍详情
/api/teams/[id]         PATCH   更新队伍信息（队长权限）
/api/users/me           GET     获取我的资料
/api/users/me           PATCH   更新我的资料
```

---

## 三、待办事项（下次开发优先级建议）

### 高优先级（核心流程闭环）
1. **人才库**（`/talent`）
   - 用户卡片列表
   - 按技能/年级/专业/竞赛意向筛选
   - 搜索功能
   - 邀请组队按钮
2. **申请管理**（队长审批）
   - 在帖子详情或队伍主页显示待处理申请列表
   - 队长可：同意 / 拒绝 / 先私信聊聊
   - 同意后：申请者加入队伍，帖子人数 +1，满员自动变"已满"
3. **私信系统**
   - 消息列表页（`/messages`）
   - 聊天页（`/messages?to=用户ID` 或 `/messages/对话ID`）
   - 发消息 / 收消息 / 未读红点

### 中优先级
4. **通知中心**
   - 通知列表（申请提醒、系统通知）
   - 导航栏红点
   - 点击跳转对应页面
5. **帖子管理**
   - 队长可编辑/关闭招募帖
   - 过期自动下架（可用定时任务或查询时过滤）
6. **个人档案公开页**（`/profile/[id]`）
   - 他人视角查看
   - 发私信 / 邀请组队

### 低优先级（后续迭代）
7. 头像上传（Base64 或第三方图床）
8. Web Push 浏览器通知
9. 富文本编辑器（帖子、公告）
10. 搜索功能（全文检索）
11. 评价/信用体系
12. 多校扩展

---

## 四、快速恢复指南

### 环境要求
- Node.js >= 18（当前环境为 v20.20.2）
- npm >= 9

### 启动步骤
```bash
cd C:\Users\Echo\competition-team-tool
npm install      # 如果 node_modules 缺失
npm run dev      # 启动开发服务器，访问 http://localhost:3000
```

### 数据库操作
```bash
npx prisma migrate dev      # 如果需要修改 schema 后迁移
npx prisma generate         # 重新生成 Prisma Client
npx prisma studio           # 打开数据库可视化界面
```

### 关键文件位置
| 文件/目录 | 说明 |
|-----------|------|
| `prisma/schema.prisma` | 数据库模型定义 |
| `prisma/dev.db` | SQLite 数据库文件 |
| `src/lib/prisma.ts` | Prisma 客户端单例 |
| `src/lib/auth.ts` | JWT 认证工具函数 |
| `src/components/Navbar.tsx` | 顶部导航栏 |
| `src/app/square/page.tsx` | 广场首页 |
| `src/app/post/new/page.tsx` | 发帖页 |
| `src/app/post/[id]/page.tsx` | 帖子详情页 |
| `src/app/team/[id]/page.tsx` | 队伍主页 |
| `src/app/profile/page.tsx` | 个人中心 |

---

## 五、注意事项

1. **认证信息**：`.env` 文件中的 `JWT_SECRET` 当前使用默认值。生产环境请务必修改为强随机字符串。
2. **图片上传**：当前头像使用文字占位符（首字母），图片上传功能尚未实现。
3. **Cookie 设置**：当前 `secure` 标志仅在 `NODE_ENV=production` 时开启，本地开发不受影响。
4. **数据库迁移**：修改 `schema.prisma` 后，需要运行 `npx prisma migrate dev` 来同步数据库结构。
