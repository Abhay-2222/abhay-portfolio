/**
 * Desktop.jsx
 * Scroll-driven homepage hero — 400vh container with a sticky 100vh layer.
 *
 * Layout (inside sticky layer, z-index local):
 *   z-1  : particle canvas (floating dots)
 *   z-10 : glass cube (Three.js, canvas appended to cube mount div)
 *   z-20 : name bubble (left, speech-bubble tail) + 4 corner bubbles
 *   z-30 : scroll hint (fades out after first ~6% of scroll)
 *
 * Scroll behaviour:
 *   - scrollProgressRef (0→1) drives cube rotation (2 full turns)
 *   - name bubble parallaxes upward + fades at 80%+
 *   - corner bubbles appear staggered, parallax outward from centre
 *   - scroll hint fades as soon as scrolling begins
 */

import { useEffect, useRef } from 'react';
import GlassCube from './GlassCube.jsx';

const CORNER_BUBBLES = [
  {
    id:       'tl',
    pos:      'tl',
    label:    'Product Design',
    sub:      'End-to-end systems',
    appearAt: 0.14,
  },
  {
    id:       'tr',
    pos:      'tr',
    label:    'UX Research',
    sub:      'Evidence-led',
    appearAt: 0.28,
  },
  {
    id:       'bl',
    pos:      'bl',
    label:    'AI × Healthcare',
    sub:      'CareSummarizer',
    appearAt: 0.44,
  },
  {
    id:       'br',
    pos:      'br',
    label:    'Motion & Code',
    sub:      'GSAP · Three.js',
    appearAt: 0.60,
  },
];

function Desktop() {
  const containerRef  = useRef(null);   // cube's DOM mount (Three.js appends canvas here)
  const scrollProgRef = useRef(0);      // 0→1 scroll progress shared with GlassCube
  const canvasRef     = useRef(null);   // particle canvas
  const mouseRef      = useRef({ x: -9999, y: -9999 });
  const nameBubbleRef = useRef(null);
  const bubbleRefs    = useRef([]);

  /* ── Scroll tracking + parallax ── */
  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress  = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgRef.current = progress;

      /* Name bubble: drift upward + fade near the end of the scroll */
      if (nameBubbleRef.current) {
        const ty = progress * -64;
        const op = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.18) : 1;
        nameBubbleRef.current.style.transform = `translateY(calc(-50% + ${ty}px))`;
        nameBubbleRef.current.style.opacity   = String(op);
      }

      /* Corner bubbles: appear staggered, parallax outward from centre */
      CORNER_BUBBLES.forEach((b, i) => {
        const el = bubbleRefs.current[i];
        if (!el) return;
        const appear = Math.max(0, Math.min(1, (progress - b.appearAt) / 0.12));
        const isTop  = b.pos.startsWith('t');
        const isLeft = b.pos.endsWith('l');
        const dy = (isTop  ? -1 : 1) * progress * (42 + i * 8);
        const dx = (isLeft ? -1 : 1) * progress * (22 + i * 6);
        el.style.opacity   = String(appear);
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initialise on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Particle field ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const COUNT = 360;
    const particles = Array.from({ length: COUNT }, () => ({
      x:       Math.random() * 1920,
      y:       Math.random() * 1080,
      r:       0.8 + Math.random() * 2.2,
      opacity: 0.04 + Math.random() * 0.50,
      baseVx:  (Math.random() - 0.5) * 0.35,
      baseVy:  -(0.12 + Math.random() * 0.45),
      vx: 0,
      vy: 0,
    }));

    const REPEL_RADIUS = 90;
    const REPEL_FORCE  = 4.5;
    const DAMPING      = 0.88;
    const RETURN_RATE  = 0.03;

    let rafId;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        p.vx += (p.baseVx - p.vx) * RETURN_RATE;
        p.vy += (p.baseVy - p.vy) * RETURN_RATE;

        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const strength = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * strength;
          p.vy += (dy / dist) * strength;
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        if (p.x < -4)    p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4)    p.y = h + 4;
        if (p.y > h + 4) p.y = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${p.opacity * 0.08})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  /* ── Mouse tracking (client coords — sticky layer is full viewport) ── */
  useEffect(() => {
    const onMove  = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()  => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      className="homepage-scroll"
      aria-label="Portfolio — Abhay Sharma, Product Designer"
    >
      {/* Sticky viewport layer — sticks for the full 400vh */}
      <div className="homepage-sticky">

        {/* Particle canvas — z 1 */}
        <canvas
          ref={canvasRef}
          className="homepage-particles"
          aria-hidden="true"
        />

        {/* Cube mount — z 10; Three.js canvas appended here by GlassCube */}
        <div
          ref={containerRef}
          className="homepage-cube-mount"
          aria-hidden="true"
        />
        <GlassCube
          containerRef={containerRef}
          scrollProgressRef={scrollProgRef}
        />

        {/* Name bubble — left side, speech-bubble tail pointing right — z 20 */}
        <div
          ref={nameBubbleRef}
          className="name-bubble"
          aria-label="Abhay Sharma, Product Designer"
        >
          <span className="name-bubble-role">Product Designer</span>
          <span className="name-bubble-name">
            Abhay<br />Sharma
          </span>
        </div>

        {/* Corner bubbles — appear staggered as user scrolls — z 20 */}
        {CORNER_BUBBLES.map((b, i) => (
          <div
            key={b.id}
            ref={(el) => { bubbleRefs.current[i] = el; }}
            className={`corner-bubble corner-bubble--${b.pos}`}
          >
            <span className="corner-bubble-label">{b.label}</span>
            <span className="corner-bubble-sub">{b.sub}</span>
          </div>
        ))}

        {/* Scroll hint — time-based fade (CSS animation, ~11s) — z 30 */}
        <div
          className="scroll-hint"
          aria-hidden="true"
        >
          <span className="scroll-hint-text">Scroll to explore</span>
          <div className="scroll-hint-arrow" />
        </div>

      </div>
    </div>
  );
}

export default Desktop;
