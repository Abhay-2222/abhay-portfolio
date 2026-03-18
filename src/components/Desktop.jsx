/**
 * Desktop.jsx — Portfolio hero
 *
 * Layout: AbhayMark (top-left nameplate) + HeroStatement (directly below it)
 * Ball game toggled with B key or the ball button (bottom-right).
 * Click / touch anywhere in the hero spawns a ball that falls under gravity.
 * Same-color same-size balls merge into the next level.
 */
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import DotGrid      from './DotGrid.jsx';
import BallGame     from './BallGame.jsx';
import AbhayMark    from './AbhayMark.jsx';
import HeroScatter  from './HeroScatter.jsx';
import { INTRO_DURATION } from './IntroSequence.jsx';

/* ══════════════════════════════════════════════════════
   HERO STATEMENT
══════════════════════════════════════════════════════ */
function HeroStatement() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const role  = el.querySelector('.hero-line--role');
    const craft = el.querySelector('.hero-line--craft');
    gsap.set([role, craft], { opacity: 0 });
    gsap.set(role,  { x: -16 });
    gsap.set(craft, { x: -12 });
    const tl = gsap.timeline({ delay: INTRO_DURATION - 0.8 });
    tl.to(role,  { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' });
    tl.to(craft, { opacity: 1, x: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.3');
  }, []);

  return (
    <div
      ref={ref}
      className="hero-statement"
      style={{
        position: 'absolute', top: 92, left: 40, zIndex: 5,
        perspective: 600, pointerEvents: 'none', userSelect: 'none',
      }}
    >
      <p className="hero-line hero-line--role">Product designer & educator.</p>
      <p className="hero-line hero-line--craft">Based in Toronto — always up for a good conversation.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BALL ICON for toggle button
══════════════════════════════════════════════════════ */
function BallIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" fill={active ? '#F9A8D4' : 'none'}
        stroke={active ? '#F9A8D4' : '#8c8480'} strokeWidth="1.6" />
      <circle cx="8" cy="8" r="2.2"
        fill={active ? '#C4B5FD' : '#8c8480'} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
export default function Desktop({ gameMode, onGameModeChange, onNextColor }) {
  const heroRef = useRef(null);

  /* B key toggle */
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'b' && e.key !== 'B') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      onGameModeChange(g => !g);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onGameModeChange]);

  return (
    <div
      ref={heroRef}
      className="homepage-hero"
      aria-label="Portfolio — Abhay Sharma, Product Designer"
      style={{ background: '#ffffff', position: 'relative', overflow: 'hidden' }}
    >
      {/* z-index 0 — isometric grid background */}
      <DotGrid gameMode={gameMode} />

      {/* z-index 1 — scattered photos (hidden in game mode) */}
      {!gameMode && <HeroScatter />}

      {/* z-index 2 — physics ball game (canvas, pointer-events:none; container handles clicks) */}
      <BallGame active={gameMode} containerRef={heroRef} onNextColor={onNextColor} />

      {/* z-index 4 — film grain */}
      <div className="grain-layer" aria-hidden="true" style={{ zIndex: 4 }} />

      {/* z-index 10 — Abhay. nameplate */}
      <AbhayMark />

      {/* z-index 5 — role + craft */}
      <HeroStatement />

      {/* Ball game toggle — bottom right */}
      <button
        onClick={() => onGameModeChange(g => !g)}
        title={gameMode ? 'Exit ball game (B)' : 'Play ball game (B)'}
        style={{
          position: 'absolute', bottom: 104, right: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 12px 0 10px', height: 30, zIndex: 20,
          background: gameMode ? 'rgba(249,168,212,0.12)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${gameMode ? 'rgba(249,168,212,0.40)' : 'rgba(0,0,0,0.09)'}`,
          borderRadius: 20, cursor: 'pointer',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <BallIcon active={gameMode} />
        <span style={{
          fontFamily: '"DM Mono", monospace', fontSize: 10,
          letterSpacing: '0.05em',
          color: gameMode ? '#db5b9e' : '#8c8480',
          transition: 'color 0.2s',
        }}>
          {gameMode ? 'exit' : 'balls'}
        </span>
      </button>
    </div>
  );
}
