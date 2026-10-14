/**
 * Data bersama untuk semua "benda tengah" semesta skill.
 * Diisi tiap frame oleh SkillsUniverse.tsx.
 */
export const skillsFrame = {
  /** 0..1, seberapa terlihat semesta saat ini */
  opacity: 0,
  /** waktu animasi (detik), berhenti jika reduced-motion */
  time: 0,
  /** putaran tambahan yang digerakkan kecepatan scroll */
  boost: 0,
  /** pengali ukuran titik (px) untuk shader titik bercahaya */
  pointScale: 1,
};