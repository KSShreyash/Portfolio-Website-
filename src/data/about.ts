import type { AboutSubsection } from "@/lib/types";

/**
 * The letter.
 *
 * Education is straight off the résumé. Interests and learning goals come from
 * the GitHub profile README's own "currently brewing" list. The engineering
 * note describes how the repositories in this portfolio are actually written —
 * strict layering, and a README with a "known limitations" section in it.
 */
export const aboutSubsections: AboutSubsection[] = [
  {
    title: "Education",
    body: "B.Tech in Computer Science at Vellore Institute of Technology, Aug 2023 – Jul 2027, with a CGPA of 8.79 — taken alongside a research internship with Samsung and a software internship at Yolex Labs.",
  },
  {
    title: "What I'm drawn to",
    body: "Systems you can see all the way down: AI agents that finish the task rather than describe it, backend architecture with boundaries you can point at, and the parts of machine learning that only make sense once you've implemented the backward pass yourself.",
  },
  {
    title: "How I build",
    body: "Layer strictly and keep each layer honest — routers parse, services decide, repositories hold the SQL. Measure instead of guessing; the C++ work at Samsung was only finished once it was benchmarked against TensorFlow for accuracy, latency and code size. And write down what a thing does not do yet, because a README that only lists features is marketing.",
  },
  {
    title: "Currently brewing",
    body: "AI agents that actually finish the task, deep learning in C++ with no frameworks underneath, and data structures and algorithms on a timer.",
  },
];
