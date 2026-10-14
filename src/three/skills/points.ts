import * as THREE from 'three';

/** Titik bercahaya lembut (dipakai Galaxy & Neural). */
const VERTEX = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
attribute float aPhase;
uniform float uScale;
uniform float uTime;
varying vec3 vColor;
void main(){
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.82 + 0.18 * sin(uTime * 1.6 + aPhase * 6.2831);
  gl_PointSize = aSize * twinkle * uScale / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
void main(){
  float r = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, r), 2.2);
  gl_FragColor = vec4(vColor * (1.0 + a), a * uOpacity);
  #include <colorspace_fragment>
}
`;

export interface GlowItem {
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  size: number;
}

export function createGlowPointsMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uScale: { value: 1 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function buildGlowGeometry(items: GlowItem[]) {
  const n = items.length;
  const position = new Float32Array(n * 3);
  const color = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const phase = new Float32Array(n);

  items.forEach((it, i) => {
    position[i * 3] = it.x;
    position[i * 3 + 1] = it.y;
    position[i * 3 + 2] = it.z;
    color[i * 3] = it.color.r;
    color[i * 3 + 1] = it.color.g;
    color[i * 3 + 2] = it.color.b;
    size[i] = it.size;
    phase[i] = Math.random();
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  return geometry;
}

export function updateGlowMaterial(
  material: THREE.ShaderMaterial,
  frame: { time: number; opacity: number; pointScale: number },
) {
  material.uniforms.uScale.value = frame.pointScale;
  material.uniforms.uTime.value = frame.time;
  material.uniforms.uOpacity.value = frame.opacity;
}