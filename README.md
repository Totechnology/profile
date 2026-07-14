# 龚宸宇个人主页

一个以「深空科技感 × 个人档案舱 × 视听技术控制台 × Bento Grid」为核心概念的个人作品主页。

这个网站不是传统简历页，而是一个展示个人综合技术能力的数字空间。它重点呈现影像创作、声音工程、硬件系统、AI 工作流、现场技术执行和个人思考，让访问者感受到：我不是只会单点技能，而是能把画面、声音、设备、信号、网络和 AI 工具整合成一套稳定、高效、可复用系统的人。

---

## 项目定位

**龚宸宇**
**视听技术与硬件系统创作者**

我关注影像、声音、硬件与 AI 工具之间的协作方式，擅长从拍摄、剪辑、调色、录音、混音，到软硬件路由、现场扩声和电脑系统搭建，完成一套从内容创作到技术执行的完整工作流。

核心关键词：

* 视频剪辑
* 调色
* 音效设计
* 录音
* 混音
* 拍摄
* 摄影
* 电脑技术
* 软硬件路由
* 现场扩声
* AI 运用
* 工作流搭建

---

## 设计概念

网站整体视觉方向：

> 深空科技感 / 个人档案舱 / 视听技术控制台 / Bento Grid

用户进入网站时，先看到全屏入场动画，像启动一个私人技术舱。动画结束后，主页内容逐渐浮现，进入个人主页。

设计目标：

* 有入场仪式感
* 有技术控制台气质
* 有个人作品集的展示能力
* 有高级、克制、深色、空间感强的视觉风格
* 不做廉价赛博风
* 不做模板感简历页
* 不让动效影响阅读体验

推荐视觉语言：

* 深色背景
* 玻璃拟态卡片
* 细边框
* 柔和光晕
* 粒子感
* 微弱网格纹理
* Bento Grid 布局
* 大字号标题
* 克制动效
* 高级灰与蓝紫强调色

推荐颜色：

```ts
const theme = {
  background: "#050507",
  surface: "#080A12",
  surfaceSoft: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  borderActive: "rgba(125,211,252,0.35)",
  textPrimary: "#F5F7FA",
  textSecondary: "#9CA3AF",
  accentBlue: "#7DD3FC",
  accentPurple: "#A78BFA",
}
```

---

## 技术栈

推荐技术栈：

* Next.js
* React
* TypeScript
* Tailwind CSS
* GSAP
* Framer Motion
* shadcn/ui，可选
* Lucide Icons，可选

项目目标：

* 代码结构清晰
* 组件可复用
* 内容数据可配置
* 后续可以接入数据库或 CMS
* 移动端体验良好
* 入场动画性能可控

---

## 核心功能

### 1. 全屏入场动画

网站进入时播放 `SpiralAnimation`。

要求：

* Canvas + GSAP 实现
* 黑底螺旋星点动画
* 动画像进入个人技术宇宙
* 动画结束后平滑进入主页
* 支持 Skip Intro
* 支持 localStorage 记住用户已看过动画
* 支持 `prefers-reduced-motion`
* 移动端降低粒子数量
* 组件卸载时清理 GSAP timeline

---

### 2. Header 导航

顶部 Header 固定悬浮。

导航项：

* 个人能力
* 个人经历
* 学习思考
* 个人生活

要求：

* 玻璃拟态背景
* 滚动时状态变化
* 点击后平滑滚动
* 当前板块有 active 状态
* 移动端折叠菜单
* 不要过度占用首屏空间

---

### 3. Hero 首页首屏

Hero 区需要像一个个人技术身份面板。

内容：

* 姓名：龚宸宇
* 定位：视听技术与硬件系统创作者
* 个人照片或档案卡
* 简介文案
* 能力标签
* CTA 按钮

推荐文案：

```txt
我关注影像、声音、硬件与 AI 工具之间的协作方式，擅长从拍摄、剪辑、调色、录音、混音，到软硬件路由、现场扩声和电脑系统搭建，完成一套从内容创作到技术执行的完整工作流。
```

