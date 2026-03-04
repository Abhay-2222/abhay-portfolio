/**
 * MobileNav.jsx
 * Sleek iOS-style mobile bottom nav + full-bleed image project sheet.
 * Shows on screens ≤ 768 px only (CSS class .mobile-nav controls display).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ── Nav icons ── */
function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="7" rx="1.8"/>
      <rect x="11.5" y="1.5" width="7" height="7" rx="1.8"/>
      <rect x="1.5" y="11.5" width="7" height="7" rx="1.8"/>
      <rect x="11.5" y="11.5" width="7" height="7" rx="1.8"/>
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5L17 10L5 16.5V3.5Z" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
      <rect x="1.5" y="1" width="15" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="5" y1="7"  x2="13" y2="7"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5" y1="14" x2="9"  y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Project card with full-bleed image ── */
function ProjectCard({ project, onOpen, soonId }) {
  const m = META[project.id] ?? { name: project.title, color: project.accentColor };
  const soon = project.status === 'coming-soon';
  const isPing = soonId === project.id;
  const img = project.previewMedia;

  return (
    <motion.button
      onClick={() => onOpen(project.id)}
      whileTap={{ scale: 0.97 }}
      aria-label={`Open ${project.title}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        borderRadius: 16,
        border: `1px solid ${isPing ? m.color + '70' : 'rgba(0,0,0,0.07)'}`,
        background: '#111',
        cursor: soon ? 'default' : 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        aspectRatio: '4/3',
        flexShrink: 0,
      }}
    >
      {/* Image */}
      {img && (
        <img
          src={img}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: img
          ? 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)'
          : `linear-gradient(135deg, ${m.color}44 0%, ${m.color}22 100%)`,
      }} />

      {/* Accent line at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: m.color, zIndex: 2,
      }} />

      {/* Text at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 12px 12px', zIndex: 2,
      }}>
        <div style={{
          fontFamily: '"Geist Sans",system-ui',
          fontSize: 13, fontWeight: 600,
          color: img ? '#fff' : '#0A0A0A',
          letterSpacing: '-0.015em',
          lineHeight: 1.2, marginBottom: 3,
          textShadow: img ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
        }}>
          {m.name}
        </div>
        <div style={{
          fontFamily: '"Geist Mono",monospace',
          fontSize: 9, color: img ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.40)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          textShadow: img ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
        }}>
          {project.type}
        </div>
        {soon && (
          <div style={{
            marginTop: 5,
            display: 'inline-block',
            fontFamily: '"Geist Mono",monospace',
            fontSize: 8, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: m.color,
            background: `${m.color}22`,
            border: `1px solid ${m.color}55`,
            borderRadius: 4, padding: '2px 7px',
          }}>
            {isPing ? 'Coming Soon' : 'Soon'}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ── Main component ── */
export default function MobileNav({ onProjectClick, onPlaygroundClick }) {
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
              transition={{ duration: 0.22 }}
              onClick={() => setWorkOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 290,
                background: 'rgba(0,0,0,0.50)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.div
              key="sh"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 38, mass: 0.9 }}
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 295,
                background: 'rgba(248,248,248,0.98)',
                backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                borderRadius: '24px 24px 0 0',
                borderTop: '1px solid rgba(0,0,0,0.07)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
                maxHeight: '88vh', overflowY: 'auto',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)' }} />
              </div>

              {/* Header */}
              <div style={{ padding: '14px 20px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    fontFamily: '"Geist Mono",monospace',
                    fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.32)', marginBottom: 4,
                  }}>
                    Selected Work
                  </div>
                  <div style={{
                    fontFamily: '"Geist Sans",system-ui',
                    fontSize: 26, fontWeight: 700, color: '#0A0A0A',
                    letterSpacing: '-0.03em', lineHeight: 1,
                  }}>
                    Projects
                  </div>
                </div>
                <button
                  onClick={() => setWorkOpen(false)}
                  aria-label="Close"
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.07)', border: 'none',
                    cursor: 'pointer', fontSize: 16, color: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >×</button>
              </div>

              {/* 2-column image card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 14px 16px' }}>
                {projects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onOpen={openProject}
                    soonId={soonId}
                  />
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
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mobile-nav-inner">

          {/* Work */}
          <button
            onClick={() => setWorkOpen(w => !w)}
            className={'mobile-nav-btn' + (workOpen ? ' mobile-nav-btn--on' : '')}
            aria-label="Browse projects"
            aria-expanded={workOpen}
          >
            <IconGrid />
            <span>Work</span>
          </button>

          {/* Playground */}
          <button
            onClick={onPlaygroundClick}
            className="mobile-nav-btn"
            aria-label="Open Playground"
          >
            <IconPlay />
            <span>Playground</span>
          </button>

          {/* Resume */}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-btn"
            aria-label="Open Resume PDF"
          >
            <IconDoc />
            <span>Resume</span>
          </a>

        </div>
      </motion.nav>
    </>
  );
}
