import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

export type LifeGalleryItem = {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  image?: string;
  tags: string[];
  href: string;
  featured?: boolean;
};

export function LifeGallery({ items }: { items: LifeGalleryItem[] }) {
  return (
    <section className="container-space" aria-label="个人生活照片与故事">
      <div className="grid auto-rows-[220px] gap-4 md:grid-cols-12 md:auto-rows-[180px]">
        {items.map((item, index) => {
          const featured = index === 0;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "focus-ring group block min-h-0",
                featured ? "md:col-span-7 md:row-span-3" : index % 3 === 1 ? "md:col-span-5 md:row-span-2" : "md:col-span-5 md:row-span-1"
              )}
            >
              <BaseCard
                interactive
                featured={featured}
                decoration={featured && index === 0 ? "stamp" : "none"}
                className="h-full"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={featured ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 100vw"}
                    className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.015]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-sage-soft" aria-hidden="true" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(43_39_32_/_0.82)] via-[rgb(43_39_32_/_0.1)] to-transparent" aria-hidden="true" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-6">
                  <p className="mono text-[10px] tracking-[0.08em] text-white/72">
                    {[item.date, item.location].filter(Boolean).join(" / ") || "Life record"}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className={cn("font-semibold leading-tight", featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")}>
                        {item.title}
                      </h2>
                      {featured ? <p className="mt-3 max-w-lg text-sm leading-6 text-white/78">{item.description}</p> : null}
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                  </div>
                  {featured ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Tag key={tag} className="border-white/26 bg-white/10 text-white">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              </BaseCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
