# Next.js 项目部署到 Netlify

本文档基于实际操作截图，介绍如何将一个 Next.js 项目通过 GitHub 仓库部署到 Netlify，并配置环境变量与 Netlify Database（Postgres）。

---

## 一、导入 GitHub 仓库

1. 登录 Netlify，进入 **Add your project to Netlify** 页面。
2. 在 **Bringing your own code? → Import a Git repository** 区域，选择 **GitHub**（也支持 GitLab、Bitbucket、Azure DevOps）。

![导入 GitHub 仓库](images/deployment/1.png)

---

## 二、选择仓库

1. 进入 **Let's deploy your project with...** 页面（流程进度：1. Connect to Git provider → 2. Select repository → 3. Configure project and deploy）。
2. 在仓库列表中选择要部署的项目，本例中选择 **Echo-box2**（TypeScript 类型）。
3. 如果列表中看不到目标仓库，可点击 **Configure the Netlify app on GitHub** 进行授权配置。

![选择仓库](images/deployment/2.png)

---

## 三、检查并配置项目

进入 **Configure project and deploy** 步骤，检查以下配置：

- **Team**：选择部署所属团队（本例为 `Echo-C2006`）。
- **Project name**：项目名称（本例为 `echo-box2`），系统会显示对应的访问域名 `https://echo-box2.netlify.app`，并校验名称是否可用（显示 "Project name is available"）。
- **Branch to deploy**：选择部署分支（本例为 `main`）。

Netlify 会自动检测到这是一个 **Next.js 项目**，并提示将使用 **Next.js Runtime** 进行构建和部署。

![检查并配置项目](images/deployment/3.png)

---

## 四、构建设置（Build settings）

在 **Build settings** 区域配置构建参数：

- **Base directory**：Netlify 安装依赖并执行构建命令的目录（可留空）。
- **Build command**：构建命令，本例设置为 `npm run netlify-build`。
- **Publish directory**：发布目录，Next.js 项目设置为 `.next`。
- **Functions directory**：函数目录（可留空，默认 `netlify/functions`）。

![构建设置](images/deployment/4.png)

---

## 五、配置环境变量（部署前）

1. 在 **Environment variables** 区域，点击 **Add environment variables** 下拉按钮。
2. 选择 **Add key/value pairs**（手动添加键值对）。

![添加环境变量入口](images/deployment/5.png)

3. 依次填入项目所需的环境变量，例如：

| Key | Value |
| --- | --- |
| `AI_API_URL` | `https://api.deepseek.com` |
| `AI_API_KEY` | `（密钥，可点击眼睛图标查看/隐藏）` |
| `AI_MODEL` | `deepseek-v4-flash` |
| `JWT_SECRET` | 使用 `openssl rand -hex 32` 生成的随机密钥 |

![填写环境变量键值对](images/deployment/6.png)

---

## 六、触发部署

确认所有配置无误后，点击页面底部的 **Deploy echo-box2** 按钮开始部署。

![触发部署](images/deployment/7.png)

> 注意：部署过程中若直接访问站点 URL，可能会看到 **Page not found（404）** 页面，这是因为项目尚未构建完成。可点击 **Back to home** 返回。

![部署中访问出现 404](images/deployment/8.png)

---

## 七、查看部署结果

部署完成后，回到 **Projects** 列表，可以看到新建的项目 **echo-box2**，标注为 **Deploys from GitHub with Next.js**，并显示创建时间。

![项目列表](images/deployment/9.png)

---

## 八、创建 Netlify Database（Postgres）

使用 Netlify 内置的全托管 Postgres 数据库。

1. 在 **Project overview** 页面左侧导航点击 **Database**，进入 **Netlify Database** 页面。

![项目概览](images/deployment/10.png)

2. 点击 **Or create a database manually instead**（手动创建数据库）。

![Netlify Database 页面](images/deployment/11.png)

3. 点击后页面显示 **Creating database...**，等待数据库创建完成。

![正在创建数据库](images/deployment/12.png)

---

## 九、获取数据库连接字符串

