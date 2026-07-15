import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import seedContent from "@/data/cloudbase-seed.json";
import {
  getCloudBaseDatabase,
  getCloudBaseErrorDiagnostic
} from "@/lib/cloudbase/server";
import { getEntrySlug } from "@/lib/slugs";
import type {
  PortfolioItemDocument,
  PortfolioSection,
  SectionItemMap,
  SectionKey,
  SiteContent,
  SiteSettingsDocument
} from "@/lib/types";
import { deepCloneContent, normalizeContent, sortByOrder } from "@/lib/utils";

export const PORTFOLIO_ITEMS_COLLECTION = "portfolio_items";
export const PORTFOLIO_SETTINGS_COLLECTION = "portfolio_settings";
export const SITE_SETTINGS_DOCUMENT_ID = "main";

const defaultContentFile = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  ".content",
  "site-content.json"
);
const queryPageSize = 100;

const sectionKeyToDatabaseSection: Record<SectionKey, PortfolioSection> = {
  skills: "capabilities",
  experiences: "experience",
  thoughts: "thoughts",
  life: "life"
};

const databaseSectionToSectionKey: Record<PortfolioSection, SectionKey> = {
  capabilities: "skills",
  experience: "experiences",
  thoughts: "thoughts",
  life: "life"
};

const defaultDocumentType: Record<PortfolioSection, string> = {
  capabilities: "capability",
  experience: "experience",
  thoughts: "thought",
  life: "life"
};

export type PortfolioItemInput = Record<string, unknown> & {
  id?: string;
  section: PortfolioSection;
  title: string;
  slug?: string;
  order?: number;
  visible?: boolean;
  featured?: boolean;
  type?: string;
};

export type PortfolioItemUpdate = Record<string, unknown> & {
  section?: PortfolioSection;
  title?: string;
  slug?: string;
  order?: number;
  visible?: boolean;
  featured?: boolean;
  type?: string;
};

export type ContentStoreState = {
  mode: "cloudbase" | "local";
  itemCount: number;
  hasSettings: boolean;
  empty: boolean;
};

export class ContentStoreError extends Error {
  readonly code: string;

  constructor(message: string, code = "CONTENT_STORE_ERROR", cause?: unknown) {
    super(message, { cause });
    this.name = "ContentStoreError";
    this.code = code;
  }
}

export class ContentItemNotFoundError extends ContentStoreError {
  constructor(id: string) {
    super(`未找到内容记录：${id}`, "CONTENT_NOT_FOUND");
    this.name = "ContentItemNotFoundError";
  }
}

export class ContentConflictError extends ContentStoreError {
  constructor(message: string) {
    super(message, "CONTENT_CONFLICT");
    this.name = "ContentConflictError";
  }
}

type CloudBaseOperationContext = {
  operation: string;
  collection: string;
  fallbackCode: string;
  message: string;
};

const cloudBaseCategoryCodes = {
  initialization_failed: "CLOUDBASE_INITIALIZATION_FAILED",
  permission_denied: "CLOUDBASE_PERMISSION_DENIED",
  collection_not_found: "CLOUDBASE_COLLECTION_NOT_FOUND"
} as const;

function asCloudBaseStoreError(error: unknown, context: CloudBaseOperationContext) {
  if (error instanceof ContentStoreError) return error;

  const diagnostic = getCloudBaseErrorDiagnostic(error);
  const code =
    diagnostic.errorCode !== "CLOUDBASE_REQUEST_FAILED"
      ? diagnostic.errorCode
      : diagnostic.category === "request_failed"
        ? context.fallbackCode
        : cloudBaseCategoryCodes[diagnostic.category];

  console.error("[cloudbase:database]", {
    event: diagnostic.category,
    operation: context.operation,
    collection: context.collection,
    errorName: diagnostic.errorName,
    errorCode: diagnostic.errorCode
  });

  return new ContentStoreError(context.message, code);
}

function bundledSeedContent(): SiteContent {
  return normalizeContent(deepCloneContent(seedContent as SiteContent));
}

function getContentFilePath() {
  return defaultContentFile;
}

export function isCloudBaseConfigured() {
  return Boolean(process.env.CLOUDBASE_ENV_ID?.trim());
}

export function usesLocalContentStore() {
  return process.env.NODE_ENV !== "production" && !isCloudBaseConfigured();
}

