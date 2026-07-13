import { promises as fs } from "node:fs";
import path from "node:path";
import { initialSiteContent } from "@/data/siteContent";
import type { SiteContent } from "@/lib/types";
import { deepCloneContent, normalizeContent } from "@/lib/utils";

const defaultContentFile = path.join(process.cwd(), ".content", "site-content.json");

function getContentFilePath() {
  return process.env.CONTENT_FILE_PATH || defaultContentFile;
}

async function readJsonFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as SiteContent;
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const content = await readJsonFile(getContentFilePath());
    return normalizeContent({
      ...deepCloneContent(initialSiteContent),
      ...content,
      profile: {
        ...initialSiteContent.profile,
        ...content.profile
      },
      showcases: {
        ...initialSiteContent.showcases,
        ...(content.showcases || {})
      }
    });
  } catch {
    return normalizeContent(deepCloneContent(initialSiteContent));
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeContent(content);
  const filePath = getContentFilePath();

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  return normalized;
}

export const contentStore = {
  getContent: getSiteContent,
  saveContent: saveSiteContent
};
