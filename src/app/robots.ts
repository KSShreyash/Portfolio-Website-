import type { MetadataRoute } from "next";

/**
 * Nothing here is private, so everything is crawlable.
 *
 * No `sitemap` entry: a sitemap has to list absolute URLs, and this site has
 * no production domain yet. Add one here once `canonicalUrl` is filled in
 * (see src/config/site.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
