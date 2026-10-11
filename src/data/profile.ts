// Semua teks & aset utama ada di sini. Ubah di satu tempat saja.
export const profile = {
  firstName: 'IRPAN',
  lastName: 'AFRIZAL',
  middleName: 'Putra Eriani',
  fullName: 'Irpan Afrizal Putra Eriani',
  roleLine: 'Software Developer | AI Enthusiast',
  education: 'UIN SUSKA RIAU Graduate',
  tagline: ['BUILDING', 'SOLUTIONS', 'FOR A BETTER', 'TOMORROW'],

  /** foto di folder public/images */
  portrait: '/images/portrait.png',
  /**
   * Model 3D untuk Hero (file .glb di public/models/).
   * Isi null untuk kembali memakai foto biasa.
   */
  model: '/models/hero.glb' as string | null,
  /** taruh CV di public/cv/ lalu sesuaikan namanya */
  cv: '/cv/Irpan-Afrizal-CV.pdf',

  about: [
    'Saya adalah lulusan baru dari UIN SUSKA RIAU yang memiliki minat dan pengalaman di bidang software development, khususnya web development, backend development, mobile development, dan AI application development.',
    'Saya senang membangun solusi teknologi yang bermanfaat, mempelajari hal baru, dan terus mengembangkan diri untuk menjadi developer yang lebih baik.',
  ],
  quote: ['Better Code,', 'Bigger'],
  quoteAccent: 'Impact.',
  signature: 'Irpan',
};