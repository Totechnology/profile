import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceDir = path.join(rootDir, ".static-work");
const outputDir = path.join(rootDir, "out");
const excludedRoots = new Set([
  ".git",
  ".next",
  ".static-work",
  "dist",
  "node_modules",
  "out",
  "output"
]);

const publicPageFiles = [
  "app/page.tsx",
  "app/capabilities/page.tsx",
  "app/capabilities/[slug]/page.tsx",
  "app/experience/page.tsx",
  "app/experience/[slug]/page.tsx",
  "app/life/page.tsx",
  "app/life/[slug]/page.tsx",
  "app/thoughts/page.tsx"
];

async function prepareWorkspace() {
  await fs.rm(workspaceDir, { recursive: true, force: true });
  await fs.mkdir(workspaceDir, { recursive: true });

  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedRoots.has(entry.name)) continue;
    if (entry.name === ".env.local" || (entry.name.startsWith(".env.") && entry.name !== ".env.example")) continue;

    await fs.cp(path.join(rootDir, entry.name), path.join(workspaceDir, entry.name), { recursive: true });
  }

  await Promise.all([
    fs.rm(path.join(workspaceDir, "app", "admin"), { recursive: true, force: true }),
    fs.rm(path.join(workspaceDir, "app", "api"), { recursive: true, force: true })
  ]);

  await Promise.all(
    publicPageFiles.map(async (relativePath) => {
      const filePath = path.join(workspaceDir, relativePath);
      const source = await fs.readFile(filePath, "utf8");
      await fs.writeFile(filePath, source.replace(/export const dynamic = "force-dynamic";\s*/g, ""), "utf8");
    })
  );
}

async function buildStaticSite() {
  const nextCli = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: workspaceDir,
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_EXPORT: "1"
    },
    encoding: "utf8",
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Static export failed with exit code ${result.status ?? "unknown"}.`);

  const generatedOutput = path.join(workspaceDir, "out");
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.cp(generatedOutput, outputDir, { recursive: true });
}

try {
  await prepareWorkspace();
  await buildStaticSite();
  console.log(`Static site exported to ${outputDir}`);
} finally {
  await fs.rm(workspaceDir, { recursive: true, force: true });
}
