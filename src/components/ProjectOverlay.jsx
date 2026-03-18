/**
 * ProjectOverlay.jsx
 * Full-screen case study view — macOS-style.
 * Sticky sidebar + scrollable content column.
 * Sections derived from existing episode data — no content changes.
 */

import React, { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import projects from '../data/projects.js';

/* ── Diagram components (lazy — only loaded for healthcare) ── */
const DiagramProblem   = lazy(() => import('./diagrams/DiagramProblem.jsx'));
const DiagramAmbiguity = lazy(() => import('./diagrams/DiagramAmbiguity.jsx'));
const DiagramMistakes  = lazy(() => import('./diagrams/DiagramMistakes.jsx'));
const DiagramEvolution = lazy(() => import('./diagrams/DiagramEvolution.jsx'));

const DIAGRAM_MAP = {
  problem:   { component: DiagramProblem,   height: 1000 },
  ambiguity: { component: DiagramAmbiguity, height: 900  },
  mistakes:  { component: DiagramMistakes,  height: 900  },
  evolution: { component: DiagramEvolution, height: 900  },
};

/* ── Scales a fixed 1600×diagramHeight diagram to fill its container width ── */
const DIAGRAM_PREVIEW_VH = 52; // collapsed preview height in vh

function DiagramWrapper({ component: Diagram, diagramHeight = 900 }) {
  const wrapperRef  = useRef(null);
  const [scale, setScale]       = useState(1);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setScale(w / 1600);
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const fullH    = diagramHeight * scale;
  const previewH = Math.min(fullH, window.innerHeight * (DIAGRAM_PREVIEW_VH / 100));
  const needsToggle = fullH > previewH + 40; // only show toggle if meaningful content is hidden

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={wrapperRef}
        style={{
          width: '100%',
          height: expanded ? `${fullH}px` : `${previewH}px`,
          overflow: 'hidden',
          position: 'relative',
          transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          <Suspense fallback={<div style={{ width: 1600, height: diagramHeight, background: '#f5f5f5' }} />}>
            <Diagram />
          </Suspense>
        </div>
      </div>

      {/* Fade + toggle */}
      {needsToggle && !expanded && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 100,
          background: 'linear-gradient(to bottom, transparent 0%, #ffffff 80%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: 12,
        }}>
          <button
            onClick={() => setExpanded(true)}
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 20,
              background: '#fff',
              padding: '6px 18px',
              fontSize: 12,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.55)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            Show full diagram ↓
          </button>
        </div>
      )}
      {needsToggle && expanded && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button
            onClick={() => setExpanded(false)}
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 20,
              background: '#fff',
              padding: '6px 18px',
              fontSize: 12,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.55)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            Collapse ↑
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SECTION DERIVATION — episodes → case study sections
───────────────────────────────────────────────────────── */

/** Rotate through these dark gradients for episode image blocks */
const DARK_GRADIENTS = [
  'linear-gradient(135deg, #1a3a5c 0%, #2d5986 100%)',
  'linear-gradient(135deg, #0a1628 0%, #1c3a5c 100%)',
  'linear-gradient(135deg, #1a1a0a 0%, #7a4a0a 100%)',
  'linear-gradient(135deg, #0a2818 0%, #2d8c5a 100%)',
  'linear-gradient(135deg, #0d0d1a 0%, #2a2a6b 100%)',
  'linear-gradient(135deg, #1a0d28 0%, #6b2d8c 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #1a8c6b 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #8c2d2d 100%)',
];

/**
 * Parse episode content array into { headline, subsections }
 * First h3 → section headline
 * Each subsequent h3 → subsection with title; following p/ul → body
 */
function parseEpisodeContent(content = []) {
  let headline = '';
  const bodyBlocks = []; // p/ul blocks before any h3 subsection
  const subsections = [];
  let currentSub = null;
  let firstH3Done = false;

  for (const block of content) {
    if (block.type === 'h3') {
      if (!firstH3Done) {
        headline = block.text;
        firstH3Done = true;
      } else {
        if (currentSub) subsections.push(currentSub);
        currentSub = { title: block.text, body: '' };
      }
    } else if (currentSub) {
      if (block.type === 'p') {
        currentSub.body = (currentSub.body + (currentSub.body ? ' ' : '') + block.text).trim();
      } else if (block.type === 'ul') {
        const list = block.items.join(' · ');
        currentSub.body = (currentSub.body + (currentSub.body ? ' · ' : '') + list).trim();
      }
    } else {
      // Not inside a subsection — these are the main body blocks
      if (block.type === 'p' || block.type === 'ul') {
        bodyBlocks.push(block);
      }
    }
  }
  if (currentSub) subsections.push(currentSub);

  return { headline, bodyBlocks, subsections };
}

/** Build a light overview gradient from the project's accent hex */
function overviewGradient(accentHex) {
  const hex = accentHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `linear-gradient(135deg, rgba(${r},${g},${b},0.10) 0%, rgba(${r},${g},${b},0.05) 60%, rgba(${r},${g},${b},0.02) 100%)`;
}

/** Derive flat section array from project data */
function deriveSections(project) {
  if (!project) return [];

  const overview = {
    id: 'overview',
    eyebrow: 'OVERVIEW',
    headline: project.hero?.synopsis || project.sub || project.description,
    body: project.problem || project.description || '',
    bodyBlocks: [],
    imageGradient: overviewGradient(project.accentColor || '#0a0a0a'),
    imageCaption: `${project.title}: overview`,
    callout: null,
    subsections: [],
  };

  const episodeSections = (project.episodes || []).map((ep, i) => {
    const id = ep.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const { headline, bodyBlocks, subsections } = parseEpisodeContent(ep.content);

    return {
      id,
      eyebrow: ep.title.toUpperCase(),
      headline: headline || ep.title,
      body: ep.teaser || '',
      bodyBlocks,
      imageGradient: DARK_GRADIENTS[i % DARK_GRADIENTS.length],
      imageCaption: ep.title,
      diagramKey: ep.diagramKey || null,
      callout: i === 0 ? (project.insight || null) : null,
      subsections: subsections.length > 0 ? subsections : [],
      /* new visual data fields */
      ep:           ep.ep           || null,
      readTime:     ep.readTime     || null,
      stats:        ep.stats        || null,
      auditData:    ep.auditData    || null,
      impactStats:  ep.impactStats  || null,
      productSteps: ep.productSteps || null,
      quotes:       ep.quotes       || null,
      powerMap:     ep.powerMap     || null,
      hasDashboard: ep.hasDashboard || false,
      timeline:     ep.timeline     || null,
      pillars:      ep.pillars      || null,
      principles:   ep.principles   || null,
      seasons:      ep.seasons      || null,
    };
  });

  const iaSection = project.ia ? {
    id:           'information-architecture',
    eyebrow:      'SUMMARY',
    headline:     'Project Summary',
    body:         '',
    bodyBlocks:   [],
    imageGradient: null,
    imageCaption:  null,
    callout:       null,
    subsections:   [],
    type:          'ia',
  } : null;

  return [overview, ...(iaSection ? [iaSection] : []), ...episodeSections];
}

/* ─────────────────────────────────────────────────────────
   IA DIAGRAM — horizontal node flow
───────────────────────────────────────────────────────── */

