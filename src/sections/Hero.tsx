import type { CSSProperties } from 'react';
import { ArrowDownIcon, ArrowRightIcon, PlayIcon } from '../components/Icons';
import { profile } from '../data/profile';
import { scrollState } from '../three/scrollStore';

// urutan muncul (stagger) untuk animasi masuk
const rise = (i: number) => ({ '--i': i }) as CSSProperties;

const clampDelta = (value: number) => Math.max(-200, Math.min(200, value));

/**
 * Hero = "lintasan" setinggi 300vh. Di dalamnya .hero-stage menempel (sticky)
 * di layar, sementara scroll menggerakkan kamera bintang + zoom model/foto
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

        {profile.model ? (
          /* Area model 3D: scroll / drag di sini = model berputar */
          <div
            className="hero-model-zone"
            data-model-zone
            role="img"
            aria-label={`Model 3D ${profile.fullName}`}
            onPointerEnter={() => {
              scrollState.hover = true;
            }}
            onPointerLeave={() => {
              scrollState.hover = false;
            }}
            onWheel={(e) => {
              scrollState.modelSpin += clampDelta(e.deltaY) * 0.006;
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) scrollState.modelSpin += e.movementX * 0.012;
            }}
          >
            <span className="hero-model-hint">SCROLL / DRAG TO ROTATE</span>
          </div>
        ) : (
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
        )}

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