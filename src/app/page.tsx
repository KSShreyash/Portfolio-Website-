import { Navigation } from "@/components/layout/Navigation";
import { SkipLink } from "@/components/layout/SkipLink";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { SpellProvider } from "@/components/spells/SpellProvider";
import { SpellBook } from "@/components/spells/SpellBook";
import { LumosGlow } from "@/components/spells/LumosGlow";

export default function Home() {
  return (
    <SpellProvider>
      <SkipLink />
      <Navigation />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <AchievementsSection />
        <ContactSection />
      </main>
      <Footer />
      <LumosGlow />
      <SpellBook />
    </SpellProvider>
  );
}
