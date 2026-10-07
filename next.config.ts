import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The backend (Render) can take 30–60s to wake up; don't fail prerendering on a cold start.
  staticPageGenerationTimeout: 180,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
