import type { NextConfig } from "next";
import { hostname } from "os";

const isProd = process.env.NODE_ENV === 'production';
const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'dist',
  reactStrictMode: true,
  assetPrefix: isProd ? '/secret-santa/' : '',
  basePath: isProd ? '/secret-santa' : '',
  images: {
    unoptimized: true,    
    remotePatterns: [{
        protocol: 'https',
        hostname:'mqichvjbjuhwmbtpnklj.storage.supabase.co',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname:'mqichvjbjuhwmbtpnklj.supabase.co',
        pathname: '**'
      }]
  }
};

export default nextConfig;
