import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  serverExternalPackages: ["socket.io"],

  webpack: (config: any) => {
    config.externals = [...(config.externals || []), "socket.io"];
    return config;
  },
};

export default nextConfig;
