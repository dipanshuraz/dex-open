import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tradegenius.com",
        pathname: "/api/proxy-image/**",
      },
      {
        protocol: "https",
        hostname: "www.tradegenius.com",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
