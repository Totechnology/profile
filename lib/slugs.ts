import type { ExperienceCardItem, LifeCardItem, SkillCardItem, ThoughtCardItem } from "@/lib/types";

type SlugSource = Pick<SkillCardItem | ExperienceCardItem | ThoughtCardItem | LifeCardItem, "id"> & {
  slug?: string;
  createdAt?: string;
  date?: string;
  time?: string;
};

export function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEntrySlug(item: SlugSource) {
  return cleanSlug(item.slug || item.createdAt || item.date || item.time || item.id) || item.id;
}

export function findBySlug<T extends SlugSource>(items: T[], slug: string) {
  return items.find((item) => getEntrySlug(item) === slug || item.id === slug);
}
