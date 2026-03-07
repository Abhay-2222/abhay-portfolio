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
  getContrastRatio, wcagLevel, auditTokens, getAutoFix, PLATFORMS, computeVibeScore,
  getColorBase,
} from './dsEngine';

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

  // ── Spacing ──────────────────────────────────────────────
  spacingSteps.forEach((v, i) => { vars[`--ds-space-${i+1}`] = `${v}px`; });

  // ── Shape ────────────────────────────────────────────────
  vars['--ds-radius']    = SHAPE_RADIUS[tokens.shape] ?? '4px';
  vars['--ds-radius-sm'] = tokens.shape==='sharp' ? '0px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 0.5)`;
  vars['--ds-radius-lg'] = tokens.shape==='pill'  ? '9999px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 2)`;

  // ── Shadows ──────────────────────────────────────────────
  vars['--ds-shadow-sm'] = shadowDefs.sm;
  vars['--ds-shadow-md'] = shadowDefs.md;
  vars['--ds-shadow-lg'] = shadowDefs.lg;

  return vars;
}

/* ─────────────────────────────────────────────────────────
   DEVICE FRAME
───────────────────────────────────────────────────────── */
function DeviceFrame({ platform, children }) {
  if (platform === 'web' || platform === 'system' || !platform) {
    return <>{children}</>;
  }
  const isIOS = platform === 'ios';
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'0 0 24px' }}>
      <div style={{
        width: isIOS ? 375 : 360,
        borderRadius: isIOS ? 46 : 30,
        border:'7px solid #1c1c1e',
        background:'#1c1c1e',
        boxShadow:'0 30px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.08)',
        overflow:'hidden',
        position:'relative',
      }}>
        {/* Status bar */}
        {isIOS ? (
          <div style={{ height:44,background:'var(--ds-bg)',display:'flex',alignItems:'flex-end',justifyContent:'space-between',padding:'0 20px 8px',position:'relative' }}>
            <div style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:120,height:30,background:'#1c1c1e',borderRadius:'0 0 18px 18px' }}/>
            <span style={{ fontSize:11,fontWeight:600,fontFamily:'"Geist Sans",system-ui',color:'var(--ds-fg)',zIndex:1 }}>9:41</span>
            <div style={{ display:'flex',gap:4,zIndex:1 }}>
              {['▋▋▋','WiFi','🔋'].map((x,i) => <span key={i} style={{ fontSize:9,color:'var(--ds-fg)' }}>{i===0?'▋▋▋':i===1?'☁':''}</span>)}
            </div>
          </div>
        ) : (
          <div style={{ height:28,background:'var(--ds-bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ width:10,height:10,borderRadius:'50%',background:'#1c1c1e',border:'1px solid rgba(255,255,255,0.1)' }}/>
          </div>
        )}
        {/* Content */}
        <div style={{ maxHeight:650,overflowY:'auto',background:'var(--ds-bg)' }}>
          {children}
        </div>
        {/* Home indicator / nav */}
        {isIOS ? (
          <div style={{ height:32,background:'var(--ds-bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ width:128,height:4,borderRadius:2,background:'rgba(0,0,0,0.15)' }}/>
          </div>
        ) : (
          <div style={{ height:40,background:'var(--ds-bg)',borderTop:'1px solid var(--ds-border)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 24px' }}>
            {['←','○','□'].map(icon => (
              <div key={icon} style={{ width:28,height:28,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'var(--ds-fg)',opacity:0.5 }}>{icon}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  return <div style={{ fontSize:9,fontFamily:'var(--ds-font-mono)',color:'var(--ds-text-muted)',letterSpacing:'0.08em',marginBottom:8 }}>{children.toUpperCase()}</div>;
}

/* ── Editorial Section Header with description ── */
function DSSection({ category, title, desc, children }) {
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', fontWeight:700, color:'var(--ds-primary)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:7, opacity:0.85 }}>{category}</div>
        <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--ds-font-display)', color:'var(--ds-fg)', letterSpacing:'-0.025em', lineHeight:1.2, marginBottom: desc ? 9 : 0 }}>{title}</div>
        {desc && <div style={{ fontSize:12, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', lineHeight:1.7, maxWidth:520 }}>{desc}</div>}
      </div>
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
            <th style={{ width:72, padding:'4px 6px 8px', fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600, textAlign:'left' }}>Variant</th>
            {BTN_STATES.map(s => (
              <th key={s} style={{ padding:'4px 4px 8px', fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600, textAlign:'center', whiteSpace:'nowrap' }}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BTN_VARIANTS.map(({ key, label }, ri) => (
            <motion.tr key={key}
              initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.16, delay: ri * 0.04 }}
              style={{ borderTop:'1px solid var(--ds-border)' }}>
              <td style={{ padding:'8px 6px', fontSize:10, fontFamily:'var(--ds-font-body)', color:'var(--ds-text-muted)', fontWeight:500 }}>{label}</td>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:4 }}>{label}</div>
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
    <div style={{ padding:'12px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', display:'flex', flexDirection:'column', gap:10, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
        <span style={{ fontSize:10, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:52, overflow:'hidden', position:'relative' }}>
        {children}
      </div>
      <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'var(--ds-text-muted)', lineHeight:1.5 }}>
        <span style={{ opacity:0.55 }}>{tokenKey}</span><br/>
        <span>{tokenValue}</span>
      </div>
    </div>
  );
}

function MotionSection({ tokens }) {
  const motRef    = useRef([]);
  const cardRef   = useRef(null);
  const modalRef  = useRef(null);
  const inputRef  = useRef(null);
  const pageRef   = useRef(null);

  const dur    = { fast:'100ms', normal:'200ms', slow:'350ms', deliberate:'500ms' };
  const ease   = { standard:'cubic-bezier(0.4,0,0.2,1)', decelerate:'cubic-bezier(0,0,0.2,1)', spring:'cubic-bezier(0.34,1.56,0.64,1)' };

  // Resolve preset-aware durations
  const preset = tokens?.preset ?? 'minimal';
  const fastMs  = preset === 'brutalist' ? 50  : preset === 'playful' ? 120 : preset === 'glass' ? 140 : 100;
  const normMs  = preset === 'brutalist' ? 80  : preset === 'playful' ? 240 : preset === 'glass' ? 400 : 200;
  const slowMs  = preset === 'brutalist' ? 100 : preset === 'playful' ? 420 : preset === 'glass' ? 500 : 350;
  const delibMs = preset === 'brutalist' ? 150 : preset === 'playful' ? 600 : preset === 'glass' ? 650 : 500;
  const easeKey = preset === 'playful' ? ease.spring : preset === 'glass' ? ease.decelerate : ease.standard;

  useEffect(() => {
    const tls = [];

    // 1. Button hover cycle
    if (motRef.current[0]) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:1.2 });
      tl.to(motRef.current[0], { scale:1.04, duration:fastMs/1000, ease:easeKey })
        .to(motRef.current[0], { scale:1,    duration:fastMs/1000, ease:easeKey, delay:0.3 });
      tls.push(tl);
    }
    // 2. Card elevation
    if (cardRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:1 });
      tl.to(cardRef.current, { y:-5, boxShadow:'0 12px 32px rgba(0,0,0,0.18)', duration:normMs/1000, ease:easeKey })
        .to(cardRef.current, { y:0,  boxShadow:'0 2px 8px rgba(0,0,0,0.08)',   duration:normMs/1000, ease:easeKey, delay:0.5 });
      tls.push(tl);
    }
    // 3. Modal entrance
    if (modalRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.8 });
      tl.set(modalRef.current, { opacity:0, y:18 })
        .to(modalRef.current, { opacity:1, y:0, duration:slowMs/1000, ease:easeKey })
        .to(modalRef.current, { opacity:0, y:-6, duration:(normMs/1000)*0.6, ease:'power2.in', delay:0.8 });
      tls.push(tl);
    }
    // 4. Input focus ring pulse
    if (inputRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.8 });
      tl.to(inputRef.current, { outlineWidth:3, outlineOffset:3, duration:fastMs/1000, ease:easeKey })
        .to(inputRef.current, { outlineWidth:0, outlineOffset:0, duration:fastMs/1000, ease:easeKey, delay:0.6 });
      tls.push(tl);
    }
    // 5. Page slide-in
    if (pageRef.current) {
      const tl = gsap.timeline({ repeat:-1, repeatDelay:0.6 });
      tl.set(pageRef.current, { x:60, opacity:0 })
        .to(pageRef.current, { x:0, opacity:1, duration:delibMs/1000, ease:ease.decelerate })
        .to(pageRef.current, { x:-60, opacity:0, duration:(delibMs/1000)*0.5, ease:'power2.in', delay:0.8 });
      tls.push(tl);
    }

    return () => tls.forEach(t => t.kill());
  }, [tokens?.preset, fastMs, normMs, slowMs, delibMs, easeKey]);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>

        <MotionTile label="Button Hover" tokenKey="motion.transition.button" tokenValue={`${fastMs}ms ${easeKey.slice(0,18)}…`}>
          <div ref={el => motRef.current[0] = el}
            style={{ padding:'7px 14px', borderRadius:'var(--ds-radius)', background:'var(--ds-primary)', color:'#fff', fontSize:11, fontFamily:'var(--ds-font-body)', fontWeight:500, cursor:'default' }}>
            Click me
          </div>
        </MotionTile>

        <MotionTile label="Card Lift" tokenKey="motion.transition.card" tokenValue={`${normMs}ms ${easeKey.slice(0,18)}…`}>
          <div ref={cardRef}
            style={{ width:48, height:36, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}/>
        </MotionTile>

        <MotionTile label="Modal Enter" tokenKey="motion.transition.modal" tokenValue={`${slowMs}ms ${easeKey.slice(0,18)}…`}>
          <div ref={modalRef}
            style={{ width:52, height:38, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-elevated)', border:'1px solid var(--ds-border)', boxShadow:'var(--ds-shadow-lg)' }}/>
        </MotionTile>

        <MotionTile label="Focus Ring" tokenKey="motion.duration.fast" tokenValue={`${fastMs}ms`}>
          <div ref={inputRef}
            style={{ width:54, height:24, borderRadius:'var(--ds-radius)', border:'1.5px solid var(--ds-border)', background:'var(--ds-bg)', outline:'0px solid var(--ds-primary)', outlineOffset:0 }}/>
        </MotionTile>

        <MotionTile label="Page Slide" tokenKey="motion.transition.page" tokenValue={`${delibMs}ms decelerate`}>
          <div ref={pageRef}
            style={{ width:52, height:36, borderRadius:'var(--ds-radius)', background:'var(--ds-bg-subtle)', border:'1px solid var(--ds-border)' }}/>
        </MotionTile>

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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Checkboxes</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Radio Buttons</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Toggle Switch</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Select</div>
          <div style={{ position:'relative' }}>
            <select style={{ ...inputBase, paddingRight:28, appearance:'none', cursor:'pointer' }}>
              <option>Product Designer</option><option>Engineer</option><option>Manager</option>
            </select>
            <span style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--ds-text-muted)', pointerEvents:'none' }}>▾</span>
          </div>
        </div>
        {/* Textarea */}
        <div>
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Textarea</div>
          <textarea readOnly rows={3} defaultValue="Tell us about your design process and how you approach system thinking…" style={{ ...inputBase, resize:'none' }}/>
        </div>
        {/* Search */}
        <div>
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Search</div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--ds-text-muted)', pointerEvents:'none' }}>⌕</span>
            <input readOnly defaultValue="Design tokens" style={{ ...inputBase, paddingLeft:28, paddingRight:28 }}/>
            <span style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'var(--ds-text-muted)', cursor:'pointer' }}>✕</span>
          </div>
        </div>
        {/* File upload */}
        <div style={{ gridColumn:'1 / -1' }}>
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>File Upload</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Topbar</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Sidebar Nav</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Breadcrumb</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Tabs</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:8 }}>Stepper</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Pagination</div>
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
                style={{ padding:'8px 10px', textAlign:'left', fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600, borderBottom:'1px solid var(--ds-border)', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
                NAME <span style={{ opacity:0.5 }}>{sortDir==='asc'?'↑':'↓'}</span>
              </th>
              {['STATUS','DEPARTMENT','DATE','ACTIONS'].map(col => (
                <th key={col} style={{ padding:'8px 10px', textAlign:'left', fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600, borderBottom:'1px solid var(--ds-border)', whiteSpace:'nowrap' }}>{col}</th>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Dialog / Modal</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Tooltip & Popover</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Dropdown Menu</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Command Palette</div>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Progress</div>
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
            <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Skeleton</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[85, 60, 75].map((w, i) => (
                <div key={i} style={{ height:11, borderRadius:'var(--ds-radius-sm)', width:`${w}%`, background:'linear-gradient(90deg,var(--ds-bg-subtle) 25%,var(--ds-border) 50%,var(--ds-bg-subtle) 75%)', backgroundSize:'200% 100%', animation:`shimmer 1.5s ${i*0.15}s infinite linear` }}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Spinner</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {[14, 20, 28].map((sz, i) => (
                <div key={i} style={{ width:sz, height:sz, borderRadius:'50%', border:`${i===0?1.5:2}px solid var(--ds-primary-l)`, borderTopColor:'var(--ds-primary)', animation:'pc-spin 0.7s linear infinite' }}/>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:7 }}>Toast</div>
            <div style={{ padding:'8px 11px', borderRadius:'var(--ds-radius)', background:'#1a1814', color:'#f8f8f7', fontSize:11, fontFamily:'var(--ds-font-body)', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'var(--ds-shadow-lg)' }}>
              <span style={{ color:'#22c55e' }}>✓</span>Tokens exported!
            </div>
          </div>
        </div>
      </div>
      {/* Empty state */}
      <div>
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Empty State</div>
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
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Activity Feed</div>
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
              <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', flexShrink:0 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Avatars */}
      <div>
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:8 }}>Avatars</div>
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
          <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>Notification badges:</span>
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
          {days.map(d => <div key={d} style={{ textAlign:'center', fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600, padding:'2px 0' }}>{d}</div>)}
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
          <div key={name} style={{ borderRadius:'var(--ds-radius)', overflow:'hidden', border:'1px solid var(--ds-border)' }}>
            <div style={{ height:52, background:bg }}/>
            <div style={{ height:20, background:light }}/>
            <div style={{ padding:'8px 10px', background:'var(--ds-bg-elevated)' }}>
              <div style={{ fontSize:11, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{name}</div>
              <div style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', marginTop:2 }}>{desc}</div>
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
              <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:2 }}>{date}</div>
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
              <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{label}</span>
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
            <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', flexShrink:0 }}>{time}</span>
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
                  <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{time}</span>
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
                    <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{r.time}</span>
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
            <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>1:24 / 3:45</span>
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
          <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6 }}>Star Rating (3.5 / 5)</div>
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
            <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:5 }}>Thumbs</div>
            <div style={{ display:'flex', gap:8 }}>
              {[['↑','var(--ds-secondary-500)','224'],['↓','#ef4444','18']].map(([icon,color,count]) => (
                <button key={icon} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:'var(--ds-radius)', border:`1px solid ${color}`, background:`${color}18`, color, fontSize:12, cursor:'pointer', fontFamily:'var(--ds-font-body)', fontWeight:600 }}>{icon} {count}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:5 }}>Score</div>
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
          <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>Active:</span>
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
   PREVIEW: COMPONENTS  (web only)
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
  const levels = [
    { key:'4xl', role:'Display',    weight:700, font:'var(--ds-font-display)', sample:'The Art of Systems' },
    { key:'3xl', role:'H1',         weight:700, font:'var(--ds-font-display)', sample:'Building with Tokens' },
    { key:'2xl', role:'H2',         weight:600, font:'var(--ds-font-display)', sample:'Colour & Typography' },
    { key:'xl',  role:'H3',         weight:600, font:'var(--ds-font-body)',    sample:'Consistent, Accessible Design' },
    { key:'lg',  role:'Lead',       weight:400, font:'var(--ds-font-body)',    sample:'Design systems create a shared language between design and code.' },
    { key:'base',role:'Body',       weight:400, font:'var(--ds-font-body)',    sample:'Every value in a design system should encode a deliberate decision about aesthetics, usability, or brand identity.' },
    { key:'sm',  role:'Label',      weight:500, font:'var(--ds-font-body)',    sample:'REQUIRED · MAX 48 CHARACTERS' },
    { key:'xs',  role:'Mono/Caption',weight:400,font:'var(--ds-font-mono)',    sample:'const radius = tokens.shape.border;' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:36 }}>

      {/* Header section with font metadata */}
      <DSSection
        category="Type System"
        title="Typography Scale"
        desc={`Built on a ${tokens.typography.baseSize}px base with a ×${tokens.typography.scale} modular scale. Display headings use ${tokens.typography.display}, body copy uses ${tokens.typography.body}, and code/mono uses ${tokens.typography.mono}.`}
      >
        <div style={{ display:'flex', gap:0, borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', overflow:'hidden' }}>
          {[['Display', tokens.typography.display, 'Headings & titles'],['Body', tokens.typography.body, 'Prose & UI labels'],['Mono', tokens.typography.mono, 'Code & tokens']].map(([l, v, sub], i, arr) => (
            <div key={l} style={{ flex:1, padding:'12px 16px', borderRight: i < arr.length-1 ? '1px solid var(--ds-border)' : 'none', background: i===0 ? 'var(--ds-bg-subtle)' : 'var(--ds-bg-elevated)' }}>
              <div style={{ fontSize:8, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.08em', marginBottom:5 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize:13, color:'var(--ds-fg)', fontFamily:'var(--ds-font-mono)', fontWeight:600, marginBottom:3 }}>{v}</div>
              <div style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>{sub}</div>
            </div>
          ))}
          <div style={{ flex:0, padding:'12px 16px', background:'var(--ds-bg-elevated)', display:'flex', flexDirection:'column', justifyContent:'center', borderLeft:'1px solid var(--ds-border)', minWidth:80 }}>
            <div style={{ fontSize:8, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', letterSpacing:'0.08em', marginBottom:5 }}>SCALE</div>
            <div style={{ fontSize:13, color:'var(--ds-primary)', fontFamily:'var(--ds-font-mono)', fontWeight:700 }}>×{tokens.typography.scale}</div>
            <div style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)', marginTop:3 }}>ratio</div>
          </div>
        </div>
      </DSSection>

      {/* Type scale samples */}
      <div>
        <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', fontWeight:700, color:'var(--ds-primary)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16, opacity:0.85 }}>Type Scale</div>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {levels.map(({ key, role, weight, font, sample }) => (
            <div key={key} style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:16, padding:'14px 0', borderBottom:'1px solid var(--ds-border)' }}>
              <div style={{ paddingTop:4 }}>
                <div style={{ fontSize:9, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', marginBottom:3 }}>{role}</div>
                <div style={{ fontSize:11, color:'var(--ds-primary)', fontFamily:'var(--ds-font-mono)', fontWeight:700 }}>{Math.round(typeScale[key])}px</div>
                <div style={{ fontSize:8, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-mono)', marginTop:2 }}>{+(typeScale[key]/16).toFixed(2)}rem</div>
              </div>
              <div style={{
                fontSize: Math.min(typeScale[key], ['4xl','3xl'].includes(key) ? (key==='4xl' ? 44 : 34) : 999),
                fontWeight: weight, fontFamily: font, color:'var(--ds-fg)',
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
        category="Grid"
        title={`${cols}-Column Grid`}
        desc={`A ${cols}-column grid with ${gutterPx}px gutters defines the horizontal rhythm of your layouts. Column count adapts by viewport: typically 4 columns on mobile, 8 on tablet, 12 on desktop.`}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Full grid visualization */}
          <div style={{ position:'relative', height:72, borderRadius:'var(--ds-radius)', overflow:'hidden', border:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} style={{
                position:'absolute',
                left:`calc(${(i/cols)*100}% + ${gutterPx/2}px)`,
                width:`calc(${(1/cols)*100}% - ${gutterPx}px)`,
                top:8, bottom:8,
                background:'var(--ds-primary)',
                opacity: 0.14,
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
                background:'var(--ds-primary)',
                opacity:0.04,
              }}/>
            ))}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600 }}>{cols} columns</span>
              <span style={{ fontSize:10, color:'var(--ds-border-strong)' }}>·</span>
              <span style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{gutterPx}px gutter</span>
              <span style={{ fontSize:10, color:'var(--ds-border-strong)' }}>·</span>
              <span style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{Math.round((100 - gutterPx * (cols-1) / 7.68) / cols * 10) / 10}% column width</span>
            </div>
          </div>
          {/* Column count examples */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Mobile', cols:4, desc:'4 columns' },
              { label:'Tablet', cols:8, desc:'8 columns' },
              { label:'Desktop', cols:cols, desc:`${cols} columns` },
            ].map(({ label, cols: c, desc }) => (
              <div key={label} style={{ padding:'10px 12px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)' }}>
                <div style={{ display:'flex', gap:2, marginBottom:6, height:16 }}>
                  {Array.from({ length: c }).map((_, i) => (
                    <div key={i} style={{ flex:1, borderRadius:1, background:'var(--ds-primary)', opacity:0.2 }}/>
                  ))}
                </div>
                <div style={{ fontSize:10, fontWeight:600, fontFamily:'var(--ds-font-body)', color:'var(--ds-fg)' }}>{label}</div>
                <div style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ── Breakpoint Ruler ── */}
      <DSSection
        category="Responsive"
        title="Breakpoints"
        desc="Six breakpoints define how layouts adapt across screen sizes — from 375px mobile up to 1536px wide-screen. Each breakpoint is a CSS min-width threshold."
      >
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Ruler */}
          <div style={{ position:'relative', height:64, paddingTop:24 }}>
            <div style={{ position:'absolute', left:0, right:0, top:32, height:2, background:'var(--ds-border)', borderRadius:2 }}/>
            {BREAKPOINTS.map(({ key, px }) => {
              const maxPx = 1536;
              const pct   = (px / maxPx) * 100;
              return (
                <div key={key} style={{ position:'absolute', left:`${pct}%`, top:22, transform:'translateX(-50%)' }}>
                  <div style={{ width:1.5, height:18, background:'var(--ds-border-strong)', margin:'0 auto' }}/>
                  <div style={{ fontSize:8, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', textAlign:'center', whiteSpace:'nowrap', marginTop:4, lineHeight:1.4 }}>
                    <span style={{ fontWeight:600 }}>{key}</span><br/>{px}px
                  </div>
                </div>
              );
            })}
          </div>
          {/* Breakpoint chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {BREAKPOINTS.map(({ key, px }) => (
              <div key={key} style={{ padding:'5px 10px', borderRadius:'var(--ds-radius)', border:'1px solid var(--ds-border)', background:'var(--ds-bg-elevated)', display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:10, fontWeight:700, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)' }}>{key}</span>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{px}px</span>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-primary)' }}>{(px/16).toFixed(0)}rem</span>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ── Spacing Scale ── */}
      <DSSection
        category="Spacing"
        title="Spacing Scale"
        desc={`Derived from a ${tokens.spacing?.base ?? 8}px base unit. The scale follows a ${tokens.spacing?.scale ?? 'linear'} progression grouped into Micro (tight UI), Base (component padding), and Macro (section gaps).`}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {[['Micro', micro, 0, 'Inline gaps, icon margins, dense list padding'], ['Base', base, 3, 'Component padding, card gaps, form spacing'], ['Macro', macro, 8, 'Section gaps, page margins, layout spacing']].map(([gLabel, steps, offset, desc]) => (
            <div key={gLabel}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', fontWeight:700, color:'var(--ds-primary)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{gLabel}</span>
                <span style={{ fontSize:10, color:'var(--ds-text-muted)', fontFamily:'var(--ds-font-body)' }}>{desc}</span>
              </div>
              <div style={{ borderRadius:'var(--ds-radius)', overflow:'hidden', border:'1px solid var(--ds-border)' }}>
                {steps.map((val, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'56px 1fr 52px 52px', gap:10, alignItems:'center', padding:'6px 12px', borderBottom: i < steps.length-1 ? '1px solid var(--ds-border)' : 'none', background: i%2===0 ? 'transparent' : 'var(--ds-bg-subtle)' }}>
                    <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600 }}>{scaleKey}-{offset+i+1}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ height:8, width:`${Math.max(4, (val/maxSpacing)*100)}%`, background:'var(--ds-primary)', borderRadius:2, opacity:0.45+((offset+i)/20)*0.55, transition:'width .3s', minWidth:4, maxWidth:'100%', flexShrink:0 }}/>
                    </div>
                    <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', textAlign:'right', fontWeight:600 }}>{val}px</span>
                    <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', textAlign:'right' }}>{+(val/16).toFixed(2)}rem</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* ── Z-Index Stack ── */}
      <DSSection
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
                borderRadius:'var(--ds-radius)',
                background: color,
                border:'1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{ width:32, height:32, borderRadius:'var(--ds-radius-sm)', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontFamily:'var(--ds-font-mono)', color:'#fff', fontWeight:700 }}>{ri}</span>
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', fontWeight:700 }}>{key}</span>
                </div>
                <span style={{ fontSize:11, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>z-index: {z}</span>
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
  // Run audit on requestIdleCallback so it never blocks paint (Task 10.3)
  const [issues, setIssues] = useState(() => auditTokens(tokens, mode));
  useEffect(() => {
    let id;
    const run = () => { setIssues(auditTokens(tokens, mode)); };
    if (typeof requestIdleCallback !== 'undefined') {
      id = requestIdleCallback(run, { timeout: 400 });
    } else {
      id = setTimeout(run, 0);
    }
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [tokens, mode]);

  const errors   = issues.filter(i=>i.level==='error');
  const warnings = issues.filter(i=>i.level==='warning');
  const passes   = issues.filter(i=>i.level==='pass');
  const score    = Math.round((passes.length / issues.length) * 100);

  // Auto-fix toast state
  const [fixedId, setFixedId] = useState(null);
  const applyFix = (issue) => {
    if (!onTokenChange || !issue.autoFixKey) return;
    const patch = getAutoFix(issue.autoFixKey, tokens);
    if (!patch) return;
    onTokenChange(prev => ({ ...prev, ...patch }));
    setFixedId(issue.id);
    setTimeout(() => setFixedId(null), 1800);
  };

  const { primitive: { palette }, semantic } = useMemo(() => computeAllTokens(tokens, mode), [tokens, mode]);
  const p = palette[0] ?? {};
  const { baseHue: _auditBH, saturation: _auditSat } = getColorBase(tokens);
  const bg   = semantic['color.background.base']  ?? (mode==='dark' ? hslToHex(_auditBH,Math.min(_auditSat*0.14,11),8) : '#ffffff');
  const prim = semantic['color.action.primary']   ?? (mode==='dark' ? (p[400]??'#60a5fa') : (p[500]??'#4f46e5'));
  const fg   = semantic['color.text.primary']     ?? (mode==='dark' ? '#f2efe9' : (p[900]??'#111111'));
  const plat = PLATFORMS[tokens.platform??'web'];

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

      {/* Score banner */}
      <div style={{
        padding:'16px 20px', borderRadius:'var(--ds-radius-lg)',
        background: score>=80?'#dcfce7':score>=60?'#fef9c3':'#fee2e2',
        border:`1px solid ${score>=80?'#86efac':score>=60?'#fde047':'#fca5a5'}`,
        display:'flex', alignItems:'center', gap:16,
      }}>
        <div style={{ fontSize:36,fontWeight:800,fontFamily:'var(--ds-font-display)',color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b',lineHeight:1 }}>
          {score}%
        </div>
        <div>
          <div style={{ fontSize:14,fontWeight:700,fontFamily:'var(--ds-font-body)',color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b' }}>
            {score>=80?'Looking good!':score>=60?'A few things to fix':'Needs attention'}
          </div>
          <div style={{ fontSize:12,fontFamily:'var(--ds-font-body)',color:score>=80?'#166534':score>=60?'#854d0e':'#991b1b',opacity:0.75,marginTop:2 }}>
            {passes.length} passed · {warnings.length} warnings · {errors.length} errors · Platform: {plat.label}
          </div>
        </div>
      </div>

      {/* Contrast matrix */}
      <div>
        <div style={{ fontSize:10,fontWeight:700,fontFamily:'var(--ds-font-body)',color:'var(--ds-fg)',marginBottom:10,letterSpacing:'0.02em' }}>Contrast Matrix</div>
        <div style={{ display:'flex',flexDirection:'column',gap:0,borderRadius:'var(--ds-radius)',border:'1px solid var(--ds-border)',overflow:'hidden' }}>
          {matrixRows.map(({ label,hex1,hex2 },i) => {
            let ratio;
            try { ratio = getContrastRatio(hex1.startsWith('rgba')?hex1.replace(/[\d.]+\)$/,()=>'1)'):hex1, hex2.startsWith('rgba')?'#6b7280':hex2); } catch { ratio = 1; }
            const { level, color } = wcagLevel(ratio);
            return (
              <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr auto auto',alignItems:'center',gap:12,padding:'9px 12px',background:i%2===0?'transparent':'rgba(0,0,0,0.02)',borderBottom:i<matrixRows.length-1?'1px solid var(--ds-border)':'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <div style={{ width:16,height:16,borderRadius:3,background:hex1.startsWith('rgba')?'rgba(107,114,128,0.4)':hex1,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0 }}/>
                  <div style={{ width:16,height:16,borderRadius:3,background:hex2.startsWith('rgba')?'#f8f9fa':hex2,border:'1px solid rgba(0,0,0,0.1)',flexShrink:0 }}/>
                  <span style={{ fontSize:11,fontFamily:'var(--ds-font-body)',color:'var(--ds-fg)' }}>{label}</span>
                </div>
                <span style={{ fontSize:11,fontFamily:'var(--ds-font-mono)',color:'var(--ds-text-muted)',minWidth:40,textAlign:'right' }}>{ratio.toFixed(1)}:1</span>
                <span style={{ fontSize:10,fontFamily:'var(--ds-font-mono)',color,fontWeight:700,minWidth:36,textAlign:'right' }}>{level}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issues list */}
      {['error','warning','pass'].map(lvl => {
        const group = { error:errors, warning:warnings, pass:passes }[lvl];
        if (!group.length) return null;
        return (
          <div key={lvl}>
            <div style={{ fontSize:10,fontWeight:700,fontFamily:'var(--ds-font-body)',color:levelColor[lvl],marginBottom:8,display:'flex',alignItems:'center',gap:5 }}>
              <span>{levelIcon[lvl]}</span>
              {lvl==='error'?'Errors':lvl==='warning'?'Warnings':'Passing checks'}
              <span style={{ fontWeight:400,color:'var(--ds-text-muted)',fontSize:9 }}>({group.length})</span>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
              {group.map((issue) => {
                const justFixed = fixedId === issue.id;
                return (
                  <motion.div key={issue.id}
                    animate={justFixed ? { scale:[1,1.02,1], backgroundColor:['#dcfce8','#dcfce8'] } : {}}
                    transition={{ duration:.4 }}
                    style={{ padding:'9px 12px',borderRadius:'var(--ds-radius)',border:`1px solid ${justFixed?'#86efac':lvl==='pass'?'var(--ds-border)':lvl==='error'?'#fca5a5':'#fde047'}`,background:justFixed?'#dcfce8':lvl==='pass'?'var(--ds-bg-subtle)':lvl==='error'?'#fee2e2':'#fefce8',transition:'border .3s,background .3s' }}>
                    <div style={{ display:'flex',alignItems:'flex-start',gap:7 }}>
                      <span style={{ fontSize:9,padding:'1px 5px',borderRadius:3,background:lvl==='pass'?'#dcfce7':lvl==='error'?'#fca5a5':'#fde047',color:lvl==='pass'?'#166534':lvl==='error'?'#991b1b':'#854d0e',fontFamily:'"Geist Mono",monospace',fontWeight:700,flexShrink:0,marginTop:2 }}>{issue.category ?? issue.cat}</span>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:11,fontFamily:'var(--ds-font-body)',color:justFixed?'#166534':lvl==='pass'?'#166534':lvl==='error'?'#991b1b':'#854d0e',lineHeight:1.5 }}>
                          {justFixed ? '✓ Fixed!' : (issue.message ?? issue.msg)}
                        </span>
                        {(issue.suggestion ?? issue.fix) && !justFixed && (
                          <div style={{ fontSize:10,fontFamily:'var(--ds-font-body)',color:lvl==='error'?'#b91c1c':'#92400e',opacity:0.8,marginTop:2 }}>
                            → {issue.suggestion ?? issue.fix}
                          </div>
                        )}
                      </div>
                      {/* Auto-Fix button (Task 9.2) */}
                      {issue.autoFixKey && onTokenChange && lvl !== 'pass' && (
                        <button onClick={() => applyFix(issue)}
                          style={{
                            padding:'3px 8px', borderRadius:4, flexShrink:0,
                            border:`1px solid ${lvl==='error'?'#fca5a5':'#fde047'}`,
                            background:'rgba(255,255,255,0.6)',
                            color:lvl==='error'?'#991b1b':'#854d0e',
                            fontSize:9, cursor:'pointer', fontFamily:'"Geist Mono",monospace',
                            fontWeight:600, transition:'all .12s',
                          }}>
                          Auto-Fix
                        </button>
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
  const dotRef    = useRef(null);
  const totalH    = NODE_H * HIER_NODES.length;

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
    <div aria-hidden="true" style={{ padding:'14px 16px', marginBottom:20, borderRadius:8, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', position:'relative' }}>
      <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', marginBottom:10 }}>TOKEN CASCADE</div>
      {/* Vertical rail */}
      <div style={{ position:'absolute', left:28, top:36, width:1, height:totalH - 14, background:'rgba(255,255,255,0.07)' }}/>
      {/* Traveling dot */}
      <div ref={dotRef} style={{ position:'absolute', left:24, top:36, width:9, height:9, borderRadius:'50%', background:'#c8602a', boxShadow:'0 0 10px #c8602a80', zIndex:2 }}/>
      {/* Nodes */}
      {HIER_NODES.map((node, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, height:NODE_H }}>
          <div style={{ width:9, height:9, borderRadius:'50%', background:node.dot, flexShrink:0, zIndex:1, boxShadow:`0 0 6px ${node.dot}80` }}/>
          <div>
            <div style={{ fontSize:11, fontFamily:'"DM Mono",monospace', color:'#e2e8f0', fontWeight:600, lineHeight:1 }}>{node.label}</div>
            <div style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(226,232,240,0.30)', marginTop:3 }}>{node.sub}</div>
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
  return <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:value, border:'1px solid rgba(255,255,255,0.12)', flexShrink:0, verticalAlign:'middle', marginRight:4 }}/>;
}

function TkRow({ name, value, delay=0 }) {
  const shortName = name.split('.').pop();
  return (
    <motion.div
      initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }}
      transition={{ duration:0.18, delay }}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 8px', borderRadius:4, gap:8, minWidth:0 }}>
      <span style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(226,232,240,0.45)', flexShrink:0, minWidth:90 }}>{shortName}</span>
      <span style={{ fontSize:9, fontFamily:'"DM Mono",monospace', color:'rgba(226,232,240,0.75)', display:'flex', alignItems:'center', gap:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0, flexShrink:1 }}>
        <TkSwatch value={value}/>{value}
      </span>
    </motion.div>
  );
}

function TokenAccordion({ label, rows }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.65)', fontFamily:'"DM Mono",monospace', fontSize:10, fontWeight:600 }}>
        <span>{label}</span>
        <span style={{ fontSize:8, opacity:0.5 }}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom:6 }}>
          {rows.map(({ name, value }, i) => <TkRow key={name} name={name} value={value} delay={i*0.02}/>)}
        </div>
      )}
    </div>
  );
}

function TokensPreview({ tokens, mode }) {
  const { primitive, semantic, component } = useMemo(
    () => computeAllTokens(tokens, mode), [tokens, mode]
  );
  const { palette, spacingSteps, shadowDefs } = primitive;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, background:'#0d1117', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', color:'#e2e8f0' }}>

      {/* Hierarchy diagram */}
      <div style={{ padding:'16px 16px 0' }}>
        <HierarchyDiagram />
        {/* Text equivalent for screen readers (Task 10.4) */}
        <p style={{ position:'absolute', width:1, height:1, overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap' }}>
          Token cascade: Palette → Primitive Tokens → Semantic Tokens → Component Tokens → UI Components
        </p>
      </div>

      {/* ── Section 1: Primitive ── */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', padding:'10px 0 8px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:10 }}>
          PRIMITIVE TOKENS
        </div>
        {/* Palette mini-grid */}
        <div style={{ marginBottom:10 }}>
          {palette.map((shades, i) => (
            <div key={i} style={{ display:'flex', gap:2, marginBottom:4 }}>
              {SHADE_KEYS.map(k => (
                <div key={k} title={`${COLOR_NAMES[i]??`c${i}`}-${k}: ${shades[k]}`}
                  style={{ flex:1, height:14, borderRadius:2, background:shades[k] }}/>
              ))}
            </div>
          ))}
          <div style={{ display:'flex', gap:2 }}>
            {SHADE_KEYS.map(k => (
              <div key={k} style={{ flex:1, fontSize:7, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.2)', textAlign:'center' }}>{k}</div>
            ))}
          </div>
        </div>
        {/* Spacing mini bars */}
        <div style={{ display:'flex', gap:3, marginBottom:10, alignItems:'flex-end', height:24 }}>
          {spacingSteps.slice(0,12).map((v, i) => {
            const max = spacingSteps[11] ?? 64;
            return <div key={i} title={`space-${i+1}: ${v}px`}
              style={{ flex:1, height:`${Math.max(8,(v/max)*24)}px`, borderRadius:2, background:'rgba(99,102,241,0.45)' }}/>;
          })}
        </div>
        {/* Radius + shadow */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {['0px','4px','8px','16px','9999px'].map(r => (
            <div key={r} style={{ width:22, height:22, borderRadius:r, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)' }} title={r}/>
          ))}
          <div style={{ flex:1 }}/>
          {['sm','md','lg'].map(k => (
            <div key={k} style={{ width:30, height:16, borderRadius:3, background:'rgba(255,255,255,0.06)', boxShadow:shadowDefs[k], display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:7, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.3)' }}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Semantic ── */}
      <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', padding:'10px 0 8px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:6 }}>
          SEMANTIC TOKENS
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
          {SEM_GROUPS.map(({ label, prefix }, gi) => {
            const rows = Object.entries(semantic)
              .filter(([k]) => k.startsWith(prefix))
              .map(([k, v]) => ({ name:k, value:v }));
            if (!rows.length) return null;
            return (
              <div key={gi} style={{ padding:'6px 4px', borderBottom:'1px solid rgba(255,255,255,0.05)', ...(gi%2===0?{ borderRight:'1px solid rgba(255,255,255,0.05)' }:{}) }}>
                <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.28)', marginBottom:4, paddingLeft:4 }}>{label}</div>
                {rows.map(({ name, value }, ri) => <TkRow key={name} name={name} value={value} delay={gi*0.04 + ri*0.015}/>)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Component ── */}
      <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:8, fontFamily:'"DM Mono",monospace', color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', padding:'10px 0 8px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:4 }}>
          COMPONENT TOKENS
        </div>
        {COMP_GROUPS.map(({ key, label }) => {
          const rows = Object.entries(component)
            .filter(([k]) => k.startsWith(key+'.'))
            .map(([k, v]) => ({ name:k, value:v }));
          if (!rows.length) return null;
          return <TokenAccordion key={key} label={label} rows={rows}/>;
        })}
      </div>
    </div>
  );
}

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

export default function PreviewCanvas({ tokens, onTokenChange }) {
  const [activeTab, setActiveTab] = useState('components');
  const [mode, setMode]           = useState('light');

  const scopedVars = useMemo(() => buildScopedVars(tokens, mode), [tokens, mode]);
  const platform   = tokens.platform ?? 'web';
  const plat       = PLATFORMS[platform];
  // Memoize vibe score
  const vibe       = useMemo(() => computeVibeScore(tokens), [tokens.colors.swatches, tokens.shape, tokens.shadows]);
  // Error badge count for WCAG tab (lightweight sync check — full audit runs on idle in AuditPreview)
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
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={canvasRef} style={{ flex:1, overflowY:'auto', position:'relative', background: mode==='dark' ? '#0d0c0b' : '#fff' }}>
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
                {activeTab==='components' && <ComponentsPreview tokens={tokens}/>}
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