补充文案：

```txt
我不是只做单点技能的人，我更擅长把设备、信号、画面、声音和工具连接成一个稳定、高效、可复用的系统。
```

推荐标签：

* 视频剪辑
* 调色
* 声音设计
* 录音混音
* 现场扩声
* 拍摄摄影
* 电脑技术
* 软硬件路由
* AI 工作流

---

## 页面结构

网站包含四个主要板块：

```txt
首页 Hero
├── 个人能力
├── 个人经历
├── 学习思考
└── 个人生活
```

所有板块都使用小卡片展示内容。

卡片内容不应该写死在 JSX 中，而是统一从数据配置读取。

---

## 个人能力

个人能力板块展示我的能力系统。

建议拆分为 5 类能力卡片：

### 影像创作

包含：

* 拍摄
* 摄影
* 视频剪辑
* 调色
* 画面叙事

描述：

```txt
从前期拍摄到后期剪辑与调色，关注画面节奏、色彩情绪和视觉表达。
```

### 声音工程

包含：

* 录音
* 音效设计
* 混音
* 现场扩声

描述：

```txt
理解声音从采集、处理到输出的完整链路，能完成录音、混音、音效设计与现场声音系统搭建。
```

### 硬件与系统

包含：

* 电脑技术
* 设备调试
* 软硬件路由
* 网络配置
* 系统搭建

描述：

```txt
擅长处理设备连接、信号路由、电脑系统配置和软硬件协作问题，让技术系统稳定运行。
```

### AI 工作流

包含：

* AI 辅助剪辑
* AI 文案
* AI 图像
* AI 声音
* 自动化流程

描述：

```txt
使用 AI 工具提升内容生产、素材整理、创意生成和工作流效率。
```

### 现场技术执行

包含：

* 活动现场
* 设备连接
* 信号流管理
* 音响系统
* 应急处理

描述：

```txt
能在现场环境中快速判断问题，完成设备搭建、信号连接、扩声调试和技术保障。
```

---

## 个人经历

个人经历不要做成普通简历时间线，而是做成「项目档案卡」。

每张卡片可以展示：

* 项目标题
* 时间
* 我的角色
* 项目类型
* 项目描述
* 技术亮点
* 成果
* 标签
* 图片
* 链接

示例方向：

* 现场扩声项目
* 视频剪辑与调色作品
* 录音与混音实践
* AI 工作流搭建
* 电脑与网络系统搭建
* 摄影拍摄项目
* 活动现场技术保障

---

## 学习思考

学习思考板块展示文章、笔记、技术复盘和行业观察。

内容方向：

* 视频剪辑学习
* 调色笔记
* 声音设计思考
* 录音混音经验
* 设备使用心得
* 现场扩声复盘
* AI 工具实践
* 电脑技术问题记录
* 软硬件路由理解
* 摄影观察

每张卡片可以包含：

* 标题
* 摘要
* 日期
* 标签
* 阅读时间
* 正文内容
* 外部链接

---

## 个人生活

个人生活板块展示真实但克制的生活切片。

内容方向：

* 摄影
* 旅行
* 音乐
* 阅读
* 城市观察
* 生活照片
* 设备记录
* 创作幕后

要求：

* 不要做成朋友圈
* 图片色调尽量统一
* 保持暗色科技风整体一致
* 让这个板块有人味，但不破坏主页气质

---

## 卡片系统

所有内容都通过卡片展示。

基础卡片风格：

* 深色半透明背景
* 细边框
* 轻微 blur
* 柔和阴影
* hover 上浮
* hover 边框发光
* hover 背景轻微渐变
* 标签使用胶囊样式
* featured 卡片可以更大
* 支持图片、图标、链接、标签和描述

推荐组件：

```txt
components/
  cards/
    BaseCard.tsx
    SkillCard.tsx
    ExperienceCard.tsx
    ThoughtCard.tsx
    LifeCard.tsx
```