function assertCloudBaseAvailable() {
  if (usesLocalContentStore()) return;
  if (!isCloudBaseConfigured()) {
    throw new ContentStoreError(
      "生产环境缺少 CLOUDBASE_ENV_ID，已拒绝使用容器本地文件作为持久化存储。",
      "CLOUDBASE_NOT_CONFIGURED"
    );
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function withoutDatabaseId(document: PortfolioItemDocument) {
  const { _id: _ignored, ...payload } = document;
  return stripUndefined(payload);
}

function withoutSettingsDatabaseId(document: SiteSettingsDocument) {
  const { _id: _ignored, ...payload } = document;
  return stripUndefined(payload as unknown as Record<string, unknown>);
}

function ensureDatabaseResult(
  result: { code?: string; message?: string },
  context: CloudBaseOperationContext
) {
  if (!result.code) return;
  throw asCloudBaseStoreError(result, context);
}

function isPortfolioSection(value: unknown): value is PortfolioSection {
  return value === "capabilities" || value === "experience" || value === "thoughts" || value === "life";
}

function normalizeDateValue(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString();
  return fallback;
}

function normalizeItemDocument(raw: Record<string, unknown>): PortfolioItemDocument {
  const section = isPortfolioSection(raw.section) ? raw.section : "life";
  const id = String(raw.id || raw._id || "");
  const now = new Date().toISOString();

  return {
    ...cloneJson(raw),
    _id: String(raw._id || id),
    id,
    section,
    type: typeof raw.type === "string" && raw.type.trim() ? raw.type : defaultDocumentType[section],
    title: typeof raw.title === "string" ? raw.title : "",
    slug: typeof raw.slug === "string" && raw.slug.trim() ? raw.slug : undefined,
    order: typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : 999,
    visible: raw.visible !== false,
    featured: raw.featured === true,
    createdAt: normalizeDateValue(raw.createdAt, now),
    updatedAt: normalizeDateValue(raw.updatedAt, now)
  } as PortfolioItemDocument;
}

function itemToDocument<K extends SectionKey>(
  sectionKey: K,
  item: SectionItemMap[K],
  index: number,
  options?: { now?: string; migrationKey?: string; preserveCreatedAt?: boolean }
): PortfolioItemDocument {
  const now = options?.now || new Date().toISOString();
  const section = sectionKeyToDatabaseSection[sectionKey];
  const raw = cloneJson(item) as unknown as Record<string, unknown>;
  const id = String(item.id);
  const createdAt = options?.preserveCreatedAt
    ? normalizeDateValue(item.createdAt, now)
    : now;

  return normalizeItemDocument({
    ...raw,
    _id: id,
    id,
    migrationKey: options?.migrationKey,
    section,
    type:
      section === "experience" && typeof raw.type === "string" && raw.type.trim()
        ? raw.type
        : defaultDocumentType[section],
    title: item.title,
    slug: item.slug || getEntrySlug(item),
    order: typeof item.order === "number" ? item.order : index + 1,
    visible: item.visible !== false,
    featured: item.featured === true,
    createdAt,
    updatedAt: options?.now || item.updatedAt || now
  });
}

function documentToItem(document: PortfolioItemDocument) {
  const {
    _id: _ignoredId,
    migrationKey: _ignoredMigrationKey,
    section,
    type,
    ...fields
  } = cloneJson(document);

  const item = {
    ...fields,
    id: document.id,
    slug: document.slug,
    visible: document.visible,
    featured: document.featured,
    order: document.order,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  } as unknown as SectionItemMap[SectionKey] & { type?: string };

  if (section === "experience") item.type = type;
  else delete item.type;

  return item;
}

function contentToDocuments(content: SiteContent, options?: { now?: string; migration?: boolean }) {
  const now = options?.now || new Date().toISOString();
  const documents: PortfolioItemDocument[] = [];

  (Object.keys(sectionKeyToDatabaseSection) as SectionKey[]).forEach((sectionKey) => {
    content[sectionKey].forEach((item, index) => {
      documents.push(
        itemToDocument(sectionKey, item as never, index, {
          now,
          migrationKey: options?.migration ? `legacy:${item.id}` : undefined,
          preserveCreatedAt: true
        })
      );
    });
  });

  return documents;
}

function documentsToContent(
  documents: PortfolioItemDocument[],
  settings: SiteSettingsDocument | null,
  options?: { includeHidden?: boolean }
): SiteContent {
  const seed = bundledSeedContent();
  const groups: Pick<SiteContent, SectionKey> = {
    skills: [],
    experiences: [],
    thoughts: [],
    life: []
  };

  documents
    .filter((document) => options?.includeHidden || document.visible)
    .forEach((document) => {
      groups[databaseSectionToSectionKey[document.section]].push(documentToItem(document) as never);
    });

  return normalizeContent({
    profile: settings?.profile ? cloneJson(settings.profile) : seed.profile,
    showcases: settings?.showcases ? cloneJson(settings.showcases) : seed.showcases,
    skills: sortByOrder(groups.skills),
    experiences: sortByOrder(groups.experiences),
    thoughts: sortByOrder(groups.thoughts),
    life: sortByOrder(groups.life)
  });
}

async function readLocalContent() {
  try {
    const raw = await fs.readFile(getContentFilePath(), "utf8");
    return normalizeContent(JSON.parse(raw) as SiteContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return bundledSeedContent();
    throw new ContentStoreError("本地内容文件读取失败。", "LOCAL_CONTENT_READ_FAILED", error);
  }
}

async function writeLocalContent(content: SiteContent) {
  const normalized = normalizeContent(content);
  const filePath = getContentFilePath();
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  await fs.rename(temporaryPath, filePath);

  return normalized;
}

async function readAllCloudBaseItems() {
  const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);
  const items: PortfolioItemDocument[] = [];

  for (let offset = 0; ; offset += queryPageSize) {
    const result = await collection.skip(offset).limit(queryPageSize).get();
    ensureDatabaseResult(result, {
      operation: "read_items",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_READ_FAILED",
      message: "CloudBase 内容读取失败。"
    });
    const page = result.data.map((entry) => normalizeItemDocument(entry as Record<string, unknown>));
    items.push(...page);
    if (page.length < queryPageSize) break;
  }

  return items.sort((left, right) => {
    if (left.section !== right.section) return left.section.localeCompare(right.section);
    return left.order - right.order;
  });
}

async function readCloudBaseSettings() {
  const result = await getCloudBaseDatabase()
    .collection(PORTFOLIO_SETTINGS_COLLECTION)
    .doc(SITE_SETTINGS_DOCUMENT_ID)
    .get();
  ensureDatabaseResult(result, {
    operation: "read_settings",
    collection: PORTFOLIO_SETTINGS_COLLECTION,
    fallbackCode: "CLOUDBASE_SETTINGS_READ_FAILED",
    message: "CloudBase 站点设置读取失败。"
  });
  const raw = result.data[0] as Record<string, unknown> | undefined;
  if (!raw) return null;

  const seed = bundledSeedContent();
  const now = new Date().toISOString();
  return {
    _id: SITE_SETTINGS_DOCUMENT_ID,
    profile: cloneJson((raw.profile as SiteSettingsDocument["profile"] | undefined) || seed.profile),
    showcases: cloneJson((raw.showcases as SiteSettingsDocument["showcases"] | undefined) || seed.showcases),
    createdAt: normalizeDateValue(raw.createdAt, now),
    updatedAt: normalizeDateValue(raw.updatedAt, now)
  } satisfies SiteSettingsDocument;
}

async function findCloudBaseItem(id: string) {
  const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);
  const directResult = await collection.doc(id).get();
  ensureDatabaseResult(directResult, {
    operation: "read_item_by_document_id",
    collection: PORTFOLIO_ITEMS_COLLECTION,
    fallbackCode: "CLOUDBASE_READ_FAILED",
    message: "CloudBase 内容读取失败。"
  });
  if (directResult.data[0]) return normalizeItemDocument(directResult.data[0] as Record<string, unknown>);

  const idResult = await collection.where({ id }).limit(1).get();
  ensureDatabaseResult(idResult, {
    operation: "read_item_by_content_id",
    collection: PORTFOLIO_ITEMS_COLLECTION,
    fallbackCode: "CLOUDBASE_READ_FAILED",
    message: "CloudBase 内容读取失败。"
  });
  return idResult.data[0]
    ? normalizeItemDocument(idResult.data[0] as Record<string, unknown>)
    : null;
}

async function getLocalDocuments() {
  return contentToDocuments(await readLocalContent(), { now: new Date().toISOString(), migration: true });
}

export async function getAllItems(options?: {
  section?: PortfolioSection;
  includeHidden?: boolean;
}): Promise<PortfolioItemDocument[]> {
  let items: PortfolioItemDocument[];
  if (usesLocalContentStore()) {
    items = await getLocalDocuments();
  } else {
    assertCloudBaseAvailable();
    try {
      items = await readAllCloudBaseItems();
    } catch (error) {
      throw asCloudBaseStoreError(error, {
        operation: "read_items",
        collection: PORTFOLIO_ITEMS_COLLECTION,
        fallbackCode: "CLOUDBASE_READ_FAILED",
        message: "CloudBase 内容读取失败。"
      });
    }
  }

  if (options?.section) items = items.filter((item) => item.section === options.section);
  if (options?.includeHidden === false) items = items.filter((item) => item.visible);
  return items;
}

export async function getItemsBySection(section: PortfolioSection) {
  if (!isPortfolioSection(section)) {
    throw new ContentStoreError("无效的内容分区。", "INVALID_SECTION");
  }
  return (await getAllItems()).filter((item) => item.section === section).sort((a, b) => a.order - b.order);
}

export async function getItemById(id: string, options?: { includeHidden?: boolean }) {
  if (!id.trim()) return null;
  if (usesLocalContentStore()) {
    const item = (await getLocalDocuments()).find((entry) => entry.id === id || entry._id === id) || null;
    return item && (options?.includeHidden !== false || item.visible) ? item : null;
  }
  assertCloudBaseAvailable();
  try {
    const item = await findCloudBaseItem(id);
    return item && (options?.includeHidden !== false || item.visible) ? item : null;
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "read_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_READ_FAILED",
      message: "CloudBase 内容读取失败。"
    });
  }
}

