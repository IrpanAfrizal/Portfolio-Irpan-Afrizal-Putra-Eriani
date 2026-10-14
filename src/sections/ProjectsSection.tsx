import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '../components/Icons';
import ProjectArt from '../components/ProjectArt';
import { CardStack, type CardStackItem } from '../components/CardStack';
import { PROJECTS, type Project, type ProjectKind } from '../data/projects';
import { profile } from '../data/profile';
import { useReveal } from '../hooks/useReveal';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

type FanItem = CardStackItem & {
  kind: ProjectKind;
  year?: number;
  tags: string[];
  link?: string;
  summary: string;
};

const FAN_ITEMS: FanItem[] = PROJECTS.map((p: Project) => ({
  id: p.id,
  title: p.title,
  description: p.summary,
  summary: p.summary,
  imageSrc: p.image,
  href: p.link,
  link: p.link,
  kind: p.kind,
  year: p.year,
  tags: p.tags,
}));

function ArrowUpRight({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function FanCard({ item, active }: { item: FanItem; active: boolean }) {
  const year = item.year ?? 2024;

  return (
    <article className={'fan-card' + (active ? ' is-active' : '')}>
      <div className="fan-card-media">
        {item.imageSrc ? (
          <img
            src={item.imageSrc}
            alt={item.title}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ProjectArt kind={item.kind} />
        )}
        <span className="fan-card-year">{year}</span>
        <div className="fan-card-fade" aria-hidden="true" />
      </div>

      <div className="fan-card-body">
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <ul className="fan-card-tags">
          {item.tags.slice(0, 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>

      {item.link ? (
        <a
          className="fan-card-go"
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka ${item.title}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ArrowUpRight />
        </a>
      ) : (
        <span className="fan-card-go is-static" aria-hidden="true">
          <ArrowUpRight />
        </span>
      )}
    </article>
  );
}

export default function ProjectsSection() {
  const ref = useReveal<HTMLElement>(0.15);

  return (
    <section
      id="projects"
      ref={ref}
      className="projects-section"
      aria-labelledby="projects-title"
    >
      <div className="projects-inner">
        <header className="projects-head">
          <div>
            <p className="section-label" data-reveal style={step(0)}>
              04 — PROJECT GALAXY
            </p>
            <h2 id="projects-title" className="about-title" data-reveal style={step(1)}>
              FEATURED <span>PROJECTS</span>
            </h2>
            <p className="skills-lead" data-reveal style={step(2)}>
              Geser kartu, klik untuk memilih, atau pakai panah kiri/kanan untuk menjelajah.
            </p>
          </div>

          <a
            className="projects-all"
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            style={step(2)}
          >
            VIEW ALL PROJECTS <ArrowRightIcon width={14} height={14} />
          </a>
        </header>

        <div className="projects-stack" data-reveal style={step(3)}>
          <CardStack<FanItem>
            items={FAN_ITEMS}
            initialIndex={0}
            maxVisible={5}
            cardWidth={380}          // ← sebelumnya 540
            cardHeight={280}         // ← sebelumnya 420
            overlap={0.58}           // rapat sedikit lebih
            spreadDeg={38}           // fan sedikit lebih sempit
            perspectivePx={1100}
            depthPx={110}            // kedalaman lebih dangkal
            tiltXDeg={9}
            activeLiftPx={16}        
            activeScale={1.02}
            inactiveScale={0.94}
            springStiffness={260}
            springDamping={30}
            loop
            autoAdvance
            intervalMs={4200}
            pauseOnHover
            showDots
            renderCard={(item, { active }) => <FanCard item={item} active={active} />}
          />
        </div>
      </div>
    </section>
  );
}