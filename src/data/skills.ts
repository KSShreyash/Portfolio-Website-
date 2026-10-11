import type { SkillCollection } from "@/lib/types";

/**
 * Four collections. The names are decorative labels for this site — they are
 * not houses, and they carry no franchise meaning.
 *
 * Every entry is either listed on the résumé, used in a repository in this
 * workspace, or named on the GitHub profile README. Nothing here is aspirational,
 * and there are deliberately no percentages: a bar chart of "React 80%" tells a
 * recruiter nothing true.
 */
export const skills: SkillCollection[] = [
  {
    id: "forge",
    name: "The Forge",
    tagline: "Languages, and the habit of reading a problem down to the metal.",
    emblem: "forge",
    accent: "#8C5A3C",
    primary: ["C", "C++", "Python", "Java", "JavaScript", "TypeScript"],
    more: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming",
      "Operating Systems",
      "Computer Networks",
    ],
    relatedProjectSlugs: ["lstm-from-scratch"],
  },

  {
    id: "thinkery",
    name: "The Thinkery",
    tagline: "Machine learning, language models, and agents that finish the task.",
    emblem: "thinkery",
    accent: "#2F5A6B",
    primary: ["Machine Learning", "AI Agents", "OpenAI GPT-4o", "LLM APIs"],
    more: [
      "Structured extraction (JSON Schema)",
      "Whisper speech-to-text",
      "Text-to-speech",
      "Model integration",
    ],
    relatedProjectSlugs: [
      "ai-workspace-assistant",
      "problem-tracking-agent",
      "lstm-from-scratch",
    ],
  },

  {
    id: "observatory",
    name: "The Observatory",
    tagline: "Interfaces, services, and the APIs that join them.",
    emblem: "observatory",
    accent: "#3A5570",
    primary: ["React", "Next.js", "FastAPI", "Node.js", "REST APIs", "Tailwind CSS"],
    more: ["HTML", "CSS", "Express", "GSAP", "Microsoft Graph", "Google OAuth"],
    relatedProjectSlugs: [
      "ai-workspace-assistant",
      "problem-tracking-agent",
      "treasure-hunt",
    ],
  },

  {
    id: "archives",
    name: "The Archives",
    tagline: "Where the data rests, and the tools that keep it honest.",
    emblem: "archives",
    accent: "#3F5245",
    primary: ["PostgreSQL", "Supabase", "MongoDB", "SQL", "Git"],
    more: ["Docker", "Linux", "GitHub", "Vitest", "pytest", "VS Code", "Claude Code"],
    relatedProjectSlugs: [
      "ai-workspace-assistant",
      "problem-tracking-agent",
      "treasure-hunt",
    ],
  },
];
