import { notFound } from "next/navigation";
import { KineticBackground } from "@/components/background/KineticBackground";
import { IntroGate } from "@/components/intro/IntroGate";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EntryDetailPage } from "@/components/sections/EntryDetailPage";
import { contentStore } from "@/lib/contentStore";
import { findBySlug } from "@/lib/slugs";

export const dynamic = "force-dynamic";

export default async function ThoughtEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await contentStore.getContent();
  const item = findBySlug(content.thoughts, slug);

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
              eyebrow: item.readingTime || "Learning Notes",
              meta: [item.date, item.createdAt].filter(Boolean).join(" / "),
              image: item.image || content.showcases.thoughts.image,
              images: item.images,
              description: item.content || item.summary,
              tags: item.tags,
              backHref: "/thoughts",
              backLabel: "返回学习思考",
              link: item.link
            }}
          />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
