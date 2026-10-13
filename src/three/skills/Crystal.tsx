import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  buildGlowGeometry,
  createGlowPointsMaterial,
  updateGlowMaterial,
} from './points';
import { skillsFrame } from './skillsFrame';

/** Kristal: permata biru berfaset dengan inti menyala dan serpihan yang melayang. */

const SUN = new THREE.Vector3(-0.75, 0.45, 0.55).normalize();

const SHARDS = [
  { r: 1.85, speed: 0.35, y: 0.5, s: 0.13 },
  { r: 1.95, speed: -0.28, y: -0.6, s: 0.1 },
  { r: 1.7, speed: 0.45, y: 0.1, s: 0.08 },
  { r: 2.0, speed: 0.22, y: 0.9, s: 0.11 },
  { r: 1.8, speed: -0.4, y: -0.2, s: 0.09 },
];

const VERTEX = /* glsl */ `
varying vec3 vViewPos;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform float uTime;
uniform vec3 uLightDir;
varying vec3 vViewPos;
void main(){
  // normal per sisi (faset) dari turunan layar
  vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - abs(dot(n, V)), 2.0);
  float facet = dot(n, normalize(uLightDir)) * 0.5 + 0.5;

  vec3 col = mix(vec3(0.005, 0.05, 0.22), vec3(0.04, 0.38, 0.95), facet);
  col += vec3(0.25, 0.8, 1.0) * fres * 0.9;

  float streak = pow(max(0.0, sin(dot(n, vec3(3.1, 5.3, 2.7)) * 5.0 + uTime * 0.5)), 10.0);
  col += vec3(0.6, 0.95, 1.0) * streak * 0.45;

  gl_FragColor = vec4(col, (0.55 + fres * 0.4) * uOpacity);
  #include <colorspace_fragment>
}
`;

export default function Crystal() {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);

  const assets = useMemo(() => {
    const glass = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uOpacity: { value: 1 },
        uTime: { value: 0 },
        uLightDir: { value: SUN.clone() },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const outerGeo = new THREE.OctahedronGeometry(1.35, 0);
    const innerGeo = new THREE.OctahedronGeometry(0.62, 0);
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const shardGeo = new THREE.TetrahedronGeometry(1, 0);

    const outerLine = new THREE.LineBasicMaterial({ color: '#7FD8FF', transparent: true, opacity: 0.9, depthWrite: false });
    const innerLine = new THREE.LineBasicMaterial({ color: '#BFEFFF', transparent: true, opacity: 0.7, depthWrite: false });

    const glowMaterial = createGlowPointsMaterial();
    const glowGeometry = buildGlowGeometry([
      { x: 0, y: 0, z: 0, color: new THREE.Color('#4FA8FF'), size: 0.95 },
      { x: 0, y: 0, z: 0, color: new THREE.Color('#FFFFFF'), size: 0.3 },
    ]);

    return { glass, outerGeo, innerGeo, outerEdges, innerEdges, shardGeo, outerLine, innerLine, glowMaterial, glowGeometry };
  }, []);

  useEffect(
    () => () => {
      Object.values(assets).forEach((a) => a.dispose());
    },
    [assets],
  );

  useFrame(() => {
    const { time: t, boost, opacity: o } = skillsFrame;

    assets.glass.uniforms.uOpacity.value = o;
    assets.glass.uniforms.uTime.value = t;
    assets.outerLine.opacity = 0.9 * o;
    assets.innerLine.opacity = 0.7 * o;
    updateGlowMaterial(assets.glowMaterial, skillsFrame);

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.9) * 0.06;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    }
    if (outerRef.current) outerRef.current.rotation.y = t * 0.3 + boost * 0.5;
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.45 - boost * 0.7;
      innerRef.current.rotation.x = t * 0.2;
    }

    SHARDS.forEach((shard, i) => {
      const mesh = shardRefs.current[i];
      if (!mesh) return;
      const a = i * 1.3 + t * shard.speed;
      mesh.position.set(Math.cos(a) * shard.r, shard.y, Math.sin(a) * shard.r);
      mesh.rotation.set(t * 0.6 * (i + 1) * 0.3, t * 0.5, 0);
    });
  });

  return (
    <group ref={groupRef}>
      {/* kristal luar (memanjang ke atas) */}
      <group ref={outerRef} scale={[1, 1.3, 1]}>
        <mesh geometry={assets.outerGeo} material={assets.glass} />
        <lineSegments geometry={assets.outerEdges} material={assets.outerLine} />
      </group>

      {/* kristal dalam berputar berlawanan */}
      <group ref={innerRef} scale={[1, 1.3, 1]}>
        <mesh geometry={assets.innerGeo} material={assets.glass} />
        <lineSegments geometry={assets.innerEdges} material={assets.innerLine} />
      </group>

      {/* inti menyala */}
      <points geometry={assets.glowGeometry} material={assets.glowMaterial} frustumCulled={false} />

      {/* serpihan melayang */}
      {SHARDS.map((shard, i) => (
        <mesh
          key={shard.r}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
          geometry={assets.shardGeo}
          material={assets.glass}
          scale={shard.s}
        />
      ))}
    </group>
  );
}