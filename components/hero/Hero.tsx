import Image from "next/image";
import { ArrowDownRight, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/cards/Tag";
import type { ProfileMeta } from "@/lib/types";

export function Hero({ profile }: { profile: ProfileMeta }) {
  return (
    <section id="hero" className="container-space flex min-h-[96dvh] scroll-mt-28 items-center pt-28 md:pt-24">
      <div className="grid w-full gap-10 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <div>
            <p className="mono mb-5 text-sm text-sky-100/70">{profile.status}</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-white md:text-7xl">
              {profile.name}
            </h1>
            <p className="mt-5 text-xl text-zinc-200 md:text-2xl">{profile.title}</p>
            <p className="mt-8 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
              {profile.description}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
              {profile.supportText}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="primary-button focus-ring" href="#experience">
                查看个人经历
                <ArrowDownRight className="h-4 w-4" strokeWidth={1.8} />
              </a>
              <a className="secondary-button focus-ring" href="mailto:hello@example.com">
                <Mail className="h-4 w-4" strokeWidth={1.8} />
                联系我
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="glass-panel relative overflow-hidden p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#080a12]">
              <Image
                src={profile.portraitImage}
                alt={`${profile.name} 的个人档案卡占位图`}
                fill
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <span className="mono rounded-full border border-sky-200/[0.24] bg-black/30 px-3 py-1.5 text-xs text-sky-100 backdrop-blur-md">
                  ARCHIVE UNIT
                </span>
                <span className="mono rounded-full border border-emerald-300/[0.22] bg-emerald-300/[0.08] px-3 py-1.5 text-xs text-emerald-100">
                  ONLINE
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="glass-panel rounded-[8px] p-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-zinc-500">Identity</span>
                      <span className="text-white">{profile.name}</span>
                    </div>
                    <div className="hairline" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-zinc-500">Mode</span>
                      <span className="text-white">{profile.disciplines.join(" / ")}</span>
                    </div>
                    <div className="hairline" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-zinc-500">Location</span>
                      <span className="text-white">{profile.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
