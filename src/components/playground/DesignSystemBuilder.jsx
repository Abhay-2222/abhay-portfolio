/**
 * DesignSystemBuilder.jsx
 * Dark left panel · platform picker · font categories · scrollable · accessible
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExportModal from './ExportModal';
import VersionCompare from './VersionCompare';
import SplashScreen from './SplashScreen';
import DSTopBar from './DSTopBar';
import DSLeftNav from './DSLeftNav';
import DSMainContent from './DSMainContent';
import DSConfigPanel from './DSConfigPanel';
import DSMobileLayout from './DSMobileLayout';
import { buildScopedVars } from './PreviewCanvas';
import {
  FONT_CATEGORIES, DISPLAY_FONTS, BODY_FONTS, MONO_FONTS,
  PRESETS, PRESET_KEYS,
  SHAPE_RADIUS, SCALE_NAMES,
  loadGoogleFont,
  regenerateTokens, applyPreset,
  computeTokens,
  generateHarmoniousSwatch, generateHarmonyColors,
  exportCSS, exportTailwind, exportDesignTokensJSON, exportReactComponents,
  encodeTokensToURL, decodeTokensFromURL,
  generateEvolution,
  auditTokens,
} from './dsEngine';

/* ─────────────────────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────────────────────── */
const DEFAULT_TOKENS = {
  colors: {
    swatches: [
      { hex: '#4f46e5', locked: false },  // primary  — indigo
      { hex: '#0ea5e9', locked: false },  // secondary — sky blue
      { hex: '#8b5cf6', locked: false },  // tertiary  — violet
      { hex: '#f59e0b', locked: false },  // accent    — amber
    ],
    harmony: 'complementary',
    saturationBoost: 0,
    semantic: { success: null, warning: null, error: null, info: null }, // Gap #9: custom semantic colors
  },
  typography: {
    display: 'Playfair Display', body: 'DM Sans', mono: 'DM Mono',
    scale: 1.333, baseSize: 16,
    displayWeight: 700, bodyWeight: 400,
    letterSpacing: 'normal', lineHeight: 'normal',
  },
  spacing:    { base: 8, scale: 'linear' },
  shape:      'soft',
  shadows:    'soft',
  preset:     'minimal',
  platform:   'web',
  density:    'regular',
  motion:     { duration: 'balanced', easing: 'ease' },
  surfaces:   { borderWeight: 'regular', elevation: 'layered' },
};
const DEFAULT_LOCKS = { colors:false, typography:false, spacing:false, shape:false, shadows:false, density:false, motion:false, surfaces:false };

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — light sidebar
───────────────────────────────────────────────────────── */
const P = {
  bg:           '#ffffff',
  bgCard:       '#f7f6f5',
  bgHover:      '#f0efee',
  border:       'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.13)',
  text:         '#1a1814',
  textMuted:    'rgba(0,0,0,0.45)',
  textDim:      'rgba(0,0,0,0.28)',
  accent:       '#c8602a',
  accentSoft:   'rgba(200,96,42,0.08)',
  accentBorder: 'rgba(200,96,42,0.30)',
  focusRing:    '0 0 0 2px #fff, 0 0 0 4px #c8602a',
};

/* ─────────────────────────────────────────────────────────
   INJECT SCROLLBAR + FOCUS STYLES  (once)
───────────────────────────────────────────────────────── */
let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    .ds-panel-scroll { scrollbar-width:thin; scrollbar-color:rgba(0,0,0,0.1) transparent; }
    .ds-panel-scroll::-webkit-scrollbar { width:4px; }
    .ds-panel-scroll::-webkit-scrollbar-track { background:transparent; }
    .ds-panel-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.1); border-radius:4px; }
    .ds-panel-scroll::-webkit-scrollbar-thumb:hover { background:rgba(0,0,0,0.18); }
    .ds-btn:focus-visible { outline:none; box-shadow:0 0 0 2px #fff, 0 0 0 4px #c8602a; }
    .ds-input:focus { outline:none; box-shadow:0 0 0 2px #fff, 0 0 0 4px #c8602a; }
    .ds-select:focus { outline:none; box-shadow:0 0 0 2px #fff, 0 0 0 4px #c8602a; }
    @keyframes pc-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────────────────── */

function Divider({ label }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:8,margin:'4px 0 2px' }}>
      {label && <span style={{ fontSize:8,color:P.textDim,fontFamily:'"Geist Mono",monospace',letterSpacing:'0.08em',flexShrink:0 }}>{label}</span>}
      <div style={{ flex:1,height:1,background:P.border }}/>
    </div>
  );
}

