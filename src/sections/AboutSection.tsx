import type { CSSProperties } from 'react';
import {
  CodeIcon,
  DownloadIcon,
  EducationIcon,
  UserIcon,
} from '../components/Icons';
import { profile } from '../data/profile';
import { useReveal } from '../hooks/useReveal';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

const FACTS = [
  { icon: <UserIcon />, value: profile.fullName, label: 'Full Name' },
  { icon: <EducationIcon />, value: 'UIN SUSKA RIAU', label: 'Education' },
  { icon: <CodeIcon />, value: 'Web Developer / AI Enthusiast', label: 'Profession' },
];

export default function AboutSection() {
  const ref = useReveal<HTMLElement>(0.3);

  return (
    <section
      id="about"
      ref={ref}
      className="about-section"
      aria-labelledby="about-title"
    >
      <div className="about-grid">
        <div className="about-copy">
          <p className="section-label" data-reveal style={step(0)}>
            02 — ABOUT
          </p>

          <h2 id="about-title" className="about-title" data-reveal style={step(1)}>
            WHO AM I <span>?</span>
          </h2>

          <div className="about-text" data-reveal style={step(2)}>
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="about-facts">
            {FACTS.map((fact, index) => (
              <li key={fact.label} data-reveal style={step(3 + index)}>
                <span className="fact-icon">{fact.icon}</span>
                <span>
                  <span className="fact-value">{fact.value}</span>
                  <span className="fact-label">{fact.label}</span>
                </span>
              </li>
            ))}
          </ul>

          <a
            className="pill-button"
            href={profile.cv}
            download
            data-reveal
            style={step(6)}
          >
            DOWNLOAD CV
            <span className="pill-button-icon">
              <DownloadIcon />
            </span>
          </a>
        </div>

        <div className="about-visual" data-reveal style={step(2)}>
          <div className="holo-frame">
            <span className="holo-corner tl" />
            <span className="holo-corner tr" />
            <span className="holo-corner bl" />
            <span className="holo-corner br" />
            <span className="holo-dots" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <img
              src={profile.portrait}
              alt={`Potret ${profile.fullName}`}
              loading="lazy"
              decoding="async"
            />
          </div>

          <figure className="about-quote">
            <blockquote>
              {profile.quote[0]}
              <br />
              {profile.quote[1]} <span>{profile.quoteAccent}</span>
            </blockquote>
            <figcaption className="signature">{profile.signature}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}