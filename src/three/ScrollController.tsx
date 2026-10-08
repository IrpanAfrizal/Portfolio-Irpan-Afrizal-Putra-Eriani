import { useEffect, useState } from 'react';

export default function ScrollController() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        return;
      }

      const progress = Math.min(
        Math.max(window.scrollY / scrollableHeight, 0),
        1,
      );

      setScrollProgress(progress);

      window.dispatchEvent(
        new CustomEvent('portfolio-scroll', {
          detail: progress,
        }),
      );
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="scroll-debug">
      SCROLL {scrollProgress.toFixed(2)}
    </div>
  );
}