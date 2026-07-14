import { SectionGateway } from "@/components/home/SectionGateway";
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
        <div className="space-shell home-video-shell">
          <div className="home-video-background" aria-hidden="true">
            <video autoPlay loop muted playsInline preload="metadata">
              <source src="/videos/home-background-4k.mp4" type="video/mp4" />
            </video>
          </div>
          <SectionGateway content={content} />
          <SiteFooter profile={content.profile} />
        </div>
      </IntroGate>
    </>
  );
}
