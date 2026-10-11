import Image from "next/image";
import { Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BLUR } from "@/lib/blur";
import { ContactForm } from "@/components/ui/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

/**
 * Owl Post.
 *
 * The owl holds the left of the frame and the panel sits to the right, so the
 * form never lands on the one part of the painting with a subject in it.
 */
export function ContactSection() {
  return (
    <section id="contact" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/portfolio/owl-post-contact.webp"
          alt=""
          fill
          sizes="100vw"
          quality={88}
          placeholder="blur"
          blurDataURL={BLUR.owlPostContact}
          className="contact-image object-cover"
        />
      </div>

      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(255deg, color-mix(in srgb, var(--color-obsidian) 92%, transparent) 0%, color-mix(in srgb, var(--color-obsidian) 72%, transparent) 42%, color-mix(in srgb, var(--color-obsidian) 38%, transparent) 78%, color-mix(in srgb, var(--color-obsidian) 55%, transparent) 100%)",
        }}
      />
      <div
        className="backdrop-layer -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-obsidian) 0%, transparent 18%, transparent 82%, var(--color-obsidian) 100%)",
        }}
      />

      <div className="folio section-pad relative z-10">
        <div className="ml-auto w-full lg:max-w-[38rem] xl:max-w-[42rem]">
          <Reveal>
            <div className="surface-dark p-7 sm:p-10">
              <p className="meta">OWL POST</p>

              <h2 className="mt-4 text-display-md text-parchment">
                Let&rsquo;s Build Something Meaningful
              </h2>

              <hr className="rule-gold mt-5 w-40" />

              <p className="measure mt-5 text-muted">
                Have an interesting idea, engineering challenge, or opportunity?
                I&rsquo;d love to hear from you.
              </p>

              <ContactForm />

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-gold/15 pt-6 text-[0.875rem]">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-light"
                >
                  <Mail size={15} aria-hidden />
                  {siteConfig.email}
                </a>
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-light"
                >
                  <GithubIcon size={15} />
                  GitHub
                </a>
                <a
                  href={siteConfig.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-light"
                >
                  <LinkedinIcon size={15} />
                  LinkedIn
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
