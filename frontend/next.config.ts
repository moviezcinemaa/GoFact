import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // Allow any HTTPS image host (news CDNs vary)
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://gofact-backend.onrender.com",
  },
};

export default nextConfig;
