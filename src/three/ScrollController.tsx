import { useEffect, useRef } from 'react';
import { motion, scrollState } from './scrollStore';

const SECTION_SELECTOR = '.portfolio > section, .portfolio > .about-section';

export default function ScrollController() {
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anchors: number[] = [];
    let maxScroll = 0;

    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
      );
      maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      // section terakhir tidak bisa di-scroll sampai topnya -> dibatasi maxScroll
      anchors = sections.map((el) =>
        Math.min(el.getBoundingClientRect().top + window.scrollY, maxScroll),
      );
    };

    const update = () => {
      const y = window.scrollY;
      scrollState.velocity = y - scrollState.y;
      scrollState.y = y;
      scrollState.progress = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;

      let i = 0;
      for (let k = 0; k < anchors.length; k += 1) {
        if (y >= anchors[k] - 1) i = k;
      }
      const start = anchors[i] ?? 0;
      const next = anchors[i + 1];
      const local =
        next !== undefined && next > start
          ? Math.min(Math.max((y - start) / (next - start), 0), 1)
          : 0;
      scrollState.section = i + local;

      // panjang "perjalanan" Hero = tinggi section Hero dikurangi 1 layar
      const pinLength = Math.max((anchors[1] ?? window.innerHeight * 2) - window.innerHeight, 1);
      scrollState.pin = Math.min(Math.max(y / pinLength, 0), 1);

      if (hudRef.current) {
        hudRef.current.textContent = `SCROLL ${scrollState.progress.toFixed(
          2,
        )} · SECTION ${scrollState.section.toFixed(2)}`;
      }
    };

    const onResize = () => {
      measure();
      update();
    };

    const onPointer = (e: PointerEvent) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onReducedChange = () => {
      motion.reduced = reducedQuery.matches;
    };
    onReducedChange();

    // tinggi dokumen bisa berubah (font, gambar, section baru) -> ukur ulang
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    measure();
    update();

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    reducedQuery.addEventListener('change', onReducedChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      reducedQuery.removeEventListener('change', onReducedChange);
    };
  }, []);

  // HUD debug hanya muncul saat development
  return import.meta.env.DEV ? (
    <div ref={hudRef} className="scroll-debug" aria-hidden="true" />
  ) : null;
}