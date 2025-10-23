import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
