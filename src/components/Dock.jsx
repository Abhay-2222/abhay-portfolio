/**
 * Dock.jsx
 * Minimal frosted-glass dock — coloured dot + project name per item.
 * No emoji. No spring magnification. Simple hover translateY.
 */

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/projects.js';

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
const DockItem = memo(function DockItem({ project, onProjectClick, isActive }) {
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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
          background:     hovered ? 'rgba(0,0,0,0.05)' : 'transparent',
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
          fontSize:      11,
          fontWeight:    500,
          color:         hovered ? '#0A0A0A' : 'rgba(0,0,0,0.6)',
          whiteSpace:    'nowrap',
          maxWidth:      80,
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          transition:    'color 0.15s ease',
          letterSpacing: '-0.01em',
        }}>
          {meta.name}
        </span>
      </button>
    </div>
  );
});

/* ─── Main Dock ─── */
function Dock({ onProjectClick, activeProjectId }) {
  return (
    <motion.div
      className="dock-layer"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{
        display:             'flex',
        alignItems:          'center',
        gap:                 2,
        background:          'rgba(255,255,255,0.75)',
        backdropFilter:      'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border:              '1px solid rgba(0,0,0,0.08)',
        borderRadius:        14,
        padding:             '6px 8px',
        boxShadow:           '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {projects.map((project) => (
          <DockItem
            key={project.id}
            project={project}
            onProjectClick={onProjectClick}
            isActive={activeProjectId === project.id}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default Dock;
