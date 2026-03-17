/**
 * DotGrid.jsx — cursor-reactive dot grid background
 * Each dot has a latent colour from the project palette; hovering reveals it.
 * In game mode: dots render at base size only (clean substrate for minesweeper).
 */
import { useEffect, useRef } from 'react';

const SPACING    = 24;
const DOT_BASE   = 1.5;
const DOT_HOVER  = 4;
const RADIUS     = 110;
const LERP_SPEED = 0.1;

const COLOR_BASE = [237, 234, 229];

/* Project gradient colours — light pastels from preview cards */
const PALETTE = [
  [200, 96,  42],   // accent orange  #c8602a
  [46,  109, 180],  // blue           #2E6DB4
  [124, 77,  204],  // purple         #7C4DCC
  [45,  106, 69],   // green          #2D6A45
  [14,  165, 233],  // sky            #0EA5E9
  [201, 168, 76],   // gold           #C9A84C
];

function lerpRGB(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Assign a stable colour to each dot based on its grid position.
 * Uses overlapping sine waves so colours flow organically across the canvas.
 */
function dotPaletteIndex(col, row) {
  const v = Math.sin(col * 0.37 + row * 0.21) * 0.5
          + Math.sin(col * 0.13 - row * 0.44) * 0.5;
  const norm = (v + 1) / 2; // 0 → 1
  return Math.floor(norm * PALETTE.length) % PALETTE.length;
}

export default function DotGrid({ style, gameMode }) {
  const canvasRef   = useRef(null);
  const mouse       = useRef({ x: -9999, y: -9999 });
  const radii       = useRef(null);
  const alphas      = useRef(null); // per-dot colour reveal progress
  const gameModeRef = useRef(gameMode);
  gameModeRef.current = gameMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let cols = 0, rows = 0;
    let dotColors = null; // pre-computed colour per dot

    function buildGrid() {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;
      const count = cols * rows;
      radii.current  = new Float32Array(count).fill(DOT_BASE);
      alphas.current = new Float32Array(count).fill(0);
      dotColors = new Array(count);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotColors[r * cols + c] = PALETTE[dotPaletteIndex(c, r)];
        }
      }
    }

    function draw() {
      const W  = canvas.width  / window.devicePixelRatio;
      const H  = canvas.height / window.devicePixelRatio;
      const gm = gameModeRef.current;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x   = c * SPACING;
          const y   = r * SPACING;

          let targetR     = DOT_BASE;
          let targetAlpha = 0;

          if (!gm) {
            const dx   = x - mx, dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const t    = dist < RADIUS ? 1 - dist / RADIUS : 0;
            // ease the falloff for a softer edge
            const tSmooth = t * t * (3 - 2 * t);
            targetR     = DOT_BASE + (DOT_HOVER - DOT_BASE) * tSmooth;
            targetAlpha = tSmooth;
          }

          radii.current[idx]  += (targetR     - radii.current[idx])  * LERP_SPEED;
          alphas.current[idx] += (targetAlpha - alphas.current[idx]) * LERP_SPEED;

          const a   = alphas.current[idx];
          const col = dotColors ? dotColors[idx] : COLOR_BASE;
          const [fr, fg, fb] = lerpRGB(COLOR_BASE, col, a);

          ctx.beginPath();
          ctx.arc(x, y, radii.current[idx], 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
          ctx.fill();
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
