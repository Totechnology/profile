import { notFound } from "next/navigation";
import { KineticBackground } from "@/components/background/KineticBackground";
import { IntroGate } from "@/components/intro/IntroGate";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EntryDetailPage } from "@/components/sections/EntryDetailPage";
import { contentStore } from "@/lib/contentStore";
import { findBySlug } from "@/lib/slugs";

export const dynamic = "force-dynamic";

export default async function ExperienceEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await contentStore.getContent();
  const item = findBySlug(content.experiences, slug);

  if (!item) notFound();

  return (
    <>
      <Header />
      <IntroGate>
        <div className="space-shell">
          <KineticBackground />
          <EntryDetailPage
            entry={{
              title: item.title,
              eyebrow: item.type || "Project Archive",
              meta: [item.role, item.time, item.createdAt].filter(Boolean).join(" / "),
              image: item.image,
              images: item.images,
              description: item.description,
              tags: item.tags,
              highlights: item.highlights,
              backHref: "/experience",
              backLabel: "返回个人经历",
              link: item.link
            }}
          />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
