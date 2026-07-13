import type { ProfileMeta } from "@/lib/types";

export function SiteFooter({ profile }: { profile: ProfileMeta }) {
  return (
    <footer className="container-space border-t border-border py-10">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-lg font-semibold text-foreground">{profile.title}</p>
          <p className="mono mt-4 text-xs text-muted-foreground">{profile.footerLine}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <a
            className="focus-ring mono text-sm font-semibold text-foreground transition duration-200 hover:text-primary"
            href="mailto:mixingcy@163.com"
          >
            mixingcy@163.com
          </a>
        </div>
      </div>
    </footer>
  );
}
