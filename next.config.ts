import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  // The `serverExternalPackages` option allows you to opt-out of bundling dependencies in your Server Components.
  serverExternalPackages: ["puppeteer"],
  allowedDevOrigins: ["95.217.41.161"],
};

export default nextConfig;
