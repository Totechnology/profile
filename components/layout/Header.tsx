"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
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
              variant === "desktop" ? "justify-center rounded-[var(--radius-sm)] px-1 text-xs md:h-full" : "justify-between rounded-[var(--radius-sm)] px-4",
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
                  variant === "desktop" ? "inset-x-5 bottom-1 h-0.5 rounded-full" : "inset-y-2 left-0 w-0.5 rounded-full"
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
    <header className="pointer-events-auto fixed left-0 right-0 top-3 z-40 px-3 md:pointer-events-none md:top-4 md:px-4">
        <details className="mobile-menu-trigger group ml-auto w-fit md:hidden">
          <summary
            className="focus-ring pointer-events-auto ml-auto inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-sm)] border border-border bg-popover/92 text-foreground shadow-[var(--shadow-soft)] backdrop-blur-xl transition-transform active:scale-95 motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
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
          className="pointer-events-none relative mx-auto hidden h-[122px] w-full justify-center md:flex"
          data-testid="coffee-island"
        >
          <div className="group pointer-events-auto relative h-11 w-11 shrink-0 overflow-visible">
            <button
              type="button"
              aria-label="主导航，悬停或聚焦后展开"
              aria-controls="desktop-navigation"
              className="focus-ring absolute left-1/2 top-0 z-30 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full transition-opacity duration-150 group-hover:pointer-events-none group-hover:opacity-0 group-focus-within:pointer-events-none group-focus-within:opacity-0 motion-reduce:transition-none"
            >
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full border border-border/70 bg-popover/90 shadow-[0_7px_18px_rgb(61_57_41_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.65)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/75" aria-hidden="true" />
              </span>
            </button>

            <div
              data-testid="coffee-island-panel"
              className="pointer-events-none invisible absolute left-1/2 top-0 h-[122px] w-[440px] -translate-x-1/2 scale-95 opacity-0 drop-shadow-[0_18px_28px_rgb(61_57_41_/_0.16)] transition-[opacity,transform] duration-200 ease-out group-hover:visible group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none"
            >
              <Image
                src={scrapbookImages.coffeeIslandTray}
                alt=""
                width={1969}
                height={546}
                priority
                sizes="440px"
                className="pointer-events-none absolute inset-0 h-auto w-full max-w-none select-none"
              />

              <nav
                id="desktop-navigation"
                className="pointer-events-auto absolute left-[120px] top-12 z-20 grid h-[51px] grid-cols-[repeat(4,58px)] gap-[18px]"
                aria-label="主导航"
              >
                {renderNav("desktop")}
              </nav>
            </div>
          </div>
        </div>

    </header>
  );
}
