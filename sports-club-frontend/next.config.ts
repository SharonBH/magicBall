import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true, // it should be true
};


export default nextConfig;
