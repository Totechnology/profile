import Image from "next/image";
import { cn } from "@/lib/utils";

export function BaseCard({
  children,
  className,
  featured,
  image,
  imageAlt
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <article
      className={cn(
        "group/card relative overflow-hidden rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-[0_1px_3px_rgb(0_0_0_/_0.1)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-popover",
        featured && "border-primary/28 bg-popover",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgb(201_100_66_/_0.12),transparent_38%),linear-gradient(135deg,rgb(156_135_245_/_0.08),transparent_55%)]" />
      </div>

      {image ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border">
          <Image
            src={image}
            alt={imageAlt || ""}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover transition duration-500 group-hover/card:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
        </div>
      ) : null}

      <div className="relative z-10">{children}</div>
    </article>
  );
}
