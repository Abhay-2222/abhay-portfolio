/**
 * DSConfigPanel.jsx — Right collapsible token-control drawer
 * Figma sidebar style: flat sections, icon locks, segmented controls, compact swatches.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FONT_CATEGORIES,
  PRESETS, PRESET_KEYS,
  SHAPE_RADIUS, SCALE_NAMES,
  generateHarmoniousSwatch,
  applyPreset,
} from './dsEngine';

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Geist Sans', system-ui, sans-serif`;

const P = {
  bg:           '#ffffff',
  bgCard:       '#f0efee',
  bgHover:      '#eae9e8',
  border:       'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.12)',
  text:         '#1a1814',
  textMuted:    'rgba(0,0,0,0.42)',
  textDim:      'rgba(0,0,0,0.26)',
  accent:       '#c8602a',
  accentSoft:   'rgba(200,96,42,0.07)',
  accentBorder: 'rgba(200,96,42,0.28)',
};

/* ── SVG Icons ── */
function LockOpenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="2.5" y="6" width="8" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 6V4.5a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function LockClosedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="2.5" y="6" width="8" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 6V4.5a2 2 0 0 1 4 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.15 }}
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M3.5 2.5L6 5L3.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </motion.svg>
  );
}

/* ── Flat Section ── */
function Section({ title, locked, onLockToggle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div role="region" aria-label={title} style={{ marginBottom: 2 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <button
          className="ds-btn"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, padding: '2px 0', textAlign: 'left',
          }}
        >
          <span style={{ color: P.textDim }}><ChevronIcon open={open} /></span>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            color: locked ? P.accent : P.textMuted, fontFamily: FONT, transition: 'color .2s',
          }}>
            {title}
          </span>
        </button>
        <button
          className="ds-btn"
          onClick={onLockToggle}
          aria-label={locked ? `Unlock ${title}` : `Lock ${title}`}
          aria-pressed={locked}
          style={{
            width: 22, height: 22, borderRadius: 5, border: 'none',
            background: locked ? P.accentSoft : 'transparent',
            color: locked ? P.accent : P.textDim,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all .15s',
          }}
        >
          {locked ? <LockClosedIcon /> : <LockOpenIcon />}
        </button>
      </div>
      <hr style={{ border: 'none', borderTop: `1px solid ${P.border}`, margin: '0 0 10px' }} />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Segmented Control ── */
