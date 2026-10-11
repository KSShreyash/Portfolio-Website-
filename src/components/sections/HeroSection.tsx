import Image from "next/image";
import { siteConfig } from "@/config/site";
import { BLUR } from "@/lib/blur";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { RevelioOverlay } from "@/components/spells/RevelioOverlay";

/**
 * The Great Hall.
 *
 * The artwork is a painted matte: 561px at source, upscaled, and deliberately
 * left soft under two gradient layers. Everything crisp on this screen — the
 * name, the rule, the particles — is drawn by the browser on top of it.
 *
 * The image covers the upper part of the viewport and dissolves into obsidian
 * at the bottom, which both reduces the upscale factor and gives the Home →
 * About transition its first step.
 */
export function HeroSection() {
  return (
    <section
      id="home"
      data-hero
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* Hidden one layer behind the castle. Nothing reveals it except the
          Revelio spell, which paints it back in under the cursor. */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <Image
          src="/images/portfolio/wizard-scroll.webp"
          alt=""
          fill
          sizes="100vw"
          quality={75}
          placeholder="blur"
          blurDataURL={BLUR.wizardScroll}
          className="object-cover object-center"
        />
      </div>

      {/*
        Overscanned by 24px on every side. The pointer parallax translates this
        layer by up to 12px, and at exactly `inset-0` that shift uncovers a
        strip of whatever sits behind it — here the warm scroll at -z-30, which
        showed as an orange band down the edge of the hero.
      */}
      <div data-hero-bg className="absolute -inset-6 -z-20 will-change-transform">
        <Image
          src="/images/portfolio/hogwarts-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.hogwartsHero}
          className="hero-image object-cover"
        />
      </div>

      {/* Left-to-right navy wash: dark enough to read against, clearing before
          it reaches the castle. */}
      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(100deg, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-obsidian) 93%, transparent) 20%, color-mix(in srgb, var(--color-obsidian) 58%, transparent) 46%, transparent 76%)",
        }}
      />

      {/* Vertical shaping: a little weight under the header, and a full fade to
          obsidian across the bottom quarter. */}
      <div
        data-hero-fog
        className="backdrop-layer -inset-3 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-obsidian) 72%, transparent) 0%, transparent 22%, transparent 52%, color-mix(in srgb, var(--color-obsidian) 70%, transparent) 84%, var(--color-obsidian) 100%)",
        }}
      />

      <HeroMotion />
      <RevelioOverlay />

      <div className="folio relative z-10 w-full pt-[var(--header-h)] pb-28">
        <div className="w-[min(100%,clamp(20rem,46vw,38.75rem))]">
          <p data-hero-eyebrow className="meta mb-6">
            {siteConfig.eyebrow}
          </p>

          {/* The inner span is the mask: the h1 clips, the span slides up
              inside it. One line reveal, no text-splitting plugin. */}
          <h1
            data-hero-title
            className="overflow-hidden pb-[0.1em] text-display-xl text-warm-white"
          >
            <span
              data-hero-title-inner
              className="block"
              style={{ textShadow: "0 2px 30px rgb(0 0 0 / 0.55)" }}
            >
              {siteConfig.name}
            </span>
          </h1>

          <hr data-hero-rule className="rule-gold mt-7 w-44 origin-left" />

          <p
            data-hero-support
            className="mt-7 font-editorial text-[clamp(1.375rem,2.4vw,1.875rem)] leading-snug text-parchment"
          >
            {siteConfig.supportingHeadline}
          </p>

          <p data-hero-body className="measure mt-5 text-[1.0625rem] text-muted">
            {siteConfig.intro}
          </p>

          <div
            data-hero-actions
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagicalButton href="#projects">Explore My Work</MagicalButton>
            <MagicalButton
              href={siteConfig.resumePath}
              variant="ghost"
              download
            >
              Download Resume
            </MagicalButton>

            <span
              aria-hidden
              className="mx-1 hidden h-6 w-px bg-gold/25 sm:block"
            />

            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="p-2 text-muted transition-colors hover:text-gold-light"
            >
              <GithubIcon size={20} />
            </a>
            <a
              href={siteConfig.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="p-2 text-muted transition-colors hover:text-gold-light"
            >
              <LinkedinIcon size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue, centred at the foot of the hero. The content above it
          reserves `pb-28`, so it cannot collide with the buttons on a short
          viewport the way a purely absolute cue does. */}
      <div
        data-hero-cue
        className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2"
      >
        <span className="meta text-muted/80">Scroll</span>
        <span className="hero-cue-line block h-9 w-px bg-linear-to-b from-gold/70 to-transparent" />
      </div>
    </section>
  );
}
