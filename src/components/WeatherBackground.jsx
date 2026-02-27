/**
 * WeatherBackground.jsx
 * Two-layer CSS gradient crossfade driven by 'cube-click' custom events.
 * Layer A and B stack; GSAP opacity-fades between them on each theme change.
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { WEATHER_THEMES } from '../data/weatherThemes.js';

export default function WeatherBackground() {
  const layerARef  = useRef(null);
  const layerBRef  = useRef(null);
  const frontRef   = useRef('a');   // which layer is currently on top
  const indexRef   = useRef(0);     // current theme index

  /* ── Set initial theme (winter) without animation ── */
  useEffect(() => {
    const a = layerARef.current;
    const b = layerBRef.current;
    if (!a || !b) return;

    a.style.background = WEATHER_THEMES[0].gradient;
    a.style.opacity    = '1';
    b.style.opacity    = '0';
  }, []);

  /* ── Listen for cube-click events ── */
  useEffect(() => {
    const onCubeClick = (e) => {
      const { themeIndex } = e.detail ?? {};
      const theme = WEATHER_THEMES[themeIndex ?? 0];
      if (!theme) return;

      const a     = layerARef.current;
      const b     = layerBRef.current;
      const front = frontRef.current;

      /* Write new gradient onto the back layer, then fade it in */
      if (front === 'a') {
        b.style.background = theme.gradient;
        gsap.to(b, { opacity: 1, duration: 1.4, ease: 'power2.inOut' });
        gsap.to(a, { opacity: 0, duration: 1.4, ease: 'power2.inOut' });
        frontRef.current = 'b';
      } else {
        a.style.background = theme.gradient;
        gsap.to(a, { opacity: 1, duration: 1.4, ease: 'power2.inOut' });
        gsap.to(b, { opacity: 0, duration: 1.4, ease: 'power2.inOut' });
        frontRef.current = 'a';
      }
    };

    window.addEventListener('cube-click', onCubeClick);
    return () => window.removeEventListener('cube-click', onCubeClick);
  }, []);

  const layerStyle = {
    position: 'absolute',
    inset:    0,
    width:    '100%',
    height:   '100%',
    pointerEvents: 'none',
    willChange: 'opacity',
  };

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}
    >
      <div ref={layerARef} style={{ ...layerStyle, opacity: 1 }} />
      <div ref={layerBRef} style={{ ...layerStyle, opacity: 0 }} />
    </div>
  );
}
