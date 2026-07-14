"use client";

import { useState } from "react";
import type { ProfileMeta, SectionShowcase, SiteContent } from "@/lib/types";

const showcaseOrder: Array<keyof SiteContent["showcases"]> = ["skills", "experiences", "thoughts", "life"];

function parseList(value: string) {
  return value
    .split(/\n|,|，/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(value: string[]) {
  return value.join("\n");
}

function parseContactLinks(value: string) {
  return value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label: label || "Link", href: href || "#" };
    });
}

function stringifyContactLinks(value: ProfileMeta["contactLinks"]) {
  return value.map((link) => `${link.label} | ${link.href}`).join("\n");
}

export function ProfileEditor({
  content,
  onChange
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [portraitUploadError, setPortraitUploadError] = useState("");

  const updateProfile = (key: keyof ProfileMeta, value: unknown) => {
    onChange({
      ...content,
      profile: {
        ...content.profile,
        [key]: value
      }
    });
  };

  const updateShowcase = (key: keyof SiteContent["showcases"], next: Partial<SectionShowcase>) => {
    onChange({
      ...content,
      showcases: {
        ...content.showcases,
        [key]: {
          ...content.showcases[key],
          ...next
        }
      }
    });
  };

  const input = (key: keyof ProfileMeta, label: string, placeholder = "") => (
    <label className="admin-label">
      {label}
      <input
        className="admin-input"
        value={String(content.profile[key] ?? "")}
        onChange={(event) => updateProfile(key, event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );

  async function uploadPortrait(file: File) {
    setUploadingPortrait(true);
    setPortraitUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });

    setUploadingPortrait(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setPortraitUploadError(payload?.message || "头像上传失败");
      return;
    }

    const payload = (await response.json()) as { url: string };
    updateProfile("portraitImage", payload.url);
  }

  const portraitField = (
    <div className="admin-label">
      <span>个人头像路径</span>
      <div className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/45 p-3">
        <input
          className="admin-input"
          value={content.profile.portraitImage}
          onChange={(event) => updateProfile("portraitImage", event.target.value)}
          placeholder="/uploads/avatar.png 或 https://..."
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          {content.profile.portraitImage ? (
            <img
              src={content.profile.portraitImage}
              alt="当前头像预览"
              className="aspect-square h-28 rounded-[var(--radius-md)] border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-square h-28 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border text-xs text-muted-foreground">
              无头像
            </div>
          )}
          <label className="secondary-button focus-ring cursor-pointer">
            {uploadingPortrait ? "上传中" : "选择头像"}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              disabled={uploadingPortrait}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPortrait(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      {portraitUploadError ? <span className="text-sm text-destructive">{portraitUploadError}</span> : null}
    </div>
  );

  const textarea = (key: keyof ProfileMeta, label: string, rows = 4) => (
    <label className="admin-label md:col-span-2">
      {label}
      <textarea
        className="admin-input min-h-[120px] resize-y"
        rows={rows}
        value={String(content.profile[key] ?? "")}
        onChange={(event) => updateProfile(key, event.target.value)}
      />
    </label>
  );

  return (
    <section className="glass-panel p-4 md:p-5">
      <div className="mb-5">
        <p className="mono text-xs text-primary">SITE EDITOR</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">站点信息</h2>
        <p className="mt-2 text-sm text-muted-foreground">这里修改首页身份信息、标签、联系方式和四个入口卡片。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {input("name", "姓名")}
        {input("title", "定位")}
        {input("status", "状态文字")}
        {input("location", "所在地")}
        {input("footerLine", "页脚说明")}
        {portraitField}
        {textarea("description", "核心简介")}
        {textarea("supportText", "补充文案")}
        <label className="admin-label md:col-span-2">
          领域标签
          <textarea
            className="admin-input min-h-[100px] resize-y"
            value={stringifyList(content.profile.disciplines)}
            onChange={(event) => updateProfile("disciplines", parseList(event.target.value))}
            placeholder="每行一个领域，如 Visual"
          />
        </label>
        <label className="admin-label md:col-span-2">
          能力标签
          <textarea
            className="admin-input min-h-[120px] resize-y"
            value={stringifyList(content.profile.tags)}
            onChange={(event) => updateProfile("tags", parseList(event.target.value))}
            placeholder="每行一个标签"
          />
        </label>
        <label className="admin-label md:col-span-2">
          联系方式
          <textarea
            className="admin-input min-h-[120px] resize-y"
            value={stringifyContactLinks(content.profile.contactLinks)}
            onChange={(event) => updateProfile("contactLinks", parseContactLinks(event.target.value))}
            placeholder="Email | mailto:hello@example.com"
          />
        </label>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">首页四个入口</h3>
        <div className="mt-4 grid gap-4">
          {showcaseOrder.map((key) => {
            const item = content.showcases[key];
            return (
              <div key={key} className="rounded-[var(--radius-md)] border border-border bg-popover/45 p-4">
                <p className="mono mb-3 text-xs text-primary">{key}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="admin-label">
                    标题
                    <input className="admin-input" value={item.title} onChange={(event) => updateShowcase(key, { title: event.target.value })} />
                  </label>
                  <label className="admin-label">
                    眉标
                    <input className="admin-input" value={item.eyebrow} onChange={(event) => updateShowcase(key, { eyebrow: event.target.value })} />
                  </label>
                  <label className="admin-label">
                    图片路径
                    <input className="admin-input" value={item.image} onChange={(event) => updateShowcase(key, { image: event.target.value })} />
                  </label>
                  <label className="admin-label">
                    指标
                    <input className="admin-input" value={item.metric} onChange={(event) => updateShowcase(key, { metric: event.target.value })} />
                  </label>
                  <label className="admin-label md:col-span-2">
                    描述
                    <textarea className="admin-input min-h-[90px] resize-y" value={item.description} onChange={(event) => updateShowcase(key, { description: event.target.value })} />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
