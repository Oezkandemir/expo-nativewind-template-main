import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Set Turbopack root to merchant-portal directory to avoid lockfile warnings
  // This suppresses the warning about multiple lockfiles in the monorepo
  // Note: process.cwd() will be the merchant-portal directory when running from that directory
  turbopack: {
    root: process.cwd(),
  },
  // Configure webpack to resolve modules from merchant-portal node_modules first
  // This ensures tailwindcss and other dependencies are found correctly
  webpack: (config, { isServer }) => {
    // Add merchant-portal node_modules to the resolution path
    const merchantPortalNodeModules = path.resolve(process.cwd(), 'node_modules');
    if (config.resolve) {
      // Ensure merchant-portal node_modules is first in the resolution path
      // This is critical for pnpm workspaces where modules are hoisted
      config.resolve.modules = [
        merchantPortalNodeModules,
        ...(config.resolve.modules || ['node_modules']),
      ];
      
      // Enable symlink resolution for pnpm
      config.resolve.symlinks = true;
      
      // Add alias for tailwindcss to ensure it resolves correctly from merchant-portal
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      
      // Resolve tailwindcss from merchant-portal node_modules
      // This is needed because @import "tailwindcss" in CSS needs to resolve correctly
      const tailwindcssPath = path.resolve(merchantPortalNodeModules, 'tailwindcss');
      config.resolve.alias.tailwindcss = tailwindcssPath;
    }
    return config;
  },
};

export default nextConfig;
