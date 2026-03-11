/**
 * DSMobileLayout.jsx — Mobile Design System Browser
 * Bottom tab nav · Component grid · Full-screen detail · Token settings
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_TREE, ALL_COMPONENTS, PAGE_GROUP_MAP } from './dsNavData';
import { COMPONENT_DOCS } from './componentDocs';
import * as PC from './PreviewCanvas';

/* ── Design tokens for chrome ── */
const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif`;
const MONO = `'Geist Mono', 'SF Mono', ui-monospace, monospace`;
const T = {
  primary:   '#1a1814',
  secondary: 'rgba(0,0,0,0.62)',
  tertiary:  'rgba(0,0,0,0.46)',
  accent:    '#b85c26',
};
const TIER_C = {
  P1: { color: 'rgba(21,128,61,0.9)',  bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)'  },
  P2: { color: 'rgba(29,78,216,0.9)',  bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  P3: { color: 'rgba(0,0,0,0.45)',     bg: 'rgba(0,0,0,0.05)',     border: 'rgba(0,0,0,0.1)'      },
};

/* ── Component descriptions ── */
const META = {
  'Buttons':                   { category: 'Action',     desc: 'All button variants: Default, Hover, Active, Focus, Disabled, Loading.' },
  'Text Fields':               { category: 'Input',      desc: 'Input lifecycle: Default, Focused, Error, Disabled, Success.' },
  'Form Controls':             { category: 'Input',      desc: 'Checkboxes, radios, toggles, selects, textareas, file upload.' },
  'Tag Input':                 { category: 'Input',      desc: 'Multi-value chip input with removable tags.' },
  'Range Sliders':             { category: 'Input',      desc: 'Range controls with color-coded tracks.' },
  'Rating Components':         { category: 'Feedback',   desc: 'Star rating, thumbs, and numeric score patterns.' },
  'Navigation Patterns':       { category: 'Navigation', desc: 'Topbar, sidebar, breadcrumb, tabs, stepper, pagination.' },
  'Sidebar Application Shell': { category: 'Layout',     desc: 'Full app shell with persistent sidebar and header.' },
  'Data Filter Bar':           { category: 'Filtering',  desc: 'Search + dropdown facets + active filter chips.' },
  'Data Table':                { category: 'Data',       desc: 'Sortable table with selection, status chips, pagination.' },
  'Kanban Board':              { category: 'Data',       desc: 'Column-based task management with card stacks.' },
  'Bar Chart':                 { category: 'Data Viz',   desc: 'Bar groups with multi-role color mapping.' },
  'Stats Grid':                { category: 'Data Viz',   desc: 'Metric cards with KPI values and trend indicators.' },
  'Event Timeline':            { category: 'Timeline',   desc: 'Vertical timeline with per-event color encoding.' },
  'Cards':                     { category: 'Content',    desc: 'Feature, profile, and horizontal list card archetypes.' },
  'Pricing Cards':             { category: 'Marketing',  desc: 'Three-tier pricing with featured Pro tier.' },
  'Data Display':              { category: 'Feed',       desc: 'Stat cards, activity feed, and tag taxonomy.' },
  'Notification Panel':        { category: 'Notify',     desc: 'Notification list with unread/read states.' },
  'Comment Thread':            { category: 'Discussion', desc: 'Nested comment thread with avatar color roles.' },
  'Modals, Tooltips & Menus':  { category: 'Overlay',   desc: 'Dialog, tooltip, dropdown menu, command palette.' },
  'Alerts, Progress & States': { category: 'Feedback',  desc: 'Alerts, progress bars, spinners, toast, empty state.' },
  'Badges, Tags & Chips':      { category: 'Taxonomy',  desc: 'Badges, dot indicators, avatar sizes, outline tags.' },
  'Rich Text Editor':          { category: 'Editor',    desc: 'Toolbar and editable content area pattern.' },
  'Accordion':                 { category: 'Disclosure', desc: 'Progressive disclosure with animated chevron.' },
  'Date Picker':               { category: 'Input',     desc: 'Calendar-based date selector with month navigation.' },
  'Video Player':              { category: 'Media',     desc: 'Media player UI with playback controls and scrubber.' },
  'Motion System':             { category: 'Motion',    desc: 'Live animation demos for each motion token.' },
};

const FOUNDATION_PAGES = [
  { id: 'color-roles', label: 'Color Roles',      icon: '◎', desc: 'Palette-to-role semantic mapping' },
  { id: 'typography',  label: 'Typography',        icon: 'Aa', desc: 'Type scale, font stack, hierarchy' },
  { id: 'layout',      label: 'Layout & Spacing',  icon: '⊟', desc: 'Spacing steps and grid patterns' },
  { id: 'tokens',      label: 'Token Reference',   icon: '{}', desc: '6-layer token architecture' },
];

/* ── Preview renderer ── */
function renderPreview(pageId, { tokens, scopedVars, mode }) {
  const map = {
    'color-roles': () => <PC.ColorRolesSection />,
    'typography':  () => <PC.TypographyPreview tokens={tokens} />,
    'layout':      () => <PC.LayoutPreview tokens={tokens} />,
    'tokens':      () => <PC.TokensPreview tokens={tokens} mode={mode} />,
    'Buttons':                   () => <PC.ButtonMatrix matrixRef={null} />,
    'Text Fields':               () => <PC.InputStates />,
    'Form Controls':             () => <PC.FormControlsSection />,
    'Tag Input':                 () => <PC.TagInputSection />,
    'Range Sliders':             () => <PC.SliderSection />,
    'Rating Components':         () => <PC.RatingSection />,
    'Navigation Patterns':       () => <PC.NavigationSection />,
    'Sidebar Application Shell': () => <PC.SidebarLayoutSection />,
    'Data Filter Bar':           () => <PC.DataFilterSection />,
    'Data Table':                () => <PC.DataTableSection />,
    'Kanban Board':              () => <PC.KanbanSection />,
    'Bar Chart':                 () => <PC.ChartSection />,
    'Stats Grid':                () => <PC.StatsGridSection />,
    'Event Timeline':            () => <PC.TimelineSection />,
    'Cards':                     () => <PC.CardsSection />,
    'Pricing Cards':             () => <PC.PricingCardsSection />,
    'Data Display':              () => <PC.DataDisplaySection />,
    'Notification Panel':        () => <PC.NotificationPanelSection />,
    'Comment Thread':            () => <PC.CommentThreadSection />,
    'Modals, Tooltips & Menus':  () => <PC.OverlaysSection />,
    'Alerts, Progress & States': () => <PC.FeedbackSection />,
    'Badges, Tags & Chips':      () => <PC.BadgesSection />,
    'Rich Text Editor':          () => <PC.RichTextEditorSection />,
    'Accordion':                 () => <PC.AccordionSection />,
    'Date Picker':               () => <PC.DatePickerSection />,
    'Video Player':              () => <PC.VideoPlayerSection />,
    'Motion System':             () => <PC.MotionSection tokens={tokens} />,
  };
  return map[pageId]?.() ?? null;
}

/* ── Bottom nav icons ── */
const NAV_TABS = [
  { id: 'browse',     label: 'Browse',     icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
    </svg>
  )},
  { id: 'foundation', label: 'Foundation', icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L18 7v6l-8 5-8-5V7l8-5z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'audit',      label: 'Audit',      icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
    </svg>
  )},
  { id: 'settings',   label: 'Settings',   icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5}/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"/>
    </svg>
  )},
];

/* ═══════════════════════════════════════════════════
   COMPONENT DETAIL VIEW (full-screen slide-over)
═══════════════════════════════════════════════════ */
function ComponentDetail({ pageId, tokens, scopedVars, mode, onBack }) {
  const [tab, setTab] = useState('Preview');
  const doc = COMPONENT_DOCS?.[pageId];
  const meta = META[pageId] ?? {};
  const compItem = ALL_COMPONENTS.find(c => c.id === pageId);
  const tier = compItem?.tier;

  const content = renderPreview(pageId, { tokens, scopedVars, mode });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#fafaf9',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT,
      }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          border: 'none', background: 'none', cursor: 'pointer',
          color: T.accent, fontSize: 13.5, fontWeight: 600,
          padding: '6px 0', fontFamily: FONT,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: T.primary, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pageId}
          </span>
          {tier && TIER_C[tier] && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
              fontFamily: MONO, letterSpacing: '0.04em', flexShrink: 0,
              color: TIER_C[tier].color, background: TIER_C[tier].bg, border: `1px solid ${TIER_C[tier].border}`,
            }}>{tier}</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: '#fff', flexShrink: 0,
      }}>
        {['Preview', 'Usage', 'A11y'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '11px 0',
            border: 'none', borderBottom: `2px solid ${tab === t ? T.primary : 'transparent'}`,
            background: 'transparent',
            color: tab === t ? T.primary : T.tertiary,
            fontSize: 13, fontWeight: tab === t ? 600 : 400,
            cursor: 'pointer', fontFamily: FONT,
            letterSpacing: '-0.01em', marginBottom: -1,
            transition: 'color 0.12s, border-color 0.12s',
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}>

            {tab === 'Preview' && (
              <div style={{ padding: '20px 16px 40px' }}>
                {/* Description */}
                <p style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.65, margin: '0 0 20px', fontFamily: FONT }}>
                  {doc?.description ?? meta.desc}
                </p>
                {/* Token strip */}
                <div className="ds-preview" style={{ ...scopedVars, marginBottom: 20 }}>
                  <PC.ContextualTokenStrip componentKey={pageId} scopedVars={scopedVars} />
                </div>
                {/* Preview canvas */}
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)`,
                    backgroundSize: '18px 18px', backgroundPosition: '9px 9px',
                  }} />
                  <div className="ds-preview" style={{
                    ...scopedVars,
                    position: 'relative', zIndex: 1,
                    background: mode === 'dark' ? '#0f0e0d' : '#ffffff',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
                    borderRadius: 12,
                    padding: '24px 16px',
                    boxShadow: mode === 'dark'
                      ? '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)'
                      : '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                  }}>
                    {content}
                  </div>
                </div>
              </div>
            )}

            {tab === 'Usage' && (
              <div style={{ padding: '24px 16px 48px' }}>
                {doc ? (
                  <>
                    {doc.useWhen && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Use When</div>
                        {doc.useWhen.map((w, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                            <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.6, fontFamily: FONT }}>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.avoid && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Avoid</div>
                        {doc.avoid.map((a, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                            <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✕</span>
                            <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.6, fontFamily: FONT }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <DocStub />
                )}
              </div>
            )}

            {tab === 'A11y' && (
              <div style={{ padding: '24px 16px 48px' }}>
                {doc?.a11y ? (
                  <>
                    {doc.a11y.keyboard && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Keyboard</div>
                        {doc.a11y.keyboard.map((k, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                            <code style={{ fontSize: 11, fontFamily: MONO, background: '#f4f3f2', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap', color: T.primary, flexShrink: 0 }}>{k.key}</code>
                            <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.6, fontFamily: FONT }}>{k.action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.a11y.aria && (
                      <div>
                        <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>ARIA</div>
                        {doc.a11y.aria.map((a, i) => (
                          <div key={i} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: '#f7f6f5', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <code style={{ fontSize: 11, fontFamily: MONO, color: T.accent }}>{a.attr}</code>
                            <p style={{ fontSize: 13, color: T.secondary, margin: '4px 0 0', fontFamily: FONT, lineHeight: 1.55 }}>{a.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <DocStub />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DocStub() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: T.tertiary }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>⋯</div>
      <div style={{ fontSize: 14, fontFamily: FONT, lineHeight: 1.6 }}>Documentation in progress</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FOUNDATION DETAIL
═══════════════════════════════════════════════════ */
function FoundationDetail({ pageId, tokens, scopedVars, mode, onTokenChange, onBack }) {
  const page = FOUNDATION_PAGES.find(p => p.id === pageId);
  const content = renderPreview(pageId, { tokens, scopedVars, mode });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#fafaf9',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT,
      }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          border: 'none', background: 'none', cursor: 'pointer',
          color: T.accent, fontSize: 13.5, fontWeight: 600,
          padding: '6px 0', fontFamily: FONT,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Foundation
        </button>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: T.primary, letterSpacing: '-0.02em' }}>
          {page?.label}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 48px' }}>
        {pageId === 'tokens' || pageId === 'wcag' ? (
          <div style={{ ...scopedVars }}>
            {pageId === 'tokens' && <PC.TokensPreview tokens={tokens} mode={mode} />}
            {pageId === 'wcag'   && <PC.AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />}
          </div>
        ) : (
          <div className="ds-preview" style={{
            ...scopedVars,
            background: mode === 'dark' ? '#0f0e0d' : '#ffffff',
            borderRadius: 12,
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
            padding: '20px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   SETTINGS TAB
═══════════════════════════════════════════════════ */
function SettingsTab({ tokens, onTokenChange, mode, onModeToggle, onRegenerate, onShowExport }) {
  const colors = tokens.colors ?? [];

  return (
    <div style={{ padding: '20px 16px 80px', fontFamily: FONT }}>

      {/* Mode toggle */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Appearance</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {['light', 'dark'].map(m => (
            <button key={m} onClick={() => m !== mode && onModeToggle()}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                border: `1.5px solid ${mode === m ? '#1a1814' : 'rgba(0,0,0,0.1)'}`,
                background: mode === m ? '#1a1814' : '#fff',
                color: mode === m ? '#fff' : T.secondary,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT, letterSpacing: '-0.01em',
                transition: 'all 0.15s',
              }}>
              {m === 'light' ? '○ Light' : '● Dark'}
            </button>
          ))}
        </div>
      </div>

      {/* Color palette */}
      {colors.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Color Palette</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colors.slice(0, 6).map((hex, i) => (
              <label key={i} title={`Swatch ${i + 1}`} style={{ position: 'relative', cursor: 'pointer' }}>
                <input type="color" value={hex}
                  onChange={e => {
                    const next = [...colors];
                    next[i] = e.target.value;
                    onTokenChange(prev => ({ ...prev, colors: next }));
                  }}
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: hex,
                  border: '2px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  transition: 'transform 0.1s',
                }} />
                <div style={{ fontSize: 9, textAlign: 'center', color: T.tertiary, fontFamily: MONO, marginTop: 4 }}>
                  {i + 1}
                </div>
              </label>
            ))}
          </div>
          <p style={{ fontSize: 12, color: T.tertiary, marginTop: 10, fontFamily: FONT, lineHeight: 1.55 }}>
            Tap a swatch to change the color. All component previews update in real time.
          </p>
        </div>
      )}

      {/* Typography */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Display Font</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Inter', 'Playfair Display', 'DM Sans', 'Space Grotesk', 'Sora'].map(f => {
            const active = tokens.typography?.displayFont === f;
            return (
              <button key={f} onClick={() => onTokenChange(p => ({ ...p, typography: { ...p.typography, displayFont: f } }))}
                style={{
                  padding: '11px 14px', borderRadius: 10, textAlign: 'left',
                  border: `1.5px solid ${active ? '#1a1814' : 'rgba(0,0,0,0.1)'}`,
                  background: active ? '#1a1814' : '#fff',
                  color: active ? '#fff' : T.secondary,
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  fontFamily: FONT, cursor: 'pointer',
                  transition: 'all 0.12s', letterSpacing: '-0.01em',
                }}>
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Border radius */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Border Radius</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'None', value: 0 },
            { label: 'Sm', value: 4 },
            { label: 'Md', value: 8 },
            { label: 'Lg', value: 16 },
            { label: 'Full', value: 999 },
          ].map(({ label, value }) => {
            const active = tokens.radius?.base === value;
            return (
              <button key={label} onClick={() => onTokenChange(p => ({ ...p, radius: { ...p.radius, base: value } }))}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8,
                  border: `1.5px solid ${active ? '#1a1814' : 'rgba(0,0,0,0.1)'}`,
                  background: active ? '#1a1814' : '#fff',
                  color: active ? '#fff' : T.secondary,
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', fontFamily: FONT,
                  transition: 'all 0.12s',
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onRegenerate} style={{
          padding: '13px', borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.1)',
          background: '#fff', color: T.primary,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: FONT, letterSpacing: '-0.01em',
          transition: 'background 0.12s',
        }}>
          Regenerate Tokens
        </button>
        <button onClick={onShowExport} style={{
          padding: '13px', borderRadius: 12, border: 'none',
          background: '#1a1814', color: '#fff',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: FONT, letterSpacing: '-0.01em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          Export Design System
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontFamily: MONO, color: T.tertiary,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      fontWeight: 700, marginBottom: 10,
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════════════
   BROWSE TAB — Component grid
═══════════════════════════════════════════════════ */
function BrowseTab({ onSelect }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const filteredGroups = NAV_TREE
    .filter(g => g.id !== 'foundation')
    .map(g => ({
      ...g,
      items: g.items.filter(i => !query || (i.label ?? i.id).toLowerCase().includes(query)),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div style={{ padding: '16px 16px 0', fontFamily: FONT }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search components…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 36px',
            borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
            background: '#fff', color: T.primary,
            fontSize: 14, fontFamily: FONT, outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            letterSpacing: '-0.01em',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            border: 'none', background: 'none', cursor: 'pointer',
            color: 'rgba(0,0,0,0.35)', fontSize: 16, padding: 0, lineHeight: 1,
          }}>×</button>
        )}
      </div>

      {/* Component groups */}
      {filteredGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: T.tertiary, fontSize: 14 }}>
          No results for "{search}"
        </div>
      ) : filteredGroups.map(group => (
        <div key={group.id} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, fontFamily: MONO, color: T.tertiary, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            {group.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {group.items.map(item => {
              const meta = META[item.id] ?? {};
              const tc = TIER_C[item.tier] ?? TIER_C.P3;
              return (
                <button key={item.id} onClick={() => onSelect(item.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '14px 14px 12px',
                    borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff', cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.12s, box-shadow 0.12s',
                    gap: 6,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: 9.5, color: T.accent, fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                      {meta.category}
                    </span>
                    {item.tier && (
                      <span style={{
                        fontSize: 8.5, fontFamily: MONO, fontWeight: 700,
                        padding: '1px 5px', borderRadius: 3,
                        color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`,
                        letterSpacing: '0.04em',
                      }}>{item.tier}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.primary, letterSpacing: '-0.015em', lineHeight: 1.3, fontFamily: FONT }}>
                    {item.label ?? item.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FOUNDATION TAB
═══════════════════════════════════════════════════ */
function FoundationTab({ auditErrorCount, onSelect }) {
  return (
    <div style={{ padding: '20px 16px', fontFamily: FONT }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FOUNDATION_PAGES.map(page => (
          <button key={page.id} onClick={() => onSelect(page.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fff', cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.12s',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f4f3f2', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.primary, flexShrink: 0 }}>
              {page.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: T.primary, letterSpacing: '-0.015em', marginBottom: 3, fontFamily: FONT }}>{page.label}</div>
              <div style={{ fontSize: 12.5, color: T.secondary, fontFamily: FONT, lineHeight: 1.45 }}>{page.desc}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}

        {/* WCAG Audit */}
        <button onClick={() => onSelect('wcag')} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 12,
          border: `1px solid ${auditErrorCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.08)'}`,
          background: auditErrorCount > 0 ? 'rgba(239,68,68,0.03)' : '#fff',
          cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'border-color 0.12s',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: auditErrorCount > 0 ? 'rgba(239,68,68,0.08)' : '#f4f3f2', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: auditErrorCount > 0 ? '#ef4444' : T.primary, flexShrink: 0 }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: T.primary, letterSpacing: '-0.015em', fontFamily: FONT }}>WCAG Audit</span>
              {auditErrorCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '1px 6px', fontFamily: MONO }}>
                  {auditErrorCount} {auditErrorCount === 1 ? 'issue' : 'issues'}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: T.secondary, fontFamily: FONT, lineHeight: 1.45 }}>14 automated accessibility checks</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT MOBILE LAYOUT
═══════════════════════════════════════════════════ */
export default function DSMobileLayout({
  tokens, scopedVars, mode, auditErrorCount,
  onTokenChange, onModeToggle, onRegenerate, onShowExport,
}) {
  const [activeTab, setActiveTab]         = useState('browse');
  const [detailPage, setDetailPage]       = useState(null);  // component or foundation page id
  const [detailType, setDetailType]       = useState(null);  // 'component' | 'foundation'

  function openComponent(id) { setDetailPage(id); setDetailType('component'); }
  function openFoundation(id) { setDetailPage(id); setDetailType('foundation'); }
  function closeDetail()     { setDetailPage(null); setDetailType(null); }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#f7f6f5',
      fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, flexShrink: 0,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #1a1814 0%, #3d3a35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, letterSpacing: '-0.02em', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tokens.systemName || 'Design System'}
          </span>
        </div>
        <button onClick={onShowExport} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, border: 'none',
          background: '#1a1814', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: FONT, letterSpacing: '-0.01em',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v6M2 5.5l3 3 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>
      </div>

      {/* ── Main scroll area ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ minHeight: '100%' }}>

            {activeTab === 'browse' && (
              <BrowseTab onSelect={openComponent} />
            )}
            {activeTab === 'foundation' && (
              <FoundationTab auditErrorCount={auditErrorCount} onSelect={openFoundation} />
            )}
            {activeTab === 'audit' && (
              <div style={{ padding: '20px 16px 80px', ...scopedVars }}>
                <PC.AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />
              </div>
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                tokens={tokens}
                onTokenChange={onTokenChange}
                mode={mode}
                onModeToggle={onModeToggle}
                onRegenerate={onRegenerate}
                onShowExport={onShowExport}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Detail slide-over */}
        <AnimatePresence>
          {detailPage && detailType === 'component' && (
            <ComponentDetail
              key={detailPage}
              pageId={detailPage}
              tokens={tokens}
              scopedVars={scopedVars}
              mode={mode}
              onBack={closeDetail}
            />
          )}
          {detailPage && detailType === 'foundation' && (
            <FoundationDetail
              key={detailPage}
              pageId={detailPage}
              tokens={tokens}
              scopedVars={scopedVars}
              mode={mode}
              onTokenChange={onTokenChange}
              onBack={closeDetail}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom tab bar ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        height: 64, flexShrink: 0,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const showDot  = tab.id === 'audit' && auditErrorCount > 0 && !isActive;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); closeDetail(); }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: isActive ? T.primary : 'rgba(0,0,0,0.36)',
                transition: 'color 0.12s',
                position: 'relative',
              }}>
              {showDot && (
                <span style={{ position: 'absolute', top: 8, right: 'calc(50% - 12px)', width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
              )}
              <motion.span
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}>
                {tab.icon(isActive)}
              </motion.span>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 600 : 400, letterSpacing: '-0.01em', fontFamily: FONT }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
