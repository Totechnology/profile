"use client";

import { useRef, useState } from "react";
import type { ProfileMeta, SectionShowcase, SiteContent, StoredFileReference } from "@/lib/types";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStoredFileReference(value: unknown): value is StoredFileReference {
  return (
    isRecord(value) &&
    typeof value.fileID === "string" &&
    typeof value.cloudPath === "string" &&
    typeof value.url === "string" &&
    typeof value.size === "number" &&
    typeof value.mimeType === "string"
  );
}

function parseUploadPayload(payload: unknown) {
  if (!isRecord(payload)) return null;

  const candidate = isRecord(payload.file)
    ? payload.file
    : isRecord(payload.data)
      ? payload.data
      : payload;

  if (typeof candidate.url !== "string" || !candidate.url) return null;

  return {
    url: candidate.url,
    reference: isStoredFileReference(candidate) ? candidate : undefined
  };
}

export function ProfileEditor({
  content,
  onChange,
  onUploadStateChange
}: {
  content: SiteContent;
  onChange: (content: SiteContent, options?: { persist?: boolean }) => void;
  onUploadStateChange?: (uploading: boolean) => void;
}) {
  const contentRef = useRef(content);
  const onChangeRef = useRef(onChange);
  contentRef.current = content;
  onChangeRef.current = onChange;
  const [uploadingTarget, setUploadingTarget] = useState<"portrait" | keyof SiteContent["showcases"] | null>(null);
  const [portraitUploadError, setPortraitUploadError] = useState("");
  const [showcaseUploadError, setShowcaseUploadError] = useState<Partial<Record<keyof SiteContent["showcases"], string>>>({});

  const emitChange = (nextContent: SiteContent, options?: { persist?: boolean }) => {
    contentRef.current = nextContent;
    onChangeRef.current(nextContent, options);
  };

  const updateProfile = (key: keyof ProfileMeta, value: unknown) => {
    const current = contentRef.current;
    emitChange({
      ...current,
      profile: {
        ...current.profile,
        [key]: value
      }
    });
  };

  const updateShowcase = (
    key: keyof SiteContent["showcases"],
    next: Partial<SectionShowcase>,
    options?: { persist?: boolean }
  ) => {
    const current = contentRef.current;
    emitChange({
      ...current,
      showcases: {
        ...current.showcases,
        [key]: {
          ...current.showcases[key],
          ...next
        }
      }
    }, options);
  };

  const updatePortraitImage = (url: string, file?: StoredFileReference, options?: { persist?: boolean }) => {
    const current = contentRef.current;
    emitChange({
      ...current,
      profile: {
        ...current.profile,
        portraitImage: url,
        portraitFile: file ?? (current.profile.portraitFile?.url === url ? current.profile.portraitFile : undefined)
      }
    }, options);
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

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as unknown;
      throw new Error(isRecord(payload) && typeof payload.message === "string" ? payload.message : "图片上传失败");
    }
    const uploaded = parseUploadPayload(await response.json());
    if (!uploaded) throw new Error("上传已完成，但服务器没有返回有效的图片地址。");
    return uploaded;
  }

  async function uploadPortrait(file: File) {
    setUploadingTarget("portrait");
    setPortraitUploadError("");
    onUploadStateChange?.(true);
    try {
      const uploaded = await uploadFile(file);
      updatePortraitImage(uploaded.url, uploaded.reference, { persist: true });
    } catch (error) {
      setPortraitUploadError(error instanceof Error ? error.message : "头像上传失败");
    } finally {
      setUploadingTarget(null);
      onUploadStateChange?.(false);
    }
  }

  async function uploadShowcase(key: keyof SiteContent["showcases"], file: File) {
    setUploadingTarget(key);
    setShowcaseUploadError((current) => ({ ...current, [key]: "" }));
    onUploadStateChange?.(true);
    try {
      const uploaded = await uploadFile(file);
      updateShowcase(key, { image: uploaded.url, imageFile: uploaded.reference }, { persist: true });
    } catch (error) {
      setShowcaseUploadError((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "入口图片上传失败"
      }));
    } finally {
      setUploadingTarget(null);
      onUploadStateChange?.(false);
    }
  }

  const portraitField = (
    <div className="admin-label">
      <span>个人头像路径</span>
      <div className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/45 p-3">
        <input
          className="admin-input"
          value={content.profile.portraitImage}
          onChange={(event) => updatePortraitImage(event.target.value)}
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
            {uploadingTarget === "portrait" ? "上传中" : "选择头像"}
            <input
              className="sr-only"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={uploadingTarget !== null}
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
                  <div className="admin-label">
                    <span>入口图片</span>
                    <div className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/45 p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
                      <img
                        src={item.image}
                        alt={`${item.title}入口图片预览`}
                        className="aspect-[4/3] w-full rounded-[var(--radius-sm)] border border-border bg-muted object-cover"
                      />
                      <div className="grid gap-2">
                        <input
                          className="admin-input"
                          value={item.image}
                          onChange={(event) =>
                            updateShowcase(key, {
                              image: event.target.value,
                              imageFile: item.imageFile?.url === event.target.value ? item.imageFile : undefined
                            })
                          }
                          placeholder="/images/... 或上传到 CloudBase"
                        />
                        <label className="secondary-button focus-ring w-fit cursor-pointer">
                          {uploadingTarget === key ? "上传中" : "上传入口图片"}
                          <input
                            className="sr-only"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            disabled={uploadingTarget !== null}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void uploadShowcase(key, file);
                              event.target.value = "";
                            }}
                          />
                        </label>
                        <span className="text-xs text-muted-foreground">上传完成会自动保存并在首页真实展示。</span>
                        {showcaseUploadError[key] ? (
                          <span className="text-sm text-destructive">{showcaseUploadError[key]}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
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
