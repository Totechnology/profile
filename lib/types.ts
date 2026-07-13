export type SectionKey = "skills" | "experiences" | "thoughts" | "life";

export type ContactLink = {
  label: string;
  href: string;
};

export type ProfileMeta = {
  name: string;
  title: string;
  description: string;
  supportText: string;
  location: string;
  status: string;
  disciplines: string[];
  tags: string[];
  contactLinks: ContactLink[];
  footerLine: string;
  portraitImage: string;
};

export type SectionShowcase = {
  key: SectionKey;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  image: string;
  metric: string;
  accent?: string;
};

export type SkillCardItem = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  icon?: string;
  image?: string;
  images?: string[];
  level?: string;
  createdAt?: string;
  featured?: boolean;
  order?: number;
};

export type ExperienceCardItem = {
  id: string;
  title: string;
  createdAt?: string;
  time: string;
  role: string;
  type: string;
  description: string;
  highlights?: string[];
  tags: string[];
  image?: string;
  images?: string[];
  link?: string;
  featured?: boolean;
  order?: number;
};

export type ThoughtCardItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  image?: string;
  images?: string[];
  createdAt?: string;
  readingTime?: string;
  content?: string;
  link?: string;
  featured?: boolean;
  order?: number;
};

export type LifeCardItem = {
  id: string;
  title: string;
  image?: string;
  images?: string[];
  createdAt?: string;
  description: string;
  tags: string[];
  date?: string;
  location?: string;
  featured?: boolean;
  order?: number;
};

export type SiteContent = {
  profile: ProfileMeta;
  showcases: Record<SectionKey, SectionShowcase>;
  skills: SkillCardItem[];
  experiences: ExperienceCardItem[];
  thoughts: ThoughtCardItem[];
  life: LifeCardItem[];
};

export type SectionItemMap = {
  skills: SkillCardItem;
  experiences: ExperienceCardItem;
  thoughts: ThoughtCardItem;
  life: LifeCardItem;
};

export const sectionLabels: Record<SectionKey, string> = {
  skills: "个人能力",
  experiences: "个人经历",
  thoughts: "学习思考",
  life: "个人生活"
};
