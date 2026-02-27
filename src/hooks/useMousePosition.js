/**
 * useMousePosition.js
 * Tracks the current mouse cursor position across the viewport.
 * Returns { x, y } updated on every mousemove event.
 * Used by CustomCursor and Dock magnification effect.
 */

import { useState, useEffect } from 'react';

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}

export default useMousePosition;
