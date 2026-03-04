/**
 * MobileNav.jsx
 * Mobile-only bottom navigation bar + project sheet.
 * Replaces the Dock + CornerButtons on screens ≤ 768 px.
 *
 *  Bottom bar: Work | Playground | Resume
 *  Work tap  : slide-up sheet with 2-col project card grid
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/projects.js';

/* Short names + accent colours (mirrors Dock DOCK_META) */
const META = {
  healthcare:    { name: 'CareSummarizer', color: '#2D6A9F' },
  meatinspector: { name: 'Salesforce UR',  color: '#0070D2' },
  trailar:       { name: 'AR Trail App',   color: '#2D7A3A' },
  vosyn:         { name: 'VosynVerse',     color: '#6B35A0' },
  mealplanner:   { name: 'Meal Planner',   color: '#C4622D' },
  aurora:        { name: 'Smart Wealth',   color: '#2A6B4A' },
  autonomous:    { name: 'Transit',        color: '#1A3A6B' },
};

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
      {/* ── Project sheet ── */}
      <AnimatePresence>
        {workOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setWorkOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 290,
                background: 'rgba(0,0,0,0.36)',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sh"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 295,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px 20px 0 0',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 82px)',
                maxHeight: '82vh', overflowY: 'auto',
              }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.14)' }} />
              </div>

              {/* Header */}
              <div style={{ padding: '10px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: '"Geist Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 4 }}>
                  Selected Work
                </div>
                <div style={{ fontFamily: '"Geist Sans",system-ui', fontSize: 22, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.025em' }}>
                  Projects
                </div>
              </div>

              {/* 2-column card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
                {projects.map(p => {
                  const m    = META[p.id] ?? { name: p.title, color: p.accentColor };
                  const soon = p.status === 'coming-soon';
                  const ping = soonId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => openProject(p.id)}
                      aria-label={`Open ${p.title}`}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        padding: 0, borderRadius: 12,
                        border: `1px solid ${ping ? m.color + '60' : 'rgba(0,0,0,0.08)'}`,
                        background: ping ? `${m.color}08` : '#FAFAFA',
                        cursor: soon ? 'default' : 'pointer',
                        textAlign: 'left', overflow: 'hidden',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'border-color .15s, background .15s',
                      }}
                    >
                      {/* Accent bar */}
                      <div style={{ height: 4, background: m.color, width: '100%', flexShrink: 0 }} />

                      <div style={{ padding: '10px 12px 13px', flex: 1 }}>
                        <div style={{ fontFamily: '"Geist Sans",system-ui', fontSize: 13, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.015em', lineHeight: 1.25, marginBottom: 4 }}>
                          {m.name}
                        </div>
                        <div style={{ fontFamily: '"Geist Mono",monospace', fontSize: 9, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.5 }}>
                          {p.type}
                        </div>
                        {soon && (
                          <div style={{ marginTop: 7, display: 'inline-block', fontFamily: '"Geist Mono",monospace', fontSize: 8, letterSpacing: '0.10em', textTransform: 'uppercase', color: m.color, background: `${m.color}16`, border: `1px solid ${m.color}35`, borderRadius: 4, padding: '2px 7px' }}>
                            {ping ? 'Coming Soon' : 'Soon'}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
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
        transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mobile-nav-inner">

          {/* Work */}
          <button
            onClick={() => setWorkOpen(w => !w)}
            className={'mobile-nav-btn' + (workOpen ? ' mobile-nav-btn--on' : '')}
            aria-label="Browse projects"
            aria-expanded={workOpen}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <rect x="1"    y="1"    width="6.5" height="6.5" rx="1.5"/>
              <rect x="10.5" y="1"    width="6.5" height="6.5" rx="1.5"/>
              <rect x="1"    y="10.5" width="6.5" height="6.5" rx="1.5"/>
              <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5"/>
            </svg>
            <span>Work</span>
          </button>

          {/* Playground */}
          <button
            onClick={onPlaygroundClick}
            className="mobile-nav-btn"
            aria-label="Open Playground"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <polygon points="4,2 16,9 4,16"/>
            </svg>
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
            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" aria-hidden="true">
              <rect x="2" y="1" width="13" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="5" y1="6.5"  x2="12" y2="6.5"  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="5" y1="9.5"  x2="12" y2="9.5"  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="5" y1="12.5" x2="9"  y2="12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>Resume</span>
          </a>

        </div>
      </motion.nav>
    </>
  );
}
