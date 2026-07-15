import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { scrapbookImages, timelineMarkers } from "@/components/scrapbook/assets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

export type NoteType = "featured" | "quick-note" | "field-record" | "tool-insight";

export type BlogTimelineItem = {
  id: string;
  title: string;
  date: string;
  body: string;
  meta?: string;
  image?: string;
  images?: string[];
  tags: string[];
  href?: string;
  external?: boolean;
  featured?: boolean;
  noteType?: NoteType;
};

const noteLabels: Record<NoteType, string> = {
  featured: "Featured",
  "quick-note": "Quick note",
  "field-record": "Field record",
  "tool-insight": "Tool insight"
};

function getNoteType(item: BlogTimelineItem): NoteType {
  if (item.noteType) return item.noteType;
  if (item.featured) return "featured";
  if (item.body.length <= 58) return "quick-note";
  if (item.image) return "field-record";
  return "tool-insight";
}

function TimelineCard({ item, index }: { item: BlogTimelineItem; index: number }) {
  const noteType = getNoteType(item);
  const showImage = Boolean(item.image);
  const content = (
    <BaseCard
      interactive={Boolean(item.href)}
      featured={noteType === "featured"}
      decoration={noteType === "featured" && index === 0 ? "tape" : "none"}
      className={cn("p-4 sm:p-5", noteType === "quick-note" && "py-4")}
    >
      <div
        className={cn(
          "grid gap-4",
          showImage && noteType !== "featured" && "grid-cols-[88px_minmax(0,1fr)] items-center sm:grid-cols-[112px_minmax(0,1fr)]",
          showImage && noteType === "featured" && "sm:grid-cols-[156px_minmax(0,1fr)] sm:items-center"
        )}
      >
        {showImage && item.image ? (
          <div
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-sm)] border border-border bg-muted",
              noteType === "featured" ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
            )}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes={noteType === "featured" ? "(min-width: 768px) 156px, 100vw" : "(min-width: 768px) 112px, 100vw"}
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="mono text-[11px] tracking-[0.06em] text-primary md:hidden">{item.date}</span>
            <StatusBadge tone={noteType === "featured" ? "accent" : noteType === "tool-insight" ? "lavender" : "sage"}>
              {noteLabels[noteType]}
            </StatusBadge>
          </div>
          <h2 className={cn("mt-3 font-semibold leading-tight text-card-foreground", noteType === "featured" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
            {item.title}
          </h2>
          <p className={cn("mt-3 max-w-2xl text-sm leading-7 text-muted-foreground", noteType === "quick-note" ? "line-clamp-2" : "line-clamp-3")}>
            {item.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  );

  if (!item.href) return content;

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="focus-ring group block rounded-[var(--radius-md)]">
        <div className="relative">
          {content}
          <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.8} />
        </div>
      </a>
    );
  }

  return (
    <Link href={item.href} className="focus-ring group block rounded-[var(--radius-md)]">
      <div className="relative">
        {content}
        <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.8} />
      </div>
    </Link>
  );
}

export function BlogTimeline({ items }: { items: BlogTimelineItem[] }) {
  return (
    <section className="container-space relative" aria-label="学习轨迹">
      <Image
        src={scrapbookImages.photoWater}
        alt=""
        aria-hidden="true"
        width={176}
        height={242}
        className="pointer-events-none absolute -right-3 top-12 hidden h-auto w-28 rotate-2 select-none opacity-48 drop-shadow-[0_14px_20px_rgb(75_65_50_/_0.08)] lg:block"
      />

      <div className="mx-auto grid max-w-5xl gap-0">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 md:grid-cols-[7.5rem_56px_minmax(0,1fr)] md:gap-5">
            <div className="hidden pt-2 text-right md:block">
              <p className="mono text-[11px] tracking-[0.06em] text-primary">{item.date}</p>
              {item.meta ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.meta}</p> : null}
            </div>
            <div className="relative flex items-start justify-center">
              <span className={cn("absolute top-0 w-px bg-gradient-to-b from-primary/36 via-border to-border", index === items.length - 1 ? "bottom-8" : "-bottom-8")} aria-hidden="true" />
              <img
                src={timelineMarkers[index % timelineMarkers.length]}
                alt=""
                aria-hidden="true"
                className="pointer-events-none relative z-10 mt-1 h-auto w-9 max-w-none select-none object-contain opacity-76 md:w-12"
              />
            </div>
            <div className="pb-5 md:pb-7">
              <TimelineCard item={item} index={index} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
