import { ExternalLink } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { Tag } from "@/components/cards/Tag";
import type { ExperienceCardItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExperienceCard({ item }: { item: ExperienceCardItem }) {
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono text-xs text-primary">{item.type}</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="mono text-xs text-muted-foreground">{item.time}</span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold leading-tight text-card-foreground">{item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{item.role}</p>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
      {item.highlights?.length ? (
        <ul className="mt-5 grid gap-2 text-sm text-secondary-foreground">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="grid grid-cols-[10px_1fr] gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
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
      className={cn(item.featured ? "lg:col-span-3" : "lg:col-span-2")}
    >
      <div className="p-5 md:p-6">
        {item.link ? (
          <a className="focus-ring block rounded-[8px]" href={item.link} target="_blank" rel="noreferrer">
            <div className="flex items-start justify-between gap-4">
              <div>{content}</div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            </div>
          </a>
        ) : (
          content
        )}
      </div>
    </BaseCard>
  );
}
