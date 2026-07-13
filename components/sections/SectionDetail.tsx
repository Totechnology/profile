import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { BlogTimeline, type BlogTimelineItem } from "@/components/sections/BlogTimeline";
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
      meta: item.level,
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.skills,
      href: `/capabilities/${getEntrySlug(item)}`,
      featured: item.featured
    }));
  }

  if (section === "experiences") {
    return content.experiences.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.description,
      meta: [item.role, item.time].filter(Boolean).join(" / "),
      image: item.image ?? showcaseImage,
      images: getImages(item.image, item.images, showcaseImage),
      tags: item.tags,
      href: `/experience/${getEntrySlug(item)}`,
      featured: item.featured
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
        image: item.image ?? showcaseImage,
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

export function SectionDetail({ content, section }: { content: SiteContent; section: SectionKey }) {
  const showcase = content.showcases[section];
  const staggerItems = getStaggerItems(content, section);

  return (
    <main className="min-h-[100dvh] pt-20 pb-12 md:pt-28 md:pb-16">
      <div className="container-space">
        <Reveal>
          <div className="mb-5 max-w-3xl md:mb-8">
            <Link className="secondary-button focus-ring mb-5 w-fit md:mb-8" href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              返回入口
            </Link>
            <p className="mono text-xs text-primary">{showcase.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-6xl">
              {showcase.title}
            </h1>
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground md:mt-5 md:line-clamp-none md:text-lg md:leading-7">
              {showcase.description}
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal>
        {section === "thoughts" || section === "life" ? (
          <BlogTimeline items={getTimelineItems(content, section)} />
        ) : (
          <StaggerSectionCards items={staggerItems} />
        )}
      </Reveal>
    </main>
  );
}
