import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["socket.io"],
  },
  // Adiciona suporte ao Socket.IO
  webpack: (config: any) => {
    config.externals = [...(config.externals || []), "socket.io"];
    return config;
  },
};

export default nextConfig;
