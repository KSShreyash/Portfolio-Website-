import Image from "next/image";
import { achievements } from "@/data/achievements";
import { BLUR } from "@/lib/blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The Highlights.
 *
 * Set as a broadsheet — ruled columns, no cards — because that is what the
 * material is. The artwork's own "Daily Prophet" masthead was cropped out
 * during extraction; this section sets its own in HTML.
 *
 * Every entry restates something from the résumé or a repository. The résumé
 * has no awards or certifications section, so none is claimed.
 */
export function AchievementsSection() {
  return (
    <section id="achievements" className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 aspect-[1500/409] min-h-[16rem] w-full">
        <Image
          src="/images/portfolio/daily-prophet-achievements.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.dailyProphetAchievements}
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-obsidian) 0%, color-mix(in srgb, var(--color-obsidian) 58%, transparent) 26%, color-mix(in srgb, var(--color-obsidian) 86%, transparent) 64%, var(--color-obsidian) 100%)",
          }}
        />
      </div>

      <div className="folio section-pad relative z-10">
        <SectionHeading
          eyebrow="FROM THE RECORD"
          title="The Highlights"
          subtitle="Milestones, recognition, and work worth sharing."
        />

        <div className="mt-14 border-t border-gold/25 pt-2">
          <div className="border-t border-gold/15 pt-10">
            <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((item, i) => (
                <Reveal key={item.id} delay={i * 70}>
                  <article className="group h-full border-l border-gold/15 pl-6 transition-colors duration-500 hover:border-gold/60">
                    <p className="font-mono text-[0.7rem] tracking-[0.12em] text-gold/80">
                      {item.year}
                    </p>

                    <h3 className="mt-3 font-editorial text-[1.4375rem] leading-tight font-medium text-parchment">
                      {item.headline}
                    </h3>

                    <p className="measure-serif mt-3 text-[1.0625rem] text-muted">
                      {item.body}
                    </p>

                    {item.issuer && (
                      <p className="mt-4 font-mono text-[0.68rem] tracking-[0.08em] text-muted/60 uppercase">
                        {item.issuer}
                      </p>
                    )}

                    {item.evidenceUrl && (
                      <a
                        href={item.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-[0.8125rem] text-gold-light underline underline-offset-2"
                      >
                        See the record
                      </a>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
