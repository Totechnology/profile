import { KineticBackground } from "@/components/background/KineticBackground";
import { IntroGate } from "@/components/intro/IntroGate";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionDetail } from "@/components/sections/SectionDetail";
import { contentStore } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export default async function LifePage() {
  const content = await contentStore.getContent();

  return (
    <>
      <Header />
      <IntroGate>
        <div className="space-shell">
          <KineticBackground />
          <SectionDetail content={content} section="life" />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
