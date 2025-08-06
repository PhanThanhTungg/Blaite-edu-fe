import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["@ant-design/pro-components", "antd"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
