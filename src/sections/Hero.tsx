import type { CSSProperties } from 'react';
import { ArrowDownIcon, ArrowRightIcon, PlayIcon } from '../components/Icons';
import { profile } from '../data/profile';

// urutan muncul (stagger) untuk animasi masuk
const rise = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Hero = "lintasan" setinggi 300vh. Di dalamnya .hero-stage menempel (sticky)
 * di layar, sementara scroll menggerakkan kamera bintang + zoom foto
 * lewat variabel CSS --p (ditulis oleh SceneDirector).
 */
export default function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-content">
          <p className="hero-hello" data-rise style={rise(0)}>
            <PlayIcon /> Hello, I&apos;m
          </p>

          <h1 id="hero-title" className="hero-title" data-rise style={rise(1)}>
            {profile.firstName} <span>{profile.lastName}</span>
          </h1>

          <p className="hero-subname" data-rise style={rise(2)}>
            {profile.middleName}
          </p>

          <p className="hero-roles" data-rise style={rise(3)}>
            {profile.roleLine}
            <br />
            {profile.education}
          </p>

          <a className="pill-button" href="#about" data-rise style={rise(4)}>
            EXPLORE MY JOURNEY
            <span className="pill-button-icon">
              <ArrowRightIcon />
            </span>
          </a>
        </div>

        <figure className="hero-portrait">
          <img
            src={profile.portrait}
            alt={`Foto ${profile.fullName}`}
            decoding="async"
            fetchPriority="high"
            data-rise
            style={rise(2)}
          />
        </figure>

        <p className="hero-tagline" aria-hidden="true">
          {profile.tagline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <a className="hero-scroll" href="#about">
          <ArrowDownIcon /> SCROLL TO ENTER
        </a>
      </div>
    </section>
  );
}