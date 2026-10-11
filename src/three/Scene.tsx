import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import SceneDirector from './SceneDirector';
import { sceneFrame } from './sceneKeyframes';
import { motion } from './scrollStore';

const IS_MOBILE =
  typeof window !== 'undefined' && window.innerWidth < 768;
const PARTICLE_COUNT = IS_MOBILE ? 450 : 900;

/** Medan bintang: kamera melaju menembusnya saat scroll. */
function StarField() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const spin = useRef(0);

  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 14; // x
      array[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
      array[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1; // z (dalam)
    }
    return array;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const dt = Math.min(delta, 0.05);
    spin.current += motion.reduced ? 0 : dt * 0.012 * sceneFrame.particleSpeed;
    points.rotation.z = spin.current + sceneFrame.section * 0.25;

    material.opacity = sceneFrame.particleOpacity;
    material.color.copy(sceneFrame.accent);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#00B7FF"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene() {
  return (
    <>
      <SceneDirector />
      <StarField />
    </>
  );
}