import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  buildGlowGeometry,
  createGlowPointsMaterial,
  updateGlowMaterial,
  type GlowItem,
} from './points';
import { skillsFrame } from './skillsFrame';

/** Galaksi spiral: ribuan bintang berputar dengan inti yang menyala. */

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const COUNT = IS_MOBILE ? 5000 : 10000;
const RADIUS = 1.9;
const ARMS = 4;
const TWIST = 2.4; // seberapa melilit lengan spiral
const TAU = Math.PI * 2;

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function buildGalaxy() {
  const inner = new THREE.Color('#EAF4FF');
  const mid = new THREE.Color('#2F9BFF');
  const outer = new THREE.Color('#2A4FD6');
  const warm = new THREE.Color('#FFD9A8');
  const violet = new THREE.Color('#8E7BFF');

  const items: GlowItem[] = [];

  for (let i = 0; i < COUNT; i += 1) {
    const t = Math.pow(Math.random(), 1.6); // lebih padat di tengah
    const r = 0.04 + t * RADIUS;
    const angle = ((i % ARMS) / ARMS) * TAU + r * TWIST;
    const spread = 0.06 + r * 0.2;

    const color = new THREE.Color();
    if (t < 0.35) color.copy(inner).lerp(mid, t / 0.35);
    else color.copy(mid).lerp(outer, (t - 0.35) / 0.65);

    const roll = Math.random();
    if (roll < 0.06) color.lerp(warm, 0.8);
    else if (roll < 0.12) color.lerp(violet, 0.6);

    items.push({
      x: Math.cos(angle) * r + gauss() * spread,
      y: gauss() * 0.16 * Math.pow(1 - t, 1.5) + gauss() * 0.02,
      z: Math.sin(angle) * r + gauss() * spread,
      color,
      size: 0.028 + Math.random() * 0.04 + (Math.random() < 0.02 ? 0.06 : 0),
    });
  }

  // inti bercahaya
  items.push({ x: 0, y: 0, z: 0, color: new THREE.Color('#4FA8FF'), size: 1.1 });
  items.push({ x: 0, y: 0, z: 0, color: new THREE.Color('#FFFFFF'), size: 0.45 });

  return buildGlowGeometry(items);
}

export default function Galaxy() {
  const spinRef = useRef<THREE.Group>(null);
  const geometry = useMemo(buildGalaxy, []);
  const material = useMemo(createGlowPointsMaterial, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    if (spinRef.current) {
      spinRef.current.rotation.y = skillsFrame.time * 0.06 + skillsFrame.boost * 0.3;
    }
    updateGlowMaterial(material, skillsFrame);
  });

  return (
    <group rotation={[0.5, 0, 0.12]}>
      <group ref={spinRef}>
        <points geometry={geometry} material={material} frustumCulled={false} />
      </group>
    </group>
  );
}