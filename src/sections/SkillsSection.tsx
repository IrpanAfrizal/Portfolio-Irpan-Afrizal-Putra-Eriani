import type { CSSProperties, ReactNode } from 'react';
import {
  ChipIcon,
  CodeIcon,
  DatabaseIcon,
  LayersIcon,
  ServerIcon,
  TerminalIcon,
} from '../components/Icons';
import { SKILL_GROUPS, type SkillGroup, type SkillIcon } from '../data/skills';
import { useReveal } from '../hooks/useReveal';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

const ICONS: Record<SkillIcon, ReactNode> = {
  code: <CodeIcon />,
  layers: <LayersIcon />,
  database: <DatabaseIcon />,
  chip: <ChipIcon />,
  terminal: <TerminalIcon />,
  server: <ServerIcon />,
};

function GroupList({ groups, offset }: { groups: SkillGroup[]; offset: number }) {
  return (
    <ul className="skill-groups">
      {groups.map((group, index) => (
        <li key={group.id} className="skill-group" data-reveal style={step(offset + index)}>
          <span className="fact-icon">{ICONS[group.icon]}</span>
          <div>
            <h3>{group.title}</h3>
            <p>{group.items.join(', ')}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- DINONAKTIFKAN: lingkaran Skills Level ----------
   Untuk mengaktifkan lagi: aktifkan SKILL_LEVEL di data/skills.ts,
   import-nya di atas, lalu panggil <SkillLevel /> di dalam .skills-copy.

function SkillLevel() {
  const circumference = 2 * Math.PI * 46;
  const dash = (SKILL_LEVEL / 100) * circumference;

  return (
    <div className="skill-level" data-reveal style={step(9)}>
      <svg viewBox="0 0 112 112" width="112" height="112" role="img" aria-label={`Skills level ${SKILL_LEVEL} persen`}>
        <circle className="skill-ring-track" cx="56" cy="56" r="46" />
        <circle
          className="skill-ring-progress"
          cx="56"
          cy="56"
          r="46"
          style={{ '--dash': dash, '--full': circumference } as CSSProperties}
        />
        <text x="56" y="62" textAnchor="middle">{SKILL_LEVEL}%</text>
      </svg>
      <div>
        <strong>Skills Level</strong>
        <span>Keep Learning</span>
      </div>
    </div>
  );
}
-------------------------------------------------------------- */

export default function SkillsSection() {
  const ref = useReveal<HTMLElement>(0.2);

  return (
    <section id="skills" ref={ref} className="skills-section" aria-labelledby="skills-title">
      <div className="skills-grid">
        <div className="skills-copy">
          <header className="skills-head">
            <p className="section-label" data-reveal style={step(0)}>
              03 — SKILLS UNIVERSE
            </p>
            <h2 id="skills-title" className="about-title" data-reveal style={step(1)}>
              TECHNOLOGY <span>STACK</span>
            </h2>
            <p className="skills-lead" data-reveal style={step(2)}>
              Berikut adalah teknologi dan tools yang saya kuasai serta gunakan dalam berbagai project.
            </p>
          </header>

          <GroupList groups={SKILL_GROUPS} offset={3} />
        </div>

        {/* zona tempat bumi 3D dipasang (lihat three/SkillsUniverse.tsx) */}
        <div className="skills-zone" data-skills-zone aria-hidden="true" />
      </div>
    </section>
  );
}