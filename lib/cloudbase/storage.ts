import "server-only";

import { getCloudBaseEnvId, getCloudBaseStorage } from "@/lib/cloudbase/server";
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

function assertPortfolioFileID(fileID: string) {
  const scheme = "cloud://";
  const pathStart = fileID.indexOf("/", scheme.length);
  if (!fileID.startsWith(scheme) || pathStart <= scheme.length) {
    throw new PortfolioStorageError("云存储 fileID 格式无效。");
  }

  const authority = fileID.slice(scheme.length, pathStart);
  if (!authority.startsWith(`${getCloudBaseEnvId()}.`)) {
    throw new PortfolioStorageError("云存储 fileID 不属于当前 CloudBase 环境。");
  }

  let cloudPath: string;
  try {
    cloudPath = decodeURIComponent(fileID.slice(pathStart + 1));
  } catch (error) {
    throw new PortfolioStorageError("云存储 fileID 路径编码无效。", error);
  }
  assertPortfolioCloudPath(cloudPath);
}

function storageFailure(action: string, error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "unknown";
  return new PortfolioStorageError(`CloudBase 云存储${action}失败：${message}`);
}

function getPortfolioMediaUrl(fileID: string) {
  assertPortfolioFileID(fileID);
  return `/api/media/${Buffer.from(fileID, "utf8").toString("base64url")}`;
}

export function decodePortfolioFileToken(token: string) {
  if (!token || token.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new PortfolioStorageError("媒体访问令牌格式无效。");
  }

  const fileID = Buffer.from(token, "base64url").toString("utf8");
  if (Buffer.from(fileID, "utf8").toString("base64url") !== token) {
    throw new PortfolioStorageError("媒体访问令牌编码无效。");
  }
  assertPortfolioFileID(fileID);
  return fileID;
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
  return {
    fileID: result.data.id,
    cloudPath: options.cloudPath,
    url: getPortfolioMediaUrl(result.data.id),
    size: options.bytes.byteLength,
    mimeType: options.mimeType
  };
}