function SegmentedControl({ options, value, onChange, 'aria-label': ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: 'flex', background: P.bgCard, borderRadius: 8,
        padding: 3, gap: 2,
      }}
    >
      {options.map(opt => {
        const v = opt.value ?? opt, l = opt.label ?? opt;
        const active = v === value;
        return (
          <button
            key={String(v)}
            className="ds-btn"
            onClick={() => onChange(v)}
            aria-pressed={active}
            style={{
              flex: 1, padding: '4px 2px', borderRadius: 6, cursor: 'pointer',
              border: active ? `1px solid ${P.borderStrong}` : '1px solid transparent',
              background: active ? '#fff' : 'transparent',
              color: active ? P.text : P.textMuted,
              fontSize: 10.5, fontFamily: FONT, fontWeight: active ? 600 : 400,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
              transition: 'all .12s', whiteSpace: 'nowrap',
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

/* ── Slider Row ── */
function SliderRow({ label, min, max, step = 1, value, onChange, unit = '', gradient, id }) {
  const inputId = id ?? `cfg-slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor={inputId} style={{ fontSize: 11, color: P.textMuted, fontFamily: FONT, width: 56, flexShrink: 0 }}>{label}</label>
      <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        {gradient && <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: gradient, pointerEvents: 'none', zIndex: 0 }} />}
        <input
          id={inputId} type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          className="ds-input"
          style={{ width: '100%', height: 4, cursor: 'pointer', accentColor: P.accent, position: 'relative', zIndex: 1, background: gradient ? 'transparent' : undefined }}
        />
      </div>
      <span style={{ fontSize: 11, color: P.text, fontFamily: '"Geist Mono",monospace', minWidth: 36, textAlign: 'right', fontWeight: 500 }}>{value}{unit}</span>
    </div>
  );
}

/* ── Font Select ── */
const FONT_ROLE_CATS = { display: ['serif', 'display'], body: ['sans'], mono: ['mono'] };

function FontSelect({ role, label, value, onChange }) {
  const allowedCats = FONT_ROLE_CATS[role] ?? ['serif', 'sans', 'display', 'mono'];
  const [activeCat, setActiveCat] = useState('all');
  const selectId = `cfg-font-${role}`;
  const filteredFonts = activeCat === 'all'
    ? allowedCats.flatMap(c => FONT_CATEGORIES[c]?.fonts ?? [])
    : (FONT_CATEGORIES[activeCat]?.fonts ?? []);
  const catOptions = [{ value: 'all', label: 'All' }, ...allowedCats.map(c => ({ value: c, label: FONT_CATEGORIES[c].label }))];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor={selectId} style={{ fontSize: 11, color: P.textMuted, fontFamily: FONT }}>{label}</label>
        {catOptions.length > 2 && (
          <div style={{ display: 'flex', gap: 2 }}>
            {catOptions.map(c => (
              <button key={c.value} className="ds-btn" onClick={() => setActiveCat(c.value)} aria-pressed={activeCat === c.value}
                style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${activeCat === c.value ? P.accent : P.border}`, cursor: 'pointer', fontSize: 9.5, background: activeCat === c.value ? P.accent : 'transparent', color: activeCat === c.value ? '#fff' : P.textMuted, fontFamily: FONT, transition: 'all .1s' }}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <select id={selectId} value={value} onChange={e => onChange(e.target.value)} className="ds-select"
          style={{ width: '100%', padding: '6px 24px 6px 9px', borderRadius: 6, border: `1px solid ${P.border}`, background: P.bgCard, color: P.text, fontFamily: `'${value}',system-ui`, fontSize: 12, cursor: 'pointer', appearance: 'none' }}>
          {filteredFonts.map(f => (
            <option key={f} value={f} style={{ fontFamily: `'${f}',system-ui`, background: '#ffffff', color: '#1b1a17' }}>{f}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: P.textMuted, fontSize: 10, pointerEvents: 'none' }}>▾</span>
      </div>
    </div>
  );
}

/* ── Compact Color Section ── */
const ROLE_LABELS = ['Primary', 'Secondary', 'Tertiary', 'Accent', '–', '–'];

function CompactColorSection({ colors, onChange, onGenerateHarmony }) {
  const swatches = colors?.swatches ?? [];
  const [expandedIdx, setExpandedIdx] = useState(null);

  const updateSwatch = (i, patch) => {
    const next = swatches.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    onChange({ swatches: next });
  };
  const removeSwatch = (i) => {
    if (swatches.length <= 2) return;
    onChange({ swatches: swatches.filter((_, idx) => idx !== i) });
  };
  const addSwatch = () => {
    if (swatches.length >= 6) return;
    onChange({ swatches: [...swatches, { hex: generateHarmoniousSwatch(swatches.length), locked: false }] });
  };

  const harmony = colors?.harmony ?? 'complementary';
  const satBoost = colors?.saturationBoost ?? 0;

  return (
    <div>
      {/* Circular swatch dots row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap' }}>
        {swatches.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div
              onClick={() => setExpandedIdx(i === expandedIdx ? null : i)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: s.hex, cursor: 'pointer',
                outline: expandedIdx === i ? `2px solid ${P.accent}` : s.locked ? `2px solid rgba(200,96,42,0.7)` : `2px solid transparent`,
                outlineOffset: 2,
                border: '1.5px solid rgba(0,0,0,0.15)',
                transition: 'outline .12s, transform .1s',
                boxSizing: 'border-box',
              }}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${ROLE_LABELS[i]} color`}
              onKeyDown={e => e.key === 'Enter' && setExpandedIdx(i === expandedIdx ? null : i)}
            />
            <span style={{ fontSize: 8.5, color: P.textDim, fontFamily: FONT, whiteSpace: 'nowrap' }}>
              {ROLE_LABELS[i] ?? '–'}
            </span>
          </div>
        ))}
        {swatches.length < 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <button onClick={addSwatch} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px dashed ${P.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.textDim, fontSize: 16, lineHeight: 1, transition: 'border-color .1s' }}>
              +
            </button>
            <span style={{ fontSize: 8.5, color: 'transparent' }}>–</span>
          </div>
        )}
      </div>

      {/* Expanded hex editor for selected swatch */}
      <AnimatePresence>
        {expandedIdx !== null && swatches[expandedIdx] && (
          <motion.div
            key={`swatch-edit-${expandedIdx}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: P.bgCard, borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
              {/* Color preview bar */}
              <div style={{ position: 'relative', height: 36, borderRadius: 6, marginBottom: 8, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => document.getElementById(`cfg-swatch-${expandedIdx}`)?.click()}>
                <div style={{ position: 'absolute', inset: 0, background: swatches[expandedIdx].hex }} />
                <input
                  id={`cfg-swatch-${expandedIdx}`}
                  type="color"
                  value={swatches[expandedIdx].hex}
                  onChange={e => updateSwatch(expandedIdx, { hex: e.target.value })}
                  style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
              {/* Controls row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input
                  value={swatches[expandedIdx].hex}
                  onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateSwatch(expandedIdx, { hex: v.length === 7 ? v : swatches[expandedIdx].hex }); }}
                  maxLength={7}
                  className="ds-input"
                  style={{ flex: 1, fontSize: 11, fontFamily: '"Geist Mono",monospace', color: P.text, background: '#fff', border: `1px solid ${P.border}`, borderRadius: 5, padding: '4px 8px', outline: 'none' }}
                  aria-label={`Swatch ${expandedIdx + 1} hex`}
                />
                <button className="ds-btn"
                  onClick={() => updateSwatch(expandedIdx, { locked: !swatches[expandedIdx].locked })}
                  aria-label={swatches[expandedIdx].locked ? 'Unlock color' : 'Lock color'}
                  aria-pressed={swatches[expandedIdx].locked}
                  style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${swatches[expandedIdx].locked ? P.accentBorder : P.border}`, background: swatches[expandedIdx].locked ? P.accentSoft : 'transparent', color: swatches[expandedIdx].locked ? P.accent : P.textDim, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {swatches[expandedIdx].locked ? '🔒' : '🔓'}
                </button>
                {swatches.length > 2 && (
                  <button className="ds-btn"
                    onClick={() => { removeSwatch(expandedIdx); setExpandedIdx(null); }}
                    style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${P.border}`, background: 'transparent', color: P.textDim, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Harmony mode */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Harmony</div>
        <SegmentedControl
          aria-label="Color harmony mode"
          options={[
            { value: 'analogous',     label: 'Analog' },
            { value: 'complementary', label: 'Comp' },
            { value: 'triadic',       label: 'Triad' },
            { value: 'split',         label: 'Split' },
            { value: 'mono',          label: 'Mono' },
          ]}
          value={harmony}
          onChange={v => onChange({ harmony: v })}
        />
      </div>

      {/* Generate harmony button */}
      <button
        className="ds-btn"
        onClick={() => onGenerateHarmony(harmony)}
        style={{
          width: '100%', padding: '5px', borderRadius: 6,
          border: `1px solid ${P.accentBorder}`, background: P.accentSoft,
          color: P.accent, fontSize: 10.5, cursor: 'pointer', fontFamily: FONT, fontWeight: 500,
          transition: 'all .12s', marginBottom: 6,
        }}
      >
        Apply harmony to palette →
      </button>

      {/* Saturation boost */}
      <SliderRow
        id="cfg-sat-boost"
        label="Sat."
        min={-30} max={30} step={1}
        value={satBoost}
        onChange={v => onChange({ saturationBoost: v })}
        unit=""
      />
    </div>
  );
}

/* ── Gap #9: Semantic Color Overrides ── */
const SEMANTIC_ROLES = [
  { key: 'success', label: 'Success', defaultColor: '#22c55e' },
  { key: 'warning', label: 'Warning', defaultColor: '#f59e0b' },
  { key: 'error',   label: 'Error',   defaultColor: '#ef4444' },
  { key: 'info',    label: 'Info',    defaultColor: '#0ea5e9' },
];

function SemanticColorSection({ semantic, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, paddingTop:8, borderTop:`1px solid ${P.border}`, marginTop:4 }}>
      <div style={{ fontSize:9, color:P.textDim, fontFamily:FONT, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3 }}>Semantic Colors</div>
      {SEMANTIC_ROLES.map(({ key, label, defaultColor }) => {
        const value = semantic?.[key] ?? null;
        const isAuto = value === null || value === undefined;
        const displayColor = isAuto ? defaultColor : value;
        return (
          <div key={key} style={{ display:'flex', alignItems:'center', gap:7 }}>
            {/* Color swatch / picker */}
            <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, background:displayColor, border:'1px solid rgba(0,0,0,0.12)', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              <input type="color" value={displayColor}
                onChange={e => onChange({ [key]: e.target.value })}
                style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer' }}
              />
            </div>
            <span style={{ fontSize:10, color:P.textMuted, fontFamily:FONT, flex:1 }}>{label}</span>
            {isAuto
              ? <span style={{ fontSize:9, color:P.textDim, fontFamily:'"Geist Mono",monospace' }}>auto</span>
              : <button className="ds-btn" onClick={() => onChange({ [key]: null })}
                  style={{ fontSize:9, color:P.textDim, background:'transparent', border:`1px solid ${P.border}`, borderRadius:3, cursor:'pointer', padding:'1px 5px', fontFamily:FONT, transition:'all .1s' }}>
                  auto
                </button>
            }
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
/* ── Gap #32: Import tokens UI ── */
function ImportTokensRow({ onImport }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null); // null | 'ok' | 'error'

  const handleImport = () => {
    if (!text.trim()) return;
    const result = onImport(text);
    if (result) { setStatus('ok'); setTimeout(() => { setOpen(false); setText(''); setStatus(null); }, 1000); }
    else { setStatus('error'); setTimeout(() => setStatus(null), 2000); }
  };

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '5px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 10, color: P.textDim, fontFamily: FONT, textAlign: 'center', transition: 'color .12s' }}
        onMouseEnter={e => e.currentTarget.style.color = P.accent}
        onMouseLeave={e => e.currentTarget.style.color = P.textDim}>
        {open ? '▲ Close import' : '↑ Import tokens'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .15 }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 9.5, color: P.textMuted, fontFamily: FONT, lineHeight: 1.5 }}>
                Paste CSS variables or JSON tokens (W3C DTCG / Tokens Studio format).
              </p>
              <textarea
                value={text} onChange={e => setText(e.target.value)}
                placeholder="Paste :root { --color-primary-500: #4f46e5; } or JSON…"
                style={{ width: '100%', height: 80, padding: '8px', borderRadius: 6, border: `1px solid ${status === 'error' ? '#ef4444' : status === 'ok' ? '#22c55e' : P.border}`, background: '#fff', color: P.text, fontSize: 10, fontFamily: '"Geist Mono",monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color .12s' }}
              />
              <button onClick={handleImport}
                style={{ padding: '7px', borderRadius: 6, border: `1px solid ${P.accentBorder}`, background: P.accentSoft, color: P.accent, fontSize: 11, cursor: 'pointer', fontFamily: FONT, fontWeight: 600, transition: 'all .12s' }}>
                {status === 'ok' ? '✓ Imported' : status === 'error' ? 'Could not parse — check format' : 'Import →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DSConfigPanel({
  open,
  onClose,
  tokens,
  locks,
  versions,
  showHistory,
  compareSelect,
  onTokenChange,
  onLocksChange,
  onRegenerate,
  onRunEvolution,
  onSaveVersion,
  onSetShowHistory,
  onRestoreVersion,
  onSelectForCompare,
  onCancelCompare,
  onShowExport,
  onGenerateHarmony,
  onClearData,      // Gap #8
  onImportTokens,   // Gap #32
}) {
  const SCALE_OPTS = [1.2, 1.25, 1.333, 1.414, 1.618].map(v => ({ value: v, label: v === 1.618 ? 'φ' : String(v) }));
  const toggleLock = key => onLocksChange(p => ({ ...p, [key]: !p[key] }));
  const patchColors  = patch => onTokenChange(p => ({ ...p, colors:    { ...p.colors,      ...patch } }));
  const patchTypo    = patch => onTokenChange(p => ({ ...p, typography: { ...p.typography, ...patch } }));
  const patchSpacing = patch => onTokenChange(p => ({ ...p, spacing:   { ...p.spacing,     ...patch } }));
  const patchMotion  = patch => onTokenChange(p => ({ ...p, motion:    { ...p.motion,      ...patch } }));
  const patchSurfaces= patch => onTokenChange(p => ({ ...p, surfaces:  { ...p.surfaces,    ...patch } }));

  // Shape: can be a preset key or a custom radius number
  const shapeKey = typeof tokens.shape === 'number' ? null : tokens.shape;
  const customRadius = typeof tokens.shape === 'number' ? tokens.shape : SHAPE_RADIUS[tokens.shape]
    ? parseInt(SHAPE_RADIUS[tokens.shape]) : 8;

  return (
    <div style={{
      width: open ? 280 : 0,
      minWidth: 0,
      overflow: 'hidden',
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      borderLeft: '1px solid rgba(0,0,0,0.07)',
      background: '#fafaf9',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
    }}>
      {/* Inner container */}
      <div style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1814', fontFamily: FONT, letterSpacing: '-0.015em' }}>Customize</span>
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.32)', fontFamily: '"Geist Mono",monospace', marginTop: 1 }}>Token controls</div>
          </div>
          <button className="ds-btn" onClick={onClose} aria-label="Close config panel"
            style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.4)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="ds-panel-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px 14px 0' }}>

          {/* Style preset */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: P.textMuted, fontFamily: FONT, marginBottom: 8 }}>Preset</div>
            <div role="group" aria-label="Design presets" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {PRESET_KEYS.map(key => {
                const active = tokens.preset === key;
                return (
                  <button key={key} className="ds-btn"
                    onClick={() => onTokenChange(p => applyPreset(key, p, locks))}
                    aria-pressed={active}
                    style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${active ? P.accent : P.border}`, background: active ? P.accent : '#fff', color: active ? '#fff' : P.text, fontSize: 10.5, fontFamily: FONT, fontWeight: active ? 600 : 400, transition: 'all .12s' }}>
                    {PRESETS[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Token sections */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <Section title="Colors" locked={locks.colors} onLockToggle={() => toggleLock('colors')}>
              <CompactColorSection
                colors={tokens.colors}
                onChange={patchColors}
                onGenerateHarmony={onGenerateHarmony ?? (() => {})}
              />
              {/* Gap #9: custom semantic color overrides */}
              <SemanticColorSection
                semantic={tokens.colors?.semantic ?? {}}
                onChange={(patch) => patchColors({ semantic: { ...(tokens.colors?.semantic ?? {}), ...patch } })}
              />
            </Section>

            <Section title="Typography" locked={locks.typography} onLockToggle={() => toggleLock('typography')}>
              <FontSelect role="display" label="Display" value={tokens.typography.display} onChange={v => patchTypo({ display: v })} />
              <FontSelect role="body"    label="Body"    value={tokens.typography.body}    onChange={v => patchTypo({ body: v })} />
              <FontSelect role="mono"    label="Mono"    value={tokens.typography.mono}    onChange={v => patchTypo({ mono: v })} />

              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Scale · {SCALE_NAMES[tokens.typography.scale] ?? ''}</div>
                <SegmentedControl aria-label="Type scale ratio" options={SCALE_OPTS} value={tokens.typography.scale} onChange={v => patchTypo({ scale: v })} />
              </div>

              <SliderRow id="cfg-base-size" label="Base" min={12} max={28} step={1} value={tokens.typography.baseSize} onChange={v => patchTypo({ baseSize: v })} unit="px" />

              {/* Display weight */}
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Display weight</div>
                <SegmentedControl aria-label="Display weight"
                  options={[{value:300,label:'Light'},{value:400,label:'Reg'},{value:500,label:'Med'},{value:600,label:'Semi'},{value:700,label:'Bold'}]}
                  value={tokens.typography.displayWeight ?? 700}
                  onChange={v => patchTypo({ displayWeight: v })}
                />
              </div>

              {/* Body weight */}
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Body weight</div>
                <SegmentedControl aria-label="Body weight"
                  options={[{value:300,label:'Light'},{value:400,label:'Regular'},{value:500,label:'Medium'}]}
                  value={tokens.typography.bodyWeight ?? 400}
                  onChange={v => patchTypo({ bodyWeight: v })}
                />
              </div>

              {/* Letter spacing */}
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Letter spacing</div>
                <SegmentedControl aria-label="Letter spacing"
                  options={[{value:'tight',label:'Tight'},{value:'normal',label:'Normal'},{value:'wide',label:'Wide'}]}
                  value={tokens.typography.letterSpacing ?? 'normal'}
                  onChange={v => patchTypo({ letterSpacing: v })}
                />
              </div>

              {/* Line height */}
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Line height</div>
                <SegmentedControl aria-label="Line height"
                  options={[{value:'compact',label:'Compact'},{value:'normal',label:'Normal'},{value:'relaxed',label:'Relaxed'}]}
                  value={tokens.typography.lineHeight ?? 'normal'}
                  onChange={v => patchTypo({ lineHeight: v })}
                />
              </div>
            </Section>

            <Section title="Density" locked={locks.density} onLockToggle={() => toggleLock('density')}>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Component spacing scale</div>
                <SegmentedControl aria-label="Density"
                  options={[{value:'compact',label:'Compact'},{value:'regular',label:'Regular'},{value:'comfortable',label:'Comfy'},{value:'spacious',label:'Spacious'}]}
                  value={tokens.density ?? 'regular'}
                  onChange={v => onTokenChange(p => ({ ...p, density: v }))}
                />
              </div>
            </Section>

            <Section title="Spacing" locked={locks.spacing} onLockToggle={() => toggleLock('spacing')}>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Base unit</div>
                <SegmentedControl aria-label="Spacing base unit"
                  options={[{ value: 4, label: '4px' }, { value: 8, label: '8px' }]}
                  value={tokens.spacing.base}
                  onChange={v => patchSpacing({ base: v })}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Scale type</div>
                <SegmentedControl aria-label="Spacing scale type"
                  options={[{ value: 'linear', label: 'Linear' }, { value: 'fibonacci', label: 'Fibonacci' }]}
                  value={tokens.spacing.scale}
                  onChange={v => patchSpacing({ scale: v })}
                />
              </div>
            </Section>

            <Section title="Shape" locked={locks.shape} onLockToggle={() => toggleLock('shape')}>
              <SegmentedControl aria-label="Border radius style"
                options={['sharp', 'soft', 'rounded', 'veryRounded', 'pill'].map(v => ({ value: v, label: { sharp: 'Sharp', soft: 'Soft', rounded: 'Round', veryRounded: 'More', pill: 'Pill' }[v] }))}
                value={shapeKey ?? 'custom'}
                onChange={v => onTokenChange(p => ({ ...p, shape: v }))}
              />
              {/* Shape preview dots */}
              <div role="presentation" style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 2 }}>
                {['sharp', 'soft', 'rounded', 'veryRounded', 'pill'].map(s => (
                  <div key={s}
                    onClick={() => onTokenChange(p => ({ ...p, shape: s }))}
                    role="button" tabIndex={0} aria-label={s}
                    onKeyDown={e => e.key === 'Enter' && onTokenChange(p => ({ ...p, shape: s }))}
                    style={{ width: 32, height: 22, cursor: 'pointer', borderRadius: SHAPE_RADIUS[s], border: `1.5px solid ${tokens.shape === s ? P.accent : P.border}`, background: tokens.shape === s ? P.accentSoft : P.bgCard, transition: 'all .12s', flexShrink: 0 }} />
                ))}
              </div>
              {/* Custom radius slider */}
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Custom radius</div>
                <SliderRow id="cfg-custom-radius" label="px" min={0} max={32} step={1}
                  value={customRadius}
                  onChange={v => onTokenChange(p => ({ ...p, shape: v }))}
                  unit="px"
                />
              </div>
            </Section>

            <Section title="Shadows" locked={locks.shadows} onLockToggle={() => toggleLock('shadows')}>
              <SegmentedControl aria-label="Shadow style"
                options={['flat', 'soft', 'hard', 'layered'].map(v => ({ value: v, label: { flat: 'Flat', soft: 'Soft', hard: 'Hard', layered: 'Layered' }[v] }))}
                value={tokens.shadows}
                onChange={v => onTokenChange(p => ({ ...p, shadows: v }))}
              />
              {/* Shadow preview */}
              <div role="presentation" style={{ display: 'flex', gap: 10, paddingTop: 4, alignItems: 'flex-end' }}>
                {[['flat','none'],['soft','0 4px 12px rgba(0,0,0,0.14)'],['hard','3px 3px 0 rgba(0,0,0,0.65)'],['layered','0 1px 2px rgba(0,0,0,0.07),0 4px 8px rgba(0,0,0,0.09)']].map(([s, shadow]) => (
                  <div key={s}
                    onClick={() => onTokenChange(p => ({ ...p, shadows: s }))}
                    role="button" tabIndex={0} aria-label={s}
                    onKeyDown={e => e.key === 'Enter' && onTokenChange(p => ({ ...p, shadows: s }))}
                    style={{ width: 34, height: 26, cursor: 'pointer', borderRadius: 5, border: `1.5px solid ${tokens.shadows === s ? P.accent : P.border}`, background: tokens.shadows === s ? P.accentSoft : '#fff', boxShadow: shadow, transition: 'all .15s', flexShrink: 0 }} />
                ))}
              </div>
            </Section>

            <Section title="Motion" locked={locks.motion} onLockToggle={() => toggleLock('motion')}>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Duration</div>
                <SegmentedControl aria-label="Motion duration"
                  options={[{value:'instant',label:'Instant'},{value:'snappy',label:'Snappy'},{value:'balanced',label:'Balanced'},{value:'expressive',label:'Expressive'}]}
                  value={tokens.motion?.duration ?? 'balanced'}
                  onChange={v => patchMotion({ duration: v })}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Easing</div>
                <SegmentedControl aria-label="Motion easing"
                  options={[{value:'spring',label:'Spring'},{value:'ease',label:'Ease'},{value:'linear',label:'Linear'},{value:'snappy',label:'Snappy'}]}
                  value={tokens.motion?.easing ?? 'ease'}
                  onChange={v => patchMotion({ easing: v })}
                />
              </div>
            </Section>

            <Section title="Surfaces" locked={locks.surfaces} onLockToggle={() => toggleLock('surfaces')}>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Border weight</div>
                <SegmentedControl aria-label="Border weight"
                  options={[{value:'hairline',label:'Hairline'},{value:'regular',label:'Regular'},{value:'thick',label:'Thick'}]}
                  value={tokens.surfaces?.borderWeight ?? 'regular'}
                  onChange={v => patchSurfaces({ borderWeight: v })}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.textMuted, fontFamily: FONT, marginBottom: 5 }}>Elevation model</div>
                <SegmentedControl aria-label="Elevation model"
                  options={[{value:'flat',label:'Flat'},{value:'layered',label:'Layered'},{value:'floating',label:'Floating'}]}
                  value={tokens.surfaces?.elevation ?? 'layered'}
                  onChange={v => patchSurfaces({ elevation: v })}
                />
              </div>
            </Section>

          </div>

          {/* Version history */}
          <AnimatePresence>
            {showHistory && versions.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 12, borderRadius: 10, border: `1px solid ${P.border}`, overflow: 'hidden', background: '#fff' }}>
                {compareSelect && (
                  <div style={{ padding: '7px 12px', fontSize: 10, color: P.accent, fontFamily: '"Geist Mono",monospace', borderBottom: `1px solid ${P.border}`, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>✦ Select a second version to compare</span>
                    <button onClick={onCancelCompare} style={{ border: 'none', background: 'none', color: P.textMuted, cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                )}
                {versions.map(v => {
                  const isSelected = compareSelect === v.id;
                  return (
                    <div key={v.id}
                      aria-label={`Version ${v.label}, saved at ${v.ts}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${P.border}`, background: isSelected ? P.accentSoft : 'transparent', transition: 'background .12s' }}>
                      <div aria-hidden="true" style={{ display: 'flex', gap: 2 }}>
                        {v.swatches.map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                      </div>
                      <span style={{ fontSize: 10, color: isSelected ? P.accent : P.textMuted, fontFamily: '"Geist Mono",monospace', flex: 1 }}>{v.label} · {v.ts}</span>
                      <button className="ds-btn" onClick={() => onSelectForCompare(v)}
                        style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, border: `1px solid ${isSelected ? P.accent : P.border}`, background: isSelected ? P.accentSoft : 'transparent', color: isSelected ? P.accent : P.textMuted, cursor: 'pointer' }}>
                        {isSelected ? '✓ A' : '⇄'}
                      </button>
                      <button className="ds-btn" onClick={() => onRestoreVersion(v)}
                        style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, border: `1px solid ${P.border}`, background: 'transparent', color: P.textMuted, cursor: 'pointer' }}>
                        Restore
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ height: 16 }} aria-hidden="true" />
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 12px 12px', borderTop: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0, background: '#fafaf9' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <motion.button className="ds-btn" onClick={onRegenerate} whileTap={{ scale: .97 }}
              aria-label="Regenerate (Space)"
              style={{ flex: 1, padding: '7px 8px', borderRadius: 8, border: `1px solid ${P.border}`, background: '#fff', color: P.text, fontSize: 11, cursor: 'pointer', fontFamily: FONT, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background .12s', letterSpacing: '-0.01em' }}>
              ↺ Regenerate
            </motion.button>
            <button className="ds-btn" onClick={onRunEvolution} title="Generate 3 evolution variants"
              style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${P.accentBorder}`, background: P.accentSoft, color: P.accent, fontSize: 11, cursor: 'pointer', fontFamily: FONT, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              ⟳
            </button>
            <button className="ds-btn" onClick={() => { onSaveVersion(); onSetShowHistory(true); }} title="Save version (⌘S)"
              style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${showHistory ? P.accentBorder : P.border}`, background: showHistory ? P.accentSoft : '#fff', color: showHistory ? P.accent : P.textMuted, fontSize: 11, cursor: 'pointer', fontFamily: FONT, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              Save {versions.length > 0 && <span style={{ fontSize: 9, color: showHistory ? P.accent : P.textDim, fontFamily: '"Geist Mono",monospace', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3 }}>{versions.length}</span>}
            </button>
          </div>
          <motion.button className="ds-btn" onClick={onShowExport} whileTap={{ scale: .97 }}
            aria-label="Open export modal (⌘E)"
            style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', background: '#1a1814', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: FONT, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, letterSpacing: '-0.01em' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v7M2 6l3.5 3.5L9 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export System
            <kbd style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: '"Geist Mono",monospace', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.15)' }}>⌘E</kbd>
          </motion.button>
          {/* Gap #32: Import tokens */}
          {onImportTokens && <ImportTokensRow onImport={onImportTokens} />}
          {/* Gap #8: Clear saved data */}
          {onClearData && (
            <button onClick={onClearData}
              style={{ width:'100%', padding:'5px', background:'transparent', border:'none', cursor:'pointer', fontSize:10, color:P.textDim, fontFamily:FONT, textAlign:'center', transition:'color .12s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = P.textDim}
            >
              Clear saved data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
