import "server-only";

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  getBundledSeedContent,
  getBundledSeedDocuments,
  PORTFOLIO_ITEMS_COLLECTION,
  PORTFOLIO_SETTINGS_COLLECTION,
  SITE_SETTINGS_DOCUMENT_ID,
  usesLocalContentStore
} from "@/lib/contentStore";
import { getCloudBaseDatabase } from "@/lib/cloudbase/server";
import { uploadPortfolioFile } from "@/lib/cloudbase/storage";
import type { SiteContent, SiteSettingsDocument, StoredFileReference } from "@/lib/types";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

type SeedCounts = {
  inserted: number;
  skipped: number;
  failed: number;
};

export type CloudBaseSeedResult = SeedCounts & {
  assets: SeedCounts;
  itemCount: number;
  settingsCreated: boolean;
  message: string;
};

export class CloudBaseSeedError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>, cause?: unknown) {
    super(message, { cause });
    this.name = "CloudBaseSeedError";
    this.code = code;
    this.details = details;
  }
}

export function isCloudBaseSeedAllowed() {
  return process.env.ALLOW_CLOUDBASE_SEED?.trim().toLowerCase() === "true";
}

function ensureDatabaseResult(result: { code?: string }, action: string) {
  if (result.code) {
    throw new CloudBaseSeedError(`CloudBase ${action}失败（${result.code}）。`, "SEED_DATABASE_ERROR");
  }
}

function isLegacyUpload(value: string) {
  return value.startsWith("/uploads/") && !value.includes("..") && !value.includes("\\");
}

function collectLegacyUploads(value: unknown, output = new Set<string>()) {
  if (typeof value === "string") {
    if (isLegacyUpload(value)) output.add(value);
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectLegacyUploads(entry, output));
    return output;
  }
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((entry) => collectLegacyUploads(entry, output));
  }
  return output;
}

function replaceLegacyUploads<T>(value: T, files: Map<string, StoredFileReference>): T {
  if (typeof value === "string") {
    return (files.get(value)?.url || value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => replaceLegacyUploads(entry, files)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        replaceLegacyUploads(entry, files)
      ])
    ) as T;
  }
  return value;
}

function inferLegacyDate(filename: string) {
  const timestamp = Number(filename.split("-")[0]);
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date();
  const safeDate = Number.isNaN(date.valueOf()) ? new Date() : date;
  return {
    year: String(safeDate.getUTCFullYear()),
    month: String(safeDate.getUTCMonth() + 1).padStart(2, "0")
  };
}

async function migrateLegacyAsset(localUrl: string) {
  const filename = path.posix.basename(localUrl);
  const extension = path.extname(filename).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) {
    throw new CloudBaseSeedError(
      `旧图片格式不在迁移白名单中：${filename}`,
      "SEED_ASSET_TYPE_UNSUPPORTED"
    );
  }

  const sourcePath = path.join(process.cwd(), "public", "uploads", filename);
  const expectedRoot = path.resolve(process.cwd(), "public", "uploads");
  const resolvedSource = path.resolve(sourcePath);
  if (!resolvedSource.startsWith(`${expectedRoot}${path.sep}`)) {
    throw new CloudBaseSeedError("旧图片路径越界。", "SEED_ASSET_PATH_INVALID");
  }

  const bytes = new Uint8Array(await fs.readFile(resolvedSource));
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 20);
  const { year, month } = inferLegacyDate(filename);
  const cloudPath = `personal-portfolio/uploads/${year}/${month}/legacy-${hash}${extension}`;

  return {
    reference: await uploadPortfolioFile({ cloudPath, bytes, mimeType, upsert: true }),
    inserted: true
  };
}

