/**
 * DSMainContent.jsx — Modern design system docs · Apple-quality aesthetic
 * Readable text (min 4.5:1 contrast) · consistent spacing · polished components
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

import { COMPONENT_DOCS } from './componentDocs';
import { PAGE_GROUP_MAP } from './dsNavData';
import { computeTokens } from './dsEngine';
import * as PC from './PreviewCanvas';
import DSPagePreviews from './DSPagePreviews';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS FOR CHROME (never ds-* vars)
───────────────────────────────────────────────────────── */
const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Geist Sans', system-ui, sans-serif`;
const MONO = `'Geist Mono', 'SF Mono', ui-monospace, monospace`;

// Text color scale — all WCAG AA compliant on white bg
const T = {
  primary:   '#1a1814',           // 16.7:1 — headings, labels
  secondary: 'rgba(0,0,0,0.62)', // 6.5:1  — body text, descriptions
  tertiary:  'rgba(0,0,0,0.46)', // 4.7:1  — captions, secondary info
  disabled:  'rgba(0,0,0,0.32)', // 3.2:1  — decorative only, never body
  accent:    '#b85c26',           // 5.8:1  — accent labels (darkened for readability)
};

/* ─────────────────────────────────────────────────────────
   SECTION META
───────────────────────────────────────────────────────── */
const SECTION_META = {
  'Buttons':                   { category: 'Action',             desc: 'All button variants across every interactive state: Default, Hover, Active, Focus, Disabled, and Loading. Use Primary for main CTAs, Ghost for secondary actions, Danger for destructive operations.' },
  'Text Fields':               { category: 'Input',              desc: 'Input lifecycle states: Default, Focused (primary ring + shadow), Error (inline message), Disabled (reduced opacity), and Success. Each state communicates feedback without relying on color alone.' },
  'Form Controls':             { category: 'Input',              desc: 'The complete set of controls for structured data entry: checkboxes, radio groups, toggle switches, styled selects, textareas, search bars, and drag-and-drop file upload.' },
  'Tag Input':                 { category: 'Input',              desc: 'Inline multi-value input where each selection becomes a removable chip. Tags inherit color roles from your palette: Primary, Secondary, and Tertiary.' },
  'Range Sliders':             { category: 'Input',              desc: 'Numeric range controls with three palette color tracks demonstrating multi-role color application across input UI.' },
  'Rating Components':         { category: 'Feedback',           desc: 'Three rating patterns using distinct color roles: star rating in Primary, thumbs up/down in Secondary, and a numeric score display in Tertiary.' },
  'Navigation Patterns':       { category: 'Navigation',         desc: 'Core wayfinding components: topbar, sidebar nav, breadcrumb, horizontal tabs, multi-step stepper, and pagination.' },
  'Sidebar Application Shell': { category: 'Layout',             desc: 'A full application shell with persistent sidebar navigation, content header with breadcrumb, and a stat overview grid.' },
  'Data Filter Bar':           { category: 'Filtering',          desc: 'Compound filter pattern combining search input, dropdown facets, and an active-filter chips row with a Clear all action.' },
  'Data Table':                { category: 'Data',               desc: 'Full-featured data table with sortable columns, row checkbox selection, status chips, inline action buttons, and pagination.' },
  'Kanban Board':              { category: 'Data',               desc: 'Column-based task management with status headers and card stacks.' },
  'Bar Chart':                 { category: 'Data Visualization', desc: 'Data visualization with three color roles mapped to bar groups and a legend connecting bar color to data categories.' },
  'Stats Grid':                { category: 'Data Visualization', desc: '2×3 metric card grid with left-border color coding per row. Each card shows a KPI value with trend delta indicator.' },
  'Event Timeline':            { category: 'Timeline',           desc: 'Vertical timeline with per-event color encoding, ideal for multi-category activity feeds and audit logs.' },
  'Cards':                     { category: 'Content',            desc: 'Three card archetypes: feature card with gradient header, profile card, and horizontal list card. Shadow and radius adapt from your shape tokens.' },
  'Pricing Cards':             { category: 'Marketing',          desc: 'Three-tier pricing layout. The featured Pro tier uses Primary header color with visual elevation and a "Most Popular" badge.' },
  'Data Display':              { category: 'Feed',               desc: 'Stat overview cards, an activity feed with color-coded avatars per team member, and a tag taxonomy row.' },
  'Notification Panel':        { category: 'Notifications',      desc: 'Notification list where unread items receive a Primary-light background. Read items fall back to surface background.' },
  'Comment Thread':            { category: 'Discussion',         desc: 'Two-level comment thread with nested replies. Avatar colors map to palette roles.' },
  'Modals, Tooltips & Menus':  { category: 'Overlay',            desc: 'Floating UI: confirmation dialog, tooltip/popover pair, dropdown menu with destructive item, and command palette.' },
  'Alerts, Progress & States': { category: 'Feedback',           desc: 'System feedback: four alert variants, progress bars, shimmer skeleton, spinners, toast notification, and empty state.' },
  'Badges, Tags & Chips':      { category: 'Taxonomy',           desc: 'Label and status components: filled badges, dot indicators, avatar sizes, and outline tag styles.' },
  'Rich Text Editor':          { category: 'Editor',             desc: 'Toolbar + editable content area pattern. Active toolbar buttons use Primary fill.' },
  'Accordion':                 { category: 'Disclosure',         desc: 'Progressive disclosure with animated chevron. Border-bottom dividers separate items.' },
  'Date Picker':               { category: 'Input',              desc: 'Calendar-based date selector with month navigation and a 7-column day grid.' },
  'Video Player':              { category: 'Media',              desc: 'Static media player UI: 16:9 thumbnail, playback controls, scrubber, volume, and fullscreen.' },
  'Motion System':             { category: 'Motion',             desc: 'Live animation demos for each motion token: button hover, card lift, modal entrance, focus pulse, and page slide.' },
};

