import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  images: {
    // The section artwork is upscaled from a small source, so it is encoded a
    // little above the default to keep the gradients from banding. Next 16
    // requires every quality used in the app to be declared here.
    qualities: [75, 88],
    formats: ["image/webp"],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
