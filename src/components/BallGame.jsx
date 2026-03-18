/**
 * BallGame.jsx — Suika-style physics ball merger game
 *
 * Click / touch anywhere in the hero → drop a ball from that X.
 * Gravity pulls balls down. Two balls of the SAME color & size that touch → merge
 * into the next level (bigger, different color). Reach level 8 to win!
 *
 * Pure canvas — no external physics lib.
 */
import { useEffect, useRef, useCallback } from 'react';

/* ── Ball levels ─────────────────────────────────────── */
const LEVELS = [
  { r: 14, color: '#F9A8D4', label: 'Pink'   },  // 0
  { r: 20, color: '#FDBA74', label: 'Orange' },  // 1
  { r: 27, color: '#FCA5A5', label: 'Red'    },  // 2
  { r: 34, color: '#FDE68A', label: 'Yellow' },  // 3
  { r: 42, color: '#86EFAC', label: 'Green'  },  // 4
  { r: 51, color: '#67E8F9', label: 'Teal'   },  // 5
  { r: 61, color: '#93C5FD', label: 'Blue'   },  // 6
  { r: 73, color: '#C4B5FD', label: 'Purple' },  // 7 — max
];

const GRAVITY    = 0.35;
const DAMPING    = 0.52;   // bounce energy retention
const FRICTION   = 0.88;   // horizontal friction on floor
const SUBSTEPS   = 3;      // physics sub-steps per frame for stability
const MAX_BALLS  = 60;

let _idCounter = 0;
function makeBall(x, y, level) {
  const { r, color } = LEVELS[level];
  return {
    id:    ++_idCounter,
    x, y,
    vx: (Math.random() - 0.5) * 1.2,
    vy: 0,
    r,
    level,
    color,
    merging: false,   // locked during merge flash
    flash:   0,       // countdown for merge highlight
  };
}

/* ── Physics step ────────────────────────────────────── */
function step(balls, W, H, dt) {
  // Gravity + integrate
  for (const b of balls) {
    if (b.merging) continue;
    b.vy += GRAVITY * dt;
    b.x  += b.vx * dt;
    b.y  += b.vy * dt;

    // Floor
    if (b.y + b.r > H) {
      b.y  = H - b.r;
      b.vy *= -DAMPING;
      b.vx *= FRICTION;
    }
    // Walls
    if (b.x - b.r < 0) { b.x = b.r;  b.vx *= -DAMPING; }
    if (b.x + b.r > W) { b.x = W - b.r; b.vx *= -DAMPING; }
    // Ceiling
    if (b.y - b.r < 0) { b.y = b.r; b.vy *= -DAMPING; }

    // Flash cooldown
    if (b.flash > 0) b.flash--;
  }
}

/* ── Collision + merge detection ─────────────────────── */
function collideAndMerge(balls) {
  const toRemove = new Set();
  const toAdd    = [];

  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.merging || toRemove.has(a.id)) continue;

    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      if (b.merging || toRemove.has(b.id)) continue;

      const dx   = b.x - a.x;
      const dy   = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minD = a.r + b.r;

      if (dist < minD) {
        // ── MERGE: same level ──
        if (a.level === b.level && a.level < LEVELS.length - 1) {
          toRemove.add(a.id);
          toRemove.add(b.id);
          const nx     = (a.x + b.x) / 2;
          const ny     = (a.y + b.y) / 2;
          const nb     = makeBall(nx, ny, a.level + 1);
          // carry combined momentum
          nb.vx  = (a.vx + b.vx) * 0.4;
          nb.vy  = (a.vy + b.vy) * 0.4;
          nb.flash = 12;
          toAdd.push(nb);
          break; // a is gone, move to next i
        }

        // ── ELASTIC PUSH: different level or max level ──
        if (dist > 0.001) {
          const nx    = dx / dist;
          const ny    = dy / dist;
          const over  = minD - dist;
          a.x -= nx * over * 0.5;
          a.y -= ny * over * 0.5;
          b.x += nx * over * 0.5;
          b.y += ny * over * 0.5;

          // Velocity exchange along normal
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dot  = dvx * nx + dvy * ny;
          if (dot > 0) {
            const impulse = dot * 0.6;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;
          }
        }
      }
    }
  }

  const kept = balls.filter(b => !toRemove.has(b.id));
  return [...kept, ...toAdd];
}

