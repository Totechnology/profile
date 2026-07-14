"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type {
  ExperienceCardItem,
  LifeCardItem,
  SectionKey,
  SkillCardItem,
  StoredFileReference,
  ThoughtCardItem
} from "@/lib/types";

type EditableItem = SkillCardItem | ExperienceCardItem | ThoughtCardItem | LifeCardItem;

const MAX_ENTRY_IMAGES = 4;

const iconOptions = [
  "camera",
  "audio",
  "cpu",
  "sparkles",
  "radio",
  "film",
  "network",
  "route",
  "wrench",
  "bot",
  "sliders"
];

function parseList(value: string) {
  return value
    .split(/\n|,|，/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : "";
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

export function CardEditor({
  section,
  item,
  onChange
}: {
  section: SectionKey;
  item: EditableItem;
  onChange: (item: EditableItem) => void;
}) {
  const record = item as unknown as Record<string, unknown>;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function textValue(key: string) {
    const value = record[key];
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  }

  function update(key: string, value: unknown) {
    onChange({ ...item, [key]: value } as EditableItem);
  }

  function getImages() {
    const images = Array.isArray(record.images) ? (record.images as string[]) : [];
    const cover = textValue("image");
    return Array.from(new Set([...images, cover].filter(Boolean))).slice(0, MAX_ENTRY_IMAGES);
  }

  function getStorageFiles() {
    return Array.isArray(record.storageFiles)
      ? record.storageFiles.filter(isStoredFileReference)
      : [];
  }

  function updateImages(images: string[], addedFiles: StoredFileReference[] = []) {
    const next = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean))).slice(0, MAX_ENTRY_IMAGES);
    const filesByUrl = new Map(
      [...getStorageFiles(), ...addedFiles]
        .filter((file) => next.includes(file.url))
        .map((file) => [file.url, file])
    );

    onChange({
      ...item,
      image: next[0] || "",
      images: next,
      storageFiles: Array.from(filesByUrl.values())
    } as EditableItem);
  }

  async function uploadImageFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as unknown;
      setUploadError(isRecord(payload) && typeof payload.message === "string" ? payload.message : "图片上传失败");
      return null;
    }

    const uploaded = parseUploadPayload(await response.json());
    if (!uploaded) setUploadError("上传已完成，但服务器没有返回有效的图片地址。");
    return uploaded;
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    const currentImages = getImages();
    const remainingSlots = MAX_ENTRY_IMAGES - currentImages.length;

    if (remainingSlots <= 0) {
      setUploadError(`每个条目最多上传 ${MAX_ENTRY_IMAGES} 张图片。`);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    const uploaded: Array<{ url: string; reference?: StoredFileReference }> = [];
    setUploading(true);
    setUploadError(files.length > remainingSlots ? `最多还能上传 ${remainingSlots} 张，已自动保留前 ${remainingSlots} 张。` : "");

    try {
      for (const file of selectedFiles) {
        const result = await uploadImageFile(file);
        if (result) uploaded.push(result);
      }
    } finally {
      setUploading(false);
    }

    if (uploaded.length) {
      updateImages(
        [...currentImages, ...uploaded.map((entry) => entry.url)],
        uploaded.flatMap((entry) => (entry.reference ? [entry.reference] : []))
      );
    }
  }

  const input = (key: string, label: string, placeholder = "") => (
    <label className="admin-label">
      {label}
      <input
        className="admin-input"
        value={textValue(key)}
        onChange={(event) => update(key, event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );

  const textarea = (key: string, label: string, placeholder = "", rows = 4) => (
    <label className="admin-label md:col-span-2">
      {label}
      <textarea
        className="admin-input min-h-[120px] resize-y"
        rows={rows}
        value={textValue(key)}
        onChange={(event) => update(key, event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );

  const listArea = (key: string, label: string, placeholder = "每行一个，或用逗号分隔") => (
    <label className="admin-label md:col-span-2">
      {label}
      <textarea
        className="admin-input min-h-[120px] resize-y"
        value={stringifyList(record[key])}
        onChange={(event) => update(key, parseList(event.target.value))}
        placeholder={placeholder}
      />
    </label>
  );

  const imageField = (label = "照片") => (
    <div className="admin-label md:col-span-2">
      <span>{label}</span>
      <div className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/45 p-3">
        <textarea
          className="admin-input"
          rows={4}
          value={getImages().join("\n")}
          onChange={(event) => updateImages(parseList(event.target.value))}
          placeholder="每行一个图片路径，最多四张。第一张会作为封面图。"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="secondary-button focus-ring cursor-pointer">
            {uploading ? "上传中" : "选择多张照片"}
            <input
              className="sr-only"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || getImages().length >= MAX_ENTRY_IMAGES}
              onChange={(event) => {
                void uploadImages(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <span className="text-xs text-muted-foreground">最多 4 张，第一张为封面。当前 {getImages().length}/4。</span>
        </div>
      </div>
      {getImages().length ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {getImages().map((image, index) => (
            <div key={image} className="group relative overflow-hidden rounded-[var(--radius-sm)] border border-border bg-muted">
              <button
                type="button"
                className="focus-ring block w-full text-left"
                onClick={() => updateImages([image, ...getImages().filter((itemImage) => itemImage !== image)])}
                aria-label={`将照片 ${index + 1} 设为封面`}
              >
                <img src={image} alt={`照片 ${index + 1}`} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.025]" />
                <span className="absolute left-2 top-2 rounded-full bg-popover/82 px-2 py-1 text-[10px] text-foreground backdrop-blur">
                  {index === 0 ? "封面" : `#${index + 1}`}
                </span>
              </button>
              <button
                type="button"
                className="focus-ring absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-popover/88 text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
                onClick={() => updateImages(getImages().filter((itemImage) => itemImage !== image))}
                aria-label={`删除照片 ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {uploadError ? <span className="text-sm text-destructive">{uploadError}</span> : null}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-popover/45 p-4">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-secondary-foreground">
          <input
            className="h-4 w-4 accent-[var(--primary)]"
            type="checkbox"
            checked={Boolean(record.featured)}
            onChange={(event) => update("featured", event.target.checked)}
          />
          设为 featured 重点卡片
        </label>
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-secondary-foreground">
          <input
            className="h-4 w-4 accent-[var(--primary)]"
            type="checkbox"
            checked={record.visible !== false}
            onChange={(event) => update("visible", event.target.checked)}
          />
          在公开页面显示
        </label>
        <span className="mono text-xs text-muted-foreground">ID: {item.id}</span>
      </div>

      {input("title", "标题")}
      <label className="admin-label">
        创建时间（系统维护）
        <input
          className="admin-input cursor-not-allowed opacity-70"
          value={textValue("createdAt")}
          placeholder="首次保存时生成"
          readOnly
        />
      </label>
      {imageField("照片图集")}

      {section === "skills" ? (
        <>
          <label className="admin-label">
            图标
            <select className="admin-input" value={textValue("icon")} onChange={(event) => update("icon", event.target.value)}>
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          {input("level", "能力标签", "例如 Signal Chain")}
          {textarea("description", "描述")}
          {listArea("skills", "技能列表")}
        </>
      ) : null}

      {section === "experiences" ? (
        <>
          {input("time", "时间", "例如 2026")}
          {input("role", "我的角色")}
          {input("type", "项目类型")}
          {input("link", "外部链接，可选")}
          {textarea("description", "项目描述")}
          {listArea("highlights", "重点成果")}
          {listArea("tags", "关键词标签")}
        </>
      ) : null}

      {section === "thoughts" ? (
        <>
          {input("date", "日期", "2026-07-07")}
          {input("readingTime", "阅读时间", "4 min")}
          {input("link", "外部链接，可选")}
          {textarea("summary", "摘要")}
          {textarea("content", "正文，可选", "后续可以接 Markdown 或 CMS。", 7)}
          {listArea("tags", "关键词标签")}
        </>
      ) : null}

      {section === "life" ? (
        <>
          {input("date", "日期", "2026-07")}
          {input("location", "地点，可选")}
          {textarea("description", "描述")}
          {listArea("tags", "关键词标签")}
        </>
      ) : null}
    </div>
  );
}
