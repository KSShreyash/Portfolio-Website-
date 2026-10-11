"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Monogram } from "@/components/ui/Monogram";
import { MagicalButton } from "@/components/ui/MagicalButton";

const SECTION_IDS = ["home", ...siteConfig.nav.map((n) => n.id)];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* The header turns from transparent to smoked glass once the hero is behind
     the reader. One boolean, one passive listener. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Active section. An observer with a narrow middle band beats scroll maths:
     whichever section crosses the centre of the viewport wins. */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  /* Drawer behaviour: Escape closes, Tab stays inside, the page behind does
     not scroll, and focus comes back to the button that opened it. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-gold/15 bg-obsidian/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="folio flex h-[var(--header-h)] items-center justify-between gap-6">
        <a
          href="#home"
          className="flex items-center gap-3 text-parchment"
          aria-label={`${siteConfig.name} — back to top`}
        >
          <Monogram size={40} decorative />
          <span className="hidden font-display text-[0.9rem] tracking-[0.22em] sm:inline">
            KUMAR SHREYASH
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <ul className="hidden items-center lg:flex">
            {siteConfig.nav.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative px-4 py-2 text-[0.875rem] tracking-[0.04em] transition-colors duration-300",
                      "after:absolute after:inset-x-4 after:bottom-0 after:h-px after:origin-left",
                      "after:scale-x-0 after:bg-gold after:transition-transform after:duration-300",
                      "hover:text-gold-light hover:after:scale-x-100",
                      isActive
                        ? "text-gold-light after:scale-x-100"
                        : "text-muted",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="ml-2 hidden lg:block">
            <MagicalButton
              href={siteConfig.resumePath}
              variant="ghost"
              download
              className="px-5 py-2 text-[0.8125rem]"
            >
              Resume
            </MagicalButton>
          </div>

          {/* Mobile menu. The panel lives in the same nav so its links are
              part of the primary navigation for assistive technology. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-[var(--radius-panel)] border border-gold/30 p-2.5 text-parchment transition-colors hover:border-gold/70 hover:text-gold-light lg:hidden"
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                id={panelId}
                ref={panelRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                className="fixed inset-x-0 top-[var(--header-h)] z-40 border-y border-gold/15 bg-obsidian/97 backdrop-blur-xl lg:hidden"
              >
                <ul className="folio flex flex-col py-4">
                  {siteConfig.nav.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setOpen(false)}
                        aria-current={active === item.id ? "true" : undefined}
                        className={cn(
                          "block border-b border-gold/10 py-3.5 font-display text-[1.0625rem] tracking-[0.1em] transition-colors",
                          active === item.id ? "text-gold-light" : "text-parchment/85",
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="folio flex items-center gap-3 pb-6">
                  <MagicalButton
                    href={siteConfig.resumePath}
                    download
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Download Resume
                  </MagicalButton>
                  <a
                    href={siteConfig.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="rounded-[var(--radius-panel)] border border-gold/25 p-3 text-parchment hover:text-gold-light"
                  >
                    <GithubIcon size={18} />
                  </a>
                  <a
                    href={siteConfig.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="rounded-[var(--radius-panel)] border border-gold/25 p-3 text-parchment hover:text-gold-light"
                  >
                    <LinkedinIcon size={18} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}
