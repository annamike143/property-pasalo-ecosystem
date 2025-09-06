import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/types'],
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