function createDocumentFromInput(input: PortfolioItemInput) {
  if (!isPortfolioSection(input.section)) {
    throw new ContentStoreError("无效的内容分区。", "INVALID_SECTION");
  }
  const now = new Date().toISOString();
  const id = `${input.section}-${randomUUID()}`;
  const cleanInput = cloneJson(input);
  delete cleanInput._id;
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  delete cleanInput.migrationKey;

  return normalizeItemDocument({
    ...cleanInput,
    _id: id,
    id,
    section: input.section,
    type: input.type || defaultDocumentType[input.section],
    title: input.title,
    slug: input.slug || getEntrySlug({ id, date: typeof input.date === "string" ? input.date : undefined }),
    order: typeof input.order === "number" ? input.order : 999,
    visible: input.visible !== false,
    featured: input.featured === true,
    createdAt: now,
    updatedAt: now
  });
}

export async function createItem(input: PortfolioItemInput) {
  const document = createDocumentFromInput(input);

  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const sectionKey = databaseSectionToSectionKey[document.section];
    const item = documentToItem(document) as never;
    content[sectionKey].push(item);
    await writeLocalContent(content);
    return document;
  }

  assertCloudBaseAvailable();
  try {
    const result = await getCloudBaseDatabase()
      .collection(PORTFOLIO_ITEMS_COLLECTION)
      .doc(document._id)
      .set(withoutDatabaseId(document));
    ensureDatabaseResult(result, {
      operation: "create_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_CREATE_FAILED",
      message: "CloudBase 内容新增失败。"
    });
    return document;
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "create_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_CREATE_FAILED",
      message: "CloudBase 内容新增失败。"
    });
  }
}