function Section({ title, locked, onLockToggle, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div role="region" aria-label={title} style={{
      borderRadius:10, overflow:'hidden',
      border:`1px solid ${locked ? P.accentBorder : P.border}`,
      background: locked ? 'rgba(200,96,42,0.03)' : P.bgCard,
      boxShadow: locked ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
      transition:'border .2s,background .2s,box-shadow .2s',
    }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 12px' }}>
        <button
          className="ds-btn"
          onClick={() => setOpen(o=>!o)}
          aria-expanded={open}
          style={{
            flex:1,background:'transparent',border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',gap:7,
            padding:0, textAlign:'left',
          }}>
          <motion.span animate={{ rotate:open?90:0 }} transition={{ duration:.15 }}
            style={{ fontSize:8,color:P.textDim,display:'inline-block',flexShrink:0 }}>▶</motion.span>
          <span style={{ fontSize:12,fontWeight:600,color:locked?P.accent:P.text,letterSpacing:'0.01em',fontFamily:'"Geist Sans",system-ui',transition:'color .2s' }}>
            {title}
          </span>
        </button>
        <button
          className="ds-btn"
          onClick={onLockToggle}
          aria-label={locked ? `Unlock ${title}` : `Lock ${title}`}
          aria-pressed={locked}
          style={{
            padding:'2px 9px',borderRadius:20,flexShrink:0,
            border:`1px solid ${locked ? P.accent : P.borderStrong}`,
            background: locked ? P.accent : 'transparent',
            color: locked ? '#fff' : P.textDim,
            fontSize:9,cursor:'pointer',
            fontFamily:'"Geist Mono",monospace',
            letterSpacing:'0.05em',
            transition:'all .15s',
          }}>
          {locked ? '⊗ locked' : 'lock'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:.15 }} style={{ overflow:'hidden' }}>
            <div style={{ padding:'0 12px 14px',display:'flex',flexDirection:'column',gap:10 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillGroup({ options, value, onChange, 'aria-label':ariaLabel }) {
  return (
    <div role="group" aria-label={ariaLabel} style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
      {options.map(opt => {
        const v = opt.value ?? opt, l = opt.label ?? opt;
        const active = v === value;
        return (
          <button key={String(v)} className="ds-btn"
            onClick={() => onChange(v)}
            aria-pressed={active}
            style={{
              padding:'5px 11px',borderRadius:6,
              border:`1px solid ${active?P.accent:P.border}`,
              background: active ? P.accent : P.bgCard,
              color: active ? '#fff' : P.text,
              fontSize:11,cursor:'pointer',fontFamily:'"Geist Sans",system-ui',
              fontWeight: active?600:400, transition:'all .12s',
              boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            }}>{l}</button>
        );
      })}
    </div>
  );
}

function SliderRow({ label, min, max, step=1, value, onChange, unit='', gradient, id }) {
  const inputId = id ?? `slider-${label.toLowerCase().replace(/\s+/g,'-')}`;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
      <label htmlFor={inputId} style={{ fontSize:11,color:P.textMuted,fontFamily:'"Geist Sans",system-ui',minWidth:32,flexShrink:0 }}>
        {label}
      </label>
      <div style={{ flex:1,position:'relative',height:20,display:'flex',alignItems:'center' }}>
        {gradient && <div style={{ position:'absolute',left:0,right:0,height:4,borderRadius:2,background:gradient,pointerEvents:'none',zIndex:0 }}/>}
        <input id={inputId} type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}
          aria-valuetext={`${value}${unit}`}
          className="ds-input"
          style={{ width:'100%',height:4,cursor:'pointer',accentColor:P.accent,position:'relative',zIndex:1,background:gradient?'transparent':undefined }}
        />
      </div>
      <span aria-hidden="true" style={{ fontSize:11,color:P.text,fontFamily:'"Geist Mono",monospace',minWidth:36,textAlign:'right',fontWeight:500 }}>
        {value}{unit}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FONT SELECT  with category filter
───────────────────────────────────────────────────────── */
const FONT_ROLE_CATS = {
  display: ['serif','display'],
  body:    ['sans'],
  mono:    ['mono'],
};

function FontSelect({ role, label, value, onChange }) {
  const allowedCats = FONT_ROLE_CATS[role] ?? ['serif','sans','display','mono'];
  const [activeCat, setActiveCat] = useState('all');
  const selectId = `font-${role}`;

  const filteredFonts = activeCat === 'all'
    ? allowedCats.flatMap(c => FONT_CATEGORIES[c]?.fonts ?? [])
    : (FONT_CATEGORIES[activeCat]?.fonts ?? []);

  const catOptions = [{ value:'all', label:'All' }, ...allowedCats.map(c => ({ value:c, label:FONT_CATEGORIES[c].label }))];

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <label htmlFor={selectId} style={{ fontSize:11,color:P.textMuted,fontFamily:'"Geist Sans",system-ui' }}>
          {label}
        </label>
        {catOptions.length > 2 && (
          <div style={{ display:'flex',gap:3 }}>
            {catOptions.map(c => (
              <button key={c.value} className="ds-btn"
                onClick={() => setActiveCat(c.value)}
                aria-pressed={activeCat===c.value}
                style={{
                  padding:'2px 7px',borderRadius:4,border:`1px solid ${activeCat===c.value?P.accent:P.border}`,cursor:'pointer',fontSize:10,
                  background: activeCat===c.value ? P.accent : P.bgCard,
                  color: activeCat===c.value ? '#fff' : P.textMuted,
                  fontFamily:'"Geist Sans",system-ui',transition:'all .1s',
                }}>{c.label}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{ position:'relative' }}>
        <select id={selectId} value={value}
          onChange={e => onChange(e.target.value)}
          className="ds-select"
          style={{
            width:'100%',padding:'7px 28px 7px 10px',borderRadius:6,
            border:`1px solid ${P.border}`,
            background:P.bgCard,
            color:P.text,
            fontFamily:`'${value}',system-ui`,
            fontSize:12,cursor:'pointer',appearance:'none',
            boxShadow:'0 1px 2px rgba(0,0,0,0.35)',
          }}>
          {filteredFonts.map(f => (
            <option key={f} value={f} style={{ fontFamily:`'${f}',system-ui`,background:'#ffffff',color:'#1b1a17' }}>{f}</option>
          ))}
        </select>
        <span aria-hidden="true" style={{ position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:P.textMuted,fontSize:10,pointerEvents:'none' }}>▾</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COPY / EXPORT BUTTON
───────────────────────────────────────────────────────── */
function ExportBtn({ label, icon, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handle = () => { onCopy(); setCopied(true); setTimeout(()=>setCopied(false),1800); };
  return (
    <motion.button className="ds-btn" onClick={handle} whileTap={{ scale:.93 }}
      aria-label={`Copy ${label}`}
      style={{
        flex:1,padding:'6px 4px',borderRadius:5,
        border:`1px solid ${copied?P.accent:P.border}`,
        background: copied ? P.accentSoft : P.bgCard,
        color: copied ? P.accent : P.textMuted,
        fontSize:10,cursor:'pointer',fontFamily:'"Geist Mono",monospace',
        transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:3,
        boxShadow:'0 1px 2px rgba(0,0,0,0.05)',
      }}>
      <span aria-hidden="true">{icon}</span>
      <span>{copied ? '✓' : label}</span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   COOLORS COLOR SECTION
───────────────────────────────────────────────────────── */
function CoolorsColorSection({ colors, onChange }) {
  const swatches = colors?.swatches ?? [];
  const colorRefs = swatches.map(() => null); // populated inline

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

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {swatches.map((s, i) => {
        const pickerRef = { current: null };
        return (
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {/* Color block — click to open native picker */}
            <div style={{ position:'relative', borderRadius:8, overflow:'hidden', height:52, cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}>
              <div style={{ position:'absolute', inset:0, background:s.hex }}
                onClick={() => { const inp = document.getElementById(`swatch-input-${i}`); inp?.click(); }} />
              <input id={`swatch-input-${i}`} type="color" value={s.hex}
                onChange={e => updateSwatch(i, { hex: e.target.value })}
                style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer' }} />
            </div>
            {/* Hex label + actions */}
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <input
                value={s.hex}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateSwatch(i, { hex: v.length === 7 ? v : s.hex });
                }}
                maxLength={7}
                className="ds-input"
                style={{ flex:1, fontSize:11, fontFamily:'"Geist Mono",monospace', color:P.text, background:P.bg, border:`1px solid ${P.border}`, borderRadius:5, padding:'4px 8px', outline:'none' }}
                aria-label={`Swatch ${i+1} hex`}
              />
              <button className="ds-btn"
                onClick={() => updateSwatch(i, { locked: !s.locked })}
                aria-label={s.locked ? `Unlock swatch ${i+1}` : `Lock swatch ${i+1}`}
                aria-pressed={s.locked}
                style={{ width:26, height:26, borderRadius:5, border:`1px solid ${s.locked ? P.accentBorder : P.border}`, background: s.locked ? P.accentSoft : 'transparent', color: s.locked ? P.accent : P.textDim, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {s.locked ? '🔒' : '🔓'}
              </button>
              {swatches.length > 2 && (
                <button className="ds-btn"
                  onClick={() => removeSwatch(i)}
                  aria-label={`Remove swatch ${i+1}`}
                  style={{ width:26, height:26, borderRadius:5, border:`1px solid ${P.border}`, background:'transparent', color:P.textDim, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .1s' }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        );
      })}
      {swatches.length < 6 && (
        <button className="ds-btn" onClick={addSwatch}
          style={{ padding:'7px', borderRadius:7, border:`1px dashed ${P.border}`, background:'transparent', color:P.textMuted, fontSize:11, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all .12s' }}>
          + Add color
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────── */
export default function DesignSystemBuilder() {
  injectStyles();
  const [mobileTab, setMobileTab] = useState('controls'); // 'controls' | 'preview'
  const [isMobileLayout, setIsMobileLayout] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobileLayout(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Gap #8: track whether data was restored from localStorage (set during init)
  const wasRestoredFromLS = useRef(false);
  // Gap #10: track whether the URL share param was present but corrupted
  const urlWasCorrupted = useRef(false);

  // Hydrate: URL params (share link) → localStorage → DEFAULT_TOKENS
  const initial = useRef(() => {
    // 1. URL params — highest priority (explicit share link)
    try {
      const ds = new URLSearchParams(window.location.search).get('ds');
      if (ds) {
        const d = decodeTokensFromURL(ds);
        if (d) return d;
        urlWasCorrupted.current = true; // param exists but decode failed
      }
    } catch { urlWasCorrupted.current = true; }

    // 2. localStorage — persisted session
    try {
      const saved = localStorage.getItem('ds-tokens');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          wasRestoredFromLS.current = true;
          // Deep merge: ensures new DEFAULT keys survive across code updates
          return {
            ...DEFAULT_TOKENS,
            ...parsed,
            colors:    { ...DEFAULT_TOKENS.colors,    ...(parsed.colors    ?? {}) },
            typography:{ ...DEFAULT_TOKENS.typography, ...(parsed.typography ?? {}) },
            spacing:   { ...DEFAULT_TOKENS.spacing,   ...(parsed.spacing    ?? {}) },
            motion:    { ...DEFAULT_TOKENS.motion,    ...(parsed.motion     ?? {}) },
            surfaces:  { ...DEFAULT_TOKENS.surfaces,  ...(parsed.surfaces   ?? {}) },
          };
        }
      }
    } catch {}

    // 3. Defaults
    return DEFAULT_TOKENS;
  });

  const [tokens, setTokens]   = useState(initial.current);
  const [locks,  setLocks]    = useState(DEFAULT_LOCKS);

  // ── Gap #38: Undo / Redo stacks ──
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [undoSize, setUndoSize] = useState(0);
  const [redoSize, setRedoSize] = useState(0);

  /** Wrapped setter that pushes to undo stack before updating */
  const pushTokens = useCallback((newTokensOrUpdater) => {
    setTokens(prev => {
      const next = typeof newTokensOrUpdater === 'function' ? newTokensOrUpdater(prev) : newTokensOrUpdater;
      undoStack.current = [...undoStack.current, prev].slice(-20);
      redoStack.current = [];
      setUndoSize(undoStack.current.length);
      setRedoSize(0);
      return next;
    });
  }, []);
  const [showExport, setShowExport] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('ds-splash-seen'));
  // Gap #8: toast + URL banner states
  const [restoredToast, setRestoredToast] = useState(() => wasRestoredFromLS.current);
  const [urlCorrupted,  setUrlCorrupted]  = useState(() => urlWasCorrupted.current);
  const [shareWarning,  setShareWarning]  = useState(false);

  // ── Docs-site layout state ──
  const [selectedPage, setSelectedPage] = useState('Buttons');
  const [configOpen,   setConfigOpen]   = useState(false);
  const [mode,         setMode]         = useState('light');
  const [systemName,   setSystemName]   = useState('Design System');
  const scopedVars      = useMemo(() => buildScopedVars(tokens, mode), [tokens, mode]);
  const auditErrorCount = useMemo(() => auditTokens(tokens, mode).filter(i => i.level === 'error').length, [tokens, mode]);

  // ── Mobile detection ──
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const isMobile = windowWidth < 768;

  // Gap #8: persist tokens to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('ds-tokens', JSON.stringify(tokens)); } catch {}
  }, [tokens]);

  // Gap #8: auto-dismiss "restored" toast after 3.5s
  useEffect(() => {
    if (!wasRestoredFromLS.current) return;
    const id = setTimeout(() => setRestoredToast(false), 3500);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load fonts on change
  useEffect(() => {
    loadGoogleFont(tokens.typography.display);
    loadGoogleFont(tokens.typography.body);
    loadGoogleFont(tokens.typography.mono);
  }, [tokens.typography.display, tokens.typography.body, tokens.typography.mono]);

  // Gap #38: Undo/Redo keyboard shortcut
  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (!undoStack.current.length) return;
        const prev = undoStack.current[undoStack.current.length - 1];
        undoStack.current = undoStack.current.slice(0, -1);
        setTokens(cur => {
          redoStack.current = [...redoStack.current, cur].slice(-20);
          setUndoSize(undoStack.current.length);
          setRedoSize(redoStack.current.length);
          return prev;
        });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (!redoStack.current.length) return;
        const next = redoStack.current[redoStack.current.length - 1];
        redoStack.current = redoStack.current.slice(0, -1);
        setTokens(cur => {
          undoStack.current = [...undoStack.current, cur].slice(-20);
          setUndoSize(undoStack.current.length);
          setRedoSize(redoStack.current.length);
          return next;
        });
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Keyboard shortcuts
  const regenerate = useCallback(() => pushTokens(p => regenerateTokens(p, locks)), [locks, pushTokens]);

  const toggleLock  = key => setLocks(p => ({ ...p, [key]:!p[key] }));
  const patchColors = patch => pushTokens(p => ({ ...p, colors:{ ...p.colors, ...patch } }));
  const patchTypo      = patch => pushTokens(p => ({ ...p, typography:{ ...p.typography, ...patch } }));
  const patchSpacing   = patch => pushTokens(p => ({ ...p, spacing:{ ...p.spacing, ...patch } }));

  const patchMotion   = patch => pushTokens(p => ({ ...p, motion:   { ...p.motion,   ...patch } }));
  const patchSurfaces = patch => pushTokens(p => ({ ...p, surfaces: { ...p.surfaces, ...patch } }));

  const copyCSS   = () => navigator.clipboard.writeText(exportCSS(tokens)).catch(()=>{});
  const copyTW    = () => navigator.clipboard.writeText(exportTailwind(tokens)).catch(()=>{});
  const copyJSON  = () => navigator.clipboard.writeText(exportDesignTokensJSON(tokens)).catch(()=>{});
  const copyShare = () => {
    const enc = encodeTokensToURL(tokens);
    if (!enc) return;
    const u = new URL(window.location.href);
    u.searchParams.set('pg','1'); u.searchParams.set('ds',enc);
    const shareURL = u.toString();
    // Gap #10: warn if URL may be too long for some browsers
    if (shareURL.length > 4000) {
      setShareWarning(true);
      setTimeout(() => setShareWarning(false), 4000);
    }
    navigator.clipboard.writeText(shareURL).catch(()=>{});
  };

  // Gap #8: clear all persisted data
  const clearSavedData = () => {
    try { localStorage.removeItem('ds-tokens'); localStorage.removeItem('ds-versions'); } catch {}
    setVersions([]);
    setTokens(DEFAULT_TOKENS);
  };

  const SCALE_OPTS = [1.2,1.25,1.333,1.414,1.618].map(v => ({
    value:v, label: v===1.618 ? 'φ' : String(v),
  }));

  // (system name removed — no auto-generated DS names shown in UI)

  // ── Version history (Task 7.1) — Gap #8: use localStorage so versions survive tab close ──
  const [versions, setVersions]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('ds-versions') ?? '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const saveVersion = useCallback(() => {
    setVersions(prev => {
      const { palette } = computeTokens(tokens);
      const v = {
        id: Date.now(),
        label: `v${prev.length + 1}`,
        ts: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
        tokens: JSON.parse(JSON.stringify(tokens)),
        swatches: [0,1,2,3].map(i => palette[i]?.[500] ?? '#888'),
      };
      const next = [v, ...prev].slice(0, 12);
      try { localStorage.setItem('ds-versions', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [tokens]);
  const restoreVersion = useCallback(v => pushTokens(JSON.parse(JSON.stringify(v.tokens))), [pushTokens]);

  // Keyboard shortcuts — placed after copyCSS/saveVersion/showHistory to avoid TDZ
  useEffect(() => {
    const fn = e => {
      const inInput = e.target.closest('input,textarea,select');
      if (e.code === 'Space' && !inInput) { e.preventDefault(); regenerate(); return; }
      if (inInput) return;
      // L — lock all, U — unlock all
      if (e.key === 'l' || e.key === 'L') setLocks({ colors:true, typography:true, spacing:true, shape:true, shadows:true, density:true, motion:true, surfaces:true });
      if (e.key === 'u' || e.key === 'U') setLocks(DEFAULT_LOCKS);
      // ⌘E — open export modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') { e.preventDefault(); setShowExport(true); }
      // ⌘C — copy CSS
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !window.getSelection()?.toString()) { e.preventDefault(); copyCSS(); }
      // ⌘S — save version
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveVersion(); setShowHistory(true); }
      // ⌘, or ⌘K — toggle config panel
      if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.key === 'k')) { e.preventDefault(); setConfigOpen(o => !o); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [regenerate, locks, copyCSS, saveVersion]);

  // ── Version comparison (Task 7.2) ──
  const [compareVersions, setCompareVersions] = useState(null); // [vA, vB] or null
  const [compareSelect, setCompareSelect]     = useState(null); // first selected version id
  const selectForCompare = useCallback((v) => {
    if (!compareSelect) {
      setCompareSelect(v.id);
    } else if (compareSelect === v.id) {
      setCompareSelect(null); // deselect
    } else {
      const vA = versions.find(x => x.id === compareSelect);
      if (vA) { setCompareVersions([vA, v]); setCompareSelect(null); }
    }
  }, [compareSelect, versions]);

  // ── Evolution (Task 7.3) ──
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionVariants, setEvolutionVariants] = useState(null);
  const runEvolution = useCallback(() => {
    const variants = generateEvolution(tokens);
    // Auto-save all 3 as versions
    setVersions(prev => {
      const labels = ['Original', 'Evolved', 'Contrasted'];
      const newVers = variants.map((vTokens, i) => {
        const { palette } = computeTokens(vTokens);
        return {
          id: Date.now() + i,
          label: labels[i],
          ts: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
          tokens: vTokens,
          swatches: [0,1,2,3].map(j => palette[j]?.[500] ?? '#888'),
        };
      });
      const next = [...newVers, ...prev].slice(0, 12);
      try { localStorage.setItem('ds-versions', JSON.stringify(next)); } catch {}
      return next;
    });
    setEvolutionVariants(variants);
    setShowEvolution(true);
  }, [tokens]);



  // ── Mobile render ──
  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        {showSplash && <SplashScreen onClose={() => { sessionStorage.setItem('ds-splash-seen','1'); setShowSplash(false); }} />}
        <DSMobileLayout
          tokens={tokens}
          scopedVars={scopedVars}
          mode={mode}
          auditErrorCount={auditErrorCount}
          onTokenChange={pushTokens}
          onModeToggle={() => setMode(m => m === 'light' ? 'dark' : 'light')}
          onRegenerate={regenerate}
          onShowExport={() => setShowExport(true)}
        />
        {showExport && (
          <ExportModal
            tokens={tokens}
            mode={mode}
            onClose={() => setShowExport(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'#ffffff', fontFamily:'"Geist Sans",system-ui,sans-serif' }}>
      {showSplash && <SplashScreen onClose={() => { sessionStorage.setItem('ds-splash-seen','1'); setShowSplash(false); }} />}

      {/* Gap #10: Corrupted share URL banner */}
      <AnimatePresence>
        {urlCorrupted && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#fef9c3', borderBottom:'1px solid #fde047', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, fontFamily:'"Geist Sans",system-ui', color:'#854d0e', flexShrink:0, zIndex:100 }}>
            <span>⚠ This share link appears corrupted — starting fresh</span>
            <button onClick={() => setUrlCorrupted(false)} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#854d0e', fontSize:16, lineHeight:1, padding:'0 4px' }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gap #10: Share URL length warning */}
      <AnimatePresence>
        {shareWarning && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#fef3c7', borderBottom:'1px solid #fcd34d', padding:'7px 20px', fontSize:11, fontFamily:'"Geist Sans",system-ui', color:'#92400e', flexShrink:0, zIndex:100 }}>
            ⚠ Share URL is long ({'>'}4000 chars) — may not work in some browsers. Consider exporting a JSON file instead.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gap #8: Restored from session toast */}
      <AnimatePresence>
        {restoredToast && (
          <motion.div
            initial={{ opacity:0, y:-16, x:'-50%' }} animate={{ opacity:1, y:0, x:'-50%' }} exit={{ opacity:0, y:-16, x:'-50%' }}
            style={{ position:'fixed', top:56, left:'50%', background:'#1a1814', color:'#fff', borderRadius:8, padding:'8px 16px', fontSize:12, fontFamily:'"Geist Sans",system-ui', zIndex:9999, display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(0,0,0,0.28)', pointerEvents:'none', whiteSpace:'nowrap' }}>
            <span style={{ color:'#c8602a' }}>✦</span> Restored from last session
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <DSTopBar
        systemName={systemName}
        onSystemNameChange={setSystemName}
        selectedPage={selectedPage}
        onNavigate={setSelectedPage}
        mode={mode}
        onModeToggle={() => setMode(m => m === 'light' ? 'dark' : 'light')}
        configOpen={configOpen}
        onConfigToggle={() => setConfigOpen(o => !o)}
        onExport={() => setShowExport(true)}
        auditErrorCount={auditErrorCount}
      />

      {/* ═══════════════ 3-PANEL BODY ═══════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {/* LEFT NAV */}
        <DSLeftNav
          selectedPage={selectedPage}
          onSelect={setSelectedPage}
          auditErrorCount={auditErrorCount}
          systemName={systemName}
        />

        {/* MAIN CONTENT */}
        <DSMainContent
          selectedPage={selectedPage}
          tokens={tokens}
          scopedVars={scopedVars}
          mode={mode}
          onTokenChange={pushTokens}
          onNavigate={setSelectedPage}
        />

        {/* RIGHT CONFIG PANEL */}
        <DSConfigPanel
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          tokens={tokens}
          locks={locks}
          versions={versions}
          showHistory={showHistory}
          compareSelect={compareSelect}
          onTokenChange={pushTokens}
          onClearData={clearSavedData}
          onLocksChange={setLocks}
          onRegenerate={regenerate}
          onRunEvolution={runEvolution}
          onSaveVersion={saveVersion}
          onSetShowHistory={setShowHistory}
          onRestoreVersion={restoreVersion}
          onSelectForCompare={selectForCompare}
          onCancelCompare={() => setCompareSelect(null)}
          onShowExport={() => setShowExport(true)}
          onGenerateHarmony={(harmonyMode) => {
            if (locks.colors) return;
            const primary = tokens.colors.swatches[0]?.hex ?? '#4f46e5';
            const harmColors = generateHarmonyColors(primary, harmonyMode);
            pushTokens(p => ({
              ...p,
              colors: {
                ...p.colors,
                swatches: p.colors.swatches.map((s, i) => {
                  if (s.locked || i === 0) return s;
                  const newHex = harmColors[i - 1];
                  return newHex ? { ...s, hex: newHex } : s;
                }),
              },
            }));
          }}
        />

        {/* Gap #38: Undo / Redo indicator — shown only when stacks have entries */}
        {(undoSize > 0 || redoSize > 0) && (
          <div style={{
            position: 'absolute', bottom: 16, left: 200, zIndex: 50,
            display: 'flex', gap: 4,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 10,
            padding: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <button
              onClick={() => {
                if (!undoStack.current.length) return;
                const prev = undoStack.current[undoStack.current.length - 1];
                undoStack.current = undoStack.current.slice(0, -1);
                setTokens(cur => {
                  redoStack.current = [...redoStack.current, cur].slice(-20);
                  setUndoSize(undoStack.current.length);
                  setRedoSize(redoStack.current.length);
                  return prev;
                });
              }}
              disabled={undoSize === 0}
              title={`Undo (${undoSize}) — Ctrl+Z`}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: undoSize > 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
                color: undoSize > 0 ? '#1a1814' : 'rgba(0,0,0,0.2)',
                cursor: undoSize > 0 ? 'pointer' : 'default',
                fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'system-ui', transition: 'all 0.12s',
              }}>←</button>
            <button
              onClick={() => {
                if (!redoStack.current.length) return;
                const next = redoStack.current[redoStack.current.length - 1];
                redoStack.current = redoStack.current.slice(0, -1);
                setTokens(cur => {
                  undoStack.current = [...undoStack.current, cur].slice(-20);
                  setUndoSize(undoStack.current.length);
                  setRedoSize(redoStack.current.length);
                  return next;
                });
              }}
              disabled={redoSize === 0}
              title={`Redo (${redoSize}) — Ctrl+Shift+Z`}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: redoSize > 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
                color: redoSize > 0 ? '#1a1814' : 'rgba(0,0,0,0.2)',
                cursor: redoSize > 0 ? 'pointer' : 'default',
                fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'system-ui', transition: 'all 0.12s',
              }}>→</button>
          </div>
        )}
      </div>

      {/* ═══════════════ PLACEHOLDER: old left panel (keeps JSX valid during strip) ═══════════════ */}
      {false && (
      <div style={{ display: 'none' }}>

        {/* ── Single unified scroll area ── */}
        <div className="ds-panel-scroll" style={{ flex:1, overflowY:'auto', minHeight:0, padding:'16px 12px 0', display: isMobileLayout && mobileTab !== 'controls' ? 'none' : 'block' }}>


          {/* Style preset */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:P.textDim, fontFamily:'"Geist Sans",system-ui', fontWeight:500, marginBottom:8 }}>Style preset</div>
            <div role="group" aria-label="Design presets" style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {PRESET_KEYS.map(key => {
                const active=tokens.preset===key;
                return (
                  <button key={key} className="ds-btn"
                    onClick={() => setTokens(p => applyPreset(key,p,locks))}
                    aria-pressed={active}
                    style={{
                      padding:'5px 12px', borderRadius:7, cursor:'pointer',
                      border:`1px solid ${active?P.accent:P.border}`,
                      background:active?P.accent:P.bgCard,
                      color:active?'#fff':P.text,
                      fontSize:11, fontFamily:'"Geist Sans",system-ui',
                      fontWeight:active?600:400, transition:'all .12s',
                      boxShadow:active?'none':'0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                    {PRESETS[key].label}
                  </button>
                );
              })}
            </div>
          </div>


          {/* Token sections */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Section title="Colors" locked={locks.colors} onLockToggle={() => toggleLock('colors')}>
              <CoolorsColorSection colors={tokens.colors} onChange={patchColors} />
            </Section>

            <Section title="Typography" locked={locks.typography} onLockToggle={() => toggleLock('typography')}>
              <FontSelect role="display" label="Display" value={tokens.typography.display} onChange={v=>patchTypo({ display:v })} />
              <FontSelect role="body"    label="Body"    value={tokens.typography.body}    onChange={v=>patchTypo({ body:v })} />
              <FontSelect role="mono"    label="Mono"    value={tokens.typography.mono}    onChange={v=>patchTypo({ mono:v })} />
              <div>
                <span style={{ fontSize:11, color:P.textMuted, fontFamily:'"Geist Sans",system-ui', display:'block', marginBottom:6 }}>
                  Scale: {SCALE_NAMES[tokens.typography.scale] ?? ''}
                </span>
                <PillGroup aria-label="Type scale ratio" options={SCALE_OPTS} value={tokens.typography.scale} onChange={v=>patchTypo({ scale:v })} />
              </div>
              <SliderRow id="base-size" label="Base" min={12} max={20} step={1} value={tokens.typography.baseSize} onChange={v=>patchTypo({ baseSize:v })} unit="px" />
            </Section>

            <Section title="Spacing" locked={locks.spacing} onLockToggle={() => toggleLock('spacing')}>
              <div>
                <span style={{ fontSize:11, color:P.textMuted, fontFamily:'"Geist Sans",system-ui', display:'block', marginBottom:6 }}>Base unit</span>
                <PillGroup aria-label="Spacing base unit" options={[{value:4,label:'4px'},{value:8,label:'8px'}]} value={tokens.spacing.base} onChange={v=>patchSpacing({ base:v })} />
              </div>
              <div>
                <span style={{ fontSize:11, color:P.textMuted, fontFamily:'"Geist Sans",system-ui', display:'block', marginBottom:6 }}>Scale type</span>
                <PillGroup aria-label="Spacing scale type" options={[{value:'linear',label:'Linear'},{value:'fibonacci',label:'Fibonacci'}]} value={tokens.spacing.scale} onChange={v=>patchSpacing({ scale:v })} />
              </div>
            </Section>

            <Section title="Shape" locked={locks.shape} onLockToggle={() => toggleLock('shape')}>
              <PillGroup aria-label="Border radius style"
                options={['sharp','soft','rounded','veryRounded','pill'].map(v=>({ value:v, label:{sharp:'Sharp',soft:'Soft',rounded:'Rounded',veryRounded:'V. Round',pill:'Pill'}[v] }))}
                value={tokens.shape} onChange={v=>setTokens(p=>({ ...p,shape:v }))} />
              <div role="presentation" style={{ display:'flex', gap:8, alignItems:'center', paddingTop:2 }}>
                {['sharp','soft','rounded','veryRounded','pill'].map(s => (
                  <div key={s} onClick={() => setTokens(p=>({ ...p,shape:s }))}
                    role="button" tabIndex={0} aria-label={s}
                    onKeyDown={e => e.key==='Enter'&&setTokens(p=>({ ...p,shape:s }))}
                    style={{ width:34, height:24, cursor:'pointer', borderRadius:SHAPE_RADIUS[s], border:`1.5px solid ${tokens.shape===s?P.accent:P.border}`, background:tokens.shape===s?P.accentSoft:P.bgHover, transition:'all .12s', flexShrink:0 }} />
                ))}
              </div>
            </Section>

            <Section title="Shadows" locked={locks.shadows} onLockToggle={() => toggleLock('shadows')}>
              <PillGroup aria-label="Shadow style"
                options={['flat','soft','hard','layered'].map(v=>({ value:v, label:{flat:'Flat',soft:'Soft',hard:'Hard',layered:'Layered'}[v] }))}
                value={tokens.shadows} onChange={v=>setTokens(p=>({ ...p,shadows:v }))} />
              <div role="presentation" style={{ display:'flex', gap:10, paddingTop:4, alignItems:'flex-end' }}>
                {[['flat','none'],['soft','0 4px 12px rgba(0,0,0,0.14)'],['hard','3px 3px 0 rgba(0,0,0,0.22)'],['layered','0 1px 2px rgba(0,0,0,0.07),0 4px 8px rgba(0,0,0,0.09),0 8px 16px rgba(0,0,0,0.06)']].map(([s,shadow]) => (
                  <div key={s} onClick={() => setTokens(p=>({ ...p,shadows:s }))}
                    role="button" tabIndex={0} aria-label={s}
                    onKeyDown={e => e.key==='Enter'&&setTokens(p=>({ ...p,shadows:s }))}
                    style={{ width:36, height:28, cursor:'pointer', borderRadius:5, border:`1.5px solid ${tokens.shadows===s?P.accent:P.border}`, background:tokens.shadows===s?P.accentSoft:P.bgCard, boxShadow:shadow, transition:'all .15s', flexShrink:0 }} />
                ))}
              </div>
            </Section>
          </div>

          {/* Version History */}
          <AnimatePresence>
            {showHistory && versions.length > 0 && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                style={{ marginTop:12, borderRadius:10, border:`1px solid ${P.border}`, overflow:'hidden', background:P.bgCard, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                {compareSelect && (
                  <div style={{ padding:'7px 12px', fontSize:10, color:P.accent, fontFamily:'"Geist Mono",monospace', borderBottom:`1px solid ${P.border}`, background:P.accentSoft, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span>✦ Select a second version to compare</span>
                    <button onClick={() => setCompareSelect(null)} style={{ border:'none', background:'none', color:P.textMuted, cursor:'pointer', fontSize:12 }}>✕</button>
                  </div>
                )}
                {versions.map(v => {
                  const isSelected=compareSelect===v.id;
                  return (
                    <div key={v.id}
                      aria-label={`Version ${v.label}, saved at ${v.ts}`}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderBottom:`1px solid ${P.border}`, background:isSelected?P.accentSoft:'transparent', transition:'background .12s' }}>
                      <div aria-hidden="true" style={{ display:'flex', gap:2 }}>
                        {v.swatches.map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:2, background:c }}/>)}
                      </div>
                      <span style={{ fontSize:10, color:isSelected?P.accent:P.textMuted, fontFamily:'"Geist Mono",monospace', flex:1 }}>{v.label} · {v.ts}</span>
                      <button className="ds-btn" onClick={() => selectForCompare(v)}
                        style={{ fontSize:9, padding:'3px 8px', borderRadius:4, border:`1px solid ${isSelected?P.accent:P.border}`, background:isSelected?P.accentSoft:'transparent', color:isSelected?P.accent:P.textMuted, cursor:'pointer' }}>
                        {isSelected ? '✓ A' : '⇄'}
                      </button>
                      <button className="ds-btn" onClick={() => restoreVersion(v)}
                        style={{ fontSize:9, padding:'3px 8px', borderRadius:4, border:`1px solid ${P.border}`, background:'transparent', color:P.textMuted, cursor:'pointer' }}>
                        Restore
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ height:16 }} aria-hidden="true" />
        </div>

        {/* ── Footer (fixed) ── */}
        <div style={{ padding:'10px 12px', borderTop:`1px solid ${P.border}`, display:'flex', flexDirection:'column', gap:6, flexShrink:0, background:P.bg }}>
          <div style={{ display:'flex', gap:5 }}>
            <motion.button className="ds-btn" onClick={regenerate} whileTap={{ scale:.97 }}
              aria-label="Regenerate all unlocked sections (or press Space)"
              style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${P.border}`, background:P.bgCard, color:P.text, fontSize:11, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background .12s', boxShadow:'0 1px 2px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize:13 }}>↺</span> Regenerate
              <kbd style={{ fontSize:9, color:P.textDim, fontFamily:'"Geist Mono",monospace', background:P.bg, padding:'1px 5px', borderRadius:3, border:`1px solid ${P.border}` }}>space</kbd>
            </motion.button>
            <button className="ds-btn" onClick={runEvolution}
              title="Generate 3 evolution variants"
              style={{ padding:'8px 11px', borderRadius:8, border:`1px solid ${P.accentBorder}`, background:P.accentSoft, color:P.accent, fontSize:11, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', fontWeight:500, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              ⟳ Evolve
            </button>
            <button className="ds-btn" onClick={() => { saveVersion(); setShowHistory(true); }}
              title="Save version (⌘S)"
              style={{ padding:'8px 11px', borderRadius:8, border:`1px solid ${showHistory?P.accentBorder:P.border}`, background:showHistory?P.accentSoft:P.bgCard, color:showHistory?P.accent:P.textMuted, fontSize:11, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', fontWeight:500, display:'flex', alignItems:'center', gap:5, flexShrink:0, boxShadow:'0 1px 2px rgba(0,0,0,0.06)' }}>
              Save
              {versions.length > 0 && <span style={{ fontSize:9, color:showHistory?P.accent:P.textDim, fontFamily:'"Geist Mono",monospace', background:P.bg, padding:'1px 5px', borderRadius:3, border:`1px solid ${P.border}` }}>{versions.length}</span>}
            </button>
          </div>
          <motion.button className="ds-btn" onClick={() => setShowExport(true)} whileTap={{ scale:.97 }}
            aria-label="Open export modal (⌘E)"
            style={{
              width:'100%', padding:'10px', borderRadius:8,
              border:'none', background:P.accent, color:'#fff',
              fontSize:12, cursor:'pointer',
              fontFamily:'"Geist Sans",system-ui', fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              transition:'opacity .12s',
            }}>
            ↑ Export
            <kbd style={{ fontSize:9, color:'rgba(255,255,255,0.55)', fontFamily:'"Geist Mono",monospace', background:'rgba(0,0,0,0.15)', padding:'1px 5px', borderRadius:3, border:'1px solid rgba(255,255,255,0.18)' }}>⌘E</kbd>
          </motion.button>
        </div>
      </div>

      )} {/* end {false && placeholder */}

      {/* ═══════════════ EXPORT MODAL ═══════════════ */}
      <AnimatePresence>
        {showExport && (
          <ExportModal tokens={tokens} onClose={() => setShowExport(false)} />
        )}
      </AnimatePresence>

      {/* ═══════════════ VERSION COMPARE ═══════════════ */}
      <AnimatePresence>
        {compareVersions && (
          <VersionCompare
            vA={compareVersions[0]}
            vB={compareVersions[1]}
            onClose={() => setCompareVersions(null)}
            onApply={v => { restoreVersion(v); setCompareVersions(null); }}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════ EVOLUTION OVERLAY ═══════════════ */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:100 }}>
        <div style={{ width:'100%', height:'100%', position:'relative', pointerEvents:'none' }}>

        {/* ── Evolution Comparison Overlay ── */}
        <AnimatePresence>
          {showEvolution && evolutionVariants && (
            <motion.div
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:20 }}
              transition={{ duration:.25, ease:[0,0,0.2,1] }}
              style={{
                position:'absolute', inset:0,
                background:'rgba(10,10,10,0.88)',
                backdropFilter:'blur(12px)',
                zIndex:50,
                display:'flex', flexDirection:'column',
                fontFamily:'"Geist Sans",system-ui',
                pointerEvents:'auto',
              }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:`1px solid ${P.border}` }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color:P.text }}>⟳ System Evolution</span>
                  <span style={{ fontSize:10, color:P.textMuted, marginLeft:10 }}>3 auto-generated variants, saved to history</span>
                </div>
                <button className="ds-btn" onClick={() => setShowEvolution(false)}
                  style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${P.border}`, background:'transparent', color:P.textMuted, fontSize:11, cursor:'pointer' }}>
                  ✕ Close
                </button>
              </div>
              {/* 3-column grid */}
              <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, overflow:'hidden', background:P.border }}>
                {evolutionVariants.map((vTokens, i) => {
                  const LABELS = ['Original', 'Evolved', 'Contrasted'];
                  const SUBLABELS = ['Current system', 'Shifted personality', 'Contrasted harmony'];
                  const { palette } = computeTokens(vTokens);
                  const shades = [50,100,200,300,400,500,600,700,800,900];
                  const isActive = i === 0;
                  return (
                    <motion.div key={i}
                      initial={{ opacity:0, scale:.97 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ background:P.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                      {/* Column header */}
                      <div style={{ padding:'14px 16px 10px', borderBottom:`1px solid ${P.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, color: isActive ? P.textMuted : P.text }}>
                            {LABELS[i]}
                            {isActive && <span style={{ marginLeft:6, fontSize:8, color:P.textDim, fontFamily:'"Geist Mono",monospace' }}>CURRENT</span>}
                          </div>
                          <div style={{ fontSize:9, color:P.textMuted, marginTop:2, fontFamily:'"Geist Mono",monospace' }}>{SUBLABELS[i]}</div>
                        </div>
                        {!isActive && (
                          <button className="ds-btn"
                            onClick={() => { restoreVersion({ tokens: vTokens }); setShowEvolution(false); }}
                            style={{ padding:'5px 10px', borderRadius:5, border:`1px solid ${P.accent}`, background:P.accentSoft, color:P.accent, fontSize:10, cursor:'pointer', flexShrink:0 }}>
                            Apply
                          </button>
                        )}
                      </div>
                      {/* Palette swatches */}
                      <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:10, overflow:'auto', flex:1 }}>
                        {palette.slice(0, (vTokens.colors?.swatches?.length ?? 4)).map((shadeMap, ci) => (
                          <div key={ci}>
                            <div style={{ fontSize:8, color:P.textDim, fontFamily:'"Geist Mono",monospace', marginBottom:4 }}>
                              Color {ci + 1} · {vTokens.colors?.swatches?.[ci]?.hex ?? ''}
                            </div>
                            <div style={{ display:'flex', gap:2 }}>
                              {shades.map(s => (
                                <div key={s} title={`${s}: ${shadeMap[s]}`}
                                  style={{ flex:1, height:28, borderRadius:3, background:shadeMap[s] ?? '#888', transition:'transform .1s' }}/>
                              ))}
                            </div>
                          </div>
                        ))}
                        {/* Token summary */}
                        <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 12px' }}>
                          {[
                            ['Shape',   vTokens.shape],
                            ['Shadow',  vTokens.shadows],
                            ['Colors',  (vTokens.colors?.swatches?.length ?? 0) + ' swatches'],
                            ['Display', vTokens.typography?.display?.split(' ')[0] ?? '?'],
                            ['Scale',   vTokens.typography?.scale ?? '?'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ display:'flex', flexDirection:'column', gap:1 }}>
                              <span style={{ fontSize:7, color:P.textDim, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.06em' }}>{k.toUpperCase()}</span>
                              <span style={{ fontSize:10, color:P.text, fontFamily:'"Geist Mono",monospace' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                        {/* Shape preview */}
                        <div style={{ display:'flex', gap:6, marginTop:4, alignItems:'center' }}>
                          {['sharp','soft','rounded','veryRounded','pill'].map(s => (
                            <div key={s} style={{
                              width:30, height:20, borderRadius:SHAPE_RADIUS[s],
                              border:`1.5px solid ${vTokens.shape===s ? (palette[0]?.[500]??'#888') : P.border}`,
                              background: vTokens.shape===s ? (palette[0]?.[100]??'transparent') : 'transparent',
                              opacity: vTokens.shape===s ? 1 : 0.3,
                              flexShrink:0,
                            }}/>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
