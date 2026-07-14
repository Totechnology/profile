import type { PortfolioSection, SiteContent } from "@/lib/types";
import { badRequest } from "@/lib/api/errors";

const PORTFOLIO_SECTIONS = new Set<PortfolioSection>([
  "capabilities",
  "experience",
  "thoughts",
  "life"
]);

const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const CREATE_RESERVED_KEYS = new Set(["_id", "createdAt", "updatedAt", "migrationKey"]);
const UPDATE_RESERVED_KEYS = new Set([
  "_id",
  "id",
  "section",
  "createdAt",
  "updatedAt",
  "migrationKey"
]);

type JsonObject = Record<string, unknown>;

export type CreatePortfolioItemInput = JsonObject & {
  id?: string;
  section: PortfolioSection;
  type: string;
  title: string;
};

export type UpdatePortfolioItemInput = JsonObject;

export type ReorderPortfolioItemsInput = {
  section: PortfolioSection;
  orderedIds: string[];
};

export type SiteSettingsPatch = {
  profile?: JsonObject;
  showcases?: JsonObject;
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): JsonObject {
  if (!isObject(value)) badRequest(`${label}必须是对象。`, "INVALID_PAYLOAD");
  return value;
}

function safeJsonValue(value: unknown, label: string, depth = 0): unknown {
  if (depth > 10) badRequest(`${label}层级过深。`, "INVALID_PAYLOAD");

  if (value === null || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) badRequest(`${label}包含无效数字。`, "INVALID_PAYLOAD");
    return value;
  }

  if (typeof value === "string") {
    if (value.length > 100_000) badRequest(`${label}文本过长。`, "INVALID_PAYLOAD");
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > 1_000) badRequest(`${label}数量过多。`, "INVALID_PAYLOAD");
    return value.map((entry, index) => safeJsonValue(entry, `${label}[${index}]`, depth + 1));
  }

  if (!isObject(value)) badRequest(`${label}包含不支持的数据。`, "INVALID_PAYLOAD");

  const entries = Object.entries(value);
  if (entries.length > 250) badRequest(`${label}字段过多。`, "INVALID_PAYLOAD");

  const output: JsonObject = Object.create(null) as JsonObject;
  for (const [key, entry] of entries) {
    if (UNSAFE_KEYS.has(key)) badRequest(`${label}包含不允许的字段。`, "INVALID_PAYLOAD");
    output[key] = safeJsonValue(entry, `${label}.${key}`, depth + 1);
  }
  return output;
}

function cleanObject(value: unknown, label: string): JsonObject {
  return safeJsonValue(requireObject(value, label), label) as JsonObject;
}

function requireString(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    badRequest(`${label}不能为空。`, "INVALID_PAYLOAD");
  }
  const result = value.trim();
  if (result.length > maxLength) badRequest(`${label}过长。`, "INVALID_PAYLOAD");
  return result;
}

export function validateIdentifier(value: unknown, label = "ID") {
  const id = requireString(value, label, 128);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) {
    badRequest(`${label}格式不正确。`, "INVALID_ID");
  }
  return id;
}

export function validatePortfolioSection(value: unknown): PortfolioSection {
  if (typeof value !== "string" || !PORTFOLIO_SECTIONS.has(value as PortfolioSection)) {
    badRequest("内容分类不正确。", "INVALID_SECTION");
  }
  return value as PortfolioSection;
}

function unwrap(value: unknown, key: string) {
  const body = requireObject(value, "请求内容");
  return key in body ? body[key] : body;
}

export function validateCreatePortfolioItem(value: unknown): CreatePortfolioItemInput {
  const item = cleanObject(unwrap(value, "item"), "item");
  for (const key of CREATE_RESERVED_KEYS) {
    if (key in item) badRequest(`item.${key} 由服务器维护。`, "RESERVED_FIELD");
  }

  const result = {
    ...item,
    section: validatePortfolioSection(item.section),
    type: requireString(item.type, "item.type", 80),
    title: requireString(item.title, "item.title", 240)
  } as CreatePortfolioItemInput;

  if (item.id !== undefined) result.id = validateIdentifier(item.id, "item.id");
  if (item.order !== undefined && (!Number.isInteger(item.order) || Number(item.order) < 0)) {
    badRequest("item.order 必须是非负整数。", "INVALID_PAYLOAD");
  }
  if (item.visible !== undefined && typeof item.visible !== "boolean") {
    badRequest("item.visible 必须是布尔值。", "INVALID_PAYLOAD");
  }
  if (item.featured !== undefined && typeof item.featured !== "boolean") {
    badRequest("item.featured 必须是布尔值。", "INVALID_PAYLOAD");
  }

  return result;
}