/** Detect if a line reads like a stat: starts with number/%, $, or contains "%" */
function isStatLine(line) {
  return /^(\d+%|\$[\d.]+[MKB]?|\d+x|\d+\/\d+|\d+ to \d+|[\d.]+[MKB]?\s)/.test(line.trim());
}

/** Parse "Role: description" format */
function parseRoleLine(line) {
  const idx = line.indexOf(':');
  if (idx > -1) return { role: line.slice(0, idx).trim(), desc: line.slice(idx + 1).trim() };
  return null;
}

function IADiagram({ iaText, accentColor = '#0a0a0a' }) {
  const gridRef = useRef(null);
  const [bentoVisible, setBentoVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setBentoVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hex = (accentColor || '#0a0a0a').replace('#', '');
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
  const aa = (a) => `rgba(${r},${g},${b},${a})`;

  const sections = iaText.trim().split('\n\n').map(block => {
    const lines = block.trim().split('\n').filter(l => l.trim());
    return { label: lines[0].trim(), lines: lines.slice(1).filter(l => l.trim()) };
  });

  function tileType(label) {
    const k = label.toUpperCase();
    if (k.includes('SITUATION')) return 'situation';
    if (k.includes('USER'))      return 'users';
    if (k.includes('PROBLEM'))   return 'problem';
    if (k.includes('CONSTRAINT'))return 'constraints';
    if (k.includes('PROCESS'))   return 'process';
    if (k.includes('DECISION'))  return 'decisions';
    if (k.includes('PRODUCT'))   return 'product';
    if (k.includes('OUTCOME') || k.includes('IMPACT') || k.includes('RESULT')) return 'outcome';
    return 'misc';
  }

  function renderTile(sec, i) {
    const type = tileType(sec.label);
    const lines = sec.lines;

    const baseDelay = { animationDelay: `${i * 55}ms` };

    if (type === 'situation') {
      /* Parse lines — sentences starting with a number become stat rows */
      const sitItems = [];
      for (const line of lines) {
        const sentences = line.split(/\.\s+/).filter(Boolean);
        for (const s of sentences) {
          const m = s.trim().match(/^([\d,]+\+?)\s+(.+)/);
          if (m) sitItems.push({ kind: 'stat', num: m[1], text: m[2].replace(/\.$/, '') });
          else if (s.trim()) sitItems.push({ kind: 'prose', text: s.replace(/\.$/, '') });
        }
      }
      return (
        <div key={i} className="bt bt-situation" style={{ ...baseDelay, background: '#fff', border: `1px solid ${aa(0.12)}` }}>
          <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
          <div className="bt-sit-list">
            {sitItems.map((item, j) => item.kind === 'stat' ? (
              <div key={j} className="bt-sit-row">
                <span className="bt-sit-num" style={{ color: accentColor }}>{item.num}</span>
                <span className="bt-sit-label">{item.text}</span>
              </div>
            ) : (
              <p key={j} className="bt-sit-prose">{item.text}</p>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'users') return (
      <div key={i} className="bt bt-users" style={{ ...baseDelay, border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-user-stack">
          {lines.map((line, j) => {
            const p = parseRoleLine(line);
            const tierOpacity = j === 0 ? 1 : j === 1 ? 0.55 : 0.28;
            return p ? (
              <div key={j} className="bt-user-row" style={{ borderBottomColor: aa(0.07) }}>
                <span className="bt-user-tier-dot" style={{ background: accentColor, opacity: tierOpacity }} />
                <div className="bt-user-text">
                  <span className="bt-user-role" style={{ color: accentColor }}>{p.role}</span>
                  <span className="bt-user-desc">{p.desc}</span>
                </div>
              </div>
            ) : <p key={j} className="bt-line">{line}</p>;
          })}
        </div>
      </div>
    );

    if (type === 'problem') return (
      <div key={i} className="bt bt-problem" style={{ ...baseDelay, background: `linear-gradient(150deg, ${aa(0.88)} 0%, ${accentColor} 100%)` }}>
        <span className="bt-label bt-label--inv">{sec.label}</span>
        <div className="bt-problem-body">
          {lines.map((l, j) => j === 0
            ? <p key={j} className="bt-problem-lead">{l}</p>
            : <p key={j} className="bt-problem-line">{l}</p>
          )}
        </div>
      </div>
    );

    if (type === 'constraints') return (
      <div key={i} className="bt bt-constraints" style={{ ...baseDelay, background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-constraint-list">
          {lines.map((l, j) => (
            <div key={j} className="bt-constraint-row" style={{ borderLeftColor: accentColor }}>
              <span className="bt-c-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (type === 'process') return (
      <div key={i} className="bt bt-process" style={{ ...baseDelay, background: '#fff', border: `1px solid ${aa(0.12)}` }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-process-grid">
          {lines.map((l, j) => (
            <div key={j} className="bt-process-item">
              <span className="bt-p-num" style={{ color: accentColor }}>{String(j+1).padStart(2,'0')}</span>
              <span className="bt-p-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (type === 'decisions') return (
      <div key={i} className="bt bt-decisions" style={{ ...baseDelay, border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-decisions-grid">
          {lines.map((l, j) => (
            <div key={j} className="bt-decision-card" style={{ background: '#fff', border: `1px solid rgba(0,0,0,0.08)` }}>
              <span className="bt-d-arrow" style={{ color: accentColor }}>→</span>
              <span className="bt-d-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (type === 'product') return (
      <div key={i} className="bt bt-product" style={{ ...baseDelay, background: '#fff', border: `1px solid rgba(0,0,0,0.08)` }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-product-list">
          {lines.map((l, j) => (
            <div key={j} className="bt-product-item">
              <span className="bt-prod-check" style={{ color: accentColor }}>✓</span>
              <span className="bt-prod-text">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );

    if (type === 'outcome') {
      const stats = lines.filter(isStatLine);
      const prose = lines.filter(l => !isStatLine(l));
      return (
        <div key={i} className="bt bt-outcome" style={{ ...baseDelay, background: `linear-gradient(160deg, ${aa(0.95)} 0%, ${accentColor} 100%)` }}>
          <span className="bt-label bt-label--inv">{sec.label}</span>
          {stats.length > 0 && (
            <div className="bt-stats">
              {stats.map((s, j) => {
                const parts = s.split(/\s+/);
                return (
                  <React.Fragment key={j}>
                    {j > 0 && <div className="bt-stat-divider" />}
                    <div className="bt-stat">
                      <span className="bt-stat-num">{parts[0]}</span>
                      {parts.length > 1 && <span className="bt-stat-label">{parts.slice(1).join(' ')}</span>}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
          {prose.map((l, j) => <p key={j} className="bt-outcome-prose">{l}</p>)}
        </div>
      );
    }

    /* misc / THE PRODUCT fallthrough */
    return (
      <div key={i} className="bt bt-misc" style={{ ...baseDelay, background: '#fff', border: `1px solid rgba(0,0,0,0.08)` }}>
        <span className="bt-label" style={{ color: accentColor }}>{sec.label}</span>
        <div className="bt-prose">{lines.map((l,j) => <p key={j} className="bt-line">{l}</p>)}</div>
      </div>
    );
  }

  return (
    <div ref={gridRef} className={`bento-grid${bentoVisible ? ' bento-visible' : ''}`}>
      {sections.map((sec, i) => renderTile(sec, i))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   VISUAL COMPONENTS — Phase 2–5
───────────────────────────────────────────────────────── */

const StatChipsRow = ({ stats, accentColor }) => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0' }}>
    {stats.map((s, i) => (
      <div key={i} style={{
        background: accentColor + '10',
        border: `1px solid ${accentColor}25`,
        borderRadius: 10,
        padding: '16px 20px',
        minWidth: 120,
        flex: '1 1 120px'
      }}>
        <div style={{ fontSize: 40, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: accentColor, lineHeight: 1 }}>{s.number}</div>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6, opacity: 0.6 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

const ProblemPullQuote = ({ body, accentColor = '#c8602a' }) => {
  const sentences = body.split('. ').filter(Boolean);
  const lead = sentences[0] + '.';
  const rest = sentences.slice(1).join('. ').trim();
  return (
    <div style={{ margin: '28px 0' }}>
      {/* Big callout card */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}0a 0%, ${accentColor}05 100%)`,
        border: `1px solid ${accentColor}22`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '0 14px 14px 0',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -8, left: 28,
          fontSize: 80, lineHeight: 1, color: accentColor, opacity: 0.08,
          fontFamily: 'Georgia, serif', fontWeight: 700, userSelect: 'none',
        }}>"</div>
        <p style={{
          fontSize: 19, fontWeight: 500, lineHeight: 1.6,
          color: '#1a1814', fontStyle: 'italic',
          margin: 0, position: 'relative', zIndex: 1,
        }}>{lead}</p>
      </div>
      {/* Rest of body as normal prose */}
      {rest && <p style={{ fontSize: 15, lineHeight: 1.75, opacity: 0.65, margin: '16px 0 0' }}>{rest}</p>}
    </div>
  );
};

const ImpactGrid = ({ impactStats, accentColor }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, margin: '32px 0' }}>
    {impactStats.map((item, i) => (
      <div key={i} style={{ background: `${accentColor}06`, border: `1px solid ${accentColor}22`, borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 12 }}>{item.label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 14, opacity: 0.4, textDecoration: 'line-through', fontFamily: 'DM Mono, monospace' }}>{item.before}</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: accentColor, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{item.after}</span>
        </div>
        <div style={{ display: 'inline-block', background: accentColor + '18', color: accentColor, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{item.delta}</div>
      </div>
    ))}
  </div>
);

// DSSpecimenCard is data-driven — each project passes its own ds object from auditData.designSystem
const DSSpecimenCard = ({ type, accentColor, ds }) => {
  const base = { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '18px 20px', flexShrink: 0 };
  const lbl = (text) => (
    <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, opacity: 0.45, color: '#1a1814' }}>{text}</div>
  );

  if (type === 'colors') {
    const data = ds?.colorScale || {
      label: 'ColorScale / Brand',
      stops: [
        { stop: '50', hex: '#E8F0FB' }, { stop: '200', hex: '#9DB8EC' },
        { stop: '400', hex: '#4F7BD6' }, { stop: '600', hex: '#2044BB' },
        { stop: '800', hex: '#112247' }, { stop: '900', hex: '#0A1836' },
      ],
    };
    return (
      <div style={base}>
        {lbl(data.label)}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.stops.length}, 1fr)`, gap: 4 }}>
          {data.stops.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: '100%', height: 30, background: s.hex, borderRadius: 5, border: i === 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }} />
              <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: 'rgba(0,0,0,0.38)', textAlign: 'center' }}>{s.stop}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'typography') {
    const data = ds?.typography || {
      label: 'Foundation / Typography',
      rows: [
        { sample: 'Patient Summary',  token: 'display/xl · 24px · 600', size: 20, weight: 600 },
        { sample: 'Clinical Overview', token: 'heading/md · 16px · 400', size: 14, weight: 400 },
        { sample: 'PATIENT STATUS',   token: 'label/sm · 11px · mono',  size: 10, weight: 500, mono: true },
      ],
    };
    return (
      <div style={base}>
        {lbl(data.label)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.rows.map((r, i) => (
            <div key={i} style={{ borderBottom: i < data.rows.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', paddingBottom: i < data.rows.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: r.size, fontWeight: r.weight, fontFamily: r.serif ? 'Georgia, serif' : r.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif', color: '#1a1814', lineHeight: 1.2, letterSpacing: r.mono ? '0.08em' : 0 }}>{r.sample}</div>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'rgba(0,0,0,0.32)', marginTop: 3 }}>{r.token}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'status') {
    const data = ds?.status || {
      label: 'Status / Clinical States',
      items: [
        { label: 'Authorized', color: '#287A50', bg: '#EDF7F2' },
        { label: 'Pending',    color: '#a07028', bg: '#FDF4E3' },
        { label: 'Denied',     color: '#C43C3C', bg: '#FDF0F0' },
        { label: 'Escalated',  color: '#6B4FD4', bg: '#F3F0FD' },
        { label: 'Draft',      color: '#5a5248', bg: '#F5F3F0' },
        { label: 'Brand',      color: accentColor, bg: `${accentColor}12` },
      ],
    };
    return (
      <div style={base}>
        {lbl(data.label)}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {data.items.map((s, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, border: `1px solid ${s.color}28`, borderRadius: 100, padding: '4px 10px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: s.color, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'buttons') {
    const data = ds?.buttons || {
      label: 'Components / Buttons',
      items: [
        { label: 'Primary',     bg: accentColor,   color: '#fff',    border: 'none' },
        { label: 'Secondary',   bg: 'transparent', color: accentColor, border: `1.5px solid ${accentColor}` },
        { label: 'Ghost',       bg: 'transparent', color: accentColor, border: '1.5px solid transparent', opacity: 0.7 },
        { label: 'Destructive', bg: '#FDF0F0',      color: '#C43C3C', border: '1.5px solid #C43C3C40' },
      ],
    };
    return (
      <div style={base}>
        {lbl(data.label)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {data.items.map((b, i) => (
            <div key={i} style={{ background: b.bg, color: b.color, border: b.border, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textAlign: 'center', opacity: b.opacity || 1 }}>{b.label}</div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const AuditBlock = ({ auditData, accentColor }) => {
  const rules = (auditData.codeSnippet || '').split('\n').map(l => l.trim()).filter(Boolean);
  const ds = auditData.designSystem || null; // project-specific DS data
  return (
    <div style={{ margin: '32px 0' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${auditData.stats.length}, 1fr)`, gap: 1, background: 'rgba(0,0,0,0.06)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {auditData.stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', padding: '20px 22px' }}>
            <div style={{ fontSize: 38, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: accentColor, lineHeight: 1 }}>{s.number}</div>
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8, opacity: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Guardrail rules as pill tags */}
      {rules.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 12, opacity: 0.7 }}>Design Guardrails</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {rules.map((r, i) => (
              <div key={i} style={{ background: `${accentColor}0c`, border: `1px solid ${accentColor}25`, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontFamily: 'DM Mono, monospace', color: '#1a1814', lineHeight: 1.4 }}>{r}</div>
            ))}
          </div>
        </div>
      )}

      {/* DS Specimen cards — data-driven from auditData.designSystem */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <DSSpecimenCard type="colors"     accentColor={accentColor} ds={ds} />
        <DSSpecimenCard type="typography" accentColor={accentColor} ds={ds} />
        <DSSpecimenCard type="status"     accentColor={accentColor} ds={ds} />
        <DSSpecimenCard type="buttons"    accentColor={accentColor} ds={ds} />
      </div>
    </div>
  );
};

const ProductSteps = ({ steps, accentColor }) => {
  // Split into two rows for readability (row 1: first half, row 2: remainder)
  const half = Math.ceil(steps.length / 2);
  const rows = steps.length > 4 ? [steps.slice(0, half), steps.slice(half)] : [steps];

  return (
    <div style={{ margin: '32px 0' }}>
      <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: accentColor, opacity: 0.6, marginBottom: 14 }}>
        {steps.length}-Stage Clinical Workflow
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', alignItems: 'stretch', marginBottom: ri < rows.length - 1 ? 2 : 0 }}>
          {row.map((s, i) => {
            const isFirst = i === 0;
            const isLast  = i === row.length - 1;
            const tl = ri === 0 && isFirst  ? 10 : ri > 0 && isFirst ? 0 : 0;
            const tr = ri === 0 && isLast   ? 10 : ri > 0 && isLast  ? 0 : 0;
            const bl = ri === rows.length - 1 && isFirst ? 10 : 0;
            const br = ri === rows.length - 1 && isLast  ? 10 : 0;
            return (
              <React.Fragment key={i}>
                <div style={{
                  flex: 1,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRight: isLast ? '1px solid rgba(0,0,0,0.07)' : 'none',
                  borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
                  padding: '18px 16px 16px',
                }}>
                  <div style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 20, fontWeight: 700,
                    color: accentColor, lineHeight: 1,
                    marginBottom: 10, letterSpacing: '-0.01em',
                  }}>{s.step}</div>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 5, lineHeight: 1.3, color: '#1a1814' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.48)', lineHeight: 1.6 }}>{s.description}</div>
                </div>
                {/* Arrow connector between cards */}
                {!isLast && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, flexShrink: 0,
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.07)', borderLeft: 'none', borderRight: 'none',
                    color: accentColor, fontSize: 11, opacity: 0.5,
                  }}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const PowerMap = ({ powerMap, accentColor }) => (
  <div style={{ margin: '32px 0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24 }}>
      <div style={{ background: 'var(--surface-secondary)', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: 8 }}>KNOWS THE MOST</div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{powerMap.left.role}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{powerMap.left.detail}</div>
      </div>
      <div style={{ textAlign: 'center', opacity: 0.5 }}>
        <div style={{ fontSize: 24 }}>↕</div>
        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{powerMap.gap}</div>
      </div>
      <div style={{ background: 'var(--surface-secondary)', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: 8 }}>HAS AUTHORITY</div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{powerMap.right.role}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{powerMap.right.detail}</div>
      </div>
    </div>
    {powerMap.stats && (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {powerMap.stats.map((s, i) => (
          <div key={i} style={{ background: accentColor + '10', borderRadius: 6, padding: '10px 16px', fontFamily: 'DM Mono, monospace', fontSize: 13, color: accentColor }}>{s}</div>
        ))}
      </div>
    )}
  </div>
);

const QuoteCards = ({ quotes, accentColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '32px 0' }}>
    {quotes.map((q, i) => (
      <div key={i} style={{ background: accentColor + '08', borderLeft: `3px solid ${accentColor}`, borderRadius: '0 8px 8px 0', padding: '16px 20px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, opacity: 0.85 }}>"{q.text}"</p>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{q.role}</div>
      </div>
    ))}
  </div>
);

const DashboardTabSwitcher = ({ accentColor, children }) => {
  const [tab, setTab] = React.useState('mobile');
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'var(--surface-secondary)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {['mobile', 'dashboard'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === t ? accentColor : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-primary)',
            fontFamily: 'DM Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
            transition: 'background 0.15s'
          }}>{t}</button>
        ))}
      </div>
      {tab === 'mobile' ? children : (
        <div style={{ background: 'var(--surface-secondary)', borderRadius: 8, overflow: 'hidden', maxWidth: 480 }}>
          <div style={{ background: '#2a2a2a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ background: '#3a3a3a', borderRadius: 4, padding: '3px 12px', fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#888', marginLeft: 8, flex: 1, maxWidth: 200 }}>
              app.meatinspector.gov.on.ca
            </div>
          </div>
          <div style={{ height: 280, background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard View</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Schedule management + reporting</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineRow = ({ timeline, accentColor }) => (
  <div style={{ overflowX: 'auto', margin: '32px 0', paddingBottom: 8 }}>
    <div style={{ display: 'flex', minWidth: 'max-content', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 2, background: accentColor + '30' }} />
      {timeline.map((t, i) => (
        <div key={i} style={{ minWidth: 160, padding: '0 16px', position: 'relative' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor, marginBottom: 16, position: 'relative', zIndex: 1 }} />
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{t.month}</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t.phase}</div>
          <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5 }}>{t.activities}</div>
        </div>
      ))}
    </div>
  </div>
);

const PillarsGrid = ({ pillars, accentColor }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, margin: '32px 0' }}>
    {pillars.map((p, i) => (
      <div key={i} style={{ background: 'var(--surface-secondary)', borderRadius: 8, padding: '20px 24px', borderBottom: '2px solid transparent', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = accentColor}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 700, color: accentColor, lineHeight: 1 }}>{p.number}</div>
          <div style={{ background: accentColor + '15', color: accentColor, borderRadius: 4, padding: '3px 8px', fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.tag}</div>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{p.title}</div>
        <p style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>"{p.quote}"</p>
      </div>
    ))}
  </div>
);

const PrincipleCards = ({ principles, accentColor }) => (
  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '32px 0', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
    {principles.map((p, i) => (
      <div key={i} style={{ minWidth: 220, background: 'var(--surface-secondary)', borderRadius: 8, padding: '20px', scrollSnapAlign: 'start', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{p.rule}</div>
        <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5 }}>{p.why}</div>
      </div>
    ))}
  </div>
);

const SeasonCards = ({ seasons, accentColor }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '32px 0' }}>
    {seasons.map((s, i) => (
      <div key={i} style={{ background: 'var(--surface-secondary)', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{s.season}</div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>{s.finding}</p>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────
   STYLES — all overlay CSS in one string
───────────────────────────────────────────────────────── */

const OVERLAY_CSS = `
  .project-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    will-change: opacity, transform;
    cursor: none;
    --surface-secondary: #f7f7f7;
  }

  /* Keep custom cursor active inside overlay */
  .project-overlay * { cursor: none; }
  .sidebar-nav-item,
  .overlay-back-to-top { cursor: none; }

  /* ── Body: two-column ── */
  .overlay-body {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: 100vh;
  }

  /* ── Sidebar ── */
  .case-study-sidebar {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    height: 100%;
    overflow-y: auto;
    padding: 40px 20px 32px;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
    scrollbar-width: none;
  }

  .case-study-sidebar::-webkit-scrollbar { display: none; }

  .sidebar-back {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.35);
    letter-spacing: 0.02em;
    cursor: none;
    margin-bottom: 20px;
    padding: 4px 8px;
    transition: color 0.15s;
  }

  .sidebar-back:hover { color: #0A0A0A; }

  .sidebar-back-bottom {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.35);
    cursor: none;
    transition: color 0.15s;
    padding-bottom: 4px;
  }

  .sidebar-back-bottom:hover { color: #0A0A0A; }

  /* Mobile overlay back button — hidden on desktop, shown on mobile */
  .mobile-overlay-back {
    display: none;
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 10;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 20px;
    background: rgba(0,0,0,0.38);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.85);
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .sidebar-nav-item {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.35);
    padding: 6px 10px;
    border-radius: 6px;
    cursor: none;
    transition: all 0.15s ease;
    line-height: 1.2;
  }

  .sidebar-nav-item:hover {
    color: rgba(0, 0, 0, 0.70);
    background: rgba(0, 0, 0, 0.03);
  }

  .sidebar-nav-item.active {
    color: #0A0A0A;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.05);
  }

  /* ── Content column ── */
  .case-study-content {
    flex: 1;
    min-width: 0; /* critical — prevents flex child from sizing to content */
    width: 100%;
    overflow-y: auto;
    height: 100%;
    scroll-behavior: smooth;
  }

  .case-study-content::-webkit-scrollbar {
    width: 4px;
  }
  .case-study-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .case-study-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  /* ── Hero ── */
  .case-study-hero {
    width: 100%;
    min-height: 75vh;
    height: 75vh;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .hero-gradient {
    width: 100%;
    height: 100%;
  }

  .hero-text {
    position: absolute;
    bottom: 40px;
    left: 64px;
  }

  .hero-project-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .hero-project-name {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: clamp(28px, 3.5vw, 48px);
    font-weight: 500;
    color: #ffffff;
    letter-spacing: -0.03em;
    line-height: 1.1;
    text-shadow: 0 2px 24px rgba(0,0,0,0.3);
  }

  .hero-meta-line {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.01em;
    margin-top: 10px;
  }

  /* ── Project meta ── */
  .project-meta {
    padding: 24px 64px;
    background: #ffffff;
  }

  /* ── Sidebar IA item ── */
  .sidebar-nav-item--ia {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  /* ── BENTO GRID ── */
  @keyframes bento-enter {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      "situation situation users"
      "problem constraints outcome"
      "problem process process"
      "decisions decisions product";
    gap: 8px;
    padding: 0 0 40px;
  }

  .bt {
    border-radius: 16px;
    padding: 16px 18px;
    opacity: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    position: relative;
  }
  .bt:hover { box-shadow: 0 6px 30px rgba(0,0,0,0.09); }

  .bento-visible .bt {
    animation: bento-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* grid area assignments */
  .bt-situation   { grid-area: situation; }
  .bt-users       { grid-area: users; background: #fff; }
  .bt-problem     { grid-area: problem; }
  .bt-constraints { grid-area: constraints; }
  .bt-outcome     { grid-area: outcome; }
  .bt-process     { grid-area: process; }
  .bt-decisions   { grid-area: decisions; background: #fff; }
  .bt-product     { grid-area: product; }
  .bt-misc        { grid-area: auto; }

  /* LABEL */
  .bt-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.55;
    flex-shrink: 0;
  }
  .bt-label--inv { color: rgba(255,255,255,0.55); opacity: 1; }

  /* PROSE */
  .bt-prose { display: flex; flex-direction: column; gap: 6px; }
  .bt-line {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 13px;
    color: rgba(0,0,0,0.60);
    line-height: 1.65;
    margin: 0;
  }

  /* SITUATION stat rows */
  .bt-sit-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .bt-sit-row { display: flex; flex-direction: column; gap: 1px; }
  .bt-sit-num {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 36px; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1;
  }
  .bt-sit-label {
    font-family: 'Geist Mono', monospace;
    font-size: 9px; letter-spacing: 0.10em;
    text-transform: uppercase; color: rgba(0,0,0,0.45); line-height: 1.4;
  }
  .bt-sit-prose {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12px; color: rgba(0,0,0,0.50); line-height: 1.6; margin: 4px 0 0;
    font-style: italic;
  }

  /* USERS */
  .bt-user-stack { display: flex; flex-direction: column; gap: 0; flex: 1; }
  .bt-user-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid;
  }
  .bt-user-row:last-child { border-bottom: none; padding-bottom: 0; }
  .bt-user-tier-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
  }
  .bt-user-text { display: flex; flex-direction: column; gap: 2px; }
  .bt-user-role {
    font-family: 'Geist Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .bt-user-desc {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px;
    color: rgba(0,0,0,0.50);
    line-height: 1.5;
  }

  /* PROBLEM — dark tile */
  .bt-problem { justify-content: space-between; }
  .bt-problem-body { display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .bt-problem-lead {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: rgba(255,255,255,0.92);
    line-height: 1.55;
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }
  .bt-problem-line {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px;
    color: rgba(255,255,255,0.62);
    line-height: 1.65;
    margin: 0;
  }

  /* CONSTRAINTS */
  .bt-constraint-list { display: flex; flex-direction: column; gap: 8px; }
  .bt-constraint-row {
    display: flex; align-items: flex-start;
    padding-left: 10px;
    border-left: 2px solid;
  }
  .bt-c-text {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px; font-weight: 500; color: rgba(0,0,0,0.65); line-height: 1.55;
  }

  /* PROCESS */
  .bt-process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0;
    position: relative;
  }
  .bt-process-item {
    display: flex; flex-direction: column; gap: 6px;
    padding: 0 20px 0 0;
    position: relative;
  }
  .bt-process-item:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    right: 0;
    width: 1px;
    height: 20px;
    background: rgba(0,0,0,0.10);
  }
  .bt-p-num {
    font-family: 'Geist Mono', monospace;
    font-size: 28px; font-weight: 300;
    letter-spacing: -0.04em; line-height: 1;
  }
  .bt-p-text {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px; font-weight: 500; color: rgba(0,0,0,0.62); line-height: 1.5;
  }

  /* KEY DECISIONS */
  .bt-decisions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    flex: 1;
  }
  .bt-decision-card {
    padding: 10px 12px; border-radius: 10px; border: 1px solid;
    display: flex; flex-direction: row; align-items: flex-start; gap: 8px;
  }
  .bt-d-arrow {
    font-size: 14px; font-weight: 700; flex-shrink: 0; line-height: 1.4;
  }
  .bt-d-text {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12px; font-weight: 500; color: rgba(0,0,0,0.68); line-height: 1.5;
  }

  /* PRODUCT */
  .bt-product-list { display: flex; flex-direction: column; gap: 8px; }
  .bt-product-item { display: flex; align-items: flex-start; gap: 10px; }
  .bt-prod-check {
    font-size: 13px; font-weight: 700; flex-shrink: 0; line-height: 1.5;
  }
  .bt-prod-text {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px; font-weight: 500; color: rgba(0,0,0,0.70); line-height: 1.5;
  }

  /* OUTCOME — accent tile */
  .bt-outcome { justify-content: space-between; }
  .bt-stats { display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .bt-stat { display: flex; flex-direction: column; gap: 2px; }
  .bt-stat-num {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 44px; font-weight: 800;
    letter-spacing: -0.04em; color: #fff; line-height: 0.9;
    text-shadow: 0 2px 24px rgba(255,255,255,0.15);
  }
  .bt-stat-label {
    font-family: 'Geist Mono', monospace;
    font-size: 9px; letter-spacing: 0.10em;
    text-transform: uppercase; color: rgba(255,255,255,0.55); line-height: 1.4;
  }
  .bt-stat-divider {
    width: 24px; height: 1px; background: rgba(255,255,255,0.20); margin: 1px 0;
  }
  .bt-outcome-prose {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 12.5px; color: rgba(255,255,255,0.70); line-height: 1.6; margin: 0;
    font-style: italic;
  }

  @media (max-width: 860px) {
    .bento-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "situation situation"
        "problem problem"
        "users constraints"
        "process process"
        "decisions decisions"
        "outcome product";
    }
  }
  @media (max-width: 520px) {
    .bento-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "situation" "users" "problem" "constraints"
        "process" "decisions" "outcome" "product";
    }
  }

  .bt:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.10);
    z-index: 2;
  }
  .bt-problem:hover, .bt-outcome:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.20);
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .meta-label {
    display: block;
    font-family: 'Geist Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: rgba(0, 0, 0, 0.35);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .meta-value {
    display: block;
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: #0A0A0A;
    line-height: 1.2;
  }

  /* ── Content sections ── */
  .case-study-section {
    padding: 64px 80px 56px;
    max-width: 100%;
    width: 100%;
    min-height: 75vh;
    box-sizing: border-box;
    background: #ffffff;
  }

  .case-study-section:not(#overview) {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .section-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    color: rgba(0, 0, 0, 0.30);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .section-ep-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .section-ep-chip {
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(0,0,0,0.05);
    color: rgba(0,0,0,0.40);
  }

  .section-headline {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 500;
    color: #0A0A0A;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .section-body {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.70);
    line-height: 1.65;
    margin-bottom: 14px;
  }

  .section-body + .section-body {
    margin-top: 0;
  }

  .section-body--hook {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.80);
    line-height: 1.55;
    margin-bottom: 20px;
    font-style: italic;
  }

  /* Inline body list */
  .section-list {
    list-style: none;
    padding: 0;
    margin: 0 0 48px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-list li {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.60);
    line-height: 1.2;
    padding-left: 16px;
    position: relative;
  }

  .section-list li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: rgba(0, 0, 0, 0.20);
    font-size: 12px;
    top: 3px;
  }

  /* Full-bleed image block */
  .section-image-block {
    width: 100%;
    margin: 40px 0 32px;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: none;
  }

  .section-image-block .image-fill {
    width: 100%;
    aspect-ratio: 21/9;
    object-fit: cover;
    border-radius: 12px;
  }

  .image-caption {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.30);
    text-align: center;
    padding: 12px 0 0;
    letter-spacing: 0.04em;
  }

  /* Split layout — text left, mockup right */
  .section-split {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }

  .section-split-text {
    flex: 1;
    min-width: 0;
  }

  .section-split-mockup {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 40px;
  }

  .mockup-phone {
    width: 100%;
    aspect-ratio: 9/19;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.06);
  }

  @media (max-width: 800px) {
    .section-split { flex-direction: column; }
    .section-split-mockup { width: 100%; position: static; }
    .mockup-phone { aspect-ratio: 9/16; max-height: 60vw; }
  }

  /* Subsections */
  .subsection {
    margin-top: 48px;
    padding-top: 40px;
    padding-left: 16px;
    border-left: 2px solid rgba(0,0,0,0.08);
  }

  .subsection-title {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #0A0A0A;
    margin-bottom: 10px;
  }

  .subsection-body {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.58);
    line-height: 1.65;
  }

  /* Overview section — compact intro, slightly smaller than episode sections */
  #overview .section-headline {
    font-size: clamp(16px, 1.8vw, 22px);
    line-height: 1.3;
    margin-bottom: 10px;
  }

  #overview .section-body {
    font-size: 14px;
    line-height: 1.2;
    color: rgba(0, 0, 0, 0.50);
  }

  /* Callout — pulled quote */
  .section-callout {
    border-left: 3px solid #0A0A0A;
    padding: 16px 20px;
    margin: 20px 0;
  }

  .section-callout p {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #0A0A0A;
    line-height: 1.2;
    font-style: italic;
  }

  /* Bottom navigation */
  .overlay-bottom-nav {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 56px 80px 72px;
  }

  .bottom-nav-btn {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    cursor: none;
    transition: color 0.15s;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
  }

  .bottom-nav-btn.next-btn {
    text-align: right;
    align-items: flex-end;
  }

  .bottom-nav-btn:hover { color: #0A0A0A; }

  .bottom-nav-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: rgba(0, 0, 0, 0.25);
    text-transform: uppercase;
  }

  .bottom-nav-title {
    font-size: 15px;
    font-weight: 400;
  }

  /* Responsive: hide sidebar below 800px */
  @media (max-width: 800px) {
    .case-study-sidebar { display: none; }
    .hero-text { left: 20px; bottom: 24px; }
    .hero-project-name { font-size: clamp(24px, 6vw, 40px); }
    /* Hero section — shorter so image and text sit closer together */
    .case-study-hero { min-height: 52vh !important; height: 52vh !important; }
    /* Hero image: fill width, sit near top, fade at bottom */
    .hero-image {
      width: 80% !important;
      right: 50% !important;
      transform: translateX(50%) !important;
      top: 4% !important;
      max-height: 70% !important;
      object-fit: contain !important;
    }
    /* Mobile back button */
    .mobile-overlay-back { display: flex !important; }
    .project-meta { padding: 16px 24px; }
    .meta-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .ia-diagram-container { padding: 32px 24px 40px; }
    .case-study-section { padding: 32px 24px; min-height: 75svh; }
    .section-image-block {
      width: calc(100% + 48px);
      margin-left: -24px;
      margin-right: -24px;
    }
    .image-caption { padding: 12px 24px 0; }
  }
`;

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */

export default function ProjectOverlay({ projectId, originRect, onClose, onNext, closeRef }) {
  const navigate     = useNavigate();
  const project      = projects.find(p => p.id === projectId);
  const sections     = deriveSections(project);
  const currentIndex = projects.findIndex(p => p.id === projectId);
  const nextProject  = currentIndex >= 0 && currentIndex < projects.length - 1
    ? projects[currentIndex + 1]
    : null;

  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const closingRef = useRef(false);

  /* ── Open animation ── */
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    gsap.to('.portfolio-world', {
      filter:   'blur(24px) brightness(0.7) saturate(0.8)',
      scale:    1.02,
      duration: 0.4,
      ease:     'power2.out',
    });

    gsap.fromTo(el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }
    );
  }, []);

  /* ── Close ── */
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    // Overlay fades out
    gsap.to(overlayRef.current, {
      opacity:  0,
      y:        8,
      duration: 0.28,
      ease:     'power2.in',
    });

    // Portfolio-world restores — onClose fires only after clearProps so the
    // fixed dock is never trapped inside a filtered stacking context on unmount
    gsap.to('.portfolio-world', {
      filter:     'blur(0px) brightness(1) saturate(1)',
      scale:      1,
      duration:   0.35,
      ease:       'power2.inOut',
      clearProps: 'filter,transform',
      onComplete: onClose,
    });
  }, [onClose]);

  /* ── Expose handleClose so external callers (logo click) can trigger it ── */
  useEffect(() => {
    if (closeRef) closeRef.current = handleClose;
    return () => { if (closeRef) closeRef.current = null; };
  }, [handleClose, closeRef]);

  /* ── Navigate to next project (skip portfolio-world restore — new overlay will re-blur) ── */
  const handleNext = useCallback(() => {
    if (closingRef.current || !nextProject) return;
    closingRef.current = true;

    gsap.to(overlayRef.current, {
      opacity:    0,
      x:          -24,
      duration:   0.25,
      ease:       'power2.in',
      onComplete: () => onNext(nextProject.id),
    });
  }, [onNext, nextProject]);

  /* ── Keyboard: Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  /* ── Intersection Observer: highlights matching sidebar item as user scrolls ── */
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const sectionEls = contentEl.querySelectorAll('.case-study-section');
    if (!sectionEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.classList.remove('active');
          });
          const id = entry.target.getAttribute('id');
          const match = document.querySelector(`.sidebar-nav-item[data-section="${id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, {
      root:       contentEl,
      threshold:  0,
      rootMargin: '-10% 0px -70% 0px',
    });

    sectionEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [projectId]);

  /* ── Sidebar nav: scroll to section ── */
  const scrollToSection = useCallback((id) => {
    const contentEl = contentRef.current;
    const targetEl  = document.getElementById(id);
    if (!contentEl || !targetEl) return;
    contentEl.scrollTo({ top: targetEl.offsetTop - 24, behavior: 'smooth' });
  }, []);

  if (!project) return null;

  /* ── Meta values ── */
  const meta = {
    timeline: project.hero?.metadata?.[0] ?? project.timeline ?? '',
    role:     project.hero?.metadata?.[1] ?? project.type ?? '',
    team:     project.hero?.metadata?.[2] ?? (Array.isArray(project.team) ? project.team.join(', ') : project.team ?? ''),
    tools:    project.platform ?? '',
  };

  /* ── Sidebar label: title case from eyebrow, max 26 chars ── */
  const sidebarLabel = (eyebrow) => {
    if (eyebrow === 'OVERVIEW') return 'Overview';
    const label = eyebrow
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    return label.length > 26 ? label.slice(0, 24) + '…' : label;
  };

  return (
    <div
      ref={overlayRef}
      className="project-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* ── Two-column body ── */}
      <div
        className="overlay-body"
        style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden', width: '100%', height: '100vh' }}
      >

        {/* Sidebar */}
        <nav
          className="case-study-sidebar"
          aria-label="Case study sections"
          style={{ width: 200, minWidth: 200, maxWidth: 200, flexShrink: 0 }}
        >
          {sections.map((sec, i) => (
            <div
              key={sec.id}
              className={`sidebar-nav-item${i === 0 ? ' active' : ''}`}
              data-section={sec.id}
              onClick={() => scrollToSection(sec.id)}
              title={sec.type === 'ia' ? 'Project Summary' : undefined}
            >
              {sec.type === 'ia' ? 'Summary' : sidebarLabel(sec.eyebrow)}
            </div>
          ))}

          <div className="sidebar-back-bottom" onClick={handleClose}>
            ← All Projects
          </div>
          <div
            className="sidebar-back-bottom"
            onClick={() => navigate('/about')}
            style={{ marginTop: 8, borderTop: 'none', paddingTop: 0 }}
          >
            About Me →
          </div>
        </nav>

        {/* Scrollable content */}
        <div
          className="case-study-content"
          ref={contentRef}
          style={{ flex: 1, minWidth: 0, width: '100%', overflowY: 'auto', height: '100%' }}
        >

          {/* Hero */}
          <div className="case-study-hero" style={{ width: '100%' }}>
            <div
              className="hero-gradient"
              style={{ background: project.hero?.gradient ?? `linear-gradient(135deg, ${project.accentColor} 0%, #0a0a0a 100%)` }}
            />

            {/* Mobile back button — desktop uses sidebar ← All Projects */}
            <button className="mobile-overlay-back" onClick={handleClose}>
              ← Back
            </button>

            {(project.heroImage || project.previewMedia) && (
              <img
                src={project.heroImage || project.previewMedia}
                alt=""
                className="hero-image"
                style={{
                  position:     'absolute',
                  top:          '6%',
                  right:        '4%',
                  width:        'auto',
                  maxWidth:     '56%',
                  height:       'auto',
                  maxHeight:    '88%',
                  borderRadius: '10px 10px 0 0',
                  boxShadow:    '0 24px 80px rgba(0,0,0,0.12)',
                  objectFit:    'contain',
                  objectPosition: 'top right',
                  pointerEvents: 'none',
                  maskImage:    'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              />
            )}
            <div className="hero-text">
              <p className="hero-project-label" style={project.hero?.light ? { color: 'rgba(0,0,0,0.50)' } : undefined}>{project.hero?.badge ?? project.org}</p>
              <h1 className="hero-project-name" style={project.hero?.light ? { color: '#1a1814', textShadow: 'none' } : undefined}>{project.title}</h1>
              <p className="hero-meta-line" style={project.hero?.light ? { color: 'rgba(0,0,0,0.50)' } : undefined}>
                {[meta.timeline, meta.role, meta.team].filter(Boolean).join(' · ')}
              </p>
              {project.status === 'placeholder' && (
                <div style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            6,
                  marginTop:      12,
                  padding:        '4px 10px',
                  borderRadius:   20,
                  background:     'rgba(255,255,255,0.10)',
                  border:         '1px solid rgba(255,255,255,0.20)',
                  backdropFilter: 'blur(8px)',
                  fontFamily:     'var(--mono)',
                  fontSize:       11,
                  letterSpacing:  '0.06em',
                  color:          'rgba(255,255,255,0.65)',
                }}>
                  <span style={{
                    width:        6,
                    height:       6,
                    borderRadius: '50%',
                    background:   '#f5a623',
                    flexShrink:   0,
                    animation:    'wip-pulse 2s ease-in-out infinite',
                  }} />
                  Case study in progress
                </div>
              )}
            </div>
          </div>

          {/* Meta grid */}
          <div className="project-meta" style={{ width: '100%', boxSizing: 'border-box' }}>
            <div className="meta-grid">
              <div>
                <span className="meta-label">Timeline</span>
                <span className="meta-value">{meta.timeline}</span>
              </div>
              <div>
                <span className="meta-label">Role</span>
                <span className="meta-value">{meta.role}</span>
              </div>
              <div>
                <span className="meta-label">Team</span>
                <span className="meta-value">{meta.team}</span>
              </div>
              <div>
                <span className="meta-label">Tools</span>
                <span className="meta-value">{meta.tools}</span>
              </div>
            </div>
          </div>

          {/* Sections (includes injected IA section) */}
          {sections.map(sec => {
            /* IA section — horizontal node diagram */
            if (sec.type === 'ia') {
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="case-study-section"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                >
                  <p className="section-eyebrow" style={{ color: project.accentColor }}>SUMMARY</p>
                  <h2 className="section-headline" style={{ marginBottom: 32 }}>Project Summary</h2>
                  <IADiagram iaText={project.ia} accentColor={project.accentColor} />
                </section>
              );
            }

            /* Standard section */
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="case-study-section"
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <p className="section-eyebrow" style={{ color: project.accentColor }}>{sec.eyebrow}</p>
                {(sec.ep || sec.readTime) && (
                  <div className="section-ep-meta">
                    {sec.ep && <span className="section-ep-chip" style={{ background: project.accentColor + '12', color: project.accentColor }}>{`EP ${sec.ep}`}</span>}
                    {sec.readTime && <span className="section-ep-chip" style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)' }}>{sec.readTime} read</span>}
                  </div>
                )}

                {/* Split layout: text left, phone mockup right */}
                {sec.layout === 'split' ? (
                  <div className="section-split">
                    <div className="section-split-text">
                      {sec.headline.toUpperCase() !== sec.eyebrow && (
                        <h2 className="section-headline">{sec.headline}</h2>
                      )}
                      {sec.stats && (
                        <>
                          <StatChipsRow stats={sec.stats} accentColor={project.accentColor} />
                          {sec.body && <ProblemPullQuote body={sec.body} accentColor={project.accentColor} />}
                          {sec.body && (() => {
                            const rest = sec.body.split('. ').slice(1).join('. ');
                            return rest ? <p className="section-body">{rest}</p> : null;
                          })()}
                        </>
                      )}
                      {!sec.stats && (
                        <>
                          {sec.body && sec.bodyBlocks && sec.bodyBlocks.length > 0 && (
                            <p className="section-body section-body--hook">{sec.body}</p>
                          )}
                          {sec.bodyBlocks && sec.bodyBlocks.length > 0
                            ? sec.bodyBlocks.map((block, i) =>
                                block.type === 'ul'
                                  ? <ul key={i} className="section-list">{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                                  : <p key={i} className="section-body">{block.text}</p>
                              )
                            : (!sec.bodyBlocks || sec.bodyBlocks.length === 0) && sec.body && <p className="section-body">{sec.body}</p>
                          }
                        </>
                      )}
                      {sec.pillars && <PillarsGrid pillars={sec.pillars} accentColor={project.accentColor} />}
                      {sec.subsections.map((sub, i) => (
                        <div key={i} className="subsection" style={{ borderLeftColor: project.accentColor + '30' }}>
                          <h3 className="subsection-title">{sub.title}</h3>
                          <p className="subsection-body">{sub.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="section-split-mockup">
                      {sec.hasDashboard ? (
                        <DashboardTabSwitcher accentColor={project.accentColor}>
                          <div
                            className="mockup-phone"
                            style={{ background: sec.mockupGradient || `linear-gradient(160deg, ${project.accentColor}22 0%, ${project.accentColor}44 100%)` }}
                          >
                            {sec.mockupUrl && (
                              <img src={sec.mockupUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            )}
                          </div>
                        </DashboardTabSwitcher>
                      ) : (
                        <div
                          className="mockup-phone"
                          style={{ background: sec.mockupGradient || `linear-gradient(160deg, ${project.accentColor}22 0%, ${project.accentColor}44 100%)` }}
                        >
                          {sec.mockupUrl && (
                            <img src={sec.mockupUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats chips always shown when present — even on diagram episodes */}
                    {sec.stats && <StatChipsRow stats={sec.stats} accentColor={project.accentColor} />}

                    {/* When a diagram is present it's self-contained — skip redundant headline + prose body */}
                    {!sec.diagramKey && (
                      <>
                        {sec.headline.toUpperCase() !== sec.eyebrow && (
                          <h2 className="section-headline">{sec.headline}</h2>
                        )}
                        {sec.stats ? (
                          <>
                            {sec.body && <ProblemPullQuote body={sec.body} accentColor={project.accentColor} />}
                            {sec.body && (() => {
                              const rest = sec.body.split('. ').slice(1).join('. ');
                              return rest ? <p className="section-body">{rest}</p> : null;
                            })()}
                          </>
                        ) : (
                          <>
                            {sec.body && sec.bodyBlocks && sec.bodyBlocks.length > 0 && (
                              <p className="section-body section-body--hook">{sec.body}</p>
                            )}
                            {sec.bodyBlocks && sec.bodyBlocks.length > 0
                              ? sec.bodyBlocks.map((block, i) =>
                                  block.type === 'ul'
                                    ? <ul key={i} className="section-list">{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                                    : <p key={i} className="section-body">{block.text}</p>
                                )
                              : (!sec.bodyBlocks || sec.bodyBlocks.length === 0) && sec.body && <p className="section-body">{sec.body}</p>
                            }
                          </>
                        )}
                      </>
                    )}

                    {sec.callout && (
                      <div className="section-callout" style={{ borderLeftColor: project.accentColor }}>
                        <p>{sec.callout}</p>
                      </div>
                    )}

                    {/* Overview video */}
                    {sec.id === 'overview' && project.hero?.videoUrl && (
                      <div style={{ marginTop: 28, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.10)' }}>
                        <video
                          src={project.hero.videoUrl}
                          autoPlay muted loop playsInline
                          style={{
                            width: '100%',
                            display: 'block',
                            objectFit: project.hero.videoFit ?? 'cover',
                          }}
                        />
                      </div>
                    )}

                    {/* Diagram block */}
                    {sec.diagramKey && DIAGRAM_MAP[sec.diagramKey] && (
                      <div className="section-image-block" style={{ marginTop: 32, borderRadius: 12, overflow: 'hidden' }}>
                        <DiagramWrapper
                          component={DIAGRAM_MAP[sec.diagramKey].component}
                          diagramHeight={DIAGRAM_MAP[sec.diagramKey].height}
                        />
                      </div>
                    )}

                    {/* New visual components — rendered after body/diagram */}
                    {sec.auditData    && <AuditBlock    auditData={sec.auditData}       accentColor={project.accentColor} />}
                    {sec.productSteps && <ProductSteps  steps={sec.productSteps}        accentColor={project.accentColor} />}
                    {sec.impactStats  && <ImpactGrid    impactStats={sec.impactStats}   accentColor={project.accentColor} />}
                    {sec.powerMap     && <PowerMap      powerMap={sec.powerMap}         accentColor={project.accentColor} />}
                    {sec.quotes       && <QuoteCards    quotes={sec.quotes}             accentColor={project.accentColor} />}
                    {sec.timeline     && <TimelineRow   timeline={sec.timeline}         accentColor={project.accentColor} />}
                    {sec.pillars      && <PillarsGrid   pillars={sec.pillars}           accentColor={project.accentColor} />}
                    {sec.principles   && <PrincipleCards principles={sec.principles}   accentColor={project.accentColor} />}
                    {sec.seasons      && <SeasonCards   seasons={sec.seasons}           accentColor={project.accentColor} />}

                    {/* Subsections */}
                    {sec.subsections.map((sub, i) => (
                      <div key={i} className="subsection" style={{ borderLeftColor: project.accentColor + '30' }}>
                        <h3 className="subsection-title">{sub.title}</h3>
                        <p className="subsection-body">{sub.body}</p>
                      </div>
                    ))}
                  </>
                )}
              </section>
            );
          })}

          {/* Bottom navigation */}
          <div className="overlay-bottom-nav">
            <button className="bottom-nav-btn" onClick={handleClose}>
              <span className="bottom-nav-label">Back</span>
              <span className="bottom-nav-title">← All Projects</span>
            </button>
            {nextProject && (
              <button className="bottom-nav-btn next-btn" onClick={handleNext}>
                <span className="bottom-nav-label">Next</span>
                <span className="bottom-nav-title">{nextProject.title} →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{OVERLAY_CSS}</style>
    </div>
  );
}
