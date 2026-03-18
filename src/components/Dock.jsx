/**
 * Dock.jsx
 * Minimal frosted-glass dock — coloured dot + project name per item.
 * No emoji. No spring magnification. Simple hover translateY.
 */

import { useState, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/projects.js';
import { INTRO_DURATION } from './IntroSequence.jsx';

/* ─── Short names + accent colours per project ─── */
const DOCK_META = {
  healthcare:    { name: 'CareSummarizer', color: '#2D6A9F' },
  meatinspector: { name: 'Salesforce',     color: '#0070D2' },
  trailar:       { name: 'AR Trail',       color: '#2D7A3A' },
  vosyn:         { name: 'Vosyn',          color: '#6B35A0' },
  mealplanner:   { name: 'Meal Planner',   color: '#C4622D' },
  aurora:        { name: 'Smart Wealth',   color: '#2A6B4A' },
  autonomous:    { name: 'Transit',        color: '#1A3A6B' },
};

/* ─── Single dock item ─── */
const DockItem = memo(function DockItem({ project, onProjectClick, onProjectHover, isActive }) {
  const [hovered, setHovered] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const meta = DOCK_META[project.id] ?? { name: project.title, color: project.accentColor };

  const handleClick = () => {
    if (project.status === 'coming-soon') {
      setComingSoon(true);
      setTimeout(() => setComingSoon(false), 2000);
      return;
    }
    onProjectClick(project.id, null);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            key="cs"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position:    'absolute',
              bottom:      'calc(100% + 8px)',
              left:        '50%',
              transform:   'translateX(-50%)',
              whiteSpace:  'nowrap',
              fontFamily:  '"Geist Mono", monospace',
              fontSize:    10,
              color:       'rgba(0,0,0,0.45)',
              background:  'rgba(255,255,255,0.9)',
              border:      '1px solid rgba(0,0,0,0.08)',
              borderRadius: 6,
              padding:     '3px 8px',
              backdropFilter: 'blur(12px)',
              pointerEvents: 'none',
              zIndex:      1000,
            }}
          >
            Coming Soon
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => { setHovered(true); onProjectHover?.(project); }}
        onMouseLeave={() => { setHovered(false); onProjectHover?.(null); }}
        data-cursor-hover
        aria-label={`Open ${project.title}`}
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            4,
          padding:        '8px 14px',
          borderRadius:   10,
          cursor:         'pointer',
          border:         'none',
          background:     hovered ? 'rgba(0,0,0,0.04)' : 'transparent',
          transform:      hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition:     'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow:      isActive
            ? `0 0 0 1.5px ${meta.color}60`
            : 'none',
        }}
      >
        {/* Coloured dot */}
        <div style={{
          width:        8,
          height:       8,
          borderRadius: '50%',
          background:   meta.color,
          flexShrink:   0,
          opacity:      isActive ? 1 : 0.75,
          transition:   'opacity 0.2s ease',
        }} />

        {/* Project short name */}
        <span style={{
          fontFamily:    '"Geist Sans", system-ui, sans-serif',
          fontSize:      10,
          fontWeight:    500,
          color:         hovered ? '#0A0A0A' : 'rgba(0,0,0,0.6)',
          whiteSpace:    'nowrap',
          transition:    'color 0.15s ease',
          letterSpacing: '-0.01em',
        }}>
          {meta.name}
        </span>
      </button>
    </div>
  );
});

/* ─── Playground dock button ─── */
function PlaygroundButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="pg-tip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)', whiteSpace: 'nowrap',
              fontFamily: '"Geist Mono", monospace', fontSize: 10,
              color: 'rgba(0,0,0,0.45)', background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6,
              padding: '3px 8px', backdropFilter: 'blur(12px)',
              pointerEvents: 'none', zIndex: 1000,
            }}
          >Playground</motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor-hover
        aria-label="Open Playground"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, padding: '8px 14px', borderRadius: 10,
          cursor: 'pointer', border: 'none',
          background: hovered ? 'rgba(0,0,0,0.05)' : 'transparent',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'background 0.2s ease, transform 0.2s ease',
          color: hovered ? '#0A0A0A' : 'rgba(0,0,0,0.45)',
        }}
      >
        {/* Grid icon */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="0" y="0" width="5" height="5" rx="1"/>
          <rect x="7" y="0" width="5" height="5" rx="1"/>
          <rect x="0" y="7" width="5" height="5" rx="1"/>
          <rect x="7" y="7" width="5" height="5" rx="1"/>
        </svg>
        <span style={{
          fontFamily: '"Geist Sans", system-ui, sans-serif',
          fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap',
          letterSpacing: '-0.01em', color: 'inherit', transition: 'color 0.15s ease',
        }}>Play</span>
      </button>
    </div>
  );
}

/* ─── Main Dock ─── */
function Dock({ onProjectClick, onProjectHover, activeProjectId, onPlaygroundClick, hidden }) {
  const enteredRef = useRef(false);
  // After the first entrance animation completes, skip the intro delay on subsequent shows
  const introDelay = enteredRef.current ? 0 : INTRO_DURATION + 0.1;
  if (!hidden) enteredRef.current = true;

  return (
    <motion.div
      className="dock-layer"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: hidden ? 80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: hidden ? 0.35 : 0.5, delay: hidden ? 0 : introDelay, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <div style={{
        display:             'flex',
        alignItems:          'center',
        gap:                 2,
        background:          '#f7f5f0',
        border:              '1px solid rgba(0,0,0,0.10)',
        borderRadius:        999,
        padding:             '6px 16px',
        boxShadow:           '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {projects.map((project) => (
          <DockItem
            key={project.id}
            project={project}
            onProjectClick={onProjectClick}
            onProjectHover={onProjectHover}
            isActive={activeProjectId === project.id}
          />
        ))}
        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)', margin: '0 6px', flexShrink: 0 }} />
        <PlaygroundButton onClick={onPlaygroundClick} />
      </div>
    </motion.div>
  );
}

export default Dock;
