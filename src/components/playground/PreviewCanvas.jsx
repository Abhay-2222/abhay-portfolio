/**
 * PreviewCanvas.jsx — Right panel
 * 5 tabs · light/dark toggle · device frame · WCAG audit
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// Inject keyframes once (spinner + shimmer)
;(function () {
  if (typeof document === 'undefined' || document.getElementById('pc-kf')) return;
  const s = document.createElement('style');
  s.id = 'pc-kf';
  s.textContent = '@keyframes pc-spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:-200% 0}}';
  document.head.appendChild(s);
})();

import {
  computeTokens, computeAllTokens, tokensToCSSVars,
  SHAPE_RADIUS, generateTypeScale, hslToHex, hexToHsl,
  getContrastRatio, wcagLevel, auditTokens, getAutoFix, computeVibeScore,
  getColorBase, auditDesignQuality,
} from './dsEngine';
import { COMPONENT_DOCS } from './componentDocs';

/* ─────────────────────────────────────────────────────────
   SCOPED CSS VAR BUILDER
───────────────────────────────────────────────────────── */
const COLOR_NAMES = ['primary','secondary','tertiary','accent','neutral','warning'];
const SHADE_KEYS  = [50,100,200,300,400,500,600,700,800,900];

function buildScopedVars(tokens, mode) {
  const { primitive, semantic, component, state, motion, layout } =
    computeAllTokens(tokens, mode);
  const { palette, typeScale, spacingSteps, shadowDefs } = primitive;
  const vars = {};
  const p = palette[0] ?? {};
  const { h: baseHue, s: saturation } = (() => { const { baseHue: bh, saturation: bs } = getColorBase(tokens); return { h: bh, s: bs }; })();

  // ── Primitive: full palette shade grid ──────────────────
  palette.forEach((shades, i) => {
    const name = COLOR_NAMES[i] ?? `color-${i}`;
    SHADE_KEYS.forEach(k => { vars[`--ds-${name}-${k}`] = shades[k]; });
  });

  // ── Semantic + component + state + motion + layout layers ─
  Object.assign(vars, tokensToCSSVars(semantic));
  Object.assign(vars, tokensToCSSVars(component));
  Object.assign(vars, tokensToCSSVars(state));
  Object.assign(vars, tokensToCSSVars(motion));
  Object.assign(vars, tokensToCSSVars(layout));

  // ── --ds-* aliases (backward compat with existing previews) ─
  const sem = semantic;
  vars['--ds-bg']            = sem['color.background.base']     ?? (mode==='dark' ? hslToHex(baseHue,Math.min(saturation*0.14,11),8) : '#ffffff');
  vars['--ds-bg-elevated']   = sem['color.background.surface']  ?? (mode==='dark' ? hslToHex(baseHue,Math.min(saturation*0.14,11),13) : '#ffffff');
  vars['--ds-bg-subtle']     = sem['color.background.subtle']   ?? (mode==='dark' ? hslToHex(baseHue,Math.min(saturation*0.14,11),17) : (p[50]??'#f8f9fa'));
  vars['--ds-fg']            = sem['color.text.primary']        ?? (mode==='dark' ? '#f2efe9' : (p[900]??'#111'));
  vars['--ds-fg-muted']      = sem['color.text.secondary']      ?? (mode==='dark' ? 'rgba(242,239,233,0.50)' : (p[700]??'#374151'));
  vars['--ds-text-muted']    = sem['color.text.muted']          ?? (mode==='dark' ? 'rgba(242,239,233,0.40)' : (p[500]??'#6b7280'));
  vars['--ds-primary']       = sem['color.action.primary']      ?? (mode==='dark' ? (p[400]??'#60a5fa') : (p[500]??'#4f46e5'));
  vars['--ds-primary-h']     = sem['color.action.primaryHover'] ?? (mode==='dark' ? (p[300]??'#93c5fd') : (p[600]??'#4338ca'));
  vars['--ds-primary-l']     = sem['color.action.primarySubtle']?? (mode==='dark' ? hslToHex(baseHue,Math.min(saturation*0.28,32),19) : (p[100]??'#e0e7ff'));
  vars['--ds-border']        = sem['color.border.default']      ?? (mode==='dark' ? 'rgba(255,255,255,0.09)' : (p[200]??'#e5e7eb'));
  vars['--ds-border-strong'] = sem['color.border.strong']       ?? (mode==='dark' ? 'rgba(255,255,255,0.18)' : (p[300]??'#d1d5db'));

  // ── Typography ───────────────────────────────────────────
  vars['--ds-font-display'] = `'${tokens.typography.display}', serif`;
  vars['--ds-font-body']    = `'${tokens.typography.body}', sans-serif`;
  vars['--ds-font-mono']    = `'${tokens.typography.mono}', monospace`;
  Object.entries(typeScale).forEach(([k, v]) => { vars[`--ds-text-${k}`] = `${v}px`; });
  // Typography personality tokens
  vars['--ds-font-weight-display'] = String(tokens.typography.displayWeight ?? 700);
  vars['--ds-font-weight-body']    = String(tokens.typography.bodyWeight ?? 400);
  const LS_MAP = { tight: '-0.02em', normal: '0em', wide: '0.04em' };
  const LH_MAP = { compact: '1.3', normal: '1.5', relaxed: '1.75' };
  vars['--ds-letter-spacing'] = LS_MAP[tokens.typography.letterSpacing ?? 'normal'] ?? '0em';
  vars['--ds-line-height']    = LH_MAP[tokens.typography.lineHeight    ?? 'normal'] ?? '1.5';

  // ── Spacing (with density scale) ─────────────────────────
  const DENSITY_SCALE = { compact: 0.75, regular: 1.0, comfortable: 1.25, spacious: 1.5 };
  const densityMult = DENSITY_SCALE[tokens.density ?? 'regular'] ?? 1.0;
  spacingSteps.forEach((v, i) => { vars[`--ds-space-${i+1}`] = `${Math.round(v * densityMult)}px`; });
  vars['--ds-density-scale'] = String(densityMult);

  // ── Shape ────────────────────────────────────────────────
  const shapeKey = typeof tokens.shape === 'number' ? null : tokens.shape;
  const radiusVal = shapeKey ? (SHAPE_RADIUS[shapeKey] ?? '4px') : `${tokens.shape}px`;
  vars['--ds-radius']    = radiusVal;
  vars['--ds-radius-sm'] = (!shapeKey || shapeKey === 'sharp') ? '0px' : `calc(${radiusVal} * 0.5)`;
  vars['--ds-radius-lg'] = (!shapeKey || shapeKey === 'pill')  ? '9999px' : `calc(${radiusVal} * 2)`;

  // ── Shadows ──────────────────────────────────────────────
  vars['--ds-shadow-sm'] = shadowDefs.sm;
  vars['--ds-shadow-md'] = shadowDefs.md;
  vars['--ds-shadow-lg'] = shadowDefs.lg;

  // ── Surfaces ─────────────────────────────────────────────
  const BW_MAP = { hairline: '0.5px', regular: '1px', thick: '2px' };
  vars['--ds-border-width'] = BW_MAP[tokens.surfaces?.borderWeight ?? 'regular'] ?? '1px';
  const elevModel = tokens.surfaces?.elevation ?? 'layered';
  if (elevModel === 'flat') {
    vars['--ds-bg-elevated'] = vars['--ds-bg'];
    vars['--ds-bg-subtle']   = vars['--ds-bg'];
  } else if (elevModel === 'floating') {
    vars['--ds-bg-elevated'] = mode === 'dark' ? hslToHex(baseHue, Math.min(saturation*0.14,11), 20) : '#f7f6f5';
    vars['--ds-bg-subtle']   = mode === 'dark' ? hslToHex(baseHue, Math.min(saturation*0.14,11), 24) : '#f0efee';
  }
  // 'layered' uses defaults already set above

  // ── Motion personality ───────────────────────────────────
  const DUR_MAP  = { instant: '80ms', snappy: '120ms', balanced: '200ms', expressive: '320ms' };
  const EASE_MAP = {
    spring:  'cubic-bezier(0.34,1.56,0.64,1)',
    ease:    'cubic-bezier(0.4,0,0.2,1)',
    linear:  'linear',
    snappy:  'cubic-bezier(0.25,0,0,1)',
  };
  vars['--ds-duration-base'] = DUR_MAP[tokens.motion?.duration ?? 'balanced'] ?? '200ms';
  vars['--ds-easing-base']   = EASE_MAP[tokens.motion?.easing ?? 'ease'] ?? 'cubic-bezier(0.4,0,0.2,1)';

  // ── Gap #9: Custom semantic colors ───────────────────────
  const customSemColors = tokens.colors?.semantic ?? {};
  vars['--ds-success'] = customSemColors.success ?? sem['color.action.success'] ?? '#22c55e';
  vars['--ds-warning'] = customSemColors.warning ?? sem['color.action.warning'] ?? '#f59e0b';
  vars['--ds-error']   = customSemColors.error   ?? sem['color.action.danger']  ?? '#ef4444';
  vars['--ds-info']    = customSemColors.info    ?? sem['color.action.info']    ?? '#0ea5e9';

  return vars;
}


/* ─────────────────────────────────────────────────────────
   DS PRIMITIVES  (all use --ds-* vars)
───────────────────────────────────────────────────────── */
function DSBtn({ variant='primary', size='md', children, disabled, style }) {
  const sz  = { sm:{padding:'5px 12px',fontSize:11}, md:{padding:'8px 16px',fontSize:13}, lg:{padding:'11px 22px',fontSize:14} };
  const vs  = {
    primary:   { background:'var(--ds-primary)',   color:'#fff',               border:'1.5px solid var(--ds-primary)',  boxShadow:'var(--ds-shadow-sm)' },
    secondary: { background:'var(--ds-primary-l)', color:'var(--ds-fg)',        border:'1.5px solid var(--ds-border)',   boxShadow:'none' },
    ghost:     { background:'transparent',          color:'var(--ds-fg)',        border:'1.5px solid var(--ds-border)',   boxShadow:'none' },
    danger:    { background:'transparent',          color:'#dc2626',            border:'1.5px solid #fca5a5',            boxShadow:'none' },
  };
  return (
    <button disabled={disabled} style={{ ...sz[size],...vs[variant],borderRadius:'var(--ds-radius)',fontFamily:'var(--ds-font-body)',fontWeight:500,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.4:1,transition:'all .12s',...style }}>
      {children}
    </button>
  );
}

function Chip({ variant, children }) {
  const map = { primary:{ bg:'var(--ds-primary-l)',color:'var(--ds-primary-h)'}, success:{ bg:'#dcfce7',color:'#166534'}, warning:{ bg:'#fef9c3',color:'#854d0e'}, info:{ bg:'#dbeafe',color:'#1e40af'}, danger:{ bg:'#fee2e2',color:'#991b1b'} };
  const c = map[variant] ?? map.primary;
  return <span style={{ padding:'3px 9px',borderRadius:'var(--ds-radius-lg)',background:c.bg,color:c.color,fontSize:11,fontFamily:'var(--ds-font-body)',fontWeight:600 }}>{children}</span>;
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:10,fontFamily:CHROME.mono,color:'var(--ds-text-muted)',letterSpacing:'0.09em',fontWeight:700,marginBottom:8 }}>{children.toUpperCase()}</div>;
}

/* ── Inline Component Docs Panel ── */
const DOC_TABS = ['Anatomy', 'Usage', 'Tokens', 'A11y'];

function DocPanel({ doc, onClose }) {
  const [tab, setTab] = useState('Anatomy');
  if (!doc) return null;
  return (
    <div style={{
      marginBottom: 20, borderRadius: 10,
      border: '1px solid var(--ds-border)',
      background: 'var(--ds-bg-elevated)',
      overflow: 'hidden', fontSize: 12,
      fontFamily: 'var(--ds-font-body)',
    }}>
      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--ds-border)', alignItems:'center' }}>
        {DOC_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 14px', fontSize:11,
            fontFamily:'var(--ds-font-mono)', background:'none', border:'none',
            borderBottom: tab===t ? '2px solid var(--ds-primary)' : '2px solid transparent',
            color: tab===t ? 'var(--ds-primary)' : 'var(--ds-text-muted)',
            cursor:'pointer', fontWeight: tab===t ? 600 : 400, marginBottom:-1,
          }}>{t}</button>
        ))}
        <button onClick={onClose} style={{
          marginLeft:'auto', padding:'9px 14px', background:'none', border:'none',
          color:'var(--ds-text-muted)', cursor:'pointer', fontSize:16, lineHeight:1,
        }}>×</button>
      </div>
      {/* Panel content */}
      <div style={{ padding:'14px 16px', maxHeight:300, overflowY:'auto' }}>

        {tab === 'Anatomy' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {doc.anatomy.length === 0
              ? <span style={{ color:'var(--ds-text-muted)' }}>No anatomy documented yet.</span>
              : doc.anatomy.map(a => (
                <div key={a.label} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{
                    minWidth:20, height:20, borderRadius:4,
                    background:'var(--ds-primary-l)', color:'var(--ds-primary)',
                    fontSize:10, fontWeight:700, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--ds-font-mono)',
                  }}>{a.label}</span>
                  <div>
                    <span style={{ fontWeight:600, color:'var(--ds-fg)', fontSize:12 }}>{a.name}</span>
                    {!a.required && <span style={{ fontSize:10, color:'var(--ds-text-muted)', marginLeft:6, fontStyle:'italic' }}>optional</span>}
                    <div style={{ color:'var(--ds-text-muted)', fontSize:11.5, lineHeight:1.6, marginTop:1 }}>{a.desc}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'Usage' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {doc.usage.when?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>USE WHEN</div>
                {doc.usage.when.map((s,i) => <div key={i} style={{ display:'flex', gap:7, color:'var(--ds-text-muted)', fontSize:11.5, lineHeight:1.6, marginBottom:3 }}><span style={{ color:'var(--ds-primary)', flexShrink:0 }}>✓</span>{s}</div>)}
              </div>
            )}
            {doc.usage.whenNot?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>AVOID</div>
                {doc.usage.whenNot.map((s,i) => <div key={i} style={{ display:'flex', gap:7, color:'var(--ds-text-muted)', fontSize:11.5, lineHeight:1.6, marginBottom:3 }}><span style={{ color:'#dc2626', flexShrink:0 }}>✕</span>{s}</div>)}
              </div>
            )}
            {doc.usage.dos?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>DO</div>
                {doc.usage.dos.map((s,i) => <div key={i} style={{ display:'flex', gap:7, color:'var(--ds-text-muted)', fontSize:11.5, lineHeight:1.6, marginBottom:3 }}><span style={{ color:'var(--ds-primary)', flexShrink:0 }}>↑</span>{s}</div>)}
              </div>
            )}
            {doc.usage.donts?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>DON'T</div>
                {doc.usage.donts.map((s,i) => <div key={i} style={{ display:'flex', gap:7, color:'var(--ds-text-muted)', fontSize:11.5, lineHeight:1.6, marginBottom:3 }}><span style={{ color:'#dc2626', flexShrink:0 }}>↓</span>{s}</div>)}
              </div>
            )}
          </div>
        )}

        {tab === 'Tokens' && (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {doc.tokenKeys.length === 0
              ? <span style={{ color:'var(--ds-text-muted)' }}>No tokens documented yet.</span>
              : doc.tokenKeys.map((t,i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'7px 0', borderBottom:'1px solid var(--ds-border)' }}>
                  <code style={{
                    fontSize:10.5, fontFamily:'var(--ds-font-mono)', color:'var(--ds-primary)',
                    minWidth:180, flexShrink:0, background:'var(--ds-primary-l)',
                    padding:'2px 6px', borderRadius:4,
                  }}>{t.key}</code>
                  <span style={{ fontSize:11.5, color:'var(--ds-text-muted)', lineHeight:1.6 }}>{t.desc}</span>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'A11y' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {doc.a11y.keyboard?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>KEYBOARD</div>
                {doc.a11y.keyboard.map((k,i) => (
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:5, alignItems:'flex-start' }}>
                    <kbd style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', borderRadius:4, padding:'1px 7px', whiteSpace:'nowrap', flexShrink:0, color:'var(--ds-fg)' }}>{k.key}</kbd>
                    <span style={{ fontSize:11.5, color:'var(--ds-text-muted)', lineHeight:1.6 }}>{k.action}</span>
                  </div>
                ))}
              </div>
            )}
            {doc.a11y.aria?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>ARIA</div>
                {doc.a11y.aria.map((s,i) => <div key={i} style={{ fontSize:11.5, color:'var(--ds-text-muted)', lineHeight:1.6, marginBottom:4, paddingLeft:10, borderLeft:'2px solid var(--ds-border)' }}>{s}</div>)}
              </div>
            )}
            {doc.a11y.notes?.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', marginBottom:6 }}>NOTES</div>
                {doc.a11y.notes.map((s,i) => <div key={i} style={{ fontSize:11.5, color:'var(--ds-text-muted)', lineHeight:1.6, marginBottom:4 }}>— {s}</div>)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Editorial Section Header with description ── */
function DSSection({ category, title, desc, children, staticChrome = false }) {
  const doc = staticChrome ? null : COMPONENT_DOCS[title];
  const [docsOpen, setDocsOpen] = useState(false);
  const catColor   = staticChrome ? CHROME.accent   : 'var(--ds-primary)';
  const titleColor = staticChrome ? CHROME.fg        : 'var(--ds-fg)';
  const titleFont  = staticChrome ? CHROME.sans      : 'var(--ds-font-display)';
  const descColor  = staticChrome ? CHROME.fgMuted   : 'var(--ds-text-muted)';
  const descFont   = staticChrome ? CHROME.sans      : 'var(--ds-font-body)';
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, fontWeight:700, color:catColor, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, opacity:0.9 }}>{category}</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <div style={{ fontSize:20, fontWeight:700, fontFamily:titleFont, color:titleColor, letterSpacing:'-0.025em', lineHeight:1.2 }}>{title}</div>
          {doc && (
            <button
              onClick={() => setDocsOpen(o => !o)}
              title={docsOpen ? 'Hide component docs' : 'Show component docs'}
              style={{
                padding:'3px 9px', borderRadius:5, cursor:'pointer',
                border: `1px solid ${docsOpen ? 'var(--ds-primary)' : 'var(--ds-border)'}`,
                background: docsOpen ? 'var(--ds-primary-l)' : 'transparent',
                color: docsOpen ? 'var(--ds-primary)' : 'var(--ds-text-muted)',
                fontSize:10, fontFamily:'var(--ds-font-mono)', fontWeight:600,
                letterSpacing:'0.03em', flexShrink:0, transition:'all 0.12s',
              }}
            >{docsOpen ? 'docs ×' : '[i] docs'}</button>
          )}
        </div>
        {desc && <div style={{ fontSize:12, color:descColor, fontFamily:descFont, lineHeight:1.7, marginTop:9 }}>{desc}</div>}
      </div>
      {doc && docsOpen && <DocPanel doc={doc} onClose={() => setDocsOpen(false)} />}
      {children}
    </div>
  );
}

/* ── Chapter divider for grouping component sections ── */
function ChapterGroup({ label, children }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:52 }}>
        <div style={{ width:20, height:2, background:'var(--ds-primary)', borderRadius:1, flexShrink:0 }}/>
        <span style={{ fontSize:9, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{label}</span>
        <div style={{ flex:1, height:1, background:'var(--ds-border)' }}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:60 }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TASK 2.2 — BUTTON STATE MATRIX
───────────────────────────────────────────────────────── */
const BTN_VARIANTS = [
  { key:'primary',   label:'Primary'   },
  { key:'secondary', label:'Secondary' },
  { key:'ghost',     label:'Ghost'     },
  { key:'danger',    label:'Danger'    },
];
const BTN_STATES = ['Default','Hover','Active','Focus','Disabled','Loading'];

const VARIANT_BASE = {
  primary:   { bg:'var(--ds-primary)',   fg:'#fff',        border:'var(--ds-primary)'    },
  secondary: { bg:'var(--ds-primary-l)', fg:'var(--ds-fg)',border:'var(--ds-border)'     },
  ghost:     { bg:'transparent',          fg:'var(--ds-fg)',border:'var(--ds-border)'     },
  danger:    { bg:'transparent',          fg:'#dc2626',     border:'#fca5a5'              },
};
const VARIANT_HOVER = {
  primary:   { bg:'var(--ds-primary-h)' },
  secondary: { bg:'var(--ds-bg-subtle)' },
  ghost:     { bg:'var(--ds-bg-subtle)' },
  danger:    { bg:'#fee2e2'             },
};

function StaticBtn({ variant, state }) {
  const base  = VARIANT_BASE[variant] ?? VARIANT_BASE.primary;
  const hover = VARIANT_HOVER[variant] ?? {};
  const isHover   = state === 'Hover'   || state === 'Active';
  const isDisabled= state === 'Disabled';
  const isFocus   = state === 'Focus';
  const isLoading = state === 'Loading';

  return (
    <div style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:4,
      padding:'5px 10px', borderRadius:'var(--ds-radius)',
      border:`1.5px solid ${base.border}`,
      background: isHover ? (hover.bg ?? base.bg) : base.bg,
      color: base.fg,
      fontSize:10, fontFamily:'var(--ds-font-body)', fontWeight:500,
      opacity: isDisabled ? 0.4 : 1,
      transform: state === 'Active' ? 'scale(0.96)' : 'none',
      outline: isFocus ? '2px solid var(--ds-primary)' : 'none',
      outlineOffset: isFocus ? '2px' : '0',
      cursor:'default', userSelect:'none', whiteSpace:'nowrap', transition:'none',
    }}>
      {isLoading && (
        <span style={{ width:8,height:8,borderRadius:'50%',border:`1.5px solid ${base.fg === '#fff' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)'}`,borderTopColor:base.fg,display:'inline-block',animation:'pc-spin 0.6s linear infinite',flexShrink:0 }}/>
      )}
      {isLoading ? 'Saving' : variant === 'danger' ? 'Delete' : variant === 'ghost' ? 'Cancel' : variant === 'secondary' ? 'Learn More' : 'Submit'}
    </div>
  );
}

