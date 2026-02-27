/**
 * CustomCursor.jsx
 * Replaces the default browser cursor with two layered elements:
 *   - A small dot that snaps instantly to the mouse position.
 *   - A larger ring that follows with spring-based lag (Framer Motion).
 * Dot is accent orange. Ring grows on hover over interactive elements.
 * Hidden on touch/mobile devices.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* Elements that trigger cursor grow */
const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor-hover]';

function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 22, mass: 0.5 };
  const ringX = useSpring(dotX, springConfig);
  const ringY = useSpring(dotY, springConfig);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleEnterHover = (e) => {
      if (e.target.closest(HOVER_SELECTORS)) setIsHovering(true);
    };
    const handleLeaveHover = (e) => {
      if (e.target.closest(HOVER_SELECTORS)) setIsHovering(false);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseover', handleEnterHover, { passive: true });
    document.addEventListener('mouseout', handleLeaveHover, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleEnterHover);
      document.removeEventListener('mouseout', handleLeaveHover);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [dotX, dotY, isVisible]);

  if (isTouch) return null;

  const dotSize = isHovering ? 20 : 8;
  const ringSize = isHovering ? 52 : 36;

  return (
    <div className="cursor-layer" aria-hidden="true">
      {/* Dot — snaps immediately */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{ width: dotSize, height: dotSize }}
        transition={{ duration: 0.15 }}
        className="cursor-dot"
      />

      {/* Ring — spring lag */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          opacity: isVisible ? 0.7 : 0,
        }}
        animate={{ width: ringSize, height: ringSize }}
        transition={{ duration: 0.2 }}
        className="cursor-ring"
      />

      <style>{`
        .cursor-dot,
        .cursor-ring {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.2s ease;
          will-change: transform;
        }

        .cursor-dot {
          background: var(--accent);
          z-index: 2;
        }

        .cursor-ring {
          border: 1.5px solid var(--accent-border);
          background: transparent;
          z-index: 1;
        }

        body.overlay-open .cursor-dot,
        body.overlay-open .cursor-ring {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
}

export default CustomCursor;
