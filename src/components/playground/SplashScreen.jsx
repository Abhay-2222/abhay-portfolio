/**
 * SplashScreen.jsx — First-visit onboarding overlay for Design System Builder
 * Shows once per browser session. Dismissed by button click or backdrop click.
 */

import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  { icon: 'Cc', label: 'Generate', desc: 'Pick colors, fonts & shape style' },
  { icon: 'Vv', label: 'Preview',  desc: 'See every component update live'  },
  { icon: 'Ex', label: 'Export',   desc: 'CSS, Tailwind, JSON, React Kit'    },
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
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        {/* Center panel */}
        <motion.div
          key="splash-panel"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 520,
            background: '#191919',
            border: '1px solid #303030',
            borderRadius: 16,
            padding: '40px 36px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 28,
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            fontFamily: '"Geist Sans", system-ui, sans-serif',
          }}
        >
          {/* Floating monogram */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, #c8602a 0%, #e07840 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(200,96,42,0.35)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', fontFamily: '"Geist Sans", system-ui' }}>
              Ds
            </span>
          </motion.div>

          {/* Heading */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#e2e2e2', letterSpacing: '-0.02em' }}>
              Design System Builder
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#888', lineHeight: 1.5 }}>
              Generate production-ready design tokens in seconds.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.08, duration: 0.25, ease: 'easeOut' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#232323',
                  border: '1px solid #303030',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: 'rgba(200,96,42,0.12)',
                  border: '1px solid rgba(200,96,42,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#c8602a',
                  fontFamily: '"Geist Mono", monospace',
                }}>
                  {['//','[]','{}'][i]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e2' }}>{f.label}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{f.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Spacebar hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            style={{ margin: 0, fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 7 }}
          >
            Press
            <kbd style={{ background: '#2a2a2a', border: '1px solid #444', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#888', fontFamily: '"Geist Mono", monospace' }}>
              Space
            </kbd>
            to shuffle a random system
          </motion.p>

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.25 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
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
            Let&rsquo;s build
            <span style={{ fontSize: 16 }}>→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