---

## 数据结构

所有内容统一从数据文件读取，方便后续接入数据库或 CMS。

推荐类型：

```ts
export type SkillCard = {
  id: string
  title: string
  description: string
  skills: string[]
  icon?: string
  level?: string
  featured?: boolean
}

export type ExperienceCard = {
  id: string
  title: string
  time: string
  role: string
  type: string
  description: string
  highlights?: string[]
  tags: string[]
  image?: string
  link?: string
  featured?: boolean
}

export type ThoughtCard = {
  id: string
  title: string
  summary: string
  date: string
  tags: string[]
  readingTime?: string
  content?: string
  link?: string
  featured?: boolean
}

export type LifeCard = {
  id: string
  title: string
  image?: string
  description: string
  tags: string[]
  date?: string
  location?: string
  featured?: boolean
}
```

推荐数据文件：

```txt
data/
  siteContent.ts
```

---

## 开发者管理后台

普通访问者只能浏览网站内容。

只有开发者本人可以新增、编辑、删除内容卡片。

管理后台路径：

```txt
/admin
```

权限要求：

* `/admin` 不出现在主导航
* 访问后台需要密码
* 密码通过环境变量设置
* 登录状态通过 cookie 或 session 保存
* 不允许只靠前端隐藏按钮实现权限
* 服务端需要校验登录状态

管理后台功能：

* 新增卡片
* 编辑卡片
* 删除卡片
* 修改排序
* 修改标签
* 修改 featured 状态
* 修改图片链接
* 按板块管理内容

后台管理板块：

```txt
个人能力
个人经历
学习思考
个人生活
```

---

## 内容存储

生产环境使用腾讯云 CloudBase 文档数据库持久化后台内容：

* `portfolio_items`：个人能力、个人经历、学习思考和个人生活卡片
* `portfolio_settings`：个人档案、联系方式和首页配置，固定文档 ID 为 `main`

用户上传的内容图片保存在 CloudBase 云存储的 `personal-portfolio/` 前缀下。`.content/site-content.json` 只允许用于本地开发回退和首次迁移源，不是云托管生产数据源。

内容存储逻辑应集中在：

```txt
lib/contentStore.ts
```

不要把数据读写逻辑分散到组件中。

---

## 推荐项目结构

```txt
app/
  layout.tsx
  page.tsx
  admin/
    page.tsx
  api/
    admin/
      login/
        route.ts
      logout/
        route.ts
      content/
        route.ts

components/
  intro/
    SpiralAnimation.tsx
    IntroOverlay.tsx
  layout/
    Header.tsx
    Section.tsx
    Footer.tsx
  hero/
    Hero.tsx
  cards/
    BaseCard.tsx
    SkillCard.tsx
    ExperienceCard.tsx
    ThoughtCard.tsx
    LifeCard.tsx
  sections/
    SkillsSection.tsx
    ExperienceSection.tsx
    ThoughtsSection.tsx
    LifeSection.tsx
  admin/
    AdminLogin.tsx
    AdminDashboard.tsx
    SectionManager.tsx
    CardEditor.tsx

data/
  siteContent.ts

lib/
  auth.ts
  contentStore.ts
  types.ts
  utils.ts

styles/
  globals.css

public/
  images/
```

---

## 安装

```bash
pnpm install
```

---

## 环境变量

复制 `.env.example` 为 `.env.local`。

设置：

```dotenv
CLOUDBASE_ENV_ID=travel-media-gallery-d1a83223409
ADMIN_PASSWORD=replace-me
AUTH_SECRET=replace-with-long-random-secret
ALLOW_CLOUDBASE_SEED=false
```

不要提交真实密码或 `AUTH_SECRET`，也不要创建包含密码或私密凭证的 `NEXT_PUBLIC_*` 环境变量。`ALLOW_CLOUDBASE_SEED` 只在首次迁移期间临时开启。

---

## 运行

```bash
pnpm dev
```

打开：