export async function updateItem(id: string, patch: PortfolioItemUpdate) {
  const existing = await getItemById(id, { includeHidden: true });
  if (!existing) throw new ContentItemNotFoundError(id);

  const cleanPatch = cloneJson(patch);
  delete cleanPatch._id;
  delete cleanPatch.id;
  delete cleanPatch.createdAt;
  delete cleanPatch.updatedAt;
  delete cleanPatch.migrationKey;

  const nextSection = cleanPatch.section ?? existing.section;
  if (!isPortfolioSection(nextSection)) {
    throw new ContentStoreError("无效的内容分区。", "INVALID_SECTION");
  }
  const updated = normalizeItemDocument({
    ...existing,
    ...cleanPatch,
    _id: existing._id,
    id: existing.id,
    section: nextSection,
    type:
      typeof cleanPatch.type === "string" && cleanPatch.type.trim()
        ? cleanPatch.type
        : existing.type || defaultDocumentType[nextSection],
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  });

  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const oldKey = databaseSectionToSectionKey[existing.section];
    const nextKey = databaseSectionToSectionKey[updated.section];
    content[oldKey] = content[oldKey].filter((item) => item.id !== existing.id) as never;
    content[nextKey].push(documentToItem(updated) as never);
    await writeLocalContent(content);
    return updated;
  }

  assertCloudBaseAvailable();
  try {
    const result = await getCloudBaseDatabase()
      .collection(PORTFOLIO_ITEMS_COLLECTION)
      .doc(existing._id)
      .update(withoutDatabaseId(updated));
    ensureDatabaseResult(result, {
      operation: "update_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_UPDATE_FAILED",
      message: "CloudBase 内容更新失败。"
    });
    return updated;
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "update_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_UPDATE_FAILED",
      message: "CloudBase 内容更新失败。"
    });
  }
}

