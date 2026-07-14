import "server-only";

import cloudbase from "@cloudbase/js-sdk";

const CLOUDBASE_REGION = "ap-shanghai";

let serverApp: ReturnType<typeof cloudbase.init> | undefined;

export class CloudBaseConfigurationError extends Error {
  constructor() {
    super("CloudBase 服务端环境尚未配置。");
    this.name = "CloudBaseConfigurationError";
  }
}

export function getCloudBaseEnvId() {
  const envId = process.env.CLOUDBASE_ENV_ID?.trim();
  if (!envId) throw new CloudBaseConfigurationError();
  return envId;
}

export function getCloudBaseApp() {
  if (!serverApp) {
    serverApp = cloudbase.init({
      env: getCloudBaseEnvId(),
      region: CLOUDBASE_REGION,
      timeout: 15_000
    });
  }

  return serverApp;
}

export function getCloudBaseDatabase() {
  return getCloudBaseApp().database();
}

export function getCloudBaseStorage() {
  return getCloudBaseApp().storage.from();
}
