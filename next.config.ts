import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'spoqkzsrcphgzvmxwadd.supabase.co' }
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  }
};

export default nextConfig;
