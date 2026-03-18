/**
 * CustomCursor.jsx
 * Plain matte orange ball — no gradient, no ring, no glow.
 * Snaps instantly to mouse. Grows slightly on hover.
 * Consistent everywhere including inside project overlays.
 */

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor-hover]';
const ORANGE = '#F97316';

function CustomCursor({ color }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);
  const [isTouch,    setIsTouch]    = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const move  = (e) => { x.set(e.clientX); y.set(e.clientY); if (!isVisible) setIsVisible(true); };
    const over  = (e) => { if (e.target.closest(HOVER_SELECTORS)) setIsHovering(true);  };
    const out   = (e) => { if (e.target.closest(HOVER_SELECTORS)) setIsHovering(false); };
    const leave = ()  => setIsVisible(false);
    const enter = ()  => setIsVisible(true);

    window.addEventListener('mousemove',    move,  { passive: true });
    document.addEventListener('mouseover',  over,  { passive: true });
    document.addEventListener('mouseout',   out,   { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove',    move);
      document.removeEventListener('mouseover',  over);
      document.removeEventListener('mouseout',   out);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, [x, y, isVisible]);

  if (isTouch) return null;

  const size = isHovering ? 22 : 14;

  return (
    <>
      <style>{`
        .cursor-ball {
          position: fixed;
          top: 0;
          left: 0;
          border-radius: 50%;
          pointer-events: none;
          background: ${color || ORANGE};
          transform: translate(-50%, -50%);
          will-change: transform;
          z-index: 99999;
          transition: background 0.25s ease;
        }
      `}</style>

      <motion.div
        className="cursor-ball"
        style={{ x, y, opacity: isVisible ? 1 : 0 }}
        animate={{ width: size, height: size }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      />
    </>
  );
}

export default CustomCursor;