function ButtonMatrix({ matrixRef }) {
  return (
    <div ref={matrixRef} style={{ overflowX:'auto' }}>
      <table style={{ borderCollapse:'collapse', width:'100%', minWidth:460 }}>
        <thead>
          <tr>
            <th style={{ width:80, padding:'4px 6px 10px', fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:700, textAlign:'left', letterSpacing:'0.05em' }}>Variant</th>
            {BTN_STATES.map(s => (
              <th key={s} style={{ padding:'4px 4px 10px', fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:700, textAlign:'center', whiteSpace:'nowrap', letterSpacing:'0.03em' }}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BTN_VARIANTS.map(({ key, label }, ri) => (
            <motion.tr key={key}
              initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.16, delay: ri * 0.04 }}
              style={{ borderTop:'1px solid var(--ds-border)' }}>
              <td style={{ padding:'8px 6px', fontSize:11, fontFamily:CHROME.mono, color:'var(--ds-fg)', fontWeight:600 }}>{label}</td>
              {BTN_STATES.map(st => (
                <td key={st} style={{ padding:'7px 4px', textAlign:'center' }}>
                  <StaticBtn variant={key} state={st}/>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TASK 2.3 — INPUT STATE PREVIEW
───────────────────────────────────────────────────────── */
function InputStates() {
  const inputBase = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:'var(--ds-radius)', fontFamily:'var(--ds-font-body)', fontSize:12, background:'var(--ds-bg)', color:'var(--ds-fg)', outline:'none' };
  const states = [
    { label:'Default',  extra:{ border:'1.5px solid var(--ds-border)' },       value:'',           placeholder:'you@example.com' },
    { label:'Focused',  extra:{ border:'1.5px solid var(--ds-primary)', boxShadow:'0 0 0 3px var(--ds-primary-l)' }, value:'alice@', placeholder:'you@example.com' },
    { label:'Error',    extra:{ border:'1.5px solid #ef4444', boxShadow:'0 0 0 3px #fee2e2' }, value:'not-an-email', placeholder:'', errMsg:'Invalid email address' },
    { label:'Disabled', extra:{ border:'1.5px solid var(--ds-border)', opacity:0.4, cursor:'not-allowed' }, value:'disabled@ex.com', placeholder:'' },
    { label:'Success',  extra:{ border:'1.5px solid #22c55e', boxShadow:'0 0 0 3px #dcfce7' }, value:'alice@example.com', placeholder:'' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 16px', maxWidth:560 }}>
      {states.map(({ label, extra, value, placeholder, errMsg }) => (
        <div key={label}>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:4 }}>{label}</div>
          <input readOnly value={value} placeholder={placeholder}
            style={{ ...inputBase, ...extra }}/>
          {errMsg && <div style={{ fontSize:10, color:'#ef4444', fontFamily:'var(--ds-font-body)', marginTop:3 }}>{errMsg}</div>}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TASK 2.5 — MOTION PREVIEW TILES
───────────────────────────────────────────────────────── */
function MotionTile({ label, tokenKey, tokenValue, children }) {
  return (
    <div style={{ padding:'14px 12px', borderRight:'1px solid var(--ds-border)', display:'flex', flexDirection:'column', gap:10, minWidth:0 }}>
      <div style={{ fontSize:10, fontWeight:700, fontFamily:'"DM Mono",monospace', color:'var(--ds-text-muted)', letterSpacing:'0.04em' }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:68, overflow:'visible', position:'relative' }}>
        {children}
      </div>
      <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'var(--ds-text-muted)', lineHeight:1.6 }}>
        <div style={{ color:'var(--ds-text-muted)' }}>{tokenKey}</div>
        <div style={{ fontWeight:600, color:'var(--ds-fg)' }}>{tokenValue}</div>
      </div>
    </div>
  );
}

function MotionSection({ tokens }) {
  const motRef   = useRef([]);
  const cardRef  = useRef(null);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const pageRef  = useRef(null);

  const preset  = tokens?.preset ?? 'minimal';
  const fastMs  = preset==='brutalist' ? 50  : preset==='playful' ? 120 : preset==='glass' ? 140 : 100;
  const normMs  = preset==='brutalist' ? 80  : preset==='playful' ? 240 : preset==='glass' ? 400 : 200;
  const slowMs  = preset==='brutalist' ? 100 : preset==='playful' ? 420 : preset==='glass' ? 500 : 350;
  const delibMs = preset==='brutalist' ? 150 : preset==='playful' ? 600 : preset==='glass' ? 650 : 500;
  const instMs  = Math.round(fastMs * 0.5);
  const easeKey = preset==='playful' ? 'cubic-bezier(0.34,1.56,0.64,1)' : preset==='glass' ? 'cubic-bezier(0,0,0.2,1)' : 'cubic-bezier(0.4,0,0.2,1)';

  // Inject CSS keyframes once
  useEffect(() => {
    if (typeof document==='undefined' || document.getElementById('ds-mot-kf2')) return;
    const s = document.createElement('style');
    s.id = 'ds-mot-kf2';
    s.textContent = `
      @keyframes ds-mot-track {
        0%   { left:4px;                opacity:1; }
        72%  { left:calc(100% - 14px);  opacity:1; }
        84%  { left:calc(100% - 14px);  opacity:0; }
        85%  { left:4px;                opacity:0; }
        100% { left:4px;                opacity:1; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  // GSAP: component interaction demos
  useEffect(() => {
    const tls = [];
    if (motRef.current[0]) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:1.2 });
      tl.to(motRef.current[0], { scale:1.06, duration:fastMs/1000, ease:easeKey })
        .to(motRef.current[0], { scale:1,    duration:fastMs/1000, ease:easeKey, delay:0.35 });
      tls.push(tl);
    }
    if (cardRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:1 });
      tl.to(cardRef.current, { y:-7, boxShadow:'0 16px 40px rgba(0,0,0,0.18)', duration:normMs/1000, ease:easeKey })
        .to(cardRef.current, { y:0,  boxShadow:'0 2px 8px rgba(0,0,0,0.07)',   duration:normMs/1000, ease:easeKey, delay:0.55 });
      tls.push(tl);
    }
    if (modalRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.8 });
      tl.set(modalRef.current, { opacity:0, y:22, scale:0.93 })
        .to(modalRef.current, { opacity:1, y:0, scale:1,    duration:slowMs/1000, ease:easeKey })
        .to(modalRef.current, { opacity:0, y:-8, scale:0.96, duration:(normMs/1000)*0.6, ease:'power2.in', delay:0.9 });
      tls.push(tl);
    }
    if (inputRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.8 });
      tl.to(inputRef.current, { outlineWidth:3, outlineOffset:3, duration:fastMs/1000, ease:easeKey })
        .to(inputRef.current, { outlineWidth:0, outlineOffset:0, duration:fastMs/1000, ease:easeKey, delay:0.7 });
      tls.push(tl);
    }
    if (pageRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.6 });
      tl.set(pageRef.current,  { x:56, opacity:0 })
        .to(pageRef.current,   { x:0,  opacity:1, duration:delibMs/1000, ease:'cubic-bezier(0,0,0.2,1)' })
        .to(pageRef.current,   { x:-56,opacity:0, duration:(delibMs/1000)*0.45, ease:'power2.in', delay:0.9 });
      tls.push(tl);
    }
    return () => tls.forEach(t => t.kill());
  }, [preset, fastMs, normMs, slowMs, delibMs, easeKey]);

  const CARD_STYLE = { borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', overflow:'hidden' };
  const SECTION_LABEL = { fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.35)', letterSpacing:'0.09em', textTransform:'uppercase', fontWeight:700 };

  const durationRows = [
    { label:'instant',    ms:instMs,  color:'#7c3aed', token:'motion.duration.instant'    },
    { label:'fast',       ms:fastMs,  color:'#2563eb', token:'motion.duration.fast'        },
    { label:'normal',     ms:normMs,  color:'#0891b2', token:'motion.duration.normal'      },
    { label:'slow',       ms:slowMs,  color:'#059669', token:'motion.duration.slow'        },
    { label:'deliberate', ms:delibMs, color:'#c8602a', token:'motion.duration.deliberate'  },
  ];

  const easingCurves = [
    { label:'Standard',   curve:'cubic-bezier(0.4,0,0.2,1)',     sub:'ease-in-out',  color:'#7c3aed', desc:'Smooth, balanced' },
    { label:'Decelerate', curve:'cubic-bezier(0,0,0.2,1)',        sub:'ease-out',     color:'#2563eb', desc:'Starts fast, slows' },
    { label:'Accelerate', curve:'cubic-bezier(0.4,0,1,1)',        sub:'ease-in',      color:'#0891b2', desc:'Starts slow, rushes' },
    { label:'Spring',     curve:'cubic-bezier(0.34,1.56,0.64,1)', sub:'overshoot',    color:'#059669', desc:'Bounces past target' },
    { label:'Linear',     curve:'linear',                         sub:'constant',     color:'#c8602a', desc:'Constant velocity' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* ── Duration Scale ── */}
      <div style={CARD_STYLE}>
        <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={SECTION_LABEL}>Duration Scale</span>
          <span style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.3)' }}>
            preset: <strong style={{ color:'rgba(0,0,0,0.55)' }}>{preset}</strong>
          </span>
        </div>
        <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:11 }}>
          {durationRows.map(({ label, ms, color, token }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:72, flexShrink:0 }}>
                <div style={{ fontSize:10, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.6)', fontWeight:600 }}>{label}</div>
                <div style={{ fontSize:8.5, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.28)' }}>{ms}ms</div>
              </div>
              <div style={{ flex:1, height:2, background:'rgba(0,0,0,0.07)', borderRadius:1, position:'relative' }}>
                <div style={{
                  position:'absolute', top:-4,
                  width:10, height:10, borderRadius:'50%',
                  background:color, boxShadow:`0 0 8px ${color}55`,
                  animation:`ds-mot-track ${ms * 3.2}ms ease-in-out infinite`,
                }}/>
              </div>
              <div style={{ width:160, fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.25)', flexShrink:0, textAlign:'right' }}>{token}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(0,0,0,0.05)', fontSize:10, color:'rgba(0,0,0,0.38)', fontFamily:'"DM Mono",monospace' }}>
          All durations run independently — fastest loops most frequently, slowest least.
        </div>
      </div>

      {/* ── Easing Curves ── */}
      <div style={CARD_STYLE}>
        <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <span style={SECTION_LABEL}>Easing Curves</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0 }}>
          {easingCurves.map(({ label, curve, sub, color, desc }, i) => (
            <div key={label} style={{
              padding:'14px 12px 16px',
              borderRight: i < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none',
            }}>
              <div style={{ fontSize:10, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.7)', fontWeight:700, marginBottom:1 }}>{label}</div>
              <div style={{ fontSize:8.5, fontFamily:'"DM Mono",monospace', color, marginBottom:2, fontWeight:600 }}>{sub}</div>
              <div style={{ fontSize:9, color:'rgba(0,0,0,0.38)', fontFamily:'"DM Mono",monospace', marginBottom:12, lineHeight:1.4 }}>{desc}</div>
              {/* Animated track — overflow visible so spring can overshoot */}
              <div style={{ height:20, background:'rgba(0,0,0,0.04)', borderRadius:10, position:'relative', overflow:'visible' }}>
                <div style={{
                  position:'absolute', top:'50%', marginTop:-5,
                  width:10, height:10, borderRadius:'50%',
                  background:color,
                  animation:`ds-mot-track ${normMs * 4}ms ${curve} infinite`,
                }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(0,0,0,0.05)', fontSize:10, color:'rgba(0,0,0,0.38)', fontFamily:'"DM Mono",monospace' }}>
          All shown at {normMs}ms (normal). Spring dot overshoots the track end then settles — that is the bounce.
        </div>
      </div>

      {/* ── Component Interactions ── */}
      <div style={{ ...CARD_STYLE, overflow:'visible' }}>
        <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <span style={SECTION_LABEL}>Component Interactions</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)' }}>

          <MotionTile label="Button Hover" tokenKey="motion.transition.button" tokenValue={`${fastMs}ms`}>
            <div ref={el => motRef.current[0] = el}
              style={{ padding:'9px 18px', borderRadius:'var(--ds-radius)', background:'var(--ds-primary)', color:'#fff', fontSize:12, fontFamily:'var(--ds-font-body)', fontWeight:600, cursor:'default', whiteSpace:'nowrap' }}>
              Save
            </div>
          </MotionTile>

          <MotionTile label="Card Lift" tokenKey="motion.transition.card" tokenValue={`${normMs}ms`}>
            <div ref={cardRef}
              style={{ width:62, padding:'9px 10px', borderRadius:'var(--ds-radius)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', boxShadow:'0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ width:'100%', height:6, borderRadius:2, background:'var(--ds-border)', marginBottom:5 }}/>
              <div style={{ width:'65%', height:4, borderRadius:2, background:'var(--ds-border)', opacity:0.5 }}/>
            </div>
          </MotionTile>

          <MotionTile label="Modal Enter" tokenKey="motion.transition.modal" tokenValue={`${slowMs}ms`}>
            <div ref={modalRef}
              style={{ width:66, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-elevated)', border:'1px solid var(--ds-border)', boxShadow:'0 8px 28px rgba(0,0,0,0.15)', overflow:'hidden' }}>
              <div style={{ height:8, background:'var(--ds-primary)', opacity:0.75 }}/>
              <div style={{ padding:'7px 9px' }}>
                <div style={{ width:'80%', height:4, borderRadius:2, background:'var(--ds-border)', marginBottom:5 }}/>
                <div style={{ width:'55%', height:3, borderRadius:2, background:'var(--ds-border)', opacity:0.5 }}/>
              </div>
            </div>
          </MotionTile>

          <MotionTile label="Focus Ring" tokenKey="motion.duration.fast" tokenValue={`${fastMs}ms`}>
            <div style={{ width:76, display:'flex', flexDirection:'column', gap:0 }}>
              <div style={{ fontSize:8.5, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', marginBottom:4 }}>Email</div>
              <div ref={inputRef}
                style={{ width:'100%', height:26, borderRadius:'var(--ds-radius)', border:'1.5px solid var(--ds-border)', background:'var(--ds-bg)', outline:'0px solid var(--ds-primary)', outlineOffset:0 }}/>
            </div>
          </MotionTile>

          <MotionTile label="Page Slide" tokenKey="motion.transition.page" tokenValue={`${delibMs}ms`}>
            <div ref={pageRef}
              style={{ width:62, height:50, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
              <div style={{ height:9, background:'var(--ds-border)', opacity:0.5 }}/>
              <div style={{ padding:'6px 7px', display:'flex', flexDirection:'column', gap:4 }}>
                {[80,60,40].map((w,i) => (
                  <div key={i} style={{ width:`${w}%`, height:3, borderRadius:1, background:'var(--ds-border)' }}/>
                ))}
              </div>
            </div>
          </MotionTile>

        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ENTERPRISE COMPONENT SECTIONS — web only
───────────────────────────────────────────────────────── */

/* ── Form Controls ── */
function FormControlsSection() {
  const [checks, setChecks] = useState([true, false]);
  const [radio, setRadio] = useState(1);
  const [toggleOn, setToggleOn] = useState(true);
  const inputBase = { width:'100%', boxSizing:'border-box', padding:'7px 11px', borderRadius:'var(--ds-radius)', border:'1.5px solid var(--ds-border)', background:'var(--ds-bg)', color:'var(--ds-fg)', fontSize:12, fontFamily:'var(--ds-font-body)', outline:'none' };
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px' }}>
        {/* Checkbox group */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Checkboxes</div>
          {['Enable notifications','Dark mode','Auto-save (disabled)'].map((lbl, i) => (
            <label key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:i===2?'not-allowed':'pointer', opacity:i===2?0.4:1 }}>
              <div onClick={() => { if (i<2) { const n=[...checks]; n[i]=!n[i]; setChecks(n); } }}
                style={{ width:15, height:15, borderRadius:'var(--ds-radius-sm)', border:`1.5px solid ${(checks[i]&&i<2)?'var(--ds-primary)':'var(--ds-border-strong)'}`, background:(checks[i]&&i<2)?'var(--ds-primary)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .12s' }}>
                {(checks[i]&&i<2) && <span style={{ color:'#fff', fontSize:9 }}>✓</span>}
              </div>
              <span style={{ fontSize:12, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{lbl}</span>
            </label>
          ))}
        </div>
        {/* Radio group */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Radio Buttons</div>
          {['Free plan','Pro — $12/mo','Enterprise'].map((lbl, i) => (
            <label key={i} onClick={() => setRadio(i)} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer' }}>
              <div style={{ width:15, height:15, borderRadius:'50%', border:`1.5px solid ${radio===i?'var(--ds-primary)':'var(--ds-border-strong)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .12s' }}>
                {radio===i && <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--ds-primary)' }}/>}
              </div>
              <span style={{ fontSize:12, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{lbl}</span>
            </label>
          ))}
        </div>
        {/* Toggle switch */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Toggle Switch</div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            {[{ label:'On', on:toggleOn }, { label:'Off', on:!toggleOn }].map(({ label, on }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div onClick={() => setToggleOn(v=>!v)}
                  style={{ width:36, height:20, borderRadius:10, background:on?'var(--ds-primary)':'rgba(0,0,0,0.15)', position:'relative', cursor:'pointer', transition:'background .18s' }}>
                  <div style={{ position:'absolute', top:3, left:on?18:3, width:14, height:14, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left .18s' }}/>
                </div>
                <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Select */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Select</div>
          <div style={{ position:'relative' }}>
            <select style={{ ...inputBase, paddingRight:28, appearance:'none', cursor:'pointer' }}>
              <option>Product Designer</option><option>Engineer</option><option>Manager</option>
            </select>
            <span style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--ds-text-muted)', pointerEvents:'none' }}>▾</span>
          </div>
        </div>
        {/* Textarea */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Textarea</div>
          <textarea readOnly rows={3} defaultValue="Tell us about your design process and how you approach system thinking…" style={{ ...inputBase, resize:'none' }}/>
        </div>
        {/* Search */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Search</div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--ds-text-muted)', pointerEvents:'none' }}>⌕</span>
            <input readOnly defaultValue="Design tokens" style={{ ...inputBase, paddingLeft:28, paddingRight:28 }}/>
            <span style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--ds-text-muted)', cursor:'pointer' }}>✕</span>
          </div>
        </div>
        {/* File upload */}
        <div style={{ gridColumn:'1 / -1' }}>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>File Upload</div>
          <div style={{ border:'1.5px dashed var(--ds-border-strong)', borderRadius:'var(--ds-radius)', padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:'var(--ds-bg-subtle)', cursor:'pointer' }}>
            <span style={{ fontSize:20 }}>⬆</span>
            <span style={{ fontSize:12, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', fontWeight:500 }}>Drop files here or click to upload</span>
            <span style={{ fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)' }}>SVG, PNG, JPG or GIF · max 5MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Navigation Patterns ── */
function NavigationSection() {
  const [activeNavItem, setActiveNavItem] = useState('Work');
  const [activeTab, setActiveTab] = useState(0);
  const [activeSideNav, setActiveSideNav] = useState('Dashboard');
  const sideItems = [{ icon:'⊞', label:'Dashboard' },{ icon:'📊', label:'Analytics' },{ icon:'👥', label:'Team' },{ icon:'⚙', label:'Settings' }];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Topbar */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Topbar</div>
        <nav style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 14px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)' }}>
          <span style={{ fontWeight:800, fontSize:14, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', marginRight:8 }}>Brand</span>
          {['Home','Work','About','Contact'].map(item => (
            <button key={item} onClick={() => setActiveNavItem(item)}
              style={{ padding:'5px 11px', borderRadius:'var(--ds-radius-sm)', background:item===activeNavItem?'var(--ds-primary)':'transparent', color:item===activeNavItem?'#fff':'var(--ds-text-muted)', border:'none', fontFamily:'var(--ds-font-body)', fontSize:12, cursor:'pointer', fontWeight:item===activeNavItem?600:400, transition:'all .12s' }}>
              {item}
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--ds-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:11, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)' }}>A</span>
          </div>
        </nav>
      </div>
      {/* Sidebar + content preview */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Sidebar Nav</div>
        <div style={{ display:'flex', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden', height:148 }}>
          <div style={{ width:148, background:'var(--ds-bg-subtle)', borderRight:'1px solid var(--ds-border)', padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
            {sideItems.map(({ icon, label }) => (
              <button key={label} onClick={() => setActiveSideNav(label)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:'var(--ds-radius-sm)', border:'none', background:activeSideNav===label?'var(--ds-primary)':'transparent', color:activeSideNav===label?'#fff':'var(--ds-text-muted)', fontSize:11, fontFamily:'var(--ds-font-body)', fontWeight:activeSideNav===label?600:400, cursor:'pointer', textAlign:'left', transition:'all .12s' }}>
                <span style={{ fontSize:14 }}>{icon}</span>{label}
              </button>
            ))}
          </div>
          <div style={{ flex:1, padding:'14px 16px', background:'var(--ds-bg-elevated)' }}>
            <div style={{ fontSize:14, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', marginBottom:8 }}>{activeSideNav}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[70, 45, 85].map((w, i) => (
                <div key={i} style={{ height:10, width:`${w}%`, borderRadius:'var(--ds-radius-sm)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)' }}/>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Breadcrumb</div>
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontFamily:'var(--ds-font-body)' }}>
          {['Home','Products','Checkout'].map((crumb, i, arr) => (
            <span key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:i===arr.length-1?'var(--ds-fg)':'var(--ds-primary)', fontWeight:i===arr.length-1?600:400, cursor:i<arr.length-1?'pointer':'default' }}>{crumb}</span>
              {i < arr.length-1 && <span style={{ color:'var(--ds-text-muted)' }}>›</span>}
            </span>
          ))}
        </div>
      </div>
      {/* Horizontal tabs */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Tabs</div>
        <div style={{ borderBottom:'1px solid var(--ds-border)' }}>
          {['Overview','Activity','Members','Settings'].map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              style={{ padding:'7px 16px', border:'none', borderBottom:`2px solid ${activeTab===i?'var(--ds-primary)':'transparent'}`, marginBottom:-1, background:'transparent', color:activeTab===i?'var(--ds-primary)':'var(--ds-text-muted)', fontSize:12, fontFamily:'var(--ds-font-body)', fontWeight:activeTab===i?600:400, cursor:'pointer', transition:'all .12s' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* Stepper */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:8 }}>Stepper</div>
        <div style={{ display:'flex', alignItems:'flex-start' }}>
          {['Account','Profile','Billing','Review'].map((step, i) => (
            <span key={i} style={{ display:'flex', alignItems:'flex-start', flex:i<3?1:'unset' }}>
              <span style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:i<2?'var(--ds-primary)':i===2?'var(--ds-primary-l)':'var(--ds-bg-subtle)', border:`1.5px solid ${i<3?'var(--ds-primary)':'var(--ds-border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {i<2 ? <span style={{ color:'#fff', fontSize:10 }}>✓</span> : <span style={{ fontSize:9, color:i===2?'var(--ds-primary)':'var(--ds-text-muted)', fontWeight:700 }}>{i+1}</span>}
                </div>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-body)', color:i===2?'var(--ds-fg)':'var(--ds-text-muted)', fontWeight:i===2?600:400, whiteSpace:'nowrap' }}>{step}</span>
              </span>
              {i < 3 && <div style={{ flex:1, height:1.5, background:i<2?'var(--ds-primary)':'var(--ds-border)', margin:'11px 6px 0', minWidth:8 }}/>}
            </span>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Pagination</div>
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          {['←','1','2','3','4','5','…','12','→'].map((p, i) => (
            <button key={i} style={{ minWidth:28, height:28, borderRadius:'var(--ds-radius-sm)', border:`1px solid ${i===2?'var(--ds-primary)':'var(--ds-border)'}`, background:i===2?'var(--ds-primary)':'transparent', color:i===2?'#fff':'var(--ds-text-muted)', fontSize:11, cursor:'pointer', fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', fontWeight:i===2?600:400 }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Data Table ── */
function DataTableSection() {
  const [sortDir, setSortDir] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set([1]));
  const rows = [
    { name:'Alice Chen',  status:'Active',   dept:'Design',      date:'Jan 12', role:'Lead Designer'   },
    { name:'Bob Kumar',   status:'Active',   dept:'Engineering', date:'Jan 10', role:'Frontend Eng'    },
    { name:'Carol Smith', status:'Pending',  dept:'Product',     date:'Jan 8',  role:'Product Manager' },
    { name:'Dave Lee',    status:'Inactive', dept:'Design',      date:'Dec 30', role:'UX Researcher'   },
  ];
  const statusStyle = { Active:{ bg:'#dcfce7',color:'#166534' }, Pending:{ bg:'#fef9c3',color:'#854d0e' }, Inactive:{ bg:'#f3f4f6',color:'#4b5563' } };
  const allSel = selectedRows.size === rows.length;
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'var(--ds-font-body)' }}>
          <thead>
            <tr style={{ background:'var(--ds-bg-subtle)' }}>
              <th style={{ padding:'8px 10px', borderBottom:'1px solid var(--ds-border)', width:32 }}>
                <div onClick={() => setSelectedRows(allSel ? new Set() : new Set(rows.map((_,i)=>i)))}
                  style={{ width:13, height:13, borderRadius:3, border:`1.5px solid ${allSel?'var(--ds-primary)':'var(--ds-border-strong)'}`, background:allSel?'var(--ds-primary)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  {allSel && <span style={{ color:'#fff', fontSize:8 }}>✓</span>}
                </div>
              </th>
              <th onClick={() => setSortDir(d=>d==='asc'?'desc':'asc')}
                style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, fontWeight:600, borderBottom:'1px solid var(--ds-border)', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
                NAME <span style={{ opacity:0.5 }}>{sortDir==='asc'?'↑':'↓'}</span>
              </th>
              {['STATUS','DEPARTMENT','DATE','ACTIONS'].map(col => (
                <th key={col} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, fontWeight:600, borderBottom:'1px solid var(--ds-border)', whiteSpace:'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const sel = selectedRows.has(i);
              return (
                <tr key={i} style={{ background:sel?'var(--ds-primary-l)':i%2===0?'transparent':'var(--ds-bg-subtle)', borderBottom:i<rows.length-1?'1px solid var(--ds-border)':'none' }}>
                  <td style={{ padding:'7px 10px' }}>
                    <div onClick={() => { const n=new Set(selectedRows); n.has(i)?n.delete(i):n.add(i); setSelectedRows(n); }}
                      style={{ width:13, height:13, borderRadius:3, border:`1.5px solid ${sel?'var(--ds-primary)':'var(--ds-border-strong)'}`, background:sel?'var(--ds-primary)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      {sel && <span style={{ color:'#fff', fontSize:8 }}>✓</span>}
                    </div>
                  </td>
                  <td style={{ padding:'7px 10px' }}>
                    <div style={{ fontWeight:500, color:'var(--ds-fg)' }}>{row.name}</div>
                    <div style={{ fontSize:10, color:'var(--ds-text-muted)' }}>{row.role}</div>
                  </td>
                  <td style={{ padding:'7px 10px' }}>
                    <span style={{ padding:'2px 7px', borderRadius:'var(--ds-radius-lg)', fontSize:9, fontWeight:600, background:statusStyle[row.status].bg, color:statusStyle[row.status].color }}>{row.status}</span>
                  </td>
                  <td style={{ padding:'7px 10px', color:'var(--ds-fg-muted)' }}>{row.dept}</td>
                  <td style={{ padding:'7px 10px', color:'var(--ds-fg-muted)' }}>{row.date}</td>
                  <td style={{ padding:'7px 10px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button style={{ padding:'3px 8px', borderRadius:'var(--ds-radius-sm)', border:'1px solid var(--ds-border)', background:'transparent', color:'var(--ds-fg)', fontSize:9, cursor:'pointer', fontFamily:'var(--ds-font-body)' }}>Edit</button>
                      <button style={{ padding:'3px 8px', borderRadius:'var(--ds-radius-sm)', border:'1px solid #fca5a5', background:'transparent', color:'#dc2626', fontSize:9, cursor:'pointer', fontFamily:'var(--ds-font-body)' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)' }}>
          <span style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>Showing 1–4 of 24 · {selectedRows.size} selected</span>
          <div style={{ display:'flex', gap:3 }}>
            {['←','1','2','3','…','→'].map((p, i) => (
              <button key={i} style={{ width:22, height:22, borderRadius:'var(--ds-radius-sm)', border:`1px solid ${i===1?'var(--ds-primary)':'var(--ds-border)'}`, background:i===1?'var(--ds-primary)':'transparent', color:i===1?'#fff':'var(--ds-text-muted)', fontSize:10, cursor:'pointer', fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', justifyContent:'center' }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cards ── */
function CardsSection() {
  return (
    <div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-start' }}>
        {/* Feature card */}
        <div style={{ flex:'0 0 196px', borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-md)', overflow:'hidden' }}>
          <div style={{ height:76, background:'linear-gradient(135deg,var(--ds-primary-l) 0%,var(--ds-primary) 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.25)', backdropFilter:'blur(4px)' }}/>
          </div>
          <div style={{ padding:'12px 14px 14px' }}>
            <span style={{ fontSize:'var(--ds-text-lg)', fontWeight:700, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', display:'block', marginBottom:4 }}>Design System</span>
            <p style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)', lineHeight:1.6, margin:'0 0 10px' }}>Consistent, accessible, beautiful by default.</p>
            <DSBtn variant="primary" size="sm">Explore →</DSBtn>
          </div>
        </div>
        {/* Profile card */}
        <div style={{ flex:'0 0 174px', borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)', padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textAlign:'center' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--ds-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:18, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)' }}>AC</span>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>Alice Chen</div>
            <div style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>Lead Designer</div>
          </div>
          <div style={{ display:'flex', gap:14, fontSize:11, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>
            <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'var(--ds-fg)', fontSize:14 }}>48</div><div>Tokens</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'var(--ds-fg)', fontSize:14 }}>12</div><div>Exports</div></div>
          </div>
          <DSBtn variant="ghost" size="sm">View Profile</DSBtn>
        </div>
        {/* Horizontal list card */}
        <div style={{ flex:1, minWidth:180, borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', overflow:'hidden' }}>
          {[{ icon:'🎨', title:'Design Tokens', sub:'Updated 2m ago', badge:'Active' },
            { icon:'📐', title:'Components', sub:'48 components', badge:'New' },
            { icon:'📋', title:'Documentation', sub:'In progress', badge:null },
          ].map(({ icon, title, sub, badge }, i, arr) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:i<arr.length-1?'1px solid var(--ds-border)':'none', cursor:'pointer' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:500, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{title}</div>
                <div style={{ fontSize:9, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)' }}>{sub}</div>
              </div>
              {badge && <Chip variant={badge==='Active'?'success':'primary'}>{badge}</Chip>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Overlays ── */
function OverlaysSection() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Modal */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Dialog / Modal</div>
          <div style={{ borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-lg)', overflow:'hidden' }}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--ds-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>Confirm Delete</span>
              <button style={{ width:20, height:20, borderRadius:4, border:'1px solid var(--ds-border)', background:'transparent', color:'var(--ds-text-muted)', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:'12px 14px' }}>
              <p style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', margin:0, lineHeight:1.6 }}>This will permanently delete the component. This action cannot be undone.</p>
            </div>
            <div style={{ padding:'8px 14px 12px', display:'flex', justifyContent:'flex-end', gap:7 }}>
              <DSBtn variant="ghost" size="sm">Cancel</DSBtn>
              <DSBtn variant="danger" size="sm">Delete</DSBtn>
            </div>
          </div>
        </div>
        {/* Tooltip + Popover */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Tooltip & Popover</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'flex-start', gap:4 }}>
              <div style={{ padding:'5px 9px', borderRadius:'var(--ds-radius-sm)', background:'#1a1814', color:'#f8f8f7', fontSize:10, fontFamily:'var(--ds-font-body)', fontWeight:500, boxShadow:'var(--ds-shadow-md)', whiteSpace:'nowrap', position:'relative', alignSelf:'flex-start' }}>
                Saves automatically
                <div style={{ position:'absolute', bottom:-4, left:14, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'4px solid #1a1814' }}/>
              </div>
              <DSBtn variant="secondary" size="sm">Hover me ↑</DSBtn>
            </div>
            <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-md)', padding:'10px 12px', maxWidth:180 }}>
              <div style={{ fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', marginBottom:3 }}>Popover title</div>
              <div style={{ fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)', lineHeight:1.6 }}>Additional info shown on hover or click.</div>
            </div>
          </div>
        </div>
        {/* Dropdown menu */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Dropdown Menu</div>
          <div style={{ position:'relative', display:'inline-block' }}>
            <button onClick={() => setDropdownOpen(o=>!o)}
              style={{ padding:'6px 12px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', color:'var(--ds-fg)', fontSize:11, cursor:'pointer', fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', gap:5 }}>
              Options <span style={{ fontSize:9, opacity:0.6 }}>▾</span>
            </button>
            {dropdownOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, minWidth:160, background:'var(--ds-bg-elevated)', border:'1px solid var(--ds-border)', borderRadius:'var(--ds-radius)', boxShadow:'var(--ds-shadow-lg)', zIndex:50, overflow:'hidden' }}>
                {['✏ Edit','⎘ Duplicate','↗ Share'].map((label, i) => (
                  <button key={i} style={{ display:'block', width:'100%', padding:'7px 12px', border:'none', background:'transparent', color:'var(--ds-fg)', fontSize:11, fontFamily:'var(--ds-font-body)', textAlign:'left', cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--ds-bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {label}
                  </button>
                ))}
                <div style={{ height:1, background:'var(--ds-border)', margin:'2px 0' }}/>
                <button style={{ display:'block', width:'100%', padding:'7px 12px', border:'none', background:'transparent', color:'#dc2626', fontSize:11, fontFamily:'var(--ds-font-body)', textAlign:'left', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Command palette */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Command Palette</div>
          <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border-strong)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-lg)', overflow:'hidden' }}>
            <div style={{ padding:'7px 10px', borderBottom:'1px solid var(--ds-border)', display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:12, color:'var(--ds-text-muted)' }}>⌕</span>
              <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)' }}>Search commands…</span>
              <span style={{ marginLeft:'auto', fontSize:9, padding:'2px 5px', borderRadius:3, border:'1px solid var(--ds-border)', color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>⌘K</span>
            </div>
            {[['🎨','Export CSS Tokens'],['⚛','React Component Kit'],['🔗','Copy Share URL']].map(([icon, label], i) => (
              <div key={i} style={{ padding:'7px 10px', display:'flex', alignItems:'center', gap:8, background:i===0?'var(--ds-primary-l)':'transparent', borderLeft:i===0?`2px solid var(--ds-primary)`:'2px solid transparent' }}>
                <span style={{ fontSize:12 }}>{icon}</span>
                <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:i===0?'var(--ds-fg)':'var(--ds-fg-muted)', fontWeight:i===0?500:400 }}>{label}</span>
                {i===0 && <span style={{ marginLeft:'auto', fontSize:9, padding:'2px 5px', borderRadius:3, border:'1px solid var(--ds-border)', color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>↵</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feedback & Status ── */
function FeedbackSection() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Alert banners */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {[
          { icon:'ℹ', bg:'#dbeafe', border:'#93c5fd', text:'#1e40af', msg:'Your session will expire in 10 minutes.' },
          { icon:'✓', bg:'#dcfce7', border:'#86efac', text:'#166534', msg:'Design tokens exported successfully.' },
          { icon:'⚠', bg:'#fefce8', border:'#fde047', text:'#854d0e', msg:'Contrast ratio below WCAG AA on primary.' },
          { icon:'✕', bg:'#fee2e2', border:'#fca5a5', text:'#991b1b', msg:'Failed to apply preset. Check tokens.' },
        ].map(({ icon, bg, border, text, msg }, i) => (
          <div key={i} style={{ padding:'8px 12px', borderRadius:'var(--ds-radius)', background:bg, border:`1px solid ${border}`, display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:12, color:text, fontWeight:700 }}>{icon}</span>
            <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:text, flex:1, lineHeight:1.5 }}>{msg}</span>
            <span style={{ fontSize:11, color:text, cursor:'pointer', opacity:0.6 }}>✕</span>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Progress bars */}
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Progress</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[{ label:'Uploading…', pct:65, color:'var(--ds-primary)' },{ label:'Build complete', pct:100, color:'#22c55e' },{ label:'Processing', pct:30, color:'#f59e0b' }].map(({ label, pct, color }, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)' }}><span>{label}</span><span>{pct}%</span></div>
                <div style={{ height:6, borderRadius:'var(--ds-radius-lg)', background:'var(--ds-bg-subtle)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, borderRadius:'var(--ds-radius-lg)', background:color, transition:'width .4s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton + Spinner + Toast */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Skeleton</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[85, 60, 75].map((w, i) => (
                <div key={i} style={{ height:11, borderRadius:'var(--ds-radius-sm)', width:`${w}%`, background:'linear-gradient(90deg,var(--ds-bg-subtle) 25%,var(--ds-border) 50%,var(--ds-bg-subtle) 75%)', backgroundSize:'200% 100%', animation:`shimmer 1.5s ${i*0.15}s infinite linear` }}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Spinner</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {[14, 20, 28].map((sz, i) => (
                <div key={i} style={{ width:sz, height:sz, borderRadius:'50%', border:`${i===0?1.5:2}px solid var(--ds-primary-l)`, borderTopColor:'var(--ds-primary)', animation:'pc-spin 0.7s linear infinite' }}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:7 }}>Toast</div>
            <div style={{ padding:'8px 11px', borderRadius:'var(--ds-radius)', background:'#1a1814', color:'#f8f8f7', fontSize:11, fontFamily:'var(--ds-font-body)', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'var(--ds-shadow-lg)' }}>
              <span style={{ color:'#22c55e' }}>✓</span>Tokens exported!
            </div>
          </div>
        </div>
      </div>
      {/* Empty state */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Empty State</div>
        <div style={{ padding:'22px', borderRadius:'var(--ds-radius-lg)', border:'1px dashed var(--ds-border-strong)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, maxWidth:320 }}>
          <div style={{ width:44, height:44, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-subtle)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📦</div>
          <div style={{ fontSize:14, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>No components yet</div>
          <div style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)', textAlign:'center', lineHeight:1.5 }}>Start by adding your first component to the library.</div>
          <DSBtn variant="primary" size="sm">+ Add Component</DSBtn>
        </div>
      </div>
    </div>
  );
}

/* ── Data Display ── */
function DataDisplaySection() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[
          { label:'Components', value:'48', delta:'↑ +12%', pos:true },
          { label:'Token Groups', value:'6', delta:'Updated', pos:true },
          { label:'WCAG Passes', value:'94%', delta:'↓ -2%', pos:false },
          { label:'Exports', value:'128', delta:'↑ +8%', pos:true },
        ].map(({ label, value, delta, pos }) => (
          <div key={label} style={{ padding:'12px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)' }}>
            <div style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:10, color:pos?'#22c55e':'#ef4444', fontFamily:'var(--ds-font-body)', marginTop:4 }}>{delta}</div>
          </div>
        ))}
      </div>
      {/* Activity feed */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Activity Feed</div>
        <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
          {[
            { av:'AC', c:'#4f46e5', action:'exported CSS tokens', time:'2m ago' },
            { av:'BK', c:'#e54f4f', action:'updated spacing scale', time:'14m ago' },
            { av:'CS', c:'#22c55e', action:'applied Glass preset', time:'1h ago' },
            { av:'DL', c:'#f59e0b', action:'set shape to Rounded', time:'3h ago' },
          ].map(({ av, c, action, time }, i, arr) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderBottom:i<arr.length-1?'1px solid var(--ds-border)':'none', background:i===0?'var(--ds-bg-elevated)':'transparent' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)', flexShrink:0 }}>{av}</div>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', fontWeight:500 }}>{av} </span>
                <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)' }}>{action}</span>
              </div>
              <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, flexShrink:0 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Avatars */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:8 }}>Avatars</div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex' }}>
            {[{ i:'AC',c:'#4f46e5'},{ i:'BK',c:'#e54f4f'},{ i:'CS',c:'#22c55e'},{ i:'DL',c:'#f59e0b'}].map(({ i: init, c }, idx) => (
              <div key={idx} style={{ width:30, height:30, borderRadius:'50%', background:c, border:'2px solid var(--ds-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700, marginLeft:idx>0?-9:0, position:'relative', zIndex:4-idx, fontFamily:'var(--ds-font-body)' }}>{init}</div>
            ))}
            <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--ds-bg-subtle)', border:'2px solid var(--ds-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--ds-text-muted)', marginLeft:-9, fontFamily:'var(--ds-font-body)', fontWeight:600 }}>+9</div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
            {[{s:20,t:'XS'},{s:28,t:'SM'},{s:36,t:'MD'},{s:44,t:'LG'},{s:52,t:'XL'}].map(({ s, t }) => (
              <div key={t} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ width:s, height:s, borderRadius:'50%', background:'var(--ds-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:s*0.33, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)' }}>A</div>
                <span style={{ fontSize:7, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Badges, Tags & Status ── */
function BadgesSection() {
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <Chip variant="primary">Design</Chip>
          <Chip variant="success">WCAG AA</Chip>
          <Chip variant="warning">Beta</Chip>
          <Chip variant="info">Tokens</Chip>
          <Chip variant="danger">Deprecated</Chip>
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {['v2.4.1','React','Figma','CSS Vars','Zero deps'].map(tag => (
            <span key={tag} style={{ padding:'3px 9px', borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', fontSize:10, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg-muted)' }}>{tag}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
          {[{ dot:'#22c55e', label:'Online' },{ dot:'#f59e0b', label:'Away' },{ dot:'#ef4444', label:'Offline' },{ dot:'#3b82f6', label:'In a call' }].map(({ dot, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:dot, boxShadow:`0 0 6px ${dot}80` }}/>
              <span style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>Notification badges:</span>
          {[{ icon:'🔔', count:3 },{ icon:'📨', count:12 },{ icon:'⚙', count:null }].map(({ icon, count }, i) => (
            <div key={i} style={{ position:'relative', display:'inline-flex' }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              {count && <span style={{ position:'absolute', top:-2, right:-4, minWidth:14, height:14, borderRadius:7, background:'#ef4444', color:'#fff', fontSize:8, fontWeight:700, fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'1.5px solid var(--ds-bg)' }}>{count}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Accordion ── */
function AccordionSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const items = [
    { title:'What are design tokens?', body:'Design tokens are named entities that store visual design attributes — colours, spacing, typography, shadows — providing a single source of truth between design and code.' },
    { title:'How do I export to CSS?', body:'Use the Export button to access CSS custom properties, Tailwind config, raw JSON, or a React component kit. All exports reflect your current token configuration.' },
    { title:'Does this support dark mode?', body:'Yes — the semantic layer auto-computes dark-mode variants from your palette. Toggle the preview button to see both light and dark contexts.' },
  ];
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom:i<items.length-1?'1px solid var(--ds-border)':'none' }}>
            <button onClick={() => setOpenIdx(i===openIdx?-1:i)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:10 }}>
              <span style={{ fontSize:12, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{item.title}</span>
              <span style={{ fontSize:11, color:'var(--ds-text-muted)', transform:openIdx===i?'rotate(180deg)':'rotate(0deg)', transition:'transform .2s', flexShrink:0 }}>▾</span>
            </button>
            {openIdx===i && (
              <div style={{ padding:'0 14px 12px' }}>
                <p style={{ margin:0, fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', lineHeight:1.7 }}>{item.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Date Picker ── */
function DatePickerSection() {
  const days = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const offset = 6; const total = 31; const today = 6; const selected = 12;
  return (
    <div>
      <div style={{ display:'inline-block', borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-md)', padding:'12px 14px', minWidth:218 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <button style={{ width:22, height:22, borderRadius:'var(--ds-radius-sm)', border:'1px solid var(--ds-border)', background:'transparent', color:'var(--ds-fg)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <span style={{ fontSize:12, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>March 2026</span>
          <button style={{ width:22, height:22, borderRadius:'var(--ds-radius-sm)', border:'1px solid var(--ds-border)', background:'transparent', color:'var(--ds-fg)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
          {days.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, fontWeight:600, padding:'2px 0' }}>{d}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {Array.from({ length: offset + total }).map((_, i) => {
            if (i < offset) return <div key={i}/>;
            const day = i - offset + 1;
            const isToday = day === today; const isSel = day === selected;
            return (
              <div key={i} style={{ textAlign:'center', padding:'4px 2px', borderRadius:'var(--ds-radius-sm)', background:isSel?'var(--ds-primary)':isToday?'var(--ds-primary-l)':'transparent', color:isSel?'#fff':isToday?'var(--ds-primary)':'var(--ds-fg)', fontSize:10, fontFamily:'var(--ds-font-body)', fontWeight:(isToday||isSel)?700:400, cursor:'pointer' }}>{day}</div>
            );
          })}
        </div>
        <div style={{ borderTop:'1px solid var(--ds-border)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', gap:6 }}>
          <DSBtn variant="ghost" size="sm">Clear</DSBtn>
          <DSBtn variant="primary" size="sm">Apply</DSBtn>
        </div>
      </div>
    </div>
  );
}

/* ── STUB — kept only to avoid reference errors during transition ── */
function IOSComponentsPreview() {
  const [toggle1] = useState(true);
  const [seg] = useState(0);
  const [checked] = useState([true, false, true]);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, fontFamily:'-apple-system,"SF Pro Text","Helvetica Neue",sans-serif' }}>

      {/* iOS Navigation Bar */}
      <div style={{ padding:'12px 16px 8px', borderBottom:'0.5px solid var(--ds-border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--ds-bg-elevated)' }}>
        <span style={{ fontSize:13, color:'var(--ds-primary)', fontWeight:400 }}>‹ Back</span>
        <span style={{ fontSize:17, fontWeight:600, color:'var(--ds-fg)' }}>Settings</span>
        <span style={{ fontSize:13, color:'var(--ds-primary)', fontWeight:400 }}>Edit</span>
      </div>

      {/* Segmented Control */}
      <div style={{ padding:'12px 16px 8px', background:'var(--ds-bg)' }}>
        <div style={{ display:'flex', background:'rgba(118,118,128,0.12)', borderRadius:9, padding:2, gap:1 }}>
          {['All','Unread','Flagged'].map((label,i) => (
            <button key={label} onClick={() => setSeg(i)}
              style={{ flex:1, padding:'6px 4px', borderRadius:7, border:'none', background: seg===i ? 'var(--ds-bg-elevated)' : 'transparent', color: seg===i ? 'var(--ds-fg)' : 'var(--ds-text-muted)', fontSize:12, fontWeight: seg===i ? 600 : 400, cursor:'pointer', boxShadow: seg===i ? '0 1px 3px rgba(0,0,0,0.12)' : 'none', transition:'all .15s', fontFamily:'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      <div style={{ margin:'0 0 0', background:'var(--ds-bg)' }}>
        <div style={{ fontSize:12, color:'var(--ds-text-muted)', padding:'14px 16px 6px', letterSpacing:'0.01em', textTransform:'uppercase' }}>Notifications</div>
        <div style={{ background:'var(--ds-bg-elevated)', borderRadius:10, margin:'0 16px' }}>
          {[
            { label:'Allow Notifications', hasToggle:true, idx:0 },
            { label:'Sounds', hasToggle:true, idx:1 },
            { label:'Badges', hasChevron:true },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display:'flex', alignItems:'center', padding:'11px 16px', borderBottom: i < arr.length-1 ? '0.5px solid var(--ds-border)' : 'none' }}>
              <span style={{ flex:1, fontSize:16, color:'var(--ds-fg)' }}>{row.label}</span>
              {row.hasToggle && (
                <div onClick={() => { const n=[...checked]; n[row.idx]=!n[row.idx]; setChecked(n); }}
                  style={{ width:51, height:31, borderRadius:16, background: checked[row.idx] ? 'var(--ds-primary)' : 'rgba(120,120,128,0.32)', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:2, left: checked[row.idx] ? 22 : 2, width:27, height:27, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,0.22)', transition:'left .2s' }}/>
                </div>
              )}
              {row.hasChevron && <span style={{ color:'var(--ds-text-muted)', fontSize:16, opacity:0.5 }}>›</span>}
            </div>
          ))}
        </div>

        <div style={{ fontSize:12, color:'var(--ds-text-muted)', padding:'14px 16px 6px', letterSpacing:'0.01em', textTransform:'uppercase' }}>Account</div>
        <div style={{ background:'var(--ds-bg-elevated)', borderRadius:10, margin:'0 16px' }}>
          {['Profile', 'Privacy', 'Sign Out'].map((label,i,arr) => (
            <div key={label} style={{ display:'flex', alignItems:'center', padding:'11px 16px', borderBottom: i < arr.length-1 ? '0.5px solid var(--ds-border)' : 'none', cursor:'pointer' }}>
              <span style={{ flex:1, fontSize:16, color: label==='Sign Out' ? '#ff3b30' : 'var(--ds-fg)' }}>{label}</span>
              {label !== 'Sign Out' && <span style={{ color:'var(--ds-text-muted)', fontSize:16, opacity:0.5 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* iOS Buttons */}
      <div style={{ padding:'20px 16px 12px', display:'flex', flexDirection:'column', gap:10, background:'var(--ds-bg)' }}>
        <div style={{ fontSize:12, color:'var(--ds-text-muted)', padding:'0 0 4px', letterSpacing:'0.01em', textTransform:'uppercase' }}>Buttons</div>
        <button style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'var(--ds-primary)', color:'#fff', fontSize:17, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Continue</button>
        <button style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'rgba(118,118,128,0.12)', color:'var(--ds-primary)', fontSize:17, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Learn More</button>
        <button style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'transparent', color:'var(--ds-primary)', fontSize:17, fontWeight:400, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
      </div>

      {/* iOS Tab Bar */}
      <div style={{ borderTop:'0.5px solid var(--ds-border)', background:'var(--ds-bg-elevated)', display:'flex', justifyContent:'space-around', padding:'8px 0 4px', marginTop:8 }}>
        {[['⊞','Home'],['🔍','Search'],['♡','Saved'],['⊙','Profile']].map(([icon,label],i) => (
          <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:48, cursor:'pointer' }}>
            <span style={{ fontSize:20, color: i===0 ? 'var(--ds-primary)' : 'var(--ds-text-muted)' }}>{icon}</span>
            <span style={{ fontSize:10, color: i===0 ? 'var(--ds-primary)' : 'var(--ds-text-muted)', fontWeight: i===0 ? 500 : 400 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   NEW COMPONENT SECTIONS — secondary/tertiary colors
───────────────────────────────────────────────────────── */

/* ── Color Roles (top of Components tab) ── */
function ColorRolesSection() {
  const roles = [
    { name:'Primary',   bg:'var(--ds-primary)',      light:'var(--ds-primary-l)',   desc:'CTAs, actions, links' },
    { name:'Secondary', bg:'var(--ds-secondary-500)', light:'var(--ds-secondary-100)', desc:'Supporting UI elements' },
    { name:'Tertiary',  bg:'var(--ds-tertiary-500)',  light:'var(--ds-tertiary-100)', desc:'Accents, highlights' },
  ];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {roles.map(({ name, bg, light, desc }) => (
          <div key={name} style={{ borderRadius:CHROME.radius, overflow:'hidden', border:`1px solid ${CHROME.borderColor}` }}>
            <div style={{ height:52, background:bg }}/>
            <div style={{ height:20, background:light }}/>
            <div style={{ padding:'8px 10px', background:CHROME.bgBase }}>
              <div style={{ fontSize:11, fontWeight:600, fontFamily:CHROME.sans, color:CHROME.fg }}>{name}</div>
              <div style={{ fontSize:9, color:CHROME.fgMuted, fontFamily:CHROME.sans, marginTop:2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pricing Cards ── */
function PricingCardsSection() {
  const plans = [
    { name:'Starter', price:'Free', features:['5 token groups','CSS export','Community support'], cta:'Get started', highlight:false },
    { name:'Pro',     price:'$12/mo', features:['Unlimited groups','All exports','Tailwind + React','Priority support'], cta:'Start free trial', highlight:true },
    { name:'Enterprise', price:'Custom', features:['Custom tokens','SSO / Audit log','Dedicated support'], cta:'Contact sales', highlight:false },
  ];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, alignItems:'start' }}>
        {plans.map(({ name, price, features, cta, highlight }) => (
          <div key={name} style={{
            borderRadius:'var(--ds-radius-lg)', border:`1px solid ${highlight?'var(--ds-primary)':'var(--ds-border)'}`,
            background: highlight ? 'var(--ds-primary-l)' : 'var(--ds-bg-elevated)',
            boxShadow: highlight ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
            overflow:'hidden',
            transform: highlight ? 'scale(1.03)' : 'none',
          }}>
            {highlight && <div style={{ background:'var(--ds-primary)', padding:'4px 0', textAlign:'center', fontSize:9, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'#fff', letterSpacing:'0.06em' }}>MOST POPULAR</div>}
            <div style={{ padding:'16px 14px 14px' }}>
              <div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', marginBottom:4 }}>{name}</div>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:'var(--ds-font-display)', color: highlight?'var(--ds-primary)':'var(--ds-fg)', marginBottom:12 }}>{price}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)' }}>
                    <span style={{ color:'var(--ds-secondary-500)', fontSize:11, fontWeight:700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button style={{ width:'100%', padding:'8px', borderRadius:'var(--ds-radius)', border: highlight?'none':'1px solid var(--ds-border)', background: highlight?'var(--ds-primary)':'transparent', color: highlight?'#fff':'var(--ds-fg)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--ds-font-body)', transition:'all .12s' }}>{cta}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Kanban Board ── */
function KanbanSection() {
  const columns = [
    { title:'To Do', color:'var(--ds-border)', cards:['Audit color tokens','Review typography scale'] },
    { title:'In Progress', color:'var(--ds-secondary-500)', cards:['Build component library','Dark mode variants'] },
    { title:'Done', color:'#22c55e', cards:['Token architecture','WCAG compliance check','Export pipeline'] },
  ];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {columns.map(({ title, color, cards }) => (
          <div key={title} style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)', overflow:'hidden' }}>
            <div style={{ padding:'8px 10px', borderBottom:'1px solid var(--ds-border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--ds-bg-elevated)' }}>
              <span style={{ fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{title}</span>
              <span style={{ fontSize:9, padding:'2px 6px', borderRadius:'var(--ds-radius-lg)', background:color === 'var(--ds-border)' ? 'var(--ds-bg-subtle)' : `${color}22`, color, border:`1px solid ${color}`, fontFamily:'var(--ds-font-mono)', fontWeight:700 }}>{cards.length}</span>
            </div>
            <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:6 }}>
              {cards.map(c => (
                <div key={c} style={{ padding:'8px 10px', borderRadius:'var(--ds-radius-sm)', background:'var(--ds-bg-elevated)', border:'1px solid var(--ds-border)', fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', boxShadow:'var(--ds-shadow-sm)', cursor:'grab' }}>{c}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Vertical Timeline ── */
function TimelineSection() {
  const events = [
    { date:'Jan 2026', title:'Token Architecture', desc:'Defined 6-layer token system', color:'var(--ds-primary)' },
    { date:'Feb 2026', title:'Component Library', desc:'48 components built', color:'var(--ds-primary)' },
    { date:'Mar 2026', title:'Dark Mode Launch', desc:'Auto-generated dark palette', color:'var(--ds-secondary-500)' },
    { date:'Apr 2026', title:'v2.0 Release', desc:'Multi-platform token export', color:'var(--ds-tertiary-500)' },
  ];
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {events.map(({ date, title, desc, color }, i) => (
          <div key={i} style={{ display:'flex', gap:12, position:'relative' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:color, border:`2px solid var(--ds-bg)`, boxShadow:`0 0 0 2px ${color}`, marginTop:2, flexShrink:0 }}/>
              {i < events.length - 1 && <div style={{ width:2, flex:1, background:'var(--ds-border)', minHeight:24, margin:'4px 0' }}/>}
            </div>
            <div style={{ paddingBottom:16 }}>
              <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:2 }}>{date}</div>
              <div style={{ fontSize:12, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{title}</div>
              <div style={{ fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', marginTop:2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar Chart ── */
function ChartSection() {
  const bars = [
    { label:'Jan', val:72, color:'var(--ds-primary)' },
    { label:'Feb', val:58, color:'var(--ds-primary-h)' },
    { label:'Mar', val:85, color:'var(--ds-primary)' },
    { label:'Apr', val:63, color:'var(--ds-secondary-500)' },
    { label:'May', val:91, color:'var(--ds-secondary-500)' },
    { label:'Jun', val:47, color:'var(--ds-tertiary-500)' },
  ];
  const max = Math.max(...bars.map(b => b.val));
  return (
    <div>
      <div style={{ border:'1px solid var(--ds-border)', borderRadius:'var(--ds-radius)', background:'var(--ds-bg-elevated)', padding:'16px', boxShadow:'var(--ds-shadow-sm)' }}>
        <div style={{ fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', marginBottom:14 }}>Monthly Exports</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
          {bars.map(({ label, val, color }) => (
            <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:'100%', borderRadius:'var(--ds-radius-sm) var(--ds-radius-sm) 0 0', background:color, height:`${(val/max)*72}px`, transition:'height .3s', minHeight:4 }}/>
              <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
          {[{ color:'var(--ds-primary)', label:'Primary' },{ color:'var(--ds-secondary-500)', label:'Secondary' },{ color:'var(--ds-tertiary-500)', label:'Tertiary' }].map(({ color, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:color }}/>
              <span style={{ fontSize:9, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Notification Panel ── */
function NotificationPanelSection() {
  const items = [
    { dot:true, title:'Export complete', time:'2m ago', read:false },
    { dot:true, title:'WCAG audit found 2 issues', time:'14m ago', read:false },
    { dot:false, title:'Alice shared a version', time:'1h ago', read:true },
    { dot:false, title:'Token update applied', time:'3h ago', read:true },
  ];
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', overflow:'hidden', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)', maxWidth:320 }}>
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--ds-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, fontWeight:700, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>Notifications</span>
          <button style={{ fontSize:10, border:'none', background:'none', cursor:'pointer', fontFamily:'var(--ds-font-body)', color:'var(--ds-secondary-500)', fontWeight:600 }}>Mark all read</button>
        </div>
        {items.map(({ dot, title, time, read }, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderBottom: i<items.length-1 ? '1px solid var(--ds-border)' : 'none', background: !read ? 'var(--ds-primary-l)' : 'transparent' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: dot ? 'var(--ds-primary)' : 'transparent', border: dot ? 'none' : '1.5px solid var(--ds-border)', flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', fontWeight: !read ? 600 : 400 }}>{title}</div>
            </div>
            <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, flexShrink:0 }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Comment Thread ── */
function CommentThreadSection() {
  const comments = [
    { av:'AC', c:'var(--ds-primary)', name:'Alice Chen', time:'2h ago', body:'Great token architecture! The 6-layer system makes semantic mapping really clean.', replies:[
      { av:'BK', c:'var(--ds-secondary-500)', name:'Bob Kumar', time:'1h ago', body:'Agreed — especially the component layer auto-computing from semantic values.' },
    ]},
    { av:'CS', c:'var(--ds-tertiary-500)', name:'Carol Smith', time:'30m ago', body:'Should we add a motion tokens preview to the audit tab?', replies:[] },
  ];
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {comments.map(({ av, c, name, time, body, replies }, ci) => (
          <div key={ci}>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)', flexShrink:0 }}>{av}</div>
              <div style={{ flex:1, borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', padding:'9px 12px' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{name}</span>
                  <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>{time}</span>
                </div>
                <p style={{ margin:0, fontSize:11, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', lineHeight:1.6 }}>{body}</p>
                <button style={{ marginTop:6, border:'none', background:'none', padding:0, cursor:'pointer', fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-primary)', fontWeight:500 }}>Reply</button>
              </div>
            </div>
            {replies.map((r, ri) => (
              <div key={ri} style={{ display:'flex', gap:10, marginTop:8, marginLeft:38 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:r.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:700, fontFamily:'var(--ds-font-body)', flexShrink:0 }}>{r.av}</div>
                <div style={{ flex:1, borderRadius:'var(--ds-radius-sm)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)', padding:'7px 10px' }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:10, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{r.name}</span>
                    <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>{r.time}</span>
                  </div>
                  <p style={{ margin:0, fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)', lineHeight:1.6 }}>{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Rich Text Editor ── */
function RichTextEditorSection() {
  const tools = [
    { label:'B', active:true, title:'Bold' },
    { label:'I', active:false, title:'Italic' },
    { label:'U', active:false, title:'Underline' },
    { label:'"', active:false, title:'Quote' },
    { label:'—', active:false, title:'Link' },
  ];
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden', background:'var(--ds-bg-elevated)' }}>
        <div style={{ display:'flex', gap:2, padding:'6px 8px', borderBottom:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)', flexWrap:'wrap' }}>
          {tools.map(({ label, active, title }) => (
            <button key={title} title={title}
              style={{ width:28, height:26, borderRadius:'var(--ds-radius-sm)', border:`1px solid ${active?'var(--ds-primary)':'transparent'}`, background: active?'var(--ds-primary-l)':'transparent', color: active?'var(--ds-primary)':'var(--ds-fg-muted)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {label}
            </button>
          ))}
          <div style={{ width:1, height:26, background:'var(--ds-border)', margin:'0 4px' }}/>
          {[{ label:'H1', title:'Heading 1' },{ label:'H2', title:'Heading 2' }].map(({ label, title }) => (
            <button key={title} title={title}
              style={{ padding:'0 7px', height:26, borderRadius:'var(--ds-radius-sm)', border:'1px solid transparent', background:'transparent', color:'var(--ds-fg-muted)', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'var(--ds-font-mono)' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding:'12px 14px', minHeight:80, fontFamily:'var(--ds-font-body)', fontSize:12, color:'var(--ds-fg)', lineHeight:1.7 }}>
          <span style={{ fontWeight:700 }}>Design tokens</span> are the visual foundation of your product — colours, typography, spacing, and more stored as named constants that connect design tools to production code.
        </div>
      </div>
    </div>
  );
}

/* ── Video Player ── */
function VideoPlayerSection() {
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius-lg)', overflow:'hidden', border:'1px solid var(--ds-border)', background:'#000', boxShadow:'var(--ds-shadow-md)', maxWidth:400 }}>
        <div style={{ aspectRatio:'16/9', background:'var(--ds-bg-subtle)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'2px solid rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <div style={{ width:0, height:0, borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderLeft:'16px solid rgba(255,255,255,0.9)', marginLeft:4 }}/>
          </div>
          <div style={{ position:'absolute', top:8, right:8, padding:'3px 8px', borderRadius:'var(--ds-radius-sm)', background:'rgba(0,0,0,0.55)', color:'rgba(255,255,255,0.85)', fontSize:9, fontFamily:'var(--ds-font-mono)' }}>LIVE</div>
        </div>
        <div style={{ padding:'8px 12px 10px', background:'var(--ds-bg-elevated)' }}>
          <div style={{ height:3, borderRadius:2, background:'var(--ds-bg-subtle)', marginBottom:8, position:'relative', cursor:'pointer' }}>
            <div style={{ height:'100%', width:'38%', borderRadius:2, background:'var(--ds-primary)' }}/>
            <div style={{ position:'absolute', top:'50%', left:'38%', transform:'translate(-50%,-50%)', width:10, height:10, borderRadius:'50%', background:'var(--ds-primary)', border:'2px solid var(--ds-bg-elevated)' }}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button style={{ width:26, height:26, border:'none', background:'transparent', color:'var(--ds-fg)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>&#9654;</button>
            <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>1:24 / 3:45</span>
            <div style={{ flex:1 }}/>
            <button style={{ width:22, height:22, border:'none', background:'transparent', color:'var(--ds-fg-muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>&#128266;</button>
            <button style={{ width:22, height:22, border:'none', background:'transparent', color:'var(--ds-fg-muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>&#9974;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tag Input ── */
function TagInputSection() {
  const tags = [
    { label:'Design System', color:'var(--ds-primary)', bg:'var(--ds-primary-l)' },
    { label:'Tokens', color:'var(--ds-secondary-500)', bg:'var(--ds-secondary-100)' },
    { label:'React', color:'var(--ds-tertiary-500)', bg:'var(--ds-tertiary-100)' },
  ];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px', borderRadius:'var(--ds-radius)', border:'1.5px solid var(--ds-primary)', boxShadow:'0 0 0 3px var(--ds-primary-l)', background:'var(--ds-bg)', flexWrap:'wrap' }}>
        {tags.map(({ label, color, bg }) => (
          <span key={label} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:'var(--ds-radius-lg)', background:bg, color, fontSize:11, fontFamily:'var(--ds-font-body)', fontWeight:500 }}>
            {label}
            <span style={{ fontSize:10, cursor:'pointer', opacity:0.7 }}>✕</span>
          </span>
        ))}
        <span style={{ fontSize:12, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>Add tag…</span>
      </div>
    </div>
  );
}

/* ── Rating ── */
function RatingSection() {
  const filled = 3.5;
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div>
          <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:6 }}>Star Rating (3.5 / 5)</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ display:'flex', gap:3 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24">
                  <defs><linearGradient id={`g${i}`}><stop offset={i <= filled ? '100%' : i - 0.5 === filled ? '50%' : '0%'} stopColor="var(--ds-primary)"/><stop offset={i <= filled ? '100%' : i - 0.5 === filled ? '50%' : '0%'} stopColor="var(--ds-border)"/></linearGradient></defs>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={i <= Math.floor(filled) ? 'var(--ds-primary)' : i - 0.5 <= filled ? 'none' : 'var(--ds-border)'} stroke="none"/>
                  {i - 0.5 === filled && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="var(--ds-primary)" strokeWidth="1" clipPath="inset(0 50% 0 0)" style={{ fill:'var(--ds-primary)' }}/>}
                </svg>
              ))}
            </div>
            <span style={{ fontSize:12, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)', fontWeight:600 }}>3.5</span>
            <span style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>(128 reviews)</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:5 }}>Thumbs</div>
            <div style={{ display:'flex', gap:8 }}>
              {[['↑','var(--ds-secondary-500)','224'],['↓','#ef4444','18']].map(([icon,color,count]) => (
                <button key={icon} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:'var(--ds-radius)', border:`1px solid ${color}`, background:`${color}18`, color, fontSize:12, cursor:'pointer', fontFamily:'var(--ds-font-body)', fontWeight:600 }}>{icon} {count}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, marginBottom:5 }}>Score</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
              <span style={{ fontSize:28, fontWeight:800, fontFamily:'var(--ds-font-display)', color:'var(--ds-tertiary-500)', lineHeight:1 }}>8.4</span>
              <span style={{ fontSize:11, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Range Sliders ── */
function SliderSection() {
  const sliders = [
    { label:'Primary', val:68, color:'var(--ds-primary)' },
    { label:'Secondary', val:42, color:'var(--ds-secondary-500)' },
    { label:'Tertiary', val:85, color:'var(--ds-tertiary-500)' },
  ];
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {sliders.map(({ label, val, color }) => (
          <div key={label}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg-muted)' }}>{label}</span>
              <span style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', color }}>{ val}%</span>
            </div>
            <div style={{ position:'relative', height:6, borderRadius:3, background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', overflow:'visible' }}>
              <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${val}%`, borderRadius:3, background:color, transition:'width .3s' }}/>
              <div style={{ position:'absolute', top:'50%', left:`${val}%`, transform:'translate(-50%,-50%)', width:14, height:14, borderRadius:'50%', background:color, border:'2px solid var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Grid ── */
function StatsGridSection() {
  const stats = [
    { val:'2,847', label:'Total Tokens', delta:'+12%', color:'var(--ds-primary)' },
    { val:'94%',   label:'WCAG Passes',  delta:'+3%',  color:'var(--ds-secondary-500)' },
    { val:'48',    label:'Components',   delta:'new',  color:'var(--ds-tertiary-500)' },
    { val:'6',     label:'Token Layers', delta:'stable', color:'var(--ds-primary)' },
    { val:'128',   label:'Exports',      delta:'+8%',  color:'var(--ds-secondary-500)' },
    { val:'3',     label:'Platforms',    delta:'active', color:'var(--ds-tertiary-500)' },
  ];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {stats.map(({ val, label, delta, color }) => (
          <div key={label} style={{ padding:'12px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', boxShadow:'var(--ds-shadow-sm)', borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', margin:'3px 0' }}>{label}</div>
            <div style={{ fontSize:9, color, fontFamily:'var(--ds-font-mono)', fontWeight:600 }}>{delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Data Filter Bar ── */
function DataFilterSection() {
  const activeFilters = ['Design','Q1 2026'];
  const inputBase = { padding:'6px 10px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg)', color:'var(--ds-fg)', fontSize:11, fontFamily:'var(--ds-font-body)', outline:'none' };
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:120 }}>
            <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--ds-text-muted)', pointerEvents:'none' }}>⌕</span>
            <input readOnly defaultValue="components" style={{ ...inputBase, paddingLeft:26, width:'100%', boxSizing:'border-box' }}/>
          </div>
          <div style={{ position:'relative' }}>
            <select style={{ ...inputBase, paddingRight:22, appearance:'none', cursor:'pointer' }}>
              <option>Category</option><option>Design</option><option>Tokens</option>
            </select>
            <span style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', fontSize:9, color:'var(--ds-text-muted)', pointerEvents:'none' }}>▾</span>
          </div>
          <div style={{ position:'relative' }}>
            <select style={{ ...inputBase, paddingRight:22, appearance:'none', cursor:'pointer' }}>
              <option>Quarter</option><option>Q1</option><option>Q2</option>
            </select>
            <span style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', fontSize:9, color:'var(--ds-text-muted)', pointerEvents:'none' }}>▾</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>Active:</span>
          {activeFilters.map(f => (
            <span key={f} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:'var(--ds-radius-lg)', background:'var(--ds-secondary-100)', color:'var(--ds-secondary-500)', fontSize:10, fontFamily:'var(--ds-font-body)', fontWeight:500 }}>
              {f} <span style={{ cursor:'pointer', fontSize:9 }}>✕</span>
            </span>
          ))}
          <button style={{ fontSize:10, border:'none', background:'none', cursor:'pointer', color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', padding:'0 4px' }}>Clear all</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar Layout Mockup ── */
function SidebarLayoutSection() {
  const navItems = [
    { icon:'⊞', label:'Dashboard', active:true },
    { icon:'⬛', label:'Projects', active:false },
    { icon:'⊙', label:'Team', active:false },
    { icon:'⚙', label:'Settings', active:false },
  ];
  return (
    <div>
      <div style={{ borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', overflow:'hidden', display:'flex', height:200, boxShadow:'var(--ds-shadow-md)' }}>
        {/* Sidebar */}
        <div style={{ width:140, background:'var(--ds-bg)', borderRight:'1px solid var(--ds-border)', display:'flex', flexDirection:'column', padding:'12px 8px', gap:2, flexShrink:0 }}>
          <div style={{ padding:'4px 8px 12px', fontWeight:800, fontSize:13, fontFamily:'var(--ds-font-display)', color:'var(--ds-primary)' }}>Brand</div>
          {navItems.map(({ icon, label, active }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 9px', borderRadius:'var(--ds-radius-sm)', background: active?'var(--ds-primary)':'transparent', color: active?'#fff':'var(--ds-text-muted)', fontSize:11, fontFamily:'var(--ds-font-body)', fontWeight: active?600:400, cursor:'pointer', transition:'all .12s' }}>
              <span style={{ fontSize:13 }}>{icon}</span>{label}
            </div>
          ))}
        </div>
        {/* Content area */}
        <div style={{ flex:1, background:'var(--ds-bg-subtle)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--ds-border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--ds-bg-elevated)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:'var(--ds-font-body)' }}>
              <span style={{ color:'var(--ds-primary)' }}>Home</span>
              <span style={{ color:'var(--ds-text-muted)' }}>›</span>
              <span style={{ color:'var(--ds-fg)', fontWeight:600 }}>Dashboard</span>
            </div>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--ds-secondary-500)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700 }}>AC</div>
          </div>
          <div style={{ flex:1, padding:'12px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {['Tokens','Components','Exports'].map((t, i) => (
                <div key={t} style={{ padding:'8px', borderRadius:'var(--ds-radius-sm)', background:'var(--ds-bg-elevated)', border:'1px solid var(--ds-border)', boxShadow:'var(--ds-shadow-sm)' }}>
                  <div style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>{t}</div>
                  <div style={{ fontSize:16, fontWeight:700, fontFamily:'var(--ds-font-display)', color:['var(--ds-primary)','var(--ds-secondary-500)','var(--ds-tertiary-500)'][i] }}>
                    {['48','12','6'][i]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height:8, borderRadius:2, background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)' }}/>
            <div style={{ height:8, borderRadius:2, background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', width:'75%' }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT LIBRARY — 5-component prototype
   Grid overview → focused component detail page
───────────────────────────────────────────────────────── */

/* Token keys relevant to each prototype component */
const COMPONENT_TOKENS = {
  'Buttons': [
    { key:'--ds-primary',   label:'Primary'       },
    { key:'--ds-primary-h', label:'Primary hover'  },
    { key:'--ds-primary-l', label:'Primary subtle' },
    { key:'--ds-border',    label:'Border'         },
    { key:'--ds-shadow-sm', label:'Shadow sm'      },
    { key:'--ds-font-body', label:'Body font'      },
  ],
  'Text Fields': [
    { key:'--ds-border',      label:'Border'      },
    { key:'--ds-primary',     label:'Focus ring'  },
    { key:'--ds-bg',          label:'Background'  },
    { key:'--ds-bg-subtle',   label:'Disabled bg' },
    { key:'--ds-fg',          label:'Text'        },
    { key:'--ds-text-muted',  label:'Placeholder' },
  ],
  'Cards': [
    { key:'--ds-bg-elevated', label:'Surface'    },
    { key:'--ds-border',      label:'Border'     },
    { key:'--ds-shadow-sm',   label:'Shadow sm'  },
    { key:'--ds-shadow-md',   label:'Shadow md'  },
    { key:'--ds-primary',     label:'Accent'     },
    { key:'--ds-fg',          label:'Title text' },
  ],
  'Badges, Tags & Chips': [
    { key:'--ds-primary',   label:'Info text' },
    { key:'--ds-primary-l', label:'Info bg'   },
    { key:'--ds-border',    label:'Tag border' },
    { key:'--ds-fg',        label:'Tag text'  },
  ],
  'Data Table': [
    { key:'--ds-bg-subtle',   label:'Row hover'    },
    { key:'--ds-primary-l',   label:'Selected row' },
    { key:'--ds-border',      label:'Row dividers' },
    { key:'--ds-bg-elevated', label:'Header bg'    },
    { key:'--ds-fg',          label:'Cell text'    },
    { key:'--ds-text-muted',  label:'Header text'  },
  ],
};

/* ── Mini preview components for grid cards ── */
function ButtonsMini() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%' }}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        <div style={{ padding:'5px 12px', borderRadius:'var(--ds-radius)', background:'var(--ds-primary)', color:'#fff', fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)' }}>Primary</div>
        <div style={{ padding:'5px 12px', borderRadius:'var(--ds-radius)', border:'1.5px solid var(--ds-border)', color:'var(--ds-fg)', fontSize:11, fontFamily:'var(--ds-font-body)' }}>Ghost</div>
        <div style={{ padding:'5px 12px', borderRadius:'var(--ds-radius)', background:'var(--ds-primary)', color:'#fff', fontSize:11, opacity:0.32, fontFamily:'var(--ds-font-body)' }}>Disabled</div>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <div style={{ padding:'5px 12px', borderRadius:'var(--ds-radius)', background:'var(--ds-primary-l)', color:'var(--ds-primary)', fontSize:11, fontWeight:500, fontFamily:'var(--ds-font-body)' }}>Secondary</div>
        <div style={{ padding:'5px 12px', borderRadius:'var(--ds-radius)', border:'1.5px solid #fca5a5', color:'#dc2626', fontSize:11, fontFamily:'var(--ds-font-body)' }}>Danger</div>
      </div>
    </div>
  );
}

function TextFieldsMini() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:9, width:'100%' }}>
      <div>
        <div style={{ fontSize:10, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', fontWeight:500, marginBottom:4 }}>Email address</div>
        <div style={{ padding:'6px 10px', borderRadius:'var(--ds-radius)', border:'2px solid var(--ds-primary)', background:'var(--ds-bg)', fontSize:11, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', boxShadow:'0 0 0 3px var(--ds-primary-l)' }}>user@example.com</div>
      </div>
      <div>
        <div style={{ fontSize:10, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', fontWeight:500, marginBottom:4 }}>Password</div>
        <div style={{ padding:'6px 10px', borderRadius:'var(--ds-radius)', border:'1.5px solid #fca5a5', background:'var(--ds-bg)', fontSize:11, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>Min 8 characters</div>
        <div style={{ fontSize:10, color:'#dc2626', marginTop:3 }}>⚠ Password too short</div>
      </div>
    </div>
  );
}

function CardsMini() {
  return (
    <div style={{ display:'flex', gap:8, width:'100%' }}>
      {[
        { accent:'var(--ds-primary)', title:'Feature', sub:'Gradient image header, primary fill.' },
        { accent:'var(--ds-primary-l)', title:'Profile', sub:'Avatar and stat row.' },
      ].map((c,i) => (
        <div key={i} style={{ flex:1, borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', overflow:'hidden', boxShadow:'var(--ds-shadow-sm)' }}>
          <div style={{ height:32, background:c.accent }}/>
          <div style={{ padding:'8px 10px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-display)', marginBottom:3 }}>{c.title}</div>
            <div style={{ fontSize:9.5, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.5 }}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BadgesMini() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%' }}>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {[['Success','#dcfce7','#166534'],['Warning','#fef9c3','#854d0e'],['Error','#fee2e2','#991b1b']].map(([l,bg,fg]) => (
          <span key={l} style={{ padding:'3px 9px', borderRadius:'9999px', background:bg, color:fg, fontSize:10, fontWeight:600, fontFamily:'var(--ds-font-body)' }}>{l}</span>
        ))}
        <span style={{ padding:'3px 9px', borderRadius:'9999px', background:'var(--ds-primary-l)', color:'var(--ds-primary)', fontSize:10, fontWeight:600, fontFamily:'var(--ds-font-body)' }}>Info</span>
      </div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {['Design','React','Tokens'].map(tag => (
          <span key={tag} style={{ padding:'3px 9px', borderRadius:'var(--ds-radius-lg)', border:'1px solid var(--ds-border)', color:'var(--ds-fg)', fontSize:10, fontFamily:'var(--ds-font-body)', display:'flex', alignItems:'center', gap:4 }}>
            {tag} <span style={{ fontSize:9, color:'var(--ds-text-muted)' }}>×</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DataTableMini() {
  return (
    <div style={{ border:'1px solid var(--ds-border)', borderRadius:'var(--ds-radius)', overflow:'hidden', fontSize:10, fontFamily:'var(--ds-font-body)', width:'100%' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 56px', background:'var(--ds-bg-subtle)', padding:'5px 8px', borderBottom:'1px solid var(--ds-border)' }}>
        {['Name','Status','Role'].map(h => <span key={h} style={{ color:'var(--ds-text-muted)', fontWeight:600, fontSize:9.5 }}>{h}</span>)}
      </div>
      {[['Alice Tang','Active','Admin'],['Marcus B.','Inactive','Editor']].map(([n,s,r],i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 70px 56px', padding:'6px 8px', borderBottom: i===0 ? '1px solid var(--ds-border)' : 'none', background: i===0 ? 'var(--ds-primary-l)' : 'transparent' }}>
          <span style={{ color:'var(--ds-fg)', fontWeight: i===0 ? 500 : 400, fontSize:10 }}>{n}</span>
          <span style={{ fontSize:9.5, display:'flex', alignItems:'center', gap:3, color: s==='Active' ? '#166534' : 'var(--ds-text-muted)' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background: s==='Active' ? '#16a34a' : 'var(--ds-border)', flexShrink:0 }}/>
            {s}
          </span>
          <span style={{ color:'var(--ds-text-muted)', fontSize:9.5 }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* Prototype component registry */
const TIER_COLORS = { P1:'#16a34a', P2:'#2563eb', P3:'#9333ea' };

const PROTO_COMPONENTS = [
  { key:'Buttons',            category:'Action',    group:'Interaction & Input', tier:'P1', mini: ButtonsMini,    preview: () => <ButtonMatrix matrixRef={null}/> },
  { key:'Text Fields',        category:'Input',     group:'Interaction & Input', tier:'P1', mini: TextFieldsMini, preview: () => <InputStates/> },
  { key:'Cards',              category:'Content',   group:'Content & Cards',     tier:'P2', mini: CardsMini,      preview: () => <CardsSection/> },
  { key:'Badges, Tags & Chips',category:'Taxonomy', group:'Feedback & Status',  tier:'P1', mini: BadgesMini,     preview: () => <BadgesSection/> },
  { key:'Data Table',         category:'Data',      group:'Data & Tables',       tier:'P3', mini: DataTableMini,  preview: () => <DataTableSection/> },
];

/* Live computed token strip for the selected component — compact inline legend */
// Static neutrals for tool chrome — never change with user's palette
const CHROME = {
  label:       'rgba(0,0,0,0.32)',
  text:        'rgba(0,0,0,0.5)',
  value:       'rgba(0,0,0,0.62)',
  divider:     'rgba(0,0,0,0.08)',
  bg:          'rgba(0,0,0,0.03)',
  border:      'rgba(0,0,0,0.1)',
  mono:        '"Geist Mono",monospace',
  // Foundation-page statics — never change with user palette
  fg:          '#1a1814',
  fgMuted:     'rgba(0,0,0,0.42)',
  borderColor: 'rgba(0,0,0,0.08)',
  borderStrong:'rgba(0,0,0,0.15)',
  bgBase:      '#ffffff',
  bgSubtle:    '#f8f8f7',
  radius:      '8px',
  radiusSm:    '4px',
  accent:      '#6366f1',
  sans:        '-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif',
};

function ContextualTokenStrip({ componentKey, scopedVars }) {
  const defs = COMPONENT_TOKENS[componentKey] ?? [];
  const colorDefs = defs.filter(t => { const v = scopedVars[t.key]; return v && (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl')); });
  const otherDefs = defs.filter(t => { const v = scopedVars[t.key]; return v && !v.startsWith('#') && !v.startsWith('rgb') && !v.startsWith('hsl'); });
  if (!defs.length) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'8px 20px', padding:'12px 0 16px', borderBottom:`1px solid ${CHROME.divider}`, marginBottom:24 }}>
      {/* Label — hardcoded neutral, never changes */}
      <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, flexShrink:0 }}>
        Tokens used
      </span>

      {/* Color tokens — larger circles + readable names */}
      {colorDefs.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Stacked circles — bigger */}
          <div style={{ display:'flex', alignItems:'center' }}>
            {colorDefs.map((t, i) => (
              <div key={t.key} title={`${t.label}: ${scopedVars[t.key]}`}
                style={{ width:22, height:22, borderRadius:'50%', background:scopedVars[t.key], border:'2.5px solid #fff', marginLeft: i > 0 ? -8 : 0, position:'relative', zIndex:colorDefs.length - i, boxShadow:'0 0 0 1.5px rgba(0,0,0,0.14)' }}/>
            ))}
          </div>
          {/* Inline labels — hardcoded neutral */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {colorDefs.map(t => (
              <span key={t.key} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontFamily:CHROME.mono, color:'var(--ds-fg)' }}>
                <span style={{ width:9, height:9, borderRadius:'50%', background:scopedVars[t.key], display:'inline-block', flexShrink:0, boxShadow:'0 0 0 1px rgba(0,0,0,0.15)' }}/>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {colorDefs.length > 0 && otherDefs.length > 0 && (
        <div style={{ width:1, height:14, background:CHROME.divider, flexShrink:0 }}/>
      )}

      {/* Non-color tokens — plain key: value */}
      {otherDefs.map(t => {
        const val = scopedVars[t.key] ?? '';
        const shortVal = val.length > 26 ? val.slice(0,26)+'…' : val;
        return (
          <span key={t.key} style={{ fontSize:11, fontFamily:CHROME.mono, color:'var(--ds-fg)' }}>
            <span style={{ color:'var(--ds-text-muted)' }}>{t.label}: </span>{shortVal}
          </span>
        );
      })}
    </div>
  );
}

const DETAIL_TABS = ['Preview', 'Usage', 'Anatomy', 'A11y'];

/* Focused single-component page */
function ComponentDetailPage({ comp, tokens, scopedVars, onBack }) {
  const [tab, setTab] = useState('Preview');
  const doc = COMPONENT_DOCS[comp.key] ?? null;
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>

      {/* Back + title */}
      <div style={{ marginBottom:28 }}>
        <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', color:'var(--ds-text-muted)', fontSize:11, fontFamily:'var(--ds-font-mono)', cursor:'pointer', padding:'0 0 14px', letterSpacing:'0.04em', transition:'color .12s' }}>
          ← All components
        </button>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', fontWeight:700, color:'var(--ds-primary)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, opacity:0.9 }}>{comp.category}</div>
            <h1 style={{ margin:0, fontSize:28, fontWeight:700, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', letterSpacing:'-0.03em', lineHeight:1.15 }}>{comp.key}</h1>
            {doc && <p style={{ margin:'9px 0 0', fontSize:13, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.75, maxWidth:560 }}>{doc.description}</p>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0, marginTop:4 }}>
            <span style={{ padding:'3px 9px', borderRadius:6, fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color: TIER_COLORS[comp.tier], border:`1px solid ${TIER_COLORS[comp.tier]}` }}>{comp.tier}</span>
            <span style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>stable</span>
          </div>
        </div>
      </div>

      {/* Live token strip */}
      <ContextualTokenStrip componentKey={comp.key} scopedVars={scopedVars}/>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--ds-border)', marginBottom:28 }}>
        {DETAIL_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 16px', fontSize:12, fontFamily:'var(--ds-font-body)',
            background:'none', border:'none', cursor:'pointer', marginBottom:-1,
            borderBottom: tab===t ? '2px solid var(--ds-primary)' : '2px solid transparent',
            color: tab===t ? 'var(--ds-fg)' : 'var(--ds-text-muted)',
            fontWeight: tab===t ? 600 : 400, transition:'color .12s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Preview' && <div>{comp.preview()}</div>}

      {tab === 'Usage' && doc && (
        <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:600 }}>
          {doc.usage.when?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', letterSpacing:'0.1em', marginBottom:10 }}>USE WHEN</div>
              {doc.usage.when.map((s,i) => <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}><span style={{ color:'var(--ds-primary)', fontSize:15, flexShrink:0, lineHeight:1.4 }}>✓</span><span style={{ fontSize:13, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', lineHeight:1.7 }}>{s}</span></div>)}
            </div>
          )}
          {doc.usage.whenNot?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', letterSpacing:'0.1em', marginBottom:10 }}>AVOID</div>
              {doc.usage.whenNot.map((s,i) => <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}><span style={{ color:'#dc2626', fontSize:15, flexShrink:0, lineHeight:1.4 }}>✕</span><span style={{ fontSize:13, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', lineHeight:1.7 }}>{s}</span></div>)}
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {doc.usage.dos?.length > 0 && (
              <div style={{ padding:'14px', borderRadius:8, border:'1px solid #bbf7d0', background:'#f0fdf4' }}>
                <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'#166534', letterSpacing:'0.1em', marginBottom:8 }}>DO</div>
                {doc.usage.dos.map((s,i) => <div key={i} style={{ fontSize:12, color:'#166534', fontFamily:'var(--ds-font-body)', lineHeight:1.65, marginBottom:6 }}>↑ {s}</div>)}
              </div>
            )}
            {doc.usage.donts?.length > 0 && (
              <div style={{ padding:'14px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2' }}>
                <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'#991b1b', letterSpacing:'0.1em', marginBottom:8 }}>DON'T</div>
                {doc.usage.donts.map((s,i) => <div key={i} style={{ fontSize:12, color:'#991b1b', fontFamily:'var(--ds-font-body)', lineHeight:1.65, marginBottom:6 }}>↓ {s}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Anatomy' && doc && (
        <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth:580 }}>
          {doc.anatomy.map(a => (
            <div key={a.label} style={{ display:'flex', gap:14, padding:'13px 15px', borderRadius:9, border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', alignItems:'flex-start' }}>
              <span style={{ minWidth:26, height:26, borderRadius:6, background:'var(--ds-primary-l)', color:'var(--ds-primary)', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'var(--ds-font-mono)' }}>{a.label}</span>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)' }}>{a.name}</span>
                  {!a.required && <span style={{ fontSize:10, color:'var(--ds-text-muted)', fontStyle:'italic' }}>optional</span>}
                </div>
                <span style={{ fontSize:12, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.7 }}>{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'A11y' && doc && (
        <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:600 }}>
          {doc.a11y.keyboard?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', letterSpacing:'0.1em', marginBottom:10 }}>KEYBOARD</div>
              <div style={{ border:'1px solid var(--ds-border)', borderRadius:8, overflow:'hidden' }}>
                {doc.a11y.keyboard.map((k,i) => (
                  <div key={i} style={{ display:'flex', gap:16, padding:'10px 14px', borderBottom: i<doc.a11y.keyboard.length-1 ? '1px solid var(--ds-border)' : 'none', alignItems:'center' }}>
                    <kbd style={{ padding:'3px 10px', borderRadius:5, border:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)', fontSize:11, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', whiteSpace:'nowrap', flexShrink:0 }}>{k.key}</kbd>
                    <span style={{ fontSize:12, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', lineHeight:1.5 }}>{k.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {doc.a11y.aria?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', letterSpacing:'0.1em', marginBottom:10 }}>ARIA</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {doc.a11y.aria.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)', lineHeight:1.7, paddingLeft:12, borderLeft:'2px solid var(--ds-primary)' }}>{s}</div>)}
              </div>
            </div>
          )}
          {doc.a11y.notes?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', letterSpacing:'0.1em', marginBottom:10 }}>NOTES</div>
              {doc.a11y.notes.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.7, marginBottom:5 }}>— {s}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Grid card */
function ComponentCard({ comp, onClick }) {
  const [hovered, setHovered] = useState(false);
  const doc = COMPONENT_DOCS[comp.key] ?? null;
  const Mini = comp.mini;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:12,
        border:`1px solid ${hovered ? 'var(--ds-primary)' : 'var(--ds-border)'}`,
        background:'var(--ds-bg-elevated)',
        padding:'16px',
        cursor:'pointer',
        transition:'border-color .15s, box-shadow .15s, transform .12s',
        boxShadow: hovered ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display:'flex', flexDirection:'column', gap:14,
      }}
    >
      {/* Live mini preview */}
      <div style={{ padding:'14px', borderRadius:8, background:'var(--ds-bg)', border:'1px solid var(--ds-border)', minHeight:96, display:'flex', alignItems:'center' }}>
        <Mini/>
      </div>
      {/* Footer */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--ds-fg)', fontFamily:'var(--ds-font-body)' }}>{comp.key}</div>
          <span style={{ fontSize:9, fontWeight:700, fontFamily:'var(--ds-font-mono)', color: TIER_COLORS[comp.tier], padding:'2px 7px', borderRadius:4, border:`1px solid ${TIER_COLORS[comp.tier]}` }}>{comp.tier}</span>
        </div>
        <div style={{ fontSize:10, color:'var(--ds-primary)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5, opacity:0.8 }}>{comp.group}</div>
        {doc && <div style={{ fontSize:11.5, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.6 }}>{doc.description.slice(0,80)}…</div>}
        <div style={{ marginTop:10, fontSize:10, color: hovered ? 'var(--ds-primary)' : 'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', transition:'color .12s' }}>View component →</div>
      </div>
    </div>
  );
}

/* Grid overview + drill-in controller */
function ComponentLibraryView({ tokens, scopedVars }) {
  const [selected, setSelected] = useState(null);
  const comp = PROTO_COMPONENTS.find(c => c.key === selected);
  return (
    <div style={{ minHeight:'100%' }}>
      {!selected ? (
        <div>
          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', fontWeight:700, color:'var(--ds-primary)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, opacity:0.9 }}>Component Library</div>
            <div style={{ fontSize:24, fontWeight:700, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', letterSpacing:'-0.025em', lineHeight:1.2 }}>5-component preview</div>
            <div style={{ fontSize:13, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', marginTop:9, lineHeight:1.75 }}>
              Click any component to open its dedicated page — live preview, usage guidance, anatomy, and accessibility. Every preview reflects your current token choices in real time.
            </div>
          </div>
          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
            {PROTO_COMPONENTS.map(c => (
              <ComponentCard key={c.key} comp={c} onClick={() => setSelected(c.key)}/>
            ))}
          </div>
        </div>
      ) : comp ? (
        <ComponentDetailPage comp={comp} tokens={tokens} scopedVars={scopedVars} onBack={() => setSelected(null)}/>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PREVIEW: COMPONENTS  (web only — full scroll)
───────────────────────────────────────────────────────── */
function ComponentsPreview({ tokens }) {
  const matrixRef = useRef(null);
  useEffect(() => {
    if (!matrixRef.current) return;
    gsap.fromTo(matrixRef.current, { scale:1 }, { scale:1.012, duration:0.1, yoyo:true, repeat:1, ease:'power2.inOut' });
  }, [tokens]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:72 }}>

      {/* Color Roles — always first, orientation section */}
      <DSSection
        category="Color System"
        title="Color Roles"
        desc="How your palette swatches map to semantic roles. Primary drives CTAs and interactive elements. Secondary supports supporting UI structure. Tertiary provides accent variation."
      >
        <ColorRolesSection/>
      </DSSection>

      <ChapterGroup label="Interaction & Input">
        <DSSection
          category="Action"
          title="Buttons"
          desc="All button variants across every interactive state — Default, Hover, Active, Focus, Disabled, and Loading. Use Primary for main CTAs, Ghost for secondary actions, Danger for destructive operations."
        >
          <ButtonMatrix matrixRef={matrixRef}/>
        </DSSection>

        <DSSection
          category="Input"
          title="Text Fields"
          desc="Input lifecycle states: Default, Focused (primary ring + shadow), Error (inline message), Disabled (reduced opacity), and Success. Each state communicates feedback without relying on color alone."
        >
          <InputStates/>
        </DSSection>

        <DSSection
          category="Input"
          title="Form Controls"
          desc="The complete set of controls for structured data entry — checkboxes with indeterminate state, radio groups, toggle switches, styled selects, textareas, search bars, and drag-and-drop file upload."
        >
          <FormControlsSection/>
        </DSSection>

        <DSSection
          category="Input"
          title="Tag Input"
          desc="Inline multi-value input where each selection becomes a removable chip. Tags inherit color roles from your palette — Primary, Secondary, and Tertiary — making category distinction immediately visible."
        >
          <TagInputSection/>
        </DSSection>

        <DSSection
          category="Input"
          title="Range Sliders"
          desc="Numeric range controls with three palette color tracks demonstrating multi-role color application. Primary, Secondary, and Tertiary tracks show how your full swatch set works across input UI."
        >
          <SliderSection/>
        </DSSection>

        <DSSection
          category="Feedback"
          title="Rating Components"
          desc="Three rating patterns using distinct color roles: star rating in Primary, thumbs up/down in Secondary-500, and a numeric score display in Tertiary-500. Each solves a different UX need."
        >
          <RatingSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Navigation & Layout">
        <DSSection
          category="Navigation"
          title="Navigation Patterns"
          desc="Core wayfinding components: topbar with active-item highlight, sidebar nav, breadcrumb trail, horizontal tabs with bottom-border indicator, multi-step stepper showing progress, and pagination."
        >
          <NavigationSection/>
        </DSSection>

        <DSSection
          category="Layout"
          title="Sidebar Application Shell"
          desc="A full application shell with persistent sidebar navigation, content header with breadcrumb, and a stat overview grid. Uses Primary for active nav, Secondary for avatar, Tertiary for third metric."
        >
          <SidebarLayoutSection/>
        </DSSection>

        <DSSection
          category="Filtering"
          title="Data Filter Bar"
          desc="Compound filter pattern combining search input, dropdown facets, and an active-filter chips row with a Clear all action. Filter chips use Secondary-500 background to visually distinguish applied filters."
        >
          <DataFilterSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Data & Tables">
        <DSSection
          category="Data"
          title="Data Table"
          desc="Full-featured data table with sortable columns, row checkbox selection, status chips, inline action buttons (Edit / Delete), table footer with record count, and page-based pagination."
        >
          <DataTableSection/>
        </DSSection>

        <DSSection
          category="Data"
          title="Kanban Board"
          desc="Column-based task management layout with status headers and card stacks. The active 'In Progress' column uses Secondary-500 to distinguish workflow state from category status."
        >
          <KanbanSection/>
        </DSSection>

        <DSSection
          category="Data Visualization"
          title="Bar Chart"
          desc="Data visualization with three color roles mapped to bar groups — Primary, Secondary, and Tertiary — and a legend connecting bar color to semantic data categories."
        >
          <ChartSection/>
        </DSSection>

        <DSSection
          category="Data Visualization"
          title="Stats Grid"
          desc="2×3 metric card grid with left-border color coding per row. Row 1 uses Primary, Row 2 alternates Secondary and Tertiary. Each card shows a KPI value with trend delta indicator."
        >
          <StatsGridSection/>
        </DSSection>

        <DSSection
          category="Timeline"
          title="Event Timeline"
          desc="Vertical timeline with per-event color encoding — first events in Primary, later events in Secondary and Tertiary. Ideal for multi-category activity feeds and audit logs."
        >
          <TimelineSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Content & Cards">
        <DSSection
          category="Content"
          title="Cards"
          desc="Three card archetypes: feature card with gradient image header, profile card with avatar and stats, and a horizontal list card. Shadow depth and border-radius adapt directly from your shape tokens."
        >
          <CardsSection/>
        </DSSection>

        <DSSection
          category="Marketing"
          title="Pricing Cards"
          desc="Three-tier pricing layout. The featured 'Pro' tier uses Primary header color with visual elevation and a 'Most Popular' badge. Feature checkmarks use Secondary-500 for visual differentiation."
        >
          <PricingCardsSection/>
        </DSSection>

        <DSSection
          category="Feed"
          title="Data Display"
          desc="Stat overview cards using display typeface for KPI weight, an activity feed with color-coded avatars per team member, and a tag taxonomy row."
        >
          <DataDisplaySection/>
        </DSSection>

        <DSSection
          category="Notifications"
          title="Notification Panel"
          desc="Notification list where unread items receive a Primary-light background. Read items fall back to surface background. Secondary-500 powers the 'Mark all read' action link."
        >
          <NotificationPanelSection/>
        </DSSection>

        <DSSection
          category="Discussion"
          title="Comment Thread"
          desc="Two-level comment thread with nested replies. Avatar colors map to palette roles. Reply links use Primary, timestamps use muted text, and the nested reply has a left-border indent indicator."
        >
          <CommentThreadSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Overlays & Dialogs">
        <DSSection
          category="Overlay"
          title="Modals, Tooltips & Menus"
          desc="Floating UI components: confirmation dialog with action footer, tooltip and popover pair, a dropdown menu with a destructive item, and a command palette with keyboard shortcuts."
        >
          <OverlaysSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Feedback & Status">
        <DSSection
          category="Feedback"
          title="Alerts, Progress & States"
          desc="System feedback components: four alert banner variants (Info, Success, Warning, Error), multi-track progress bars, CSS shimmer skeleton loader, three spinner sizes, toast notification, and empty state."
        >
          <FeedbackSection/>
        </DSSection>

        <DSSection
          category="Taxonomy"
          title="Badges, Tags & Chips"
          desc="Label and status components: filled badge variants (Success, Warning, Error, Info, Neutral), dot status indicators, avatar sizes SM/MD/LG with initials fallback, and outline tag styles."
        >
          <BadgesSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Content Editing">
        <DSSection
          category="Editor"
          title="Rich Text Editor"
          desc="Toolbar + editable content area pattern. Active toolbar buttons use Primary-500 fill. The editor surface uses background-elevated. Demonstrates toolbar affordance and action grouping."
        >
          <RichTextEditorSection/>
        </DSSection>

        <DSSection
          category="Disclosure"
          title="Accordion"
          desc="Progressive disclosure pattern with animated chevron. First item expanded by default. Border-bottom dividers separate items. Content area uses body text color and line-height from type scale."
        >
          <AccordionSection/>
        </DSSection>

        <DSSection
          category="Input"
          title="Date Picker"
          desc="Calendar-based date selector with month navigation, a 7-column day grid, and selected date highlighted with Primary fill. Today's date uses a subtle dot indicator."
        >
          <DatePickerSection/>
        </DSSection>

        <DSSection
          category="Media"
          title="Video Player"
          desc="Static media player UI: 16:9 thumbnail area, playback controls bar with play/pause, a Primary-colored scrubber progress track, volume control, and fullscreen button."
        >
          <VideoPlayerSection/>
        </DSSection>
      </ChapterGroup>

      <ChapterGroup label="Animation & Motion">
        <DSSection
          category="Motion"
          title="Motion System"
          desc="Live animation demos for each motion token: button hover scale, card lift elevation, modal entrance, focus ring pulse, and page slide transition. Duration and easing adapt per selected preset."
        >
          <MotionSection tokens={tokens}/>
        </DSSection>
      </ChapterGroup>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STUB — Android (no longer rendered but kept to avoid errors)
───────────────────────────────────────────────────────── */
function AndroidComponentsPreview() {
  const [activeNav, setActiveNav] = useState(0);
  const [fabExpanded, setFabExpanded] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, fontFamily:'"Google Sans","Roboto",sans-serif' }}>

      {/* Material Top App Bar */}
      <div style={{ padding:'16px 16px 12px', background:'var(--ds-bg-elevated)', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:22, color:'var(--ds-fg)', cursor:'pointer' }}>☰</span>
        <span style={{ flex:1, fontSize:22, fontWeight:400, color:'var(--ds-fg)' }}>Inbox</span>
        <span style={{ fontSize:18, color:'var(--ds-fg)', cursor:'pointer', marginRight:8 }}>🔍</span>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--ds-primary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <span style={{ fontSize:13, color:'#fff', fontWeight:700 }}>A</span>
        </div>
      </div>

      {/* M3 Cards */}
      <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:8, background:'var(--ds-bg)' }}>
        <div style={{ fontSize:11, color:'var(--ds-text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>Cards</div>
        <div style={{ borderRadius:12, background:'var(--ds-bg-elevated)', padding:'16px', boxShadow:'0 1px 2px rgba(0,0,0,0.1),0 2px 6px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize:22, fontWeight:400, color:'var(--ds-fg)', marginBottom:4 }}>Card Title</div>
          <div style={{ fontSize:14, color:'var(--ds-text-muted)', lineHeight:1.5, marginBottom:12 }}>Supporting text describing this card's content briefly.</div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ padding:'10px 24px', borderRadius:100, border:'none', background:'var(--ds-primary)', color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Action</button>
            <button style={{ padding:'10px 24px', borderRadius:100, border:`1px solid var(--ds-border)`, background:'transparent', color:'var(--ds-primary)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Learn more</button>
          </div>
        </div>

        {/* M3 outlined card */}
        <div style={{ borderRadius:12, border:'1px solid var(--ds-border)', padding:'14px 16px', background:'var(--ds-bg)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--ds-primary-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:18 }}>📊</span>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ds-fg)' }}>Analytics</div>
              <div style={{ fontSize:12, color:'var(--ds-text-muted)' }}>Updated just now</div>
            </div>
            <span style={{ marginLeft:'auto', fontSize:18, color:'var(--ds-text-muted)' }}>›</span>
          </div>
        </div>
      </div>

      {/* M3 Button types */}
      <div style={{ padding:'12px 16px', background:'var(--ds-bg)' }}>
        <div style={{ fontSize:11, color:'var(--ds-text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Buttons</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button style={{ padding:'10px 24px', borderRadius:100, border:'none', background:'var(--ds-primary)', color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}>Filled</button>
          <button style={{ padding:'10px 24px', borderRadius:100, border:'none', background:'var(--ds-primary-l)', color:'var(--ds-primary-h)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Tonal</button>
          <button style={{ padding:'10px 24px', borderRadius:100, border:'1px solid var(--ds-border)', background:'transparent', color:'var(--ds-primary)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Outlined</button>
          <button style={{ padding:'10px 24px', borderRadius:100, border:'none', background:'transparent', color:'var(--ds-primary)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Text</button>
        </div>
      </div>

      {/* FAB */}
      <div style={{ padding:'12px 16px', background:'var(--ds-bg)', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:11, color:'var(--ds-text-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>FAB</div>
        <div onClick={() => setFabExpanded(f=>!f)}
          style={{ display:'flex', alignItems:'center', gap: fabExpanded ? 8 : 0, padding: fabExpanded ? '14px 20px' : '14px', borderRadius:16, background:'var(--ds-primary-l)', color:'var(--ds-primary-h)', cursor:'pointer', boxShadow:'0 3px 8px rgba(0,0,0,0.15)', transition:'all .25s', overflow:'hidden' }}>
          <span style={{ fontSize:22 }}>✏</span>
          {fabExpanded && <span style={{ fontSize:14, fontWeight:500, whiteSpace:'nowrap', fontFamily:'inherit' }}>Compose</span>}
        </div>
      </div>

      {/* M3 Bottom Navigation */}
      <div style={{ borderTop:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', display:'flex', justifyContent:'space-around', padding:'4px 0', marginTop:12 }}>
        {[['⊞','Home'],['📨','Mail'],['📅','Calendar'],['⊙','Profile']].map(([icon,label],i) => (
          <button key={label} onClick={() => setActiveNav(i)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'8px 16px', border:'none', background:'none', cursor:'pointer', position:'relative', fontFamily:'inherit', minWidth:48 }}>
            {i === activeNav && <div style={{ position:'absolute', top:4, left:'50%', transform:'translateX(-50%)', width:56, height:28, borderRadius:14, background:'var(--ds-primary-l)' }}/>}
            <span style={{ fontSize:20, position:'relative', zIndex:1 }}>{icon}</span>
            <span style={{ fontSize:11, color: i===activeNav ? 'var(--ds-fg)' : 'var(--ds-text-muted)', fontWeight: i===activeNav ? 600 : 400, position:'relative', zIndex:1 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DS ONLY — Token grid, no device shell
───────────────────────────────────────────────────────── */
function DSOnlyPreview({ tokens }) {
  const { palette } = computeTokens(tokens);
  const COLOR_NAMES = ['Primary','Secondary','Tertiary','Accent','Neutral','Warning'];
  const SHADE_KEYS  = [50,100,200,300,400,500,600,700,800,900];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <SectionLabel>Full Token Palette — All Scales</SectionLabel>
      {palette.map((shades, ci) => (
        <div key={ci}>
          <div style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', marginBottom:6 }}>{COLOR_NAMES[ci] ?? `Color ${ci+1}`}</div>
          <div style={{ display:'flex', borderRadius:'var(--ds-radius)', overflow:'hidden', boxShadow:'var(--ds-shadow-sm)' }}>
            {SHADE_KEYS.map(k => (
              <div key={k} style={{ flex:1, minWidth:0 }}>
                <div style={{ height:48, background:shades[k] ?? '#ccc' }} title={`${k}: ${shades[k]}`}/>
                <div style={{ padding:'4px 0', textAlign:'center', background:'var(--ds-bg-elevated)', borderTop:'1px solid var(--ds-border)' }}>
                  <div style={{ fontSize:7, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>{k}</div>
                  <div style={{ fontSize:7, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>{(shades[k]??'').slice(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Semantic tokens summary */}
      <SectionLabel>Semantic Tokens</SectionLabel>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:8 }}>
        {[
          { label:'Background', var:'--ds-bg' },
          { label:'Surface', var:'--ds-bg-elevated' },
          { label:'Subtle', var:'--ds-bg-subtle' },
          { label:'Foreground', var:'--ds-fg' },
          { label:'Muted text', var:'--ds-fg-muted' },
          { label:'Primary', var:'--ds-primary' },
          { label:'Primary hover', var:'--ds-primary-h' },
          { label:'Primary subtle', var:'--ds-primary-l' },
          { label:'Border', var:'--ds-border' },
          { label:'Border strong', var:'--ds-border-strong' },
        ].map(({ label, var: v }) => (
          <div key={v} style={{ borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
            <div style={{ height:32, background:`var(${v})`, borderBottom:'1px solid var(--ds-border)' }}/>
            <div style={{ padding:'4px 6px' }}>
              <div style={{ fontSize:9, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', fontWeight:600 }}>{label}</div>
              <div style={{ fontSize:8, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)' }}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   PREVIEW: TYPOGRAPHY
───────────────────────────────────────────────────────── */
function TypographyPreview({ tokens }) {
  const typeScale = useMemo(() => generateTypeScale(tokens.typography.baseSize, tokens.typography.scale), [tokens.typography]);
  // Use token values directly for font families so sample text shows the actual chosen font
  const fontDisplay = `'${tokens.typography.display}', serif`;
  const fontBody    = `'${tokens.typography.body}', sans-serif`;
  const fontMono    = `'${tokens.typography.mono}', monospace`;
  const levels = [
    { key:'4xl', role:'Display',     weight:700, font:fontDisplay, sample:'The Art of Systems' },
    { key:'3xl', role:'H1',          weight:700, font:fontDisplay, sample:'Building with Tokens' },
    { key:'2xl', role:'H2',          weight:600, font:fontDisplay, sample:'Colour & Typography' },
    { key:'xl',  role:'H3',          weight:600, font:fontBody,    sample:'Consistent, Accessible Design' },
    { key:'lg',  role:'Lead',        weight:400, font:fontBody,    sample:'Design systems create a shared language between design and code.' },
    { key:'base',role:'Body',        weight:400, font:fontBody,    sample:'Every value in a design system should encode a deliberate decision about aesthetics, usability, or brand identity.' },
    { key:'sm',  role:'Label',       weight:500, font:fontBody,    sample:'REQUIRED · MAX 48 CHARACTERS' },
    { key:'xs',  role:'Mono/Caption',weight:400, font:fontMono,    sample:'const radius = tokens.shape.border;' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:36 }}>

      {/* Font metadata card */}
      <div style={{ display:'flex', gap:0, borderRadius:CHROME.radius, border:`1px solid ${CHROME.borderColor}`, overflow:'hidden' }}>
        {[['Display', tokens.typography.display, 'Headings & titles'],['Body', tokens.typography.body, 'Prose & UI labels'],['Mono', tokens.typography.mono, 'Code & tokens']].map(([l, v, sub], i, arr) => (
          <div key={l} style={{ flex:1, padding:'12px 16px', borderRight: i < arr.length-1 ? `1px solid ${CHROME.borderColor}` : 'none', background: i===0 ? CHROME.bgSubtle : CHROME.bgBase }}>
            <div style={{ fontSize:8, color:CHROME.fgMuted, fontFamily:CHROME.mono, letterSpacing:'0.08em', marginBottom:5 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:13, color:CHROME.fg, fontFamily:CHROME.mono, fontWeight:600, marginBottom:3 }}>{v}</div>
            <div style={{ fontSize:10, color:CHROME.fgMuted, fontFamily:CHROME.sans }}>{sub}</div>
          </div>
        ))}
        <div style={{ flex:0, padding:'12px 16px', background:CHROME.bgBase, display:'flex', flexDirection:'column', justifyContent:'center', borderLeft:`1px solid ${CHROME.borderColor}`, minWidth:80 }}>
          <div style={{ fontSize:8, color:CHROME.fgMuted, fontFamily:CHROME.mono, letterSpacing:'0.08em', marginBottom:5 }}>SCALE</div>
          <div style={{ fontSize:13, color:CHROME.accent, fontFamily:CHROME.mono, fontWeight:700 }}>×{tokens.typography.scale}</div>
          <div style={{ fontSize:10, color:CHROME.fgMuted, fontFamily:CHROME.sans, marginTop:3 }}>ratio</div>
        </div>
      </div>

      {/* Type scale samples */}
      <div>
        <div style={{ fontSize:10, fontFamily:CHROME.mono, fontWeight:700, color:CHROME.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, opacity:0.9 }}>Type Scale</div>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {levels.map(({ key, role, weight, font, sample }) => (
            <div key={key} style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:16, padding:'14px 0', borderBottom:`1px solid ${CHROME.borderColor}` }}>
              <div style={{ paddingTop:4 }}>
                <div style={{ fontSize:9, color:CHROME.fgMuted, fontFamily:CHROME.mono, marginBottom:3 }}>{role}</div>
                <div style={{ fontSize:11, color:CHROME.accent, fontFamily:CHROME.mono, fontWeight:700 }}>{Math.round(typeScale[key])}px</div>
                <div style={{ fontSize:8, color:CHROME.fgMuted, fontFamily:CHROME.mono, marginTop:2 }}>{+(typeScale[key]/16).toFixed(2)}rem</div>
              </div>
              <div style={{
                fontSize: Math.min(typeScale[key], ['4xl','3xl'].includes(key) ? (key==='4xl' ? 44 : 34) : 999),
                fontWeight: weight, fontFamily: font, color:CHROME.fg,
                lineHeight: weight >= 600 ? 1.15 : 1.65,
                letterSpacing: weight >= 700 ? '-0.03em' : weight >= 600 ? '-0.01em' : '0',
                overflow:'hidden', display:'-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient:'vertical',
              }}>{sample}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   TASK 3.2 — LAYOUT PREVIEW TAB
───────────────────────────────────────────────────────── */
const BREAKPOINTS = [
  { key:'xs', px:375 }, { key:'sm', px:640 }, { key:'md', px:768 },
  { key:'lg', px:1024 }, { key:'xl', px:1280 }, { key:'2xl', px:1536 },
];
const Z_LAYERS = [
  { key:'base',     z:0,   color:'rgba(99,102,241,0.15)'  },
  { key:'raised',   z:10,  color:'rgba(99,102,241,0.22)'  },
  { key:'dropdown', z:100, color:'rgba(139,92,246,0.28)'  },
  { key:'sticky',   z:200, color:'rgba(168,85,247,0.33)'  },
  { key:'overlay',  z:300, color:'rgba(217,70,239,0.35)'  },
  { key:'modal',    z:400, color:'rgba(236,72,153,0.38)'  },
  { key:'toast',    z:500, color:'rgba(239,68,68,0.40)'   },
];

function LayoutPreview({ tokens }) {
  const { primitive, layout } = useMemo(() => computeAllTokens(tokens, 'light'), [tokens]);
  const { spacingSteps } = primitive;
  const cols      = parseInt(layout['layout.grid.columns'] ?? '12');
  const gutterPx  = parseInt(layout['layout.grid.gutter']  ?? '24');
  const scaleKey  = (tokens.spacing?.scale === 'fibonacci') ? 'fib' : 'sp';
  const maxSpacing = Math.max(...(spacingSteps.slice(0, 16).filter(Number.isFinite)), 1);

  const micro = spacingSteps.slice(0, 3);
  const base  = spacingSteps.slice(3, 8);
  const macro = spacingSteps.slice(8, 16);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:56 }}>

      {/* ── Grid Visualizer ── */}
      <DSSection
        staticChrome
        category="Grid"
        title="Column Grid"
        desc="A column grid defines the horizontal rhythm of layouts. Column count adapts by viewport — 4 on mobile, 8 on tablet, 12+ on desktop — with consistent gutters maintaining visual breathing room."
      >
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Full grid visualization */}
          <div style={{ position:'relative', height:72, borderRadius:CHROME.radius, overflow:'hidden', border:`1px solid ${CHROME.borderColor}`, background:CHROME.bgSubtle }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} style={{
                position:'absolute',
                left:`calc(${(i/cols)*100}% + ${gutterPx/2}px)`,
                width:`calc(${(1/cols)*100}% - ${gutterPx}px)`,
                top:8, bottom:8,
                background:'rgba(99,102,241,0.22)',
                borderRadius:2,
              }}/>
            ))}
            {/* Gutter markers */}
            {Array.from({ length: cols - 1 }).map((_, i) => (
              <div key={`g${i}`} style={{
                position:'absolute',
                left:`calc(${((i+1)/cols)*100}% - ${gutterPx/2}px)`,
                width:gutterPx,
                top:8, bottom:8,
                background:'rgba(99,102,241,0.06)',
              }}/>
            ))}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:10, fontFamily:CHROME.mono, color:CHROME.fgMuted, fontWeight:600 }}>{cols} columns</span>
              <span style={{ fontSize:10, color:CHROME.borderStrong }}>·</span>
              <span style={{ fontSize:10, fontFamily:CHROME.mono, color:CHROME.fgMuted }}>{gutterPx}px gutter</span>
              <span style={{ fontSize:10, color:CHROME.borderStrong }}>·</span>
              <span style={{ fontSize:10, fontFamily:CHROME.mono, color:CHROME.fgMuted }}>{Math.round((100 - gutterPx * (cols-1) / 7.68) / cols * 10) / 10}% column width</span>
            </div>
          </div>
          {/* Column count examples */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Mobile', cols:4, desc:'4 columns' },
              { label:'Tablet', cols:8, desc:'8 columns' },
              { label:'Desktop', cols:cols, desc:`${cols} columns` },
            ].map(({ label, cols: c, desc }) => (
              <div key={label} style={{ padding:'10px 12px', borderRadius:CHROME.radius, border:`1px solid ${CHROME.borderColor}`, background:CHROME.bgBase }}>
                <div style={{ display:'flex', gap:2, marginBottom:6, height:16 }}>
                  {Array.from({ length: c }).map((_, i) => (
                    <div key={i} style={{ flex:1, borderRadius:1, background:'rgba(99,102,241,0.28)' }}/>
                  ))}
                </div>
                <div style={{ fontSize:10, fontWeight:600, fontFamily:CHROME.sans, color:CHROME.fg }}>{label}</div>
                <div style={{ fontSize:10, fontFamily:CHROME.mono, color:CHROME.fgMuted, fontWeight:600 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ── Breakpoint Ruler ── */}
      <DSSection
        staticChrome
        category="Responsive"
        title="Breakpoints"
        desc="Six breakpoints define how layouts adapt across screen sizes — from 375px mobile up to 1536px wide-screen. Each breakpoint is a CSS min-width threshold."
      >
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Ruler */}
          <div style={{ position:'relative', height:64, paddingTop:24 }}>
            <div style={{ position:'absolute', left:0, right:0, top:32, height:2, background:CHROME.borderColor, borderRadius:2 }}/>
            {BREAKPOINTS.map(({ key, px }) => {
              const maxPx = 1536;
              const pct   = (px / maxPx) * 100;
              return (
                <div key={key} style={{ position:'absolute', left:`${pct}%`, top:22, transform:'translateX(-50%)' }}>
                  <div style={{ width:1.5, height:18, background:CHROME.borderStrong, margin:'0 auto' }}/>
                  <div style={{ fontSize:10, fontFamily:CHROME.mono, color:CHROME.fgMuted, textAlign:'center', whiteSpace:'nowrap', marginTop:4, lineHeight:1.4 }}>
                    <span style={{ fontWeight:700 }}>{key}</span><br/>{px}px
                  </div>
                </div>
              );
            })}
          </div>
          {/* Breakpoint chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {BREAKPOINTS.map(({ key, px }) => (
              <div key={key} style={{ padding:'8px 16px', borderRadius:CHROME.radius, border:`1px solid ${CHROME.borderColor}`, background:CHROME.bgBase, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:CHROME.mono, color:CHROME.fg, minWidth:24 }}>{key}</span>
                <span style={{ fontSize:12, fontFamily:CHROME.mono, color:CHROME.fgMuted }}>{px}px</span>
                <span style={{ fontSize:11, fontFamily:CHROME.mono, color:'#6366f1', opacity:0.8 }}>{(px/16).toFixed(0)}rem</span>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ── Spacing Scale ── */}
      <DSSection
        staticChrome
        category="Spacing"
        title="Spacing Scale"
        desc="A structured spacing scale grouped into three tiers — Micro for tight inline gaps, Base for component padding and card spacing, and Macro for section and page-level layout margins."
      >
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {[['Micro', micro, 0, 'Inline gaps, icon margins, dense list padding'], ['Base', base, 3, 'Component padding, card gaps, form spacing'], ['Macro', macro, 8, 'Section gaps, page margins, layout spacing']].map(([gLabel, steps, offset, desc]) => (
            <div key={gLabel}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:9, fontFamily:CHROME.mono, fontWeight:700, color:'#6366f1', letterSpacing:'0.1em', textTransform:'uppercase' }}>{gLabel}</span>
                <span style={{ fontSize:10, color:CHROME.fgMuted, fontFamily:CHROME.sans }}>{desc}</span>
              </div>
              <div style={{ borderRadius:CHROME.radius, overflow:'hidden', border:`1px solid ${CHROME.borderColor}` }}>
                {steps.map((val, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'56px 1fr 52px 52px', gap:10, alignItems:'center', padding:'6px 12px', borderBottom: i < steps.length-1 ? `1px solid ${CHROME.borderColor}` : 'none', background: i%2===0 ? 'transparent' : CHROME.bgSubtle }}>
                    <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600 }}>{scaleKey}-{offset+i+1}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ height:8, width:`${Math.max(4, (val/maxSpacing)*100)}%`, background:'rgba(99,102,241,0.55)', borderRadius:2, opacity:0.45+((offset+i)/20)*0.55, transition:'width .3s', minWidth:4, maxWidth:'100%', flexShrink:0 }}/>
                    </div>
                    <span style={{ fontSize:9, fontFamily:CHROME.mono, color:CHROME.fg, textAlign:'right', fontWeight:600 }}>{val}px</span>
                    <span style={{ fontSize:10, fontFamily:CHROME.mono, color:'var(--ds-text-muted)', fontWeight:600, textAlign:'right' }}>{+(val/16).toFixed(2)}rem</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* ── Z-Index Stack ── */}
      <DSSection
        staticChrome
        category="Layering"
        title="Z-Index Stack"
        desc="Seven stacking layers define the elevation hierarchy of floating UI. Each layer maps to a semantic name — Base content sits at 0, Toasts surface at 500 to always appear on top."
      >
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[...Z_LAYERS].reverse().map(({ key, z, color }, i) => {
            const ri = Z_LAYERS.length - 1 - i;
            return (
              <div key={key} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderRadius:CHROME.radius,
                background: color,
                border:'1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{ width:32, height:32, borderRadius:CHROME.radiusSm, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontFamily:CHROME.mono, color:'#fff', fontWeight:700 }}>{ri}</span>
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontFamily:CHROME.mono, color:CHROME.fg, fontWeight:700 }}>{key}</span>
                </div>
                <span style={{ fontSize:11, fontFamily:CHROME.mono, color:CHROME.fgMuted }}>z-index: {z}</span>
              </div>
            );
          })}
        </div>
      </DSSection>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PREVIEW: WCAG AUDIT
───────────────────────────────────────────────────────── */
function AuditPreview({ tokens, mode, onTokenChange }) {
  const issues = useMemo(() => auditTokens(tokens, mode), [tokens, mode]);
  const dq     = useMemo(() => auditDesignQuality(tokens), [tokens]);

  const errors   = issues.filter(i=>i.level==='error');
  const warnings = issues.filter(i=>i.level==='warning');
  const passes   = issues.filter(i=>i.level==='pass');
  const score    = Math.round((passes.length / issues.length) * 100);

  const [dqExpanded, setDqExpanded] = useState(null);

  // Gap #4: strategy dropdown state
  const [fixedId,   setFixedId]   = useState(null);
  const [fixOpenId, setFixOpenId] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!fixOpenId) return;
    const handler = (e) => {
      if (!e.target.closest('[data-fix-dropdown]')) setFixOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [fixOpenId]);

  const applyStrategy = (strategy, issueId) => {
    if (!onTokenChange || !strategy.apply) return;
    onTokenChange(prev => {
      const patch = strategy.apply(prev);
      return patch ? { ...prev, ...patch } : prev;
    });
    setFixedId(issueId);
    setFixOpenId(null);
    setTimeout(() => setFixedId(null), 1800);
  };

  const { primitive: { palette }, semantic } = useMemo(() => computeAllTokens(tokens, mode), [tokens, mode]);
  const p = palette[0] ?? {};
  const { baseHue: _auditBH, saturation: _auditSat } = getColorBase(tokens);
  const bg   = semantic['color.background.base']  ?? (mode==='dark' ? hslToHex(_auditBH,Math.min(_auditSat*0.14,11),8) : '#ffffff');
  const prim = semantic['color.action.primary']   ?? (mode==='dark' ? (p[400]??'#60a5fa') : (p[500]??'#4f46e5'));
  const fg   = semantic['color.text.primary']     ?? (mode==='dark' ? '#f2efe9' : (p[900]??'#111111'));

  const matrixRows = [
    { label:'Primary vs White',  hex1:prim,  hex2:'#ffffff' },
    { label:'Primary vs Black',  hex1:prim,  hex2:'#111111' },
    { label:'Body text vs BG',   hex1:fg,    hex2:bg },
    { label:'Muted text vs BG',  hex1: mode==='dark' ? 'rgba(242,239,233,0.40)' : (p[500]??'#6b7280'), hex2:bg },
    { label:'White on Primary',  hex1:'#ffffff', hex2:prim },
    { label:'Primary vs Subtle', hex1:prim,  hex2: mode==='dark'?hslToHex(_auditBH,Math.min(_auditSat*0.14,11),17):(p[50]??'#f8f9fa') },
  ];

  const levelIcon  = { error:'✕', warning:'⚠', pass:'✓' };
  const levelColor = { error:'#ef4444', warning:'#f59e0b', pass:'#22c55e' };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:24 }}>

      {/* ── Dual score cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* WCAG score */}
        <div style={{
          padding:'16px 18px', borderRadius:12,
          background: score>=80?'#dcfce7':score>=60?'#fef9c3':'#fee2e2',
          border:`1px solid ${score>=80?'#86efac':score>=60?'#fde047':'#fca5a5'}`,
        }}>
          <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.mono,letterSpacing:'0.08em',color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b',marginBottom:8 }}>WCAG ACCESSIBILITY</div>
          <div style={{ fontSize:32,fontWeight:800,fontFamily:CHROME.sans,color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b',lineHeight:1,marginBottom:6 }}>
            {score}%
          </div>
          <div style={{ fontSize:12,fontFamily:CHROME.sans,color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b',opacity:0.8 }}>
            {passes.length} passed · {warnings.length} warn · {errors.length} err
          </div>
        </div>
        {/* Design Quality score */}
        <div style={{
          padding:'16px 18px', borderRadius:12,
          background: dq.score>=80?'#dbeafe':dq.score>=60?'#fef9c3':'#fee2e2',
          border:`1px solid ${dq.score>=80?'#93c5fd':dq.score>=60?'#fde047':'#fca5a5'}`,
        }}>
          <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.mono,letterSpacing:'0.08em',color:dq.score>=80?'#1e40af':dq.score>=60?'#854d0e':'#991b1b',marginBottom:8 }}>DESIGN QUALITY</div>
          <div style={{ fontSize:32,fontWeight:800,fontFamily:CHROME.sans,color:dq.score>=80?'#1e40af':dq.score>=60?'#854d0e':'#991b1b',lineHeight:1,marginBottom:6 }}>
            {dq.score}%
          </div>
          <div style={{ fontSize:12,fontFamily:CHROME.sans,color:dq.score>=80?'#1e40af':dq.score>=60?'#854d0e':'#991b1b',opacity:0.8 }}>
            {dq.checks.filter(c=>c.pass).length}/{dq.checks.length} checks passing
          </div>
        </div>
      </div>

      {/* Contrast matrix */}
      <div>
        <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.sans,color:CHROME.fg,marginBottom:10,letterSpacing:'0.02em' }}>Contrast Matrix</div>
        <div style={{ display:'flex',flexDirection:'column',gap:0,borderRadius:CHROME.radius,border:`1px solid ${CHROME.borderColor}`,overflow:'hidden' }}>
          {matrixRows.map(({ label,hex1,hex2 },i) => {
            let ratio;
            try { ratio = getContrastRatio(hex1.startsWith('rgba')?hex1.replace(/[\d.]+\)$/,()=>'1)'):hex1, hex2.startsWith('rgba')?'#6b7280':hex2); } catch { ratio = 1; }
            const { level, color } = wcagLevel(ratio);
            return (
              <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr auto auto',alignItems:'center',gap:12,padding:'9px 12px',background:i%2===0?'transparent':'rgba(0,0,0,0.02)',borderBottom:i<matrixRows.length-1?`1px solid ${CHROME.borderColor}`:'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <div style={{ width:16,height:16,borderRadius:3,background:hex1.startsWith('rgba')?'rgba(107,114,128,0.4)':hex1,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0 }}/>
                  <div style={{ width:16,height:16,borderRadius:3,background:hex2.startsWith('rgba')?'#f8f9fa':hex2,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0 }}/>
                  <span style={{ fontSize:11,fontFamily:CHROME.sans,color:CHROME.fg }}>{label}</span>
                </div>
                <span style={{ fontSize:11,fontFamily:CHROME.mono,color:CHROME.fgMuted,minWidth:40,textAlign:'right' }}>{ratio.toFixed(1)}:1</span>
                <span style={{ fontSize:10,fontFamily:CHROME.mono,color,fontWeight:700,minWidth:36,textAlign:'right' }}>{level}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Design Quality checks ── */}
      <div>
        <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.sans,color:'#1e40af',marginBottom:10,display:'flex',alignItems:'center',gap:5,letterSpacing:'0.02em' }}>
          ◈ DESIGN QUALITY CHECKS
          <span style={{ fontWeight:400,color:CHROME.fgMuted,fontSize:9 }}>({dq.checks.length} checks)</span>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
          {dq.checks.map((check) => {
            const isOpen = dqExpanded === check.id;
            const lvlColor = check.pass ? '#22c55e' : check.severity === 'error' ? '#ef4444' : check.severity === 'warning' ? '#f59e0b' : '#6b7280';
            const lvlBg    = check.pass ? '#dcfce7' : check.severity === 'error' ? '#fee2e2' : check.severity === 'warning' ? '#fefce8' : 'rgba(0,0,0,0.03)';
            const lvlBorder= check.pass ? CHROME.borderColor : check.severity === 'error' ? '#fca5a5' : check.severity === 'warning' ? '#fde047' : CHROME.borderColor;
            return (
              <div key={check.id} style={{ borderRadius:CHROME.radius,border:`1px solid ${lvlBorder}`,background:lvlBg,overflow:'hidden' }}>
                <button
                  onClick={() => setDqExpanded(isOpen ? null : check.id)}
                  style={{ width:'100%',padding:'9px 12px',background:'none',border:'none',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'flex-start',gap:7 }}>
                  <span style={{ fontSize:10,fontWeight:700,color:lvlColor,flexShrink:0,marginTop:1 }}>
                    {check.pass ? '✓' : check.severity === 'error' ? '✕' : '⚠'}
                  </span>
                  <span style={{ flex:1,fontSize:11,fontFamily:CHROME.sans,color:check.pass?'#166534':check.severity==='error'?'#991b1b':'#854d0e',lineHeight:1.5 }}>
                    {check.label}
                  </span>
                  <span style={{ fontSize:9,color:CHROME.fgMuted,flexShrink:0,marginTop:2 }}>{isOpen?'▲':'▾'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding:'0 12px 10px 28px' }}>
                    <div style={{ fontSize:11,color:check.pass?'#166534':check.severity==='error'?'#991b1b':'#854d0e',lineHeight:1.55,marginBottom:4 }}>{check.message}</div>
                    {check.detail && <div style={{ fontSize:10,color:CHROME.fgMuted,lineHeight:1.6 }}>{check.detail}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WCAG Issues section header ── */}
      <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.sans,color:'#166534',marginBottom:-16,display:'flex',alignItems:'center',gap:5,letterSpacing:'0.02em' }}>
        ✓ WCAG ACCESSIBILITY CHECKS
        <span style={{ fontWeight:400,color:CHROME.fgMuted,fontSize:9 }}>({issues.length} checks)</span>
      </div>

      {/* Issues list */}
      {['error','warning','pass'].map(lvl => {
        const group = { error:errors, warning:warnings, pass:passes }[lvl];
        if (!group.length) return null;
        return (
          <div key={lvl}>
            <div style={{ fontSize:10,fontWeight:700,fontFamily:CHROME.sans,color:levelColor[lvl],marginBottom:8,display:'flex',alignItems:'center',gap:5 }}>
              <span>{levelIcon[lvl]}</span>
              {lvl==='error'?'Errors':lvl==='warning'?'Warnings':'Passing checks'}
              <span style={{ fontWeight:400,color:CHROME.fgMuted,fontSize:9 }}>({group.length})</span>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
              {group.map((issue) => {
                const justFixed = fixedId === issue.id;
                return (
                  <motion.div key={issue.id}
                    animate={justFixed ? { scale:[1,1.02,1], backgroundColor:['#dcfce8','#dcfce8'] } : {}}
                    transition={{ duration:.4 }}
                    style={{ padding:'9px 12px',borderRadius:CHROME.radius,border:`1px solid ${justFixed?'#86efac':lvl==='pass'?CHROME.borderColor:lvl==='error'?'#fca5a5':'#fde047'}`,background:justFixed?'#dcfce8':lvl==='pass'?CHROME.bgSubtle:lvl==='error'?'#fee2e2':'#fefce8',transition:'border .3s,background .3s' }}>
                    <div style={{ display:'flex',alignItems:'flex-start',gap:7 }}>
                      <span style={{ fontSize:9,padding:'1px 5px',borderRadius:3,background:lvl==='pass'?'#dcfce7':lvl==='error'?'#fca5a5':'#fde047',color:lvl==='pass'?'#166534':lvl==='error'?'#991b1b':'#854d0e',fontFamily:CHROME.mono,fontWeight:700,flexShrink:0,marginTop:2 }}>{issue.category ?? issue.cat}</span>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:11,fontFamily:CHROME.sans,color:justFixed?'#166534':lvl==='pass'?'#166534':lvl==='error'?'#991b1b':'#854d0e',lineHeight:1.5 }}>
                          {justFixed ? '✓ Fixed!' : (issue.message ?? issue.msg)}
                        </span>
                        {(issue.suggestion ?? issue.fix) && !justFixed && (
                          <div style={{ fontSize:10,fontFamily:CHROME.sans,color:lvl==='error'?'#b91c1c':'#92400e',opacity:0.8,marginTop:2 }}>
                            → {issue.suggestion ?? issue.fix}
                          </div>
                        )}
                      </div>
                      {/* Gap #4: Fix options dropdown */}
                      {issue.autoFixKey && onTokenChange && lvl !== 'pass' && (
                        <div data-fix-dropdown style={{ position:'relative', flexShrink:0 }}>
                          <button
                            onClick={() => setFixOpenId(fixOpenId === issue.id ? null : issue.id)}
                            style={{
                              padding:'3px 8px', borderRadius:4,
                              border:`1px solid ${lvl==='error'?'#fca5a5':'#fde047'}`,
                              background: fixOpenId === issue.id ? (lvl==='error'?'#fee2e2':'#fef9c3') : 'rgba(255,255,255,0.6)',
                              color:lvl==='error'?'#991b1b':'#854d0e',
                              fontSize:9, cursor:'pointer', fontFamily:'"Geist Mono",monospace',
                              fontWeight:600, transition:'all .12s', display:'flex', alignItems:'center', gap:3,
                            }}>
                            Fix <span style={{ fontSize:7, opacity:0.7 }}>▾</span>
                          </button>
                          {fixOpenId === issue.id && (() => {
                            const strategies = getAutoFix(issue.autoFixKey, tokens);
                            if (!strategies) return null;
                            return (
                              <div style={{
                                position:'absolute', right:0, top:'calc(100% + 3px)', zIndex:30,
                                background:'#fff', border:'1px solid rgba(0,0,0,0.12)', borderRadius:8,
                                boxShadow:'0 4px 20px rgba(0,0,0,0.10)', minWidth:200, overflow:'hidden',
                              }}>
                                {strategies.map((strategy, idx) => (
                                  <button key={idx}
                                    onClick={() => applyStrategy(strategy, issue.id)}
                                    disabled={!strategy.apply}
                                    style={{
                                      width:'100%', padding:'9px 12px', border:'none',
                                      background:'transparent', textAlign:'left',
                                      cursor: strategy.apply ? 'pointer' : 'default',
                                      borderBottom: idx < strategies.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                      opacity: strategy.apply ? 1 : 0.55,
                                    }}
                                    onMouseEnter={e => { if (strategy.apply) e.currentTarget.style.background='#f8f8f7'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                                  >
                                    <div style={{ fontSize:11, fontWeight:600, color: strategy.locked?'#f59e0b':'#1a1814', fontFamily:'"Geist Sans",system-ui', display:'flex', alignItems:'center', gap:4 }}>
                                      {strategy.locked && <span style={{ fontSize:10 }}>🔒</span>}
                                      {strategy.label}
                                    </div>
                                    <div style={{ fontSize:10, color:'rgba(0,0,0,0.42)', fontFamily:'"Geist Sans",system-ui', marginTop:1 }}>
                                      {strategy.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TASK 1.5 — HIERARCHY DIAGRAM
───────────────────────────────────────────────────────── */
const HIER_NODES = [
  { label:'Palette',          sub:'raw hue · saturation math',               dot:'#7c3aed' },
  { label:'Primitive Tokens', sub:'--color-primary-500 · --space-4',          dot:'#2563eb' },
  { label:'Semantic Tokens',  sub:'--color-action-primary · --color-text-muted', dot:'#0891b2' },
  { label:'Component Tokens', sub:'--button-radius · --card-shadow',          dot:'#059669' },
  { label:'UI Components',    sub:'Buttons · Cards · Forms · Nav',            dot:'#c8602a' },
];
const NODE_H = 44; // px per node row

function HierarchyDiagram() {
  const dotRef = useRef(null);
  const totalH = NODE_H * HIER_NODES.length;

  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat:-1, repeatDelay:1.5 });
    tl.fromTo(el,
      { y:0, opacity:1 },
      { y: totalH - NODE_H, duration:1.8, ease:'power1.inOut', opacity:1 }
    ).to(el, { opacity:0, duration:0.15 })
     .set(el, { y:0 })
     .to(el, { opacity:1, duration:0.15 });
    return () => tl.kill();
  }, [totalH]);

  return (
    <div aria-hidden="true" style={{ position:'relative', marginBottom:8 }}>
      <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.28)', letterSpacing:'0.09em', marginBottom:10, textTransform:'uppercase' }}>Token cascade</div>
      {/* Vertical rail */}
      <div style={{ position:'absolute', left:4, top:28, width:1, height:totalH - 14, background:'rgba(0,0,0,0.08)' }}/>
      {/* Traveling dot */}
      <div ref={dotRef} style={{ position:'absolute', left:0, top:28, width:9, height:9, borderRadius:'50%', background:'#c8602a', boxShadow:'0 0 8px rgba(200,96,42,0.5)', zIndex:2 }}/>
      {/* Nodes */}
      {HIER_NODES.map((node, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, height:NODE_H, paddingLeft:18 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:node.dot, flexShrink:0, zIndex:1, boxShadow:`0 0 4px ${node.dot}60` }}/>
          <div>
            <div style={{ fontSize:11, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.72)', fontWeight:600, lineHeight:1 }}>{node.label}</div>
            <div style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.35)', marginTop:3 }}>{node.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TASK 1.4 — TOKENS PREVIEW TAB
───────────────────────────────────────────────────────── */
const SEM_GROUPS = [
  { key:'background', label:'Background', prefix:'color.background.' },
  { key:'text',       label:'Text',       prefix:'color.text.'       },
  { key:'border',     label:'Border',     prefix:'color.border.'     },
  { key:'action',     label:'Action',     prefix:'color.action.'     },
  { key:'badge',      label:'Badge',      prefix:'color.badge.'      },
];
const COMP_GROUPS = [
  { key:'button', label:'Button' },
  { key:'input',  label:'Input'  },
  { key:'card',   label:'Card'   },
  { key:'badge',  label:'Badge'  },
  { key:'nav',    label:'Nav'    },
  { key:'form',   label:'Form'   },
];

function isColorValue(v) {
  if (!v || typeof v !== 'string') return false;
  return v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl');
}

function TkSwatch({ value }) {
  if (!isColorValue(value)) return null;
  return <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:value, border:'1px solid rgba(0,0,0,0.1)', flexShrink:0, verticalAlign:'middle', marginRight:4 }}/>;
}

function TkRow({ name, value, delay=0 }) {
  const shortName = name.split('.').pop();
  return (
    <motion.div
      initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }}
      transition={{ duration:0.18, delay }}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 8px', borderRadius:4, gap:8, minWidth:0 }}>
      <span style={{ fontSize:10.5, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.42)', flexShrink:0, minWidth:90 }}>{shortName}</span>
      <span style={{ fontSize:10.5, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', gap:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0, flexShrink:1 }}>
        <TkSwatch value={value}/>{value}
      </span>
    </motion.div>
  );
}

function TokenAccordion({ label, rows }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', background:'none', border:'none', cursor:'pointer', color:'rgba(0,0,0,0.6)', fontFamily:'"DM Mono",monospace', fontSize:11.5, fontWeight:600 }}>
        <span>{label}</span>
        <span style={{ fontSize:9, opacity:0.45 }}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom:6 }}>
          {rows.map(({ name, value }, i) => <TkRow key={name} name={name} value={value} delay={i*0.02}/>)}
        </div>
      )}
    </div>
  );
}

/* ── Section card wrapper ── */
function TkCard({ title, children }) {
  return (
    <div style={{ borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', overflow:'hidden' }}>
      <div style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(0,0,0,0.35)', letterSpacing:'0.09em', textTransform:'uppercase', padding:'10px 16px 8px', background:'#fafaf9', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        {title}
      </div>
      <div style={{ padding:'14px 16px' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Token page section header ── */
function TkSectionHeader({ label, id }) {
  return (
    <div id={id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
      <div style={{ width:3, height:16, borderRadius:2, background:'rgba(200,96,42,0.55)', flexShrink:0 }} />
      <span style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.5)', fontFamily:'"Geist Mono",monospace', letterSpacing:'0.08em', textTransform:'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

const COLOR_ROLE_LABELS = ['Primary','Secondary','Tertiary','Accent','Neutral','Warning'];

function TokensPreview({ tokens, mode }) {
  const { primitive, semantic, component } = useMemo(
    () => computeAllTokens(tokens, mode), [tokens, mode]
  );
  const { palette, spacingSteps, shadowDefs } = primitive;

  const TK_NAV = [
    { id:'tk-colors',    label:'Color Palette' },
    { id:'tk-spacing',   label:'Spacing & Shape' },
    { id:'tk-semantic',  label:'Semantic' },
    { id:'tk-component', label:'Component' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:36 }}>

      {/* ── Section jump nav ── */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingBottom:20, borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        {TK_NAV.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:'smooth', block:'start' })}
            style={{ padding:'6px 14px', borderRadius:20, border:'1px solid rgba(0,0,0,0.1)', background:'rgba(0,0,0,0.03)', fontSize:12, cursor:'pointer', fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.5)', fontWeight:500, whiteSpace:'nowrap', transition:'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(200,96,42,0.08)'; e.currentTarget.style.borderColor='rgba(200,96,42,0.3)'; e.currentTarget.style.color='#c8602a'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'; e.currentTarget.style.color='rgba(0,0,0,0.5)'; }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── 1. Color Palette ── full-width swatch table ── */}
      <section id="tk-colors">
        <TkSectionHeader label="Color Palette" id="tk-colors-h" />
        <div style={{ borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', overflow:'hidden', background:'#fff' }}>
          {/* Shade column headers */}
          <div style={{ display:'grid', gridTemplateColumns:'80px repeat(10,1fr)', background:'#fafaf9', borderBottom:'1px solid rgba(0,0,0,0.07)', padding:'7px 0' }}>
            <div />
            {SHADE_KEYS.map(k => (
              <div key={k} style={{ fontSize:9, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.32)', textAlign:'center', fontWeight:600, letterSpacing:'0.01em' }}>{k}</div>
            ))}
          </div>
          {/* One row per palette role */}
          {palette.map((shades, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'80px repeat(10,1fr)', borderBottom: i < palette.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none', alignItems:'stretch' }}>
              {/* Role label */}
              <div style={{ display:'flex', alignItems:'center', padding:'0 14px', borderRight:'1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize:11, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.42)', fontWeight:600, textTransform:'capitalize' }}>
                  {COLOR_ROLE_LABELS[i] ?? `color-${i}`}
                </span>
              </div>
              {/* Shade cells */}
              {SHADE_KEYS.map(k => {
                const hex = shades[k];
                const isDark = k >= 500;
                return (
                  <div key={k} title={`${COLOR_ROLE_LABELS[i]??`c${i}`}-${k}: ${hex}`}
                    style={{ height:56, background:hex, position:'relative', cursor:'default' }}>
                    <span style={{
                      position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)',
                      fontSize:8, fontFamily:'"Geist Mono",monospace',
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)',
                      whiteSpace:'nowrap', letterSpacing:'0.02em',
                    }}>{hex?.slice(1).toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Spacing / Shape / Shadow in one row ── */}
      <div id="tk-spacing" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16, alignItems:'stretch' }}>

        {/* Spacing scale */}
        <section style={{ display:'flex', flexDirection:'column' }}>
          <TkSectionHeader label="Spacing Scale" id="tk-spacing-h" />
          <div style={{ flex:1, borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', padding:'20px 20px 14px' }}>
            <div style={{ display:'flex', gap:5, alignItems:'flex-end', height:52, marginBottom:8 }}>
              {spacingSteps.slice(0,12).map((v, i) => {
                const max = spacingSteps[Math.min(11, spacingSteps.length-1)] ?? 64;
                return (
                  <div key={i} title={`space-${i+1}: ${v}px`}
                    style={{ flex:1, height:`${Math.max(4,(v/max)*52)}px`, borderRadius:'3px 3px 0 0', background:'rgba(200,96,42,0.25)', transition:'height .2s' }}/>
                );
              })}
            </div>
            <div style={{ display:'flex', gap:5 }}>
              {spacingSteps.slice(0,12).map((v, i) => (
                <div key={i} style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:8, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.3)', lineHeight:1.2 }}>{v}</div>
                  <div style={{ fontSize:7, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.18)' }}>px</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Border radius */}
        <section style={{ display:'flex', flexDirection:'column' }}>
          <TkSectionHeader label="Border Radius" />
          <div style={{ flex:1, borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', padding:'16px 14px', overflow:'hidden', display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', width:'100%' }}>
              {[['0px','Sharp'],['4px','Soft'],['8px','Round'],['16px','More'],['9999px','Pill']].map(([r, lbl]) => (
                <div key={r} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:0 }}>
                  <div style={{ width:28, height:28, borderRadius:r, background:'rgba(0,0,0,0.06)', border:'1.5px solid rgba(0,0,0,0.12)', flexShrink:0 }} />
                  <span style={{ fontSize:9, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.4)', textAlign:'center', lineHeight:1.2, whiteSpace:'nowrap' }}>{lbl}</span>
                  <span style={{ fontSize:8, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.22)', textAlign:'center', whiteSpace:'nowrap' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section style={{ display:'flex', flexDirection:'column' }}>
          <TkSectionHeader label="Shadows" />
          <div style={{ flex:1, borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#f7f6f5', padding:'20px 20px', display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', gap:12, justifyContent:'space-between', alignItems:'center', width:'100%' }}>
              {(['sm','md','lg']).map(k => (
                <div key={k} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <div style={{ width:'100%', height:36, borderRadius:7, background:'#fff', boxShadow:shadowDefs[k], border:'1px solid rgba(0,0,0,0.04)' }} />
                  <span style={{ fontSize:9, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.35)', fontWeight:600 }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 3. Semantic Tokens ── 2-column grouped cards ── */}
      <section id="tk-semantic">
        <TkSectionHeader label="Semantic Tokens" id="tk-semantic-h" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {SEM_GROUPS.map(({ key, label, prefix }) => {
            const rows = Object.entries(semantic).filter(([k]) => k.startsWith(prefix));
            if (!rows.length) return null;
            return (
              <div key={key} style={{ borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', overflow:'hidden' }}>
                {/* Group header */}
                <div style={{ padding:'9px 14px', borderBottom:'1px solid rgba(0,0,0,0.05)', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.4)', fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</span>
                  <span style={{ fontSize:9, color:'rgba(0,0,0,0.25)', fontFamily:'"Geist Mono",monospace' }}>{rows.length} tokens</span>
                </div>
                {/* Token rows */}
                {rows.map(([name, value], ri) => {
                  const shortName = name.split('.').slice(2).join('.');
                  return (
                    <motion.div key={name}
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ duration:0.15, delay:ri*0.02 }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 14px', borderBottom: ri < rows.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none', gap:12 }}>
                      <span style={{ fontSize:11.5, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.5)', flexShrink:0, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {shortName}
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        {isColorValue(value) && (
                          <span style={{ width:14, height:14, borderRadius:3, background:value, border:'1px solid rgba(0,0,0,0.12)', flexShrink:0, display:'inline-block' }}/>
                        )}
                        <span style={{ fontSize:11, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.6)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {value}
                        </span>
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Component Tokens ── 3-column flat cards matching semantic style ── */}
      <section id="tk-component">
        <TkSectionHeader label="Component Tokens" id="tk-component-h" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {COMP_GROUPS.map(({ key, label }) => {
            const rows = Object.entries(component)
              .filter(([k]) => k.startsWith(key+'.'))
              .map(([k, v]) => ({ name: k.split('.').slice(1).join('.'), value: v }));
            if (!rows.length) return null;
            const visible = rows.slice(0, 9);
            return (
              <div key={key} style={{ borderRadius:10, border:'1px solid rgba(0,0,0,0.07)', background:'#fff', overflow:'hidden' }}>
                {/* Group header — matches semantic token cards */}
                <div style={{ padding:'9px 14px', borderBottom:'1px solid rgba(0,0,0,0.05)', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.4)', fontFamily:'"Geist Mono",monospace', letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</span>
                  <span style={{ fontSize:9, color:'rgba(0,0,0,0.25)', fontFamily:'"Geist Mono",monospace' }}>{rows.length} tokens</span>
                </div>
                {/* Token rows */}
                {visible.map(({ name, value }, ri) => {
                  const shortName = name.split('.').pop();
                  return (
                    <div key={name}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 14px', borderBottom: ri < visible.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none', gap:8 }}>
                      <span style={{ fontSize:11, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flexShrink:1, minWidth:0 }}>
                        {shortName}
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                        {isColorValue(value) && (
                          <span style={{ width:12, height:12, borderRadius:3, background:value, border:'1px solid rgba(0,0,0,0.1)', flexShrink:0, display:'inline-block' }}/>
                        )}
                        <span style={{ fontSize:10.5, fontFamily:'"Geist Mono",monospace', color:'rgba(0,0,0,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110 }}>
                          {value}
                        </span>
                      </span>
                    </div>
                  );
                })}
                {rows.length > 9 && (
                  <div style={{ padding:'5px 14px 8px', fontSize:10, color:'rgba(0,0,0,0.28)', fontFamily:'"Geist Mono",monospace', fontStyle:'italic' }}>
                    +{rows.length - 9} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   NAMED EXPORTS — for DSMainContent docs-site layout
───────────────────────────────────────────────────────── */

export {
  buildScopedVars,
  ContextualTokenStrip,
  COMPONENT_TOKENS,
  // Section components
  ButtonMatrix,
  InputStates,
  FormControlsSection,
  TagInputSection,
  SliderSection,
  RatingSection,
  NavigationSection,
  SidebarLayoutSection,
  DataFilterSection,
  DataTableSection,
  KanbanSection,
  ChartSection,
  StatsGridSection,
  TimelineSection,
  CardsSection,
  PricingCardsSection,
  DataDisplaySection,
  NotificationPanelSection,
  CommentThreadSection,
  OverlaysSection,
  FeedbackSection,
  BadgesSection,
  RichTextEditorSection,
  AccordionSection,
  DatePickerSection,
  VideoPlayerSection,
  MotionSection,
  ColorRolesSection,
  // Foundation page views
  TypographyPreview,
  LayoutPreview,
  AuditPreview,
  TokensPreview,
};

/* ─────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────── */
const PREVIEW_TABS = [
  { id:'components', label:'Components' },
  { id:'typography', label:'Typography' },
  { id:'layout',     label:'Layout'     },
  { id:'audit',      label:'WCAG'       },
  { id:'tokens',     label:'Tokens'     },
];

// Gap #33: Color blindness filter definitions
const CB_FILTERS = {
  normal:       null,
  protanopia:   '0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0',
  deuteranopia: '0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0',
  tritanopia:   '0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0',
  achromatopsia: null, // uses saturate type
};
const CB_LABELS = {
  normal:       'Normal',
  protanopia:   'Protan',
  deuteranopia: 'Deutan',
  tritanopia:   'Tritan',
  achromatopsia:'Achrom',
};
const CB_DESCRIPTIONS = {
  protanopia:   'Red-blind: reds appear dark/grey, greens appear yellow.',
  deuteranopia: 'Green-blind: greens appear yellowish, reds hard to distinguish.',
  tritanopia:   'Blue-blind: blues appear green, yellows appear pink.',
  achromatopsia:'Full color blindness: sees only greyscale.',
};

export default function PreviewCanvas({ tokens, onTokenChange }) {
  const [activeTab,      setActiveTab]      = useState('components');
  const [mode,           setMode]           = useState('light');
  const [colorBlindMode, setColorBlindMode] = useState('normal');

  const scopedVars = useMemo(() => buildScopedVars(tokens, mode), [tokens, mode]);
  // Memoize vibe score
  const vibe       = useMemo(() => computeVibeScore(tokens), [tokens.colors.swatches, tokens.shape, tokens.shadows]);
  const auditErrorCount = useMemo(() => auditTokens(tokens, mode).filter(i => i.level === 'error').length, [tokens, mode]);

  // ── Task 8.1 — Token Change Cascade Animation ──
  const canvasRef   = useRef(null);
  const prevColorsRef = useRef(tokens.colors);
  const prevTypoRef   = useRef(tokens.typography);

  useEffect(() => {
    if (prevColorsRef.current === tokens.colors) return;
    prevColorsRef.current = tokens.colors;
    const el = canvasRef.current;
    if (!el) return;
    // Color ripple: derive a tint from the current primary
    const { palette } = computeTokens(tokens);
    const tint = palette[0]?.[mode === 'dark' ? 700 : 200] ?? '#c8602a';
    const overlay = el.querySelector('[data-cascade-overlay]');
    if (!overlay) return;
    gsap.killTweensOf(overlay);
    gsap.fromTo(overlay,
      { opacity: 0.55, scale: 0.92 },
      { opacity: 0, scale: 1.05, duration: 0.55, ease: 'power2.out',
        onStart: () => { overlay.style.background = `radial-gradient(ellipse at 50% 50%, ${tint}55 0%, transparent 70%)`; overlay.style.display = 'block'; },
        onComplete: () => { overlay.style.display = 'none'; },
      }
    );
  }, [tokens.colors, mode]);

  useEffect(() => {
    if (prevTypoRef.current === tokens.typography) return;
    prevTypoRef.current = tokens.typography;
    const el = canvasRef.current;
    if (!el) return;
    gsap.fromTo(el, { filter:'blur(2.5px)', opacity:0.75 }, { filter:'blur(0px)', opacity:1, duration:0.22, ease:'power2.out' });
  }, [tokens.typography]);


  return (
    <div style={{ flex:1,height:'100%',display:'flex',flexDirection:'column',overflow:'hidden' }}>

      {/* Gap #33: Hidden SVG filter defs for color blindness simulation */}
      <svg style={{ position:'absolute', width:0, height:0, overflow:'hidden' }} aria-hidden="true">
        <defs>
          <filter id="cb-filter-protanopia">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="cb-filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="cb-filter-tritanopia">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="cb-filter-achromatopsia">
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
      </svg>

      {/* ── Tab bar ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:44,borderBottom:'1px solid rgba(0,0,0,0.08)',background:'#fafaf9',flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'stretch', height:'100%' }}>
          {PREVIEW_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive} role="tab"
                style={{
                  padding:'0 14px',
                  border:'none',
                  borderBottom:`2px solid ${isActive ? '#1a1814' : 'transparent'}`,
                  background:'transparent',
                  color: isActive ? '#1a1814' : 'rgba(0,0,0,0.4)',
                  fontSize:11.5,
                  cursor:'pointer',
                  fontFamily:'"Geist Sans",system-ui',
                  fontWeight: isActive ? 600 : 400,
                  transition:'color .12s, border-color .12s',
                  position:'relative',
                  whiteSpace:'nowrap',
                }}>
                {tab.label}
                {tab.id === 'audit' && auditErrorCount > 0 && !isActive && (
                  <span aria-label={`${auditErrorCount} accessibility error${auditErrorCount > 1 ? 's' : ''}`} style={{ position:'absolute',top:8,right:5,width:6,height:6,borderRadius:'50%',background:'#ef4444',border:'1.5px solid #fafaf9' }}/>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          {/* Vibe score */}
          <motion.span key={vibe.label}
            initial={{ opacity:0, y:-3 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
            title={vibe.tagline}
            style={{ fontSize:10, color:'rgba(0,0,0,0.35)', fontFamily:'"Geist Sans",system-ui', display:'flex', alignItems:'center', gap:4, cursor:'default' }}>
            <span style={{ fontSize:11 }}>{vibe.emojis[0]}</span>{vibe.label}
          </motion.span>
          {/* Light / dark toggle */}
          <button onClick={() => setMode(m => m==='light' ? 'dark' : 'light')}
            aria-label={`Switch to ${mode==='light' ? 'dark' : 'light'} mode`}
            style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:6,border:'1px solid rgba(0,0,0,0.1)',background:mode==='dark'?'#1a1814':'#fff',color:mode==='dark'?'#fff':'rgba(0,0,0,0.55)',fontSize:11,cursor:'pointer',fontFamily:'"Geist Sans",system-ui',fontWeight:500,transition:'all .15s' }}>
            {mode==='dark' ? '🌙' : '☀️'} {mode==='dark' ? 'Dark' : 'Light'}
          </button>

          {/* Gap #33: Color blindness selector */}
          <div style={{ display:'flex', alignItems:'center', gap:2, background: colorBlindMode !== 'normal' ? 'rgba(124,58,237,0.08)' : 'rgba(0,0,0,0.03)', borderRadius:6, border: colorBlindMode !== 'normal' ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(0,0,0,0.08)', padding:'2px 3px' }}>
            {Object.keys(CB_LABELS).map(mode_cb => (
              <button key={mode_cb}
                onClick={() => setColorBlindMode(mode_cb)}
                title={mode_cb === 'normal' ? 'Normal vision' : CB_DESCRIPTIONS[mode_cb]}
                style={{
                  padding:'3px 7px', borderRadius:4, border:'none',
                  background: colorBlindMode === mode_cb ? (mode_cb === 'normal' ? '#fff' : '#7c3aed') : 'transparent',
                  color: colorBlindMode === mode_cb ? (mode_cb === 'normal' ? '#1a1814' : '#fff') : 'rgba(0,0,0,0.45)',
                  fontSize:10, cursor:'pointer', fontWeight: colorBlindMode === mode_cb ? 700 : 400,
                  fontFamily:'"Geist Mono",monospace',
                  transition:'all 0.12s',
                  boxShadow: colorBlindMode === mode_cb ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}>
                {CB_LABELS[mode_cb]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gap #33: Color blindness info banner */}
      {colorBlindMode !== 'normal' && (
        <div style={{ padding:'6px 16px', background:'rgba(124,58,237,0.07)', borderBottom:'1px solid rgba(124,58,237,0.15)', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <span style={{ fontSize:10, color:'#7c3aed', fontWeight:700, fontFamily:'"Geist Mono",monospace', flexShrink:0 }}>◉ {CB_LABELS[colorBlindMode].toUpperCase()}</span>
          <span style={{ fontSize:11, color:'rgba(124,58,237,0.8)', fontFamily:'"Geist Sans",system-ui' }}>{CB_DESCRIPTIONS[colorBlindMode]}</span>
          <button onClick={() => setColorBlindMode('normal')} style={{ marginLeft:'auto', border:'none', background:'none', cursor:'pointer', color:'rgba(124,58,237,0.6)', fontSize:14, lineHeight:1, padding:'0 4px', flexShrink:0 }}>×</button>
        </div>
      )}

      {/* ── Canvas ── */}
      <div ref={canvasRef} style={{
        flex:1, overflowY:'auto', position:'relative',
        background: mode==='dark' ? '#0d0c0b' : '#fff',
        filter: colorBlindMode !== 'normal' ? `url(#cb-filter-${colorBlindMode})` : 'none',
        transition: 'filter 0.2s',
      }}>
        {/* Cascade ripple overlay */}
        <div data-cascade-overlay="1" style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:10,display:'none' }}/>
        <AnimatePresence mode="wait">
          <motion.div key={`${mode}-${activeTab}`}
            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
            transition={{ duration:.18 }}
            style={{ minHeight:'100%' }}>

            {activeTab === 'audit' ? (
              <div style={{ padding:'44px 52px', ...scopedVars }}>
                <AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />
              </div>
            ) : activeTab === 'tokens' ? (
              <div style={{ padding:'44px 52px' }}>
                <TokensPreview tokens={tokens} mode={mode} />
              </div>
            ) : (
              <div className="ds-preview" style={{ padding:'44px 52px', minHeight:'100%', ...scopedVars, background:'var(--ds-bg)' }}>
                {activeTab==='components' && <ComponentLibraryView tokens={tokens} scopedVars={scopedVars}/>}
                {activeTab==='typography' && <TypographyPreview tokens={tokens} />}
                {activeTab==='layout'     && <LayoutPreview tokens={tokens} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
