import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sampleKeyframes, sceneFrame } from './sceneKeyframes';
import { motion, scrollState } from './scrollStore';

/**
 * "Sutradara" scene. Berjalan SEBELUM komponen lain (priority -1):
 * 1. menghaluskan scroll (damping)
 * 2. mengisi sceneFrame dari keyframe -> menggerakkan kamera
 * 3. menulis variabel CSS --p (0..1) ke #hero, dipakai CSS untuk zoom foto
 */
export default function SceneDirector() {
  const smoothSection = useRef(0);
  const smoothPin = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const heroEl = useRef<HTMLElement | null>(null);
  const lastP = useRef(-1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    smoothSection.current = motion.reduced
      ? scrollState.section
      : THREE.MathUtils.damp(smoothSection.current, scrollState.section, 4, dt);

    smoothPin.current = motion.reduced
      ? 0
      : THREE.MathUtils.damp(smoothPin.current, scrollState.pin, 5, dt);

    sampleKeyframes(smoothSection.current, sceneFrame);

    scrollState.velocity = THREE.MathUtils.damp(scrollState.velocity, 0, 6, dt);

    // variabel CSS untuk animasi Hero
    if (!heroEl.current) heroEl.current = document.getElementById('hero');
    const p = Math.round(smoothPin.current * 1000) / 1000;
    if (heroEl.current && p !== lastP.current) {
      lastP.current = p;
      heroEl.current.style.setProperty('--p', String(p));
    }

    const targetX = motion.reduced ? 0 : scrollState.pointer.x;
    const targetY = motion.reduced ? 0 : scrollState.pointer.y;
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, targetX, 3, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, targetY, 3, dt);

    const cam = state.camera;
    cam.position.set(
      sceneFrame.camera.x + parallax.current.x * 0.25,
      sceneFrame.camera.y + parallax.current.y * 0.15,
      sceneFrame.camera.z,
    );
    cam.lookAt(sceneFrame.lookAt);
  }, -1);

  return null;
}