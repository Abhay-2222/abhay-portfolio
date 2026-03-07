/**
 * DesignSystemBuilder.jsx
 * Dark left panel · platform picker · font categories · scrollable · accessible
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewCanvas from './PreviewCanvas';
import ExportModal from './ExportModal';
import VersionCompare from './VersionCompare';
import { extractPaletteFromColor } from './brandImport';
import {
  FONT_CATEGORIES, DISPLAY_FONTS, BODY_FONTS, MONO_FONTS,
  PRESETS, PRESET_KEYS, PLATFORMS, PLATFORM_KEYS,
  SHAPE_RADIUS, SCALE_NAMES,
  loadGoogleFont, getHarmonyHues, generateShades,
  regenerateTokens, applyPreset,
  computeTokens,
  exportCSS, exportTailwind, exportDesignTokensJSON, exportReactComponents,
  encodeTokensToURL, decodeTokensFromURL,
  parseAIPromptToTokenAdjustments,
  computeVibeScore, generateSystemName,
  generateEvolution,
} from './dsEngine';

/* ─────────────────────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────────────────────── */
const DEFAULT_TOKENS = {
  colors:     { baseHue:220, saturation:70, harmony:'complementary', count:3, colorSlotHues:{} },
  typography: { display:'Playfair Display', body:'DM Sans', mono:'DM Mono', scale:1.333, baseSize:16 },
  spacing:    { base:8, scale:'linear' },
  shape:      'soft',
  shadows:    'soft',
  preset:     'minimal',
  platform:   'web',
};
const DEFAULT_LOCKS = { colors:false, colorSlots:{}, typography:false, spacing:false, shape:false, shadows:false };

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — dark sidebar
───────────────────────────────────────────────────────── */
const P = {
  bg:           '#191919',
  bgCard:       '#232323',
  bgHover:      '#2a2a2a',
  border:       '#303030',
  borderStrong: '#484848',
  text:         '#e2e2e2',
  textMuted:    '#888888',
  textDim:      '#555555',
  accent:       '#c8602a',
  accentSoft:   'rgba(200,96,42,0.14)',
  accentBorder: 'rgba(200,96,42,0.45)',
  focusRing:    '0 0 0 2px #191919, 0 0 0 4px #c8602a',
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
    .ds-panel-scroll { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent; }
    .ds-panel-scroll::-webkit-scrollbar { width:4px; }
    .ds-panel-scroll::-webkit-scrollbar-track { background:transparent; }
    .ds-panel-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
    .ds-panel-scroll::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
    .ds-btn:focus-visible { outline:none; box-shadow:0 0 0 2px #191919, 0 0 0 4px #c8602a; }
    .ds-input:focus { outline:none; box-shadow:0 0 0 2px #191919, 0 0 0 4px #c8602a; }
    .ds-select:focus { outline:none; box-shadow:0 0 0 2px #191919, 0 0 0 4px #c8602a; }
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
      boxShadow: locked ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
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
   COLOR SECTION
───────────────────────────────────────────────────────── */
const HARMONY_OPTS = [
  { value:'mono',          label:'Mono'    },
  { value:'analogous',     label:'Analog'  },
  { value:'complementary', label:'Comp'    },
  { value:'triadic',       label:'Triadic' },
  { value:'split',         label:'Split'   },
];

function ColorSection({ colors, locks, onChange, onLockSlot }) {
  const hues = getHarmonyHues(colors.baseHue, colors.harmony, colors.count);
  return (
    <>
      <SliderRow id="hue-slider" label="Hue" min={0} max={359} value={colors.baseHue} onChange={v=>onChange({ baseHue:v })} unit="°"
        gradient="linear-gradient(to right,hsl(0,70%,50%),hsl(60,70%,50%),hsl(120,70%,50%),hsl(180,70%,50%),hsl(240,70%,50%),hsl(300,70%,50%),hsl(360,70%,50%))"
      />
      <SliderRow id="sat-slider" label="Sat" min={0} max={100} value={colors.saturation} onChange={v=>onChange({ saturation:v })} unit="%"
        gradient={`linear-gradient(to right,hsl(${colors.baseHue},0%,50%),hsl(${colors.baseHue},100%,50%))`}
      />
      <div>
        <span id="harmony-label" style={{ fontSize:9,color:P.textMuted,fontFamily:'"Geist Mono",monospace',display:'block',marginBottom:5,letterSpacing:'0.04em' }}>HARMONY</span>
        <PillGroup aria-label="Colour harmony mode" options={HARMONY_OPTS} value={colors.harmony} onChange={v=>onChange({ harmony:v })} />
      </div>
      <SliderRow id="count-slider" label="Count" min={1} max={6} step={1} value={colors.count} onChange={v=>onChange({ count:v })} />

      {/* Per-slot palette strips */}
      <div>
        <span style={{ fontSize:9,color:P.textMuted,fontFamily:'"Geist Mono",monospace',display:'block',marginBottom:6,letterSpacing:'0.04em' }}>PALETTE</span>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {hues.map((hue,i) => {
            const slotHue = (colors.colorSlotHues?.[i] != null) ? colors.colorSlotHues[i] : hue;
            const shades  = generateShades(slotHue, colors.saturation);
            const locked  = colors.colorSlotHues?.[i] != null && (locks.colorSlots?.[i] ?? false);
            return (
              <div key={i} style={{ display:'flex',flexDirection:'column',gap:3,alignItems:'center' }}>
                {/* 5-shade strip */}
                <div style={{ display:'flex',borderRadius:4,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}>
                  {[200,400,500,700,900].map(k => (
                    <div key={k} style={{ width:14,height:32,background:shades[k] }} title={`${k}: ${shades[k]}`}/>
                  ))}
                </div>
                {/* Slot lock */}
                <button className="ds-btn"
                  onClick={() => onLockSlot(i, !locks.colorSlots?.[i])}
                  aria-label={`${locks.colorSlots?.[i]?'Unlock':'Lock'} colour ${i+1}`}
                  aria-pressed={locks.colorSlots?.[i]??false}
                  style={{
                    width:22,height:14,borderRadius:3,border:'none',cursor:'pointer',
                    background: locks.colorSlots?.[i] ? P.accent : P.border,
                    fontSize:7,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
                  }}>
                  {locks.colorSlots?.[i] ? '🔒' : '○'}
                </button>
                {/* Hue nudge */}
                <input type="range" min={0} max={359} value={slotHue}
                  aria-label={`Hue for colour slot ${i+1}`}
                  onChange={e => onChange({ colorSlotHues:{ ...colors.colorSlotHues, [i]:+e.target.value } })}
                  className="ds-input"
                  style={{ width:70,height:3,accentColor:`hsl(${slotHue},70%,55%)`,cursor:'pointer' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
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

  // Load fonts on change
  useEffect(() => {
    loadGoogleFont(tokens.typography.display);
    loadGoogleFont(tokens.typography.body);
    loadGoogleFont(tokens.typography.mono);
  }, [tokens.typography.display, tokens.typography.body, tokens.typography.mono]);

  // Keyboard shortcuts (Task 8.4)
  const regenerate = useCallback(() => setTokens(p => regenerateTokens(p, locks)), [locks]);
  const aiInputRef = useRef(null);

  const toggleLock     = key => setLocks(p => ({ ...p, [key]:!p[key] }));
  const toggleSlotLock = (i,v) => setLocks(p => ({ ...p, colorSlots:{ ...p.colorSlots, [i]:v } }));
  const patchColors    = patch => setTokens(p => ({ ...p, colors:{ ...p.colors, ...patch } }));
  const patchTypo      = patch => setTokens(p => ({ ...p, typography:{ ...p.typography, ...patch } }));
  const patchSpacing   = patch => setTokens(p => ({ ...p, spacing:{ ...p.spacing, ...patch } }));
  const setPlatform    = val   => setTokens(p => ({ ...p, platform:val }));

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

  const currentPlatform = tokens.platform ?? 'web';

  // ── System naming (Task 8.6) ──
  const autoName = useMemo(() => generateSystemName(tokens), [tokens.colors.baseHue, tokens.colors.saturation, tokens.shape, tokens.shadows]);
  const [systemName,    setSystemName]    = useState(() => tokens.systemName ?? autoName);
  const [editingName,   setEditingName]   = useState(false);
  const [nameDraft,     setNameDraft]     = useState('');
  // Keep systemName in tokens so it exports correctly
  useEffect(() => {
    setTokens(p => ({ ...p, systemName }));
  }, [systemName]);

  // ── Vibe score (Task 8.3) ──
  const vibe = useMemo(() => computeVibeScore(tokens), [tokens.colors.saturation, tokens.shape, tokens.shadows, tokens.colors.harmony, tokens.typography?.scale, tokens.colors.baseHue]);

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
      if (e.key === 'l' || e.key === 'L') setLocks({ colors:true, colorSlots:{}, typography:true, spacing:true, shape:true, shadows:true });
      if (e.key === 'u' || e.key === 'U') setLocks(DEFAULT_LOCKS);
      // ⌘K — focus AI prompt
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); aiInputRef.current?.focus(); }
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
    const adj = extractPaletteFromColor(brandHex);
    if (!adj) return;
    setTokens(prev => {
      const next = { ...prev };
      if (!locks.colors)   next.colors   = { ...prev.colors,   ...adj.colors   };
      if (!locks.shape)    next.shape    = adj.shape;
      if (!locks.shadows)  next.shadows  = adj.shadows;
      return next;
    });
    setBrandPreview(adj._extracted);
  }, [brandHex, locks]);

  // ── AI prompt state (Task 4.1 + 4.3) ──
  const [aiPrompt,    setAiPrompt]    = useState('');
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiToast,     setAiToast]     = useState('');
  const [promptHistory, setPromptHistory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ds-ai-history') ?? '[]'); } catch { return []; }
  });

  const AI_PLACEHOLDERS = [
    'Make this feel like Stripe…',
    'Accessible enterprise dashboard',
    'Dark, editorial, luxury brand',
    'Playful fintech for Gen Z',
    'Minimal SaaS, lots of white space',
    'Bold brutalist startup',
  ];
  const [aiPlaceholderIdx, setAiPlaceholderIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAiPlaceholderIdx(i => (i+1) % AI_PLACEHOLDERS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const applyAIPrompt = useCallback((text) => {
    if (!text.trim()) return;
    setAiLoading(true);
    // Simulate brief processing delay for UX
    setTimeout(() => {
      const adj = parseAIPromptToTokenAdjustments(text);
      setTokens(prev => {
        const next = { ...prev };
        if (adj.colors     && !locks.colors)     next.colors     = { ...prev.colors,     ...adj.colors     };
        if (adj.typography && !locks.typography)  next.typography = { ...prev.typography, ...adj.typography };
        if (adj.spacing    && !locks.spacing)     next.spacing    = { ...prev.spacing,    ...adj.spacing    };
        if (adj.shape      && !locks.shape)       next.shape      = adj.shape;
        if (adj.shadows    && !locks.shadows)     next.shadows    = adj.shadows;
        return next;
      });
      // Save to history (deduplicated, max 5)
      setPromptHistory(prev => {
        const next = [text, ...prev.filter(h => h !== text)].slice(0,5);
        try { sessionStorage.setItem('ds-ai-history', JSON.stringify(next)); } catch {}
        return next;
      });
      setAiLoading(false);
      setAiToast('✦ System updated');
      setTimeout(() => setAiToast(''), 2200);
    }, 320);
  }, [locks, setTokens]);

  return (
    <div style={{ width:'100%',height:'100%',display:'flex',flexDirection: isMobileLayout ? 'column' : 'row',overflow:'hidden',background:P.bg,fontFamily:'"Geist Sans",system-ui,sans-serif' }}>
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

          {/* System name + vibe */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:18 }}>
            {editingName ? (
              <input autoFocus value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={() => { if (nameDraft.trim()) setSystemName(nameDraft.trim()); setEditingName(false); }}
                onKeyDown={e => { if (e.key==='Enter') { if (nameDraft.trim()) setSystemName(nameDraft.trim()); setEditingName(false); } if (e.key==='Escape') setEditingName(false); }}
                style={{ flex:1, background:'transparent', border:'none', borderBottom:`1.5px solid ${P.accent}`, color:P.text, fontSize:15, fontWeight:700, fontFamily:'"Geist Sans",system-ui', outline:'none', padding:'2px 0' }}/>
            ) : (
              <button onClick={() => { setNameDraft(systemName); setEditingName(true); }}
                style={{ background:'none', border:'none', color:P.text, fontSize:15, fontWeight:700, fontFamily:'"Geist Sans",system-ui', cursor:'text', padding:0, textAlign:'left', flex:1 }}>
                {systemName}
              </button>
            )}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0 }}>
              <span style={{ fontSize:13 }}>{vibe.emojis.join('')}</span>
              <span style={{ fontSize:9, color:P.textMuted, fontFamily:'"Geist Mono",monospace', whiteSpace:'nowrap' }}>{vibe.label}</span>
            </div>
          </div>

          {/* AI Prompt */}
          <div role="search" aria-label="AI design prompt" style={{ marginBottom:16, position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
              <span style={{ fontSize:10, color:P.accent, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', fontWeight:700 }}>✦ AI</span>
              <span style={{ fontSize:10, color:P.textDim, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em' }}>PROMPT</span>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <input
                ref={aiInputRef}
                id="ds-ai-prompt"
                aria-label="Describe your design system aesthetic"
                className="ds-input"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); applyAIPrompt(aiPrompt); setAiPrompt(''); } }}
                placeholder={AI_PLACEHOLDERS[aiPlaceholderIdx]}
                style={{
                  flex:1, padding:'8px 11px', borderRadius:8, fontSize:12,
                  border:`1px solid ${aiLoading ? P.accent : P.border}`,
                  background:P.bgCard, color:P.text,
                  fontFamily:'"Geist Sans",system-ui',
                  boxShadow: aiLoading ? `0 0 0 2px ${P.accentBorder}` : '0 1px 3px rgba(0,0,0,0.06)',
                  transition:'border-color .2s, box-shadow .2s',
                  outline:'none',
                }}
              />
              <button className="ds-btn"
                onClick={() => { applyAIPrompt(aiPrompt); setAiPrompt(''); }}
                disabled={aiLoading || !aiPrompt.trim()}
                aria-label="Apply AI prompt"
                style={{
                  width:34, height:34, borderRadius:8, border:`1px solid ${P.border}`,
                  background:P.accentSoft, color:P.accent, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0,
                  opacity:!aiPrompt.trim() ? 0.4 : 1, transition:'opacity .15s',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
                }}>
                {aiLoading ? <span style={{ display:'inline-block', width:11, height:11, border:`1.5px solid ${P.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'pc-spin 0.6s linear infinite' }}/> : '✦'}
              </button>
            </div>
            {promptHistory.length > 0 && (
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:7 }}>
                {promptHistory.map((h, i) => (
                  <motion.button key={h}
                    initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i*0.05 }}
                    onClick={() => applyAIPrompt(h)}
                    className="ds-btn"
                    style={{ padding:'3px 9px', borderRadius:5, border:`1px solid ${P.border}`, background:P.bgCard, color:P.textMuted, fontSize:10, cursor:'pointer', fontFamily:'"Geist Sans",system-ui', whiteSpace:'nowrap', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
                    {h.length > 20 ? h.slice(0,20)+'…' : h}
                  </motion.button>
                ))}
              </div>
            )}
            <AnimatePresence>
              {aiToast && (
                <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ position:'absolute', bottom:-22, left:0, fontSize:11, color:P.accent, fontFamily:'"Geist Sans",system-ui', fontWeight:500, zIndex:10 }}>
                  {aiToast}
                </motion.div>
              )}
            </AnimatePresence>
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

          {/* Platform */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:P.textMuted, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', marginBottom:8 }}>PLATFORM</div>
            <div role="group" aria-label="Target platform" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {PLATFORM_KEYS.map(key => {
                const plat=PLATFORMS[key], active=currentPlatform===key;
                return (
                  <button key={key} className="ds-btn"
                    onClick={() => setPlatform(key)}
                    aria-pressed={active}
                    title={plat.description}
                    style={{
                      padding:'8px 10px', borderRadius:8, cursor:'pointer',
                      border:`1px solid ${active?P.accent:P.border}`,
                      background:active?P.accentSoft:P.bgCard,
                      color:active?P.accent:P.text,
                      fontSize:11, fontFamily:'"Geist Sans",system-ui',
                      fontWeight:active?600:400,
                      display:'flex', alignItems:'center', gap:6,
                      transition:'all .12s',
                      boxShadow:active?'none':'0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                    <span aria-hidden="true">{plat.icon}</span>
                    <span>{plat.label}</span>
                  </button>
                );
              })}
            </div>
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
              <ColorSection colors={tokens.colors} locks={locks} onChange={patchColors} onLockSlot={toggleSlotLock} />
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
              width:'100%', padding:'9px', borderRadius:8,
              border:'none', background:P.accent, color:'#fff',
              fontSize:12, cursor:'pointer',
              fontFamily:'"Geist Sans",system-ui', fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              transition:'opacity .12s',
            }}>
            ↑ Export
            <kbd style={{ fontSize:9, color:'rgba(255,255,255,0.65)', fontFamily:'"Geist Mono",monospace', background:'rgba(0,0,0,0.18)', padding:'1px 5px', borderRadius:3, border:'1px solid rgba(255,255,255,0.2)' }}>⌘E</kbd>
          </motion.button>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'2px 10px' }}>
            {[['Space','Shuffle'],['L','Lock'],['U','Unlock'],['⌘K','AI'],['⌘E','Export'],['⌘S','Save']].map(([k,v]) => (
              <span key={k} style={{ fontSize:9, color:P.textDim, fontFamily:'"Geist Mono",monospace', display:'flex', gap:3, alignItems:'center' }}>
                <kbd style={{ background:P.bgCard, padding:'1px 4px', borderRadius:3, border:`1px solid ${P.border}`, fontSize:8 }}>{k}</kbd>
                {v}
              </span>
            ))}
          </div>
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
                        {palette.slice(0, vTokens.colors.count).map((shadeMap, ci) => (
                          <div key={ci}>
                            <div style={{ fontSize:8, color:P.textDim, fontFamily:'"Geist Mono",monospace', marginBottom:4 }}>
                              Color {ci + 1} · H{Math.round(getHarmonyHues(vTokens.colors.baseHue, vTokens.colors.harmony, vTokens.colors.count)[ci] ?? vTokens.colors.baseHue)}°
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
                            ['Harmony', vTokens.colors.harmony],
                            ['Sat',     vTokens.colors.saturation + '%'],
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
