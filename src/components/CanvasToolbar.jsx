/**
 * CanvasToolbar.jsx — right-side vertical dock, mirrors project dock style
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { id: 'pen',    label: 'Pen',    dot: '#1a1814' },
  { id: 'eraser', label: 'Erase',  dot: '#b8b0a6' },
  { id: 'note',   label: 'Note',   dot: '#E8B84B' },
  { id: 'rect',   label: 'Rect',   dot: '#4B72B0' },
  { id: 'circle', label: 'Circle', dot: '#8B3A3A' },
  { id: 'clear',  label: 'Clear',  dot: '#c8602a' },
];

const COLORS = [
  { hex: '#1a1814', name: 'Ink'    },
  { hex: '#c8602a', name: 'Orange' },
  { hex: '#4B72B0', name: 'Blue'   },
  { hex: '#8B3A3A', name: 'Red'    },
];

function ToolItem({ tool, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              right: 'calc(100% + 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: '"Geist Mono", monospace',
              fontSize: 10,
              color: 'rgba(0,0,0,0.45)',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 6,
              padding: '3px 8px',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {tool.label}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={tool.label}
        aria-pressed={isActive}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '8px 14px',
          borderRadius: 10,
          cursor: 'pointer',
          border: 'none',
          background: isActive
            ? 'rgba(0,0,0,0.08)'
            : hovered ? 'rgba(0,0,0,0.04)' : 'transparent',
          boxShadow: isActive ? 'inset 0 1px 3px rgba(0,0,0,0.10)' : 'none',
          transform: hovered && !isActive ? 'translateX(-2px)' : 'translateX(0)',
          transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Dot indicator */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: tool.dot,
          opacity: isActive ? 1 : 0.65,
          flexShrink: 0,
          transition: 'opacity 0.15s ease',
        }} />
        {/* Label */}
        <span style={{
          fontFamily: '"Geist Sans", system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 500,
          color: isActive ? '#0A0A0A' : hovered ? '#0A0A0A' : 'rgba(0,0,0,0.55)',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          transition: 'color 0.15s ease',
        }}>
          {tool.label}
        </span>
      </button>
    </div>
  );
}

export default function CanvasToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  onClear,
}) {
  return (
    /* Outer div handles vertical centering — keeps it out of Framer Motion's transform */
    <div style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 500 }}>
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        background: '#f7f5f0',
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 999,
        padding: '8px 0',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Tool items */}
      {TOOLS.map(t => (
        <ToolItem
          key={t.id}
          tool={t}
          isActive={activeTool === t.id}
          onClick={() => {
            if (t.id === 'clear') { onClear(); return; }
            onToolChange(activeTool === t.id ? 'none' : t.id);
          }}
        />
      ))}

      {/* Divider */}
      <div style={{
        width: 24,
        height: 1,
        background: 'rgba(0,0,0,0.08)',
        margin: '4px 0',
        flexShrink: 0,
      }} />

      {/* Color dots — vertical */}
      {COLORS.map(c => (
        <button
          key={c.hex}
          title={c.name}
          aria-label={`Color: ${c.name}`}
          onClick={() => onColorChange(c.hex)}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: c.hex,
            border: color === c.hex ? '2px solid rgba(0,0,0,0.45)' : '2px solid transparent',
            outline: color === c.hex ? '2px solid rgba(255,255,255,0.9)' : 'none',
            outlineOffset: 1,
            cursor: 'pointer',
            margin: '3px 0',
            flexShrink: 0,
            transition: 'outline 0.12s ease, border 0.12s ease',
          }}
        />
      ))}
    </motion.div>
    </div>
  );
}
