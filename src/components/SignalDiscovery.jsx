/**
 * SignalDiscovery.jsx — Minesweeper-style signal discovery layer
 * Handles: click → snap → proximity state → hint labels / signal cards
 * Signal 0: pulsing orange entry dot
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { CELL, SIGNAL_0, SIGNALS, HINT_TEXT } from './SignalMap.js';

/* ── inject once ── */
function injectStyles() {
  if (document.getElementById('sig-styles')) return;
  const s = document.createElement('style');
  s.id = 'sig-styles';
  s.textContent = `
    @keyframes sig-dot { 0%{transform:scale(.375)} 40%{transform:scale(1)} 100%{transform:scale(.375)} }
    .sig-dot-fx { animation: sig-dot 600ms ease-out forwards; }
    @keyframes sig-ring { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(2.2);opacity:0} }
    .sig-o-ring { animation: sig-ring 2s ease-in-out infinite; animation-delay: 5.1s; }
  `;
  document.head.appendChild(s);
}

/* ── Connector line from dot to card edge ── */
function ConnectorLine({ x1, y1, x2, y2 }) {
  const lineRef = useRef();
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const length = Math.hypot(x2 - x1, y2 - y1);
    gsap.fromTo(line,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' },
    );
  }, []); // eslint-disable-line
  return (
    <line
      ref={lineRef}
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(200,140,80,0.3)"
      strokeWidth="1"
      fill="none"
    />
  );
}

/* ── snap click to nearest grid dot ── */
function snapToGrid(x, y) {
  return {
    x: Math.round(x / CELL) * CELL,
    y: Math.round(y / CELL) * CELL,
  };
}

/* ── Euclidean distance in cell units ── */
function cellDist(ax, ay, bx, by) {
  const dx = (bx - ax) / CELL;
  const dy = (by - ay) / CELL;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ── viewport-safe card position ── */
function safeCardPos(dotX, dotY, heroW, heroH) {
  const PAD = 12, CARD_W = 296, CARD_H = 160;
  // protected zone: bottom 200px of hero, left 400px
  const inProtected = dotX < 400 && dotY > (heroH - 200);
  let left = dotX + PAD;
  let top  = dotY - PAD;
  if (left + CARD_W > heroW - 16) left = dotX - CARD_W - PAD;
  if (top  + CARD_H > heroH - 16) top  = dotY - CARD_H - PAD;
  if (inProtected) { left = Math.max(dotX, 420); top = Math.max(0, dotY - CARD_H - 40); }
  left = Math.max(8, left);
  top  = Math.max(8, top);
  return { left, top };
}

/* ── Signal card ── */
function SignalCard({ signal, pos, cardKey, onClose }) {
  const s = signal;
  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        left: pos.left, top: pos.top,
        width: 280, maxWidth: 280,
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        pointerEvents: 'auto',
        zIndex: 20,
      }}
    >
      {/* Header row — color accent dot + close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.tagColor }} />
        <button onClick={onClose} style={{
          fontSize: 14, color: '#a89e8c',
          border: 'none', background: 'none',
          cursor: 'pointer', lineHeight: 1, padding: 0,
        }}>×</button>
      </div>

      {/* Title */}
      {s.title && (
        <p style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 14, fontWeight: 500,
          color: 'rgba(0,0,0,0.82)', margin: '0 0 6px',
          letterSpacing: '-0.01em',
        }}>{s.title}</p>
      )}

      {/* Quote (principle) */}
      {s.quote && (
        <p style={{
          fontFamily: 'new-spirit, serif',
          fontSize: 13, fontStyle: 'italic',
          color: 'rgba(0,0,0,0.65)', margin: '0 0 6px',
          textAlign: 'center', lineHeight: 1.5,
        }}>{s.quote}</p>
      )}

      {/* Subtitle */}
      {s.subtitle && (
        <p style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 12, color: 'rgba(0,0,0,0.50)',
          margin: '0 0 8px', lineHeight: 1.5,
        }}>{s.subtitle}</p>
      )}

      {/* Meta label */}
      {s.meta && (
        <p style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 10, color: '#a89e8c',
          letterSpacing: '0.02em', margin: 0,
        }}>{s.meta}</p>
      )}

      {/* Pills (hello card) */}
      {s.pills && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {s.pills.map(p => (
            <span key={p} style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 10, color: '#6b6560',
              background: '#f0ede6', borderRadius: 20,
              padding: '6px 12px',
            }}>{p}</span>
          ))}
        </div>
      )}

      {/* Explore nudge — only on hello card */}
      {s.id === 0 && (
        <p style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 10, color: '#c8c2ba',
          letterSpacing: '0.02em',
          margin: '14px 0 0',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          paddingTop: 10,
        }}>
          click anywhere on the canvas to explore ↗
        </p>
      )}
    </motion.div>
  );
}

