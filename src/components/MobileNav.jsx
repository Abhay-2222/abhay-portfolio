/**
 * MobileNav.jsx
 * Minimal bottom nav + clean list-style project sheet.
 * Visible on screens ≤ 768 px only (.mobile-nav CSS class).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import projects from '../data/projects.js';

const META = {
  healthcare:    { name: 'CareSummarizer', color: '#2D6A9F' },
  meatinspector: { name: 'Salesforce UR',  color: '#0070D2' },
  trailar:       { name: 'AR Trail App',   color: '#2D7A3A' },
  vosyn:         { name: 'VosynVerse',     color: '#6B35A0' },
  mealplanner:   { name: 'Meal Planner',   color: '#C4622D' },
  aurora:        { name: 'Smart Wealth',   color: '#2A6B4A' },
  autonomous:    { name: 'Transit',        color: '#0EA5E9' },
};

/* ── Project row (list style) ── */
function ProjectRow({ project, onOpen, soonId }) {
  const m    = META[project.id] ?? { name: project.title, color: project.accentColor };
  const soon = project.status === 'coming-soon';
  const ping = soonId === project.id;

  return (
    <motion.button
      onClick={() => onOpen(project.id)}
      whileTap={{ opacity: 0.6 }}
      aria-label={`Open ${project.title}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '13px 20px',
        background: 'none', border: 'none', cursor: soon ? 'default' : 'pointer',
        textAlign: 'left', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Color dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: m.color, flexShrink: 0,
        opacity: soon ? 0.4 : 1,
      }} />

      {/* Name + type */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"Geist Sans", system-ui',
          fontSize: 15, fontWeight: 500,
          color: soon ? 'rgba(10,10,10,0.38)' : 'rgba(10,10,10,0.82)',
          letterSpacing: '-0.02em', lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {m.name}
        </div>
        <div style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 10, color: 'rgba(10,10,10,0.30)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          marginTop: 2,
        }}>
          {project.type}{soon ? ' — Soon' : ''}
        </div>
      </div>

      {/* Arrow or ping badge */}
      {ping ? (
        <span style={{
          fontFamily: '"Geist Mono", monospace', fontSize: 9,
          color: m.color, background: `${m.color}18`,
          border: `1px solid ${m.color}40`,
          borderRadius: 4, padding: '2px 7px', letterSpacing: '0.08em',
          textTransform: 'uppercase', flexShrink: 0,
        }}>Soon</span>
      ) : !soon && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.28 }}>
          <path d="M2 7h10M8 3l4 4-4 4" stroke="#0A0A0A" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.button>
  );
}

/* ── Main component ── */
export default function MobileNav({ onProjectClick, onPlaygroundClick, hidden }) {
  const navigate = useNavigate();
  const [workOpen, setWorkOpen] = useState(false);
  const [soonId,   setSoonId]   = useState(null);

  const openProject = (id) => {
    const p = projects.find(x => x.id === id);
    if (p?.status === 'coming-soon') {
      setSoonId(id);
      setTimeout(() => setSoonId(s => s === id ? null : s), 2000);
      return;
    }
    setWorkOpen(false);
    onProjectClick(id, null);
  };

  return (
    <>
      {/* ── Backdrop + Sheet ── */}
      <AnimatePresence>
        {workOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.20 }}
              onClick={() => setWorkOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 290,
                background: 'rgba(0,0,0,0.38)',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            <motion.div
              key="sh"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.85 }}
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 295,
                background: 'rgba(252,252,252,0.98)',
                backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '20px 20px 0 0',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
                maxHeight: '80vh', overflowY: 'auto',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                <div style={{ width: 36, height: 3.5, borderRadius: 2, background: 'rgba(0,0,0,0.10)' }} />
              </div>

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px 10px',
              }}>
                <span style={{
                  fontFamily: '"Geist Sans", system-ui',
                  fontSize: 13, fontWeight: 600, color: 'rgba(10,10,10,0.82)',
                  letterSpacing: '-0.01em',
                }}>
                  Work
                </span>
                <button
                  onClick={() => setWorkOpen(false)}
                  aria-label="Close"
                  style={{
                    fontFamily: '"Geist Sans", system-ui',
                    fontSize: 13, color: 'rgba(0,0,0,0.38)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: '2px 0',
                  }}
                >
                  Done
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '0 20px' }} />

              {/* Project list */}
              <div style={{ paddingTop: 4, paddingBottom: 8 }}>
                {projects.map((p, i) => (
                  <div key={p.id}>
                    <ProjectRow project={p} onOpen={openProject} soonId={soonId} />
                    {i < projects.length - 1 && (
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '0 20px' }} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ── */}
      <motion.nav
        className="mobile-nav"
        aria-label="Site navigation"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: hidden ? 80 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: hidden ? 0.3 : 0.55, delay: hidden ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      >
        <div className="mobile-nav-inner">

          <button
            onClick={() => setWorkOpen(w => !w)}
            className={'mobile-nav-btn' + (workOpen ? ' mobile-nav-btn--on' : '')}
            aria-label="Browse projects"
            aria-expanded={workOpen}
          >
            <span className="mobile-nav-label">Work</span>
          </button>

          <div className="mobile-nav-divider" />

          <button
            onClick={onPlaygroundClick}
            className="mobile-nav-btn"
            aria-label="Open Playground"
          >
            <span className="mobile-nav-label">Play</span>
          </button>

          <div className="mobile-nav-divider" />

          <button
            onClick={() => navigate('/about')}
            className="mobile-nav-btn"
            aria-label="About Abhay"
          >
            <span className="mobile-nav-label">About</span>
          </button>

        </div>
      </motion.nav>
    </>
  );
}
