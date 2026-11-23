import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers cannot run sharp/libvips, so image optimization is off.
    unoptimized: true,
  },
  // Next traces pg-cloudflare with the default condition only; the Workers bundle needs its workerd build.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/pg-cloudflare/**/*"],
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
