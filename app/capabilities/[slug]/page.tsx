import { notFound } from "next/navigation";
import { KineticBackground } from "@/components/background/KineticBackground";
import { IntroGate } from "@/components/intro/IntroGate";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EntryDetailPage } from "@/components/sections/EntryDetailPage";
import { contentStore } from "@/lib/contentStore";
import { findBySlug, getEntrySlug } from "@/lib/slugs";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const content = await contentStore.getContent();
  return content.skills.map((item) => ({ slug: getEntrySlug(item) }));
}

export default async function CapabilityEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await contentStore.getContent();
  const item = findBySlug(content.skills, slug);

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
              eyebrow: item.level || "Capability System",
              meta: item.createdAt,
              image: item.image || content.showcases.skills.image,
              images: item.images,
              description: item.description,
              tags: item.skills,
              backHref: "/capabilities",
              backLabel: "返回个人能力"
            }}
          />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
