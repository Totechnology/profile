import type { Metadata, Viewport } from "next";
import { GlassFilterDefs } from "@/components/ui/GlassFilterDefs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "龚宸宇 | 视听技术与硬件系统创作者",
  description:
    "龚宸宇的个人主页，展示影像创作、声音工程、硬件系统、AI 工作流、现场扩声、拍摄摄影等综合能力。",
  icons: {
    icon: "/images/profile/journal-avatar.png"
  },
  openGraph: {
    title: "龚宸宇 | 视听技术与硬件系统创作者",
    description:
      "影像、声音、硬件与 AI 工具协作的个人技术空间。",
    type: "website",
    locale: "zh_CN",
    images: ["/images/archive-portrait.png"]
  }
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <GlassFilterDefs />
        {children}
      </body>
    </html>
  );
}
