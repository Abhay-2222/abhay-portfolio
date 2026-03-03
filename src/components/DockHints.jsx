/**
 * DockHints.jsx
 * Two sequential hand-drawn annotation hints pointing at the project dock.
 *
 * Hint 1 — Appears after intro completes (~5s after load):
 *           "Projects are docked here"
 *
 * Hint 2 — Appears on first scroll (40px threshold):
 *           "I've kept them all here — have a look whenever"
 *
 * Each fades in, stays 5 seconds, fades out.
 * Shown once per session (sessionStorage).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'dock-hints-v1';

/* ── Squiggly hand-drawn SVG arrow (points downward with S-curve) ── */
function SwirlyArrow({ flip = false }) {
  return (
    <svg
      width="36"
      height="68"
      viewBox="0 0 36 68"
      fill="none"
      style={{ flexShrink: 0, transform: flip ? 'scaleX(-1)' : 'none' }}
    >
      {/* S-curve — final control point directly above endpoint so it arrives vertically */}
      <path
        d="M 18,2 C 32,2 34,16 24,22 C 14,28 4,30 8,46 C 10,52 18,56 18,58"
        stroke="rgba(0,0,0,0.32)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* V arrowhead — wings at y=58 (curve endpoint), tip at y=66, centred on x=18 */}
      <path
        d="M 11,58 L 18,66 L 25,58"
        stroke="rgba(0,0,0,0.32)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Hint card: arrow + label ── */
function HintCard({ text, flip = false }) {
  return (
    <div style={{
      display:    'flex',
      flexDirection: flip ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap:        10,
    }}>
      <SwirlyArrow flip={flip} />
      <p style={{
        fontFamily:    '"Geist Mono", monospace',
        fontSize:      11,
        color:         'rgba(0,0,0,0.40)',
        lineHeight:    1.5,
        maxWidth:      148,
        paddingBottom: 10,
        margin:        0,
        whiteSpace:    'pre-wrap',
      }}>
        {text}
      </p>
    </div>
  );
}

const ANIM = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: 6  },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

/* ── Props: hidden — suppress while overlay is open ── */
export default function DockHints({ hidden = false }) {
  const [hint, setHint] = useState(null); // null | 'dock' | 'scroll'

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let idleTimer   = null;
    let dismissTimer = null;
    let scrollTimer  = null;
    let hint1Done    = false;
    let scrollShown  = false;

    /* ── Idle detection: hint 1 shows after 6s of no interaction ── */
    const IDLE_MS = 6000;

    const scheduleHint1 = () => {
      clearTimeout(idleTimer);
      if (hint1Done) return;
      idleTimer = setTimeout(() => {
        hint1Done = true;
        setHint('dock');
        dismissTimer = setTimeout(() => setHint(null), 5000);
      }, IDLE_MS);
    };

    /* Any interaction resets the idle countdown and dismisses hint 1 if visible */
    const onActivity = () => {
      setHint(prev => prev === 'dock' ? null : prev);
      clearTimeout(dismissTimer);
      scheduleHint1();
    };

    scheduleHint1(); // start clock immediately on mount

    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('click',     onActivity, { passive: true });
    window.addEventListener('keydown',   onActivity, { passive: true });

    /* ── Hint 2 — first meaningful scroll ── */
    const onScroll = () => {
      onActivity(); // scroll counts as activity, resets hint 1 idle timer
      if (scrollShown || window.scrollY < 40) return;
      scrollShown = true;
      /* cancel hint 1 if mid-flight */
      clearTimeout(idleTimer);
      clearTimeout(dismissTimer);
      hint1Done = true;
      setHint('scroll');
      scrollTimer = setTimeout(() => {
        setHint(null);
        sessionStorage.setItem(SESSION_KEY, '1');
      }, 5000);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(dismissTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('click',     onActivity);
      window.removeEventListener('keydown',   onActivity);
      window.removeEventListener('scroll',    onScroll);
    };
  }, []);

  /* Don't render if overlay is open */
  if (hidden) return null;

  return (
    <AnimatePresence>
      {hint === 'dock' && (
        <motion.div
          key="hint-dock"
          {...ANIM}
          style={{
            position:      'fixed',
            bottom:        108,
            left:          'calc(50% - 210px)',
            zIndex:        200,
            pointerEvents: 'none',
          }}
        >
          <HintCard text={'Projects are\ndocked here'} />
        </motion.div>
      )}

      {hint === 'scroll' && (
        <motion.div
          key="hint-scroll"
          {...ANIM}
          style={{
            position:      'fixed',
            bottom:        108,
            right:         'calc(50% - 210px)',
            zIndex:        200,
            pointerEvents: 'none',
          }}
        >
          <HintCard
            text={"I've kept them all here\nso you can look whenever"}
            flip
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
