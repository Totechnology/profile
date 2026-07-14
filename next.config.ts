import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tcb.qcloud.la",
        pathname: "/personal-portfolio/**"
      },
      {
        protocol: "https",
        hostname: "**.cos.ap-shanghai.myqcloud.com",
        pathname: "/personal-portfolio/**"
      },
      {
        protocol: "https",
        hostname: "**.tcloudbaseapp.com",
        pathname: "/personal-portfolio/**"
      }
    ]
  }
};

export default nextConfig;
