/**
 * SplashScreen.jsx — First-visit onboarding overlay for Design System Builder
 * Shows once per browser session. Dismissed by button click or backdrop click.
 */

import { motion, AnimatePresence } from 'framer-motion';

/* Mini visual showing what gets generated */
const DEMO_ROWS = [
  ['#e0d4ff','#c4a8ff','#a97eff','#8c50ef','#7030df','#5820bf','#42168e','#2e1060','#1e0840'],
  ['#ffe8d4','#ffc8a0','#ffa068','#f07830','#d85810','#b83e08','#8a2a06','#601a04','#3c0e02'],
];

function SystemMiniPreview() {
  return (
    <div style={{
      width: '100%', padding: '14px 16px', borderRadius: 12,
      background: '#111', border: '1px solid #222',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Token layer labels */}
      <div style={{ display: 'flex', gap: 4 }}>
        {['Colors','Type','Space','Shape','Shadow','Motion'].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04, duration: 0.2 }}
            style={{ flex: 1 }}
          >
            <div style={{
              height: 3, borderRadius: 2, marginBottom: 4,
              background: `hsl(${250 + i * 18}, 65%, ${62 - i * 4}%)`,
            }} />
            <div style={{
              fontSize: 7, color: '#444', fontFamily: '"Geist Mono", monospace',
              textAlign: 'center', letterSpacing: '0.02em',
            }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Color palettes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {DEMO_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2 }}>
            {row.map((c, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + ri * 0.08 + ci * 0.02 }}
                style={{ flex: 1, height: 14, borderRadius: 3, background: c }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Component strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e2', letterSpacing: '-0.02em', lineHeight: 1 }}>Heading XL</div>
          <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>Body text — readable at every scale</div>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ padding: '5px 12px', borderRadius: 6, background: '#7030df', color: '#fff', fontSize: 10, fontWeight: 600, fontFamily: '"Geist Sans", system-ui' }}>Primary</div>
          <div style={{ padding: '5px 12px', borderRadius: 6, background: 'transparent', color: '#666', fontSize: 10, border: '1px solid #2a2a2a', fontFamily: '"Geist Sans", system-ui' }}>Ghost</div>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1e1e1e', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#7030df', opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  {
    sym: '◈',
    title: '6 computed token layers',
    desc: 'Colors → Typography → Spacing → Shape → Shadows → Motion. Every value derived, nothing hardcoded.',
  },
  {
    sym: '⬡',
    title: 'Live component preview',
    desc: 'Buttons, cards, inputs, badges — all update in real time as you adjust any token.',
  },
  {
    sym: '✦',
    title: 'WCAG accessibility audit',
    desc: '14 contrast & readability checks run automatically. Errors flagged with one-click fixes.',
  },
  {
    sym: '↑',
    title: 'Export in any format',
    desc: 'CSS variables, Tailwind config, W3C JSON tokens, or a ready-to-paste React component kit.',
  },
];

const SHORTCUTS = [
  ['Space', 'Shuffle system'],
  ['⌘E', 'Export'],
  ['⌘S', 'Save version'],
  ['L / U', 'Lock / Unlock all'],
];

export default function SplashScreen({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="splash-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          key="splash-panel"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560,
            background: '#141414',
            border: '1px solid #252525',
            borderRadius: 18,
            padding: '24px 24px 20px',
            display: 'flex', flexDirection: 'column', gap: 18,
            boxShadow: '0 48px 120px rgba(0,0,0,0.85)',
            fontFamily: '"Geist Sans", system-ui, sans-serif',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{
                fontSize: 10, fontFamily: '"Geist Mono", monospace', color: '#c8602a',
                letterSpacing: '0.1em', marginBottom: 7, fontWeight: 600,
              }}>DESIGN SYSTEM BUILDER</div>
              <h2 style={{
                margin: 0, fontSize: 21, fontWeight: 700, color: '#e8e8e8',
                letterSpacing: '-0.025em', lineHeight: 1.25,
              }}>
                From one color to a<br />production-ready system
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid #2a2a2a', borderRadius: 7,
                color: '#555', cursor: 'pointer', fontSize: 11, padding: '4px 10px',
                flexShrink: 0, fontFamily: '"Geist Mono", monospace',
                transition: 'border-color .15s, color .15s',
              }}
            >
              esc
            </button>
          </div>

          {/* Mini system preview */}
          <SystemMiniPreview />

          {/* Capabilities 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.06, duration: 0.22 }}
                style={{
                  padding: '11px 13px', borderRadius: 10,
                  background: '#1c1c1c', border: '1px solid #272727',
                  display: 'flex', flexDirection: 'column', gap: 5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 13, color: '#c8602a', lineHeight: 1 }}>{c.sym}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#ddd' }}>{c.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 10.5, color: '#5a5a5a', lineHeight: 1.55 }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Keyboard shortcuts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
            style={{
              display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center',
              flexWrap: 'wrap', padding: '4px 0',
            }}
          >
            {SHORTCUTS.map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <kbd style={{
                  background: '#1c1c1c', border: '1px solid #2e2e2e', borderRadius: 5,
                  padding: '2px 8px', fontSize: 10, color: '#888',
                  fontFamily: '"Geist Mono", monospace',
                }}>{key}</kbd>
                <span style={{ fontSize: 10, color: '#4a4a4a' }}>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            whileHover={{ opacity: 0.88 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 10, border: 'none',
              background: '#c8602a', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: '"Geist Sans", system-ui',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Start building
            <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
