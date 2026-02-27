/**
 * ScrollReactive.jsx
 * Fixed bg + scroll gauge driven by real scroll position + velocity.
 * Works with body overflow-y: auto (homepage scroll).
 *
 * Background: radial blue gradient that brightens with scroll velocity,
 *             then settles to a gentle position-based glow at rest.
 * Meter: vertical gauge on the right edge shows scroll speed.
 *
 * Rendered OUTSIDE portfolio-world so overlay blur/scale doesn't affect it.
 */

import { useEffect, useRef } from 'react';

export default function ScrollReactive() {
  const bgRef         = useRef(null);
  const meterFillRef  = useRef(null);
  const meterValueRef = useRef(null);

  useEffect(() => {
    let bgIntensity    = 0;
    let scrollVelocity = 0;  // decayed px/frame
    let lastScrollY    = window.scrollY;
    let rafId;

    /* Track velocity from scroll events */
    const onScroll = () => {
      const currentY     = window.scrollY;
      const delta        = Math.abs(currentY - lastScrollY);
      scrollVelocity     = Math.min(delta / 12, 8); // clamp to [0, 8]
      lastScrollY        = currentY;
    };

    const loop = () => {
      /* Position-based ambient glow (grows as user scrolls further down) */
      const maxScroll    = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const position     = window.scrollY / maxScroll;          // 0 → 1
      const posIntensity = position * 0.30;

      /* Blend position + velocity */
      bgIntensity    = Math.min(posIntensity + scrollVelocity / 10, 1);
      scrollVelocity *= 0.86;  // decay velocity toward rest

      /* ── Background ── */
      if (bgRef.current) {
        if (bgIntensity < 0.008) {
          bgRef.current.style.background = 'var(--bg)';
        } else {
          const hue   = 220;
          const sat   = Math.round(bgIntensity * 38);
          const light = Math.round(95 - bgIntensity * 22);
          bgRef.current.style.background =
            `radial-gradient(ellipse 75% 65% at 50% 42%, ` +
            `hsl(${hue},${sat}%,${light - 14}%) 0%, ` +
            `hsl(${hue},${Math.round(sat * 0.5)}%,${light}%) 42%, ` +
            `var(--bg) 100%)`;
        }
      }

      /* ── Meter ── */
      if (meterFillRef.current) {
        meterFillRef.current.style.height = `${Math.round(bgIntensity * 100)}%`;
      }
      if (meterValueRef.current) {
        meterValueRef.current.textContent =
          (Math.round(scrollVelocity * 10) / 10).toFixed(1);
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* ── Scroll-reactive background ── */}
      <div
        ref={bgRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        0,
          background:    'var(--bg)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Scroll speed meter ── */}
      <div
        style={{
          position:      'fixed',
          right:         28,
          top:           '50%',
          transform:     'translateY(-50%)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           10,
          zIndex:        500,
          pointerEvents: 'none',
        }}
      >
        <span style={{
          fontFamily:      'var(--mono)',
          fontSize:        9,
          letterSpacing:   '0.15em',
          color:           'var(--text-faint)',
          textTransform:   'uppercase',
          writingMode:     'vertical-rl',
          textOrientation: 'mixed',
        }}>
          SCROLL
        </span>

        <div style={{
          width:        3,
          height:       120,
          background:   'var(--glass-border)',
          borderRadius: 2,
          position:     'relative',
          overflow:     'hidden',
        }}>
          <div
            ref={meterFillRef}
            style={{
              position:     'absolute',
              bottom:       0,
              width:        '100%',
              height:       '0%',
              borderRadius: 2,
              background:   'var(--text-primary)',
              transition:   'height 0.08s ease',
            }}
          />
        </div>

        <span
          ref={meterValueRef}
          style={{
            fontFamily: 'var(--mono)',
            fontSize:   9,
            color:      'var(--text-faint)',
          }}
        >
          0.0
        </span>
      </div>
    </>
  );
}