export async function deleteItem(id: string) {
  const existing = await getItemById(id, { includeHidden: true });
  if (!existing) throw new ContentItemNotFoundError(id);

  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const sectionKey = databaseSectionToSectionKey[existing.section];
    content[sectionKey] = content[sectionKey].filter((item) => item.id !== existing.id) as never;
    await writeLocalContent(content);
    return { id: existing.id, deleted: true };
  }

  assertCloudBaseAvailable();
  try {
    const result = await getCloudBaseDatabase()
      .collection(PORTFOLIO_ITEMS_COLLECTION)
      .doc(existing._id)
      .remove();
    ensureDatabaseResult(result, {
      operation: "delete_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_DELETE_FAILED",
      message: "CloudBase 内容删除失败。"
    });
    if (result.deleted !== 1) throw new ContentItemNotFoundError(id);
    return { id: existing.id, deleted: true };
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "delete_item",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_DELETE_FAILED",
      message: "CloudBase 内容删除失败。"
    });
  }
}

export async function reorderItems(section: PortfolioSection, ids: string[]) {
  if (!isPortfolioSection(section)) {
    throw new ContentStoreError("无效的内容分区。", "INVALID_SECTION");
  }
  if (ids.length !== new Set(ids).size) {
    throw new ContentStoreError("排序列表中存在重复 ID。", "INVALID_REORDER");
  }

  const existing = await getItemsBySection(section);
  const existingIds = new Set(existing.map((item) => item.id));
  if (ids.length !== existing.length || ids.some((id) => !existingIds.has(id))) {
    throw new ContentStoreError("排序列表必须包含该分区的全部内容。", "INVALID_REORDER");
  }

  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const sectionKey = databaseSectionToSectionKey[section];
    const orderById = new Map(ids.map((id, index) => [id, index + 1]));
    content[sectionKey] = content[sectionKey].map((item) => ({
      ...item,
      order: orderById.get(item.id) || item.order
    })) as never;
    await writeLocalContent(content);
    return getItemsBySection(section);
  }

  const updatedAt = new Date().toISOString();
  try {
    const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);
    for (const [index, id] of ids.entries()) {
      const item = existing.find((entry) => entry.id === id)!;
      const result = await collection.doc(item._id).update({ order: index + 1, updatedAt });
      ensureDatabaseResult(result, {
        operation: "reorder_items",
        collection: PORTFOLIO_ITEMS_COLLECTION,
        fallbackCode: "CLOUDBASE_REORDER_FAILED",
        message: "CloudBase 内容排序更新失败。"
      });
    }
    return getItemsBySection(section);
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "reorder_items",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_REORDER_FAILED",
      message: "CloudBase 内容排序更新失败。"
    });
  }
}

export async function getSiteSettings(): Promise<SiteSettingsDocument> {
  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const now = new Date().toISOString();
    return {
      _id: SITE_SETTINGS_DOCUMENT_ID,
      profile: cloneJson(content.profile),
      showcases: cloneJson(content.showcases),
      createdAt: now,
      updatedAt: now
    };
  }

  assertCloudBaseAvailable();
  try {
    const settings = await readCloudBaseSettings();
    if (settings) return settings;
    const seed = bundledSeedContent();
    const now = new Date().toISOString();
    return {
      _id: SITE_SETTINGS_DOCUMENT_ID,
      profile: seed.profile,
      showcases: seed.showcases,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "read_settings",
      collection: PORTFOLIO_SETTINGS_COLLECTION,
      fallbackCode: "CLOUDBASE_SETTINGS_READ_FAILED",
      message: "CloudBase 站点设置读取失败。"
    });
  }
}

