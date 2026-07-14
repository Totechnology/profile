"use client";

import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

export type StaggerCardItem = {
  id: string;
  title: string;
  body: string;
  meta?: string;
  kicker?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  outcomes?: string[];
  href?: string;
  featured?: boolean;
  kind?: "capability" | "project";
};

function StaggerCard({
  item,
  position,
  cardWidth,
  cardHeight,
  opening,
  onMove,
  onOpen
}: {
  item: StaggerCardItem;
  position: number;
  cardWidth: number;
  cardHeight: number;
  opening: boolean;
  onMove: (steps: number) => void;
  onOpen: (item: StaggerCardItem) => void;
}) {
  const reduceMotion = useReducedMotion();
  const isCenter = position === 0;
  const safePosition = Math.max(-3, Math.min(3, position));
  const offsetX = cardWidth * 0.72 * safePosition;
  const offsetY = isCenter ? -28 : Math.abs(safePosition) * 12;
  const rotation = isCenter ? 0 : safePosition < 0 ? -2.1 : 2.1;
  const scale = opening ? 1.04 : isCenter ? 1.1 : 0.91;

  function activate() {
    if (!isCenter) {
      onMove(position);
      return;
    }

    onOpen(item);
  }

  return (
    <motion.article
      tabIndex={0}
      role="button"
      aria-label={item.href ? `打开 ${item.title}` : item.title}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
      className={cn(
        "focus-ring absolute left-1/2 top-1/2 cursor-pointer overflow-visible",
        isCenter ? "z-20" : "z-10",
        Math.abs(safePosition) > 2 && "pointer-events-none"
      )}
      style={{ width: cardWidth, height: cardHeight }}
      animate={{
        x: `calc(-50% + ${offsetX}px)`,
        y: `calc(-50% + ${offsetY}px)`,
        rotate: reduceMotion ? 0 : rotation,
        scale,
        opacity: Math.abs(safePosition) > 2 ? 0 : isCenter ? 1 : 0.72,
        filter: isCenter ? "saturate(1)" : "saturate(0.78)"
      }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "paper-card archive-card-shape h-full overflow-hidden p-5 sm:p-7",
          isCenter
            ? "archive-card-active shadow-[var(--shadow-card)]"
            : "bg-[var(--surface)] text-card-foreground"
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 opacity-70",
            isCenter
              ? "bg-[linear-gradient(rgb(255_255_255_/_0.11)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_0.11)_1px,transparent_1px)] bg-[size:46px_46px]"
              : "bg-[linear-gradient(rgb(80_72_60_/_0.055)_1px,transparent_1px),linear-gradient(90deg,rgb(80_72_60_/_0.055)_1px,transparent_1px)] bg-[size:46px_46px]"
          )}
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                width={64}
                height={64}
                className={cn(
                  "h-14 w-14 rounded-[var(--radius-sm)] border object-cover sm:h-16 sm:w-16",
                  isCenter ? "border-primary-foreground/28" : "border-border"
                )}
              />
            ) : (
              <div
                className={cn(
                  "h-14 w-14 rounded-[var(--radius-sm)] border bg-muted sm:h-16 sm:w-16",
                  isCenter && "border-primary-foreground/28 bg-primary-foreground/12"
                )}
                aria-hidden="true"
              />
            )}

            <StatusBadge tone={isCenter ? "neutral" : item.featured ? "accent" : "sage"} className={isCenter ? "border-primary-foreground/24 bg-primary-foreground/10 text-primary-foreground" : ""}>
              {item.featured ? "Featured" : item.kind === "project" ? "Project" : "Active"}
            </StatusBadge>
          </div>

          <div className="mt-5 min-h-0 flex-1">
            <p className={cn("eyebrow", isCenter && "text-primary-foreground/72")}>{item.kicker || item.meta}</p>
            <h2 className={cn("mt-2 text-2xl font-semibold leading-tight sm:text-[2rem]", isCenter ? "text-primary-foreground" : "text-foreground")}>
              {item.title}
            </h2>
            {item.meta && item.meta !== item.kicker ? (
              <p className={cn("mono mt-3 text-[11px] leading-5", isCenter ? "text-primary-foreground/68" : "text-muted-foreground")}>
                {item.meta}
              </p>
            ) : null}
            <p className={cn("mt-4 line-clamp-4 text-sm leading-7", isCenter ? "text-primary-foreground/88" : "text-muted-foreground")}>
              {item.body.replace(/\s+/g, " ")}
            </p>

            {isCenter && item.outcomes?.length ? (
              <div className="mt-5 border-t border-primary-foreground/22 pt-4">
                <p className="mono text-[10px] tracking-[0.1em] text-primary-foreground/62">结果与输出</p>
                <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-primary-foreground/84">
                  {item.outcomes.slice(0, 2).map((outcome) => (
                    <li key={outcome} className="flex gap-2">
                      <span aria-hidden="true">·</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-current/16 pt-4">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {item.tags?.slice(0, 3).map((tag) => (
                <Tag key={tag} className={isCenter ? "border-primary-foreground/24 bg-primary-foreground/10 text-primary-foreground" : ""}>
                  {tag}
                </Tag>
              ))}
            </div>
            {item.href ? (
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                  isCenter ? "border-primary-foreground/28 bg-primary-foreground/10" : "border-border bg-background-soft/72"
                )}
                aria-hidden="true"
              >
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function getCircularPosition(index: number, length: number) {
  if (length <= 1) return 0;
  const midpoint = Math.floor(length / 2);
  return index > midpoint ? index - length : index;
}

export function StaggerSectionCards({ items }: { items: StaggerCardItem[] }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [cardDimensions, setCardDimensions] = useState({ width: 282, height: 408 });
  const [itemList, setItemList] = useState(items);
  const [openingId, setOpeningId] = useState("");

  useEffect(() => {
    setItemList(items);
  }, [items]);

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;

      if (width >= 1280) {
        setCardDimensions({ width: 356, height: 470 });
      } else if (width >= 768) {
        setCardDimensions({ width: 332, height: 450 });
      } else {
        setCardDimensions({ width: Math.max(248, Math.min(282, width - 72)), height: 408 });
      }
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const visibleItems = useMemo(() => itemList.slice(0, 12), [itemList]);

  function handleMove(steps: number) {
    if (!steps || openingId) return;

    setItemList((current) => {
      const next = [...current];

      if (steps > 0) {
        for (let index = steps; index > 0; index -= 1) {
          const item = next.shift();
          if (!item) return current;
          next.push(item);
        }
      } else {
        for (let index = steps; index < 0; index += 1) {
          const item = next.pop();
          if (!item) return current;
          next.unshift(item);
        }
      }

      return next;
    });
  }

  function handleOpen(item: StaggerCardItem) {
    if (!item.href || openingId) return;
    setOpeningId(item.id);
    window.setTimeout(() => router.push(item.href || ""), reduceMotion ? 0 : 220);
  }

  if (!visibleItems.length) return null;

  return (
    <section className="relative min-h-[540px] w-full overflow-hidden border-y border-border bg-background-soft/52 md:min-h-[650px]" aria-label="内容卡片轮播">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgb(208_106_72_/_0.05),transparent)]" aria-hidden="true" />
      {visibleItems.map((item, index) => (
        <StaggerCard
          key={item.id}
          item={item}
          position={getCircularPosition(index, visibleItems.length)}
          cardWidth={cardDimensions.width}
          cardHeight={cardDimensions.height}
          opening={openingId === item.id}
          onMove={handleMove}
          onOpen={handleOpen}
        />
      ))}

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        <button className="carousel-nav-button focus-ring" type="button" onClick={() => handleMove(-1)} aria-label="上一张卡片" disabled={Boolean(openingId)}>
          <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <button className="carousel-nav-button focus-ring" type="button" onClick={() => handleMove(1)} aria-label="下一张卡片" disabled={Boolean(openingId)}>
          <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
