import { ArrowUpRight } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { Tag } from "@/components/cards/Tag";
import type { ThoughtCardItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ThoughtCard({ item }: { item: ThoughtCardItem }) {
  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="mono text-primary">{item.date}</span>
      </div>
      <h3 className="mt-5 text-2xl font-semibold leading-tight text-card-foreground">{item.title}</h3>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.summary}</p>
      <div className="mt-7 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </>
  );

  return (
    <BaseCard
      featured={item.featured}
      image={item.image}
      imageAlt={item.title}
      className={cn("p-5 md:p-6", item.featured ? "lg:col-span-3" : "lg:col-span-2")}
    >
      {item.link ? (
        <a href={item.link} target="_blank" rel="noreferrer" className="focus-ring block rounded-[8px]">
          <div className="flex items-start justify-between gap-5">
            <div>{inner}</div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
          </div>
        </a>
      ) : (
        inner
      )}
    </BaseCard>
  );
}