export async function updateSiteSettings(
  patch: Partial<Pick<SiteSettingsDocument, "profile" | "showcases">>
) {
  const now = new Date().toISOString();

  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    const updated = normalizeContent({
      ...content,
      profile: patch.profile ? cloneJson(patch.profile) : content.profile,
      showcases: patch.showcases ? cloneJson(patch.showcases) : content.showcases
    });
    await writeLocalContent(updated);
    return {
      _id: SITE_SETTINGS_DOCUMENT_ID,
      profile: updated.profile,
      showcases: updated.showcases,
      createdAt: now,
      updatedAt: now
    } satisfies SiteSettingsDocument;
  }

  assertCloudBaseAvailable();
  try {
    const existing = await readCloudBaseSettings();
    const seed = bundledSeedContent();
    const settings: SiteSettingsDocument = {
      _id: SITE_SETTINGS_DOCUMENT_ID,
      profile: patch.profile ? cloneJson(patch.profile) : existing?.profile || seed.profile,
      showcases: patch.showcases ? cloneJson(patch.showcases) : existing?.showcases || seed.showcases,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    const reference = getCloudBaseDatabase()
      .collection(PORTFOLIO_SETTINGS_COLLECTION)
      .doc(SITE_SETTINGS_DOCUMENT_ID);
    const result = existing
      ? await reference.update(withoutSettingsDatabaseId(settings))
      : await reference.set(withoutSettingsDatabaseId(settings));
    ensureDatabaseResult(result, {
      operation: "update_settings",
      collection: PORTFOLIO_SETTINGS_COLLECTION,
      fallbackCode: "CLOUDBASE_SETTINGS_UPDATE_FAILED",
      message: "CloudBase 站点设置更新失败。"
    });
    return settings;
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "update_settings",
      collection: PORTFOLIO_SETTINGS_COLLECTION,
      fallbackCode: "CLOUDBASE_SETTINGS_UPDATE_FAILED",
      message: "CloudBase 站点设置更新失败。"
    });
  }
}

export async function getSiteContent(options?: { includeHidden?: boolean }): Promise<SiteContent> {
  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    if (options?.includeHidden) return content;
    return normalizeContent({
      ...content,
      skills: content.skills.filter((item) => item.visible !== false),
      experiences: content.experiences.filter((item) => item.visible !== false),
      thoughts: content.thoughts.filter((item) => item.visible !== false),
      life: content.life.filter((item) => item.visible !== false)
    });
  }

  assertCloudBaseAvailable();
  try {
    const [items, settings] = await Promise.all([readAllCloudBaseItems(), readCloudBaseSettings()]);
    if (!items.length && !settings) return bundledSeedContent();
    return documentsToContent(items, settings, options);
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "read_site_content",
      collection: `${PORTFOLIO_ITEMS_COLLECTION},${PORTFOLIO_SETTINGS_COLLECTION}`,
      fallbackCode: "CLOUDBASE_READ_FAILED",
      message: "CloudBase 站点内容读取失败。"
    });
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeContent(cloneJson(content));
  if (usesLocalContentStore()) return writeLocalContent(normalized);

  assertCloudBaseAvailable();
  const now = new Date().toISOString();
  const desiredDocuments = contentToDocuments(normalized, { now });

  try {
    const existingDocuments = await readAllCloudBaseItems();
    const existingById = new Map(existingDocuments.map((document) => [document.id, document]));
    const desiredIds = new Set(desiredDocuments.map((document) => document.id));
    const collection = getCloudBaseDatabase().collection(PORTFOLIO_ITEMS_COLLECTION);

    await updateSiteSettings({ profile: normalized.profile, showcases: normalized.showcases });

    for (const desired of desiredDocuments) {
      const existing = existingById.get(desired.id);
      const document: PortfolioItemDocument = {
        ...desired,
        _id: existing?._id || desired.id,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };
      const reference = collection.doc(document._id);
      const result = existing
        ? await reference.update(withoutDatabaseId(document))
        : await reference.set(withoutDatabaseId(document));
      ensureDatabaseResult(result, {
        operation: existing ? "bulk_update_item" : "bulk_create_item",
        collection: PORTFOLIO_ITEMS_COLLECTION,
        fallbackCode: "CLOUDBASE_SAVE_FAILED",
        message: "CloudBase 站点内容保存失败。"
      });
    }

    for (const existing of existingDocuments) {
      if (desiredIds.has(existing.id)) continue;
      const result = await collection.doc(existing._id).remove();
      ensureDatabaseResult(result, {
        operation: "bulk_delete_item",
        collection: PORTFOLIO_ITEMS_COLLECTION,
        fallbackCode: "CLOUDBASE_SAVE_FAILED",
        message: "CloudBase 站点内容保存失败。"
      });
    }

    return getSiteContent({ includeHidden: true });
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "save_site_content",
      collection: `${PORTFOLIO_ITEMS_COLLECTION},${PORTFOLIO_SETTINGS_COLLECTION}`,
      fallbackCode: "CLOUDBASE_SAVE_FAILED",
      message: "CloudBase 站点内容保存失败。"
    });
  }
}