1. 创建完成后显示 **Your database is ready!**，点击 **Database branches** 中的 `production` 分支，进入分支详情页。

![数据库创建完成](images/deployment/13.png)

2. 在数据库分支详情页向下滚动到 **Connect** 区域，点击 **Read and write** 后的复制图标，复制读写连接字符串。

![复制数据库连接字符串](images/deployment/14.png)

---

## 十、在项目配置中添加 DATABASE_URL 环境变量

复制完连接字符串后，回到项目中将其配置为环境变量。

1. 向上滚动到页面顶部，点击 **Database** 返回上一页。

![点击 Database 返回](images/deployment/15.png)

2. 返回到 **Database** 概览页后，在左侧导航点击 **Project configuration**。

![点击 Project configuration](images/deployment/16.png)

3. 进入 **General project settings** 后，在中间的二级导航中找到 **Environment variables** 区域，点击 **Environment variables**。

![点击 Environment variables](images/deployment/17.png)

4. 点击右侧 **Add a variable** 下拉按钮，选择 **Add a single variable**（添加单个变量）。

![选择 Add a single variable](images/deployment/18.png)

5. 在 **New environment variable** 表单中：
   - **Key**：填写 `DATABASE_URL`。
   - **Secret**：勾选 **Contains secret values**。
   - **Production**：将刚刚复制的连接字符串粘贴到 **Production** 输入框。

![新建环境变量表单](images/deployment/19.png)

6. 点击 **Create variable** 创建变量。

![点击 Create variable](images/deployment/20.png)

7. 创建成功后，可在环境变量列表中看到刚创建的 **DATABASE_URL** 变量。

![查看 DATABASE_URL 变量](images/deployment/21.png)

---

## 十一、将 AI_API_KEY 标记为密钥（Secret）

为保护 API 密钥安全，将 `AI_API_KEY` 标记为敏感值（Secret），避免在构建日志和界面中明文显示。

1. 在环境变量列表中，点击 **AI_API_KEY** 右侧的展开箭头。

![展开 AI_API_KEY](images/deployment/22.png)

2. 展开后点击 **Options**，在下拉菜单中选择 **Edit**。

![选择 Edit](images/deployment/23.png)

3. 在编辑表单中勾选 **Contains secret values**（标记为敏感值，仅 Netlify 系统上运行的代码可读取）。

![勾选 Contains secret values](images/deployment/24.png)

4. 向下滚动到表单底部，点击 **Save variable** 保存。

![保存变量](images/deployment/25.png)

5. 保存后，列表中的 **AI_API_KEY** 前会显示锁形图标，表示已标记为密钥。

![AI_API_KEY 已标记为密钥](images/deployment/26.png)

---

## 十二、重新部署项目

环境变量配置完成后，需要重新触发一次部署，使新变量生效。

1. 在左侧导航点击 **Deploys**。

![进入 Deploys](images/deployment/27.png)

2. 点击右上角 **Trigger deploy** 下拉按钮，选择 **Deploy project without cache**（清除缓存后重新部署）。

![触发不带缓存的部署](images/deployment/28.png)

---

## 十三、查看部署结果

1. 部署成功后，页面顶部显示 **Published deploy for ...**，并可在 **Deploy summary** 中查看上传文件、重定向规则、部署的函数及构建耗时等信息。
2. 点击 **Open production deploy** 即可在浏览器中打开线上站点。

![部署成功](images/deployment/29.png)

---

## 十四、填充数据库（Seed）

新建的数据库为空，可在本地项目中运行 seed 脚本，向数据库写入初始数据。

1. 在本地项目目录执行 `npm run db:seed`。
2. 脚本会清空旧数据并依次创建竞赛、用户、帖子、队伍、申请、私信、通知等示例数据；执行完成后会提示「数据填充完成！」，所有示例用户的初始密码均为 `123456`。

![运行 db:seed 填充数据库](images/deployment/30.png)

---

## 十五、访问线上站点

打开线上站点，即可看到部署完成并已填充数据的应用首页。

![线上站点首页](images/deployment/31.png)
