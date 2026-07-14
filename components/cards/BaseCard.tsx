import Image from "next/image";
import { scrapbookImages, timelineMarkers } from "@/components/scrapbook/assets";
import { cn } from "@/lib/utils";

export type BaseCardProps = {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  interactive?: boolean;
  decoration?: "none" | "tape" | "pin" | "stamp";
};

const decorationAssets = {
  tape: scrapbookImages.tapeKraft,
  pin: timelineMarkers[1],
  stamp: timelineMarkers[3]
} as const;

export function BaseCard({
  children,
  className,
  featured = false,
  interactive = false,
  decoration = "none"
}: BaseCardProps) {
  const decorationAsset = decoration === "none" ? null : decorationAssets[decoration];

  return (
    <article
      className={cn(
        "paper-card group/card",
        featured && "paper-card-featured",
        interactive && "paper-card-interactive",
        className
      )}
    >
      {decorationAsset ? (
        <Image
          src={decorationAsset}
          alt=""
          aria-hidden="true"
          width={116}
          height={72}
          className={cn(
            "pointer-events-none absolute z-20 h-auto select-none",
            decoration === "tape" && "right-7 top-0 w-24 -translate-y-[42%] rotate-2 opacity-70 mix-blend-multiply",
            decoration === "pin" && "right-4 top-4 w-10 opacity-72",
            decoration === "stamp" && "right-4 top-4 w-10 opacity-66"
          )}
        />
      ) : null}
      <div className="relative z-10 h-full">{children}</div>
    </article>
  );
}