export async function getContentStoreState(): Promise<ContentStoreState> {
  if (usesLocalContentStore()) {
    const content = await readLocalContent();
    return {
      mode: "local",
      itemCount: content.skills.length + content.experiences.length + content.thoughts.length + content.life.length,
      hasSettings: true,
      empty: false
    };
  }

  assertCloudBaseAvailable();
  try {
    const [items, settings] = await Promise.all([readAllCloudBaseItems(), readCloudBaseSettings()]);
    return {
      mode: "cloudbase",
      itemCount: items.length,
      hasSettings: Boolean(settings),
      empty: items.length === 0 && !settings
    };
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "read_store_state",
      collection: `${PORTFOLIO_ITEMS_COLLECTION},${PORTFOLIO_SETTINGS_COLLECTION}`,
      fallbackCode: "CLOUDBASE_READ_FAILED",
      message: "CloudBase 数据状态读取失败。"
    });
  }
}

export async function checkContentStoreHealth() {
  if (usesLocalContentStore()) {
    await readLocalContent();
    return;
  }

  assertCloudBaseAvailable();
  try {
    const database = getCloudBaseDatabase();
    const [itemsResult, settingsResult] = await Promise.all([
      database.collection(PORTFOLIO_ITEMS_COLLECTION).limit(1).get(),
      database
        .collection(PORTFOLIO_SETTINGS_COLLECTION)
        .doc(SITE_SETTINGS_DOCUMENT_ID)
        .get()
    ]);
    ensureDatabaseResult(itemsResult, {
      operation: "health_probe_items",
      collection: PORTFOLIO_ITEMS_COLLECTION,
      fallbackCode: "CLOUDBASE_HEALTH_CHECK_FAILED",
      message: "CloudBase 内容集合健康检查失败。"
    });
    ensureDatabaseResult(settingsResult, {
      operation: "health_probe_settings",
      collection: PORTFOLIO_SETTINGS_COLLECTION,
      fallbackCode: "CLOUDBASE_HEALTH_CHECK_FAILED",
      message: "CloudBase 设置集合健康检查失败。"
    });
  } catch (error) {
    throw asCloudBaseStoreError(error, {
      operation: "health_probe",
      collection: `${PORTFOLIO_ITEMS_COLLECTION},${PORTFOLIO_SETTINGS_COLLECTION}`,
      fallbackCode: "CLOUDBASE_HEALTH_CHECK_FAILED",
      message: "CloudBase 数据库健康检查失败。"
    });
  }
}

export function getBundledSeedContent() {
  return bundledSeedContent();
}

export function getBundledSeedDocuments(content = bundledSeedContent()) {
  return contentToDocuments(content, { now: new Date().toISOString(), migration: true });
}

export const getContent = getSiteContent;
export const saveContent = saveSiteContent;
export const hasCloudBaseConfiguration = isCloudBaseConfigured;
export const useLocalDataStore = usesLocalContentStore;

export const contentStore = {
  getContent: getSiteContent,
  saveContent: saveSiteContent,
  getAllItems,
  getItemsBySection,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  getSiteSettings,
  updateSiteSettings,
  checkHealth: checkContentStoreHealth,
  getState: getContentStoreState
};
