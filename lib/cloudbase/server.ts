import "server-only";

import cloudbase from "@cloudbase/js-sdk";

const CLOUDBASE_REGION = "ap-shanghai";
const CLOUDBASE_TIMEOUT_MS = 15_000;

type CloudBaseApp = ReturnType<typeof cloudbase.init>;

export type CloudBaseErrorCategory =
  | "initialization_failed"
  | "permission_denied"
  | "collection_not_found"
  | "request_failed";

export type CloudBaseErrorDiagnostic = {
  category: CloudBaseErrorCategory;
  errorName: string;
  errorCode: string;
};

let serverApp: CloudBaseApp | undefined;
const loggedInitializationErrors = new Set<string>();

export class CloudBaseServerError extends Error {
  readonly code: string;

  constructor(name: string, code: string, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = name;
    this.code = code;
  }
}

export class CloudBaseConfigurationError extends CloudBaseServerError {
  constructor() {
    super(
      "CloudBaseConfigurationError",
      "CLOUDBASE_ENV_MISSING",
      "CloudBase 服务端环境尚未配置。"
    );
  }
}

export class CloudBaseCredentialsError extends CloudBaseServerError {
  constructor(code: "CLOUDBASE_CREDENTIALS_MISSING" | "CLOUDBASE_CREDENTIALS_INCOMPLETE") {
    super(
      "CloudBaseCredentialsError",
      code,
      code === "CLOUDBASE_CREDENTIALS_INCOMPLETE"
        ? "CloudBase 服务端临时凭据不完整。"
        : "CloudBase 云托管服务没有可用的服务端身份凭据。"
    );
  }
}

function normalizeIdentifier(value: unknown, fallback: string) {
  if (typeof value !== "string" && typeof value !== "number") return fallback;
  const normalized = String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_.:-]/g, "_")
    .slice(0, 96);
  return normalized || fallback;
}

function errorRecords(error: unknown) {
  const queue: unknown[] = [error];
  const records: Record<string, unknown>[] = [];
  const visited = new Set<object>();

  while (queue.length && records.length < 8) {
    const value = queue.shift();
    if (!value || (typeof value !== "object" && typeof value !== "function")) continue;
    if (visited.has(value)) continue;
    visited.add(value);

    const record = value as Record<string, unknown>;
    records.push(record);
    queue.push(record.cause, record.error, record.data);

    if (record.response && typeof record.response === "object") {
      queue.push((record.response as Record<string, unknown>).data);
    }
  }

  return records;
}

export function getCloudBaseErrorDiagnostic(error: unknown): CloudBaseErrorDiagnostic {
  const records = errorRecords(error);
  const errorName = normalizeIdentifier(
    records.find((record) => typeof record.name === "string")?.name,
    error instanceof Error ? error.name : "CloudBaseError"
  );
  const errorCode = normalizeIdentifier(
    records
      .flatMap((record) => [record.code, record.errorCode, record.statusCode])
      .find((value) => typeof value === "string" || typeof value === "number"),
    "CLOUDBASE_REQUEST_FAILED"
  );
  const signature = records
    .flatMap((record) => [record.name, record.code, record.errorCode, record.message])
    .filter((value): value is string | number =>
      typeof value === "string" || typeof value === "number"
    )
    .join(" ")
    .toUpperCase();

  let category: CloudBaseErrorCategory = "request_failed";
  if (
    /(?:DATABASE[_\s-]*)?COLLECTION[_\s-]*(?:NOT[_\s-]*FOUND|NOT[_\s-]*EXIST|DOES[_\s-]*NOT[_\s-]*EXIST)/.test(
      signature
    )
  ) {
    category = "collection_not_found";
  } else if (
    /CLOUDBASE_(ENV|CREDENTIALS|INIT)|CONFIGURATION|INITIALIZATION|INVALID[_\s-]*ENV/.test(
      signature
    )
  ) {
    category = "initialization_failed";
  } else if (
    /PERMISSION[_\s-]*DENIED|ACCESS[_\s-]*(DENIED|TOKEN[_\s-]*INVALID)|ACTION[_\s-]*FORBIDDEN|UNAUTHORIZED|FORBIDDEN|INVALID[_\s-]*((API[_\s-]*)?KEY|CREDENTIALS)|MISSING[_\s-]*CREDENTIALS|SIGN[_\s-]*PARAM[_\s-]*INVALID|AUTH(ENTICATION|ORIZATION)?[_\s-]*(FAILED|REQUIRED)/.test(
      signature
    )
  ) {
    category = "permission_denied";
  }

  return { category, errorName, errorCode };
}

