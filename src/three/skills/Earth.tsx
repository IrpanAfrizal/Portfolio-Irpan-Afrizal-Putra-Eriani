import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { skillsFrame } from './skillsFrame';

/** Bumi: laut, benua, awan bergerak, lampu kota, dan atmosfer. */

/**
 * false = bumi dibuat dari shader (tanpa file apa pun).
 * true  = pakai foto bumi asli dari public/textures/earth/.
 */
const USE_REAL_TEXTURES = false;
const TEXTURE_PATH = '/textures/earth/';
const TEXTURE_FILES = {
  day: 'earth_atmos_2048.jpg',
  night: 'earth_lights_2048.png',
  specular: 'earth_specular_2048.jpg',
};

const EARTH_RADIUS = 1.6;
const AXIAL_TILT = 0.41; // kemiringan poros (~23,5 derajat)

// arah matahari (ruang kamera): dari kiri atas depan
const SUN = new THREE.Vector3(-0.75, 0.35, 0.55).normalize();

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
varying vec2 vUv;
varying vec3 vObjPos;
varying vec3 vNormalV;
varying vec3 vViewPos;
void main(){
  vUv = uv;
  vObjPos = position;
  vNormalV = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const EARTH_FRAGMENT = /* glsl */ `
uniform sampler2D uDayMap;
uniform sampler2D uNightMap;
uniform sampler2D uSpecMap;
uniform float uHasDay;
uniform float uHasNight;
uniform float uHasSpec;
uniform float uOpacity;
uniform vec3 uLightDir;
varying vec2 vUv;
varying vec3 vObjPos;
varying vec3 vNormalV;
varying vec3 vViewPos;
${NOISE}
void main(){
  vec3 n = normalize(vNormalV);
  vec3 viewDir = normalize(-vViewPos);
  vec3 p = normalize(vObjPos);
  vec3 L = normalize(uLightDir);

  vec3 dayCol;
  float land = 0.0;
  float ice = 0.0;

  if (uHasDay > 0.5) {
    // foto bumi asli
    dayCol = texture2D(uDayMap, vUv).rgb;
    float blueness = dayCol.b - max(dayCol.r, dayCol.g);
    land = 1.0 - smoothstep(0.02, 0.12, blueness);
  } else {
    // bumi prosedural
    float lat = abs(p.y);
    float continents = fbm(p * 2.2 + 3.1);
    land = smoothstep(0.50, 0.54, continents);

    float dry = smoothstep(0.45, 0.70, fbm(p * 4.0 + 7.0));
    float mountain = smoothstep(0.55, 0.80, fbm(p * 9.0));
    vec3 ground = mix(vec3(0.035, 0.15, 0.045), vec3(0.50, 0.38, 0.20), dry);
    ground = mix(ground, vec3(0.30, 0.26, 0.22), mountain * 0.6);
    ground = mix(ground, vec3(0.28, 0.32, 0.28), smoothstep(0.55, 0.80, lat));

    vec3 ocean = mix(vec3(0.0, 0.025, 0.11), vec3(0.01, 0.17, 0.44),
                     smoothstep(0.3, 0.55, fbm(p * 3.0)));
    float shallow = smoothstep(0.42, 0.50, continents) * (1.0 - land);
    ocean = mix(ocean, vec3(0.04, 0.33, 0.52), shallow);

    ice = smoothstep(0.82, 0.90, lat + (fbm(p * 6.0) - 0.5) * 0.10);
    dayCol = mix(mix(ocean, ground, land), vec3(0.9, 0.95, 1.0), ice);
  }

  float spec = (uHasSpec > 0.5)
    ? texture2D(uSpecMap, vUv).r
    : (1.0 - land) * (1.0 - ice);

  // siang & malam dengan batas lembut
  float diff = dot(n, L);
  float day = smoothstep(-0.12, 0.45, diff);
  vec3 color = dayCol * (0.035 + 1.1 * day);

  // semburat senja di perbatasan
  float twilight = smoothstep(-0.28, 0.0, diff) * (1.0 - smoothstep(0.0, 0.22, diff));
  color += vec3(0.95, 0.40, 0.18) * twilight * 0.10;

  // kilau matahari di laut
  vec3 H = normalize(L + viewDir);
  float ndh = max(dot(n, H), 0.0);
  color += vec3(1.0, 0.95, 0.85) * pow(ndh, 90.0) * spec * day * 1.1;
  color += vec3(0.4, 0.6, 0.9) * pow(ndh, 12.0) * spec * day * 0.16;

  // lampu kota di sisi malam
  float night = 1.0 - smoothstep(-0.05, 0.20, diff);
  vec3 lights;
  if (uHasNight > 0.5) {
    lights = texture2D(uNightMap, vUv).rgb * vec3(1.0, 0.8, 0.45);
  } else {
    float cities = step(0.80, fbm(p * 40.0)) * land * smoothstep(0.35, 0.60, fbm(p * 6.0)) * (1.0 - ice);
    lights = vec3(1.0, 0.75, 0.35) * cities;
  }
  color += lights * night * 1.3;

  // cahaya atmosfer di tepi
  float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
  color += vec3(0.35, 0.65, 1.0) * fres * (0.25 + 0.75 * smoothstep(-0.3, 0.6, diff)) * 1.1;

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
${NOISE}
void main(){
  vec3 n = normalize(vNormalV);
  vec3 p = normalize(vObjPos);
  vec3 q = p * 2.6 + vec3(uTime * 0.01, 0.0, 0.0);
  float warp = fbm(q * 1.5 + 4.0);
  float c = fbm(q + warp * 0.9);
  float a = smoothstep(0.50, 0.78, c);
  a *= 1.0 - smoothstep(0.86, 0.98, abs(p.y)) * 0.4;

  float diff = dot(n, normalize(uLightDir));
  float lit = 0.06 + 0.94 * smoothstep(-0.12, 0.45, diff);
  gl_FragColor = vec4(vec3(lit), a * 0.85 * uOpacity);
  #include <colorspace_fragment>
}
`;

const HALO_FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform vec3 uLightDir;
varying vec3 vNormalV;
void main(){
  vec3 n = normalize(vNormalV);
  float rim = pow(max(0.62 - dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
  float lit = 0.35 + 0.65 * smoothstep(-0.6, 0.6, dot(n, normalize(uLightDir)));
  gl_FragColor = vec4(vec3(0.30, 0.62, 1.0), rim * lit * uOpacity * 1.3);
  #include <colorspace_fragment>
}
`;

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const assets = useMemo(() => {
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;

    const earth = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: EARTH_FRAGMENT,
      transparent: true,
      uniforms: {
        uDayMap: { value: blank },
        uNightMap: { value: blank },
        uSpecMap: { value: blank },
        uHasDay: { value: 0 },
        uHasNight: { value: 0 },
        uHasSpec: { value: 0 },
        uOpacity: { value: 1 },
        uLightDir: { value: SUN.clone() },
      },
    });

    const clouds = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: CLOUD_FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uOpacity: { value: 1 },
        uTime: { value: 0 },
        uLightDir: { value: SUN.clone() },
      },
    });

    const halo = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: HALO_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: 1 },
        uLightDir: { value: SUN.clone() },
      },
    });

    return { blank, earth, clouds, halo };
  }, []);

  // foto bumi asli (opsional)
  useEffect(() => {
    if (!USE_REAL_TEXTURES) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const loaded: THREE.Texture[] = [];

    const load = (file: string, mapUniform: string, flagUniform: string, srgb: boolean) => {
      loader.load(
        TEXTURE_PATH + file,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 8;
          assets.earth.uniforms[mapUniform].value = texture;
          assets.earth.uniforms[flagUniform].value = 1;
          loaded.push(texture);
        },
        undefined,
        () => {
          console.warn(`[Earth] "${file}" tidak ditemukan di ${TEXTURE_PATH}. Memakai tampilan prosedural.`);
        },
      );
    };

    load(TEXTURE_FILES.day, 'uDayMap', 'uHasDay', true);
    load(TEXTURE_FILES.night, 'uNightMap', 'uHasNight', true);
    load(TEXTURE_FILES.specular, 'uSpecMap', 'uHasSpec', false);

    return () => {
      cancelled = true;
      loaded.forEach((t) => t.dispose());
    };
  }, [assets]);

  useEffect(
    () => () => {
      assets.earth.dispose();
      assets.clouds.dispose();
      assets.halo.dispose();
      assets.blank.dispose();
    },
    [assets],
  );

  useFrame(() => {
    const { time: t, boost, opacity: o } = skillsFrame;

    assets.earth.uniforms.uOpacity.value = o;
    assets.clouds.uniforms.uOpacity.value = o;
    assets.clouds.uniforms.uTime.value = t;
    assets.halo.uniforms.uOpacity.value = o;

    if (earthRef.current) earthRef.current.rotation.y = t * 0.05 + boost * 0.4;
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.056 + boost * 0.45;
  });

  return (
    <>
      <group rotation={[0, 0, AXIAL_TILT]}>
        <mesh ref={earthRef} material={assets.earth}>
          <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        </mesh>
        <mesh ref={cloudsRef} material={assets.clouds} scale={1.012}>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        </mesh>
      </group>

      <mesh material={assets.halo} scale={1.16}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      </mesh>
    </>
  );
}