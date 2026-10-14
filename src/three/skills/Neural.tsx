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

/** Jaringan saraf: node bercahaya, dihubungkan garis, dengan denyut data yang mengalir. */

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const NODES = IS_MOBILE ? 70 : 130;
const SHELL = 1.5;
const NEIGHBORS = 3;
const MAX_DIST = 1.0;

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

const LINE_VERTEX = /* glsl */ `
attribute float aT;
attribute float aPhase;
attribute float aSpeed;
varying float vT;
varying float vPhase;
varying float vSpeed;
void main(){
  vT = aT;
  vPhase = aPhase;
  vSpeed = aSpeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LINE_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
uniform vec3 uPulse;
varying float vT;
varying float vPhase;
varying float vSpeed;
void main(){
  float head = fract(uTime * vSpeed + vPhase);
  float pulse = exp(-pow((vT - head) * 8.0, 2.0));
  vec3 col = mix(uColor, uPulse, pulse);
  gl_FragColor = vec4(col, (0.2 + pulse * 0.9) * uOpacity);
  #include <colorspace_fragment>
}
`;

function buildNetwork() {
  const points: THREE.Vector3[] = [];
  const shellCount = Math.round(NODES * 0.85);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < shellCount; i += 1) {
    const y = 1 - (i / (shellCount - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const r = SHELL * (0.9 + Math.random() * 0.2);
    points.push(new THREE.Vector3(Math.cos(theta) * ring * r, y * r, Math.sin(theta) * ring * r));
  }
  for (let i = shellCount; i < NODES; i += 1) {
    points.push(new THREE.Vector3(gauss(), gauss(), gauss()).multiplyScalar(0.45));
  }

  // hubungkan tiap node ke tetangga terdekat
  const edges = new Map<string, [number, number]>();
  const degree = new Array<number>(NODES).fill(0);

  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j !== i && o.d < MAX_DIST)
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBORS)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edges.has(key)) {
          edges.set(key, [i, j]);
          degree[i] += 1;
          degree[j] += 1;
        }
      });
  });

  // geometri garis
  const list = Array.from(edges.values());
  const linePos = new Float32Array(list.length * 6);
  const aT = new Float32Array(list.length * 2);
  const aPhase = new Float32Array(list.length * 2);
  const aSpeed = new Float32Array(list.length * 2);

  list.forEach(([a, b], e) => {
    const A = points[a];
    const B = points[b];
    linePos.set([A.x, A.y, A.z, B.x, B.y, B.z], e * 6);
    aT[e * 2] = 0;
    aT[e * 2 + 1] = 1;
    const phase = Math.random();
    const speed = 0.15 + Math.random() * 0.3;
    aPhase[e * 2] = aPhase[e * 2 + 1] = phase;
    aSpeed[e * 2] = aSpeed[e * 2 + 1] = speed;
  });

  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lines.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  lines.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
  lines.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));

  // geometri node (makin banyak koneksi = makin besar & terang)
  const base = new THREE.Color('#5FB8FF');
  const hot = new THREE.Color('#EAFBFF');
  const items: GlowItem[] = points.map((p, i) => ({
    x: p.x,
    y: p.y,
    z: p.z,
    color: base.clone().lerp(hot, Math.min(degree[i] / 6, 1)),
    size: 0.05 + degree[i] * 0.014,
  }));
  items.push({ x: 0, y: 0, z: 0, color: new THREE.Color('#4FA8FF'), size: 0.9 });
  items.push({ x: 0, y: 0, z: 0, color: new THREE.Color('#FFFFFF'), size: 0.3 });

  return { lines, nodes: buildGlowGeometry(items) };
}

export default function Neural() {
  const spinRef = useRef<THREE.Group>(null);
  const network = useMemo(buildNetwork, []);
  const nodeMaterial = useMemo(createGlowPointsMaterial, []);
  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: LINE_VERTEX,
        fragmentShader: LINE_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color('#2F8BFF') },
          uPulse: { value: new THREE.Color('#9FF0FF') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      network.lines.dispose();
      network.nodes.dispose();
      nodeMaterial.dispose();
      lineMaterial.dispose();
    },
    [network, nodeMaterial, lineMaterial],
  );

  useFrame(() => {
    const g = spinRef.current;
    if (g) {
      g.rotation.y = skillsFrame.time * 0.08 + skillsFrame.boost * 0.3;
      g.rotation.x = Math.sin(skillsFrame.time * 0.2) * 0.1;
    }
    updateGlowMaterial(nodeMaterial, skillsFrame);
    lineMaterial.uniforms.uTime.value = skillsFrame.time;
    lineMaterial.uniforms.uOpacity.value = skillsFrame.opacity;
  });

  return (
    <group ref={spinRef}>
      <lineSegments geometry={network.lines} material={lineMaterial} frustumCulled={false} />
      <points geometry={network.nodes} material={nodeMaterial} frustumCulled={false} />
    </group>
  );
}