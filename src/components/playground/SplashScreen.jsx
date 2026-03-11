/**
 * SplashScreen.jsx — 3-step onboarding wizard for Design System Builder
 * Step 1: Choose a vibe (preset) · Step 2: Set brand color · Step 3: Pick fonts
 * Phase 4 — Gap #24
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRESETS, FONT_CATEGORIES, hexToHsl, hslToHex } from './dsEngine';

const FONT = `"Geist Sans", system-ui, sans-serif`;
const MONO = `"Geist Mono", monospace`;

/* ── Preset mini-preview swatches ── */
const PRESET_COLORS = {
  minimal:   ['#3b5bdb','#868e96','#dee2e6'],
  corporate: ['#1971c2','#2f9e44','#5c7cfa'],
  playful:   ['#e64980','#f76707','#74c417','#7950f2'],
  editorial: ['#212529','#c9956a','#868e96'],
  brutalist: ['#f08c00','#1864ab','#212529'],
  glass:     ['#0c8599','#1864ab','#5c7cfa'],
  editorial2:['#212529','#495057','#adb5bd'],
  neon:      ['#ae3ec9','#2563eb','#0ca678'],
};

const PRESET_LIST = [
  { id: 'minimal',   label: 'Minimal',   desc: 'Clean & purposeful' },
  { id: 'corporate', label: 'Corporate', desc: 'Professional & trusted' },
  { id: 'playful',   label: 'Playful',   desc: 'Bold & expressive' },
  { id: 'editorial', label: 'Editorial', desc: 'Refined & typographic' },
  { id: 'brutalist', label: 'Brutalist', desc: 'Raw & unconventional' },
  { id: 'neon',      label: 'Neon',      desc: 'Vivid & futuristic' },
];

const DISPLAY_FONTS = FONT_CATEGORIES.serif.fonts.concat(FONT_CATEGORIES.display.fonts).slice(0, 12);
const BODY_FONTS    = FONT_CATEGORIES.sans.fonts.slice(0, 12);
const MONO_FONTS    = FONT_CATEGORIES.mono.fonts.slice(0, 8);

function StepDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === step ? 20 : 6, height: 6, borderRadius: 3,
          background: i === step ? '#c8602a' : i < step ? 'rgba(200,96,42,0.3)' : 'rgba(0,0,0,0.1)',
          transition: 'all .25s',
        }} />
      ))}
    </div>
  );
}

/* ── Step 1: Choose a vibe ── */
function Step1({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, color: '#c8602a', fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 6 }}>STEP 1 OF 3</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1814', letterSpacing: '-0.025em' }}>Choose a vibe</h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.46)', lineHeight: 1.5 }}>Pick a starting point — you can tweak everything later.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {PRESET_LIST.map(p => {
          const colors = PRESET_COLORS[p.id] ?? ['#4f46e5'];
          const isActive = selected === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => onSelect(p.id)}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '12px 12px 10px', borderRadius: 10,
                border: `2px solid ${isActive ? '#c8602a' : 'rgba(0,0,0,0.08)'}`,
                background: isActive ? 'rgba(200,96,42,0.05)' : '#fafaf9',
                cursor: 'pointer', textAlign: 'left',
                transition: 'border-color .12s, background .12s',
              }}>
              {/* Color swatches */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                {colors.map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1814', fontFamily: FONT, marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', fontFamily: FONT }}>{p.desc}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Brand color ── */
function Step2({ brandColor, onColorChange }) {
  const { h, s, l } = hexToHsl(brandColor);
  const shades = [
    hslToHex(h, Math.min(s * 0.3, 40), 96),
    hslToHex(h, Math.min(s * 0.5, 60), 80),
    hslToHex(h, s, 50),
    hslToHex(h, s, 38),
    hslToHex(h, s * 0.7, 20),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, color: '#c8602a', fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 6 }}>STEP 2 OF 3</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1814', letterSpacing: '-0.025em' }}>Set your brand color</h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.46)', lineHeight: 1.5 }}>Your primary palette is auto-generated from this one hex value.</p>
      </div>

      {/* Color picker + hex input */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', inset: 0, background: brandColor }} />
          <input type="color" value={brandColor} onChange={e => onColorChange(e.target.value)}
            style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </div>
        <input
          value={brandColor}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && e.target.value.length === 7) onColorChange(e.target.value); }}
          maxLength={7}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.12)',
            fontSize: 15, fontFamily: MONO, color: '#1a1814', background: '#fff', outline: 'none',
            letterSpacing: '0.06em',
          }}
        />
      </div>

      {/* Live palette preview */}
      <div>
        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.36)', fontFamily: MONO, letterSpacing: '0.06em', marginBottom: 6 }}>GENERATED PALETTE</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {shades.map((c, i) => (
            <div key={i} style={{ flex: 1, height: 32, borderRadius: 6, background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
          {['50', '200', '500', '700', '900'].map(k => (
            <div key={k} style={{ flex: 1, fontSize: 8, color: 'rgba(0,0,0,0.3)', fontFamily: MONO, textAlign: 'center' }}>{k}</div>
          ))}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(0,0,0,0.4)', fontFamily: FONT, lineHeight: 1.55 }}>
        Secondary, tertiary, and semantic colors (success, warning, error) are computed automatically. You can override any swatch in the Customize panel.
      </p>
    </div>
  );
}

