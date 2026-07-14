"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const layoutByCount: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2",
  3: "grid-cols-1 grid-rows-3",
  4: "grid-cols-2 grid-rows-2"
};

export function EntryMediaGallery({ title, images }: { title: string; images: string[] }) {
  const visibleImages = images.slice(0, 4);
  const itemCount = Math.max(visibleImages.length, 1);
  const imageSizes = visibleImages.length === 4 ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw";

  return (
    <section className="paper-card detail-media-frame h-full overflow-hidden p-3" aria-label={`${title}图片集`}>
      <div className={cn("grid h-full gap-3", layoutByCount[itemCount])}>
        {visibleImages.length ? (
          visibleImages.map((image, index) => (
            <figure
              key={image}
              className="detail-media-tile group relative min-h-0 overflow-hidden border border-border bg-muted"
            >
              <Image
                src={image}
                alt={`${title}图片 ${index + 1}`}
                fill
                priority={index === 0}
                sizes={imageSizes}
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.015]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-white/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
            </figure>
          ))
        ) : (
          <div
            className="detail-media-tile relative overflow-hidden border border-border bg-muted"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--sage-soft),var(--lavender-soft))]" />
          </div>
        )}
      </div>
    </section>
  );
}
