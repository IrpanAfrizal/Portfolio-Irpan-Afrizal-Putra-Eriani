import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Component, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { motion, scrollState } from './scrollStore';

/* ---------- pengaturan yang boleh kamu ubah ---------- */
const FACE_OFFSET = 0; // putaran awal (radian). Jika model menghadap belakang: Math.PI
const FILL = 0.88; // seberapa penuh model mengisi area (0..1)
const ZOOM = 0.9; // seberapa besar zoom saat scroll di Hero
const DEPTH = 6; // jarak model dari kamera (tidak perlu diubah)
const TAU = Math.PI * 2;

/** Material cadangan untuk model "polos" (tanpa warna/tekstur). */
function makeFallbackMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#2a6fd1',
    emissive: '#041a3a',
    metalness: 0.45,
    roughness: 0.38,
  });
}

function prepareModel(source: THREE.Object3D) {
  const root = clone(source);
  const fallback = makeFallbackMaterial();
  const materials = new Set<THREE.Material>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const geo = mesh.geometry;
    if (!geo.attributes.normal) geo.computeVertexNormals();

    // model polos (tanpa UV & tanpa warna vertex) -> pakai material biru
    const bare = !geo.attributes.uv && !geo.attributes.color;
    if (bare) mesh.material = fallback;

    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    list.forEach((m) => {
      m.transparent = true; // agar bisa memudar di akhir Hero
      materials.add(m);
    });
  });

  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const height = Math.max(box.getSize(new THREE.Vector3()).y, 0.0001);

  return {
    root,
    height,
    offset: [-center.x, -center.y, -center.z] as [number, number, number],
    materials: Array.from(materials),
  };
}

/**
 * Model 3D di Hero.
 * - Posisi & ukuran mengikuti elemen HTML [data-model-zone]
 * - Ikut "ditempel" ke kamera, jadi tidak terpengaruh perjalanan bintang
 * - Scroll / drag di dalam area -> model berputar; keluar area -> kembali menghadap depan
 */
export default function HeroModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const model = useMemo(() => prepareModel(gltf.scene), [gltf.scene]);

  const holderRef = useRef<THREE.Group>(null);
  const placeRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const zoneRef = useRef<HTMLElement | null>(null);
  const spin = useRef(0);

  useFrame((state, delta) => {
    const holder = holderRef.current;
    const place = placeRef.current;
    const rotor = spinRef.current;
    if (!holder || !place || !rotor) return;

    const dt = Math.min(delta, 0.05);

    if (!zoneRef.current?.isConnected) {
      zoneRef.current = document.querySelector<HTMLElement>('[data-model-zone]');
    }
    const zone = zoneRef.current;
    if (!zone) {
      holder.visible = false;
      return;
    }

    // memudar di ujung perjalanan Hero
    const pin = scrollState.pinSmooth;
    const opacity = 1 - Math.max(0, pin - 0.55) * 2.2;
    holder.visible = opacity > 0.01;
    if (!holder.visible) return;
    model.materials.forEach((m) => {
      m.opacity = opacity;
    });

    // tempel ke kamera
    const cam = state.camera as THREE.PerspectiveCamera;
    holder.position.copy(cam.position);
    holder.quaternion.copy(cam.quaternion);

    // pasang model pada area HTML
    const { width, height } = state.size;
    const rect = zone.getBoundingClientRect();
    const halfH = DEPTH * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const halfW = halfH * (width / height);
    const worldPerPx = (2 * halfH) / height;
    const cx = ((rect.left + rect.width / 2) / width) * 2 - 1;
    const cy = -(((rect.top + rect.height / 2) / height) * 2 - 1);
    const targetH = rect.height * FILL * worldPerPx;

    const zoom = 1 + pin * ZOOM;
    const float = motion.reduced
      ? 0
      : Math.sin(state.clock.elapsedTime * 1.1) * targetH * 0.008;

    place.position.set(
      cx * halfW - pin * 0.2 * halfW,
      // zoom mendekati wajah: bagian kepala tetap di tempatnya
      cy * halfH - 0.38 * targetH * (zoom - 1) + float,
      -DEPTH,
    );
    place.scale.setScalar((targetH / model.height) * zoom);

    // putaran: tidak di dalam area -> pelan-pelan kembali menghadap depan
    if (!scrollState.hover) {
      const nearestTurn = Math.round(scrollState.modelSpin / TAU) * TAU;
      scrollState.modelSpin = THREE.MathUtils.damp(
        scrollState.modelSpin,
        nearestTurn,
        1.6,
        dt,
      );
    }
    spin.current = THREE.MathUtils.damp(spin.current, scrollState.modelSpin, 6, dt);

    const yaw =
      FACE_OFFSET +
      spin.current +
      (motion.reduced ? 0 : scrollState.pointer.x * 0.12);
    const pitch = motion.reduced ? 0 : -scrollState.pointer.y * 0.05;
    rotor.rotation.set(pitch, yaw, 0);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-3, 3, 5]} intensity={2.2} color="#d6e8ff" />
      <directionalLight position={[4, 1, -5]} intensity={3} color="#00B7FF" />

      <group ref={holderRef}>
        <group ref={placeRef}>
          <group ref={spinRef}>
            <primitive object={model.root} position={model.offset} />
          </group>
        </group>
      </group>
    </>
  );
}

/** Jika file model gagal dimuat, scene tetap jalan (tidak crash). */
export class HeroModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[HeroModel] Gagal memuat model 3D. Cek path di profile.ts:', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}