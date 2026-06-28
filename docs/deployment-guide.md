# Echo-box2 部署指南

## 📦 技术栈

- **框架:** Next.js 16 (App Router + SSR)
- **数据库:** Netlify Postgres（Netlify 内置数据库）
- **ORM:** Prisma 6（使用 Prisma Migrate 管理迁移）
- **认证:** JWT (jose) + Cookie
- **AI:** DeepSeek
- **部署:** Netlify

---

## 🚀 部署概览

部署流程共 5 步：

| 步骤 | 说明 | 对应文档 |
|------|------|---------|
| 1. 推送代码 | 代码推送到 GitHub | 见下方 |
| 2. 创建站点 | Netlify 导入仓库、配置项目名/构建命令/环境变量 | 详细操作见 [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md) 第一~七章 |
| 3. 创建数据库 | 在项目内创建 Postgres 数据库，配置 DATABASE_URL | 详细操作见 [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md) 第八~十二章 |
| 4. 填充种子数据 | 连接远程数据库执行 seed | 见下方 |
| 5. 验证部署 | 登录并检查功能 | 见下方 |

> 详细的**图文操作步骤**（每一步都有截图指引），请参阅 [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md)。

---

## 一、推送代码到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

## 二、创建站点（关键配置项）

在 Netlify **Configure project and deploy** 页面设置：

| 配置项 | 值 |
|--------|-----|
| **Project name** | `echo-box2` |
| **Build command** | `npm run netlify-build` |
| **Environment variables** | 添加 `JWT_SECRET`、`AI_API_KEY`、`AI_API_URL`、`AI_MODEL`（暂不加 `DATABASE_URL`） |

> 点击 **Deploy <仓库名>** 后首次构建会因缺少 `DATABASE_URL` 而失败。创建数据库并配置环境变量后重新部署即可。

详细图文指引 → [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md)（第一~七章）

## 三、创建数据库

1. 在 **Project overview** 左侧导航点击 **Database**，点击 **Or create a database manually instead**
2. 创建完成后点击 `production` 分支，在 **Connect** 区域复制 **Read and write** 连接字符串
3. 点击 **Database** 返回 → **Project configuration → Environment variables** → **Add a variable → Add a single variable**
4. Key 填写 `DATABASE_URL`，勾选 **Contains secret values**，粘贴到 **Production** 输入框，点击 **Create variable**

详细图文指引 → [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md)（第八~十二章）

## 四、填充种子数据

在本地项目目录执行 `npm run db:seed`，脚本会清空旧数据并依次创建竞赛、用户、帖子、队伍、申请、私信、通知等示例数据。所有示例用户的初始密码均为 `123456`。

> 执行 seed 前，先将上一步复制的 `DATABASE_URL` 连接字符串粘贴到本地 `.env` 文件中。

详细图文指引 → [`Next项目部署到Netlify.md`](Next项目部署到Netlify.md)（第十四章）

## 五、验证部署

访问 `https://<project-name>.netlify.app`，用 `user1@test.com` / `123456` 登录。

---

## 🗄️ 数据库迁移管理

项目使用 **Prisma Migrate** 管理数据库结构变更。

### 本地开发时修改 Schema

```bash
# 修改 prisma/schema.prisma 后，创建新的迁移
npm run db:migrate

# 将迁移文件提交到 Git
git add prisma/migrations/
git commit -m "feat: add xxx migration"
```

### 构建时自动迁移

`netlify-build` 会自动执行：

```
prisma generate       # 生成 Prisma Client
prisma migrate deploy # 仅运行未执行的迁移
next build            # 构建 Next.js
```

### 原则

- 迁移文件必须提交到 Git（`prisma/migrations/`）
- 不要手动修改已提交的迁移文件
- 生产环境不能使用 `prisma migrate dev`

---

## ⚠️ 环境变量总览

| Name | 设置时机 | 说明 |
|------|---------|------|
| `DATABASE_URL` | 创建数据库后手动添加 | PostgreSQL 连接串 |
| `JWT_SECRET` | 创建站点时添加 | JWT 签名密钥 |
| `AI_API_KEY` | 创建站点时添加 | AI 服务商 API 密钥 |
| `AI_API_URL` | 创建站点时添加 | 自定义 API 地址 |
| `AI_MODEL` | 创建站点时添加 | 模型名称 |

> `.env.example` 已提交到仓库，可直接复制字段名。