function logInitializationError(error: unknown) {
  const diagnostic = getCloudBaseErrorDiagnostic(error);
  if (loggedInitializationErrors.has(diagnostic.errorCode)) return;
  loggedInitializationErrors.add(diagnostic.errorCode);
  console.error("[cloudbase:init]", {
    event: "initialization_failed",
    errorName: diagnostic.errorName,
    errorCode: diagnostic.errorCode
  });
}

function failInitialization(error: CloudBaseServerError): never {
  logInitializationError(error);
  throw error;
}

export function getCloudBaseEnvId() {
  const envId = process.env.CLOUDBASE_ENV_ID?.trim();
  if (!envId) failInitialization(new CloudBaseConfigurationError());
  return envId;
}

function getCloudBaseCredentials():
  | { mode: "api_key"; accessKey: string }
  | {
      mode: "temporary_credentials" | "secret_pair";
      secretId: string;
      secretKey: string;
      sessionToken?: string;
    } {
  const accessKey = process.env.CLOUDBASE_APIKEY?.trim();
  if (accessKey) return { mode: "api_key", accessKey };

  const secretId = process.env.TENCENTCLOUD_SECRETID?.trim();
  const secretKey = process.env.TENCENTCLOUD_SECRETKEY?.trim();
  const sessionToken = process.env.TENCENTCLOUD_SESSIONTOKEN?.trim();

  if (Boolean(secretId) !== Boolean(secretKey)) {
    failInitialization(new CloudBaseCredentialsError("CLOUDBASE_CREDENTIALS_INCOMPLETE"));
  }
  if (!secretId || !secretKey) {
    failInitialization(new CloudBaseCredentialsError("CLOUDBASE_CREDENTIALS_MISSING"));
  }

  return {
    mode: sessionToken ? "temporary_credentials" : "secret_pair",
    secretId,
    secretKey,
    ...(sessionToken ? { sessionToken } : {})
  };
}

export function getCloudBaseApp() {
  if (serverApp) return serverApp;

  const credentials = getCloudBaseCredentials();
  const credentialConfig =
    credentials.mode === "api_key"
      ? { accessKey: credentials.accessKey }
      : {
          auth: {
            secretId: credentials.secretId,
            secretKey: credentials.secretKey,
            ...(credentials.sessionToken ? { sessionToken: credentials.sessionToken } : {})
          }
        };

  try {
    serverApp = cloudbase.init({
      env: getCloudBaseEnvId(),
      region: CLOUDBASE_REGION,
      timeout: CLOUDBASE_TIMEOUT_MS,
      ...credentialConfig
    });
    return serverApp;
  } catch (error) {
    if (error instanceof CloudBaseServerError) throw error;
    const initializationError = new CloudBaseServerError(
      "CloudBaseInitializationError",
      "CLOUDBASE_INIT_FAILED",
      "CloudBase 服务端 SDK 初始化失败。",
      error
    );
    logInitializationError(initializationError);
    throw initializationError;
  }
}

export function getCloudBaseDatabase() {
  return getCloudBaseApp().database();
}

export function getCloudBaseStorage() {
  return getCloudBaseApp().storage.from();
}
