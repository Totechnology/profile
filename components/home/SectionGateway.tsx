"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { scrapbookImages, sectionStickers } from "@/components/scrapbook/assets";
import { cn } from "@/lib/utils";
import type { SiteContent, SectionKey } from "@/lib/types";

const sectionOrder: SectionKey[] = ["skills", "experiences", "thoughts", "life"];

const imagePosition: Record<SectionKey, string> = {
  skills: "object-[52%_44%]",
  experiences: "object-[50%_38%]",
  thoughts: "object-[50%_36%]",
  life: "object-[50%_38%]"
};

const stickerLayout: Record<SectionKey, string> = {
  skills: "right-5 top-20 w-14 rotate-6 md:w-16",
  experiences: "right-6 top-20 w-14 -rotate-3 md:w-16",
  thoughts: "right-6 top-20 w-14 rotate-3 md:w-16",
  life: "right-6 top-20 w-14 -rotate-6 md:w-16"
};

function profileParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SectionGateway({ content }: { content: SiteContent }) {
  const profile = content.profile;
  const portraitImage = profile.portraitImage || scrapbookImages.journalAvatar;
  const contact = profile.contactLinks[0];
  const descriptionBlocks = profileParagraphs(profile.description);

  return (
    <main id="hero" className="container-space min-h-[100dvh] pt-20 pb-10 md:pt-[10.5rem]">
      <Reveal>
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-border bg-popover/66 p-4 shadow-[0_18px_50px_rgb(61_57_41_/_0.08)] backdrop-blur-xl md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255_/_0.46),transparent_44%),radial-gradient(circle_at_86%_20%,rgb(156_135_245_/_0.1),transparent_28%),radial-gradient(circle_at_14%_76%,rgb(201_100_66_/_0.09),transparent_32%)]" />
          <div className="absolute left-0 top-8 hidden h-[calc(100%-4rem)] w-3 rounded-r-full bg-primary/68 md:block" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-1">
              <div className="relative aspect-[4/5] min-h-[220px] overflow-hidden rounded-[24px] border border-border bg-card shadow-[6px_7px_0_rgb(222_216_196_/_0.5)]">
                <Image
                  src={portraitImage}
                  alt={`${profile.name}头像`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 190px, (min-width: 640px) 180px, 80vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/72 to-transparent" />
              </div>

              <div className="grid content-start gap-3 rounded-[18px] border border-border bg-background/70 p-4">
                <p className="mono text-xs text-primary">{profile.location}</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.disciplines.map((discipline) => (
                    <span className="tag min-h-0 px-2 py-1 text-[10px]" key={discipline}>
                      {discipline}
                    </span>
                  ))}
                </div>
                <p className="mono border-t border-border pt-3 text-[10px] leading-5 text-muted-foreground">
                  {profile.footerLine}
                </p>
              </div>
            </div>

            <div className="grid content-between gap-6 py-1">
              <div>
                <p className="mono text-xs text-primary">{profile.status}</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h1 className="text-4xl font-semibold leading-none text-foreground md:text-6xl">
                      {profile.name}
                    </h1>
                    <p className="mt-4 text-base leading-7 text-secondary-foreground md:text-lg">
                      {profile.title}
                    </p>
                  </div>
                  {contact ? (
                    <a className="secondary-button focus-ring" href={contact.href}>
                      {contact.label}
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="text-sm leading-7 text-muted-foreground">
                  {descriptionBlocks.map((paragraph) => (
                    <p className="mb-3 last:mb-0" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="grid gap-4">
                  <p className="rounded-[18px] border border-border bg-background/62 p-4 text-sm leading-7 text-secondary-foreground">
                    {profile.supportText}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tags.map((tag) => (
                      <span className="tag min-h-0 px-2 py-1 text-[10px]" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="grid min-h-[430px] grid-cols-2 grid-rows-2 gap-2.5 sm:min-h-[520px] sm:gap-3 lg:h-[640px] lg:grid-cols-4 lg:grid-rows-1 lg:gap-4">
          {sectionOrder.map((key, index) => {
            const item = content.showcases[key];
            return (
              <Link
                key={item.key}
                href={item.href}
                className="focus-ring group relative isolate h-full w-full overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_12px_34px_rgb(61_57_41_/_0.08)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_20px_48px_rgb(61_57_41_/_0.12)]"
              >
                <Image
                  src={item.image}
                  alt={`${item.title}入口展示图`}
                  fill
                  priority={index < 2}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className={cn(
                    "object-cover transition duration-700 group-hover:scale-[1.025]",
                    imagePosition[key]
                  )}
                />
                <Image
                  src={index % 2 === 0 ? scrapbookImages.tapeKraft : scrapbookImages.tapeGrid}
                  alt=""
                  width={130}
                  height={60}
                  className="pointer-events-none absolute left-1/2 top-4 z-10 h-auto w-24 -translate-x-1/2 -rotate-1 opacity-80 mix-blend-multiply md:w-28"
                />
                <Image
                  src={sectionStickers[key]}
                  alt=""
                  width={92}
                  height={82}
                  className={cn(
                    "pointer-events-none absolute z-10 h-auto opacity-80 mix-blend-multiply drop-shadow-[0_10px_16px_rgb(61_57_41_/_0.12)] transition duration-500 group-hover:-translate-y-1",
                    stickerLayout[key]
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent transition duration-500" />
                <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,transparent,rgb(250_249_245_/_0.92)_42%,rgb(250_249_245_/_0.98))]" />

                <span className="liquid-glass-control absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition group-hover:border-primary group-hover:text-primary">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                </span>

                <div className="relative z-10 flex h-full flex-col justify-end p-2.5 transition-all duration-500 md:p-4">
                  <div className="rounded-[16px] border border-border/80 bg-popover/80 p-3 shadow-[0_10px_26px_rgb(61_57_41_/_0.08)] backdrop-blur-xl md:p-5">
                    <p className="mono text-[10px] text-primary/90 md:text-xs">{item.eyebrow}</p>
                    <p className="mono mt-3 text-[10px] text-muted-foreground md:text-xs">{item.metric}</p>
                    <h2 className="mt-2 text-xl font-semibold leading-none text-foreground md:text-4xl lg:text-[2.85rem]">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-1 text-[11px] leading-5 text-muted-foreground md:mt-3 md:line-clamp-2 md:text-sm md:leading-6">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </main>
  );
}
