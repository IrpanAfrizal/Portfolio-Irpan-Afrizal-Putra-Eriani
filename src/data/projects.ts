// Isi section Projects Galaxy. Ubah / tambah project di sini saja.
// Tambah project baru = tambah satu blok { ... } di bawah, kartunya muncul otomatis.

export type ProjectKind = 'ai' | 'web' | 'mobile' | 'map' | 'api' | 'three' | 'image3d';

export interface Project {
  id: string;
  title: string;
  summary: string;
  kind: ProjectKind;
  tags: string[];
  /** link repo / demo. Kosongkan jika belum ada. */
  link?: string;
  /** screenshot di public/images/projects/. Jika kosong, dipakai ilustrasi otomatis. */
  image?: string;
  year?: number;

}

export const PROJECTS: Project[] = [
  {
    id: 'mawaris-chatbot',
    title: 'Hybrid Mawaris Chatbot',
    summary: 'AI + RAG + Rule-Based System',
    kind: 'ai',
    tags: ['React', 'Python', 'Qdrant'],
    link: 'https://github.com/IrpanAfrizal/Chatbot-Mawaris-Ai',
    image: '/images/projects/about-portrait.png',
    year: 2026,
  },
  {
    id: 'arsip-dukcapil',
    title: 'Sistem Arsip/Asset DUKCAPIL',
    summary: 'CodeIgniter 4',
    kind: 'web',
    tags: ['PHP', 'MySQL', 'CI4'],
    link: 'https://github.com/IrpanAfrizal/Sistem-Arsip-archiving-system-Ci4',
    year: 2023,
  },
  {
    id: 'employee-management-api',
    title: 'Employee Management API',
    summary: 'RESTful API + JWT & RBAC',
    kind: 'api',
    tags: ['NestJS', 'TypeScript', 'PostgreSQL', 'Docker'],
    link: 'https://github.com/IrpanAfrizal/Employee-Management-API',
    year: 2024,
  },
  {
    id: 'portfolio-3d',
    title: 'Portfolio 3D Interaktif',
    summary: 'React + Three.js + scroll sinematik',
    kind: 'three',
    tags: ['React', 'TypeScript', 'Three.js'],
    link: 'https://github.com/IrpanAfrizal/Portfolio-Irpan-Afrizal-Putra-Eriani',
    year: 2024,
  },
  {
    id: 'image-to-3d',
    title: 'Image to 3D (GLB)',
    summary: 'Foto jadi model 3D lokal dengan AI',
    kind: 'image3d',
    tags: ['Python', 'FastAPI', 'PyTorch'],
    link: 'https://github.com/IrpanAfrizal/Image-to-3D',
    year: 2024,
  },
  {
    id: 'nabila-fashion',
    title: 'Nabila Fashion (Android App)',
    summary: 'Android + PHP',
    kind: 'mobile',
    tags: ['Java', 'PHP', 'MySQL'],
    
  },
  {
    id: 'sig-osmdroid',
    title: 'Sistem Informasi Geografis',
    summary: 'Android + OSMDroid',
    kind: 'map',
    tags: ['Java', 'OSMDroid'],
  },
];