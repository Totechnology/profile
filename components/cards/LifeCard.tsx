import { MapPin } from "lucide-react";
import { BaseCard } from "@/components/cards/BaseCard";
import { Tag } from "@/components/cards/Tag";
import type { LifeCardItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LifeCard({ item }: { item: LifeCardItem }) {
  return (
    <BaseCard
      featured={item.featured}
      image={item.image}
      imageAlt={item.title}
      className={cn(item.featured ? "lg:col-span-3" : "lg:col-span-2")}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.date ? <span className="mono text-primary">{item.date}</span> : null}
          {item.location ? (
            <>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" strokeWidth={1.8} />
                {item.location}
              </span>
            </>
          ) : null}
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-card-foreground">{item.title}</h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </BaseCard>
  );
}