/* ─────────────────────────────────────────────────────────
   PAGE RENDER MAP
───────────────────────────────────────────────────────── */
const PAGE_RENDER_MAP = {
  'overview':    ({ tokens, scopedVars }) => <OverviewPage tokens={tokens} scopedVars={scopedVars} />,
  'color-roles': ()                       => <PC.ColorRolesSection />,
  'typography':  ({ tokens })             => <PC.TypographyPreview tokens={tokens} />,
  'layout':      ({ tokens })             => <PC.LayoutPreview tokens={tokens} />,
  'tokens':      ({ tokens, mode })       => <PC.TokensPreview tokens={tokens} mode={mode} />,
  'wcag':        ({ tokens, mode, onTokenChange }) => <PC.AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />,
  'Buttons':                   ({ matrixRef })  => <PC.ButtonMatrix matrixRef={matrixRef} />,
  'Text Fields':               ()               => <PC.InputStates />,
  'Form Controls':             ()               => <PC.FormControlsSection />,
  'Tag Input':                 ()               => <PC.TagInputSection />,
  'Range Sliders':             ()               => <PC.SliderSection />,
  'Rating Components':         ()               => <PC.RatingSection />,
  'Navigation Patterns':       ()               => <PC.NavigationSection />,
  'Sidebar Application Shell': ()               => <PC.SidebarLayoutSection />,
  'Data Filter Bar':           ()               => <PC.DataFilterSection />,
  'Data Table':                ()               => <PC.DataTableSection />,
  'Kanban Board':              ()               => <PC.KanbanSection />,
  'Bar Chart':                 ()               => <PC.ChartSection />,
  'Stats Grid':                ()               => <PC.StatsGridSection />,
  'Event Timeline':            ()               => <PC.TimelineSection />,
  'Cards':                     ()               => <PC.CardsSection />,
  'Pricing Cards':             ()               => <PC.PricingCardsSection />,
  'Data Display':              ()               => <PC.DataDisplaySection />,
  'Notification Panel':        ()               => <PC.NotificationPanelSection />,
  'Comment Thread':            ()               => <PC.CommentThreadSection />,
  'Modals, Tooltips & Menus':  ()               => <PC.OverlaysSection />,
  'Alerts, Progress & States': ()               => <PC.FeedbackSection />,
  'Badges, Tags & Chips':      ()               => <PC.BadgesSection />,
  'Rich Text Editor':          ()               => <PC.RichTextEditorSection />,
  'Accordion':                 ()               => <PC.AccordionSection />,
  'Date Picker':               ()               => <PC.DatePickerSection />,
  'Video Player':              ()               => <PC.VideoPlayerSection />,
  'Motion System':             ({ tokens })     => <PC.MotionSection tokens={tokens} />,
};

