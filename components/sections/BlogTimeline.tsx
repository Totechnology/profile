import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { scrapbookImages, timelineMarkers } from "@/components/scrapbook/assets";
import { cn } from "@/lib/utils";

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
};

function TimelineCard({ item }: { item: BlogTimelineItem }) {
  const content = (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[16px] border border-border bg-card/76 p-2.5 shadow-[0_1px_3px_rgb(0_0_0_/_0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-popover sm:rounded-[18px] sm:p-3",
        item.featured && "border-primary/28 bg-popover/88"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255_/_0.5),transparent_42%),linear-gradient(110deg,transparent_0%,rgb(201_100_66_/_0.08)_46%,transparent_68%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <Image
        src={item.featured ? scrapbookImages.tapeGrid : scrapbookImages.tapeKraft}
        alt=""
        width={118}
        height={76}
        className="pointer-events-none absolute right-8 top-0 z-20 w-24 -translate-y-8 rotate-2 opacity-90 mix-blend-multiply"
      />
      <div className={cn("relative z-10 grid gap-3 sm:gap-5", item.image && "grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[156px_minmax(0,1fr)]")}>
        {item.image ? (
          <div className="relative aspect-square overflow-hidden rounded-[12px] border border-border bg-muted shadow-[3px_4px_0_rgb(222_216_196_/_0.42)] sm:shadow-[5px_7px_0_rgb(222_216_196_/_0.5)]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 768px) 156px, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          </div>
        ) : null}
        <div className="min-w-0 p-1">
          <Image
            src={item.featured ? scrapbookImages.labelLavender : scrapbookImages.labelNotebook}
            alt=""
            width={110}
            height={82}
            className="pointer-events-none hidden -ml-3 -mt-3 mb-1 w-24 opacity-90 sm:block md:hidden"
          />
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            <span className="mono text-xs text-primary">{item.date}</span>
            {item.meta ? (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="text-xs text-muted-foreground">{item.meta}</span>
              </>
            ) : null}
          </div>
          <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight text-card-foreground sm:mt-3 sm:text-2xl md:mt-0">
            {item.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground sm:mt-4 sm:line-clamp-none sm:text-sm sm:leading-7">{item.body}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2">
            {item.tags.map((tag, index) => (
              <span className={cn("tag min-h-0 px-2 py-1 text-[10px] sm:min-h-7 sm:px-2.5 sm:text-xs", index > 1 && "hidden sm:inline-flex")} key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );

  if (!item.href) return content;

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="focus-ring block rounded-[var(--radius)]">
        <div className="relative">
          {content}
          <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
        </div>
      </a>
    );
  }

  return (
    <Link href={item.href} className="focus-ring block rounded-[var(--radius)]">
      <div className="relative">
        {content}
        <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
      </div>
    </Link>
  );
}

export function BlogTimeline({ items }: { items: BlogTimelineItem[] }) {
  return (
    <div className="container-space relative">
      <Image
        src={scrapbookImages.photoWater}
        alt=""
        width={176}
        height={242}
        className="pointer-events-none absolute -right-4 top-8 hidden h-auto w-36 rotate-3 opacity-72 drop-shadow-[0_16px_22px_rgb(61_57_41_/_0.12)] lg:block"
      />
      <Image
        src={scrapbookImages.photoFlower}
        alt=""
        width={190}
        height={244}
        className="pointer-events-none absolute -left-6 bottom-16 hidden h-auto w-32 -rotate-6 opacity-70 drop-shadow-[0_16px_22px_rgb(61_57_41_/_0.12)] lg:block"
      />
      <Image
        src={scrapbookImages.labelNotebook}
        alt=""
        width={150}
        height={114}
        className="pointer-events-none absolute left-[9%] top-0 hidden h-auto w-28 rotate-2 opacity-78 lg:block"
      />

      <div className="mx-auto grid max-w-5xl gap-0">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[48px_minmax(0,1fr)] gap-1 md:grid-cols-[8.25rem_72px_minmax(0,1fr)] md:gap-6"
          >
            <div className="hidden pt-1 text-right md:block">
              <p className="mono text-xs text-primary">{item.date}</p>
              {item.meta ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.meta}</p> : null}
            </div>
            <div className="relative flex items-start justify-center">
              <span
                className={cn(
                  "absolute top-0 w-px bg-gradient-to-b from-primary/42 via-border to-border",
                  index === items.length - 1 ? "bottom-8" : "-bottom-8"
                )}
              />
              <img
                src={timelineMarkers[index % timelineMarkers.length]}
                alt=""
                className="relative z-10 mt-0 h-auto w-11 max-w-none object-contain drop-shadow-[0_8px_10px_rgb(61_57_41_/_0.12)] md:w-16"
              />
            </div>
            <div className="pb-5 md:pb-8">
              <TimelineCard item={item} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
