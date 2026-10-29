import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers cannot run sharp/libvips, so image optimization is off.
    unoptimized: true,
  },
};

export default nextConfig;
