import type { SiteContent } from "@/lib/types";

export const initialSiteContent: SiteContent = {
  profile: {
    name: "龚宸宇",
    title: "视听技术与硬件系统创作者",
    status: "System Online",
    location: "Based in China",
    portraitImage: "/images/profile/journal-avatar.png",
    disciplines: ["Visual", "Audio", "Hardware", "AI"],
    tags: [
      "视频剪辑",
      "调色",
      "声音设计",
      "录音混音",
      "现场扩声",
      "拍摄摄影",
      "电脑技术",
      "软硬件路由",
      "AI 工作流"
    ],
    description:
      "我关注影像、声音、硬件与 AI 工具之间的协作方式，擅长从拍摄、剪辑、调色、录音、混音，到软硬件路由、现场扩声和电脑系统搭建，完成一套从内容创作到技术执行的完整工作流。",
    supportText:
      "我不是只做单点技能的人，我更擅长把设备、信号、画面、声音和工具连接成一个稳定、高效、可复用的系统。",
    contactLinks: [{ label: "mixingcy@163.com", href: "mailto:mixingcy@163.com" }],
    footerLine: "Connecting visuals, sound, hardware and AI into working systems."
  },
  showcases: {
    skills: {
      key: "skills",
      title: "个人能力",
      eyebrow: "Capability System",
      href: "/capabilities",
      image: "/images/showcase-skills-journal.png",
      metric: "5 个能力模块",
      accent: "#c96442",
      description: "影像、声音、硬件、AI 和现场执行能力的系统化入口。"
    },
    experiences: {
      key: "experiences",
      title: "个人经历",
      eyebrow: "Project Archive",
      href: "/experience",
      image: "/images/showcase-experience-journal.png",
      metric: "项目档案",
      accent: "#9c87f5",
      description: "作品、现场执行、技术实践和成长节点的项目式记录。"
    },
    thoughts: {
      key: "thoughts",
      title: "学习思考",
      eyebrow: "Field Notes",
      href: "/thoughts",
      image: "/images/showcase-thoughts-journal.png",
      metric: "技术笔记",
      accent: "#b05730",
      description: "剪辑、调色、声音、设备、AI 工具和现场复盘的学习日志。"
    },
    life: {
      key: "life",
      title: "个人生活",
      eyebrow: "Life Frames",
      href: "/life",
      image: "/images/showcase-life-journal.png",
      metric: "生活切片",
      accent: "#9c87f5",
      description: "摄影、城市观察、设备桌面和日常兴趣的克制展示。"
    }
  },
  skills: [
    {
      id: "skill-visual",
      title: "影像创作",
      icon: "camera",
      image: "/images/showcase-skills-journal.png",
      level: "Creative Pipeline",
      createdAt: "2026-01-01",
      featured: true,
      order: 1,
      description:
        "从前期拍摄到后期剪辑与调色，关注画面节奏、色彩情绪和视觉表达。",
      skills: ["拍摄", "摄影", "视频剪辑", "调色", "画面叙事"]
    },
    {
      id: "skill-audio",
      title: "声音工程",
      icon: "audio",
      level: "Signal Chain",
      createdAt: "2026-01-02",
      featured: true,
      order: 2,
      description:
        "理解声音从采集、处理到输出的完整链路，能完成录音、混音、音效设计与现场声音系统搭建。",
      skills: ["录音", "音效设计", "混音", "现场扩声"]
    },
    {
      id: "skill-hardware",
      title: "硬件与系统",
      icon: "cpu",
      level: "System Build",
      createdAt: "2026-01-03",
      order: 3,
      description:
        "擅长处理设备连接、信号路由、电脑系统配置和软硬件协作问题，让技术系统稳定运行。",
      skills: ["电脑技术", "设备调试", "软硬件路由", "网络配置", "系统搭建"]
    },
    {
      id: "skill-ai",
      title: "AI 工作流",
      icon: "sparkles",
      level: "Automation",
      createdAt: "2026-01-04",
      order: 4,
      description:
        "使用 AI 工具提升内容生产、素材整理、创意生成和工作流效率。",
      skills: ["AI 辅助剪辑", "AI 文案", "AI 图像", "AI 声音", "自动化流程"]
    },
    {
      id: "skill-live",
      title: "现场技术执行",
      icon: "radio",
      level: "Live Ops",
      createdAt: "2026-01-05",
      featured: true,
      order: 5,
      description:
        "能在现场环境中快速判断问题，完成设备搭建、信号连接、扩声调试和技术保障。",
      skills: ["活动现场", "设备连接", "信号流管理", "音响系统", "应急处理"]
    }
  ],
  experiences: [
    {
      id: "exp-live-audio",
      title: "现场扩声项目",
      createdAt: "2026-06-18",
      time: "2026",
      role: "现场技术执行",
      type: "现场扩声",
      featured: true,
      order: 1,
      image: "/images/experience-live-audio.png",
      description: "负责设备连接、信号检查、音响调试和现场应急。",
      highlights: ["完成输入输出链路检查", "优化现场监听与主扩声压", "建立故障排查顺序"],
      tags: ["扩声", "信号流", "设备调试"]
    },
    {
      id: "exp-editing-color",
      title: "视频剪辑与调色作品",
      createdAt: "2025-11-09",
      time: "2025",
      role: "剪辑 / 调色",
      type: "影像后期",
      order: 2,
      image: "/images/experience-color.png",
      description: "完成素材整理、节奏剪辑、色彩统一和最终输出。",
      highlights: ["统一多机位色彩", "建立素材命名与归档流程"],
      tags: ["剪辑", "调色", "输出规范"]
    },
    {
      id: "exp-recording-mix",
      title: "录音与混音实践",
      createdAt: "2025-09-22",
      time: "2025",
      role: "录音 / 混音",
      type: "声音制作",
      order: 3,
      image: "/images/experience-mix.png",
      description: "完成声音采集、降噪、均衡、压缩、空间处理和成品输出。",
      highlights: ["清理环境噪声", "搭建可复用混音模板"],
      tags: ["录音", "混音", "音效"]
    },
    {
      id: "exp-ai-workflow",
      title: "AI 工作流搭建",
      createdAt: "2026-04-12",
      time: "2026",
      role: "AI 工具使用与流程设计",
      type: "AI 工作流",
      featured: true,
      order: 4,
      image: "/images/experience-ai.png",
      description: "使用 AI 辅助脚本、素材整理、视觉生成或自动化处理。",
      highlights: ["减少重复整理步骤", "建立 prompt 与素材标签规范"],
      tags: ["AI", "自动化", "素材管理"]
    },
    {
      id: "exp-pc-network",
      title: "电脑与网络系统搭建",
      createdAt: "2024-12-06",
      time: "2024",
      role: "技术配置",
      type: "系统搭建",
      order: 5,
      image: "/images/experience-network.png",
      description: "完成电脑系统、软件环境、网络连接、路由配置或设备协作。",
      highlights: ["配置稳定的软件环境", "梳理网络与设备连接"],
      tags: ["电脑技术", "网络配置", "软硬件路由"]
    }
  ],
  thoughts: [
    {
      id: "thought-signal-flow",
      title: "把现场问题拆成信号流",
      image: "/images/showcase-thoughts-journal.png",
      summary:
        "遇到现场设备异常时，先从输入、处理、输出三个阶段拆解，比凭感觉排查更稳定。",
      date: "2026-06-12",
      readingTime: "4 min",
      featured: true,
      order: 1,
      tags: ["现场扩声", "信号流", "复盘"]
    },
    {
      id: "thought-color-note",
      title: "调色不是套 LUT",
      summary:
        "色彩统一、肤色控制和情绪表达需要分层处理，LUT 只应该是起点之一。",
      date: "2026-04-28",
      readingTime: "5 min",
      order: 2,
      tags: ["调色", "影像", "笔记"]
    },
    {
      id: "thought-ai-archive",
      title: "AI 更适合进入素材整理阶段",
      summary:
        "比起只用 AI 做最终产物，我更关注它在命名、筛选、初稿和脚本阶段的效率价值。",
      date: "2026-03-09",
      readingTime: "6 min",
      featured: true,
      order: 3,
      tags: ["AI 工具", "工作流", "素材管理"]
    },
    {
      id: "thought-audio-space",
      title: "混音里的空间感从哪里来",
      summary:
        "均衡、动态和混响不是三个孤立插件，它们共同决定声音在空间里的前后关系。",
      date: "2025-12-18",
      readingTime: "3 min",
      order: 4,
      tags: ["混音", "声音设计", "经验"]
    }
  ],
  life: [
    {
      id: "life-night-city",
      title: "夜间城市观察",
      image: "/images/life-city.png",
      createdAt: "2026-05-21",
      description: "喜欢观察城市夜晚的光线、玻璃反射和空间层次。",
      tags: ["摄影", "城市", "光线"],
      date: "2026-05",
      location: "China",
      featured: true,
      order: 1
    },
    {
      id: "life-desk",
      title: "桌面与设备",
      image: "/images/life-desk.png",
      createdAt: "2026-03-15",
      description: "把常用设备整理成稳定、顺手、可复用的创作环境。",
      tags: ["设备", "桌面", "工作流"],
      date: "2026-03",
      order: 2
    },
    {
      id: "life-photo-walk",
      title: "摄影散步",
      image: "/images/life-photo.png",
      createdAt: "2025-11-20",
      description: "用照片记录路上的材质、色温、构图和偶然出现的秩序。",
      tags: ["摄影", "观察", "生活"],
      date: "2025-11",
      order: 3
    }
  ]
};
