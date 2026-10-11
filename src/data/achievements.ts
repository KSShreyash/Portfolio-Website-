import type { Achievement } from "@/lib/types";

/**
 * The highlights.
 *
 * Important: the résumé has no awards, certifications or publications section,
 * so none is claimed here. Every entry below restates something already on the
 * résumé or in a repository in this workspace — academic standing, a research
 * placement, a benchmark that was actually run, a team that was actually led.
 *
 * To add a real certificate, hackathon result or publication later, append an
 * object in the shape shown in the commented template at the bottom. Nothing in
 * the components needs to change.
 */
export const achievements: Achievement[] = [
  {
    id: "prism-placement",
    headline: "Research placement with Samsung R&D Institute India",
    year: "2025–2026",
    body: "Spent ten months on Samsung PRISM with SRI-B, writing C and C++ propagation layers for deep learning models on devices too small for a standard ML framework.",
    issuer: "Samsung PRISM · SRI-B",
  },
  {
    id: "tensorflow-parity",
    headline: "C++ ML primitives validated against TensorFlow",
    year: "2026",
    body: "Model outputs and trained weights were checked against TensorFlow reference implementations and held within the defined precision benchmarks, with latency and code size measured against the same baselines.",
    issuer: "Samsung PRISM",
  },
  {
    id: "cgpa",
    headline: "CGPA 8.79 in Computer Science",
    year: "2023–2027",
    body: "Four semesters of coursework across data structures, operating systems, computer networks and machine learning, alongside two concurrent internships.",
    issuer: "Vellore Institute of Technology",
  },
  {
    id: "technical-lead",
    headline: "Technical Lead of a 15-plus member team",
    year: "2024–2026",
    body: "Ran the technical side of Sangam Club at VIT Chennai for two years, delivering software for club events to fixed external deadlines.",
    issuer: "Sangam Club, VIT Chennai",
  },
  {
    id: "treasure-hunt-scale",
    headline: "Real-time event platform run for 300+ participants",
    year: "2025",
    body: "A React and Supabase treasure hunt with live QR verification, built and operated for a campus event at a scale where a dropped scan is a visible failure.",
    issuer: "Sangam Club, VIT Chennai",
  },
  {
    id: "assistant-shipped",
    headline: "AI Workspace Assistant shipped to a live deployment",
    year: "2026",
    body: "Three independently hosted pieces — a static Next.js frontend, a FastAPI backend and Supabase Postgres — joined by Microsoft Graph and an LLM extraction pipeline, with a scheduled sync running every fifteen minutes.",
  },
];

/**
 * Template for a real credential, once there is one to add:
 *
 *   {
 *     id: "some-stable-id",
 *     headline: "What it was",
 *     year: "2026",
 *     body: "One or two sentences on what it involved.",
 *     issuer: "Who awarded it",
 *     evidenceUrl: "https://link-to-the-certificate",
 *   }
 *
 * `issuer` and `evidenceUrl` are optional; omit them rather than leaving them
 * empty, and the UI will render nothing in their place.
 */
