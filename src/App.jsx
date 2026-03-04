/**
 * App.jsx
 * Main application shell for the Abhay OS portfolio.
 * Sets up React Router, manages overlay state, and composes
 * all top-level layers: wallpaper, cursor, menubar, desktop, dock, overlay.
 */

import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import CustomCursor from './components/CustomCursor.jsx';
import CornerButtons from './components/CornerButtons.jsx';
import DockHints from './components/DockHints.jsx';
import Desktop from './components/Desktop.jsx';
import Dock from './components/Dock.jsx';
import MobileNav from './components/MobileNav.jsx';
import IntroSequence from './components/IntroSequence.jsx';
import ProjectHeroPreview from './components/ProjectHeroPreview.jsx';

// Lazy-loaded for performance
const ProjectOverlay    = lazy(() => import('./components/ProjectOverlay.jsx'));
const PlaygroundOverlay = lazy(() => import('./components/PlaygroundOverlay.jsx'));
const MeatInspectorPage = lazy(() => import('./pages/MeatInspector.jsx'));
const HealthcarePage    = lazy(() => import('./pages/Healthcare.jsx'));
const TrailARPage       = lazy(() => import('./pages/TrailAR.jsx'));
const MealPlannerPage   = lazy(() => import('./pages/MealPlanner.jsx'));

/* ─── Placeholder route page (for non-full projects) ─── */
function PlaceholderPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-4)',
      fontFamily: 'var(--sans)',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Case study coming soon.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent)',
          color: 'var(--on-accent)',
          fontFamily: 'var(--sans)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        ← Back to Portfolio
      </button>
    </div>
  );
}

/* ─── Desktop OS View ─── */
function DesktopView() {
  const [activeProject, setActiveProject] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const overlayCloseRef = useRef(null);

  const handleProjectClick = useCallback((id, rect) => {
    setOriginRect(rect ?? null);
    setActiveProject(id);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setActiveProject(null);
    setOriginRect(null);
  }, []);

  const handleNextProject = useCallback((id) => {
    setOriginRect(null);
    setActiveProject(id);
  }, []);

  // Suppress custom cursor when overlay is open
  useEffect(() => {
    document.body.classList.toggle('overlay-open', !!activeProject);
  }, [activeProject]);

  const handleLogoClick = useCallback(() => {
    if (overlayCloseRef.current) {
      overlayCloseRef.current();
    }
  }, []);

  /* ── Browser back button support ── */
  // Push a history entry whenever an overlay opens
  useEffect(() => {
    if (activeProject) window.history.pushState({ overlay: activeProject }, '');
  }, [activeProject]);

  useEffect(() => {
    if (playgroundOpen) window.history.pushState({ playground: true }, '');
  }, [playgroundOpen]);

  // On browser back, close whichever overlay is open
  useEffect(() => {
    const handler = () => {
      if (activeProject)   { setActiveProject(null); setOriginRect(null); }
      else if (playgroundOpen) { setPlaygroundOpen(false); }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [activeProject, playgroundOpen]);

  return (
    <>
      <IntroSequence />

      <div id="desktop-content">
        {/* Cursor + CornerButtons + DockHints live OUTSIDE portfolio-world so blur never affects them. */}
        <CustomCursor />
        {/* Corner buttons visible on desktop only */}
        <div className="corner-buttons-desktop">
          <CornerButtons onLogoClick={handleLogoClick} />
        </div>
        <DockHints hidden={!!activeProject} />

        {/* Project hero preview — sits at z-5, below all UI layers */}
        <ProjectHeroPreview
          project={hoveredProject}
          visible={!!hoveredProject && !activeProject}
        />

        {/* portfolio-world is blurred when an overlay is open */}
        <div className="portfolio-world">
          {/* Desktop hero fades out while a project preview is shown */}
          <div className={hoveredProject && !activeProject ? 'desktop-preview-active' : 'desktop-preview-idle'}>
            <Desktop />
          </div>
          <Dock
            onProjectClick={handleProjectClick}
            onProjectHover={setHoveredProject}
            activeProjectId={activeProject}
            onPlaygroundClick={() => setPlaygroundOpen(true)}
          />
          <MobileNav
            onProjectClick={handleProjectClick}
            onPlaygroundClick={() => setPlaygroundOpen(true)}
          />
        </div>

        <Suspense fallback={null}>
          {activeProject && (
            <ProjectOverlay
              key={activeProject}
              projectId={activeProject}
              originRect={originRect}
              onClose={handleCloseOverlay}
              onNext={handleNextProject}
              closeRef={overlayCloseRef}
            />
          )}
          <AnimatePresence>
            {playgroundOpen && (
              <PlaygroundOverlay onClose={() => setPlaygroundOpen(false)} />
            )}
          </AnimatePresence>
        </Suspense>
      </div>
    </>
  );
}

/* ─── Root App with Router ─── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesktopView />} />
        <Route
          path="/meatinspector"
          element={
            <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
              <MeatInspectorPage />
            </Suspense>
          }
        />
        <Route
          path="/healthcare"
          element={
            <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
              <HealthcarePage />
            </Suspense>
          }
        />
        <Route
          path="/mealplanner"
          element={
            <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
              <MealPlannerPage />
            </Suspense>
          }
        />
        <Route
          path="/trailar"
          element={
            <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
              <TrailARPage />
            </Suspense>
          }
        />
        <Route path="/aurora" element={<PlaceholderPage />} />
        <Route path="/vosyn" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
