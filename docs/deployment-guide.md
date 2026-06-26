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
2. 添加以下变量：

| Name | Value | 说明 |
|------|-------|------|
| `JWT_SECRET` | 任意随机字符串 | JWT 签名密钥 |

> 可用 `openssl rand -hex 32` 或在线工具生成随机字符串。

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

种子数据包含 12 个测试用户，所有用户密码统一为 `123456`：

| 邮箱 | 角色 |
|------|------|
| `user1@test.com` | 张明（队长，有招募帖） |
| `user2@test.com` ~ `user12@test.com` | 其他测试用户 |

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
