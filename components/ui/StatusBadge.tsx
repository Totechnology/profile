import { cn } from "@/lib/utils";

export type StatusTone = "accent" | "sage" | "lavender" | "neutral";

export function StatusBadge({
  children,
  tone = "neutral",
  className
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span className={cn("status-badge", `status-badge-${tone}`, className)}>
      <span className="status-badge-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