async function migrateSeedAssets(content: SiteContent) {
  const localUploads = [...collectLegacyUploads(content)].sort();
  const files = new Map<string, StoredFileReference>();
  const counts: SeedCounts = { inserted: 0, skipped: 0, failed: 0 };

  for (const localUrl of localUploads) {
    try {
      const migrated = await migrateLegacyAsset(localUrl);
      files.set(localUrl, migrated.reference);
      if (migrated.inserted) counts.inserted += 1;
      else counts.skipped += 1;
    } catch (error) {
      counts.failed += 1;
      throw new CloudBaseSeedError(
        `旧图片迁移失败：${localUrl}`,
        "SEED_ASSET_MIGRATION_FAILED",
        { assets: counts },
        error
      );
    }
  }

  const migratedContent = replaceLegacyUploads(content, files);
  const sectionKeys = ["skills", "experiences", "thoughts", "life"] as const;
  for (const sectionKey of sectionKeys) {
    migratedContent[sectionKey] = migratedContent[sectionKey].map((item, index) => {
      const sourceItem = content[sectionKey][index];
      const storageFiles = [...collectLegacyUploads(sourceItem)]
        .map((localUrl) => files.get(localUrl))
        .filter((entry): entry is StoredFileReference => Boolean(entry));
      return storageFiles.length ? { ...item, storageFiles } : item;
    }) as never;
  }

  const portraitFile = files.get(content.profile.portraitImage);
  if (portraitFile) migratedContent.profile.portraitFile = portraitFile;

  return { content: migratedContent, counts };
}

async function documentExists(id: string, migrationKey?: string) {
  const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);
  const direct = await collection.doc(id).get();
  ensureDatabaseResult(direct, "检查种子内容");
  if (direct.data.length > 0) return true;
  if (!migrationKey) return false;

  const migrated = await collection.where({ migrationKey }).limit(1).get();
  ensureDatabaseResult(migrated, "检查种子迁移标识");
  return migrated.data.length > 0;
}

async function settingsExist() {
  const result = await getCloudBaseDatabase()
    .collection(PORTFOLIO_SETTINGS_COLLECTION)
    .doc(SITE_SETTINGS_DOCUMENT_ID)
    .get();
  ensureDatabaseResult(result, "检查种子设置");
  return result.data.length > 0;
}

export async function seedCloudBaseContent(): Promise<CloudBaseSeedResult> {
  if (!isCloudBaseSeedAllowed()) {
    throw new CloudBaseSeedError(
      "初始化功能未开启，请临时设置 ALLOW_CLOUDBASE_SEED=true。",
      "SEED_DISABLED"
    );
  }
  if (usesLocalContentStore()) {
    throw new CloudBaseSeedError(
      "本地文件模式不会执行 CloudBase 初始化。",
      "SEED_REQUIRES_CLOUDBASE"
    );
  }

  const migrated = await migrateSeedAssets(getBundledSeedContent());
  const documents = getBundledSeedDocuments(migrated.content);
  const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);
  const counts: SeedCounts = { inserted: 0, skipped: 0, failed: 0 };

  for (const document of documents) {
    try {
      if (await documentExists(document.id, document.migrationKey)) {
        counts.skipped += 1;
        continue;
      }

      const { _id: _ignored, ...payload } = document;
      const result = await collection.doc(document._id).set(payload);
      ensureDatabaseResult(result, "写入种子内容");
      counts.inserted += 1;
    } catch (error) {
      console.error(`[cloudbase-seed:item:${document.id}]`, error);
      counts.failed += 1;
    }
  }

  let settingsCreated = false;
  try {
    if (await settingsExist()) {
      counts.skipped += 1;
    } else {
      const now = new Date().toISOString();
      const settings: SiteSettingsDocument = {
        _id: SITE_SETTINGS_DOCUMENT_ID,
        profile: migrated.content.profile,
        showcases: migrated.content.showcases,
        createdAt: now,
        updatedAt: now
      };
      const { _id: _ignored, ...payload } = settings;
      const result = await getCloudBaseDatabase()
        .collection(PORTFOLIO_SETTINGS_COLLECTION)
        .doc(SITE_SETTINGS_DOCUMENT_ID)
        .set(payload);
      ensureDatabaseResult(result, "写入种子设置");
      settingsCreated = true;
      counts.inserted += 1;
    }
  } catch (error) {
    console.error("[cloudbase-seed:settings]", error);
    counts.failed += 1;
  }

  return {
    ...counts,
    assets: migrated.counts,
    itemCount: documents.length,
    settingsCreated,
    message:
      counts.failed === 0
        ? "初始化完成。请立即将 ALLOW_CLOUDBASE_SEED 设回 false。"
        : "初始化部分失败，可在排查后重试；已成功的记录不会重复导入。"
  };
}
