import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (~20% smaller than WebP), WebP fallback for browsers without AVIF.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
