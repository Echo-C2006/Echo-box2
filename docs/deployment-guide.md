# Echo-box2 部署指南

## 📦 技术栈

- **框架:** Next.js 16 (App Router)
- **数据库:** PostgreSQL (Vercel Postgres / Neon)
- **ORM:** Prisma 6
- **认证:** JWT (jose) + Cookie
- **部署:** Vercel

---

## 🚀 部署步骤

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 上部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New → Project**
3. 导入刚才推送的 GitHub 仓库
4. 点击 **Deploy**，等待构建完成

### 3. 创建数据库

1. 部署完成后，进入项目，点击顶部 **Storage** 标签
2. 点击 **Create Database → Postgres**
3. 选择 **Hobby（免费）** 计划
4. Environments 勾选 **Production**，**不要勾选** "Create database branch for deployment"
5. 点击 **Create**，创建后 Vercel 会自动重新部署

### 4. 添加环境变量

1. 进入 **Settings → Environment Variables**
2. 添加以下变量（仅 Production 环境）：

| Name | Value 示例 | 说明 |
|------|-----------|------|
| `JWT_SECRET` | 任意随机字符串 | JWT 签名密钥，可用 `openssl rand -hex 32` 生成 |
| `DATABASE_URL` | Vercel Storage 自动创建后可获取 | PostgreSQL 连接串（创建数据库后会自动注入） |
| `AI_API_KEY` | `sk-xxxxx` | AI 服务商 API 密钥 |
| `AI_API_URL` | `https://api.deepseek.com` | （可选）自定义 API 地址，默认使用 OpenAI |
| `AI_MODEL` | `deepseek-v4-flash` | （可选）模型名称，默认 `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | `5000` | （可选）请求超时时间（毫秒），默认 `30000` |

> `DATABASE_URL` 在 Vercel 上创建 Postgres 数据库后会自动注入到环境变量中，无需手动复制粘贴。

### 5. 重新部署

添加环境变量后，在 **Deployments** 页面找到最新的部署，点击 **Redeploy** 触发重新构建。

### 6. 填充种子数据（仅首次部署需要）

在本地终端执行：

```bash
# 安装 Vercel CLI（如果没装）
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目目录关联 Vercel 项目
npx vercel link

# 拉取生产环境变量
npx vercel env pull .env --environment production

# 生成 Prisma Client 并填充种子数据
npx prisma generate
npx tsx prisma/seed.mts
```

> ⚠️ 如果 `.env` 中 `DATABASE_URL` 为空，从 **Vercel Storage → 数据库页面** 手动复制连接串后运行：
> ```bash
> set DATABASE_URL="<连接串>" && npx prisma generate && npx tsx prisma/seed.mts
> ```

### 7. 验证

打开 Vercel 分配的域名（格式：`https://<项目名>.vercel.app`），用测试账号登录即可。

---

## 🧪 测试账号

种子数据包含 22 个测试用户，所有用户密码统一为 `123456`：

| 邮箱 | 角色 |
|------|------|
| `user1@test.com` | 张明（队长，有招募帖） |
| `user2@test.com` ~ `user12@test.com` | 其他测试用户（部分有队伍/申请记录） |
| `user13@test.com` ~ `user22@test.com` | 人才库用户（无队伍关联，适合演示 AI 从人才库找人） |

> 测试环境和本地无关联，种子数据只在远程数据库填充一次，后续不需要重复执行。

---

## 🔄 后续更新

代码修改后推送到 GitHub，Vercel 会自动触发重新构建和部署：

```bash
git add .
git commit -m "some changes"
git push
```

---

## ⚠️ 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 构建报错 `DATABASE_URL` not found | 未创建数据库 | Vercel Storage 创建 Postgres 数据库 |
| 页面能访问但数据为空 | 未运行种子数据 | 按步骤 6 填充种子数据 |
| AI 对话返回 500 或不可用 | 未配置 AI 环境变量 | 在 Vercel Settings → Environment Variables 添加 `AI_API_KEY` 等变量后 Redeploy |
| 新增环境变量后未生效 | 添加变量后未重新部署 | 在 Deployments 页面点 **Redeploy** 触发重新构建 |
| `.env` 修改后部署未更新 | `.env` 被 `.gitignore` 忽略，不会随代码推送 | 需手动在 Vercel 控制台同步变量，参考步骤 4 |