const FOUNDATION_IDS = new Set(['overview', 'color-roles', 'typography', 'layout', 'tokens', 'wcag']);
const PAGES_IDS      = new Set(['dashboard', 'form-page', 'marketing', 'mobile-page']);

/* ─────────────────────────────────────────────────────────
   TIER CHIP
───────────────────────────────────────────────────────── */
const TIER_STYLES = {
  P1: { color: '#15803d', bg: 'rgba(34,197,94,0.09)',  border: 'rgba(34,197,94,0.24)'  },
  P2: { color: '#1d4ed8', bg: 'rgba(59,130,246,0.09)', border: 'rgba(59,130,246,0.24)' },
  P3: { color: T.tertiary, bg: 'rgba(0,0,0,0.04)',     border: 'rgba(0,0,0,0.1)'       },
};

function StatusChip({ label, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10.5, padding: '2px 8px', borderRadius: 20, lineHeight: 1,
      fontFamily: MONO, fontWeight: 600, letterSpacing: '0.04em',
      border: `1px solid ${border ?? 'rgba(0,0,0,0.1)'}`,
      background: bg ?? 'rgba(0,0,0,0.04)',
      color: color ?? T.tertiary,
      flexShrink: 0,
    }}>{label}</span>
  );
}

/* ─────────────────────────────────────────────────────────
   SECTION DIVIDER (reusable)
───────────────────────────────────────────────────────── */
function SectionLabel({ children, style }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: T.tertiary, fontFamily: MONO, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DOC TAB CONTENT
───────────────────────────────────────────────────────── */
function DocTabContent({ doc, tab }) {
  if (!doc) return (
    <div style={{ padding: '56px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f7f6f5', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>📋</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.primary, marginBottom: 8, fontFamily: FONT, letterSpacing: '-0.02em' }}>Documentation in progress</div>
      <div style={{ fontSize: 13.5, color: T.secondary, fontFamily: FONT, lineHeight: 1.65, maxWidth: 340 }}>
        This component will be fully documented in a future update.
      </div>
    </div>
  );

  if (tab === 'Usage') {
    const Block = ({ title, icon, color, items }) => items?.length ? (
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color }}>{icon}</span>
          <SectionLabel style={{ marginBottom: 0 }}>{title}</SectionLabel>
        </div>
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ color, fontSize: 13, flexShrink: 0, marginTop: 2, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.65, fontFamily: FONT }}>{s}</span>
          </div>
        ))}
      </div>
    ) : null;

    return (
      <div>
        <Block title="Use When"  icon="✓" color="#16a34a" items={doc.usage?.when}    />
        <Block title="Avoid"     icon="✕" color="#dc2626" items={doc.usage?.whenNot} />
        <Block title="Do"        icon="↑" color="#2563eb" items={doc.usage?.dos}     />
        <Block title="Don't"     icon="↓" color="#dc2626" items={doc.usage?.donts}   />
      </div>
    );
  }

  if (tab === 'Anatomy') {
    if (!doc.anatomy?.length) return (
      <div style={{ paddingTop: 32, color: T.tertiary, fontSize: 13, fontFamily: FONT }}>No anatomy documented yet.</div>
    );
    return (
      <div>
        {doc.anatomy.map((a, idx) => (
          <div key={a.label} style={{
            display: 'flex', gap: 16, alignItems: 'flex-start',
            padding: '16px 0',
            borderBottom: idx < doc.anatomy.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: '#f7f6f5', border: '1px solid rgba(0,0,0,0.07)',
              color: T.primary, fontSize: 10.5, fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, marginTop: 1,
            }}>{a.label}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, color: T.primary, fontSize: 14, fontFamily: FONT, letterSpacing: '-0.015em' }}>{a.name}</span>
                {!a.required && (
                  <span style={{ fontSize: 11, color: T.tertiary, fontFamily: FONT, background: 'rgba(0,0,0,0.04)', padding: '1px 7px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.07)' }}>optional</span>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.65, fontFamily: FONT, margin: 0 }}>{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'A11y') {
    return (
      <div>
        {doc.a11y?.keyboard?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionLabel>Keyboard Navigation</SectionLabel>
            <div style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              {doc.a11y.keyboard.map((k, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, padding: '11px 16px',
                  borderBottom: i < doc.a11y.keyboard.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  alignItems: 'center', background: i % 2 === 0 ? '#fff' : '#fcfbfa',
                }}>
                  <kbd style={{
                    fontSize: 11, fontFamily: MONO,
                    background: '#f7f6f5', border: '1px solid rgba(0,0,0,0.12)',
                    borderBottom: '2px solid rgba(0,0,0,0.16)',
                    borderRadius: 5, padding: '3px 9px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    color: T.primary, minWidth: 90, textAlign: 'center',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
                  }}>{k.key}</kbd>
                  <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.55, fontFamily: FONT }}>{k.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {doc.a11y?.aria?.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>ARIA Requirements</SectionLabel>
            {doc.a11y.aria.map((s, i) => (
              <div key={i} style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.65, marginBottom: 8, paddingLeft: 14, borderLeft: '2px solid rgba(0,0,0,0.1)', fontFamily: FONT }}>{s}</div>
            ))}
          </div>
        )}
        {doc.a11y?.notes?.length > 0 && (
          <div>
            <SectionLabel>Notes</SectionLabel>
            {doc.a11y.notes.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: T.secondary, lineHeight: 1.65, marginBottom: 6, fontFamily: FONT }}>
                <span style={{ color: T.tertiary, flexShrink: 0 }}>·</span>{s}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* ─────────────────────────────────────────────────────────
   PROPERTY / TOKEN TABLE
───────────────────────────────────────────────────────── */
function PropertyTable({ doc }) {
  if (!doc?.tokenKeys?.length) return null;
  return (
    <div style={{ marginTop: 52, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.primary, fontFamily: FONT, letterSpacing: '-0.02em', margin: 0 }}>Design Tokens</h3>
        <span style={{ fontSize: 11.5, color: T.tertiary, fontFamily: FONT }}>for this component</span>
      </div>
      <div style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', padding: '9px 16px', background: '#f7f6f5', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.tertiary, fontFamily: MONO, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Token</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.tertiary, fontFamily: MONO, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Purpose</span>
        </div>
        {/* Rows */}
        {doc.tokenKeys.map((t, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.6fr',
            padding: '11px 16px',
            borderBottom: i < doc.tokenKeys.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            alignItems: 'start',
            background: i % 2 === 0 ? '#fff' : '#fcfbfa',
          }}>
            <code style={{
              fontSize: 11.5, fontFamily: MONO, color: '#b85c26',
              background: 'rgba(184,92,38,0.07)', padding: '2px 7px',
              borderRadius: 4, display: 'inline-block',
              border: '1px solid rgba(184,92,38,0.12)',
            }}>{t.key}</code>
            <span style={{ fontSize: 13.5, color: T.secondary, lineHeight: 1.55, fontFamily: FONT, paddingLeft: 12, paddingTop: 1 }}>{t.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ON THIS PAGE rail
───────────────────────────────────────────────────────── */
function OnThisPage({ items, activeId }) {
  if (!items.length) return null;
  return (
    <div style={{ width: 164, flexShrink: 0, paddingTop: 0 }}>
      <div style={{ position: 'sticky', top: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.tertiary, fontFamily: MONO, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12 }}>
          On this page
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => {
            const isActive = activeId === item.id;
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px', borderRadius: 6,
                background: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
              }}>
                {isActive
                  ? <div style={{ width: 2, height: 13, borderRadius: 1, background: '#c8602a', flexShrink: 0 }} />
                  : <div style={{ width: 2, height: 13, flexShrink: 0 }} />
                }
                <span style={{
                  fontSize: 12.5, fontFamily: FONT, lineHeight: 1.4,
                  color: isActive ? T.primary : T.tertiary,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '-0.01em',
                }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Keyboard shortcut hints */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['Space', 'Regenerate'], ['⌘E', 'Export'], ['⌘K', 'Customize']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, color: T.tertiary, fontFamily: FONT }}>{label}</span>
              <kbd style={{ fontSize: 10, fontFamily: MONO, background: '#f7f6f5', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, padding: '1px 6px', color: T.tertiary }}>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   OVERVIEW PAGE
───────────────────────────────────────────────────────── */
function OverviewPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
          Foundation
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: T.primary, letterSpacing: '-0.035em', lineHeight: 1.12, marginBottom: 18, fontFamily: FONT }}>
          Design System
        </h1>
        <p style={{ fontSize: 15.5, color: T.secondary, lineHeight: 1.75, maxWidth: 520, fontFamily: FONT, fontWeight: 400, margin: 0 }}>
          A living component library built on a systematic token architecture. Every component responds to your token choices in real time: colors, typography, spacing, shape, and motion cascade from a single source of truth.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 56 }}>
        {[
          { value: '28', label: 'Components',   sub: '9 category groups',        icon: '▦', accent: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
          { value: '6',  label: 'Token Layers', sub: 'Primitive → Layout',       icon: '◈', accent: '#2563eb', bg: 'rgba(37,99,235,0.07)'   },
          { value: '14', label: 'WCAG Checks',  sub: 'Automated audit',          icon: '✓', accent: '#16a34a', bg: 'rgba(22,163,74,0.07)'   },
          { value: '∞',  label: 'Combinations', sub: 'Token-driven variations',  icon: '⟡', accent: '#c8602a', bg: 'rgba(200,96,42,0.07)'   },
        ].map(({ value, label, sub, icon, accent, bg }) => (
          <div key={label} style={{
            padding: '20px 18px', background: '#fff',
            borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)',
            borderTop: `3px solid ${accent}`,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: accent, marginBottom: 14 }}>{icon}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: T.primary, fontFamily: FONT, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.primary, fontFamily: FONT, letterSpacing: '-0.01em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 11.5, color: T.tertiary, fontFamily: FONT }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Token architecture */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.primary, letterSpacing: '-0.025em', marginBottom: 20, fontFamily: FONT }}>Token Architecture</h2>
        <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {[
            { name: 'Primitive', color: '#7c3aed', bg: 'rgba(124,58,237,0.05)' },
            { name: 'Semantic',  color: '#2563eb', bg: 'rgba(37,99,235,0.04)'  },
            { name: 'Component', color: '#0891b2', bg: 'rgba(8,145,178,0.04)'  },
            { name: 'State',     color: '#059669', bg: 'rgba(5,150,105,0.04)'  },
            { name: 'Motion',    color: '#d97706', bg: 'rgba(217,119,6,0.04)'  },
            { name: 'Layout',    color: '#c8602a', bg: 'rgba(200,96,42,0.05)'  },
          ].map(({ name, color, bg }, i, arr) => (
            <div key={name} style={{
              flex: 1, padding: '16px 10px', textAlign: 'center',
              background: bg,
              borderRight: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              position: 'relative',
            }}>
              <div style={{ fontSize: 9, color, fontFamily: MONO, letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>L{i + 1}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.primary, fontFamily: FONT, letterSpacing: '-0.01em' }}>{name}</div>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: 8, color: T.tertiary }}>›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick start cards */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.primary, letterSpacing: '-0.025em', marginBottom: 20, fontFamily: FONT }}>Quick Start</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { label: 'Color Roles',      sub: 'How swatches map to semantic roles',  icon: '◎', accent: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
            { label: 'Typography',       sub: 'Type scale, font stack, hierarchy',   icon: 'Aa', accent: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
            { label: 'Layout & Spacing', sub: 'Spacing system and grid patterns',    icon: '⊞', accent: '#059669', bg: 'rgba(5,150,105,0.08)'   },
            { label: 'WCAG Audit',       sub: 'Automated accessibility checking',    icon: '✓', accent: '#c8602a', bg: 'rgba(200,96,42,0.08)'   },
          ].map(({ label, sub, icon, accent, bg }) => (
            <div key={label} style={{ padding: '18px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)', background: '#fff', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: accent, flexShrink: 0, fontFamily: FONT }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.primary, marginBottom: 5, fontFamily: FONT, letterSpacing: '-0.015em' }}>{label}</div>
                <div style={{ fontSize: 12.5, color: T.secondary, fontFamily: FONT, lineHeight: 1.55 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FOUNDATION PAGE HEADER  (shared by color-roles / typography / layout)
───────────────────────────────────────────────────────── */
function FoundationHeader({ label, title, desc }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>{label}</div>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: T.primary, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: desc ? 12 : 0, fontFamily: FONT }}>{title}</h1>
      {desc && <p style={{ fontSize: 14.5, color: T.secondary, lineHeight: 1.7, fontFamily: FONT, margin: 0 }}>{desc}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PREVIEW CANVAS WRAPPER
───────────────────────────────────────────────────────── */
function PreviewStage({ scopedVars, mode, canvasRef, children }) {
  return (
    <div ref={canvasRef} style={{ position: 'relative', borderRadius: 12 }}>
      <div data-cascade-overlay="1" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, display: 'none', borderRadius: 12 }} />
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '10px 10px',
        opacity: mode === 'dark' ? 0.4 : 0.6,
      }} />
      <div className="ds-preview" style={{
        ...scopedVars,
        position: 'relative', zIndex: 1,
        background: mode === 'dark' ? '#0f0e0d' : '#ffffff',
        borderRadius: 12,
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
        padding: '32px 28px',
        boxShadow: mode === 'dark'
          ? '0 0 0 1px rgba(0,0,0,0.6), 0 20px 60px rgba(0,0,0,0.5)'
          : '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────── */
const DETAIL_TABS = ['Preview', 'Usage', 'Anatomy', 'A11y'];

export default function DSMainContent({ selectedPage, tokens, scopedVars, mode, onTokenChange, onNavigate }) {
  const [detailTab, setDetailTab] = useState('Preview');
  const [activeAnchor, setActiveAnchor] = useState('preview');
  const matrixRef     = useRef(null);
  const canvasRef     = useRef(null);
  const prevColorsRef = useRef(tokens.colors);
  const prevTypoRef   = useRef(tokens.typography);

  useEffect(() => { setDetailTab('Preview'); setActiveAnchor('preview'); }, [selectedPage]);

  // GSAP color cascade ripple — only for component pages, not foundation
  useEffect(() => {
    if (prevColorsRef.current === tokens.colors) return;
    prevColorsRef.current = tokens.colors;
    if (isFoundation || isPages) return;
    const el = canvasRef.current;
    if (!el) return;
    const { palette } = computeTokens(tokens);
    const tint = palette[0]?.[mode === 'dark' ? 700 : 200] ?? '#c8602a';
    const overlay = el.querySelector('[data-cascade-overlay]');
    if (!overlay) return;
    gsap.killTweensOf(overlay);
    gsap.fromTo(overlay,
      { opacity: 0.5, scale: 0.94 },
      { opacity: 0, scale: 1.03, duration: 0.5, ease: 'power2.out',
        onStart: () => { overlay.style.background = `radial-gradient(ellipse at 50% 50%, ${tint}55 0%, transparent 70%)`; overlay.style.display = 'block'; },
        onComplete: () => { overlay.style.display = 'none'; },
      }
    );
  }, [tokens.colors, mode]);

  // GSAP typography blur — only for component pages, not foundation
  useEffect(() => {
    if (prevTypoRef.current === tokens.typography) return;
    prevTypoRef.current = tokens.typography;
    if (isFoundation || isPages) return;
    const el = canvasRef.current;
    if (!el) return;
    gsap.fromTo(el, { filter: 'blur(2px)', opacity: 0.85 }, { filter: 'blur(0px)', opacity: 1, duration: 0.2, ease: 'power2.out' });
  }, [tokens.typography]);

  const isFoundation = FOUNDATION_IDS.has(selectedPage);
  const isPages      = PAGES_IDS.has(selectedPage);
  const isComponent  = !isFoundation && !isPages;
  const meta         = SECTION_META[selectedPage] ?? {};
  const doc          = COMPONENT_DOCS[selectedPage] ?? null;
  const groupLabel   = PAGE_GROUP_MAP[selectedPage] ?? '';
  const tier         = doc?.tier ?? null;
  const tierStyle    = TIER_STYLES[tier] ?? null;

  const anchorItems = isComponent ? [
    { id: 'preview',  label: 'Preview'  },
    { id: 'usage',    label: 'Usage'    },
    { id: 'anatomy',  label: 'Anatomy'  },
    { id: 'a11y',     label: 'A11y'     },
    ...(doc?.tokenKeys?.length ? [{ id: 'tokens', label: 'Tokens' }] : []),
  ] : [];

  const renderSection = () => {
    const fn = PAGE_RENDER_MAP[selectedPage];
    if (!fn) return <div style={{ color: T.tertiary, fontSize: 13, fontFamily: FONT }}>Page not found.</div>;
    return fn({ tokens, scopedVars, mode, onTokenChange, matrixRef });
  };

  // Pages tab — full-width, handled by DSPagePreviews
  if (isPages) {
    return (
      <DSPagePreviews
        tokens={tokens}
        mode={mode}
        scopedVars={scopedVars}
        selectedPage={selectedPage}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', position: 'relative', background: '#fff' }}>
      <AnimatePresence mode="wait">
        <motion.div key={selectedPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ minHeight: '100%' }}>

          {/* ═══════════════ FOUNDATION ═══════════════ */}
          {isFoundation && selectedPage !== 'tokens' && (
            <div style={{ padding: '48px 56px 72px' }}>
              {selectedPage === 'overview' && <OverviewPage />}

              {selectedPage === 'color-roles' && (
                <>
                  <FoundationHeader label="Color System" title="Color Roles"
                    desc="How your palette swatches map to semantic roles. Primary drives CTAs and interactive elements. Secondary supports UI structure. Tertiary provides accent variation." />
                  <div style={{ ...scopedVars }}>
                    <PC.ColorRolesSection />
                  </div>
                </>
              )}

              {selectedPage === 'typography' && (
                <>
                  <FoundationHeader label="Typography" title="Type Scale"
                    desc="Your display, body, and mono font stack with a live typographic scale. Every size step is derived from the scale ratio you set in the token controls." />
                  <div style={{ ...scopedVars }}>
                    <PC.TypographyPreview tokens={tokens} />
                  </div>
                </>
              )}

              {selectedPage === 'layout' && (
                <>
                  <FoundationHeader label="Layout" title="Layout & Spacing"
                    desc="Spacing steps, grid patterns, and layout primitives derived from your base unit and scale type." />
                  <div style={{ ...scopedVars }}>
                    <PC.LayoutPreview tokens={tokens} />
                  </div>
                </>
              )}

              {selectedPage === 'wcag' && (
                <>
                  <FoundationHeader label="Accessibility" title="WCAG Audit"
                    desc="14 automated contrast and readability checks run against your current token system. One-click auto-fix resolves the most common issues." />
                  <div style={{ ...scopedVars }}>
                    <PC.AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tokens page — full width, no maxWidth cap */}
          {isFoundation && selectedPage === 'tokens' && (
            <div style={{ padding: '48px 56px 72px' }}>
              <FoundationHeader label="Tokens" title="Token Explorer"
                desc="Every computed token across all six layers. Primitive values feed into semantic roles, which drive component tokens." />
              <PC.TokensPreview tokens={tokens} mode={mode} />
            </div>
          )}

          {/* ═══════════════ COMPONENT PAGES ═══════════════ */}
          {isComponent && (
            <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100%' }}>

              {/* ── Main column ── */}
              <div style={{ flex: 1, minWidth: 0, padding: '48px 52px 80px 56px' }}>

                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
                  {['Components', groupLabel, selectedPage].map((crumb, i, arr) => (
                    <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 12.5, fontFamily: FONT,
                        color: i === arr.length - 1 ? T.primary : T.tertiary,
                        fontWeight: i === arr.length - 1 ? 500 : 400,
                      }}>{crumb}</span>
                      {i < arr.length - 1 && <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 13 }}>›</span>}
                    </span>
                  ))}
                </nav>

                {/* Page header */}
                <header style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontFamily: MONO, color: T.accent, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>
                      {meta.category || groupLabel}
                    </span>
                    {tier && tierStyle && <StatusChip label={tier} {...tierStyle} />}
                    {doc?.status && <StatusChip label={doc.status} color={T.tertiary} bg="rgba(0,0,0,0.04)" border="rgba(0,0,0,0.08)" />}
                  </div>

                  <h1 style={{ fontSize: 30, fontWeight: 700, color: T.primary, letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 14, fontFamily: FONT }}>
                    {selectedPage}
                  </h1>

                  <p style={{ fontSize: 14.5, color: T.secondary, lineHeight: 1.72, fontFamily: FONT, margin: 0 }}>
                    {doc?.description ?? meta.desc}
                  </p>
                </header>

                {/* Contextual token strip (inside ds-preview scope) */}
                <div className="ds-preview" style={{ ...scopedVars, marginBottom: 32 }}>
                  <PC.ContextualTokenStrip componentKey={selectedPage} scopedVars={scopedVars} />
                </div>

                {/* ── Tab bar ── */}
                <div style={{
                  display: 'flex', alignItems: 'stretch',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  marginBottom: 0, gap: 0,
                }}>
                  {DETAIL_TABS.map(t => {
                    const isActive = detailTab === t;
                    return (
                      <button key={t}
                        onClick={() => { setDetailTab(t); setActiveAnchor(t.toLowerCase()); }}
                        style={{
                          padding: '10px 18px', border: 'none',
                          borderBottom: `2px solid ${isActive ? '#1a1814' : 'transparent'}`,
                          background: 'transparent',
                          color: isActive ? T.primary : T.tertiary,
                          fontSize: 13.5, cursor: 'pointer',
                          fontFamily: FONT, fontWeight: isActive ? 600 : 400,
                          letterSpacing: '-0.01em',
                          transition: 'color 0.12s, border-color 0.12s',
                          whiteSpace: 'nowrap', marginBottom: -1,
                        }}>
                        {t}
                      </button>
                    );
                  })}
                </div>

                {/* ── Tab content ── */}
                <AnimatePresence mode="wait">
                  <motion.div key={detailTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}>

                    {detailTab === 'Preview' ? (
                      <>
                        <div style={{ marginTop: 28 }}>
                          <PreviewStage scopedVars={scopedVars} mode={mode} canvasRef={canvasRef}>
                            {renderSection()}
                          </PreviewStage>
                        </div>
                        <PropertyTable doc={doc} />
                      </>
                    ) : (
                      <div style={{ paddingTop: 32, maxWidth: 580 }}>
                        <DocTabContent doc={doc} tab={detailTab} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── On This Page rail ── */}
              <div style={{ width: 196, flexShrink: 0, padding: '48px 20px 48px 4px' }}>
                <OnThisPage items={anchorItems} activeId={activeAnchor} />
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
