import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
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
