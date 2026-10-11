import type { SiteConfig } from "@/lib/types";

/**
 * Everything the site says about its owner, in one place.
 *
 * Every value here is taken from Kumar Shreyash's résumé or his GitHub profile.
 * If you change the résumé, change this file — no component holds personal
 * details of its own.
 */
export const siteConfig: SiteConfig = {
  name: "Kumar Shreyash",
  headline: "Software Developer & AI Systems Builder",
  supportingHeadline: "Building intelligent things.",
  eyebrow: "SOFTWARE DEVELOPER · AI ENTHUSIAST",
  tagline: "Built with curiosity, precision, and a little magic.",
  intro:
    "I build software, explore AI systems, and turn ideas into thoughtful digital experiences.",
  location: "Delhi, India",

  // From the résumé and the GitHub profile README, which agree on this address.
  email: "kumarshreyash2504@gmail.com",
  githubUrl: "https://github.com/KSShreyash",
  linkedinUrl: "https://www.linkedin.com/in/kumarshreyash25",
  resumePath: "/resume/Kumar-Shreyash-Resume.pdf",

  nav: [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "achievements", label: "Achievements" },
    { id: "contact", label: "Contact" },
  ],
};

/**
 * The résumé carries a phone number. It is deliberately not published — a
 * public portfolio is a scraping target. Uncomment and render it from the
 * contact section if you want it visible:
 *
 *   export const phone = "+91 7970406579";
 */

/**
 * Set this once the site has a real domain, then pass it to `metadataBase`
 * in src/app/layout.tsx and add a canonical link. Until then the metadata
 * stays host-relative, because inventing a URL would break every social card.
 *
 *   export const canonicalUrl = "https://your-real-domain";
 */
