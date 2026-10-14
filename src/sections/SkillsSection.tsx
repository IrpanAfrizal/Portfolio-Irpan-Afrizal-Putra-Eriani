import type { CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';
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

const ICON_BG_COLORS: Record<SkillIcon, string> = {
  code: '#EBF2FA', layers: '#E8F5E9', database: '#F3E8FF',
  chip: '#FFF3E0', terminal: '#E0F7FA', server: '#EDE7F6',
};

const ICON_TEXT_COLORS: Record<SkillIcon, string> = {
  code: '#6895AE', layers: '#4CAF50', database: '#9C27B0',
  chip: '#FF9800', terminal: '#00BCD4', server: '#673AB7',
};

// Data badge dengan nilai parallax (depth) berbeda untuk efek 3D
const FLOATING_BADGES = [
  { id: 'react', label: 'React', icon: '⚛', iconColor: '#61DAFB', position: 'pos-react', parallax: 25 },
  { id: 'js', label: 'JavaScript', icon: 'JS', iconStyle: { background: '#F7DF1E', color: '#000', padding: '2px 5px', borderRadius: '4px' }, position: 'pos-js', parallax: 25 },
  { id: 'codeigniter', label: 'CodeIgniter', icon: '🔥', iconColor: '#EE4323', position: 'pos-codeigniter', parallax: 45 },
  { id: 'php', label: 'PHP', icon: '🐘', iconColor: '#8892BF', position: 'pos-php', parallax: 45 },
  { id: 'android', label: 'Android', icon: '🤖', iconColor: '#3DDC84', position: 'pos-android', parallax: 60 },
  { id: 'postgres', label: 'PostgreSQL', icon: '🐘', iconColor: '#336791', position: 'pos-postgres', parallax: 60 },
  { id: 'python', label: 'Python', icon: '🐍', iconColor: '#3776AB', position: 'pos-python', parallax: 75 },
  { id: 'git', label: 'Git', icon: '🔶', iconColor: '#F05032', position: 'pos-git', parallax: 75 },
];

function SkillCard({ group, index }: { group: SkillGroup; index: number }) {
  return (
    <div className="skill-card" data-reveal style={step(index + 3)}>
      <div
        className="skill-card-icon"
        style={{ backgroundColor: ICON_BG_COLORS[group.icon], color: ICON_TEXT_COLORS[group.icon] }}
      >
        {ICONS[group.icon]}
      </div>
      <div className="skill-card-info">
        <h3>{group.title}</h3>
        <p>{group.items.join(', ')}</p>
      </div>
      <div className="skill-card-arrow">→</div>
    </div>
  );
}

export default function SkillsSection() {
  const ref = useReveal<HTMLElement>(0.2);
  const graphicRef = useRef<HTMLDivElement>(null);

  // Handler untuk melacak posisi kursor di atas area grafis
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = graphicRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Normalisasi ke -0.5 .. 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--mx', x.toFixed(4));
    el.style.setProperty('--my', y.toFixed(4));
  };

  // Reset saat kursor keluar
  const handlePointerLeave = () => {
    const el = graphicRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  return (
    <section id="skills" ref={ref} className="skills-section" aria-labelledby="skills-title">
      <div className="skills-container">
        
        {/* Kolom Kiri: Daftar Skill */}
        <div className="skills-left">
          <header className="skills-header">
            <p className="section-label" data-reveal style={step(0)}>
              03 — SKILLS UNIVERSE
            </p>
            <h2 id="skills-title" className="skills-title-main" data-reveal style={step(1)}>
              TECHNOLOGY <span>STACK</span>
            </h2>
            <p className="skills-desc" data-reveal style={step(2)}>
              Berikut adalah teknologi dan tools yang saya kuasai serta gunakan dalam berbagai project.
            </p>
          </header>

          <div className="skill-cards-list">
            {SKILL_GROUPS.map((group, index) => (
              <SkillCard key={group.id} group={group} index={index} />
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Grafis Melayang yang Interaktif */}
        <div className="skills-right" data-reveal style={step(2)}>
          <div
            className="universe-graphic"
            ref={graphicRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Garis penghubung (SVG) */}
            <svg className="universe-lines" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
              <path d="M250,250 L120,120 M250,250 L380,120 M250,250 L100,250 M250,250 L400,250 M250,250 L120,380 M250,250 L380,380" stroke="#D3E0EA" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </svg>

            {/* Stack Tengah (IA) — tilts with mouse */}
            <div className="center-stack">
              <div className="stack-layer layer-1"></div>
              <div className="stack-layer layer-2"></div>
              <div className="stack-layer layer-3">
                <span className="stack-text">IA</span>
              </div>
            </div>

            {/* Badge Melayang dengan parallax berbeda-beda */}
            {FLOATING_BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`floating-badge ${badge.position}`}
                style={{ '--parallax': badge.parallax } as CSSProperties}
              >
                <span
                  className="badge-icon"
                  style={badge.iconStyle || { color: badge.iconColor }}
                >
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}

            {/* Kotak Callout di Bawah */}
            <div className="tech-callout">
              <div className="callout-icon">💡</div>
              <div className="callout-text">
                <h4>TECHNOLOGY POWERS IDEAS</h4>
                <p>Dengan kombinasi tools dan teknologi yang tepat, setiap ide bisa menjadi solusi nyata.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}