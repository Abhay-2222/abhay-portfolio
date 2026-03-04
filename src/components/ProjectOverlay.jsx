/**
 * ProjectOverlay.jsx
 * Full-screen case study view — macOS-style.
 * Sticky sidebar + scrollable content column.
 * Sections derived from existing episode data — no content changes.
 */

import { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
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
function DiagramWrapper({ component: Diagram, diagramHeight = 900 }) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setScale(w / 1600);
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: `${diagramHeight * scale}px`, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
        <Suspense fallback={<div style={{ width: 1600, height: diagramHeight, background: '#f5f5f5' }} />}>
          <Diagram />
        </Suspense>
      </div>
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
    };
  });

  const iaSection = project.ia ? {
    id:           'information-architecture',
    eyebrow:      'STRUCTURE',
    headline:     'Information Architecture',
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

function IADiagram({ iaText }) {
  const nodes = iaText.trim().split('\n\n').map(block => {
    const lines = block.trim().split('\n');
    return { label: lines[0], body: lines.slice(1).join('\n') };
  });

  return (
    <div className="ia-diagram-container">
      <div className="ia-nodes">
        {nodes.map((node, i) => (
          <div key={i} className="ia-node-wrapper">
            <div className="ia-node">
              <div className="ia-node-label">{node.label}</div>
              <div className="ia-node-body">{node.body}</div>
            </div>
            {i < nodes.length - 1 && (
              <div className="ia-connector">
                <div className="ia-connector-line" />
                <div className="ia-connector-arrow">→</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(48px) saturate(180%);
    -webkit-backdrop-filter: blur(48px) saturate(180%);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    will-change: opacity, transform;
    cursor: none;
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  /* ── Sidebar IA item ── */
  .sidebar-nav-item--ia {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  /* ── IA diagram ── */
  .ia-diagram-container {
    padding: 40px 80px 56px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    overflow-x: auto;
  }

  .ia-nodes {
    display: flex;
    align-items: flex-start;
    gap: 0;
    min-width: max-content;
    padding-bottom: 8px;
  }

  .ia-node-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 0;
  }

  .ia-node {
    width: 196px;
    min-height: 140px;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.07);
    border-radius: 12px;
    padding: 16px 18px;
    cursor: default;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
  }

  .ia-node:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.13);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .ia-node-label {
    font-family: 'Geist Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.35);
    margin-bottom: 10px;
  }

  .ia-node-body {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 11.5px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.55);
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .ia-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 58px;
    width: 40px;
    flex-shrink: 0;
    gap: 0;
  }

  .ia-connector-line {
    width: 22px;
    height: 1px;
    background: rgba(0, 0, 0, 0.12);
  }

  .ia-connector-arrow {
    font-size: 10px;
    color: rgba(0, 0, 0, 0.2);
    margin-top: -1px;
    margin-left: 10px;
    line-height: 1;
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
    padding: 48px 80px;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .section-eyebrow {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    color: rgba(0, 0, 0, 0.30);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .section-headline {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 400;
    color: #0A0A0A;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .section-body {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.60);
    line-height: 1.2;
    margin-bottom: 14px;
  }

  .section-body + .section-body {
    margin-top: 0;
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
    width: calc(100% + 160px);
    margin-left: -80px;
    margin-right: -80px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .section-image-block .image-fill {
    width: 100%;
    aspect-ratio: 21/9;
    border-radius: 0;
  }

  .image-caption {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.30);
    text-align: center;
    padding: 12px 80px 0;
    letter-spacing: 0.04em;
  }

  /* Subsections */
  .subsection {
    margin-top: 48px;
    padding-top: 40px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .subsection-title {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #0A0A0A;
    margin-bottom: 10px;
  }

  .subsection-body {
    font-family: 'Geist Sans', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.58);
    line-height: 1.2;
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
    border-top: 1px solid rgba(0, 0, 0, 0.06);
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
    .case-study-section { padding: 32px 24px; }
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
              className={`sidebar-nav-item${i === 0 ? ' active' : ''}${sec.type === 'ia' ? ' sidebar-nav-item--ia' : ''}`}
              data-section={sec.id}
              onClick={() => scrollToSection(sec.id)}
              title={sec.type === 'ia' ? 'Information Architecture' : undefined}
            >
              {sec.type === 'ia' ? 'IA' : sidebarLabel(sec.eyebrow)}
            </div>
          ))}

          <div className="sidebar-back-bottom" onClick={handleClose}>
            ← All Projects
          </div>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-back-bottom"
            style={{ display: 'block', marginTop: 8, borderTop: 'none', paddingTop: 0 }}
          >
            Resume ↗
          </a>
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
                  top:          '8%',
                  right:        '5%',
                  width:        '58%',
                  borderRadius: '10px 10px 0 0',
                  boxShadow:    '0 24px 80px rgba(0,0,0,0.15)',
                  objectFit:    'cover',
                  objectPosition: 'top',
                  pointerEvents: 'none',
                  maskImage:    'linear-gradient(to bottom, black 70%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                }}
              />
            )}
            <div className="hero-text">
              <p className="hero-project-label" style={project.hero?.light ? { color: 'rgba(0,0,0,0.50)' } : undefined}>{project.hero?.badge ?? project.org}</p>
              <h1 className="hero-project-name" style={project.hero?.light ? { color: '#1a1814', textShadow: 'none' } : undefined}>{project.title}</h1>
              <p className="hero-meta-line" style={project.hero?.light ? { color: 'rgba(0,0,0,0.50)' } : undefined}>
                {[meta.timeline, meta.role, meta.team].filter(Boolean).join(' · ')}
              </p>
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
                  style={{ padding: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                >
                  <IADiagram iaText={project.ia} />
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
                {sec.headline.toUpperCase() !== sec.eyebrow && (
                  <h2 className="section-headline">{sec.headline}</h2>
                )}

                {/* Body blocks: paragraphs + lists from episode content */}
                {sec.bodyBlocks && sec.bodyBlocks.length > 0
                  ? sec.bodyBlocks.map((block, i) =>
                      block.type === 'ul'
                        ? (
                          <ul key={i} className="section-list">
                            {block.items.map((item, j) => <li key={j}>{item}</li>)}
                          </ul>
                        )
                        : <p key={i} className="section-body">{block.text}</p>
                    )
                  : sec.body && <p className="section-body">{sec.body}</p>
                }

                {sec.callout && (
                  <div className="section-callout">
                    <p>{sec.callout}</p>
                  </div>
                )}

                {/* Image block — diagram component or gradient fallback */}
                <div className="section-image-block" style={sec.diagramKey ? { marginTop: 32 } : undefined}>
                  {sec.diagramKey && DIAGRAM_MAP[sec.diagramKey] ? (
                    <DiagramWrapper
                      component={DIAGRAM_MAP[sec.diagramKey].component}
                      diagramHeight={DIAGRAM_MAP[sec.diagramKey].height}
                    />
                  ) : (
                    <div
                      className="image-fill"
                      style={{ background: sec.imageGradient }}
                    />
                  )}
                  {sec.imageCaption && (
                    <p className="image-caption">{sec.imageCaption}</p>
                  )}
                </div>

                {/* Subsections */}
                {sec.subsections.map((sub, i) => (
                  <div key={i} className="subsection">
                    <h3 className="subsection-title">{sub.title}</h3>
                    <p className="subsection-body">{sub.body}</p>
                  </div>
                ))}
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
