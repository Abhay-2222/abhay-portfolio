/**
 * AbhayMark.jsx — top-left SVG nameplate, permanent after intro
 * Light weight, wipes in via clipPath at INTRO_DURATION delay.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { INTRO_DURATION } from './IntroSequence.jsx';

export default function AbhayMark() {
  const clipRef = useRef(null);

  useEffect(() => {
    if (!clipRef.current) return;
    gsap.fromTo(clipRef.current,
      { attr: { width: 0 } },
      { attr: { width: 190 }, duration: 0.8, ease: 'power2.inOut', delay: INTRO_DURATION },
    );
  }, []);

  return (
    <div
      aria-label="Abhay."
      style={{
        position: 'absolute', top: 36, left: 40,
        zIndex: 10, pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <svg width="190" height="52" viewBox="0 0 190 52">
        <defs>
          <clipPath id="mark-clip">
            <rect ref={clipRef} x="0" y="0" width="0" height="52" />
          </clipPath>
        </defs>
        <text
          x="0" y="38"
          fontFamily='new-spirit, "Playfair Display", Georgia, serif'
          fontSize="36"
          fontWeight="300"
          fill="rgba(26,24,20,0.75)"
          clipPath="url(#mark-clip)"
        >Abhay.</text>
      </svg>
    </div>
  );
}
