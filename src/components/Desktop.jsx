/**
 * Desktop.jsx — Blue Gradient Hero
 *
 * Canvas layers (every frame):
 *   1. White fill
 *   2. Subtle diagonal wash (alice-blue tint)
 *   3. 6 drifting radial blobs — 30 distinct blue shades across 5 scenes
 *   4. Cursor bloom (blue tinted, lag-follows)
 *
 * CSS layer above canvas:
 *   .grain-layer — animated SVG fractalNoise texture, mix-blend-mode: multiply
 *
 * Scene cycle: every 20 s, 3-second RGB cross-fade between scenes.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════
   30 SHADES OF BLUE — 5 scenes × 6 blobs each
   Position [xFrac, yFrac], radius as fraction of W, alpha
═══════════════════════════════════════════════════════ */
const SCENES = [
  // 1 · Sky / Baby blue — airy, light
  [
    { c: [191, 219, 254], x: 0.14, y: 0.22, r: 0.52, a: 0.46 }, // blue-200
    { c: [147, 197, 253], x: 0.86, y: 0.18, r: 0.46, a: 0.40 }, // blue-300
    { c: [125, 211, 252], x: 0.50, y: 0.50, r: 0.40, a: 0.35 }, // sky-300
    { c:  [56, 189, 248], x: 0.12, y: 0.80, r: 0.44, a: 0.38 }, // sky-400
    { c:  [14, 165, 233], x: 0.88, y: 0.74, r: 0.42, a: 0.32 }, // sky-500
    { c:   [2, 132, 199], x: 0.64, y: 0.36, r: 0.34, a: 0.36 }, // sky-600
  ],
  // 2 · Cobalt / Royal — vivid, saturated
  [
    { c:  [96, 165, 250], x: 0.16, y: 0.24, r: 0.50, a: 0.42 }, // blue-400
    { c:  [59, 130, 246], x: 0.84, y: 0.20, r: 0.44, a: 0.38 }, // blue-500
    { c:  [37,  99, 235], x: 0.48, y: 0.52, r: 0.38, a: 0.34 }, // blue-600
    { c:  [29,  78, 216], x: 0.14, y: 0.78, r: 0.42, a: 0.36 }, // blue-700
    { c:  [30,  64, 175], x: 0.86, y: 0.72, r: 0.46, a: 0.30 }, // blue-800
    { c:  [30,  58, 138], x: 0.66, y: 0.34, r: 0.36, a: 0.34 }, // blue-900
  ],
  // 3 · Midnight / Indigo — deep, moody
  [
    { c:  [67,  56, 202], x: 0.18, y: 0.26, r: 0.52, a: 0.40 }, // indigo-600
    { c:  [55,  48, 163], x: 0.82, y: 0.16, r: 0.46, a: 0.36 }, // indigo-700
    { c:  [49,  46, 129], x: 0.50, y: 0.55, r: 0.40, a: 0.32 }, // indigo-800
    { c:  [30,  27,  75], x: 0.10, y: 0.76, r: 0.42, a: 0.34 }, // indigo-950
    { c:  [99, 102, 241], x: 0.90, y: 0.70, r: 0.44, a: 0.32 }, // indigo-500
    { c: [129, 140, 248], x: 0.62, y: 0.32, r: 0.36, a: 0.38 }, // indigo-400
  ],
  // 4 · Cyan / Teal — fresh, aquatic
  [
    { c: [165, 243, 252], x: 0.15, y: 0.20, r: 0.50, a: 0.44 }, // cyan-200
    { c: [103, 232, 249], x: 0.85, y: 0.18, r: 0.46, a: 0.40 }, // cyan-300
    { c:  [34, 211, 238], x: 0.50, y: 0.50, r: 0.40, a: 0.34 }, // cyan-400
    { c:   [6, 182, 212], x: 0.12, y: 0.80, r: 0.44, a: 0.36 }, // cyan-500
    { c:   [8, 145, 178], x: 0.88, y: 0.74, r: 0.42, a: 0.30 }, // cyan-600
    { c:  [14, 116, 144], x: 0.65, y: 0.36, r: 0.34, a: 0.34 }, // cyan-700
  ],
  // 5 · Periwinkle / Lavender-blue — soft, purple-shifted
  [
    { c: [224, 231, 255], x: 0.16, y: 0.22, r: 0.52, a: 0.46 }, // indigo-100
    { c: [199, 210, 254], x: 0.84, y: 0.18, r: 0.46, a: 0.42 }, // indigo-200
    { c: [165, 180, 252], x: 0.50, y: 0.52, r: 0.40, a: 0.36 }, // indigo-300
    { c: [129, 140, 248], x: 0.14, y: 0.80, r: 0.42, a: 0.38 }, // indigo-400
    { c:  [99, 102, 241], x: 0.86, y: 0.72, r: 0.44, a: 0.32 }, // indigo-500
    { c:  [79,  70, 229], x: 0.64, y: 0.34, r: 0.36, a: 0.36 }, // indigo-600
  ],
];

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function lerpC(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

/* ═══════════════════════════════════════════════════════
   VFX CANVAS
═══════════════════════════════════════════════════════ */
function VFXCanvas() {
  const cvs = useRef(null);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const S = {
      t: 0,
      sceneIdx: 0,
      sceneLerp: 0,
      transitioning: false,
    };

    let W = 0, H = 0;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      W = rect.width; H = rect.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* scene cycle every 20 s */
    const sceneTimer = setInterval(() => {
      S.transitioning = true;
      S.sceneLerp = 0;
    }, 20000);


    let raf;
    function frame() {
      S.t += 0.016;

      /* ── scene lerp (3 s blend ≈ 180 frames at 60 fps) ── */
      if (S.transitioning) {
        S.sceneLerp = Math.min(S.sceneLerp + 0.0056, 1);
        if (S.sceneLerp >= 1) {
          S.sceneIdx = (S.sceneIdx + 1) % SCENES.length;
          S.sceneLerp = 0;
          S.transitioning = false;
        }
      }
      const t    = S.sceneLerp;
      const curS = SCENES[S.sceneIdx];
      const nxtS = SCENES[(S.sceneIdx + 1) % SCENES.length];

      ctx.clearRect(0, 0, W, H);

      /* ── 1. White base ── */
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      /* ── 2. Subtle diagonal blue wash ── */
      const wash = ctx.createLinearGradient(0, 0, W, H);
      wash.addColorStop(0,   'rgba(219,234,254,0.25)'); // blue-100 tint
      wash.addColorStop(0.5, 'rgba(255,255,255,0)');
      wash.addColorStop(1,   'rgba(191,219,254,0.18)'); // blue-200 tint
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      /* ── 3. 6 drifting blue blobs ── */
      const pulse = 0.88 + Math.sin(S.t * 0.40) * 0.10;

      for (let i = 0; i < curS.length; i++) {
        const cb = curS[i];
        const nb = nxtS[i];
        const color = lerpC(cb.c, nb.c, t);
        const alpha = (cb.a + (nb.a - cb.a) * t) * pulse * (0.90 + Math.sin(S.t * 0.28 + i * 2.1) * 0.08);

        /* organic drift orbit per blob */
        const driftX = Math.sin(S.t * 0.14 + i * 1.32) * 0.055 * W;
        const driftY = Math.cos(S.t * 0.11 + i * 1.74) * 0.048 * H;
        const bx = cb.x * W + driftX;
        const by = cb.y * H + driftY;
        const br = cb.r * W;

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rgba(color, alpha));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(sceneTimer);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={cvs}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   SVG MARQUEE — circular spinning text badge
═══════════════════════════════════════════════════════ */
const MARQUEE_TEXT = 'Product Designer · UX Thinker · Creative Educator · ';
const MQ_R  = 61;   // circle radius — sized to fit one text pass exactly
const MQ_CX = 88;   // centre x of 176×176 SVG
const MQ_CY = 88;   // centre y
// Full circle path starting from top, going clockwise
const MQ_PATH = `M ${MQ_CX},${MQ_CY} m 0,-${MQ_R} a ${MQ_R},${MQ_R} 0 1,1 0,${MQ_R * 2} a ${MQ_R},${MQ_R} 0 1,1 0,-${MQ_R * 2}`;

function MarqueeArc() {
  return (
    /* outer: handles positioning */
    <div
      aria-hidden="true"
      className="marquee-arc-wrap"
      style={{
        position:      'absolute',
        right:         '8%',
        top:           '50%',
        transform:     'translateY(-50%)',
        width:         176,
        height:        176,
        pointerEvents: 'none',
        zIndex:        1,
      }}
    >
    {/* inner: handles rotation only */}
    <div style={{ width: '100%', height: '100%', animation: 'marquee-spin 28s linear infinite', transformOrigin: 'center' }}>
      <svg width="176" height="176" viewBox="0 0 176 176" fill="none">
        <defs>
          <path id="mq-circle" d={MQ_PATH} />
        </defs>

        {/* centre dot */}
        <circle cx={MQ_CX} cy={MQ_CY} r="3" fill="rgba(0,0,0,0.18)" />

        <text
          fontSize="9"
          fontFamily='"Geist Mono", monospace'
          fontWeight="400"
          fill="rgba(0,0,0,0.28)"
          letterSpacing="2"
        >
          <textPath href="#mq-circle" startOffset="0%">
            {MARQUEE_TEXT}
          </textPath>
        </text>
      </svg>
    </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO TEXT — dark text on light background
═══════════════════════════════════════════════════════ */
function HeroStatement() {
  const ref = useRef(null);

  useEffect(() => {
    const lines = ref.current?.querySelectorAll('.hero-line');
    if (!lines?.length) return;
    gsap.set(lines, { y: 24, opacity: 0 });
    gsap.to(lines, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', stagger: 0.16, delay: 3.6 });
  }, []);

  return (
    <div ref={ref} className="hero-statement" aria-label="Hero introduction"
         style={{ position: 'relative', zIndex: 2 }}>
      <p className="hero-line hero-line--pre">My name is</p>
      <p className="hero-line hero-line--name">Abhay.</p>
      <p className="hero-line hero-line--sub">I am a product designer</p>
      <p className="hero-line hero-line--sub">and an educator.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function Desktop() {
  return (
    <div className="homepage-hero" aria-label="Portfolio — Abhay Sharma, Product Designer">
      <VFXCanvas />
      {/* Film grain overlay — pure CSS, no JS overhead */}
      <div className="grain-layer" aria-hidden="true" />
      <MarqueeArc />
      <HeroStatement />
    </div>
  );
}
