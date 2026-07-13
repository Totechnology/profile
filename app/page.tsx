import { SectionGateway } from "@/components/home/SectionGateway";
import { KineticBackground } from "@/components/background/KineticBackground";
import { IntroGate } from "@/components/intro/IntroGate";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { contentStore } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await contentStore.getContent();

  return (
    <>
      <Header />
      <IntroGate>
        <div className="space-shell">
          <KineticBackground />
          <SectionGateway content={content} />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
