"use client";

import { LogOut, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { SectionManager } from "@/components/admin/SectionManager";
import type { SectionKey, SiteContent } from "@/lib/types";
import { sectionLabels } from "@/lib/types";
import { cn } from "@/lib/utils";

const sections: SectionKey[] = ["skills", "experiences", "thoughts", "life"];
type AdminPanel = "profile" | SectionKey;

export function AdminDashboard({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [activeSection, setActiveSection] = useState<AdminPanel>("profile");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const activeItems = useMemo(() => (activeSection === "profile" ? [] : content[activeSection]), [activeSection, content]);

  async function saveContent() {
    setStatus("saving");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const payload = (await response.json()) as { content: SiteContent };
    setContent(payload.content);
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="admin-shell space-shell min-h-[100dvh] px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="glass-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mono text-xs text-primary">ADMIN CONSOLE</p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground">内容管理模式</h1>
              <p className="mt-2 text-sm text-muted-foreground">
              当前版本保存到本地 JSON 文件，数据层可替换为数据库或 CMS。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="secondary-button focus-ring" type="button" onClick={logout}>
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              退出
            </button>
            <button className="primary-button focus-ring" type="button" onClick={saveContent} disabled={status === "saving"}>
              <Save className="h-4 w-4" strokeWidth={1.8} />
              {status === "saving" ? "保存中" : "保存内容"}
            </button>
          </div>
        </header>

        {status === "saved" ? (
          <p className="rounded-[var(--radius-sm)] border border-primary/25 bg-accent px-4 py-3 text-sm text-accent-foreground">
            已保存。
          </p>
        ) : null}
        {status === "error" ? (
          <p className="rounded-[var(--radius-sm)] border border-destructive/25 bg-popover px-4 py-3 text-sm text-destructive">
            保存失败，请检查登录状态或服务器日志。
          </p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="glass-panel h-fit p-2">
            <nav className="grid gap-1" aria-label="后台内容分类">
              <button
                type="button"
                className={cn(
                  "focus-ring flex items-center justify-between rounded-[var(--radius-sm)] px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                  activeSection === "profile" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => setActiveSection("profile")}
              >
                <span>站点信息</span>
                <span className="mono text-xs opacity-70">Site</span>
              </button>
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={cn(
            "focus-ring flex items-center justify-between rounded-[var(--radius-sm)] px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                    activeSection === section && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => setActiveSection(section)}
                >
                  <span>{sectionLabels[section]}</span>
                  <span className="mono text-xs opacity-70">{content[section].length}</span>
                </button>
              ))}
            </nav>
          </aside>

          {activeSection === "profile" ? (
            <ProfileEditor content={content} onChange={setContent} />
          ) : (
            <SectionManager
              key={activeSection}
              section={activeSection}
              items={activeItems}
              onChange={(items) =>
                setContent((current) => ({
                  ...current,
                  [activeSection]: items
                }))
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
