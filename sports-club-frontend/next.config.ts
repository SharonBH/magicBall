import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },    
};


export default nextConfig;
