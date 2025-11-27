import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "server.arcgisonline.com" },
      { protocol: "https", hostname: "sgjbitdfudwctwsyziav.supabase.co" },
    ],
  },
  compress: true,
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
