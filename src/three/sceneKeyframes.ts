import * as THREE from 'three';

type Vec3 = [number, number, number];

export interface SceneKeyframe {
  id: string;
  camera: Vec3;
  lookAt: Vec3;
  particleSpeed: number;
  particleOpacity: number;
  accent: string;
}

/**
 * URUTAN keyframe = URUTAN <section> di dalam <main className="portfolio">.
 * Kamera bergerak maju menembus bintang saat scroll dari Hero ke About.
 */
export const KEYFRAMES: SceneKeyframe[] = [
  {
    id: 'hero',
    camera: [0, 0, 7],
    lookAt: [0, 0, 0],
    particleSpeed: 1,
    particleOpacity: 0.8,
    accent: '#00B7FF',
  },
  {
    id: 'about',
    camera: [0, 0.1, 1.5],
    lookAt: [0, 0, -6],
    particleSpeed: 0.5,
    particleOpacity: 0.55,
    accent: '#2F8BFF',
  },
  // Tahap berikutnya: tambahkan keyframe skills, projects, dst.
];

export interface SceneFrame {
  section: number;
  camera: THREE.Vector3;
  lookAt: THREE.Vector3;
  particleSpeed: number;
  particleOpacity: number;
  accent: THREE.Color;
}

const first = KEYFRAMES[0];

export const sceneFrame: SceneFrame = {
  section: 0,
  camera: new THREE.Vector3(...first.camera),
  lookAt: new THREE.Vector3(...first.lookAt),
  particleSpeed: first.particleSpeed,
  particleOpacity: first.particleOpacity,
  accent: new THREE.Color(first.accent),
};

const COLORS = KEYFRAMES.map((k) => new THREE.Color(k.accent));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

function lerpVec(out: THREE.Vector3, a: Vec3, b: Vec3, t: number) {
  out.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

export function sampleKeyframes(f: number, out: SceneFrame) {
  const max = KEYFRAMES.length - 1;
  const c = Math.min(Math.max(f, 0), max);
  const i = Math.min(Math.floor(c), Math.max(max - 1, 0));
  const j = Math.min(i + 1, max);
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[j];
  // linear: kamera melaju stabil mengikuti scroll (tanpa melambat di tengah)
  const t = c - i;

  out.section = c;
  lerpVec(out.camera, a.camera, b.camera, t);
  lerpVec(out.lookAt, a.lookAt, b.lookAt, t);
  out.particleSpeed = lerp(a.particleSpeed, b.particleSpeed, smooth(t));
  out.particleOpacity = lerp(a.particleOpacity, b.particleOpacity, smooth(t));
  out.accent.lerpColors(COLORS[i], COLORS[j], smooth(t));
}