import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@techstark/opencv-js', 'sharp'],
  // Tell Vercel's file tracer to include opencv-js (loaded via dynamic createRequire,
  // so the tracer can't detect it automatically)
  outputFileTracingIncludes: {
    '/api/upload/detect': ['./node_modules/@techstark/opencv-js/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
