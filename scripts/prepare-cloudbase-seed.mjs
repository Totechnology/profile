import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourcePath = path.join(process.cwd(), ".content", "site-content.json");
const destinationPath = path.join(process.cwd(), "data", "cloudbase-seed.json");
const sectionKeys = ["skills", "experiences", "thoughts", "life"];

const source = JSON.parse(await readFile(sourcePath, "utf8"));

if (!source || typeof source !== "object" || !source.profile || !source.showcases) {
  throw new Error(".content/site-content.json 缺少 profile 或 showcases。");
}

const ids = new Set();
for (const section of sectionKeys) {
  if (!Array.isArray(source[section])) {
    throw new Error(`.content/site-content.json 缺少 ${section} 数组。`);
  }

  source[section].forEach((item, index) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id.trim()) {
      throw new Error(`${section}[${index}] 缺少有效 id。`);
    }
    if (ids.has(item.id)) throw new Error(`发现重复内容 ID：${item.id}`);
    ids.add(item.id);
  });
}

await writeFile(destinationPath, `${JSON.stringify(source, null, 2)}\n`, "utf8");

console.log(
  `CloudBase seed prepared: ${sectionKeys.map((key) => `${key}=${source[key].length}`).join(", ")}`
);
