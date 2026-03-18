/**
 * StickyLayer.jsx — draggable DOM sticky notes
 * Tool = 'note' → click to place, drag to move, double-click to delete
 */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const STICKY_COLORS = ['#FFF3B0', '#D4E8FF', '#FFD4D4'];
let nextId = 1;
let colorIdx = 0;

export default function StickyLayer({ activeTool }) {
  const [notes, setNotes] = useState([]);

  const handleClick = useCallback((e) => {
    if (activeTool !== 'note') return;
    // Don't create on a note itself
    if (e.target.closest('[data-sticky]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 80; // centre note on click
    const y = e.clientY - rect.top - 60;
    const color = STICKY_COLORS[colorIdx % STICKY_COLORS.length];
    colorIdx++;
    setNotes(n => [...n, { id: nextId++, x, y, text: '', color }]);
  }, [activeTool]);

  const updateText = useCallback((id, text) => {
    setNotes(n => n.map(note => note.id === id ? { ...note, text } : note));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(n => n.filter(note => note.id !== id));
  }, []);

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: activeTool === 'note' ? 'auto' : 'none',
      }}
    >
      {notes.map(note => (
        <motion.div
          key={note.id}
          data-sticky="true"
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          onDoubleClick={() => deleteNote(note.id)}
          style={{
            position: 'absolute',
            left: note.x,
            top: note.y,
            width: 160,
            minHeight: 120,
            background: note.color,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
            padding: '10px 10px 8px',
            cursor: 'grab',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Grab handle bar */}
          <div style={{
            height: 3,
            borderRadius: 2,
            background: 'rgba(0,0,0,0.12)',
            marginBottom: 4,
            flexShrink: 0,
          }} />
          <textarea
            value={note.text}
            onChange={e => updateText(note.id, e.target.value)}
            onPointerDown={e => e.stopPropagation()} // don't bubble to overlay
            placeholder="Type here…"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              fontFamily: '"Geist Sans", system-ui, sans-serif',
              fontSize: 12,
              lineHeight: 1.5,
              color: 'rgba(0,0,0,0.72)',
              cursor: 'text',
              minHeight: 80,
            }}
          />
          <span style={{
            fontSize: 9,
            color: 'rgba(0,0,0,0.3)',
            textAlign: 'right',
            flexShrink: 0,
            fontFamily: '"Geist Mono", monospace',
          }}>dbl-click to delete</span>
        </motion.div>
      ))}
    </div>
  );
}
