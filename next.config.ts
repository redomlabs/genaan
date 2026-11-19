import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    // Dashboard image uploads are resized in the browser first; this leaves headroom.
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Native libSQL driver stays outside the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  async redirects() {
    return [
      { source: "/packages", destination: "/business", permanent: true },
      { source: "/spaces", destination: "/business", permanent: true },
      { source: "/care", destination: "/business", permanent: true },
      { source: "/shop/:path*", destination: "/planting", permanent: true },
      { source: "/journal/:path*", destination: "/", permanent: true },
      { source: "/cart", destination: "/checkout", permanent: false },
      { source: "/(login|register|account|forgot-password|reset-password|verify-otp)", destination: "/track", permanent: false },
    ];
  },
};

export default nextConfig;
