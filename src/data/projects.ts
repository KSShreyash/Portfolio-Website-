import type { Project } from "@/lib/types";

/**
 * Selected work.
 *
 * Every field below is taken from the project's own repository README or from
 * the résumé. Where no public URL could be verified, the link is omitted
 * entirely rather than guessed — the UI renders nothing for a missing field.
 *
 * To add a project, append an object here. No component needs editing.
 */
export const projects: Project[] = [
  {
    id: "ai-workspace-assistant",
    slug: "ai-workspace-assistant",
    title: "AI Workspace Assistant",
    category: "AI · Productivity · Full-Stack",
    description:
      "Reads your Outlook mail, calendar and Teams chats, works out who you deal with and what you owe them, and books the follow-up meeting on your calendar.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "FastAPI",
      "Python",
      "Supabase",
      "PostgreSQL",
      "Microsoft Graph",
      "OpenAI",
    ],
    glyph: "graph",
    glyphAlt:
      "A diagram: the browser talks to a FastAPI backend, which reads and writes Postgres and calls out to Microsoft Graph and OpenAI.",
    featured: true,
    status: "live",
    githubUrl: "https://github.com/KSShreyash/AI-Relationship-Manager",
    liveUrl: "https://ai-relationship-manager.pages.dev",
    liveNote: "Sign in with a Microsoft account is required.",
    caseStudy: {
      overview:
        "An assistant for a Microsoft 365 account. You sign in with Microsoft and it pulls your recent emails, calendar events and Teams messages, then uses an LLM to turn those raw messages into two structured things: contacts, each with a synthesised summary that is rewritten as new information arrives, and action items, tagged as yours or theirs with an optional due date.",
      problem:
        "Commitments made in conversation do not survive the conversation. A promise buried in the fourth paragraph of an email thread is invisible by the following week, and the context you need about a person is spread across months of messages in three different apps.",
      architecture: [
        "Three independently hosted pieces: a statically exported Next.js frontend on Cloudflare Pages, a FastAPI backend on Render, and Postgres hosted by Supabase.",
        "Two token types that never mix. A Supabase JWT proves to the backend that a logged-in user sent the request; a Microsoft Graph access/refresh pair proves the backend may read one specific mailbox.",
        "Graph tokens are stored server-side, encrypted with Fernet before they touch Postgres, and never returned to the browser after login.",
        "Strict layering: routers parse and serialise, services hold logic, repositories hold every line of SQL. No SQL in a service, no HTTP in a repository, and every query filters by user id.",
      ],
      decisions: [
        {
          title: "Static export for the frontend",
          body: "The UI ships as plain files on a CDN. All business logic and database access live in the backend, so the frontend has no server to keep warm and no secrets to leak.",
        },
        {
          title: "Strict JSON Schema for extraction",
          body: "The LLM is asked for structured output against a strict schema rather than free text that then has to be parsed. Extraction either validates or fails loudly instead of producing plausible-looking garbage.",
        },
        {
          title: "Encryption at rest for Graph tokens",
          body: "A leaked database should not hand over mailboxes. Fernet encryption means the row alone is useless without the key held by the backend.",
        },
        {
          title: "Cron over a queue",
          body: "A GitHub Actions schedule calls one bulk-sync endpoint every fifteen minutes. At current scale that is simpler and cheaper than running a worker, and the tradeoff is recorded rather than hidden.",
        },
      ],
      implementation: [
        "Four screens: a dashboard with connection status and manual sync triggers, a searchable contacts table, a planner that buckets action items by due date, and a combined search across people and tasks.",
        "Scheduling: from an action item, the app suggests free thirty-minute slots and books the meeting on Microsoft Calendar, optionally as a Teams meeting.",
        "Token refresh through MSAL, redeeming the stored refresh token for a new Graph access token.",
        "Tested with Vitest and React Testing Library on the frontend, and pytest with respx on the backend so outbound calls to Graph and OpenAI are mocked rather than live.",
      ],
      limitations: [
        "Teams-only contacts key on display name, so two people sharing one would merge into a single contact.",
        "Email extraction considers only the sender, so people you email without a reply never become contacts.",
        "Timezone is never populated, so suggested slots are 9–5 UTC rather than 9–5 local.",
        "There is no way to correct the AI — an item can be marked done, but not edited, rejected or reassigned.",
        "Bulk sync is sequential: one request iterates every connected user, which would need a real queue beyond current scale.",
        "The backend is on a free tier, so it spins down after about fifteen minutes idle and takes tens of seconds to wake.",
      ],
    },
  },

  {
    id: "problem-tracking-agent",
    slug: "problem-tracking-agent",
    title: "Problem Tracking Agent",
    category: "AI Agents · Full-Stack · Diagnostics",
    description:
      "A GPT-4o agent that interviews employees in natural conversation, adapts its questions as it goes, and turns what it hears into a structured report on where work breaks down.",
    technologies: [
      "Python",
      "FastAPI",
      "MongoDB",
      "OpenAI",
      "Whisper",
      "Google OAuth",
      "Google Calendar",
      "JavaScript",
    ],
    glyph: "agent",
    glyphAlt:
      "A diagram: an adaptive interview loop feeds a classifier, which produces one of three structured report types.",
    featured: false,
    status: "complete",
    githubUrl: "https://github.com/KSShreyash/AI-Agent-Deployed",
    caseStudy: {
      overview:
        "A full-stack platform where managers assign structured sessions to employees. An AI agent runs the session as a natural conversation, classifies what it hears into Work, Growth & Wellbeing, or Open Line, and produces a detailed structured report. Built during the internship at Yolex Labs.",
      problem:
        "Process problems surface as tickets long after they start costing time, and the people closest to them are the least likely to file one. A diagnostic has to meet them in conversation rather than in a form.",
      architecture: [
        "A FastAPI service handles OAuth, the chat loop, assignments, reports and manager analytics behind a single REST surface.",
        "MongoDB via the async Motor driver stores users, reports and assignments.",
        "External integrations: Google OAuth 2.0 for sign-in, the Google Calendar REST API for automatic events when a session is assigned, and OpenAI for chat, speech-to-text and text-to-speech.",
        "A deliberately framework-free frontend — three plain HTML/CSS/JS pages — with tldraw embedded for the live process visualiser.",
      ],
      decisions: [
        {
          title: "Adaptive questioning over a fixed script",
          body: "Each question is chosen in light of the previous answers, so the session follows the problem instead of marching through a questionnaire.",
        },
        {
          title: "Anonymity decided at the end",
          body: "The employee chooses whether to be named after they have seen what they said, not before they have said it.",
        },
        {
          title: "Pre-assignment by email",
          body: "A session can be assigned to someone who has not signed up yet, so onboarding never blocks the diagnostic.",
        },
      ],
      implementation: [
        "Voice input with Whisper transcription and spoken questions via text-to-speech.",
        "Manager dashboard for reports, assignments, members and analytics; a separate employee view for upcoming and completed sessions.",
        "Role-based access with JWT sessions signed HS256.",
        "A live process flowchart rendered during the session with tldraw.",
      ],
    },
  },

  {
    id: "lstm-from-scratch",
    slug: "lstm-from-scratch",
    title: "LSTM in Pure C++",
    category: "Systems · Machine Learning · C++",
    description:
      "A long short-term memory network written without a framework — gates, cell state and backpropagation through time all derived and implemented by hand.",
    technologies: ["C++", "Linear Algebra", "Backpropagation Through Time"],
    glyph: "matrix",
    glyphAlt:
      "A diagram of one LSTM cell: forget, input and output gates feeding a cell state that carries forward in time.",
    featured: false,
    status: "active",
    // No public repository URL is verifiable, so no link is rendered.
  },

  {
    id: "treasure-hunt",
    slug: "treasure-hunt",
    title: "Campus Treasure Hunt",
    category: "Full-Stack · Real-Time · Events",
    description:
      "A React and Supabase treasure-hunt platform with real-time QR verification, built for Sangam Club and run for more than 300 participants.",
    technologies: ["React", "Supabase", "PostgreSQL", "Real-Time", "QR"],
    glyph: "route",
    glyphAlt:
      "A diagram: a scanned QR code is verified against the database, which updates every team's progress in real time.",
    featured: false,
    status: "complete",
    // Built for a club event; no public repository URL is verifiable.
  },
];

export const featuredProject = projects.find((p) => p.featured)!;
export const otherProjects = projects.filter((p) => !p.featured);

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);
