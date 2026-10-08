import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type React from 'react';

function ParticleField({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 700;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 1) {
      array[i] = (Math.random() - 0.5) * 12;
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = scrollProgress.current;

    // Rotasi dasar
    pointsRef.current.rotation.y =
      time * 0.015 + progress * Math.PI * 0.8;

    pointsRef.current.rotation.x =
      Math.sin(time * 0.1) * 0.03 +
      progress * 0.15;

    // Particle field sedikit maju ketika scroll
    pointsRef.current.position.z =
      progress * 1.5;

    // Sedikit melebar ketika scroll
    const scale =
      1 + progress * 0.35;

    pointsRef.current.scale.setScalar(scale);
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
        color="#00B7FF"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function FloatingSphere({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = scrollProgress.current;

    // Floating animation
    groupRef.current.position.y =
      Math.sin(time * 1.2) * 0.15;

    // CORE
    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.15;

      coreRef.current.rotation.y =
        time * 0.3 + progress * Math.PI;

      coreRef.current.scale.setScalar(
        1 + progress * 0.12,
      );
    }

    // WIREFRAME
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x =
        -time * 0.1 + progress * Math.PI;

      wireframeRef.current.rotation.y =
        -time * 0.2 - progress * Math.PI * 1.5;

      wireframeRef.current.scale.setScalar(
        1.08 + progress * 0.12,
      );
    }

    // ENERGY RING
    if (ringRef.current) {
      ringRef.current.rotation.x =
        Math.PI / 2 +
        Math.sin(time * 0.5) * 0.15 +
        progress * 0.8;

      ringRef.current.rotation.z =
        time * 0.35 +
        progress * Math.PI * 2;

      ringRef.current.scale.setScalar(
        1 + progress * 0.35,
      );
    }
  });

  return (
    <group ref={groupRef}>

      {/* CORE */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.35, 64, 64]} />

        <meshStandardMaterial
          color="#008CFF"
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>

      {/* DIGITAL WIREFRAME */}
      <mesh ref={wireframeRef} scale={1.08}>
        <sphereGeometry args={[1.35, 32, 32]} />

        <meshBasicMaterial
          color="#00B7FF"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* ENERGY RING */}
      <mesh ref={ringRef}>
        <torusGeometry
          args={[1.7, 0.025, 16, 128]}
        />

        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.85}
        />
      </mesh>

    </group>
  );
}

function SceneGroup({
  scrollProgress,
  children,
}: {
  scrollProgress: React.MutableRefObject<number>;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current;

    groupRef.current.position.x = progress * 1.5;
    groupRef.current.rotation.y = progress * Math.PI * 0.5;
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

export default function Scene() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const customEvent = event as CustomEvent<number>;

      scrollProgress.current = customEvent.detail;
    };

    window.addEventListener('portfolio-scroll', handleScroll);

    return () => {
      window.removeEventListener(
        'portfolio-scroll',
        handleScroll,
      );
    };
  }, []);

  return (
    <SceneGroup scrollProgress={scrollProgress}>
      <ambientLight intensity={0.25} />

      <directionalLight
        position={[3, 4, 5]}
        intensity={2}
      />

      <pointLight
        position={[-3, 1, 2]}
        intensity={5}
        color="#00B7FF"
      />

      <ParticleField 
      scrollProgress={scrollProgress} />

      <FloatingSphere 
      scrollProgress={scrollProgress} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
      />
    </SceneGroup>
  );
}