/* ── Canvas render ───────────────────────────────────── */
function render(ctx, balls, W, H) {
  ctx.clearRect(0, 0, W, H);

  for (const b of balls) {
    ctx.save();

    // Merge flash ring
    if (b.flash > 0) {
      const t = b.flash / 12;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6 * t, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * t})`;
      ctx.lineWidth   = 3;
      ctx.stroke();
    }

    // Ball fill
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle   = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur  = 8;
    ctx.fill();

    // Subtle inner highlight
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.restore();
  }
}

/* ── Component ───────────────────────────────────────── */
export default function BallGame({ active, containerRef, onNextColor }) {
  const canvasRef    = useRef(null);
  const balls        = useRef([]);
  const animId       = useRef(null);
  const nextLevelRef = useRef(Math.floor(Math.random() * 3));

  // Notify parent of initial color when game starts / clear when game ends
  useEffect(() => {
    if (active) {
      onNextColor?.(LEVELS[nextLevelRef.current].color);
    } else {
      onNextColor?.(null);
      nextLevelRef.current = Math.floor(Math.random() * 3);
    }
  }, [active]); // eslint-disable-line

  const spawnBall = useCallback((clientX) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (balls.current.length >= MAX_BALLS) return;
    const rect  = canvas.getBoundingClientRect();
    const x     = Math.max(30, Math.min(rect.width - 30, clientX - rect.left));
    const b     = makeBall(x, 20, nextLevelRef.current);
    balls.current = [...balls.current, b];
    // Pre-queue next ball and tell the cursor
    nextLevelRef.current = Math.floor(Math.random() * 3);
    onNextColor?.(LEVELS[nextLevelRef.current].color);
  }, [onNextColor]);

  // Attach pointer events to the container
  useEffect(() => {
    if (!active) return;
    const container = containerRef?.current;
    if (!container) return;

    const onClick = (e) => {
      // Ignore game-toggle button clicks
      if (e.target.closest('button')) return;
      spawnBall(e.clientX);
    };
    const onTouch = (e) => {
      // Let button taps propagate naturally — don't intercept them
      if (e.target.closest('button')) return;
      e.preventDefault();
      for (const t of e.changedTouches) spawnBall(t.clientX);
    };

    container.addEventListener('click',      onClick);
    container.addEventListener('touchstart', onTouch, { passive: false });
    return () => {
      container.removeEventListener('click',      onClick);
      container.removeEventListener('touchstart', onTouch);
    };
  }, [active, containerRef, spawnBall]);

  // Physics loop
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animId.current);
      balls.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const pr = window.devicePixelRatio || 1;
      const W  = canvas.offsetWidth;
      const H  = canvas.offsetHeight;
      canvas.width  = W * pr;
      canvas.height = H * pr;
      ctx.scale(pr, pr);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = performance.now();
    function loop(now) {
      const dt   = Math.min((now - last) / 16.67, 3); // cap at 3 frames
      last = now;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      for (let s = 0; s < SUBSTEPS; s++) {
        step(balls.current, W, H, dt / SUBSTEPS);
        balls.current = collideAndMerge(balls.current);
      }

      render(ctx, balls.current, W, H);
      animId.current = requestAnimationFrame(loop);
    }

    animId.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId.current);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:          0,
        width:         '100%',
        height:        '100%',
        zIndex:         2,
        display:       'block',
        pointerEvents: 'none',  // container handles clicks
      }}
    />
  );
}
