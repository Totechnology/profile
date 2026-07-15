"use client";

import { DatabaseZap, LoaderCircle, LogOut, Save } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { SectionManager } from "@/components/admin/SectionManager";
import type { SectionKey, SiteContent } from "@/lib/types";
import { sectionLabels } from "@/lib/types";
import { cn } from "@/lib/utils";

const sections: SectionKey[] = ["skills", "experiences", "thoughts", "life"];
type AdminPanel = "profile" | SectionKey;

type AdminDashboardProps = {
  initialContent: SiteContent;
  canSeed?: boolean;
  seedNeeded?: boolean;
};

export function AdminDashboard({ initialContent, canSeed = false, seedNeeded = false }: AdminDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [activeSection, setActiveSection] = useState<AdminPanel>("profile");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "seeding" | "error">("idle");
  const [seedError, setSeedError] = useState("");
  const contentRef = useRef(initialContent);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveSequenceRef = useRef(0);
  const writeInProgress = status === "saving" || mediaUploading;

  const activeItems = useMemo(() => (activeSection === "profile" ? [] : content[activeSection]), [activeSection, content]);

  function updateContent(nextContent: SiteContent, options?: { persist?: boolean }) {
    contentRef.current = nextContent;
    setContent(nextContent);
    if (options?.persist) void saveContent(nextContent);
  }

  function saveContent(snapshot = contentRef.current) {
    const saveSequence = ++saveSequenceRef.current;
    setStatus("saving");

    const request = saveQueueRef.current.catch(() => undefined).then(async () => {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: snapshot })
      });

      if (!response.ok) {
        throw new Error("content_save_failed");
      }

      const payload = (await response.json()) as { content?: SiteContent };
      if (!payload.content) {
        throw new Error("content_save_response_invalid");
      }

      if (contentRef.current === snapshot) {
        contentRef.current = payload.content;
        setContent(payload.content);
      }

      if (saveSequence === saveSequenceRef.current) {
        setStatus("saved");
        window.setTimeout(() => {
          if (saveSequence === saveSequenceRef.current) setStatus("idle");
        }, 1400);
      }
    });

    saveQueueRef.current = request.catch(() => {
      if (saveSequence === saveSequenceRef.current) setStatus("error");
    });

    return saveQueueRef.current;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin");
  }

  async function seedCloudBase() {
    setSeedStatus("seeding");
    setSeedError("");

    try {
      const response = await fetch("/api/admin/seed", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setSeedStatus("error");
        setSeedError(payload?.message || "初始化失败，请检查 CloudBase 配置和服务日志。");
        return;
      }

      window.location.reload();
    } catch {
      setSeedStatus("error");
      setSeedError("初始化请求未完成，请稍后重试。");
    }
  }

  return (
    <main className="admin-shell space-shell min-h-[100dvh] px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="glass-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mono text-xs text-primary">ADMIN CONSOLE</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">内容管理模式</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              公开内容由 CloudBase 文档数据库提供，上传图片统一存放在 personal-portfolio/ 专属目录。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canSeed && seedNeeded ? (
              <button
                className="secondary-button focus-ring"
                type="button"
                onClick={seedCloudBase}
                disabled={seedStatus === "seeding" || writeInProgress}
              >
                {seedStatus === "seeding" ? (
                  <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" strokeWidth={1.8} />
                ) : (
                  <DatabaseZap className="h-4 w-4" strokeWidth={1.8} />
                )}
                {seedStatus === "seeding" ? "初始化中" : "初始化 CloudBase 内容"}
              </button>
            ) : null}
            <button className="secondary-button focus-ring" type="button" onClick={logout} disabled={writeInProgress}>
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              退出
            </button>
            <button
              className="primary-button focus-ring"
              type="button"
              onClick={() => void saveContent()}
              disabled={writeInProgress}
            >
              <Save className="h-4 w-4" strokeWidth={1.8} />
              {mediaUploading ? "图片上传中" : status === "saving" ? "保存中" : "保存内容"}
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
        {seedStatus === "error" ? (
          <p
            className="rounded-[var(--radius-sm)] border border-destructive/25 bg-popover px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {seedError}
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
                disabled={writeInProgress}
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
                  disabled={writeInProgress}
                  onClick={() => setActiveSection(section)}
                >
                  <span>{sectionLabels[section]}</span>
                  <span className="mono text-xs opacity-70">{content[section].length}</span>
                </button>
              ))}
            </nav>
          </aside>

          {activeSection === "profile" ? (
            <ProfileEditor
              content={content}
              onChange={updateContent}
              onUploadStateChange={setMediaUploading}
            />
          ) : (
            <SectionManager
              key={activeSection}
              section={activeSection}
              items={activeItems}
              onUploadStateChange={setMediaUploading}
              onChange={(items, options) =>
                updateContent({
                  ...contentRef.current,
                  [activeSection]: items
                }, options)
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
