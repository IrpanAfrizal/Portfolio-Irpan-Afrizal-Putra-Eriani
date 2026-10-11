import { useEffect, useState } from 'react';

/**
 * ready: true  -> section sudah dibuat (id harus sama dengan id section)
 * ready: false -> item tampil redup & tidak bisa diklik
 * Setiap selesai membuat section baru, ubah ready menjadi true.
 */
const NAV_ITEMS = [
  { id: 'hero', label: 'HERO', ready: true },
  { id: 'about', label: 'ABOUT', ready: true },
  { id: 'skills', label: 'SKILLS UNIVERSE', ready: false },
  { id: 'projects', label: 'PROJECT GALAXY', ready: false },
  { id: 'experience', label: 'EXPERIENCE', ready: false },
  { id: 'research', label: 'RESEARCH / PUBLICATION', ready: false },
  { id: 'lab', label: 'EXPERIMENT / LAB', ready: false },
  { id: 'contact', label: 'CONTACT', ready: false },
];

export default function SideNav() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    NAV_ITEMS.filter((item) => item.ready).forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView();
  };

  return (
    <nav className="side-nav" aria-label="Navigasi utama">
      <a className="side-nav-logo" href="#hero">
        <span className="side-nav-mark">IA</span>
        IRPAN
      </a>

      <ul>
        {NAV_ITEMS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={!item.ready}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={() => goTo(item.id)}
            >
              <span className="side-nav-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}