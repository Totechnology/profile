# CloudBase 云托管部署与迁移

本项目使用一个完整的 Next.js 云托管服务，不使用静态导出。公开页面、管理后台、Route Handlers、CloudBase 数据库和云存储全部工作在同一个服务中。

## 固定资源边界

| 资源 | 固定值 |
| --- | --- |
| CloudBase 环境 | `travel-media-gallery-d1a83223409` |
| 地域 | 上海 |
| 云托管服务 | `personal-portfolio` |
| 服务端口 | `3000` |
| 内容集合 | `portfolio_items` |
| 设置集合 | `portfolio_settings` |
| 云存储前缀 | `personal-portfolio/` |

该环境中已有旅行相册项目。部署和初始化时只能操作上表中的服务、集合和存储前缀；不要重命名、删除或覆盖环境中任何旅行相册资源。

## 1. 本地准备

1. 使用项目已锁定的 pnpm 安装依赖：

   ```bash
   pnpm install --frozen-lockfile
   ```

2. 复制 `.env.example` 为 `.env.local`，并仅在本地填入真实密码与随机密钥：

   ```dotenv
   CLOUDBASE_ENV_ID=travel-media-gallery-d1a83223409
   ADMIN_PASSWORD=<管理员密码>
   AUTH_SECRET=<至少 32 字节的强随机值>
   ALLOW_CLOUDBASE_SEED=false
   ```

3. 执行类型检查与生产构建：

   ```bash
   pnpm exec tsc --noEmit
   pnpm build
   ```

`.env.local` 已被 `.dockerignore` 排除，不应提交到 Git 或打包进镜像。

## 2. CloudBase 控制台准备

### 文档数据库

在环境 `travel-media-gallery-d1a83223409` 中只新建以下集合：

- `portfolio_items`
- `portfolio_settings`

两个集合都设置为“仅管理端可读写（ADMINONLY）”。浏览器不直连数据库，所有读写都由 Next.js 服务端通过云托管平台身份完成，因此不需要把集合开放给 Web 客户端。

### 云存储权限

先在“云存储 → 权限设置”备份现有安全规则。不要用一份新规则覆盖旅行相册的规则，只在现有 `read` 表达式后追加个人主页目录的公开读条件：

```json
{
  "read": "(<原 read 表达式>) || /^personal-portfolio\\//.test(resource.path)",
  "write": "<原 write 表达式，逐字保留>"
}
```

如果原 `read` 已是 `true`，保持不变即可。不要为了个人主页将全桶 `write` 改成 `true` 或 `false`；上传由服务端 SDK 执行，服务端权限不依赖客户端存储规则。修改规则后等待控制台提示的生效时间，再验证公开图片 URL。

### 云托管环境变量

在新服务 `personal-portfolio` 中配置：

```dotenv
CLOUDBASE_ENV_ID=travel-media-gallery-d1a83223409
ADMIN_PASSWORD=<生产管理员密码>
AUTH_SECRET=<独立的强随机值>
ALLOW_CLOUDBASE_SEED=false
```

只有执行首次迁移时才临时把 `ALLOW_CLOUDBASE_SEED` 设为 `true`。不要创建 `NEXT_PUBLIC_ADMIN_PASSWORD`、`NEXT_PUBLIC_AUTH_SECRET` 或任何包含 CloudBase 私密凭证的 `NEXT_PUBLIC_*` 变量。

## 3. 部署云托管服务

`next.config.ts` 固定使用 `output: "standalone"`；`Dockerfile` 使用 Node 22 + pnpm 多阶段构建，最终以非 root 用户运行 `.next/standalone/server.js`。容器端口为 `3000`，生产环境不会写入 `.content/site-content.json`。

安装并登录 CloudBase CLI 后，先生成部署计划：

```bash
tcb cloudrun deploy \
  -e travel-media-gallery-d1a83223409 \
  -s personal-portfolio \
  --port 3000 \
  --source . \
  --dry-run
```

确认计划中的环境 ID 和服务名均与上文一致，且没有旅行相册服务后，再执行实际部署：

```bash
tcb cloudrun deploy \
  -e travel-media-gallery-d1a83223409 \
  -s personal-portfolio \
  --port 3000 \
  --source .
```

也可在 CloudBase 控制台中新建同名云托管服务，选择“从 Dockerfile 构建”、工作目录 `.` 和端口 `3000`。不要选择静态托管，不要把该项目部署到旅行相册服务。

## 4. 首次数据初始化

1. 确认 `portfolio_items` 和 `portfolio_settings` 已创建且为空。
2. 临时将 `personal-portfolio` 的 `ALLOW_CLOUDBASE_SEED` 设为 `true`，并发布一个新修订版。
3. 访问 `/admin`、登录，然后在 `/admin/dashboard` 点击“初始化 CloudBase 内容”。
4. 确认结果中的新增、跳过和失败数量。初始化是幂等的：已有 ID 或 `migrationKey` 的记录只会跳过，不会覆盖数据库现有内容。
5. 检查已引用的本地内容图片是否已迁移到 `personal-portfolio/uploads/` 下。
6. 立即将 `ALLOW_CLOUDBASE_SEED` 改回 `false`，再发布一个修订版。

不要通过数据库控制台“全量导入并覆盖”，也不要把 `.content/site-content.json` 当作生产持久化文件。

## 5. 验收清单

部署后依次检查：

- `GET /api/health` 返回 `{"ok":true,"service":"personal-portfolio"}`。
- `/`、`/capabilities`、`/experience`、`/thoughts` 正常渲染。
- `/admin` 可登录，未登录访问 `/admin/dashboard` 会跳转。
- 未登录调用任意管理写接口返回 `401`。
- 新增、编辑、删除、排序和设置修改后，刷新公开页面立即生效。
- jpg/jpeg/png/webp 上传后的路径仅位于 `personal-portfolio/uploads/YYYY/MM/`。
- 重启容器或发布新修订版后，数据库内容和上传文件仍然存在。
- 旅行相册服务、集合、存储目录与前端访问均没有变化。

## 6. 回滚

1. 在云托管 `personal-portfolio` 的修订版列表中，将流量切回上一个健康修订版。
2. 保持 `portfolio_items`、`portfolio_settings` 和 `personal-portfolio/` 存储文件不变；应用回滚不需要删除持久化数据。
3. 如果上一个版本不兼容新数据字段，先导出这两个集合备份，再按对应版本的迁移说明处理；不要直接删库。
4. 若需回退存储读规则，从修改前的备份恢复整份规则，不要手工改动旅行相册条件。

## 安全约束

- 客户端不包含 CloudBase 私密凭证、`ADMIN_PASSWORD` 或 `AUTH_SECRET`。
- 管理员登录状态使用签名的 httpOnly Cookie，不存入 localStorage。
- 图片上传由服务端完成；客户端不获得云存储写入权限。
- 数据库集合、存储前缀和云托管服务名不得改成旅行相册使用的任何名称。