let cardCounter = 0;

export default function SignalDiscovery({ heroRef, onSignalFound, foundIds, signalPosRef, gameMode }) {
  const [cards, setCards]         = useState([]);
  const [showStart, setShowStart] = useState(false);
  const effectsRef   = useRef(null);  // container for transient DOM effects
  const sigPositions = useRef([]);    // cached pixel positions
  const sig0pos      = useRef({ x: 0, y: 0 });
  const firstClick   = useRef(true);
  const heroEl       = useRef(null);
  const sig0Ref      = useRef(null);  // inner wrapper for GSAP scale entrance

  injectStyles();

  /* ── Cache signal pixel positions ── */
  const calcPositions = useCallback(() => {
    const el = heroRef?.current;
    if (!el) return;
    heroEl.current = el;
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    sigPositions.current = SIGNALS.map(s => ({
      ...s,
      px: W * s.pctX / 100,
      py: H * s.pctY / 100,
      found: foundIds.has(s.id),
    }));
    if (signalPosRef) signalPosRef.current = sigPositions.current;
    sig0pos.current = {
      x: W * SIGNAL_0.pctX / 100,
      y: H * SIGNAL_0.pctY / 100,
    };
  }, [heroRef, signalPosRef, foundIds]);

  /* ── Show "start here" after 2s ── */
  useEffect(() => {
    const t = setTimeout(() => setShowStart(true), 2000);
    return () => clearTimeout(t);
  }, []);

  /* ── Setup resize + initial calc ── */
  useEffect(() => {
    calcPositions();
    let debounce;
    const onResize = () => { clearTimeout(debounce); debounce = setTimeout(calcPositions, 100); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(debounce); };
  }, [calcPositions]);

  /* ── Signal 0 entrance: elastic scale-in at delay 5.1s ── */
  useEffect(() => {
    if (!sig0Ref.current) return;
    gsap.fromTo(sig0Ref.current,
      { scale: 0 },
      { scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 5.1 },
    );
  }, []);

  /* ── Transient dot pulse DOM fx ── */
  function spawnDotFx(x, y) {
    const el = effectsRef.current;
    if (!el) return;
    const dot = document.createElement('div');
    dot.className = 'sig-dot-fx';
    dot.style.cssText = `
      position:absolute; left:${x - 4}px; top:${y - 4}px;
      width:8px; height:8px; border-radius:50%;
      background:#c8c2ba; pointer-events:none;
      transform:scale(.375);
    `;
    el.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  }

  /* ── Transient proximity hint DOM fx ── */
  function spawnHint(x, y, text, strong) {
    const el = effectsRef.current;
    if (!el) return;
    const label = document.createElement('div');
    label.style.cssText = `
      position:absolute; left:${x}px; top:${y - 18}px;
      transform:translateX(-50%);
      font-family:"DM Sans",system-ui,sans-serif; font-size:11px;
      color:${strong ? '#6b6560' : '#a89e8c'};
      pointer-events:none; white-space:nowrap;
      opacity:0; transition:opacity 200ms;
    `;
    label.textContent = strong ? 'getting closer —' : text;
    el.appendChild(label);
    requestAnimationFrame(() => { label.style.opacity = '1'; });
    setTimeout(() => {
      label.style.transition = 'opacity 300ms';
      label.style.opacity = '0';
      setTimeout(() => label.remove(), 320);
    }, 1800);
  }

  /* ── Open a signal card ── */
  function openCard(signal, px, py) {
    if (foundIds.has(signal.id) && signal.id !== 0) return;
    const el = heroEl.current;
    if (!el) return;
    const pos = safeCardPos(px, py, el.offsetWidth, el.offsetHeight);
    const key = `card-${++cardCounter}`;
    setCards(prev => {
      const next = [...prev, { key, signal, pos, dotX: px, dotY: py }];
      return next.length > 3 ? next.slice(1) : next;
    });
    if (signal.id !== 0) {
      onSignalFound(signal.id);
      // Mark as found in posRef so DotGrid stops glowing it
      if (signalPosRef) {
        signalPosRef.current = signalPosRef.current.map(s =>
          s.id === signal.id ? { ...s, found: true } : s
        );
      }
    }
  }

  /* ── Click handler ── */
  useEffect(() => {
    const el = heroRef?.current;
    if (!el) return;

    function onClick(e) {
      // Ignore clicks on UI elements
      if (e.target.closest('[data-signal-ui]')) return;

      // First click: dismiss "start here"
      if (firstClick.current) {
        firstClick.current = false;
        setShowStart(false);
      }

      const rect = el.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const { x, y } = snapToGrid(rawX, rawY);

      // Check Signal 0
      const d0 = cellDist(x, y, sig0pos.current.x, sig0pos.current.y);
      if (d0 < 1.5) { openCard(SIGNAL_0, sig0pos.current.x, sig0pos.current.y); return; }

      // Check SIGNALS
      let nearest = null, minDist = Infinity;
      for (const sig of sigPositions.current) {
        const d = cellDist(x, y, sig.px, sig.py);
        if (d < minDist) { minDist = d; nearest = sig; }
      }

      if (minDist < 1.5) {
        openCard(nearest, nearest.px, nearest.py);
      } else {
        spawnDotFx(x, y);
      }
    }

    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [heroRef, foundIds]); // eslint-disable-line

  const o0 = sig0pos.current;

  return (
    <div
      data-signal-ui="root"
      style={{
        position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
        opacity: gameMode ? 0 : 1,
        transition: 'opacity 0.3s',
        ...(gameMode ? { pointerEvents: 'none' } : {}),
      }}
    >
      {/* Transient DOM effects container */}
      <div ref={effectsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Signal 0 — orange entry dot */}
      <div
        data-signal-ui
        onClick={() => {
          if (firstClick.current) { firstClick.current = false; setShowStart(false); }
          openCard(SIGNAL_0, o0.x, o0.y);
        }}
        style={{
          position: 'absolute',
          left: `${SIGNAL_0.pctX}%`,
          top:  `${SIGNAL_0.pctY}%`,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'auto',
          cursor: 'pointer',
          zIndex: 8,
        }}
      >
        {/* Inner wrapper — GSAP scales this independently of translate */}
        <div ref={sig0Ref} style={{ position: 'relative', transform: 'scale(0)' }}>
          {/* Pulse ring */}
          <div className="sig-o-ring" style={{
            position: 'absolute', inset: -5,
            borderRadius: '50%',
            border: '1.5px solid #E86B2E',
            pointerEvents: 'none',
          }} />
          {/* Dot */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#E86B2E',
            position: 'relative',
          }} />
        </div>

        {/* "start here" label */}
        <AnimatePresence>
          {showStart && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                left: 16, top: '50%', transform: 'translateY(-50%)',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 11, color: '#a89e8c',
                whiteSpace: 'nowrap', pointerEvents: 'none',
              }}
            >
              start here
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Connector lines — SVG layer */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
          zIndex: 19,
        }}
      >
        {cards
          .filter(c => c.signal.id !== 0)
          .map(c => {
            const cardIsRight = c.pos.left > c.dotX;
            const x2 = cardIsRight ? c.pos.left : c.pos.left + 280;
            const y2 = c.pos.top + 80;
            return (
              <ConnectorLine
                key={c.key}
                x1={c.dotX} y1={c.dotY}
                x2={x2}    y2={y2}
              />
            );
          })}
      </svg>

      {/* Signal cards */}
      <AnimatePresence>
        {cards.map(c => (
          <SignalCard
            key={c.key}
            cardKey={c.key}
            signal={c.signal}
            pos={c.pos}
            onClose={() => setCards(prev => prev.filter(x => x.key !== c.key))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
