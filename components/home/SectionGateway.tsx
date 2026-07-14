"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { Reveal } from "@/components/motion/Reveal";
import { scrapbookImages } from "@/components/scrapbook/assets";
import { SoftButton } from "@/components/ui/SoftButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";
import type { SiteContent, SectionKey } from "@/lib/types";

const sectionOrder: SectionKey[] = ["skills", "experiences", "thoughts", "life"];

const imagePosition: Record<SectionKey, string> = {
  skills: "object-[52%_44%]",
  experiences: "object-[50%_38%]",
  thoughts: "object-[50%_36%]",
  life: "object-[50%_38%]"
};

const gatewayLayout: Record<SectionKey, string> = {
  skills: "col-span-2 min-h-[310px] lg:col-span-5 lg:row-span-2 lg:min-h-0",
  experiences: "min-h-[250px] lg:col-span-4 lg:min-h-0",
  thoughts: "min-h-[250px] lg:col-span-3 lg:min-h-0",
  life: "col-span-2 min-h-[270px] lg:col-span-7 lg:min-h-0"
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
  const descriptionBlocks = profileParagraphs(profile.description).slice(0, 2);

  return (
    <main id="hero" className="container-space min-h-[100dvh] pb-12 pt-24 md:pt-36">
      <Reveal>
        <section className="paper-card overflow-hidden rounded-[var(--radius-xl)] p-5 sm:p-6 lg:p-8" aria-labelledby="home-profile-name">
          <div className="absolute inset-y-8 left-0 hidden w-1.5 rounded-r-full bg-primary/78 md:block" aria-hidden="true" />
          <div className="relative z-10 grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)_280px] lg:gap-8">
            <div className="order-2 grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)] lg:order-1 lg:grid-cols-1">
              <div className="relative aspect-[4/5] min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-soft)]">
                <Image
                  src={portraitImage}
                  alt={`${profile.name}头像`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 190px, (min-width: 640px) 170px, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="content-start rounded-[var(--radius-md)] border border-border bg-background-soft/72 p-4">
                <p className="eyebrow">{profile.location}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.disciplines.slice(0, 4).map((discipline) => (
                    <Tag key={discipline}>{discipline}</Tag>
                  ))}
                </div>
                <p className="mono mt-4 border-t border-border pt-3 text-[10px] leading-5 text-muted-foreground">
                  {profile.footerLine}
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <StatusBadge tone="accent">{profile.status}</StatusBadge>
              <p className="eyebrow mt-6">Always Be Better</p>
              <h1 id="home-profile-name" className="mt-2 text-5xl font-semibold leading-none tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
              <p className="mt-4 text-lg font-medium leading-8 text-foreground-soft sm:text-xl">{profile.title}</p>
              <div className="mt-6 h-px bg-gradient-to-r from-primary/48 via-border to-transparent" aria-hidden="true" />
              <div className="mt-6 max-w-2xl space-y-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {descriptionBlocks.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside className="order-3 flex flex-col gap-5 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div>
                <p className="eyebrow">Working Method</p>
                <p className="mt-3 text-sm leading-7 text-foreground-soft">{profile.supportText}</p>
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">Core Systems</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.tags.slice(0, 5).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
              {contact ? (
                <SoftButton asChild variant="primary" className="mt-auto w-full">
                  <a href={contact.href}>
                    <Mail className="h-4 w-4" strokeWidth={1.8} />
                    {contact.label}
                  </a>
                </SoftButton>
              ) : null}
            </aside>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08} className="mt-5">
        <section className="grid grid-cols-2 gap-3 lg:h-[590px] lg:grid-cols-12 lg:grid-rows-2 lg:gap-4" aria-label="主页内容入口">
          {sectionOrder.map((key, index) => {
            const item = content.showcases[key];

            return (
              <Link key={item.key} href={item.href} className={cn("focus-ring group block", gatewayLayout[key])}>
                <BaseCard interactive featured={key === "skills"} className="h-full rounded-[var(--radius-lg)]">
                  <Image
                    src={item.image}
                    alt={`${item.title}入口展示图`}
                    fill
                    priority={index < 2}
                    sizes={key === "skills" ? "(min-width: 1024px) 42vw, 100vw" : "(min-width: 1024px) 58vw, 100vw"}
                    className={cn("object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.015]", imagePosition[key])}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(45_41_34_/_0.82)] via-[rgb(45_41_34_/_0.12)] to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white sm:p-5">
                    <p className="mono text-[10px] tracking-[0.08em] text-white/68">{item.eyebrow}</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <h2 className={cn("font-semibold leading-none", key === "skills" ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl")}>
                          {item.title}
                        </h2>
                        <p className="mt-3 line-clamp-2 max-w-lg text-xs leading-6 text-white/74 sm:text-sm">{item.description}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/28 bg-white/10" aria-hidden="true">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                    </div>
                    <p className="mono mt-3 text-[10px] text-white/62">{item.metric}</p>
                  </div>
                </BaseCard>
              </Link>
            );
          })}
        </section>
      </Reveal>
    </main>
  );
}
