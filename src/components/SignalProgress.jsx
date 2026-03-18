/**
 * SignalProgress.jsx — right-side signal discovery progress indicator
 * Replaces CanvasToolbar. Vertical stack of 7 dots.
 */
import { motion } from 'framer-motion';
import { SIGNALS } from './SignalMap.js';

const TYPE_COLOR = {
  project:   '#4A90D9',
  principle: '#8C7B6B',
  personal:  '#E86B2E',
  teaching:  '#5A8F5A',
};

export default function SignalProgress({ foundIds }) {
  const count = foundIds.size;

  return (
    <div style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 500 }}>
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 5.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '16px 0',
        }}
      >
        {SIGNALS.map(sig => {
          const found = foundIds.has(sig.id);
          const color = TYPE_COLOR[sig.type] ?? '#d4cfc8';
          return (
            <div
              key={sig.id}
              title={sig.title ?? sig.tag}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: found ? color : 'transparent',
                border: `1.5px solid ${found ? color : '#d4cfc8'}`,
                transition: 'background 300ms ease, border-color 300ms ease',
                flexShrink: 0,
              }}
            />
          );
        })}

        {/* Count label */}
        <span style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 10,
          color: '#a89e8c',
          letterSpacing: '-0.01em',
          marginTop: 4,
          userSelect: 'none',
        }}>
          {count} / 7
        </span>
      </motion.div>
    </div>
  );
}
