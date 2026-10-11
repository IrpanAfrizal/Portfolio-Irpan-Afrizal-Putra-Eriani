import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
  </svg>
);

export const EducationIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M22 10 12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);

export const CodeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...base} width={12} height={12} fill="currentColor" stroke="none" {...p}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);