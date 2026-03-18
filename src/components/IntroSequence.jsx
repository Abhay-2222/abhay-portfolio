import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const BG            = '#ffffff';
const GRID_STEP     = 44;           // spacing between iso-grid lines
const LINE_COLOR    = [200, 196, 190];
const LINE_OPACITY  = 0.22;         // max opacity of a fully-revealed line
export const INTRO_DURATION = 5.2;

const WAVE_DURATION = 3.5;
const FADE_DUR      = 0.5;

/* Greetings in each language with palette colour */
const GREETINGS = [
  { text: '안녕하세요', color: '#2E6DB4' }, // Korean
  { text: 'สวัสดี',    color: '#C4782A' }, // Thai
  { text: 'नमस्ते',    color: '#2D6A45' }, // Hindi
  { text: 'مرحباً',    color: '#0EA5E9' }, // Arabic
  { text: 'Cześć',     color: '#7C4DCC' }, // Polish
  { text: 'Ahoj',      color: '#C9A84C' }, // Czech
  { text: 'Hello',     color: '#c8602a' }, // English — last
];

const INTERVAL = 0.48;
const FADE_IN  = 0.22;
const FADE_OUT = 0.22;

export default function IntroSequence() {
  const overlayRef = useRef();
  const bgRef      = useRef();
  const rafRef     = useRef();
  const greetRefs  = useRef(GREETINGS.map(() => null));
  const nameRef    = useRef();
  const [done, setDone] = useState(false);

  /* ── Size canvas ── */
  useLayoutEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.getContext('2d').scale(dpr, dpr);
  }, []);

  /* ── Dot ripple ── */
  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const dpr  = window.devicePixelRatio || 1;
    const W    = canvas.width  / dpr;
    const H    = canvas.height / dpr;
    const cx   = W / 2, cy = H / 2;
    const maxD = Math.hypot(cx, cy);
    const ctx  = canvas.getContext('2d');
    const startMs = performance.now();
    const stopMs  = (INTRO_DURATION - 0.55) * 1000;

    /* ── Returns wave-based alpha for a point (px, py) ── */
    function ptAlpha(px, py, elapsed) {
      const norm = Math.hypot(px - cx, py - cy) / maxD;
      return Math.min(1, Math.max(0, (elapsed - norm * WAVE_DURATION) / FADE_DUR));
    }

    function drawFrame() {
      const elapsed = (performance.now() - startMs) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;

      /* Isometric grid: two families of lines
         D1: y = 0.5·x + k1·STEP  (slope +0.5)
         D2: y = −0.5·x + k2·STEP (slope −0.5)
         Intersections: ix = (k2−k1)·S, iy = (k1+k2)·S/2

         Draw segments connecting adjacent intersections.
         Each segment fades in based on its MIDPOINT's distance from screen centre
         — identical wave behaviour to the original dots. */

      const S     = GRID_STEP;
      /* k-range to cover the whole viewport */
      const kMin  = -3;
      const kMaxK = Math.ceil(Math.max(W, H * 2) / S) + 3;

      for (let k1 = kMin; k1 <= kMaxK; k1++) {
        for (let k2 = kMin; k2 <= kMaxK; k2++) {
          const ix = (k2 - k1) * S;
          const iy = (k1 + k2) * S / 2;
          /* Skip intersection points far outside canvas */
          if (ix < -S || ix > W + S || iy < -S || iy > H + S) continue;

          /* ── Segment along D1 direction: (k1,k2) → (k1,k2+1) ── */
          {
            const ix2 = ix + S;
            const iy2 = iy + S / 2;
            const mid = ptAlpha((ix + ix2) / 2, (iy + iy2) / 2, elapsed);
            if (mid > 0.002) {
              ctx.strokeStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${(mid * LINE_OPACITY).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(ix,  iy);
              ctx.lineTo(ix2, iy2);
              ctx.stroke();
            }
          }

          /* ── Segment along D2 direction: (k1,k2) → (k1+1,k2) ── */
          {
            const ix2 = ix - S;
            const iy2 = iy + S / 2;
            const mid = ptAlpha((ix + ix2) / 2, (iy + iy2) / 2, elapsed);
            if (mid > 0.002) {
              ctx.strokeStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${(mid * LINE_OPACITY).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(ix,  iy);
              ctx.lineTo(ix2, iy2);
              ctx.stroke();
            }
          }
        }
      }

      if (performance.now() - startMs < stopMs) {
        rafRef.current = requestAnimationFrame(drawFrame);
      }
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ── Greeting sequence + overlay fade ── */
  useEffect(() => {
    if (!overlayRef.current) return;
    let mounted = true;

    gsap.set('#desktop-content', { opacity: 0 });

    const els = greetRefs.current.filter(Boolean);
    gsap.set(els, { opacity: 0, y: 12 });
    if (nameRef.current) gsap.set(nameRef.current, { opacity: 0, y: 10 });

    const tl = gsap.timeline({
      onComplete: () => { if (mounted) setDone(true); },
    });

    GREETINGS.forEach((_, i) => {
      const el    = greetRefs.current[i];
      if (!el) return;
      const start = 0.2 + i * INTERVAL;
      tl.to(el, { opacity: 1, y: 0, duration: FADE_IN, ease: 'power2.out' }, start);
      tl.to(el, { opacity: 0, y: -8, duration: FADE_OUT, ease: 'power2.in' }, start + FADE_IN);
    });

    /* "Abhay." rises after final greeting */
    const nameStart = 0.2 + GREETINGS.length * INTERVAL + 0.1;
    if (nameRef.current) {
      tl.to(nameRef.current,
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        nameStart,
      );
    }

    tl.to(overlayRef.current,
      { opacity: 0, duration: 0.4, ease: 'power1.inOut' },
      INTRO_DURATION - 0.45,
    );
    tl.to('#desktop-content', { opacity: 1, duration: 0 }, INTRO_DURATION);

    return () => {
      mounted = false;
      tl.kill();
      gsap.set('#desktop-content', { clearProps: 'opacity' });
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: BG, overflow: 'hidden',
      }}
    >
      <canvas
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          display: 'block', pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Greetings */}
        {GREETINGS.map((g, i) => (
          <span
            key={i}
            ref={el => { greetRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              fontFamily: 'new-spirit, "Playfair Display", Georgia, serif',
              fontSize: 'clamp(52px, 8vw, 88px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: g.color,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              willChange: 'opacity, transform',
              userSelect: 'none',
            }}
          >
            {g.text}
          </span>
        ))}

        {/* "Abhay." — appears after all greetings */}
        <span
          ref={nameRef}
          style={{
            position: 'absolute',
            fontFamily: 'new-spirit, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(64px, 9vw, 96px)',
            fontWeight: 300,
            color: 'rgba(26,24,20,0.78)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            willChange: 'opacity, transform',
            userSelect: 'none',
          }}
        >
          Abhay.
        </span>
      </div>
    </div>
  );
}
