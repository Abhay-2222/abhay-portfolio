/**
 * Desktop.jsx — Portfolio hero
 *
 * Layout: AbhayMark (top-left nameplate) + HeroStatement (directly below it)
 * Game mode toggled with M key or mine button (bottom-right)
 */
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import DotGrid            from './DotGrid.jsx';
import AbhayMark          from './AbhayMark.jsx';
import useMinesweeper     from './minesweeper/useMinesweeper.js';
import MinesweeperOverlay from './minesweeper/MinesweeperOverlay.jsx';
import MinesweeperHUD     from './minesweeper/MinesweeperHUD.jsx';
import { INTRO_DURATION } from './IntroSequence.jsx';

/* ══════════════════════════════════════════════════════
   HERO STATEMENT — sits directly below AbhayMark
   AbhayMark: top 36, height 52 → statement starts at ~104
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
        position: 'absolute',
        top: 92,
        left: 40,
        zIndex: 5,
        perspective: 600,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <p className="hero-line hero-line--role">Product designer & educator.</p>
      <p className="hero-line hero-line--craft">Based in Toronto — always up for a good conversation.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MINE ICON
══════════════════════════════════════════════════════ */
function MineIcon({ active }) {
  const c = active ? '#c8602a' : '#8c8480';
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.5" fill={c} />
      <line x1="8" y1="1"  x2="8"  y2="4"  stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12" x2="8"  y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8"  x2="4"  y2="8"  stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="8" x2="15" y2="8"  stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3"  y1="3" x2="5"  y2="5"  stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="11" x2="13" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="3" x2="11" y2="5"  stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5"  y1="11" x2="3"  y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
export default function Desktop() {
  const [gameMode, setGameMode] = useState(false);
  const heroRef = useRef(null);

  const {
    phase, board, rows, cols,
    flagCount, mineCount, elapsed, score, hitCell,
    startGame, handleClick, handleRightClick,
  } = useMinesweeper();

  /* M key toggle */
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      setGameMode(g => !g);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Start game when mode activates */
  useEffect(() => {
    if (gameMode && heroRef.current) {
      startGame(heroRef.current.offsetWidth, heroRef.current.offsetHeight);
    }
  }, [gameMode]); // eslint-disable-line

  function handleRestart() {
    if (heroRef.current) {
      startGame(heroRef.current.offsetWidth, heroRef.current.offsetHeight);
    }
  }

  return (
    <div
      ref={heroRef}
      className="homepage-hero"
      aria-label="Portfolio — Abhay Sharma, Product Designer"
      style={{
        background: '#f7f5f0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* z-index 0 — background */}
      <DotGrid gameMode={gameMode} />

      {/* z-index 3 — minesweeper board (game mode only) */}
      {gameMode && (
        <MinesweeperOverlay
          board={board}
          rows={rows}
          cols={cols}
          phase={phase}
          hitCell={hitCell}
          onCellClick={(r, c) => handleClick(r, c)}
          onCellRightClick={handleRightClick}
        />
      )}

      {/* z-index 4 — film grain */}
      <div className="grain-layer" aria-hidden="true" style={{ zIndex: 4 }} />

      {/* z-index 10 — Abhay. nameplate */}
      <AbhayMark />

      {/* z-index 5 — role + craft (below nameplate) */}
      <HeroStatement />

      {/* z-index 10 — HUD + win/loss overlays */}
      {gameMode && (
        <MinesweeperHUD
          phase={phase}
          minesRemaining={mineCount - flagCount}
          elapsed={elapsed}
          score={score}
          onRestart={handleRestart}
        />
      )}

      {/* Game toggle button — bottom right */}
      <button
        onClick={() => setGameMode(g => !g)}
        title={gameMode ? 'Exit game (M)' : 'Play minesweeper (M)'}
        style={{
          position: 'absolute', bottom: 104, right: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 12px 0 10px',
          height: 30, zIndex: 10,
          background: gameMode ? 'rgba(200,96,42,0.10)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${gameMode ? 'rgba(200,96,42,0.28)' : 'rgba(0,0,0,0.09)'}`,
          borderRadius: 20,
          cursor: 'pointer',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <MineIcon active={gameMode} />
        <span style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.05em',
          color: gameMode ? '#c8602a' : '#8c8480',
          transition: 'color 0.2s',
        }}>
          {gameMode ? 'exit' : 'game'}
        </span>
      </button>
    </div>
  );
}
