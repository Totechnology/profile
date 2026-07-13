"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrapbookImages } from "@/components/scrapbook/assets";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "个人能力", href: "/capabilities" },
  { label: "个人经历", href: "/experience" },
  { label: "学习思考", href: "/thoughts" },
  { label: "个人生活", href: "/life" }
];

export function Header() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);
  const collapseTimerRef = useRef<number | null>(null);
  const islandRef = useRef<HTMLDivElement | null>(null);
  const pointerInsideRef = useRef(false);

  const contentTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 560, damping: 36, mass: 0.58 };

  const expandIsland = useCallback(() => {
    setCompact(false);
  }, []);

  const collapseIsland = useCallback(() => {
    setCompact(true);
  }, []);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current === null) return;
    window.clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = null;
  }, []);

  const scheduleCollapse = useCallback((delay: number) => {
    clearCollapseTimer();
    collapseTimerRef.current = window.setTimeout(() => {
      collapseTimerRef.current = null;
      collapseIsland();
    }, delay);
  }, [clearCollapseTimer, collapseIsland]);

  const handleIslandEnter = useCallback(() => {
    clearCollapseTimer();
    expandIsland();
  }, [clearCollapseTimer, expandIsland]);

  const handleIslandLeave = useCallback(() => {
    scheduleCollapse(2000);
  }, [scheduleCollapse]);

  useEffect(() => {
    pointerInsideRef.current = false;
    setCompact(false);

    if (window.matchMedia("(min-width: 768px)").matches) {
      scheduleCollapse(5000);
    }

    return clearCollapseTimer;
  }, [pathname, clearCollapseTimer, scheduleCollapse]);

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!window.matchMedia("(min-width: 768px)").matches) {
        pointerInsideRef.current = false;
        return;
      }

      const island = islandRef.current;
      if (!island) return;

      const rect = island.getBoundingClientRect();
      const isCompact = island.dataset.islandState === "compact";
      const left = isCompact ? rect.left + rect.width / 2 - 60 : rect.left;
      const right = isCompact ? rect.left + rect.width / 2 + 60 : rect.right;
      const top = rect.top;
      const bottom = isCompact ? Math.min(rect.bottom, rect.top + 96) : rect.bottom;
      const inside = event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;

      if (inside === pointerInsideRef.current) return;
      pointerInsideRef.current = inside;

      if (inside) {
        handleIslandEnter();
      } else {
        handleIslandLeave();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleIslandEnter, handleIslandLeave]);

  const renderNav = (variant: "desktop" | "mobile") => (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex min-h-11 items-center text-sm font-medium text-secondary-foreground transition-colors hover:text-primary",
              variant === "desktop" ? "justify-center px-2 md:h-full" : "justify-between rounded-[14px] px-4",
              active && "text-primary"
            )}
          >
            <span className="relative z-10">{item.label}</span>
            {variant === "mobile" ? (
              <span className={cn("h-1.5 w-1.5 rounded-full bg-border", active && "bg-primary")} aria-hidden />
            ) : null}
            {active ? (
              <motion.span
                layoutId={`${variant}-active-navigation-marker`}
                className={cn(
                  "absolute bg-primary",
                  variant === "desktop" ? "inset-x-2 bottom-0 h-0.5 rounded-full" : "inset-y-2 left-0 w-0.5 rounded-full"
                )}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 36 }}
              />
            ) : null}
          </Link>
        );
      })}
    </>
  );

  return (
    <MotionConfig transition={contentTransition}>
      <header className="pointer-events-auto fixed left-0 right-0 top-3 z-40 px-3 md:pointer-events-none md:top-4 md:px-4">
        <details className="mobile-menu-trigger group ml-auto w-fit md:hidden">
          <summary
            className="focus-ring pointer-events-auto ml-auto inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[14px] border border-border bg-popover/92 text-foreground shadow-[0_10px_28px_rgb(61_57_41_/_0.12)] backdrop-blur-xl transition-transform active:scale-95 motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
            aria-label="打开导航菜单"
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5 group-open:hidden" strokeWidth={1.8} />
            <X className="hidden h-5 w-5 group-open:block" strokeWidth={1.8} />
          </summary>
          <nav
            id="mobile-navigation"
            className="glass-panel pointer-events-auto mt-2 grid w-[min(78vw,292px)] origin-top-right gap-1 p-2.5"
            aria-label="手机端主导航"
          >
            {renderNav("mobile")}
          </nav>
        </details>

        <div
          ref={islandRef}
          className={cn(
            "relative mx-auto hidden h-[112px] w-[min(calc(100vw-32px),640px)] md:block",
            compact ? "pointer-events-none" : "pointer-events-auto"
          )}
          data-island-state={compact ? "compact" : "expanded"}
          data-testid="coffee-island"
        >
          <motion.div
            aria-hidden
            animate={{
              opacity: compact ? 0 : 1,
              scale: compact ? 0.96 : 1,
              filter: compact ? "blur(1.4px)" : "blur(0px)"
            }}
            transition={{
              ...contentTransition,
              opacity: { duration: reducedMotion ? 0 : compact ? 0.28 : 0.18, ease: "easeOut" },
              filter: { duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }
            }}
            className="pointer-events-none absolute inset-0 drop-shadow-[0_22px_34px_rgb(61_57_41_/_0.14)]"
          >
            <Image
              src={scrapbookImages.coffeeIslandTray}
              alt=""
              width={760}
              height={215}
              priority
              sizes="(min-width: 900px) 640px, calc(100vw - 32px)"
              className="absolute left-0 h-auto w-full max-w-none select-none"
              style={{ top: "clamp(-32px, -3.9vw, -14px)" }}
            />
          </motion.div>

          <motion.button
            className="focus-ring pointer-events-auto absolute left-1/2 top-0 z-30 h-[86px] w-[104px] -translate-x-1/2 rounded-[34px]"
            type="button"
            aria-label="展开导航"
            aria-hidden={!compact}
            tabIndex={compact ? 0 : -1}
            animate={{ opacity: compact ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.12 }}
            onClick={expandIsland}
            style={{ pointerEvents: compact ? "auto" : "none" }}
          >
            <span className="sr-only">展开导航</span>
          </motion.button>

          <motion.div
            aria-hidden
            animate={{
              opacity: compact ? 1 : 0,
              scale: compact ? [0.94, 1.025, 1] : 0.9,
              rotate: compact ? [0, -0.8, 0] : 0,
              y: compact ? [6, -1, 0] : -4
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : compact
                  ? {
                      opacity: { duration: 0.1, ease: "easeOut" },
                      scale: { duration: 0.32, times: [0, 0.64, 1], ease: [0.22, 0.86, 0.24, 1] },
                      rotate: { duration: 0.32, times: [0, 0.64, 1], ease: [0.22, 0.86, 0.24, 1] },
                      y: { duration: 0.32, times: [0, 0.64, 1], ease: [0.22, 0.86, 0.24, 1] }
                    }
                  : { opacity: { duration: 0.1, ease: "easeOut" }, scale: { duration: 0.16, ease: "easeOut" } }
            }
            className="pointer-events-none absolute left-1/2 top-0 z-20 grid h-[86px] w-[104px] -translate-x-1/2 place-items-center drop-shadow-[0_16px_22px_rgb(61_57_41_/_0.16)]"
          >
            <Image
              src={scrapbookImages.coffeeIslandMug}
              alt=""
              width={100}
              height={114}
              sizes="88px"
              className="h-[78px] w-auto select-none object-contain"
            />
          </motion.div>

          <motion.nav
            animate={{
              opacity: compact ? 0 : 1
            }}
            transition={{ duration: reducedMotion ? 0 : compact ? 0.1 : 0.18, ease: "easeOut" }}
            className="absolute left-[177px] right-9 top-[62px] z-20 hidden h-9 grid-cols-4 gap-5 md:grid"
            aria-label="主导航"
            style={{ pointerEvents: compact ? "none" : "auto" }}
          >
            {renderNav("desktop")}
          </motion.nav>
        </div>

      </header>
    </MotionConfig>
  );
}
