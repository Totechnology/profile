import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/auth";
import { contentStore } from "@/lib/contentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const [content, storeState] = await Promise.all([
    contentStore.getContent({ includeHidden: true }),
    contentStore.getState()
  ]);

  return (
    <AdminDashboard
      initialContent={content}
      canSeed={process.env.ALLOW_CLOUDBASE_SEED?.trim().toLowerCase() === "true" && storeState.mode === "cloudbase"}
      seedNeeded={storeState.empty}
    />
  );
}
