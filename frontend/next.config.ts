import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Optional: Add trailing slash for Firebase compatibility
  trailingSlash: true,
};

export default nextConfig;
