import type { SiteContent } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function sortByOrder<T extends { order?: number; featured?: boolean }>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}

export function deepCloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function normalizeMedia<T extends { image?: string; images?: string[] }>(item: T): T {
  const images = [...(item.images || []), item.image || ""].filter(Boolean);
  const uniqueImages = Array.from(new Set(images));

  return {
    ...item,
    image: item.image || uniqueImages[0] || "",
    images: uniqueImages
  };
}

export function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    skills: sortByOrder(content.skills).map((item, index) => normalizeMedia({ ...item, order: index + 1 })),
    experiences: sortByOrder(content.experiences).map((item, index) => normalizeMedia({ ...item, order: index + 1 })),
    thoughts: sortByOrder(content.thoughts).map((item, index) => normalizeMedia({ ...item, order: index + 1 })),
    life: sortByOrder(content.life).map((item, index) => normalizeMedia({ ...item, order: index + 1 }))
  };
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
