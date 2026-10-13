import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '../components/Icons';
import GlassFolder, { type ArtPreset, type FolderFile } from '../components/GlassFolder';
import { PROJECTS, type Project, type ProjectKind } from '../data/projects';
import { profile } from '../data/profile';
import { useReveal } from '../hooks/useReveal';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** kind project → preset art folder. Bebas kamu ubah. */
const ART_BY_KIND: Record<ProjectKind, ArtPreset> = {
  ai: 'ember',
  web: 'aurora',
  mobile: 'dusk',
  map: 'glacier',
  api: 'verdant',
  three: 'aurora',
  image3d: 'dusk',
};

/** Ubah data Project → daftar file di dalam folder. */
function toFiles(project: Project): FolderFile[] {
  const tags: FolderFile[] = project.tags.map((tag) => ({
    name: tag,
    meta: 'tech',
  }));

  const open: FolderFile[] = project.link
    ? [{ name: 'Open project', meta: '↗ github', href: project.link }]
    : [];

  // File terakhir = paling depan di stack (paling terlihat).
  return [...tags, ...open];
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
              Beberapa project yang pernah saya kerjakan, mulai dari pengembangan aplikasi web,
              mobile, hingga sistem berbasis AI. Klik folder untuk membuka isinya.
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

        <div className="projects-folders" data-reveal style={step(3)}>
          {PROJECTS.map((project, i) => (
            <GlassFolder
              key={project.id}
              label={project.title}
              meta={project.summary}
              art={ART_BY_KIND[project.kind]}
              seed={i * 13 + 3}
              tone="dark"
              labelPlacement="top-left"
              action="none"
              width={280}
              appear
              appearDelay={i * 120}
              files={toFiles(project)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}