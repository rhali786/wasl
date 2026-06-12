import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the dev server's JS/HMR assets to load when the app is reached
  // through a tunnel (e.g. loca.lt) from another device, not just localhost.
  allowedDevOrigins: ["*.loca.lt"],
};

export default nextConfig;