export function validateUpdatePortfolioItem(value: unknown): UpdatePortfolioItemInput {
  const item = cleanObject(unwrap(value, "item"), "item");
  if (Object.keys(item).length === 0) badRequest("没有可更新的字段。", "EMPTY_UPDATE");

  for (const key of UPDATE_RESERVED_KEYS) {
    if (key in item) badRequest(`item.${key} 不允许修改。`, "RESERVED_FIELD");
  }

  if (item.title !== undefined) item.title = requireString(item.title, "item.title", 240);
  if (item.type !== undefined) item.type = requireString(item.type, "item.type", 80);
  if (item.slug !== undefined) item.slug = requireString(item.slug, "item.slug", 240);
  if (item.order !== undefined && (!Number.isInteger(item.order) || Number(item.order) < 0)) {
    badRequest("item.order 必须是非负整数。", "INVALID_PAYLOAD");
  }
  if (item.visible !== undefined && typeof item.visible !== "boolean") {
    badRequest("item.visible 必须是布尔值。", "INVALID_PAYLOAD");
  }
  if (item.featured !== undefined && typeof item.featured !== "boolean") {
    badRequest("item.featured 必须是布尔值。", "INVALID_PAYLOAD");
  }
  return item;
}

export function validateReorderPortfolioItems(value: unknown): ReorderPortfolioItemsInput {
  const body = cleanObject(value, "请求内容");
  const rawIds = body.orderedIds ?? body.itemIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > 1_000) {
    badRequest("orderedIds 必须是非空 ID 数组。", "INVALID_REORDER");
  }

  const orderedIds = rawIds.map((id, index) => validateIdentifier(id, `orderedIds[${index}]`));
  if (new Set(orderedIds).size !== orderedIds.length) {
    badRequest("orderedIds 不能包含重复 ID。", "INVALID_REORDER");
  }

  return { section: validatePortfolioSection(body.section), orderedIds };
}

export function validateSettingsPatch(value: unknown): SiteSettingsPatch {
  const settings = cleanObject(unwrap(value, "settings"), "settings");
  for (const key of Object.keys(settings)) {
    if (key !== "profile" && key !== "showcases") {
      badRequest(`settings.${key} 不允许修改。`, "RESERVED_FIELD");
    }
  }
  if (!("profile" in settings) && !("showcases" in settings)) {
    badRequest("没有可更新的站点设置。", "EMPTY_UPDATE");
  }

  const patch: SiteSettingsPatch = {};
  if (settings.profile !== undefined) patch.profile = cleanObject(settings.profile, "settings.profile");
  if (settings.showcases !== undefined) patch.showcases = cleanObject(settings.showcases, "settings.showcases");
  return patch;
}

export function validateSiteContent(value: unknown): SiteContent {
  const content = cleanObject(unwrap(value, "content"), "content");
  const arrayKeys = ["skills", "experiences", "thoughts", "life"] as const;

  if (!isObject(content.profile)) badRequest("content.profile 必须是对象。", "INVALID_CONTENT");
  if (!isObject(content.showcases)) badRequest("content.showcases 必须是对象。", "INVALID_CONTENT");

  for (const key of arrayKeys) {
    if (!Array.isArray(content[key]) || content[key].length > 1_000) {
      badRequest(`content.${key} 必须是内容数组。`, "INVALID_CONTENT");
    }
    for (const [index, item] of content[key].entries()) {
      const record = requireObject(item, `content.${key}[${index}]`);
      validateIdentifier(record.id, `content.${key}[${index}].id`);
      requireString(record.title, `content.${key}[${index}].title`, 240);
    }
  }

  return content as SiteContent;
}
