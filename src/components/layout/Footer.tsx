import Image from "next/image";
import { Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BLUR } from "@/lib/blur";
import { Monogram } from "@/components/ui/Monogram";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { CurrentYear } from "@/components/layout/CurrentYear";

/**
 * The Enchanted Lake — the colophon.
 *
 * Shown at the artwork's own aspect so the boat, the lanterns and their
 * reflections all survive, with the type sitting on the still water to the
 * right of the hull.
 */
export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 aspect-[16/9] max-h-[34rem] min-h-[22rem] w-full">
        <Image
          src="/images/portfolio/enchanted-lake-footer.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.enchantedLakeFooter}
          className="object-cover object-[50%_62%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-obsidian) 55%, transparent) 30%, color-mix(in srgb, var(--color-midnight) 78%, transparent) 72%, var(--color-obsidian) 100%)",
          }}
        />
      </div>

      {/* The band is taller than the footer, so `overflow-hidden` clips its own
          top fade off and leaves a hard edge where the water appears. This
          scrim is measured against the footer box instead, so it always covers
          the join whatever the two heights work out to be. */}
      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-obsidian) 72%, transparent) 20%, transparent 46%)",
        }}
      />

      <div className="folio relative z-10 pt-28 pb-12 sm:pt-36">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a
              href="#home"
              className="inline-flex items-center gap-3 text-parchment"
              aria-label={`${siteConfig.name} — back to top`}
            >
              <Monogram size={46} decorative />
              <span className="font-display text-[0.95rem] tracking-[0.2em]">
                KUMAR SHREYASH
              </span>
            </a>

            <p className="mt-5 max-w-[34ch] font-editorial text-[1.1875rem] text-parchment/80 italic">
              {siteConfig.tagline}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:text-right">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
              {siteConfig.nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[0.875rem] text-muted transition-colors hover:text-gold-light"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3 lg:justify-end">
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="rounded-[var(--radius-panel)] border border-gold/22 p-2.5 text-muted transition-colors hover:border-gold/60 hover:text-gold-light"
              >
                <GithubIcon size={17} />
              </a>
              <a
                href={siteConfig.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="rounded-[var(--radius-panel)] border border-gold/22 p-2.5 text-muted transition-colors hover:border-gold/60 hover:text-gold-light"
              >
                <LinkedinIcon size={17} />
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label={`Email ${siteConfig.name}`}
                className="rounded-[var(--radius-panel)] border border-gold/22 p-2.5 text-muted transition-colors hover:border-gold/60 hover:text-gold-light"
              >
                <Mail size={17} aria-hidden />
              </a>
            </div>
          </nav>
        </div>

        <hr className="rule-gold mt-12" />

        <div className="mt-6 flex flex-col gap-2 text-[0.8125rem] text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}
          </p>
          <p className="font-mono text-[0.7rem] tracking-[0.08em]">
            {siteConfig.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
