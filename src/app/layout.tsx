import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import { SplashScreen } from "@/components/splash/SplashScreen";
import "./globals.css";

/*
 * Self-hosted rather than `next/font/google`.
 *
 * The Google loader downloads font files during the build, which makes the
 * build depend on the network — and that is exactly what broke the first
 * Cloudflare Pages deploy, with twelve unresolvable-module errors on
 * JetBrains Mono inside Turbopack. The files now live in ./fonts, so builds
 * are deterministic, offline, and faster. Re-run scripts/fetch_fonts.py only
 * when the typefaces change.
 *
 * Each of these is a single variable woff2 covering its whole weight range,
 * Latin subset only.
 */
const cinzel = localFont({
  src: "./fonts/cinzel.woff2",
  variable: "--font-cinzel",
  weight: "400 600",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond.woff2", weight: "400 600", style: "normal" },
    {
      path: "./fonts/cormorant-garamond-italic.woff2",
      weight: "400 500",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter.woff2",
  variable: "--font-inter",
  weight: "400 700",
  display: "swap",
});

const jetbrains = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kumar Shreyash | Software Developer & AI Systems Builder",
  description:
    "Kumar Shreyash builds AI agents and full-stack systems, and writes C/C++ machine-learning primitives for hardware too small for a framework. Selected work, experience and contact.",
  applicationName: "Kumar Shreyash",
  authors: [{ name: "Kumar Shreyash", url: siteConfig.githubUrl }],
  creator: "Kumar Shreyash",
  keywords: [
    "Kumar Shreyash",
    "software developer",
    "AI systems",
    "AI agents",
    "full-stack",
    "FastAPI",
    "Next.js",
    "C++",
    "machine learning",
  ],
  // No `metadataBase` or canonical URL until there is a real production
  // domain — inventing one breaks every social card that resolves it.
  // Set it here and in src/config/site.ts when the site is deployed.
  openGraph: {
    type: "website",
    title: "Kumar Shreyash — Software Developer & AI Systems Builder",
    description:
      "AI agents, full-stack systems, and C/C++ machine-learning primitives for embedded hardware.",
    siteName: "Kumar Shreyash",
    locale: "en",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Kumar Shreyash — Software Developer & AI Systems Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kumar Shreyash — Software Developer & AI Systems Builder",
    description:
      "AI agents, full-stack systems, and C/C++ machine-learning primitives for embedded hardware.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/*
          Runs before first paint. Scroll-reveal elements are hidden by a CSS
          rule scoped to `.motion-ready`, so if this script never executes —
          JavaScript disabled, or the reader prefers reduced motion — every
          section stays visible exactly as the server rendered it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;" +
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)" +
              "d.classList.add('motion-ready');" +
              "d.dataset.splash='running';" +
              "d.dataset.quote=String(Math.floor(Math.random()*3))}catch(e){}",
          }}
        />
      </head>
      <body className="grain antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
