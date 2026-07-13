"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const layoutByCount: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2",
  3: "grid-cols-1 grid-rows-3",
  4: "grid-cols-2 grid-rows-2"
};

export function EntryMediaGallery({ title, images }: { title: string; images: string[] }) {
  const reduceMotion = useReducedMotion();
  const visibleImages = images.slice(0, 4);
  const itemCount = Math.max(visibleImages.length, 1);
  const imageSizes = visibleImages.length === 4 ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw";

  return (
    <section className="glass-panel detail-media-frame h-full overflow-hidden p-3" aria-label={`${title}图片集`}>
      <div className={cn("grid h-full gap-3", layoutByCount[itemCount])}>
        {visibleImages.length ? (
          visibleImages.map((image, index) => (
            <motion.figure
              key={image}
              className="detail-media-tile group relative min-h-0 overflow-hidden border border-border bg-muted"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -8, x: -16 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ duration: 0.58, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { scale: 0.992, rotateZ: index % 2 ? 0.3 : -0.3 }}
            >
              <Image
                src={image}
                alt={`${title}图片 ${index + 1}`}
                fill
                priority={index === 0}
                sizes={imageSizes}
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-white/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="detail-photo-fold" aria-hidden />
            </motion.figure>
          ))
        ) : (
          <motion.div
            className="detail-media-tile relative overflow-hidden border border-border bg-muted"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgb(201_100_66_/_0.16),transparent_36%),radial-gradient(circle_at_72%_68%,rgb(156_135_245_/_0.14),transparent_34%)]" />
            <span className="detail-photo-fold" aria-hidden />
          </motion.div>
        )}
      </div>
    </section>
  );
}
