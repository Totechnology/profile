import { IconFromName } from "@/components/icons/IconFromName";
import { Tag } from "@/components/cards/Tag";
import { BaseCard } from "@/components/cards/BaseCard";
import type { SkillCardItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SkillCard({ item }: { item: SkillCardItem }) {
  return (
    <BaseCard
      featured={item.featured}
      image={item.image}
      imageAlt={item.title}
      className={cn("min-h-[300px] p-5 md:p-6", item.featured ? "lg:col-span-3" : "lg:col-span-2")}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-border bg-accent text-primary">
          <IconFromName name={item.icon} className="h-5 w-5" />
        </div>
        {item.level ? <span className="mono text-xs text-muted-foreground">{item.level}</span> : null}
      </div>
      <h3 className="mt-8 text-2xl font-semibold text-card-foreground">{item.title}</h3>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {item.skills.map((skill) => (
          <Tag key={skill}>{skill}</Tag>
        ))}
      </div>
    </BaseCard>
  );
}
