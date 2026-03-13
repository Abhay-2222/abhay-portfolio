/**
 * DSTopBar.jsx — Apple-quality top bar for Design System Builder
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Geist Sans', system-ui, sans-serif`;

// Components first (primary task), Pages second, Foundation third
// Audit & Tokens live in the left nav under Foundation — no need to duplicate in top bar
const SECTION_TABS = [
  { id: 'components', label: 'Components' },
  { id: 'pages',      label: 'Pages'      },
  { id: 'foundation', label: 'Foundation' },
];

const TAB_TO_PAGE = {
  components: 'Buttons',
  pages:      'dashboard',
  foundation: 'overview',
};

const FOUNDATION_IDS = new Set(['overview', 'color-roles', 'typography', 'layout', 'tokens', 'wcag']);
const PAGES_IDS      = new Set(['dashboard', 'form-page', 'marketing', 'mobile-page']);

function getActiveSection(selectedPage) {
  if (FOUNDATION_IDS.has(selectedPage)) return 'foundation';
  if (PAGES_IDS.has(selectedPage))      return 'pages';
  return 'components';
}

export default function DSTopBar({
  systemName,
  onSystemNameChange,
  selectedPage,
  onNavigate,
  mode,
  onModeToggle,
  configOpen,
  onConfigToggle,
  onExport,
  auditErrorCount,
  namedThemes,
  activeThemeId,
  onThemeChange,
  onSaveTheme,
}) {
  const activeSection = getActiveSection(selectedPage);
  const [hoveredTab, setHoveredTab] = useState(null);

  // Editable system name
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(systemName ?? 'Design System');
  const inputRef = useRef(null);

  useEffect(() => { setNameVal(systemName ?? 'Design System'); }, [systemName]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commitName = () => {
    setEditing(false);
    const val = nameVal.trim() || 'Design System';
    setNameVal(val);
    onSystemNameChange?.(val);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: 52, paddingLeft: 20, paddingRight: 16,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      flexShrink: 0, gap: 0,
      fontFamily: FONT,
      position: 'relative', zIndex: 20,
    }}>

      {/* Left: logo mark + editable system name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32, flexShrink: 0 }}>
        {/* Dot logo */}
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #1a1814 0%, #3d3a35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
        </div>

        {/* Editable name */}
        {editing ? (
          <input
            ref={inputRef}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameVal(systemName ?? 'Design System'); setEditing(false); } }}
            style={{
              fontSize: 13, fontWeight: 600, color: '#1a1814', letterSpacing: '-0.02em',
              border: 'none', borderBottom: '1.5px solid #c8602a', background: 'transparent',
              outline: 'none', padding: '0 2px', fontFamily: FONT,
              minWidth: 80, maxWidth: 200,
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            title="Click to rename"
            style={{
              fontSize: 13, fontWeight: 600, color: '#1a1814', letterSpacing: '-0.02em',
              whiteSpace: 'nowrap', cursor: 'text',
              borderBottom: '1.5px solid transparent',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
          >
            {nameVal}
          </span>
        )}

        <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.28)', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.04em' }}>v1.0</span>
      </div>

      {/* Centre: section tabs with layoutId sliding indicator */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1, gap: 2 }}>
        {SECTION_TABS.map(tab => {
          const isActive = activeSection === tab.id;
          const isHovered = hoveredTab === tab.id;
          return (
            <button key={tab.id}
              onClick={() => onNavigate(TAB_TO_PAGE[tab.id])}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: isHovered && !isActive ? 'rgba(0,0,0,0.03)' : 'transparent',
                color: isActive ? '#1a1814' : 'rgba(0,0,0,0.42)',
                fontSize: 13, cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '-0.01em',
                transition: 'color 0.12s',
                whiteSpace: 'nowrap',
                fontFamily: FONT,
              }}>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 8,
                    background: 'rgba(0,0,0,0.06)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Theme switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={activeThemeId ?? ''}
              onChange={e => onThemeChange?.(e.target.value || null)}
              title="Switch theme"
              style={{
                fontSize: 11, fontFamily: FONT, color: activeThemeId ? '#c8602a' : '#1a1814',
                background: activeThemeId ? 'rgba(200,96,42,0.07)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${activeThemeId ? 'rgba(200,96,42,0.3)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: 6, padding: '4px 22px 4px 8px',
                appearance: 'none', cursor: 'pointer',
                minWidth: 72, fontWeight: activeThemeId ? 600 : 400,
                transition: 'all 0.15s',
              }}>
              <option value="">Working</option>
              {(namedThemes ?? []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }}>▾</span>
          </div>
          <button
            onClick={() => {
              const name = window.prompt('Save current tokens as a named theme:', `Theme ${((namedThemes ?? []).length) + 1}`);
              if (name?.trim()) onSaveTheme?.(name.trim());
            }}
            title="Save current as named theme"
            style={{
              width: 24, height: 24, borderRadius: 5,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)',
              fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, transition: 'all 0.12s', flexShrink: 0,
            }}>+</button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.08)' }} />

        {/* Mode toggle — pill style */}
        <button onClick={onModeToggle}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.08)',
            background: mode === 'dark' ? '#1a1814' : 'rgba(0,0,0,0.04)',
            color: mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
            fontSize: 12, cursor: 'pointer', fontWeight: 500,
            transition: 'all 0.18s', fontFamily: FONT,
            letterSpacing: '-0.01em',
          }}>
          <span style={{ fontSize: 11 }}>{mode === 'dark' ? '●' : '○'}</span>
          {mode === 'dark' ? 'Dark' : 'Light'}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.08)' }} />

        {/* Config toggle */}
        <button onClick={onConfigToggle}
          aria-pressed={configOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', borderRadius: 8,
            border: '1px solid rgba(200,96,42,0.35)',
            background: configOpen ? '#c8602a' : 'rgba(200,96,42,0.09)',
            color: configOpen ? '#fff' : '#c8602a',
            fontSize: 12, cursor: 'pointer', fontWeight: 600,
            transition: 'all 0.15s', fontFamily: FONT,
            letterSpacing: '-0.01em',
          }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="2" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="10" cy="6" r="1.5" fill="currentColor"/>
          </svg>
          Customize
          <kbd style={{ fontSize: 9, fontFamily: '"Geist Mono",monospace', color: 'inherit', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, padding: '1px 4px', letterSpacing: 0, opacity: 0.8 }}>⌘K</kbd>
        </button>

        {/* Export — filled accent */}
        <motion.button onClick={onExport} whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: '#1a1814', color: '#fff',
            fontSize: 12, cursor: 'pointer', fontWeight: 600,
            letterSpacing: '-0.01em', fontFamily: FONT,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v7M2 6l3.5 3.5L9 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </motion.button>
      </div>
    </div>
  );
}
