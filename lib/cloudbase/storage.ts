import "server-only";

import { getCloudBaseStorage } from "@/lib/cloudbase/server";
import type { StoredFileReference } from "@/lib/types";

export const PORTFOLIO_STORAGE_PREFIX = "personal-portfolio/";
export const PORTFOLIO_UPLOAD_PREFIX = `${PORTFOLIO_STORAGE_PREFIX}uploads/`;

export class PortfolioStorageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "PortfolioStorageError";
  }
}

function assertPortfolioCloudPath(cloudPath: string) {
  if (
    !cloudPath.startsWith(PORTFOLIO_STORAGE_PREFIX) ||
    cloudPath.startsWith("/") ||
    cloudPath.includes("//") ||
    cloudPath.split("/").includes("..")
  ) {
    throw new PortfolioStorageError("云存储路径必须位于 personal-portfolio/ 前缀下。");
  }
}

function storageFailure(action: string, error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "unknown";
  return new PortfolioStorageError(`CloudBase 云存储${action}失败：${message}`);
}

export async function portfolioFileExists(cloudPath: string) {
  assertPortfolioCloudPath(cloudPath);
  const result = await getCloudBaseStorage().exists(cloudPath);
  if (result.error || result.data === null) throw storageFailure("检查", result.error);
  return result.data;
}

export async function getPortfolioFileReference(
  cloudPath: string,
  fallback: { size: number; mimeType: string; fileID?: string }
): Promise<StoredFileReference> {
  assertPortfolioCloudPath(cloudPath);
  const storage = getCloudBaseStorage();
  const [infoResult, urlResult] = await Promise.all([
    storage.info(cloudPath),
    storage.getPublicUrl(cloudPath)
  ]);

  if (infoResult.error || !infoResult.data) throw storageFailure("读取元数据", infoResult.error);
  if (!("data" in urlResult) || !urlResult.data) {
    throw storageFailure("生成展示地址", "error" in urlResult ? urlResult.error : undefined);
  }

  return {
    fileID: fallback.fileID || infoResult.data.id,
    cloudPath,
    url: urlResult.data.publicUrl,
    size: infoResult.data.size ?? fallback.size,
    mimeType: infoResult.data.contentType || fallback.mimeType
  };
}

export async function uploadPortfolioFile(options: {
  cloudPath: string;
  bytes: Uint8Array;
  mimeType: string;
  upsert?: boolean;
}): Promise<StoredFileReference> {
  assertPortfolioCloudPath(options.cloudPath);
  const result = await getCloudBaseStorage().upload(options.cloudPath, options.bytes, {
    contentType: options.mimeType,
    cacheControl: "31536000",
    upsert: options.upsert === true
  });

  if (result.error || !result.data) throw storageFailure("上传", result.error);
  return getPortfolioFileReference(options.cloudPath, {
    fileID: result.data.id,
    size: options.bytes.byteLength,
    mimeType: options.mimeType
  });
}
