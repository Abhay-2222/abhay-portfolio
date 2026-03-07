/**
 * VersionCompare.jsx — Task 7.2
 * Side-by-side comparison of two saved design system versions.
 * Changed tokens highlighted in amber. Enter/exit with GSAP-style Framer animation.
 */

import { useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { computeTokens, SHAPE_RADIUS } from './dsEngine';

const V = {
  bg:      '#0d1117',
  bgCard:  '#161b22',
  bgHover: '#1c2128',
  border:  'rgba(255,255,255,0.1)',
  text:    '#e6edf3',
  muted:   'rgba(230,237,243,0.5)',
  dim:     'rgba(230,237,243,0.22)',
  accent:  '#c8602a',
  accentS: 'rgba(200,96,42,0.15)',
  changed: '#f59e0b',
  changedBg: 'rgba(245,158,11,0.10)',
  pass:    '#3fb950',
};

function diff(a, b) {
  if (a === b) return false;
  if (typeof a !== typeof b) return true;
  if (typeof a === 'object' && a !== null) {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return true;
    return ka.some(k => diff(a[k], b[k]));
  }
  return a !== b;
}

function SwatchRow({ palette, count }) {
  const SHADES = [100, 300, 500, 700, 900];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {palette.slice(0, count).map((shadeMap, i) => (
        <div key={i} style={{ display:'flex', gap:2 }}>
          {SHADES.map(s => (
            <div key={s} style={{
              flex:1, height:20, borderRadius:3,
              background: shadeMap[s] ?? '#888',
              title: `${s}: ${shadeMap[s]}`,
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function TokenRow({ label, valA, valB, changed }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'140px 1fr 1fr',
      gap:8, padding:'5px 10px', borderRadius:5,
      background: changed ? V.changedBg : 'transparent',
      border: `1px solid ${changed ? V.changed + '44' : 'transparent'}`,
      alignItems:'center',
    }}>
      <span style={{ fontSize:9, color: changed ? V.changed : V.dim, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize:10, color: changed ? V.text : V.muted, fontFamily:'"Geist Mono",monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {String(valA ?? '—')}
      </span>
      <span style={{ fontSize:10, color: changed ? V.changed : V.muted, fontFamily:'"Geist Mono",monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {String(valB ?? '—')}
      </span>
    </div>
  );
}

export default function VersionCompare({ vA, vB, onClose, onApply }) {
  const tA = vA.tokens;
  const tB = vB.tokens;

  const { palette: palA } = useMemo(() => computeTokens(tA), [tA]);
  const { palette: palB } = useMemo(() => computeTokens(tB), [tB]);

  // Escape to close
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleBackdrop = useCallback(e => {
    if (e.currentTarget === e.target) onClose();
  }, [onClose]);

  const ROWS = [
    { label: 'Preset',     a: tA.preset,                    b: tB.preset },
    { label: 'Hue',        a: tA.colors.baseHue + '°',      b: tB.colors.baseHue + '°' },
    { label: 'Saturation', a: tA.colors.saturation + '%',   b: tB.colors.saturation + '%' },
    { label: 'Harmony',    a: tA.colors.harmony,            b: tB.colors.harmony },
    { label: 'Palette count',a: tA.colors.count,            b: tB.colors.count },
    { label: 'Display font',a: tA.typography?.display,      b: tB.typography?.display },
    { label: 'Body font',  a: tA.typography?.body,          b: tB.typography?.body },
    { label: 'Type scale', a: tA.typography?.scale,         b: tB.typography?.scale },
    { label: 'Base size',  a: tA.typography?.baseSize + 'px', b: tB.typography?.baseSize + 'px' },
    { label: 'Spacing base', a: tA.spacing?.base + 'px',   b: tB.spacing?.base + 'px' },
    { label: 'Spacing scale',a: tA.spacing?.scale,          b: tB.spacing?.scale },
    { label: 'Shape',      a: tA.shape,                     b: tB.shape },
    { label: 'Shadows',    a: tA.shadows,                   b: tB.shadows },
    { label: 'Platform',   a: tA.platform,                  b: tB.platform },
  ];

  const changedCount = ROWS.filter(r => diff(r.a, r.b)).length;

  return (
    <motion.div
      onClick={handleBackdrop}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:.2 }}
      role="dialog" aria-modal="true" aria-label="Version comparison"
      style={{
        position:'fixed', inset:0, zIndex:9998,
        background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(10px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:24,
        fontFamily:'"Geist Sans",system-ui',
      }}>

      <motion.div
        initial={{ opacity:0, scale:0.95, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:20 }}
        transition={{ duration:.25, ease:[0,0,0.2,1] }}
        style={{
          width:'100%', maxWidth:900, maxHeight:'85vh',
          background: V.bgCard, borderRadius:12,
          border:`1px solid ${V.border}`,
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
        }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:`1px solid ${V.border}`, flexShrink:0 }}>
          <span style={{ fontSize:12, fontWeight:700, color:V.text }}>Version Compare</span>
          <span style={{ fontSize:10, color:V.muted, fontFamily:'"Geist Mono",monospace' }}>
            {changedCount} token{changedCount !== 1 ? 's' : ''} changed
          </span>
          <div style={{ flex:1 }}/>
          <button onClick={() => onApply(vA)} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${V.border}`, background:V.accentS, color:V.accent, fontSize:10, cursor:'pointer', fontFamily:'"Geist Mono",monospace', fontWeight:600 }}>
            Apply {vA.label}
          </button>
          <button onClick={() => onApply(vB)} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${V.border}`, background:V.accentS, color:V.accent, fontSize:10, cursor:'pointer', fontFamily:'"Geist Mono",monospace', fontWeight:600 }}>
            Apply {vB.label}
          </button>
          <button onClick={onClose} aria-label="Close" style={{ width:28, height:28, borderRadius:6, border:`1px solid ${V.border}`, background:'transparent', color:V.muted, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Palette previews */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:V.border, flexShrink:0 }}>
          {[{ v:vA, pal:palA, t:tA }, { v:vB, pal:palB, t:tB }].map(({ v, pal, t }, i) => (
            <div key={i} style={{ background:V.bg, padding:'14px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <span style={{ fontSize:11, fontWeight:700, color:V.text }}>{v.label}</span>
                  <span style={{ fontSize:9, color:V.dim, marginLeft:8, fontFamily:'"Geist Mono",monospace' }}>{v.ts}</span>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  {['sharp','soft','rounded','veryRounded','pill'].map(s => (
                    <div key={s} style={{ width:22, height:14, borderRadius:SHAPE_RADIUS[s], border:`1.5px solid ${t.shape===s ? (pal[0]?.[500]??'#888') : 'rgba(255,255,255,0.15)'}`, background: t.shape===s ? (pal[0]?.[200]??'transparent') : 'transparent', opacity: t.shape===s ? 1 : 0.3 }}/>
                  ))}
                </div>
              </div>
              <SwatchRow palette={pal} count={t.colors.count} />
            </div>
          ))}
        </div>

        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:'140px 1fr 1fr', gap:8, padding:'8px 10px 4px', borderBottom:`1px solid ${V.border}`, flexShrink:0 }}>
          <span style={{ fontSize:8, color:V.dim, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.08em' }}>TOKEN</span>
          <span style={{ fontSize:8, color:V.muted, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.08em' }}>{vA.label.toUpperCase()}</span>
          <span style={{ fontSize:8, color:V.changed, fontFamily:'"Geist Mono",monospace', letterSpacing:'0.08em' }}>{vB.label.toUpperCase()}</span>
        </div>

        {/* Diff rows */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 10px 14px', display:'flex', flexDirection:'column', gap:2 }}>
          {ROWS.map(row => (
            <TokenRow key={row.label}
              label={row.label}
              valA={row.a}
              valB={row.b}
              changed={diff(row.a, row.b)}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
