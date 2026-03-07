/**
 * PreviewCanvas.jsx — Right panel
 * 5 tabs · light/dark toggle · device frame · WCAG audit
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// Inject keyframes once (spinner)
;(function () {
  if (typeof document === 'undefined' || document.getElementById('pc-kf')) return;
  const s = document.createElement('style');
  s.id = 'pc-kf';
  s.textContent = '@keyframes pc-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

import {
  computeTokens, computeAllTokens, tokensToCSSVars,
  getHarmonyHues, generateShades,
  SHAPE_RADIUS, generateTypeScale, hslToHex,
  getContrastRatio, wcagLevel, auditTokens, getAutoFix, PLATFORMS, computeVibeScore,
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
  const { baseHue, saturation } = tokens.colors;

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
      <SectionLabel>Motion</SectionLabel>
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
   iOS COMPONENTS PREVIEW
───────────────────────────────────────────────────────── */
function IOSComponentsPreview() {
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [seg, setSeg] = useState(0);
  const [checked, setChecked] = useState([true, false, true]);
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
   ANDROID / MATERIAL 3 PREVIEW
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
   PREVIEW: COMPONENTS
───────────────────────────────────────────────────────── */
function ComponentsPreview({ platform, tokens }) {
  const [activeNav, setActiveNav] = useState('Work');
  const matrixRef = useRef(null);

  // Platform routing
  if (platform === 'ios') return <IOSComponentsPreview />;
  if (platform === 'android') return <AndroidComponentsPreview />;
  if (platform === 'system') return <DSOnlyPreview tokens={tokens} />;

  const isMobile = false;

  // GSAP scale-pulse when tokens change
  useEffect(() => {
    if (!matrixRef.current) return;
    gsap.fromTo(matrixRef.current,
      { scale:1 },
      { scale:1.012, duration:0.1, yoyo:true, repeat:1, ease:'power2.inOut' }
    );
  }, [tokens]);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap: isMobile ? 20 : 28 }}>

      {/* ── Button state matrix ── */}
      <div>
        <SectionLabel>Button States</SectionLabel>
        {isMobile ? (
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            <DSBtn variant="primary" size="lg">Primary</DSBtn>
            <DSBtn variant="secondary" size="lg">Secondary</DSBtn>
            <DSBtn variant="ghost" size="lg">Cancel</DSBtn>
          </div>
        ) : (
          <ButtonMatrix matrixRef={matrixRef}/>
        )}
      </div>

      {/* ── Input states ── */}
      {!isMobile && (
        <div>
          <SectionLabel>Input States</SectionLabel>
          <InputStates/>
        </div>
      )}

      {/* ── Card ── */}
      <div>
        <SectionLabel>Card</SectionLabel>
        <div style={{ display:'flex',gap:14,flexWrap: isMobile ? 'nowrap' : 'wrap',flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: isMobile ? 'unset' : '0 0 220px', borderRadius:'var(--ds-radius-lg)',border:'1px solid var(--ds-border)',background:'var(--ds-bg-elevated)',boxShadow:'var(--ds-shadow-md)',overflow:'hidden' }}>
            <div style={{ height:90,background:'linear-gradient(135deg,var(--ds-primary-l) 0%,var(--ds-primary) 100%)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.25)',backdropFilter:'blur(4px)' }}/>
            </div>
            <div style={{ padding:'12px 14px 14px' }}>
              <span style={{ fontSize:'var(--ds-text-lg)',fontWeight:700,fontFamily:'var(--ds-font-display)',color:'var(--ds-fg)',lineHeight:1.25,display:'block',marginBottom:5 }}>Design System</span>
              <p style={{ fontSize:12,fontFamily:'var(--ds-font-body)',color:'var(--ds-text-muted)',lineHeight:1.65,margin:'0 0 12px' }}>Consistent, accessible, beautiful by default.</p>
              <DSBtn variant="primary" size="sm">Explore →</DSBtn>
            </div>
          </div>
          <div style={{ display:'flex',flexDirection: isMobile ? 'row' : 'column',gap:10,flex:1 }}>
            {[{label:'Components',value:'48',delta:'+12%'},{label:'Token Groups',value:'6',delta:'Updated'}].map(({ label,value,delta }) => (
              <div key={label} style={{ padding:'12px 16px',borderRadius:'var(--ds-radius)',border:'1px solid var(--ds-border)',background:'var(--ds-bg-elevated)',boxShadow:'var(--ds-shadow-sm)',flex:1 }}>
                <div style={{ fontSize:10,color:'var(--ds-text-muted)',fontFamily:'var(--ds-font-body)',marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:22,fontWeight:700,fontFamily:'var(--ds-font-display)',color:'var(--ds-fg)',lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:11,color:'var(--ds-primary)',fontFamily:'var(--ds-font-body)',marginTop:4 }}>{delta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Badges ── */}
      <div>
        <SectionLabel>Badges</SectionLabel>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          <Chip variant="primary">Design</Chip>
          <Chip variant="success">WCAG AA</Chip>
          <Chip variant="warning">Beta</Chip>
          <Chip variant="info">Tokens</Chip>
          <Chip variant="danger">Deprecated</Chip>
        </div>
      </div>

      {/* ── Navigation (desktop) / Tab bar (mobile) ── */}
      {!isMobile && (
        <div>
          <SectionLabel>Navigation</SectionLabel>
          <nav style={{ display:'flex',alignItems:'center',gap:4,padding:'8px 14px',borderRadius:'var(--ds-radius)',border:'1px solid var(--ds-border)',background:'var(--ds-bg-elevated)',boxShadow:'var(--ds-shadow-sm)' }}>
            <span style={{ fontWeight:800,fontSize:15,fontFamily:'var(--ds-font-display)',color:'var(--ds-fg)',marginRight:'auto' }}>Brand</span>
            {['Home','Work','About','Contact'].map(item => (
              <button key={item} onClick={()=>setActiveNav(item)}
                style={{ padding:'5px 11px',borderRadius:'var(--ds-radius-sm)',background:item===activeNav?'var(--ds-primary)':'transparent',color:item===activeNav?'#fff':'var(--ds-text-muted)',border:'none',fontFamily:'var(--ds-font-body)',fontSize:12,cursor:'pointer',fontWeight:item===activeNav?600:400,transition:'all .12s' }}>
                {item}
              </button>
            ))}
          </nav>
        </div>
      )}
      {isMobile && (
        <div>
          <SectionLabel>Tab Bar ({platform === 'ios' ? 'iOS' : 'Android'})</SectionLabel>
          <div style={{ borderTop:'1px solid var(--ds-border)',background:'var(--ds-bg-elevated)',display:'flex',justifyContent:'space-around',padding:'10px 0 4px',borderRadius:'var(--ds-radius)' }}>
            {[['🏠','Home'],['🔍','Search'],['❤️','Saved'],['👤','Profile']].map(([icon,label]) => (
              <button key={label} onClick={()=>setActiveNav(label)}
                style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer',minWidth:44,minHeight:44,padding:'4px 8px',borderRadius:'var(--ds-radius-sm)',justifyContent:'center' }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <span style={{ fontSize:9,fontFamily:'var(--ds-font-body)',color:activeNav===label?'var(--ds-primary)':'var(--ds-text-muted)',fontWeight:activeNav===label?600:400 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      <div>
        <SectionLabel>Alerts</SectionLabel>
        <div style={{ display:'flex',flexDirection:'column',gap:7,maxWidth:400 }}>
          {[
            { icon:'✓',bg:'#dcfce7',border:'#86efac',text:'#166534',msg:'Design tokens exported successfully.' },
            { icon:'⚠',bg:'#fefce8',border:'#fde047',text:'#854d0e',msg:'Contrast ratio below WCAG AA on primary.' },
            { icon:'✕',bg:'#fee2e2',border:'#fca5a5',text:'#991b1b',msg:'Failed to apply preset. Check tokens.' },
          ].map(({ icon,bg,border,text,msg },i) => (
            <div key={i} style={{ padding:'9px 13px',borderRadius:'var(--ds-radius)',background:bg,border:`1px solid ${border}`,display:'flex',gap:9,alignItems:'flex-start' }}>
              <span style={{ fontSize:13,color:text,fontWeight:700,lineHeight:1.6 }}>{icon}</span>
              <span style={{ fontSize:12,fontFamily:'var(--ds-font-body)',color:text,lineHeight:1.6 }}>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Motion tiles (desktop) ── */}
      {!isMobile && <MotionSection tokens={tokens}/>}
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
    <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
      <div style={{ padding:'10px 14px',marginBottom:18,borderRadius:'var(--ds-radius)',background:'var(--ds-bg-subtle)',border:'1px solid var(--ds-border)',display:'flex',gap:18,flexWrap:'wrap' }}>
        {[['Display',tokens.typography.display],['Body',tokens.typography.body],['Mono',tokens.typography.mono],['Scale',`×${tokens.typography.scale}`],['Base',`${tokens.typography.baseSize}px`]].map(([l,v]) => (
          <div key={l}>
            <div style={{ fontSize:8,color:'var(--ds-text-muted)',fontFamily:'var(--ds-font-mono)',letterSpacing:'0.06em',marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:11,color:'var(--ds-fg)',fontFamily:'var(--ds-font-mono)',fontWeight:600 }}>{v}</div>
          </div>
        ))}
      </div>
      {levels.map(({ key,role,weight,font,sample }) => (
        <div key={key} style={{ display:'grid',gridTemplateColumns:'78px 1fr',gap:14,padding:'13px 0',borderBottom:'1px solid var(--ds-border)' }}>
          <div style={{ paddingTop:3 }}>
            <div style={{ fontSize:9,color:'var(--ds-text-muted)',fontFamily:'var(--ds-font-mono)' }}>{role}</div>
            <div style={{ fontSize:8,color:'var(--ds-primary)',fontFamily:'var(--ds-font-mono)',fontWeight:700,marginTop:2 }}>{Math.round(typeScale[key])}px</div>
          </div>
          <div style={{
            fontSize: Math.min(typeScale[key], ['4xl','3xl'].includes(key) ? (key==='4xl'?44:34) : 999),
            fontWeight:weight, fontFamily:font, color:'var(--ds-fg)',
            lineHeight: weight>=600?1.15:1.65,
            letterSpacing: weight>=700?'-0.03em':weight>=600?'-0.01em':'0',
            overflow:'hidden',display:'-webkit-box',
            WebkitLineClamp:2,WebkitBoxOrient:'vertical',
          }}>{sample}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PREVIEW: COLORS
───────────────────────────────────────────────────────── */
function ColorsPreview({ tokens }) {
  const { colors } = tokens;
  const hues = getHarmonyHues(colors.baseHue, colors.harmony, colors.count);
  const roleNames = ['Primary','Secondary','Tertiary','Accent','Neutral','Warning'];

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:22 }}>
      {hues.map((hue,i) => {
        const slotHue = (colors.colorSlotHues?.[i] != null) ? colors.colorSlotHues[i] : hue;
        const shades  = generateShades(slotHue, colors.saturation);
        return (
          <div key={i}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
              <span style={{ fontSize:12,fontWeight:600,fontFamily:'var(--ds-font-body)',color:'var(--ds-fg)' }}>{roleNames[i]??`Color ${i+1}`}</span>
              <span style={{ fontSize:10,color:'var(--ds-text-muted)',fontFamily:'var(--ds-font-mono)' }}>{Math.round(slotHue)}° / {colors.saturation}%</span>
            </div>
            <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
              {SHADE_KEYS.map(k => {
                const hex = shades[k];
                const onW = getContrastRatio(hex,'#ffffff');
                const onB = getContrastRatio(hex,'#111');
                const best = onW >= onB ? { ratio:onW, bg:'white' } : { ratio:onB, bg:'dark' };
                const { level, color } = wcagLevel(best.ratio);
                const isLight = k <= 200;
                return (
                  <div key={k} style={{ width:52,flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                    <div style={{ width:52,height:40,borderRadius:'var(--ds-radius-sm)',background:hex,border:isLight?'1px solid rgba(0,0,0,0.10)':'none' }}
                      title={`${hex} — ${best.ratio.toFixed(1)}:1 on ${best.bg}`}/>
                    <span style={{ fontSize:8,fontFamily:'var(--ds-font-mono)',color:'var(--ds-text-muted)',lineHeight:1 }}>{k}</span>
                    <span style={{ fontSize:7,fontFamily:'var(--ds-font-mono)',color:'var(--ds-text-muted)',lineHeight:1 }}>{hex}</span>
                    <span style={{ fontSize:7,fontFamily:'var(--ds-font-mono)',color,fontWeight:700,lineHeight:1 }}>{level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ padding:'9px 12px',borderRadius:'var(--ds-radius)',background:'var(--ds-bg-subtle)',border:'1px solid var(--ds-border)',fontSize:10,fontFamily:'var(--ds-font-mono)',color:'var(--ds-text-muted)',lineHeight:1.7 }}>
        AAA ≥7:1 · AA ≥4.5:1 · AA-L ≥3:1 (large text) · Fail &lt;3:1
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
  const platform  = tokens.platform ?? 'web';
  const frameW    = platform === 'ios' ? 375 : platform === 'android' ? 360 : 768;
  const scaleKey  = tokens.spacing.scale === 'fibonacci' ? 'fib' : 'sp';
  const max       = Math.max(...spacingSteps.slice(0,16));

  // Spacing groups
  const micro = spacingSteps.slice(0, 3);
  const base  = spacingSteps.slice(3, 8);
  const macro = spacingSteps.slice(8, 16);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── Section 1: Grid Visualizer ── */}
      <div>
        <SectionLabel>Grid — {cols} columns · {gutterPx}px gutter</SectionLabel>
        <div style={{ position:'relative', height:60, borderRadius:'var(--ds-radius)', overflow:'hidden', border:'1px solid var(--ds-border)', background:'var(--ds-bg-subtle)' }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              left:`calc(${(i/cols)*100}% + ${gutterPx/2}px)`,
              width:`calc(${(1/cols)*100}% - ${gutterPx}px)`,
              top:0, bottom:0,
              background:'var(--ds-primary)',
              opacity: 0.12,
            }}/>
          ))}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:10, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>{cols}-column grid · {gutterPx}px gutters</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Breakpoint Ruler ── */}
      <div>
        <SectionLabel>Breakpoints</SectionLabel>
        <div style={{ position:'relative', height:48 }}>
          {/* Ruler bar */}
          <div style={{ position:'absolute', left:0, right:0, top:20, height:3, background:'var(--ds-border)', borderRadius:2 }}/>
          {/* Frame width marker */}
          {(() => {
            const maxPx = 1536;
            const pct   = Math.min(100, (frameW / maxPx) * 100);
            return (
              <div style={{ position:'absolute', left:`${pct}%`, top:10, width:2, height:22, background:'var(--ds-primary)', borderRadius:1, zIndex:2 }}>
                <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', fontSize:8, fontFamily:'var(--ds-font-mono)', color:'var(--ds-primary)', whiteSpace:'nowrap', fontWeight:700 }}>{frameW}px ▾</div>
              </div>
            );
          })()}
          {BREAKPOINTS.map(({ key, px }) => {
            const maxPx = 1536;
            const pct   = (px / maxPx) * 100;
            return (
              <div key={key} style={{ position:'absolute', left:`${pct}%`, top:14, transform:'translateX(-50%)' }}>
                <div style={{ width:1, height:12, background:'var(--ds-border-strong)', margin:'0 auto' }}/>
                <div style={{ fontSize:8, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', textAlign:'center', whiteSpace:'nowrap', marginTop:3 }}>{key}<br/>{px}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Spacing Scale ── */}
      <div>
        <SectionLabel>Spacing Scale</SectionLabel>
        {[['Micro', micro, 0], ['Base', base, 3], ['Macro', macro, 8]].map(([gLabel, steps, offset]) => (
          <div key={gLabel} style={{ marginBottom:14 }}>
            <div style={{ fontSize:8, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', marginBottom:6, letterSpacing:'0.06em' }}>{gLabel.toUpperCase()}</div>
            {steps.map((val, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'52px 1fr 48px 48px', gap:8, alignItems:'center', padding:'4px 0', borderBottom:'1px solid var(--ds-border)' }}>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', fontWeight:600 }}>{scaleKey}-{offset+i+1}</span>
                <div style={{ height:14, width:`${Math.max(3,(val/max)*100)}%`, background:'var(--ds-primary)', borderRadius:'var(--ds-radius-sm)', opacity:0.5+(i/16)*0.5, transition:'width .3s' }}/>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', textAlign:'right' }}>{val}px</span>
                <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)', textAlign:'right' }}>{+(val/16).toFixed(2)}rem</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Section 4: Z-Index Stack ── */}
      <div>
        <SectionLabel>Z-Index Stack</SectionLabel>
        <div style={{ position:'relative', height:160 }}>
          {Z_LAYERS.map(({ key, z, color }, i) => (
            <div key={key} style={{
              position:'absolute',
              left: i * 14,
              top:  i * 14,
              width: 200,
              height: 34,
              borderRadius:'var(--ds-radius)',
              background: color,
              border:'1px solid rgba(255,255,255,0.12)',
              backdropFilter:'blur(2px)',
              display:'flex', alignItems:'center', gap:10, padding:'0 12px',
              boxShadow:`0 ${2+i*2}px ${8+i*4}px rgba(0,0,0,0.12)`,
            }}>
              <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-fg)', fontWeight:600, minWidth:60 }}>{key}</span>
              <span style={{ fontSize:9, fontFamily:'var(--ds-font-mono)', color:'var(--ds-text-muted)' }}>z-index: {z}</span>
            </div>
          ))}
        </div>
      </div>
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
  const bg   = semantic['color.background.base']  ?? (mode==='dark' ? hslToHex(tokens.colors.baseHue,Math.min(tokens.colors.saturation*0.14,11),8) : '#ffffff');
  const prim = semantic['color.action.primary']   ?? (mode==='dark' ? (p[400]??'#60a5fa') : (p[500]??'#4f46e5'));
  const fg   = semantic['color.text.primary']     ?? (mode==='dark' ? '#f2efe9' : (p[900]??'#111111'));
  const plat = PLATFORMS[tokens.platform??'web'];

  const matrixRows = [
    { label:'Primary vs White',  hex1:prim,  hex2:'#ffffff' },
    { label:'Primary vs Black',  hex1:prim,  hex2:'#111111' },
    { label:'Body text vs BG',   hex1:fg,    hex2:bg },
    { label:'Muted text vs BG',  hex1: mode==='dark' ? 'rgba(242,239,233,0.40)' : (p[500]??'#6b7280'), hex2:bg },
    { label:'White on Primary',  hex1:'#ffffff', hex2:prim },
    { label:'Primary vs Subtle', hex1:prim,  hex2: mode==='dark'?hslToHex(tokens.colors.baseHue,Math.min(tokens.colors.saturation*0.14,11),17):(p[50]??'#f8f9fa') },
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
  { id:'colors',     label:'Colors'     },
  { id:'layout',     label:'Layout'     },
  { id:'audit',      label:'WCAG'       },
  { id:'tokens',     label:'Tokens'     },
];

export default function PreviewCanvas({ tokens, onTokenChange }) {
  const [activeTab, setActiveTab] = useState('components');
  const [mode, setMode]           = useState('light');

  const scopedVars = useMemo(() => buildScopedVars(tokens, mode), [tokens, mode]);
  const platform   = tokens.platform ?? 'web';
  const isMobile   = platform === 'ios' || platform === 'android';
  const plat       = PLATFORMS[platform];
  // Memoize vibe score (Task 10.3 — avoid recomputing on every render)
  const vibe       = useMemo(() => computeVibeScore(tokens), [tokens.colors.saturation, tokens.shape, tokens.shadows, tokens.colors.harmony, tokens.colors.baseHue]);
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

  // Task 8.2 — ambient gradient from palette
  const canvasBg = useMemo(() => {
    const { palette } = computeTokens(tokens);
    const p1 = palette[0] ?? {};
    const p2 = palette[1] ?? palette[0] ?? {};
    if (mode === 'dark') {
      const c1 = p1[900] ?? '#0a0a09';
      const c2 = p2[900] ?? c1;
      return `radial-gradient(ellipse at 25% 15%, ${c1}55 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, ${c2}44 0%, transparent 55%), #080807`;
    }
    const c1 = p1[100] ?? '#e8e8e7';
    const c2 = p2[100] ?? c1;
    return `radial-gradient(ellipse at 25% 15%, ${c1} 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, ${c2} 0%, transparent 55%), #efefee`;
  }, [tokens.colors, mode]);

  return (
    <div style={{ flex:1,height:'100%',display:'flex',flexDirection:'column',overflow:'hidden' }}>

      {/* ── Tab bar ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',height:42,borderBottom:'1px solid rgba(0,0,0,0.07)',background:'#fff',flexShrink:0 }}>
        <div style={{ display:'flex',gap:2 }}>
          {PREVIEW_TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              aria-selected={activeTab===tab.id} role="tab"
              style={{ padding:'5px 12px',borderRadius:5,border:'none',background:activeTab===tab.id?'#1a1814':'transparent',color:activeTab===tab.id?'#fff':'rgba(0,0,0,0.45)',fontSize:11,cursor:'pointer',fontFamily:'"Geist Sans",system-ui',fontWeight:activeTab===tab.id?500:400,transition:'all .12s',
                position:'relative' }}>
              {tab.label}
              {tab.id === 'audit' && auditErrorCount > 0 && activeTab !== 'audit' && (
                <span aria-label={`${auditErrorCount} accessibility error${auditErrorCount > 1 ? 's' : ''}`} style={{ position:'absolute',top:3,right:3,width:7,height:7,borderRadius:'50%',background:'#ef4444',border:'1.5px solid #fafafa',boxShadow:'0 0 5px rgba(239,68,68,0.55)' }}/>
              )}
            </button>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          {/* Vibe score (Task 8.3) */}
          {(() => {
            return (
              <motion.span key={vibe.label}
                initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
                title={vibe.tagline}
                style={{ fontSize:10, color:'rgba(0,0,0,0.40)', fontFamily:'"Geist Sans",system-ui', display:'flex', alignItems:'center', gap:4, cursor:'default' }}>
                <span style={{ fontSize:12 }}>{vibe.emojis[0]}</span>{vibe.label}
              </motion.span>
            );
          })()}
          {/* Platform badge */}
          {plat && (
            <span style={{ fontSize:10,color:'rgba(0,0,0,0.35)',fontFamily:'"Geist Sans",system-ui',display:'flex',alignItems:'center',gap:4 }}>
              <span>{plat.icon}</span>{plat.label}
            </span>
          )}
          {/* Light / dark toggle */}
          <button onClick={()=>setMode(m=>m==='light'?'dark':'light')}
            aria-label={`Switch to ${mode==='light'?'dark':'light'} mode`}
            style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:20,border:'1px solid rgba(0,0,0,0.12)',background:mode==='dark'?'#1a1814':'#f4f4f3',color:mode==='dark'?'#fff':'rgba(0,0,0,0.55)',fontSize:11,cursor:'pointer',fontFamily:'"Geist Sans",system-ui',fontWeight:500,transition:'all .18s' }}>
            <span>{mode==='dark'?'🌙':'☀️'}</span>
            {mode==='dark'?'Dark':'Light'}
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={canvasRef} style={{ flex:1,overflowY:'auto',background:canvasBg,padding: isMobile ? '24px 16px' : 24,display:'flex',justifyContent:'center',position:'relative' }}>
        {/* Cascade ripple overlay (Task 8.1) */}
        <div data-cascade-overlay="1" style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:10,display:'none',borderRadius:'inherit' }}/>
        <AnimatePresence mode="wait">
          <motion.div key={`${mode}-${activeTab}`}
            initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }}
            transition={{ duration:.18 }}
            style={{ width:'100%', maxWidth: isMobile&&activeTab==='components' ? 480 : 720 }}>

            {activeTab === 'audit' ? (
              /* Audit — own white surface */
              <div style={{ padding:28,borderRadius:12,boxShadow:mode==='dark'?'0 0 0 1px rgba(255,255,255,0.07),0 20px 60px rgba(0,0,0,0.7)':'0 0 0 1px rgba(0,0,0,0.07),0 12px 40px rgba(0,0,0,0.10)', background:'#fff', ...scopedVars }}>
                <AuditPreview tokens={tokens} mode={mode} onTokenChange={onTokenChange} />
              </div>
            ) : activeTab === 'tokens' ? (
              /* Tokens — dark code-editor, no device frame, own scroll */
              <TokensPreview tokens={tokens} mode={mode} />
            ) : (
              <DeviceFrame platform={activeTab==='components'?platform:'web'}>
                <div className="ds-preview" style={{ padding: isMobile ? 16 : 28, borderRadius: isMobile ? 0 : 12, boxShadow: isMobile ? 'none' : (mode==='dark'?'0 0 0 1px rgba(255,255,255,0.07),0 20px 60px rgba(0,0,0,0.7)':'0 0 0 1px rgba(0,0,0,0.07),0 12px 40px rgba(0,0,0,0.10)'), ...scopedVars, background:'var(--ds-bg)' }}>
                  {activeTab==='components' && <ComponentsPreview platform={platform} tokens={tokens} mode={mode}/>}
                  {activeTab==='typography' && <TypographyPreview tokens={tokens} />}
                  {activeTab==='colors'     && <ColorsPreview tokens={tokens} />}
                  {activeTab==='layout'     && <LayoutPreview tokens={tokens} />}
                </div>
              </DeviceFrame>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
