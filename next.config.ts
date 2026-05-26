import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from treating the checked-out backend/ folder in CI as part of this app.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
