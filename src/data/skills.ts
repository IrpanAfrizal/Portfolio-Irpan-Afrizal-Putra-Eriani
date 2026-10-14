// Isi section Skills Universe. Ubah di sini saja.

export type SkillIcon = 'code' | 'layers' | 'database' | 'chip' | 'terminal' | 'server';

export interface SkillGroup {
  id: string;
  title: string;
  icon: SkillIcon;
  items: string[];
}

// Semua kategori digabung di satu daftar (kolom kiri)
export const SKILL_GROUPS: SkillGroup[] = [
  { id: 'programming', title: 'Programming', icon: 'code', items: ['PHP', 'Java', 'Python', 'JavaScript', 'HTML', 'CSS'] },
  { id: 'framework', title: 'Framework', icon: 'layers', items: ['CodeIgniter 4', 'React', 'Android SDK'] },
  { id: 'database', title: 'Database', icon: 'database', items: ['MySQL', 'PostgreSQL', 'Qdrant'] },
  { id: 'ai', title: 'AI & Data', icon: 'chip', items: ['LLM', 'RAG', 'Embedding', 'Vector DB', 'Semantic Search', 'BERTScore'] },
  { id: 'tools', title: 'Tools', icon: 'terminal', items: ['VS Code', 'Git', 'Postman', 'Laragon', 'pgAdmin', 'Android Studio'] },
  { id: 'system', title: 'System & Others', icon: 'server', items: ['Linux', 'Docker (basic)', 'REST API', 'Agile'] },
];

/* ---------- DINONAKTIFKAN (disimpan jika suatu saat dipakai lagi) ----------

export const SKILL_SIDE: SkillGroup[] = [
  { id: 'tools', title: 'Tools', icon: 'terminal', items: ['VS Code', 'Git', 'Postman', 'Laragon', 'pgAdmin', 'Android Studio'] },
  { id: 'system', title: 'System & Others', icon: 'server', items: ['Linux', 'Docker (basic)', 'REST API', 'Agile'] },
];

export const SKILL_LEVEL = 70;

-------------------------------------------------------------------------- */

/**
 * Benda di tengah semesta skill. Ganti SATU kata ini lalu simpan, tampilan langsung berubah:
 *   'galaxy'  = galaksi spiral berisi ribuan bintang
 *   'neural'  = jaringan saraf dengan denyut data mengalir
 *   'crystal' = permata biru berfaset
 *   'earth'   = bumi
 */
export type Centerpiece = 'galaxy' | 'neural' | 'crystal' | 'earth';
export const CENTERPIECE: Centerpiece = 'neural';

/** Kartu 3D yang mengorbit benda tengah. Setiap cincin punya radius, kemiringan, dan kecepatan sendiri. */
export interface OrbitCard {
  label: string;
  badge: string;
  color: string;
}

export interface Orbit {
  radius: number;
  tilt: number;
  tiltZ: number;
  speed: number;
  phase: number;
  cards: OrbitCard[];
}

export const ORBITS: Orbit[] = [
  {
    radius: 2.15,
    tilt: 0.18,
    tiltZ: 0.08,
    speed: 0.16,
    phase: 0,
    cards: [
      { label: 'Python', badge: 'Py', color: '#4B8BBE' },
      { label: 'React', badge: 'Re', color: '#61DAFB' },
      { label: 'JavaScript', badge: 'JS', color: '#F7DF1E' },
    ],
  },
  {
    radius: 2.65,
    tilt: -0.26,
    tiltZ: -0.1,
    speed: -0.12,
    phase: 1,
    cards: [
      { label: 'MySQL', badge: 'My', color: '#00A3C4' },
      { label: 'PostgreSQL', badge: 'Pg', color: '#5B8DC9' },
      { label: 'CodeIgniter', badge: 'CI', color: '#EE4323' },
    ],
  },
  {
    radius: 3.15,
    tilt: 0.38,
    tiltZ: 0.04,
    speed: 0.085,
    phase: 2,
    cards: [
      { label: 'Android', badge: 'An', color: '#3DDC84' },
      { label: 'Qdrant', badge: 'Qd', color: '#DC244C' },
      { label: 'PHP', badge: 'PH', color: '#8892BF' },
      { label: 'Git', badge: 'Gt', color: '#F05032' },
    ],
  },
];