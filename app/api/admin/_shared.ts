import { revalidatePath } from "next/cache";
import type { PortfolioSection } from "@/lib/types";

const SECTION_PATHS: Record<PortfolioSection, string> = {
  capabilities: "/capabilities",
  experience: "/experience",
  thoughts: "/thoughts",
  life: "/life"
};

function asSection(value: unknown): PortfolioSection | undefined {
  return typeof value === "string" && value in SECTION_PATHS ? (value as PortfolioSection) : undefined;
}

function asSlug(value: unknown) {
  return typeof value === "string" && value.trim() ? encodeURIComponent(value.trim()) : undefined;
}

export function revalidatePortfolioSection(section: PortfolioSection) {
  revalidatePath("/");
  revalidatePath(SECTION_PATHS[section]);
}

export function revalidatePortfolioItem(item: unknown) {
  if (!item || typeof item !== "object") {
    revalidateAllPublicContent();
    return;
  }

  const record = item as Record<string, unknown>;
  const section = asSection(record.section);
  if (!section) {
    revalidateAllPublicContent();
    return;
  }

  revalidatePortfolioSection(section);
  const slug = asSlug(record.slug) ?? asSlug(record.id);
  if (slug) revalidatePath(`${SECTION_PATHS[section]}/${slug}`);
}

export function revalidateAllPublicContent() {
  revalidatePath("/");
  for (const path of Object.values(SECTION_PATHS)) revalidatePath(path);
}
