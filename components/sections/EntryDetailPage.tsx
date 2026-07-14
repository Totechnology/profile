import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { EntryMediaGallery } from "@/components/sections/EntryMediaGallery";
import { SoftButton } from "@/components/ui/SoftButton";
import { Tag } from "@/components/ui/Tag";

export type EntryDetailData = {
  title: string;
  eyebrow: string;
  meta?: string;
  image?: string;
  images?: string[];
  description: string;
  tags?: string[];
  highlights?: string[];
  backHref: string;
  backLabel: string;
  link?: string;
};

export function EntryDetailPage({ entry }: { entry: EntryDetailData }) {
  const gallery = Array.from(new Set([...(entry.images || []), entry.image || ""].filter(Boolean))).slice(0, 4);
  const descriptionParagraphs = entry.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="container-space min-h-[100dvh] pt-36 pb-16 md:pt-40">
      <Reveal>
        <SoftButton asChild className="mb-6 w-fit">
          <Link href={entry.backHref}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            {entry.backLabel}
          </Link>
        </SoftButton>
      </Reveal>

      <div className="grid gap-5 lg:h-[clamp(620px,calc(100dvh-190px),760px)] lg:grid-cols-[minmax(0,1.04fr)_minmax(380px,0.96fr)] lg:items-stretch">
        <Reveal className="h-[clamp(420px,68dvh,620px)] min-h-0 lg:h-full">
          <EntryMediaGallery title={entry.title} images={gallery} />
        </Reveal>

        <Reveal className="h-[clamp(580px,76dvh,720px)] min-h-0 lg:h-full" delay={0.08}>
          <section className="paper-card detail-copy-panel flex h-full min-h-0 flex-col overflow-hidden">
            <header className="relative shrink-0 border-b border-border px-6 py-6 md:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255_/_0.42),transparent_58%)]" />
              <div className="relative">
                <p className="eyebrow">{entry.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                  {entry.title}
                </h1>
                {entry.meta ? <p className="mt-3 text-sm leading-6 text-secondary-foreground">{entry.meta}</p> : null}
              </div>
            </header>

            <div className="custom-scrollbar detail-copy-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 md:py-7">
              <div className="space-y-5 text-[15px] leading-8 text-muted-foreground md:text-base">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p className="whitespace-pre-line" key={`${index}-${paragraph.slice(0, 24)}`}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {entry.tags?.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              ) : null}

              {entry.highlights?.length ? (
                <div className="mt-8 border-t border-border pt-6">
                  <p className="eyebrow">结果与输出</p>
                  <div className="mt-4 grid gap-3">
                    {entry.highlights.map((highlight) => (
                      <p key={highlight} className="rounded-[var(--radius-sm)] border border-border bg-background-soft/68 px-4 py-3 text-sm leading-6 text-secondary-foreground">
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {entry.link ? (
                <SoftButton asChild variant="primary" className="mt-8">
                  <a href={entry.link} target="_blank" rel="noreferrer">
                    查看链接
                    <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
                  </a>
                </SoftButton>
              ) : null}
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
