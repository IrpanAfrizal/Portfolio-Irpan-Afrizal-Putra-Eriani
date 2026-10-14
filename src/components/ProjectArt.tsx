import type { ReactNode } from 'react';
import type { ProjectKind } from '../data/projects';

/** Ilustrasi otomatis untuk kartu project (dipakai selama belum ada screenshot asli). */

const LINE = '#2F9BFF';

const NODES: [number, number][] = [
  [160, 90], [100, 50], [220, 50], [90, 125], [230, 125], [160, 150], [55, 85], [265, 85], [160, 30],
];
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [2, 7], [1, 8], [2, 8], [3, 6], [4, 7], [3, 5], [4, 5],
];

/** Kubus isometrik (garis) untuk ilustrasi 3D. */
function Cube({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const w = 0.866 * s;
  const top = `${cx},${cy - s}`;
  const ur = `${cx + w},${cy - s / 2}`;
  const lr = `${cx + w},${cy + s / 2}`;
  const bottom = `${cx},${cy + s}`;
  const ll = `${cx - w},${cy + s / 2}`;
  const ul = `${cx - w},${cy - s / 2}`;

  return (
    <g strokeLinejoin="round">
      <polygon points={`${top} ${ur} ${cx},${cy} ${ul}`} fill="#12396B" stroke="none" />
      <polygon points={`${top} ${ur} ${lr} ${bottom} ${ll} ${ul}`} fill="none" stroke="#7FD8FF" strokeWidth="1.5" />
      <g stroke="#7FD8FF" strokeWidth="1.2" strokeOpacity="0.8">
        <line x1={cx} y1={cy} x2={cx - w} y2={cy - s / 2} />
        <line x1={cx} y1={cy} x2={cx + w} y2={cy - s / 2} />
        <line x1={cx} y1={cy} x2={cx} y2={cy + s} />
      </g>
    </g>
  );
}

const METHODS: [string, string, number][] = [
  ['GET', '#2F9BFF', 44],
  ['POST', '#3DDC84', 70],
  ['PATCH', '#F7B84B', 96],
  ['DEL', '#EE5C5C', 122],
];

const ART: Record<ProjectKind, ReactNode> = {
  ai: (
    <g>
      <g stroke={LINE} strokeWidth="1" strokeOpacity="0.6">
        {EDGES.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      <g fill="#7FD8FF">
        {NODES.map(([x, y], i) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={i === 0 ? 11 : 4} fillOpacity={i === 0 ? 0.9 : 0.85} />
        ))}
      </g>
      <circle cx="160" cy="90" r="22" fill="none" stroke="#7FD8FF" strokeOpacity="0.35" />
    </g>
  ),

  web: (
    <g fill="none" stroke={LINE} strokeOpacity="0.7">
      <rect x="55" y="26" width="210" height="130" rx="8" fill="#0A1A30" />
      <line x1="55" y1="46" x2="265" y2="46" />
      <g fill={LINE} stroke="none" fillOpacity="0.8">
        <circle cx="68" cy="36" r="3" />
        <circle cx="79" cy="36" r="3" />
        <circle cx="90" cy="36" r="3" />
      </g>
      <g fill="#12396B" stroke="none">
        <rect x="68" y="58" width="64" height="40" rx="4" />
        <rect x="140" y="58" width="64" height="40" rx="4" />
        <rect x="212" y="58" width="42" height="40" rx="4" />
      </g>
      <g stroke={LINE} strokeOpacity="0.5">
        <line x1="68" y1="112" x2="254" y2="112" />
        <line x1="68" y1="124" x2="220" y2="124" />
        <line x1="68" y1="136" x2="190" y2="136" />
      </g>
    </g>
  ),

  mobile: (
    <g fill="none" stroke={LINE} strokeOpacity="0.75">
      <rect x="92" y="20" width="64" height="138" rx="11" fill="#0A1A30" />
      <rect x="168" y="34" width="64" height="138" rx="11" fill="#0A1A30" />
      <g fill="#12396B" stroke="none">
        <rect x="100" y="36" width="48" height="30" rx="4" />
        <rect x="100" y="74" width="48" height="12" rx="3" />
        <rect x="100" y="92" width="48" height="12" rx="3" />
        <rect x="176" y="50" width="48" height="30" rx="4" />
        <rect x="176" y="88" width="48" height="12" rx="3" />
        <rect x="176" y="106" width="48" height="12" rx="3" />
      </g>
    </g>
  ),

  map: (
    <g fill="none">
      <g stroke={LINE} strokeOpacity="0.16">
        {[32, 64, 96, 128, 160, 192, 224, 256, 288].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" />
        ))}
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} />
        ))}
      </g>
      <path d="M30 146 C 90 60, 150 156, 210 84 S 280 62, 296 40" stroke="#7FD8FF" strokeWidth="2" strokeDasharray="5 5" strokeOpacity="0.85" />
      <circle cx="210" cy="84" r="14" stroke="#7FD8FF" strokeOpacity="0.35" />
      <circle cx="210" cy="84" r="5" fill="#7FD8FF" />
      <circle cx="30" cy="146" r="4" fill={LINE} />
    </g>
  ),
  api: (
    <g>
      <rect x="50" y="24" width="220" height="132" rx="8" fill="#0A1A30" stroke={LINE} strokeOpacity="0.7" />
      {METHODS.map(([label, color, y]) => (
        <g key={label}>
          <rect x="64" y={y} width="44" height="17" rx="4" fill={color} />
          <text
            x="86"
            y={y + 12}
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
            fill="#04101F"
            fontFamily="JetBrains Mono, monospace"
          >
            {label}
          </text>
          <rect x="118" y={y + 5} width={label === 'GET' ? 120 : label === 'POST' ? 96 : label === 'PATCH' ? 108 : 70} height="6" rx="3" fill="#12396B" />
        </g>
      ))}
    </g>
  ),

  three: (
    <g fill="none">
      <ellipse cx="160" cy="92" rx="104" ry="28" stroke="#7FD8FF" strokeOpacity="0.35" strokeDasharray="5 5" transform="rotate(-16 160 92)" />
      <Cube cx={160} cy={92} s={46} />
      <circle cx="262" cy="64" r="3" fill="#7FD8FF" />
      <circle cx="58" cy="118" r="2.5" fill={LINE} />
    </g>
  ),

  image3d: (
    <g fill="none">
      <rect x="40" y="54" width="82" height="76" rx="6" fill="#0A1A30" stroke={LINE} strokeOpacity="0.75" />
      <circle cx="81" cy="82" r="10" fill="#12396B" />
      <path d="M58 124 C 60 104, 102 104, 104 124 Z" fill="#12396B" />
      <path d="M134 92 H 178" stroke="#7FD8FF" strokeWidth="2" strokeDasharray="4 4" />
      <path d="m172 85 8 7-8 7" stroke="#7FD8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Cube cx={236} cy={92} s={34} />
    </g>
  ),

};

export default function ProjectArt({ kind }: { kind: ProjectKind }) {
  const id = `art-glow-${kind}`;

  return (
    <svg
      className="project-art-svg"
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#0A4FB5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#03070D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="#050C18" />
      <rect width="320" height="180" fill={`url(#${id})`} />
      {ART[kind]}
    </svg>
  );
}