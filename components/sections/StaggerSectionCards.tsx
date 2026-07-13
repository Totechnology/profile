"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type StaggerCardItem = {
  id: string;
  title: string;
  body: string;
  meta?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  href?: string;
  featured?: boolean;
};

function StaggerCard({
  item,
  position,
  cardWidth,
  cardHeight,
  opening,
  handleMove,
  handleOpen
}: {
  item: StaggerCardItem;
  position: number;
  cardWidth: number;
  cardHeight: number;
  opening: boolean;
  handleMove: (steps: number) => void;
  handleOpen: (item: StaggerCardItem) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-70, 70], [5, -5]);
  const rotateY = useTransform(mouseX, [-70, 70], [-5, 5]);
  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 28 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 28 });

  const isCenter = position === 0;
  const showSystemLayer = isCenter || hovered;
  const bodyParagraphs = item.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const safePosition = Math.max(-3, Math.min(3, position));
  const offsetX = (cardWidth / 1.5) * safePosition;
  const offsetY = isCenter ? -42 : safePosition % 2 ? 22 : -12;
  const rotation = isCenter ? 0 : safePosition % 2 ? 2.4 : -2.4;
  const scale = opening ? 1.16 : hovered ? (isCenter ? 1.035 : 1.018) : 1;

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (!cardRef.current || reduceMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - (rect.left + rect.width / 2));
    mouseY.set(event.clientY - (rect.top + rect.height / 2));
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }

  function activate() {
    if (position !== 0) {
      handleMove(position);
      return;
    }

    handleOpen(item);
  }

  return (
    <motion.article
      ref={cardRef}
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
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer overflow-visible transition-all duration-300 ease-out",
        "focus-ring focus-within:outline-none",
        isCenter ? "z-20" : "z-10"
      )}
      style={{
        width: cardWidth,
        height: cardHeight,
        perspective: 1000,
        transform: `
          translate(-50%, -50%)
          translateX(${offsetX}px)
          translateY(${offsetY}px)
          rotate(${rotation}deg)
          scale(${scale})
        `
      }}
      animate={{
        opacity: opening ? 0.96 : Math.abs(safePosition) > 2 ? 0.56 : 1,
        filter: opening ? "blur(0px)" : Math.abs(safePosition) > 2 ? "blur(1px)" : "blur(0px)"
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          "archive-card-shape relative h-full w-full overflow-hidden border-2 p-4 transition-colors duration-300 sm:p-7",
          isCenter
            ? "is-active border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-card-foreground hover:border-primary/60"
        )}
        style={{
          rotateX: reduceMotion ? 0 : springRotateX,
          rotateY: reduceMotion ? 0 : springRotateY,
          transformStyle: "preserve-3d",
          boxShadow: isCenter
            ? "0px 14px 0px -2px color-mix(in srgb, var(--border), var(--primary) 18%), 0 28px 64px rgb(61 57 41 / 0.18)"
            : hovered
              ? "0 20px 44px rgb(61 57 41 / 0.13)"
              : "0px 10px 28px rgb(61 57 41 / 0.08)"
        }}
      >
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-30 origin-right border-l",
            isCenter
              ? "border-primary-foreground/28 bg-[linear-gradient(90deg,rgb(255_255_255_/_0.12),rgb(255_255_255_/_0.68))]"
              : "border-border bg-[linear-gradient(90deg,rgb(245_244_239_/_0.18),rgb(255_255_255_/_0.88))]"
          )}
          initial={false}
          animate={{
            opacity: opening ? 1 : 0,
            scaleX: opening ? 1 : 0,
            rotateY: opening ? 0 : -72
          }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: "right center" }}
        />

        <motion.div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255_/_0.22),transparent_44%),radial-gradient(circle_at_78%_22%,rgb(156_135_245_/_0.16),transparent_30%)]"
          animate={{ opacity: showSystemLayer ? 1 : 0.42 }}
          transition={{ duration: 0.3 }}
        />

        <motion.svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          animate={{ opacity: showSystemLayer ? 0.9 : 0.16 }}
          transition={{ duration: 0.28 }}
        >
          <defs>
            <pattern id={`archive-grid-${item.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" className={isCenter ? "stroke-primary-foreground/14" : "stroke-foreground/10"} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#archive-grid-${item.id})`} />
          {[34, 58, 76].map((y, index) => (
            <motion.line
              key={`h-${y}`}
              x1="9%"
              y1={`${y}%`}
              x2="91%"
              y2={`${y}%`}
              className={isCenter ? "stroke-primary-foreground/30" : "stroke-primary/36"}
              strokeWidth={index === 1 ? 2.4 : 1.4}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: showSystemLayer ? 1 : 0.22 }}
              transition={{ duration: 0.62, delay: index * 0.05 }}
            />
          ))}
          {[24, 48, 72].map((x, index) => (
            <motion.line
              key={`v-${x}`}
              x1={`${x}%`}
              y1="16%"
              x2={`${x}%`}
              y2="84%"
              className={isCenter ? "stroke-primary-foreground/22" : "stroke-foreground/18"}
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: showSystemLayer ? 1 : 0.18 }}
              transition={{ duration: 0.54, delay: 0.12 + index * 0.05 }}
            />
          ))}
          {[
            ["18%", "28%"],
            ["46%", "44%"],
            ["72%", "32%"],
            ["82%", "72%"]
          ].map(([cx, cy], index) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={index === 1 ? 5 : 3.5}
              className={isCenter ? "fill-primary-foreground/45" : "fill-primary/42"}
              initial={false}
              animate={{ scale: showSystemLayer ? [0.75, 1.15, 1] : 0.7, opacity: showSystemLayer ? 1 : 0.3 }}
              transition={{ duration: 0.42, delay: 0.18 + index * 0.04 }}
            />
          ))}
        </motion.svg>

        <div className="relative z-10 flex h-full min-h-0 flex-col" style={{ transform: "translateZ(34px)" }}>
          <div className="mb-3 flex shrink-0 items-start justify-between gap-3 sm:mb-4 sm:gap-4">
            {item.image ? (
              <motion.img
                src={item.image}
                alt={item.title}
                className={cn(
                  "h-12 w-12 rounded-[12px] border object-cover object-center sm:h-16 sm:w-16 sm:rounded-[14px]",
                  isCenter ? "border-primary-foreground/35 bg-primary-foreground/10" : "border-border bg-muted"
                )}
                animate={{ scale: showSystemLayer ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                style={{ boxShadow: isCenter ? "3px 3px 0px rgb(255 255 255 / 0.22)" : "3px 3px 0px var(--background)" }}
              />
            ) : (
              <div
                className={cn(
                  "h-12 w-12 rounded-[12px] border sm:h-16 sm:w-16 sm:rounded-[14px]",
                  isCenter ? "border-primary-foreground/35 bg-primary-foreground/12" : "border-border bg-muted"
                )}
                style={{ boxShadow: isCenter ? "3px 3px 0px rgb(255 255 255 / 0.22)" : "3px 3px 0px var(--background)" }}
              />
            )}

            <motion.div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm",
                isCenter
                  ? "border-primary-foreground/22 bg-primary-foreground/12 text-primary-foreground/78"
                  : "border-border bg-background/48 text-muted-foreground"
              )}
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isCenter ? "bg-primary-foreground/80" : "bg-primary")} />
              <span className="mono text-[10px] uppercase tracking-normal">{item.featured ? "Featured" : "Live"}</span>
            </motion.div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {item.meta ? (
              <p className={cn("mono mb-2 line-clamp-1 text-[10px] sm:mb-3 sm:text-[11px]", isCenter ? "text-primary-foreground/72" : "text-muted-foreground")}>
                {item.meta}
              </p>
            ) : null}
            <motion.h3
              className={cn("line-clamp-2 shrink-0 text-lg font-semibold leading-tight sm:text-2xl", isCenter ? "text-primary-foreground" : "text-foreground")}
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              {item.title}
            </motion.h3>
            <p
              className={cn(
                "mt-3 line-clamp-4 text-xs leading-5 sm:hidden",
                isCenter ? "text-primary-foreground/84" : "text-muted-foreground"
              )}
            >
              {item.body.replace(/\s+/g, " ")}
            </p>
            <div
              className={cn(
                "custom-scrollbar archive-card-copy mt-4 hidden min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 text-sm leading-6 sm:block",
                isCenter ? "text-primary-foreground/84" : "text-muted-foreground"
              )}
              tabIndex={0}
              aria-label={`${item.title}完整介绍`}
            >
              <div className="space-y-3">
                {bodyParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 shrink-0 sm:mt-4">
            <motion.div
              className={cn(
                "mb-3 h-px origin-left bg-gradient-to-r sm:mb-4",
                isCenter
                  ? "from-primary-foreground/56 via-primary-foreground/28 to-transparent"
                  : "from-primary/56 via-primary/22 to-transparent"
              )}
              animate={{ scaleX: showSystemLayer ? 1 : 0.28 }}
              transition={{ duration: 0.34, ease: "easeOut" }}
            />

            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {item.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex min-h-6 items-center rounded-full border px-2 text-[10px] sm:min-h-7 sm:px-2.5 sm:text-[11px]",
                      index === 2 && "hidden sm:inline-flex",
                      isCenter
                        ? "border-primary-foreground/28 bg-primary-foreground/12 text-primary-foreground/86"
                        : "border-border bg-background/48 text-secondary-foreground"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {item.href ? (
                <motion.span
                  className={cn(
                    "liquid-glass-control flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition sm:h-9 sm:w-9",
                    isCenter
                      ? "border-primary-foreground/30 bg-primary-foreground/12 text-primary-foreground"
                      : "border-border bg-background/52 text-foreground"
                  )}
                  animate={{ rotate: showSystemLayer ? 45 : 0, scale: hovered ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                </motion.span>
              ) : null}
            </div>

          </div>
        </div>
      </motion.div>
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
  const [cardDimensions, setCardDimensions] = useState({ width: 282, height: 390 });
  const [itemList, setItemList] = useState<StaggerCardItem[]>(items);
  const [openingId, setOpeningId] = useState("");

  useEffect(() => {
    setItemList(items);
  }, [items]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setCardDimensions({ width: 390, height: 530 });
        return;
      }

      if (width >= 768) {
        setCardDimensions({ width: 370, height: 510 });
        return;
      }

      setCardDimensions({
        width: Math.max(248, Math.min(282, width - 48)),
        height: 390
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const visibleItems = useMemo(() => itemList.slice(0, 12), [itemList]);

  const handleMove = (steps: number) => {
    if (!steps || openingId) return;

    setItemList((current) => {
      const next = [...current];

      if (steps > 0) {
        for (let i = steps; i > 0; i -= 1) {
          const item = next.shift();
          if (!item) return current;
          next.push(item);
        }
      } else {
        for (let i = steps; i < 0; i += 1) {
          const item = next.pop();
          if (!item) return current;
          next.unshift(item);
        }
      }

      return next;
    });
  };

  const handleOpen = (item: StaggerCardItem) => {
    if (!item.href || openingId) return;
    setOpeningId(item.id);
    window.setTimeout(() => router.push(item.href || ""), reduceMotion ? 0 : 280);
  };

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div className="relative min-h-[510px] w-full overflow-hidden border-y border-border bg-muted/30 md:min-h-[700px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(201_100_66_/_0.13),transparent_34%),radial-gradient(circle_at_70%_35%,rgb(156_135_245_/_0.12),transparent_28%)]" />
      {visibleItems.map((item, index) => (
        <StaggerCard
          key={item.id}
          item={item}
          position={getCircularPosition(index, visibleItems.length)}
          cardWidth={cardDimensions.width}
          cardHeight={cardDimensions.height}
          opening={openingId === item.id}
          handleMove={handleMove}
          handleOpen={handleOpen}
        />
      ))}

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        <button
          onClick={() => handleMove(-1)}
          className="carousel-nav-button focus-ring"
          type="button"
          aria-label="Previous card"
          disabled={Boolean(openingId)}
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="carousel-nav-button focus-ring"
          type="button"
          aria-label="Next card"
          disabled={Boolean(openingId)}
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
