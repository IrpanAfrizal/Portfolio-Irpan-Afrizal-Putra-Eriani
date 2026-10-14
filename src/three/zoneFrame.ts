import * as THREE from 'three';

/**
 * Mengubah kotak elemen HTML (zona) menjadi koordinat 3D pada jarak `depth`
 * di depan kamera, supaya objek 3D bisa "menempel" tepat di zona tersebut.
 */
export function getZoneFrame(
  zone: HTMLElement,
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  depth: number,
) {
  const rect = zone.getBoundingClientRect();
  const halfH = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const halfW = halfH * (size.width / size.height);

  return {
    rect,
    halfH,
    halfW,
    worldPerPx: (2 * halfH) / size.height,
    cx: ((rect.left + rect.width / 2) / size.width) * 2 - 1,
    cy: -(((rect.top + rect.height / 2) / size.height) * 2 - 1),
  };
}