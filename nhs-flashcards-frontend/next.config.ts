import type { NextConfig } from "next";

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5000/:path*",
      },
    ];
  },
};

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
