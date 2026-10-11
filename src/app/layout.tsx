import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { SplashScreen } from "@/components/splash/SplashScreen";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
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
