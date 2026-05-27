import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Monorepo-style: ignore backend/ lockfile checked out beside UI in CI e2e.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
