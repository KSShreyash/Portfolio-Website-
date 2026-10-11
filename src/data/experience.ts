import type { ExperienceEntry } from "@/lib/types";

/**
 * The journey, most recent first.
 *
 * Dates, organisations and responsibilities are taken verbatim in substance
 * from the résumé. `start` and `end` are sortable `YYYY-MM`; `dateRange` is
 * what the visitor reads.
 */
export const experience: ExperienceEntry[] = [
  {
    id: "yolex-labs",
    organisation: "Yolex Labs",
    role: "Software Development Intern",
    location: "Singapore (Remote)",
    start: "2026-06",
    end: "2026-10",
    dateRange: "Jun 2026 – Oct 2026",
    summary:
      "Built AI agents for organizational workflow analysis and task automation, with context-aware detection of operational bottlenecks.",
    responsibilities: [
      "Worked with a distributed remote team to ship platform improvements, owning assigned development tasks from implementation through testing.",
      "Shipped bulk résumé upload, parsing CVs into structured candidate profiles for assessment invitations.",
      "Resolved a duplicate-record bug that created a new position instead of updating the existing one when navigating back from a generated brief.",
      "Built the interview-round configuration admin panel for Candoor, an anonymous interview platform, letting admins define and sequence rounds — and redesigned its UI/UX.",
    ],
    technologies: ["Python", "FastAPI", "MongoDB", "OpenAI", "JavaScript"],
    kind: "work",
  },

  {
    id: "samsung-prism",
    organisation: "Samsung PRISM",
    role: "Research Intern",
    location: "Samsung R&D Institute India – Bangalore (Remote)",
    start: "2025-08",
    end: "2026-05",
    dateRange: "Aug 2025 – May 2026",
    summary:
      "Implemented C/C++ forward and backward propagation layers for deep learning models targeting resource-constrained embedded devices, where standard ML frameworks are not viable.",
    responsibilities: [
      "Validated numerical accuracy of model outputs and trained weights against TensorFlow reference implementations, within defined precision benchmarks.",
      "Built a modular, reusable C++ class framework abstracting low-level operations into higher-level ML primitives.",
      "Benchmarked that framework for latency and code size against TensorFlow baselines.",
    ],
    technologies: ["C", "C++", "TensorFlow", "Embedded Systems"],
    kind: "work",
  },

  {
    id: "sangam-club",
    organisation: "Sangam Club, VIT Chennai",
    role: "Technical Lead",
    location: "Chennai, India",
    start: "2024-04",
    end: "2026-05",
    dateRange: "Apr 2024 – May 2026",
    summary:
      "Led the technical side of a student body, shipping event software under deadlines set by people who do not care how hard the deadline is.",
    responsibilities: [
      "Built a React and Supabase treasure-hunt application with real-time QR verification, run for more than 300 users.",
      "Led a team of 15+ members delivering technology-driven club events.",
    ],
    technologies: ["React", "Supabase", "PostgreSQL"],
    kind: "leadership",
  },

  {
    id: "vit",
    organisation: "Vellore Institute of Technology",
    role: "B.Tech, Computer Science",
    location: "India",
    start: "2023-08",
    end: "2027-07",
    dateRange: "Aug 2023 – Jul 2027",
    summary: "Bachelor of Technology in Computer Science. CGPA 8.79.",
    responsibilities: [
      "Coursework across data structures and algorithms, operating systems, computer networks, object-oriented programming and machine learning.",
    ],
    technologies: ["C", "C++", "Java", "Python"],
    kind: "education",
  },
];
