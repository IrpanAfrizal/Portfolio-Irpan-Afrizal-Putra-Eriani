import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sceneFrame } from './sceneKeyframes';
import { motion, scrollState } from './scrollStore';

const R = 1.35; // jari-jari planet

/* ---------- GLSL ---------- */

const NOISE = /* glsl */ `
float hash(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}
`;

const VERTEX = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vNormalV;
varying vec3 vViewPos;
void main(){
  vObjPos = position;
  vNormalV = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const PLANET_FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform vec3 uAccent;
uniform vec3 uLightDir;
varying vec3 vObjPos;
varying vec3 vNormalV;
varying vec3 vViewPos;
${NOISE}
void main(){
  vec3 n = normalize(vNormalV);
  vec3 viewDir = normalize(-vViewPos);
  vec3 p = normalize(vObjPos);
  vec3 L = normalize(uLightDir);

  // benua & laut
  float continents = fbm(p * 2.4 + 3.1);
  float land = smoothstep(0.50, 0.56, continents);
  float detail = fbm(p * 9.0);

  vec3 ocean = mix(vec3(0.005, 0.03, 0.16), vec3(0.01, 0.14, 0.55),
                   smoothstep(0.2, 0.5, fbm(p * 4.0)));
  vec3 ground = mix(vec3(0.03, 0.14, 0.30), vec3(0.10, 0.36, 0.70), detail);
  vec3 albedo = mix(ocean, ground, land);

  // pencahayaan siang / malam
  float diff = dot(n, L);
  float day = smoothstep(-0.15, 0.55, diff);
  vec3 color = albedo * (0.12 + 0.95 * day);

  // kilau di laut
  vec3 h = normalize(L + viewDir);
  float spec = pow(max(dot(n, h), 0.0), 60.0) * (1.0 - land) * 0.8;
  color += vec3(0.5, 0.8, 1.0) * spec;

  // lampu kota di sisi malam
  float night = 1.0 - smoothstep(-0.05, 0.25, diff);
  float lights = step(0.78, fbm(p * 38.0)) * land * night;
  color += vec3(0.5, 0.85, 1.0) * lights * 1.2;

  // cahaya tepi
  float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
  color += uAccent * fres * 0.9;

  gl_FragColor = vec4(color, uOpacity);
  #include <colorspace_fragment>
}
`;

const CLOUD_FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform float uTime;
uniform vec3 uLightDir;
varying vec3 vObjPos;
varying vec3 vNormalV;
varying vec3 vViewPos;
${NOISE}
void main(){
  vec3 n = normalize(vNormalV);
  vec3 p = normalize(vObjPos);
  float c = fbm(p * 3.2 + vec3(uTime * 0.02, 0.0, 0.0));
  float a = smoothstep(0.55, 0.78, c);
  float diff = dot(n, normalize(uLightDir));
  float light = 0.15 + 0.85 * smoothstep(-0.1, 0.6, diff);
  gl_FragColor = vec4(vec3(0.75, 0.88, 1.0) * light, a * 0.5 * uOpacity);
  #include <colorspace_fragment>
}
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform vec3 uAccent;
uniform vec3 uLightDir;
varying vec3 vNormalV;
void main(){
  vec3 n = normalize(vNormalV);
  float rim = pow(max(0.62 - dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
  float lit = 0.4 + 0.6 * smoothstep(-0.6, 0.6, dot(n, normalize(uLightDir)));
  gl_FragColor = vec4(uAccent * 1.1, rim * lit * uOpacity * 1.2);
  #include <colorspace_fragment>
}
`;

const makeUniforms = () => ({
  uOpacity: { value: 1 },
  uTime: { value: 0 },
  uAccent: { value: new THREE.Color('#00B7FF') },
  uLightDir: { value: new THREE.Vector3(-0.7, 0.5, 0.6).normalize() },
});

/* batu angkasa kecil yang mengorbit */
const ROCKS = [
  { radius: 2.2, speed: 0.12, size: 0.09, phase: 0.0, tilt: 0.25, y: 0.25 },
  { radius: 2.5, speed: -0.09, size: 0.06, phase: 2.1, tilt: -0.3, y: -0.3 },
  { radius: 1.95, speed: 0.15, size: 0.05, phase: 4.0, tilt: 0.5, y: 0.1 },
  { radius: 2.8, speed: 0.07, size: 0.12, phase: 1.2, tilt: 0.1, y: 0.5 },
  { radius: 2.35, speed: -0.11, size: 0.045, phase: 5.2, tilt: -0.5, y: -0.1 },
];

export default function Planet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const rocksRef = useRef<THREE.Group>(null);
  const planetMat = useRef<THREE.ShaderMaterial>(null);
  const cloudMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);

  const idle = useRef(0);
  const boost = useRef(0);
  const size = useThree((s) => s.size);

  const planetUniforms = useMemo(makeUniforms, []);
  const cloudUniforms = useMemo(makeUniforms, []);
  const atmoUniforms = useMemo(makeUniforms, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const dt = Math.min(delta, 0.05);
    idle.current += motion.reduced ? 0 : dt;
    boost.current +=
      THREE.MathUtils.clamp(scrollState.velocity, -120, 120) * 0.0005;

    const o = sceneFrame.sphereOpacity;
    group.visible = o > 0.01;
    if (!group.visible) return;

    const t = idle.current;
    const fit = THREE.MathUtils.clamp(size.width / size.height / 1.5, 0.35, 1);
    const float = motion.reduced
      ? 0
      : Math.sin(state.clock.elapsedTime * 1.0) * 0.08;

    group.position.set(
      sceneFrame.objectPosition.x * fit,
      sceneFrame.objectPosition.y + float,
      sceneFrame.objectPosition.z,
    );
    group.scale.setScalar(
      sceneFrame.objectScale * (0.55 + 0.45 * fit) * (0.9 + 0.1 * o),
    );

    // planet berputar pelan + ikut berputar saat scroll
    const rot = t * 0.06 + sceneFrame.spin * 0.5 + boost.current * 0.3;
    if (planetRef.current) planetRef.current.rotation.y = rot;
    if (cloudsRef.current) cloudsRef.current.rotation.y = rot * 1.15;

    // uniform shader
    const mats = [planetMat.current, cloudMat.current, atmoMat.current];
    mats.forEach((m) => {
      if (!m) return;
      m.uniforms.uOpacity.value = o;
      m.uniforms.uTime.value = t;
      (m.uniforms.uAccent.value as THREE.Color).copy(sceneFrame.accent);
    });

    if (ringMat.current) {
      ringMat.current.opacity = 0.4 * o;
      ringMat.current.color.copy(sceneFrame.accent);
    }

    // batu angkasa mengorbit
    if (rocksRef.current) {
      rocksRef.current.children.forEach((rock, i) => {
        const cfg = ROCKS[i];
        const a = cfg.phase + t * cfg.speed;
        rock.position.set(
          Math.cos(a) * cfg.radius,
          cfg.y + Math.sin(a) * cfg.radius * cfg.tilt * 0.4,
          Math.sin(a) * cfg.radius * 0.5,
        );
        rock.rotation.set(t * 0.3 * (i + 1), t * 0.2 * (i + 2), 0);
        rock.scale.setScalar(cfg.size * o);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* poros planet sedikit miring */}
      <group rotation={[0, 0, 0.35]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[R, 96, 96]} />
          <shaderMaterial
            ref={planetMat}
            vertexShader={VERTEX}
            fragmentShader={PLANET_FRAGMENT}
            uniforms={planetUniforms}
            transparent
          />
        </mesh>

        <mesh ref={cloudsRef} scale={1.018}>
          <sphereGeometry args={[R, 64, 64]} />
          <shaderMaterial
            ref={cloudMat}
            vertexShader={VERTEX}
            fragmentShader={CLOUD_FRAGMENT}
            uniforms={cloudUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* atmosfer */}
      <mesh scale={1.14}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial
          ref={atmoMat}
          vertexShader={VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          uniforms={atmoUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* cincin orbit tipis */}
      <mesh rotation={[Math.PI / 2.3, 0.1, 0.25]}>
        <torusGeometry args={[R * 1.5, 0.006, 8, 220]} />
        <meshBasicMaterial ref={ringMat} color="#00B7FF" transparent opacity={0.4} />
      </mesh>

      <group ref={rocksRef}>
        {ROCKS.map((rock) => (
          <mesh key={rock.phase}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#5b7088"
              roughness={0.9}
              metalness={0.1}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}