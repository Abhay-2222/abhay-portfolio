/**
 * CornerButtons.jsx
 * Two dock-styled pills anchored to the bottom corners.
 *
 * Bottom-left  — "AS" monogram → closes overlay / returns home
 *                Tooltip: random UX pun on every hover.
 * Bottom-right — "Resume" → opens resume.pdf in new tab.
 *
 * Visually identical to the dock pill (same glass, radius, shadow).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── UX puns — new one each hover ─── */
const PUNS = [
  "Fitts's Law: satisfied.",
  "Affordance: activated.",
  "This hover sparks joy.",
  "A/B tested. You got the good variant.",
  "Error 404: bad UX not found.",
  "Nielsen heuristic #1: ✓",
  "Cognitive load: minimal.",
  "Dark pattern count: 0.",
  "Your mental model is correct.",
  "Progressive disclosure: engaged.",
  "Hick's Law: fast choice confirmed.",
  "Gestalt achieved.",
  "Microinteraction: intentional.",
  "Reducing friction since 2024.",
  "System status: visible. You're welcome.",
  "Don Norman approves this click.",
];

/* ─── Shared dock-identical pill styles ─── */
const PILL = {
  display:              'flex',
  alignItems:           'center',
  gap:                  6,
  background:           'rgba(255,255,255,0.75)',
  backdropFilter:       'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border:               '1px solid rgba(0,0,0,0.08)',
  borderRadius:         14,
  padding:              '8px 16px',
  boxShadow:            '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
  cursor:               'none',
  textDecoration:       'none',
  transition:           'transform 0.2s ease, background 0.2s ease',
};

const DOT = {
  width: 8, height: 8,
  borderRadius: '50%',
  flexShrink: 0,
};

const LABEL = {
  fontFamily:    '"Geist Sans", system-ui, sans-serif',
  fontSize:      10,
  fontWeight:    500,
  letterSpacing: '-0.01em',
  whiteSpace:    'nowrap',
  transition:    'color 0.15s ease',
};

const TOOLTIP = {
  position:       'absolute',
  bottom:         'calc(100% + 8px)',
  left:           '50%',
  transform:      'translateX(-50%)',
  whiteSpace:     'nowrap',
  fontFamily:     '"Geist Mono", monospace',
  fontSize:       10,
  color:          'rgba(0,0,0,0.55)',
  background:     'rgba(255,255,255,0.95)',
  border:         '1px solid rgba(0,0,0,0.08)',
  borderRadius:   6,
  padding:        '4px 10px',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  pointerEvents:  'none',
  zIndex:         1100,
  boxShadow:      '0 2px 8px rgba(0,0,0,0.06)',
};

function randomPun() {
  return PUNS[Math.floor(Math.random() * PUNS.length)];
}

export default function CornerButtons({ onLogoClick }) {
  const [asHovered,     setAsHovered]     = useState(false);
  const [resumeHovered, setResumeHovered] = useState(false);
  const [pun,           setPun]           = useState('');

  const onAsEnter = () => { setPun(randomPun()); setAsHovered(true);     };
  const onAsLeave = () => {                      setAsHovered(false);    };
  const onRsEnter = () => {                      setResumeHovered(true); };
  const onRsLeave = () => {                      setResumeHovered(false);};

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── AS — bottom left ── */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 210 }}>
        <div style={{ position: 'relative' }}>

          <AnimatePresence>
            {asHovered && (
              <motion.div
                key="pun"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                style={TOOLTIP}
              >
                {pun}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onLogoClick}
            onMouseEnter={onAsEnter}
            onMouseLeave={onAsLeave}
            data-cursor-hover
            aria-label="Home"
            style={{
              ...PILL,
              border: '1px solid rgba(0,0,0,0.08)',
              background: asHovered ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
              transform: asHovered ? 'translateY(-3px)' : 'translateY(0)',
            }}
          >
            <div style={{ ...DOT, background: '#0A0A0A' }} />
            <span style={{ ...LABEL, color: asHovered ? '#0A0A0A' : 'rgba(0,0,0,0.60)' }}>
              AS
            </span>
          </button>
        </div>
      </div>

      {/* ── Resume — bottom right ── */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 210 }}>
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={onRsEnter}
          onMouseLeave={onRsLeave}
          data-cursor-hover
          aria-label="Open Resume"
          style={{
            ...PILL,
            display: 'flex',
            background: resumeHovered ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
            transform: resumeHovered ? 'translateY(-3px)' : 'translateY(0)',
          }}
        >
          <div style={{ ...DOT, background: 'rgba(0,0,0,0.45)' }} />
          <span style={{ ...LABEL, color: resumeHovered ? '#0A0A0A' : 'rgba(0,0,0,0.60)' }}>
            Resume
          </span>
        </a>
      </div>
    </motion.div>
  );
}