/* ── Step 3: Pick fonts ── */
function Step3({ display, body, mono, onChange }) {
  const preview = { display, body, mono };

  const FontRow = ({ label, role, value, fonts }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.46)', fontFamily: FONT }}>{label}</span>
        <span style={{ fontSize: 11, color: '#1a1814', fontFamily: `'${value}', system-ui`, fontWeight: 600 }}>
          {value}
        </span>
      </div>
      <select value={value} onChange={e => onChange(role, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#1a1814', fontFamily: `'${value}', system-ui`, fontSize: 13, cursor: 'pointer', outline: 'none' }}>
        {fonts.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', system-ui` }}>{f}</option>)}
      </select>
      <div style={{ fontSize: 12, fontFamily: `'${value}', serif`, color: '#1a1814', padding: '8px 10px', borderRadius: 6, background: '#f7f6f5', lineHeight: 1.45 }}>
        {role === 'display' ? 'The Quick Brown Fox' : role === 'body' ? 'Designed with intention — every token is a decision.' : 'const radius = tokens.shape.border;'}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, color: '#c8602a', fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 6 }}>STEP 3 OF 3</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1814', letterSpacing: '-0.025em' }}>Pick your fonts</h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.46)', lineHeight: 1.5 }}>Three roles: headings, body text, and code.</p>
      </div>
      <FontRow label="Display — headings & titles" role="display" value={display} fonts={DISPLAY_FONTS} />
      <FontRow label="Body — prose & UI labels"    role="body"    value={body}    fonts={BODY_FONTS} />
      <FontRow label="Mono — code & tokens"        role="mono"    value={mono}    fonts={MONO_FONTS} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SPLASH SCREEN MAIN
══════════════════════════════════════════════════════════ */
export default function SplashScreen({ onClose, onApplyConfig }) {
  const [step, setStep]         = useState(0);
  const [preset, setPreset]     = useState('minimal');
  const [brandColor, setBrand]  = useState('#4f46e5');
  const [fonts, setFonts]       = useState({ display: 'Playfair Display', body: 'DM Sans', mono: 'DM Mono' });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 560);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 560);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleFontChange = (role, value) => setFonts(f => ({ ...f, [role]: value }));

  const handleFinish = () => {
    const basePreset = PRESETS[preset] ?? PRESETS.minimal;
    // Override primary swatch with brand color, keep preset structure
    const configuredTokens = {
      ...basePreset,
      colors: {
        ...basePreset.colors,
        swatches: [
          { hex: brandColor, locked: false },
          ...(basePreset.colors?.swatches?.slice(1) ?? []),
        ],
        harmony: 'complementary',
        saturationBoost: 0,
        semantic: { success: null, warning: null, error: null, info: null },
      },
      typography: {
        ...(basePreset.typography ?? {}),
        display: fonts.display,
        body:    fonts.body,
        mono:    fonts.mono,
      },
    };
    onApplyConfig?.(configuredTokens);
    onClose();
  };

  const steps = ['vibe', 'color', 'fonts'];

  return (
    <AnimatePresence>
      <motion.div
        key="splash-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? 12 : 24,
        }}
      >
        <motion.div
          key="splash-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 520,
            maxHeight: isMobile ? '92vh' : 'none',
            overflowY: isMobile ? 'auto' : 'visible',
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: isMobile ? 14 : 18,
            padding: isMobile ? '18px 16px 20px' : '28px 28px 24px',
            display: 'flex', flexDirection: 'column', gap: 20,
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            fontFamily: FONT,
          }}
        >
          {/* Top row: DESIGN SYSTEM BUILDER label + skip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: MONO, color: '#c8602a', letterSpacing: '0.1em', fontWeight: 700 }}>
              DESIGN SYSTEM BUILDER
            </span>
            <button onClick={onClose}
              style={{ background: 'none', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, color: 'rgba(0,0,0,0.4)', cursor: 'pointer', fontSize: 11, padding: '3px 10px', fontFamily: MONO, transition: 'border-color .15s' }}>
              skip
            </button>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {step === 0 && <Step1 selected={preset} onSelect={setPreset} />}
              {step === 1 && <Step2 brandColor={brandColor} onColorChange={setBrand} />}
              {step === 2 && <Step3 {...fonts} onChange={handleFontChange} />}
            </motion.div>
          </AnimatePresence>

          {/* Step dots */}
          <StepDots step={step} total={3} />

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#1a1814', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
                ← Back
              </button>
            )}
            {step < 2 ? (
              <motion.button
                onClick={() => setStep(s => s + 1)}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#1a1814', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                Continue →
              </motion.button>
            ) : (
              <motion.button
                onClick={handleFinish}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#c8602a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Build my system →
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
