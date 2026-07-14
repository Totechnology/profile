"use client";

import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CardEditor } from "@/components/admin/CardEditor";
import type {
  ExperienceCardItem,
  LifeCardItem,
  SectionKey,
  SkillCardItem,
  ThoughtCardItem
} from "@/lib/types";
import { sectionLabels } from "@/lib/types";
import { cn, makeId } from "@/lib/utils";

type EditableItem = SkillCardItem | ExperienceCardItem | ThoughtCardItem | LifeCardItem;

function createEmptyItem(section: SectionKey, order: number): EditableItem {
  const id = makeId(section);

  if (section === "skills") {
    return {
      id,
      title: "新能力卡片",
      description: "",
      skills: [],
      icon: "sparkles",
      image: "",
      images: [],
      level: "",
      createdAt: new Date().toISOString().slice(0, 10),
      featured: false,
      order
    };
  }

  if (section === "experiences") {
    return {
      id,
      title: "新项目档案",
      createdAt: new Date().toISOString().slice(0, 10),
      time: "",
      role: "",
      type: "",
      description: "",
      highlights: [],
      tags: [],
      image: "",
      images: [],
      link: "",
      featured: false,
      order
    };
  }

  if (section === "thoughts") {
    return {
      id,
      title: "新学习笔记",
      summary: "",
      date: "",
      tags: [],
      image: "",
      images: [],
      createdAt: new Date().toISOString().slice(0, 10),
      readingTime: "",
      content: "",
      link: "",
      featured: false,
      order
    };
  }

  return {
    id,
    title: "新生活卡片",
    image: "",
    images: [],
    createdAt: new Date().toISOString().slice(0, 10),
    description: "",
    tags: [],
    date: "",
    location: "",
    featured: false,
    order
  };
}

function renumber(items: EditableItem[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

export function SectionManager({
  section,
  items,
  onChange
}: {
  section: SectionKey;
  items: EditableItem[];
  onChange: (items: EditableItem[]) => void;
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0],
    [items, selectedId]
  );

  function addItem() {
    const item = createEmptyItem(section, items.length + 1);
    onChange([...items, item]);
    setSelectedId(item.id);
  }

  function updateItem(next: EditableItem) {
    onChange(items.map((item) => (item.id === next.id ? next : item)));
  }

  function deleteItem(id: string) {
    const next = renumber(items.filter((item) => item.id !== id));
    onChange(next);
    setSelectedId(next[0]?.id || "");
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="glass-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{sectionLabels[section]}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{items.length} 张卡片</p>
          </div>
          <button className="icon-button focus-ring" type="button" onClick={addItem} aria-label="新增卡片">
            <Plus className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="custom-scrollbar grid max-h-[68dvh] gap-2 overflow-auto pr-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "focus-ring group flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/50 p-3 text-left transition hover:border-primary/40 hover:bg-popover",
                selectedItem?.id === item.id && "border-primary/45 bg-accent"
              )}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-muted text-xs text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">{item.title}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {item.featured ? <Star className="h-3 w-3 fill-primary text-primary" /> : null}
                  {item.id}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel min-h-[520px] p-4 md:p-5">
        {selectedItem ? (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mono text-xs text-primary">CARD EDITOR</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{selectedItem.title}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  className="icon-button focus-ring"
                  type="button"
                  aria-label="上移"
                  onClick={() => moveItem(selectedItem.id, -1)}
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  className="icon-button focus-ring"
                  type="button"
                  aria-label="下移"
                  onClick={() => moveItem(selectedItem.id, 1)}
                >
                  <ArrowDown className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  className="icon-button focus-ring"
                  type="button"
                  aria-label="删除"
                  onClick={() => deleteItem(selectedItem.id)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <CardEditor section={section} item={selectedItem} onChange={updateItem} />
          </>
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-border text-sm text-muted-foreground">
            当前分类还没有卡片，请新增一张。
          </div>
        )}
      </div>
    </section>
  );
}
