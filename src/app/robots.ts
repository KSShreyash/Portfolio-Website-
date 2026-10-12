import type { MetadataRoute } from "next";

/**
 * Nothing here is private, so everything is crawlable.
 *
 * No `sitemap` entry: a sitemap has to list absolute URLs, and this site has
 * no production domain yet. Add one here once `canonicalUrl` is filled in
 * (see src/config/site.ts).
 */
// Emitted as a file at build time rather than served by a route handler.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
