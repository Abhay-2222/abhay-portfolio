/**
 * DotGrid.jsx — Isometric grid background
 * Two sets of diagonal lines (slope ±0.5) form a diamond/isometric pattern.
 * Near the cursor: lines brighten and intersection points glow with palette colours.
 * In game mode: static lines only (clean substrate for the ball game).
 */
import { useEffect, useRef } from 'react';

const STEP         = 44;   // spacing between parallel lines (y-intercept units)
const ALPHA_BASE   = 0.07;
const ALPHA_HOVER  = 0.26;
const LINE_RADIUS  = 160;  // px — brightening reach
const DOT_RADIUS   = 110;  // px — intersection dot reveal reach
const DOT_SIZE     = 2.2;
const LERP_LINE    = 0.09;
const LERP_DOT     = 0.10;

/* sqrt(1 + 0.5²) — denominator for perpendicular distance to slope-0.5 lines */
const SQRT_1_25 = Math.sqrt(1.25);

const COLOR_BASE = [237, 234, 229];

const PALETTE = [
  [200, 96,  42],
  [46,  109, 180],
  [124, 77,  204],
  [45,  106, 69],
  [14,  165, 233],
  [201, 168, 76],
];

export default function DotGrid({ style, gameMode }) {
  const canvasRef    = useRef(null);
  const mouse        = useRef({ x: -9999, y: -9999 });
  const gameModeRef  = useRef(gameMode);
  gameModeRef.current = gameMode;

  /* Per-line alpha lerp state — rebuilt on resize */
  const lineAlphas1  = useRef(null); // D1: y = 0.5x + c
  const lineAlphas2  = useRef(null); // D2: y = -0.5x + c
  /* Per-intersection alpha — keyed by (k1,k2) in a flat array */
  const dotAlphas    = useRef(null);
  const gridInfo     = useRef({ W: 0, H: 0, c1Start: 0, c1Count: 0, c2Start: 0, c2Count: 0, dotRange: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    /* ── Build grid metadata & allocate lerp arrays ── */
    function buildGrid() {
      const dpr = window.devicePixelRatio || 1;
      const W   = canvas.offsetWidth;
      const H   = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      /* D1: y = 0.5x + c
         At x=0: y=c; at x=W: y=0.5W+c
         Visible when c in [-H, 0.5W+H] */
      const c1Start = Math.floor(-H / STEP) * STEP;
      const c1End   = 0.5 * W + H + STEP;
      const c1Count = Math.ceil((c1End - c1Start) / STEP) + 1;

      /* D2: y = -0.5x + c
         At x=0: y=c; at x=W: y=c-0.5W
         Visible when c in [-H, 0.5W+H] (same range) */
      const c2Start = c1Start;
      const c2Count = c1Count;

      lineAlphas1.current = new Float32Array(c1Count).fill(ALPHA_BASE);
      lineAlphas2.current = new Float32Array(c2Count).fill(ALPHA_BASE);

      /* Intersection dots — we scan a local grid around cursor each frame.
         Pre-allocate a 2-D array indexed by (k1, k2) relative to some origin;
         too dynamic to pre-size, so we use a Map keyed by `k1,k2` strings, reset on rebuild. */
      dotAlphas.current = new Map();

      gridInfo.current = { W, H, c1Start, c1Count, c2Start, c2Count };
    }

    /* ── Main draw loop ── */
    function draw() {
      const { W, H, c1Start, c1Count, c2Start, c2Count } = gridInfo.current;
      if (!W || !H) { animId = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const gm = gameModeRef.current;

      /* ── Direction 1: y = 0.5x + c ── */
      for (let i = 0; i < c1Count; i++) {
        const c   = c1Start + i * STEP;
        /* perpendicular distance from cursor to this line: |0.5·mx - my + c| / √1.25 */
        const d   = gm ? Infinity : Math.abs(0.5 * mx - my + c) / SQRT_1_25;
        const t   = d < LINE_RADIUS ? (1 - d / LINE_RADIUS) ** 2 : 0;
        const tgt = ALPHA_BASE + (ALPHA_HOVER - ALPHA_BASE) * t;
        lineAlphas1.current[i] += (tgt - lineAlphas1.current[i]) * LERP_LINE;

        ctx.strokeStyle = `rgba(0,0,0,${lineAlphas1.current[i].toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0,   c);
        ctx.lineTo(W,   0.5 * W + c);
        ctx.stroke();
      }

      /* ── Direction 2: y = -0.5x + c ── */
      for (let i = 0; i < c2Count; i++) {
        const c   = c2Start + i * STEP;
        /* perpendicular distance: |0.5·mx + my - c| / √1.25 */
        const d   = gm ? Infinity : Math.abs(0.5 * mx + my - c) / SQRT_1_25;
        const t   = d < LINE_RADIUS ? (1 - d / LINE_RADIUS) ** 2 : 0;
        const tgt = ALPHA_BASE + (ALPHA_HOVER - ALPHA_BASE) * t;
        lineAlphas2.current[i] += (tgt - lineAlphas2.current[i]) * LERP_LINE;

        ctx.strokeStyle = `rgba(0,0,0,${lineAlphas2.current[i].toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0,   c);
        ctx.lineTo(W,   c - 0.5 * W);
        ctx.stroke();
      }

      /* ── Intersection glow dots (skipped in game mode) ── */
      if (!gm) {
        /* Intersections of D1 and D2:
           D1: y = 0.5x + k1·STEP   →  c1 = k1·STEP
           D2: y = -0.5x + k2·STEP  →  c2 = k2·STEP
           Solving: ix = (k2-k1)·STEP,  iy = (k1+k2)·STEP/2  */

        const k1_center = (my - mx / 2) / STEP;
        const k2_center = (my + mx / 2) / STEP;
        const range     = Math.ceil(DOT_RADIUS / STEP) + 2;

        /* Decay dots outside the cursor area */
        for (const [key, val] of dotAlphas.current) {
          const newVal = val + (0 - val) * LERP_DOT;
          if (newVal < 0.005) dotAlphas.current.delete(key);
          else dotAlphas.current.set(key, newVal);
        }

        for (let k1 = Math.floor(k1_center) - range; k1 <= Math.ceil(k1_center) + range; k1++) {
          for (let k2 = Math.floor(k2_center) - range; k2 <= Math.ceil(k2_center) + range; k2++) {
            const ix = (k2 - k1) * STEP;
            const iy = (k1 + k2) * STEP / 2;
            if (ix < -10 || ix > W + 10 || iy < -10 || iy > H + 10) continue;

            const dx   = ix - mx, dy = iy - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const t    = dist < DOT_RADIUS ? 1 - dist / DOT_RADIUS : 0;
            const tSmooth = t * t * (3 - 2 * t);

            const key    = `${k1},${k2}`;
            const curVal = dotAlphas.current.get(key) ?? 0;
            const tgt    = 0.65 * tSmooth;
            const newVal = curVal + (tgt - curVal) * LERP_DOT;
            if (newVal > 0.005) dotAlphas.current.set(key, newVal);

            if (newVal > 0.005) {
              const palIdx = (((k1 * 3 + k2 * 7) % PALETTE.length) + PALETTE.length) % PALETTE.length;
              const [r, g, b] = PALETTE[palIdx];
              ctx.beginPath();
              ctx.arc(ix, iy, DOT_SIZE * (0.5 + 0.5 * tSmooth), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${r},${g},${b},${newVal.toFixed(3)})`;
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }

    buildGrid();
    draw();

    const ro = new ResizeObserver(() => buildGrid());
    ro.observe(canvas);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
        ...style,
      }}
    />
  );
}