```txt
http://localhost:3000
```

---

## 管理后台

访问：

```txt
http://localhost:3000/admin
```

输入 `.env.local` 中的：

```bash
ADMIN_PASSWORD
```

登录后可以管理四个板块中的卡片内容。

云托管生产环境保存到 CloudBase 的 `portfolio_items` 和 `portfolio_settings`；图片保存到 `personal-portfolio/uploads/`。

---

## 构建

```bash
pnpm build
```

运行生产版本：

```bash
pnpm start
```

---

## 代码规范

开发时请遵守：

* 使用 TypeScript
* 组件拆分清晰
* 内容数据和 UI 组件分离
* 页面内容不要写死在 JSX 中
* 卡片统一走数据渲染
* 动效不要影响性能和阅读
* 移动端优先保证可用性
* 管理权限必须有服务端校验
* 不要把密码写死在代码中
* 不要把内容读写逻辑散落在组件里

---

## 动效规范

可以使用：

* 入场动画
* 页面渐入
* 卡片轻微浮现
* hover 上浮
* 标签微光
* Header 滚动状态变化

避免：

* 大量闪烁
* 过度霓虹
* 长时间强制动画
* 卡顿的粒子效果
* 影响阅读的滚动特效

需要支持：

```css
@media (prefers-reduced-motion: reduce) {
  /* 减少或关闭非必要动效 */
}
```

---

## SEO

页面基础信息：

```txt
title: 龚宸宇 | 视听技术与硬件系统创作者
description: 龚宸宇的个人主页，展示影像创作、声音工程、硬件系统、AI 工作流、现场扩声、拍摄摄影等综合能力。
```

需要包含：

* title
* description
* Open Graph
* favicon
* 语义化 HTML
* 清晰 heading 层级

---

## Footer

Footer 内容：

```txt
龚宸宇
视听技术与硬件系统创作者
Connecting visuals, sound, hardware and AI into working systems.
```

可预留链接：

* GitHub
* Bilibili
* 小红书
* 邮箱
* 作品集链接

---

## 后续升级方向

### 内容管理升级

当前已使用 CloudBase 文档数据库和云存储。后续可在不改变集合边界的前提下增加内容审核、版本记录和定时发布。

### 作品展示升级

增加：

* 作品详情页
* 视频播放器
* 图片灯箱
* 音频播放器
* 项目 case study 页面

### 视觉升级

增加：

* 更高级的背景粒子
* 设备信号流动画
* 声波视觉化
* 图片 hover 视差
* 技术面板式数据展示

### 后台升级

增加：

* 图片上传
* 草稿状态
* 发布时间
* Markdown 编辑器
* 富文本编辑器
* 内容排序拖拽
* 多图管理

---

## 给 AI 协作时的提示

如果继续使用 AI 辅助开发，请先让 AI 阅读本 README，再要求它：

1. 保持当前项目定位不变
2. 不要把网站改成普通简历页
3. 不要写死卡片内容
4. 不要破坏后台权限逻辑
5. 不要删除入场动画
6. 保持深色科技感和 Bento Grid 风格
7. 每次修改前先说明会影响哪些文件
8. 每次修改后说明如何测试

---

## 最终目标

这个网站应该让访问者感受到：

龚宸宇不是只会剪视频、拍照片、调声音或修电脑的人，而是一个能把影像、声音、硬件、网络、现场和 AI 工具连接成完整系统的人。

它应该像一个个人技术宇宙的入口，也像一张持续更新的能力地图。

---

## CloudBase 云托管

生产环境作为完整 Next.js 服务部署到环境 `travel-media-gallery-d1a83223409` 中的独立云托管服务 `personal-portfolio`，端口为 `3000`。本项目不使用 CloudBase 静态托管，以保留管理员认证、内容 API 和数据库持久化能力。

完整的控制台配置、存储权限合并、数据初始化、部署验收和回滚步骤见 [CloudBase 云托管部署与迁移](docs/cloudbase-deployment.md)。
