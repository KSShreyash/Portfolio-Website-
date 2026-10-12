import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole site is prerenderable, and this is what lets it
  // sit on Cloudflare Pages (or any static host) with no server at all.
  //
  // `cacheComponents` and `partialPrefetching` were dropped with it. Both
  // govern how dynamic rendering is cached, and nothing here renders
  // dynamically, so they bought nothing and are not compatible with export.
  output: "export",

  images: {
    // No optimiser on a static host. `scripts/extract_assets.py` pre-generates
    // the widths this site asks for and image-loader.ts picks between them,
    // which keeps responsive images without a server.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // These must match the widths extract_assets.py writes. Next stamps the
    // requested width into the srcset `w` descriptor, so if the loader had to
    // round up to a larger file the descriptor would lie and the browser
    // would over-fetch.
    deviceSizes: [480, 768, 900, 1200, 1440, 1672],
    imageSizes: [48, 96, 192, 256, 440, 640],
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
