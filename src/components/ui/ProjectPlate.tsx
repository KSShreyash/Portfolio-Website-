import type { GlyphKind } from "@/lib/types";

/**
 * A plate for each grimoire entry.
 *
 * There are no screenshots of these projects, and a stock mockup would be a
 * decorative lie. Instead each plate draws that project's actual architecture,
 * taken from its README — which is more use to an engineer reading this page
 * than a picture of a dashboard would be.
 */

const NODE = {
  fill: "color-mix(in srgb, var(--color-deep-blue) 85%, transparent)",
  stroke: "color-mix(in srgb, var(--color-gold) 48%, transparent)",
};
const LINE = "color-mix(in srgb, var(--color-gold) 38%, transparent)";
const LABEL = "color-mix(in srgb, var(--color-parchment) 78%, transparent)";

function Node({
  x,
  y,
  w = 92,
  h = 30,
  label,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill={NODE.fill}
        stroke={NODE.stroke}
        strokeWidth="1"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 3.5}
        textAnchor="middle"
        fill={LABEL}
        fontFamily="var(--font-mono), monospace"
        fontSize="10"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return (
    <path
      d={d}
      stroke={LINE}
      strokeWidth="1"
      fill="none"
      markerEnd="url(#plate-arrow)"
    />
  );
}

const GLYPHS: Record<GlyphKind, React.ReactNode> = {
  // AI Workspace Assistant — the three-tier split from its README.
  graph: (
    <>
      <Node x={14} y={28} label="browser" />
      <Node x={114} y={28} label="fastapi" />
      <Node x={214} y={28} label="postgres" />
      <Arrow d="M106 43 H112" />
      <Arrow d="M206 43 H212" />
      <Arrow d="M152 58 V86" />
      <Arrow d="M176 58 Q 200 72 214 86" />
      <Node x={106} y={88} w={82} label="ms graph" />
      <Node x={196} y={88} w={82} label="openai" />
      <text
        x={160}
        y={132}
        textAnchor="middle"
        fill={LINE}
        fontFamily="var(--font-mono), monospace"
        fontSize="9"
        letterSpacing="1"
      >
        sync every 15 min
      </text>
    </>
  ),

  // Problem Tracking Agent — the adaptive loop, then classification.
  agent: (
    <>
      <Node x={100} y={20} w={120} label="interview turn" />
      <path
        d="M100 35 q -34 0 -34 22 q 0 22 34 22"
        stroke={LINE}
        strokeWidth="1"
        fill="none"
        markerEnd="url(#plate-arrow)"
      />
      <text
        x={30}
        y={62}
        fill={LINE}
        fontFamily="var(--font-mono), monospace"
        fontSize="9"
      >
        adapts
      </text>
      <Arrow d="M160 50 V72" />
      <Node x={110} y={74} w={100} label="classify" />
      <Arrow d="M160 104 V124" />
      <Node x={100} y={126} w={120} label="report" />
    </>
  ),

  // LSTM — one cell: three gates writing to a carried cell state.
  matrix: (
    <>
      <path d="M20 44 H300" stroke={LINE} strokeWidth="1" fill="none" />
      <text
        x={304}
        y={47}
        fill={LINE}
        fontFamily="var(--font-mono), monospace"
        fontSize="10"
      >
        c
      </text>
      {[
        { x: 80, g: "f" },
        { x: 160, g: "i" },
        { x: 240, g: "o" },
      ].map(({ x, g }) => (
        <g key={g}>
          <circle
            cx={x}
            cy={44}
            r="13"
            fill={NODE.fill}
            stroke={NODE.stroke}
            strokeWidth="1"
          />
          <text
            x={x}
            y={48}
            textAnchor="middle"
            fill={LABEL}
            fontFamily="var(--font-mono), monospace"
            fontSize="11"
          >
            {g}
          </text>
          <path
            d={`M${x} 92 V 60`}
            stroke={LINE}
            strokeWidth="1"
            fill="none"
            markerEnd="url(#plate-arrow)"
          />
        </g>
      ))}
      <Node x={60} y={94} w={200} h={28} label="h(t-1) · x(t)" />
      <text
        x={160}
        y={146}
        textAnchor="middle"
        fill={LINE}
        fontFamily="var(--font-mono), monospace"
        fontSize="9"
        letterSpacing="1"
      >
        backprop through time, by hand
      </text>
    </>
  ),

  // Treasure hunt — scan, verify, broadcast.
  route: (
    <>
      <g>
        <rect
          x={22}
          y={30}
          width={48}
          height={48}
          rx="3"
          fill="none"
          stroke={NODE.stroke}
          strokeWidth="1"
        />
        {[
          [29, 37],
          [55, 37],
          [29, 63],
        ].map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={8}
            height={8}
            fill={LINE}
          />
        ))}
        <rect x={48} y={56} width={6} height={6} fill={LINE} />
        <rect x={58} y={66} width={6} height={6} fill={LINE} />
      </g>
      <Arrow d="M74 54 H108" />
      <Node x={110} y={39} label="verify" />
      <Arrow d="M204 54 H238" />
      <Node x={240} y={39} w={66} label="live" />
      <text
        x={160}
        y={112}
        textAnchor="middle"
        fill={LINE}
        fontFamily="var(--font-mono), monospace"
        fontSize="9"
        letterSpacing="1"
      >
        300+ participants, realtime
      </text>
    </>
  ),
};

interface ProjectPlateProps {
  kind: GlyphKind;
  className?: string;
}

export function ProjectPlate({ kind, className }: ProjectPlateProps) {
  return (
    <svg
      viewBox="0 0 320 160"
      className={className}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker
          id="plate-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 1 L7 4 L0 7 z" fill={LINE} />
        </marker>
      </defs>
      {GLYPHS[kind]}
    </svg>
  );
}
