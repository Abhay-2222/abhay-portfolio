/**
 * App.jsx
 * Main application shell for the Abhay OS portfolio.
 * Overlay state is URL-driven (useSearchParams) so the browser's
 * native back button works correctly on all devices without any
 * custom popstate listeners.
 *
 *   Landing page:        /
 *   Project overlay:     /?p=<projectId>
 *   Playground overlay:  /?pg=1
 */

import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

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
const AboutPage         = lazy(() => import('./pages/About.jsx'));

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
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  // Overlay state is fully URL-driven — browser back/forward just works.
  const activeProject  = searchParams.get('p')  ?? null;
  const playgroundOpen = searchParams.get('pg') === '1';

  const [originRect,       setOriginRect]       = useState(null);
  const [hoveredProject,   setHoveredProject]   = useState(null);
  const [gameMode,         setGameMode]         = useState(false);
  const [gameCursorColor,  setGameCursorColor]  = useState(null);
  const overlayCloseRef = useRef(null);

  /* ── Open project overlay ── */
  const handleProjectClick = useCallback((id, rect) => {
    setOriginRect(rect ?? null);
    navigate(`?p=${id}`);
  }, [navigate]);

  /* ── Close project overlay → back to landing ── */
  const handleCloseOverlay = useCallback(() => {
    setOriginRect(null);
    navigate(-1);
  }, [navigate]);

  /* ── Next project (replace so back skips intermediate) ── */
  const handleNextProject = useCallback((id) => {
    setOriginRect(null);
    navigate(`?p=${id}`, { replace: true });
  }, [navigate]);

  /* ── Open / close playground ── */
  const openPlayground  = useCallback(() => navigate('?pg=1'),  [navigate]);
  const closePlayground = useCallback(() => navigate(-1),       [navigate]);

  /* ── Suppress custom cursor when overlay is open ── */
  useEffect(() => {
    document.body.classList.toggle('overlay-open', !!activeProject);
  }, [activeProject]);

  /* ── When overlay closes via browser back, GSAP never runs its cleanup —
        so we force-clear the blur/scale that was applied on open ── */
  useEffect(() => {
    if (!activeProject) {
      gsap.killTweensOf('.portfolio-world');
      gsap.set('.portfolio-world', { clearProps: 'filter,transform' });
    }
  }, [activeProject]);

  /* ── Logo click closes whichever overlay is open ── */
  const handleLogoClick = useCallback(() => {
    if (overlayCloseRef.current) overlayCloseRef.current();
  }, []);

  return (
    <>
      <IntroSequence />

      <div id="desktop-content">
        {/* Cursor + CornerButtons + DockHints live OUTSIDE portfolio-world so blur never affects them */}
        <CustomCursor color={gameCursorColor} />
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
          <div className={hoveredProject && !activeProject ? 'desktop-preview-active' : 'desktop-preview-idle'}>
            <Desktop
              gameMode={gameMode}
              onGameModeChange={setGameMode}
              onNextColor={setGameCursorColor}
            />
          </div>
          <Dock
            onProjectClick={handleProjectClick}
            onProjectHover={setHoveredProject}
            activeProjectId={activeProject}
            onPlaygroundClick={openPlayground}
            hidden={gameMode}
          />
          <MobileNav
            onProjectClick={handleProjectClick}
            onPlaygroundClick={openPlayground}
            hidden={gameMode}
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
              <PlaygroundOverlay onClose={closePlayground} />
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
        <Route
          path="/about"
          element={
            <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
              <AboutPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
