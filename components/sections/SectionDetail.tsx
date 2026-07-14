import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { BlogTimeline, type BlogTimelineItem } from "@/components/sections/BlogTimeline";
import { LifeGallery, type LifeGalleryItem } from "@/components/sections/LifeGallery";
import { StaggerSectionCards, type StaggerCardItem } from "@/components/sections/StaggerSectionCards";
import type { SectionKey, SiteContent } from "@/lib/types";
import { getEntrySlug } from "@/lib/slugs";

function getImages(image?: string, images?: string[], fallback?: string) {
  return Array.from(new Set([...(images || []), image || "", fallback || ""].filter(Boolean)));
}

function getStaggerItems(content: SiteContent, section: SectionKey): StaggerCardItem[] {
  const showcaseImage = content.showcases[section].image;

  if (section === "skills") {
    return content.skills.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.description,
      meta: item.createdAt,
      kicker: item.level,
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.skills,
      href: `/capabilities/${getEntrySlug(item)}`,
      featured: item.featured,
      kind: "capability"
    }));
  }

  if (section === "experiences") {
    return content.experiences.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.description,
      meta: [item.role, item.time].filter(Boolean).join(" / "),
      kicker: item.type,
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.tags,
      outcomes: item.highlights,
      href: `/experience/${getEntrySlug(item)}`,
      featured: item.featured,
      kind: "project"
    }));
  }

  if (section === "life") {
    return content.life.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.description,
      meta: [item.location, item.date].filter(Boolean).join(" / "),
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.tags,
      href: `/life/${getEntrySlug(item)}`,
      featured: item.featured
    }));
  }

  return [];
}

function dateValue(value?: string) {
  if (!value) return 0;
  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getTimelineItems(content: SiteContent, section: "thoughts" | "life"): BlogTimelineItem[] {
  const showcaseImage = content.showcases[section].image;

  if (section === "thoughts") {
    return [...content.thoughts]
      .sort((a, b) => dateValue(b.date || b.createdAt) - dateValue(a.date || a.createdAt))
      .map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date,
        body: item.summary,
        image: item.image,
        images: getImages(item.image, item.images, showcaseImage),
        tags: item.tags,
        href: item.link,
        external: Boolean(item.link),
        featured: item.featured
      }));
  }

  return [...content.life]
    .sort((a, b) => dateValue(b.date || b.createdAt) - dateValue(a.date || a.createdAt))
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date ?? item.createdAt ?? "",
      body: item.description,
      meta: item.location,
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.tags,
      href: `/life/${getEntrySlug(item)}`,
      featured: item.featured
    }));
}

function getLifeItems(content: SiteContent): LifeGalleryItem[] {
  const fallback = content.showcases.life.image;

  return [...content.life]
    .sort((a, b) => dateValue(b.date || b.createdAt) - dateValue(a.date || a.createdAt))
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      location: item.location,
      image: item.image ?? fallback,
      tags: item.tags,
      href: `/life/${getEntrySlug(item)}`,
      featured: item.featured
    }));
}

export function SectionDetail({ content, section }: { content: SiteContent; section: SectionKey }) {
  const showcase = content.showcases[section];
  const staggerItems = getStaggerItems(content, section);

  return (
    <main className="min-h-[100dvh] pb-12 pt-24 md:pb-20 md:pt-28">
      <Reveal>
        <PageIntro eyebrow={showcase.eyebrow} title={showcase.title} description={showcase.description} backLink="/" />
      </Reveal>

      <Reveal className="mt-7 md:mt-10">
        {section === "thoughts" ? (
          <BlogTimeline items={getTimelineItems(content, section)} />
        ) : section === "life" ? (
          <LifeGallery items={getLifeItems(content)} />
        ) : (
          <StaggerSectionCards items={staggerItems} />
        )}
      </Reveal>
    </main>
  );
}
