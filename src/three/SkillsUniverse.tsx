import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CENTERPIECE, ORBITS, type Centerpiece } from '../data/skills';
import Crystal from './skills/Crystal';
import Earth from './skills/Earth';
import Galaxy from './skills/Galaxy';
import Neural from './skills/Neural';
import { skillsFrame } from './skills/skillsFrame';
import { motion, scrollState } from './scrollStore';
import { getZoneFrame } from './zoneFrame';

/* =========================================================
   Semesta skill = benda di tengah + cincin orbit + kartu teknologi.
   Benda tengah dipilih lewat CENTERPIECE di data/skills.ts.
   ========================================================= */

const CENTERPIECES: Record<Centerpiece, () => React.JSX.Element> = {
  galaxy: Galaxy,
  neural: Neural,
  crystal: Crystal,
  earth: Earth,
};
const Center = CENTERPIECES[CENTERPIECE];

const EXTENT_X = 3.65; // lebar semesta (radius cincin terluar + kartu)
const EXTENT_Y = 2.55; // tinggi semesta
const DEPTH = 8; // jarak dari kamera (makin jauh = distorsi perspektif makin kecil)
const TAU = Math.PI * 2;
const CARD_W = 0.88;
const CARD_H = 0.33;

/* ---------- gambar kartu teknologi (canvas) ---------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(canvas: HTMLCanvasElement, label: string, badge: string, color: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(2, 0, 0, 2, 0, 0); // gambar pada koordinat 256 x 96
  ctx.clearRect(0, 0, 256, 96);

  roundRect(ctx, 3, 3, 250, 90, 16);
  ctx.fillStyle = 'rgba(6, 18, 42, 0.9)';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(46, 48, 22, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = '#04101f';
  ctx.font = '700 19px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, 46, 49);

  let size = 30;
  ctx.textAlign = 'left';
  ctx.font = `600 ${size}px "Space Grotesk", sans-serif`;
  while (ctx.measureText(label).width > 150 && size > 14) {
    size -= 1;
    ctx.font = `600 ${size}px "Space Grotesk", sans-serif`;
  }
  ctx.fillStyle = '#F5F7FA';
  ctx.fillText(label, 80, 49);
}

interface Fadeable {
  material: THREE.Material & { opacity: number };
  base: number;
}

export default function SkillsUniverse() {
  const holderRef = useRef<THREE.Group>(null);
  const placeRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<(THREE.Group | null)[][]>([]);
  const zoneRef = useRef<HTMLElement | null>(null);
  const time = useRef(0);
  const boost = useRef(0);

  const assets = useMemo(() => {
    const rings = ORBITS.map(
      () => new THREE.MeshBasicMaterial({ color: '#2F8BFF', transparent: true, opacity: 0.35, depthWrite: false }),
    );

    const cards = ORBITS.map((orbit) =>
      orbit.cards.map((card) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 192;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
        const draw = () => {
          drawCard(canvas, card.label, card.badge, card.color);
          texture.needsUpdate = true;
        };
        draw();
        return { texture, material, draw };
      }),
    );

    const fadeables: Fadeable[] = [
      ...rings.map((material) => ({ material, base: 0.35 })),
      ...cards.flat().map((c) => ({ material: c.material, base: 1 })),
    ];

    return { rings, cards, fadeables };
  }, []);

  // gambar ulang kartu setelah font web selesai dimuat
  useEffect(() => {
    document.fonts?.ready.then(() => assets.cards.flat().forEach((c) => c.draw()));
  }, [assets]);

  useEffect(
    () => () => {
      assets.cards.flat().forEach((c) => {
        c.texture.dispose();
        c.material.dispose();
      });
      assets.rings.forEach((m) => m.dispose());
    },
    [assets],
  );

  // priority -0.5: setelah SceneDirector (-1), sebelum benda tengah (0)
  useFrame((state, delta) => {
    const holder = holderRef.current;
    const place = placeRef.current;
    const tilt = tiltRef.current;
    if (!holder || !place || !tilt) return;

    const dt = Math.min(delta, 0.05);

    if (!zoneRef.current?.isConnected) {
      zoneRef.current = document.querySelector<HTMLElement>('[data-skills-zone]');
    }
    const zone = zoneRef.current;
    if (!zone) {
      holder.visible = false;
      skillsFrame.opacity = 0;
      return;
    }

    const cam = state.camera as THREE.PerspectiveCamera;
    const zf = getZoneFrame(zone, cam, state.size, DEPTH);

    // muncul saat zona mendekati tengah layar, memudar saat menjauh
    const o = THREE.MathUtils.clamp(1 - (Math.abs(zf.cy) - 0.5) / 0.5, 0, 1);
    holder.visible = o > 0.01 && zf.rect.height > 0;
    skillsFrame.opacity = holder.visible ? o : 0;
    if (!holder.visible) return;

    time.current += motion.reduced ? 0 : dt;
    boost.current += THREE.MathUtils.clamp(scrollState.velocity, -120, 120) * 0.0006;

    // tempel ke kamera & pasang pada zona
    const placeScale =
      Math.min(zf.rect.width / (2 * EXTENT_X), zf.rect.height / (2 * EXTENT_Y)) * zf.worldPerPx;
    holder.position.copy(cam.position);
    holder.quaternion.copy(cam.quaternion);
    place.position.set(zf.cx * zf.halfW, zf.cy * zf.halfH, -DEPTH);
    place.scale.setScalar(placeScale);

    // data untuk benda tengah
    skillsFrame.time = time.current;
    skillsFrame.boost = boost.current;
    skillsFrame.pointScale =
      (placeScale * (state.size.height * state.gl.getPixelRatio() * 0.5)) /
      Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));

    assets.fadeables.forEach(({ material, base }) => {
      material.opacity = base * o;
    });

    // mouse memiringkan semesta sedikit
    const px = motion.reduced ? 0 : scrollState.pointer.x;
    const py = motion.reduced ? 0 : scrollState.pointer.y;
    tilt.rotation.set(0.38 - py * 0.06, px * 0.18, 0);

    // kartu mengorbit, makin cepat saat scroll
    const t = time.current;
    ORBITS.forEach((orbit, ri) => {
      const count = orbit.cards.length;
      const dir = orbit.speed < 0 ? -1 : 1;
      orbit.cards.forEach((_, ci) => {
        const group = cardRefs.current[ri]?.[ci];
        if (!group) return;
        const a = (ci / count) * TAU + orbit.phase + t * orbit.speed + boost.current * dir;
        group.position.set(Math.cos(a) * orbit.radius, 0, Math.sin(a) * orbit.radius);
      });
    });
  }, -0.5);

  return (
    <group ref={holderRef} visible={false}>
      <group ref={placeRef}>
        <group ref={tiltRef}>
          <Center />

          {/* cincin orbit + kartu teknologi */}
          {ORBITS.map((orbit, ri) => (
            <group key={orbit.radius} rotation={[orbit.tilt, 0, orbit.tiltZ]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={assets.rings[ri]}>
                <torusGeometry args={[orbit.radius, 0.007, 8, 180]} />
              </mesh>

              {orbit.cards.map((card, ci) => (
                <group
                  key={card.label}
                  ref={(el) => {
                    (cardRefs.current[ri] ??= [])[ci] = el;
                  }}
                >
                  <Billboard>
                    <mesh material={assets.cards[ri][ci].material}>
                      <planeGeometry args={[CARD_W, CARD_H]} />
                    </mesh>
                  </Billboard>
                </group>
              ))}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}