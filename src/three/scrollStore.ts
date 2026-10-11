// Shared mutable state. Sengaja BUKAN React state:
// dibaca tiap frame (60x/detik) oleh Three.js tanpa memicu re-render.

export const scrollState = {
  /** scrollY dalam px */
  y: 0,
  /** progress global 0..1 */
  progress: 0,
  /** posisi kontinu antar section: 0 = Hero, 1 = About, 1.5 = di tengah About -> Skills, dst. */
  section: 0,
  /** progress 0..1 selama Hero "terkunci" (sticky) di layar */
  pin: 0,
  /** pin yang sudah di-smooth (0..1), dipakai model 3D */
  pinSmooth: 0,
  /** kursor sedang berada di area model 3D */
  hover: false,
  /** target putaran model 3D (radian), digerakkan scroll/drag di area model */
  modelSpin: 0,
  /** delta scroll terakhir (px), meluruh otomatis di SceneDirector */
  velocity: 0,
  /** posisi mouse ternormalisasi -1..1 */
  pointer: { x: 0, y: 0 },
};

export const motion = {
  /** true bila user mengaktifkan prefers-reduced-motion */
  reduced: false,
};