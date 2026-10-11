import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { sceneFrame } from './sceneKeyframes';
import { motion, scrollState } from './scrollStore';

/**
 * Nanti isi dengan path foto di folder public, contoh: '/images/portrait.png'
 * (disarankan PNG transparan / rasio 3:4). null = pakai placeholder.
 */
const PORTRAIT_URL: string | null = '/images/portrait.png';

const HEIGHT = 3.4;
const DEFAULT_ASPECT = 0.76; // lebar / tinggi placeholder

function createPlaceholderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 672;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#0A1A30');
  bg.addColorStop(1, '#04080F');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid teknis
  ctx.strokeStyle = 'rgba(0, 183, 255, 0.09)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // glow tengah
  const glow = ctx.createRadialGradient(256, 300, 20, 256, 300, 260);
  glow.addColorStop(0, 'rgba(0, 140, 255, 0.35)');
  glow.addColorStop(1, 'rgba(0, 140, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // inisial
  ctx.fillStyle = '#F5F7FA';
  ctx.font = '700 230px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IA', 256, 300);

  ctx.fillStyle = '#7C8AA0';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText('Foto 3D segera hadir', 256, 600);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function Portrait() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const size = useThree((s) => s.size);

  const [texture, setTexture] = useState<THREE.Texture>(() =>
    createPlaceholderTexture(),
  );
  // rasio lebar/tinggi mengikuti foto asli, supaya tidak melar
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);

  const width = HEIGHT * aspect;

  const frameGeometry = useMemo(
    () =>
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(width + 0.2, HEIGHT + 0.2)),
    [width],
  );

  // memuat foto asli bila PORTRAIT_URL diisi
  useEffect(() => {
    if (!PORTRAIT_URL) return;
    let cancelled = false;
    new THREE.TextureLoader().load(
      PORTRAIT_URL,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;
        if (cancelled) return;
        const img = loaded.image as { width: number; height: number };
        setAspect(img.width / img.height);
        setTexture(loaded);
      },
      undefined,
      () => {
        console.warn(
          `[Portrait] Foto tidak ditemukan di "${PORTRAIT_URL}". ` +
            'Pastikan file ada di public/images/. Memakai placeholder.',
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    const frameMaterial = frameMaterialRef.current;
    if (!group || !material || !frameMaterial) return;

    const dt = Math.min(delta, 0.05);
    const o = sceneFrame.portraitOpacity;
    group.visible = o > 0.01;
    if (!group.visible) return;

    material.opacity = o;
    frameMaterial.opacity = o * 0.9;
    frameMaterial.color.copy(sceneFrame.accent);

    tilt.current.x = THREE.MathUtils.damp(
      tilt.current.x,
      motion.reduced ? 0 : scrollState.pointer.x,
      3,
      dt,
    );
    tilt.current.y = THREE.MathUtils.damp(
      tilt.current.y,
      motion.reduced ? 0 : scrollState.pointer.y,
      3,
      dt,
    );
 
    const fit = THREE.MathUtils.clamp(size.width / size.height / 1.5, 0.35, 1);
    const float = motion.reduced
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.9) * 0.08;

    group.position.set(
      sceneFrame.objectPosition.x * fit,
      sceneFrame.objectPosition.y + float,
      sceneFrame.objectPosition.z,
    );
    group.rotation.set(-tilt.current.y * 0.15, tilt.current.x * 0.3, 0);
    group.scale.setScalar(
      sceneFrame.objectScale * (0.55 + 0.45 * fit) * (0.92 + 0.08 * o),
    );
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <planeGeometry args={[width, HEIGHT]} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      <lineSegments geometry={frameGeometry}>
        <lineBasicMaterial ref={frameMaterialRef} color="#00B7FF" transparent opacity={0} />
      </lineSegments>
    </group>
  );
}