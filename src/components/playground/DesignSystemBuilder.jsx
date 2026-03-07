/**
 * DesignSystemBuilder.jsx
 * Dark left panel · platform picker · font categories · scrollable · accessible
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewCanvas from './PreviewCanvas';
import ExportModal from './ExportModal';
import VersionCompare from './VersionCompare';
import SplashScreen from './SplashScreen';
import { extractPaletteFromColor } from './brandImport';
import {
  FONT_CATEGORIES, DISPLAY_FONTS, BODY_FONTS, MONO_FONTS,
  PRESETS, PRESET_KEYS,
  SHAPE_RADIUS, SCALE_NAMES,
  loadGoogleFont,
  regenerateTokens, applyPreset,
  computeTokens,
  hexToHsl, generateHarmoniousSwatch,
  exportCSS, exportTailwind, exportDesignTokensJSON, exportReactComponents,
  encodeTokensToURL, decodeTokensFromURL,
  computeVibeScore, generateSystemName,
  generateEvolution,
} from './dsEngine';

/* ─────────────────────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────────────────────── */
const DEFAULT_TOKENS = {
  colors: {
    swatches: [
      { hex: '#4f46e5', locked: false },
      { hex: '#e54f4f', locked: false },
      { hex: '#22c55e', locked: false },
      { hex: '#f59e0b', locked: false },
    ]
  },
  typography: { display:'Playfair Display', body:'DM Sans', mono:'DM Mono', scale:1.333, baseSize:16 },
  spacing:    { base:8, scale:'linear' },
  shape:      'soft',
  shadows:    'soft',
  preset:     'minimal',
  platform:   'web',
};
const DEFAULT_LOCKS = { colors:false, typography:false, spacing:false, shape:false, shadows:false };

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
      background: locked ? 'rgba(200,96,42,0.04)' : P.bgCard,
      boxShadow: locked ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
      transition:'border .2s,background .2s,box-shadow .2s',
    }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 12px' }}>
        <button
          className="ds-btn"
          onClick={onLockToggle}
          aria-label={locked ? `Unlock ${title}` : `Lock ${title}`}
          aria-pressed={locked}
          style={{
            width:22,height:22,borderRadius:5,
            border:`1px solid ${locked ? P.accentBorder : P.border}`,
            flexShrink:0,
            background: locked ? P.accent : 'transparent',
            color: locked ? '#fff' : P.textDim,
            fontSize:11,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            transition:'all .15s',
          }}>
          {locked ? '⊠' : '⊡'}
        </button>
        <button
          className="ds-btn"
          onClick={() => setOpen(o=>!o)}
          aria-expanded={open}
          style={{
            flex:1,background:'transparent',border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:0,
          }}>
          <span style={{ fontSize:12,fontWeight:600,color:locked?P.accent:P.text,letterSpacing:'0.01em',fontFamily:'"Geist Sans",system-ui',transition:'color .2s' }}>
            {title}
          </span>
          <motion.span animate={{ rotate:open?180:0 }} transition={{ duration:.15 }}
            style={{ fontSize:10,color:P.textDim }}>▾</motion.span>
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

  // Hydrate from share URL
  const initial = useRef(() => {
    try {
      const ds = new URLSearchParams(window.location.search).get('ds');
      if (ds) { const d = decodeTokensFromURL(ds); if (d) return d; }
    } catch {}
    return DEFAULT_TOKENS;
  });

  const [tokens, setTokens]   = useState(initial.current);
  const [locks,  setLocks]    = useState(DEFAULT_LOCKS);
  const [showExport, setShowExport] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('ds-splash-seen'));

  // Load fonts on change
  useEffect(() => {
    loadGoogleFont(tokens.typography.display);
    loadGoogleFont(tokens.typography.body);
    loadGoogleFont(tokens.typography.mono);
  }, [tokens.typography.display, tokens.typography.body, tokens.typography.mono]);

  // Keyboard shortcuts
  const regenerate = useCallback(() => setTokens(p => regenerateTokens(p, locks)), [locks]);

  const toggleLock  = key => setLocks(p => ({ ...p, [key]:!p[key] }));
  const patchColors = patch => setTokens(p => ({ ...p, colors:{ ...p.colors, ...patch } }));
  const patchTypo      = patch => setTokens(p => ({ ...p, typography:{ ...p.typography, ...patch } }));
  const patchSpacing   = patch => setTokens(p => ({ ...p, spacing:{ ...p.spacing, ...patch } }));

  const copyCSS   = () => navigator.clipboard.writeText(exportCSS(tokens)).catch(()=>{});
  const copyTW    = () => navigator.clipboard.writeText(exportTailwind(tokens)).catch(()=>{});
  const copyJSON  = () => navigator.clipboard.writeText(exportDesignTokensJSON(tokens)).catch(()=>{});
  const copyShare = () => {
    const enc = encodeTokensToURL(tokens);
    if (!enc) return;
    const u = new URL(window.location.href);
    u.searchParams.set('pg','1'); u.searchParams.set('ds',enc);
    navigator.clipboard.writeText(u.toString()).catch(()=>{});
  };

  const SCALE_OPTS = [1.2,1.25,1.333,1.414,1.618].map(v => ({
    value:v, label: v===1.618 ? 'φ' : String(v),
  }));

  // ── System naming ──
  const autoName = useMemo(() => generateSystemName(tokens), [tokens.colors.swatches?.[0]?.hex, tokens.shape, tokens.shadows]);
  const [systemName,    setSystemName]    = useState(() => tokens.systemName ?? autoName);
  const [editingName,   setEditingName]   = useState(false);
  const [nameDraft,     setNameDraft]     = useState('');
  // Keep systemName in tokens so it exports correctly
  useEffect(() => {
    setTokens(p => ({ ...p, systemName }));
  }, [systemName]);

  // ── Vibe score ──
  const vibe = useMemo(() => computeVibeScore(tokens), [tokens.colors.swatches, tokens.shape, tokens.shadows, tokens.typography?.scale]);

  // ── Version history (Task 7.1) ──
  const [versions, setVersions]       = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ds-versions') ?? '[]'); } catch { return []; }
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
      try { sessionStorage.setItem('ds-versions', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [tokens]);
  const restoreVersion = useCallback(v => setTokens(JSON.parse(JSON.stringify(v.tokens))), []);

  // Keyboard shortcuts — placed after copyCSS/saveVersion/showHistory to avoid TDZ
  useEffect(() => {
    const fn = e => {
      const inInput = e.target.closest('input,textarea,select');
      if (e.code === 'Space' && !inInput) { e.preventDefault(); regenerate(); return; }
      if (inInput) return;
      // L — lock all, U — unlock all
      if (e.key === 'l' || e.key === 'L') setLocks({ colors:true, typography:true, spacing:true, shape:true, shadows:true });
      if (e.key === 'u' || e.key === 'U') setLocks(DEFAULT_LOCKS);
      // ⌘E — open export modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') { e.preventDefault(); setShowExport(true); }
      // ⌘C — copy CSS
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !window.getSelection()?.toString()) { e.preventDefault(); copyCSS(); }
      // ⌘S — save version
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveVersion(); setShowHistory(true); }
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
      try { sessionStorage.setItem('ds-versions', JSON.stringify(next)); } catch {}
      return next;
    });
    setEvolutionVariants(variants);
    setShowEvolution(true);
  }, [tokens]);

  // ── Brand import state (Task 5.2) ──
  const [brandHex,    setBrandHex]    = useState('#c8602a');
  const [brandPreview,setBrandPreview]= useState(null);
  const applyBrandColor = useCallback(() => {
    if (!locks.colors) {
      // Set first swatch to the brand color, keep others
      setTokens(prev => {
        const swatches = (prev.colors?.swatches ?? []).map((s, i) =>
          i === 0 ? { ...s, hex: brandHex } : s
        );
        return { ...prev, colors: { swatches: swatches.length ? swatches : [{ hex: brandHex, locked: false }] } };
      });
    }
    const { h, s, l } = hexToHsl(brandHex);
    setBrandPreview({ h, s, l });
  }, [brandHex, locks]);


  return (
    <div style={{ width:'100%',height:'100%',display:'flex',flexDirection: isMobileLayout ? 'column' : 'row',overflow:'hidden',background:P.bg,fontFamily:'"Geist Sans",system-ui,sans-serif' }}>
      {showSplash && <SplashScreen onClose={() => { sessionStorage.setItem('ds-splash-seen','1'); setShowSplash(false); }} />}
      {/* Mobile tab switcher */}
      {isMobileLayout && (
        <div style={{ display:'flex',borderBottom:`1px solid ${P.border}`,flexShrink:0,background:P.bg }}>
          {[['controls','Controls'],['preview','Preview']].map(([id,label]) => (
            <button key={id} onClick={() => setMobileTab(id)}
              style={{ flex:1,padding:'10px',border:'none',background:'none',color: mobileTab===id ? P.accent : P.textMuted,fontSize:12,fontWeight: mobileTab===id ? 600 : 400,fontFamily:'"Geist Sans",system-ui',cursor:'pointer',borderBottom:`2px solid ${mobileTab===id ? P.accent : 'transparent'}`,transition:'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════ LEFT PANEL ═══════════════ */}
      <div
        role="complementary"
        aria-label="Design system controls"
        style={{
          width: isMobileLayout ? '100%' : 300,
          minWidth: isMobileLayout ? '100%' : 272,
          maxWidth: isMobileLayout ? '100%' : 328,
          height: isMobileLayout ? 'auto' : '100%',
          flex: isMobileLayout ? 'unset' : undefined,
          display: isMobileLayout && mobileTab === 'preview' ? 'none' : 'flex',
          flexDirection:'column',
          background:P.bg,
          borderRight:`1px solid ${P.border}`,
          overflow:'hidden',
        }}>

        {/* ── Single unified scroll area ── */}
        <div className="ds-panel-scroll" style={{ flex:1, overflowY:'auto', minHeight:0, padding:'16px 12px 0', display: isMobileLayout && mobileTab !== 'controls' ? 'none' : 'block' }}>

          {/* System name */}
          <div style={{ marginBottom:16 }}>
            {editingName ? (
              <input autoFocus value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={() => { if (nameDraft.trim()) setSystemName(nameDraft.trim()); setEditingName(false); }}
                onKeyDown={e => { if (e.key==='Enter') { if (nameDraft.trim()) setSystemName(nameDraft.trim()); setEditingName(false); } if (e.key==='Escape') setEditingName(false); }}
                style={{ width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${P.accent}`, color:P.text, fontSize:15, fontWeight:700, fontFamily:'"Geist Sans",system-ui', outline:'none', padding:'2px 0', boxSizing:'border-box' }}/>
            ) : (
              <button onClick={() => { setNameDraft(systemName); setEditingName(true); }}
                style={{ background:'none', border:'none', color:P.text, fontSize:15, fontWeight:700, fontFamily:'"Geist Sans",system-ui', cursor:'text', padding:0, textAlign:'left', width:'100%' }}>
                {systemName}
              </button>
            )}
          </div>

          {/* Brand Color */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:P.textMuted, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', marginBottom:8 }}>BRAND COLOR</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:brandHex, border:`1px solid ${P.border}`, overflow:'hidden', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <input type="color" value={brandHex}
                    onChange={e => { setBrandHex(e.target.value); setBrandPreview(null); }}
                    style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer' }}/>
                </div>
              </div>
              <input className="ds-input" value={brandHex}
                onChange={e => { const v=e.target.value; setBrandHex(v.startsWith('#')?v:'#'+v); setBrandPreview(null); }}
                maxLength={7}
                style={{ flex:1, padding:'7px 10px', borderRadius:8, border:`1px solid ${P.border}`, background:P.bgCard, color:P.text, fontFamily:'"Geist Mono",monospace', fontSize:12, outline:'none', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}/>
              <button className="ds-btn" onClick={applyBrandColor}
                style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${P.accentBorder}`, background:P.accentSoft, color:P.accent, fontSize:11, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', fontWeight:600, flexShrink:0 }}>
                Apply
              </button>
            </div>
            {brandPreview && (
              <motion.div initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }}
                style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                {[['H', brandPreview.h+'°'],['S', brandPreview.s+'%'],['L', brandPreview.l+'%']].map(([k,v]) => (
                  <span key={k} style={{ fontSize:10, fontFamily:'"Geist Mono",monospace', color:P.textMuted, background:P.bgCard, padding:'3px 8px', borderRadius:5, border:`1px solid ${P.border}` }}>{k} {v}</span>
                ))}
              </motion.div>
            )}
          </div>

          {/* Presets */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:10, color:P.textMuted, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', marginBottom:8 }}>PRESET</div>
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
                  Scale — {SCALE_NAMES[tokens.typography.scale] ?? ''}
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
              style={{ padding:'8px 10px', borderRadius:8, border:`1px solid ${P.border}`, background:P.bgCard, color:P.textMuted, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4, boxShadow:'0 1px 2px rgba(0,0,0,0.06)' }}>
              💾
              {versions.length > 0 && <span style={{ fontSize:9, color:P.textDim }}>{versions.length}</span>}
            </button>
            <button className="ds-btn" onClick={() => setShowHistory(h=>!h)}
              style={{ padding:'8px 10px', borderRadius:8, border:`1px solid ${showHistory?P.accent:P.border}`, background:showHistory?P.accentSoft:P.bgCard, color:showHistory?P.accent:P.textMuted, fontSize:11, cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,0.06)' }}>
              {showHistory ? '▲' : '▼'}
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

      {/* ═══════════════ EXPORT MODAL (Task 6.3) ═══════════════ */}
      <AnimatePresence>
        {showExport && (
          <ExportModal tokens={tokens} onClose={() => setShowExport(false)} />
        )}
      </AnimatePresence>

      {/* ═══════════════ VERSION COMPARE (Task 7.2) ═══════════════ */}
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

      {/* ═══════════════ RIGHT PANEL ═══════════════ */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', display: isMobileLayout && mobileTab !== 'preview' ? 'none' : 'flex', flexDirection:'column' }}>
        <PreviewCanvas tokens={tokens} onTokenChange={setTokens} />

        {/* ── Evolution Comparison Overlay (Task 7.3) ── */}
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
              }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:`1px solid ${P.border}` }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color:P.text }}>⟳ System Evolution</span>
                  <span style={{ fontSize:10, color:P.textMuted, marginLeft:10 }}>3 auto-generated variants — saved to history</span>
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
                            ['Display', vTokens.typography?.display?.split(' ')[0] ?? '—'],
                            ['Scale',   vTokens.typography?.scale ?? '—'],
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
  );
}
