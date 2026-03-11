/**
 * dsEngine.js — Design System Builder utilities
 * Color math · presets · font lists · platform configs · WCAG audit · export
 */

/* ══════════════════════════════════════════════════════════
   COLOR MATH
══════════════════════════════════════════════════════════ */

export function hslToHex(h, s, l) {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r/255, gn = g/255, bn = b/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else                 h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Generate secondary/tertiary hex colors from a primary hex using color harmony theory.
 * Returns an array of 1–3 hex colors (not including primary).
 */
export function generateHarmonyColors(primaryHex, harmonyMode) {
  const { h, s, l } = hexToHsl(primaryHex);
  const sat = Math.max(20, Math.min(s, 85));
  switch (harmonyMode) {
    case 'analogous':     return [hslToHex((h + 30) % 360, sat, l), hslToHex((h - 30 + 360) % 360, sat, l)];
    case 'complementary': return [hslToHex((h + 180) % 360, sat, l)];
    case 'triadic':       return [hslToHex((h + 120) % 360, sat, l), hslToHex((h + 240) % 360, sat, l)];
    case 'split':         return [hslToHex((h + 150) % 360, sat, l), hslToHex((h + 210) % 360, sat, l)];
    case 'mono':          return [hslToHex(h, Math.max(10, sat - 25), l), hslToHex(h, sat, Math.min(80, l + 18))];
    default:              return [hslToHex((h + 180) % 360, sat, l)];
  }
}

/** Generate a harmonious hex using golden-angle hue spacing.
 *  baseOffset (0-360) shifts the whole palette so primary isn't always red/orange. */
export function generateHarmoniousSwatch(index, baseOffset = 0) {
  const hue = Math.round((baseOffset + index * 137.508 + Math.random() * 12) % 360);
  const sat = 58 + Math.floor(Math.random() * 22);
  return hslToHex(hue, sat, 48);
}

/** Extract {baseHue, saturation} from tokens — works with both old and new color formats */
export function getColorBase(tokens) {
  const c = tokens?.colors;
  if (c?.swatches?.[0]?.hex) {
    const { h, s } = hexToHsl(c.swatches[0].hex);
    return { baseHue: h, saturation: s };
  }
  return { baseHue: c?.baseHue ?? 220, saturation: c?.saturation ?? 70 };
}

export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = c => { const v = c/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1), l2 = getLuminance(hex2);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

export function wcagLevel(ratio) {
  if (ratio >= 7)   return { level:'AAA', color:'#22c55e' };
  if (ratio >= 4.5) return { level:'AA',  color:'#22c55e' };
  if (ratio >= 3)   return { level:'AA-L',color:'#f59e0b' };
  return             { level:'Fail',      color:'#ef4444' };
}

export function generateShades(hue, sat) {
  const s = Math.min(100, Math.max(0, sat));
  return {
    50:  hslToHex(hue, Math.min(s*0.30, 40), 96),
    100: hslToHex(hue, Math.min(s*0.40, 55), 90),
    200: hslToHex(hue, Math.min(s*0.60, 70), 80),
    300: hslToHex(hue, Math.min(s*0.75, 80), 68),
    400: hslToHex(hue, s*0.85, 57),
    500: hslToHex(hue, s,      47),
    600: hslToHex(hue, s,      38),
    700: hslToHex(hue, s*0.90, 29),
    800: hslToHex(hue, s*0.80, 20),
    900: hslToHex(hue, s*0.60, 13),
  };
}

export function getHarmonyHues(baseHue, mode, count) {
  const h = ((baseHue % 360) + 360) % 360;
  const fill = (base, step) => Array.from({ length: count }, (_,i) => (base + i*step) % 360);
  switch (mode) {
    case 'mono':          return Array(count).fill(h);
    case 'analogous':     return fill(h, 30);
    case 'complementary': return count <= 2 ? [h,(h+180)%360].slice(0,count) : [h,(h+180)%360,...fill((h+30)%360,30).slice(0,count-2)];
    case 'triadic':       return count <= 3 ? [h,(h+120)%360,(h+240)%360].slice(0,count) : [h,(h+120)%360,(h+240)%360,...fill((h+30)%360,30).slice(0,count-3)];
    case 'split':         return count <= 3 ? [h,(h+150)%360,(h+210)%360].slice(0,count) : [h,(h+150)%360,(h+210)%360,...fill((h+60)%360,30).slice(0,count-3)];
    default:              return [h];
  }
}

/* ══════════════════════════════════════════════════════════
   FONT LIBRARY  (categorised)
══════════════════════════════════════════════════════════ */

export const FONT_CATEGORIES = {
  serif: {
    label: 'Serif',
    fonts: [
      'Playfair Display','DM Serif Display','Fraunces','Libre Baskerville',
      'Cormorant Garamond','Lora','Merriweather','EB Garamond','Crimson Pro',
      'Spectral','Domine','Zilla Slab','Noto Serif','PT Serif',
    ],
  },
  sans: {
    label: 'Sans-Serif',
    fonts: [
      'DM Sans','Inter','Plus Jakarta Sans','Outfit','Nunito','Lato',
      'Work Sans','Source Sans 3','Manrope','Raleway','Figtree',
      'Be Vietnam Pro','Mulish','Barlow','Rubik','Karla','Cabin','Jost',
      'Poppins','Montserrat','Open Sans',
    ],
  },
  display: {
    label: 'Display',
    fonts: [
      'Space Grotesk','Bebas Neue','Cabinet Grotesk','Syne',
      'Oswald','Barlow Condensed','Righteous','Abril Fatface',
      'Pacifico','Lobster Two','Yeseva One','Alfa Slab One',
    ],
  },
  mono: {
    label: 'Monospace',
    fonts: [
      'DM Mono','JetBrains Mono','Space Mono','Fira Code',
      'Roboto Mono','IBM Plex Mono','Source Code Pro','Inconsolata',
      'Courier Prime','Overpass Mono','Share Tech Mono',
    ],
  },
};

export const DISPLAY_FONTS = [
  ...FONT_CATEGORIES.serif.fonts,
  ...FONT_CATEGORIES.display.fonts,
];
export const BODY_FONTS    = FONT_CATEGORIES.sans.fonts;
export const MONO_FONTS    = FONT_CATEGORIES.mono.fonts;

/** Inject a Google Font <link> (idempotent) */
export function loadGoogleFont(name) {
  if (!name) return;
  const id = `gf-${name.replace(/\s+/g,'-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id   = id;
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g,'+')}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/* ══════════════════════════════════════════════════════════
   PLATFORM CONFIGURATIONS
══════════════════════════════════════════════════════════ */

export const PLATFORMS = {
  web: {
    label: 'Web', icon: '🌐',
    baseSize: 16, minTouchTarget: null,
    spacingBase: 8, spacingScale: 'linear',
    defaultShape: 'soft', defaultShadows: 'soft',
    description: 'Standard web — any browser, any screen size',
  },
  ios: {
    label: 'iOS', icon: '📱',
    baseSize: 17, minTouchTarget: 44,
    spacingBase: 8, spacingScale: 'linear',
    defaultShape: 'rounded', defaultShadows: 'soft',
    description: 'iOS Human Interface Guidelines — 44pt touch targets',
  },
  android: {
    label: 'Android', icon: '🤖',
    baseSize: 16, minTouchTarget: 48,
    spacingBase: 8, spacingScale: 'linear',
    defaultShape: 'rounded', defaultShadows: 'soft',
    description: 'Material Design 3 — 48dp touch targets, 8dp grid',
  },
  system: {
    label: 'DS Only', icon: '🎨',
    baseSize: 16, minTouchTarget: null,
    spacingBase: 8, spacingScale: 'linear',
    defaultShape: 'soft', defaultShadows: 'flat',
    description: 'Pure token reference — no platform constraints',
  },
};

export const PLATFORM_KEYS = Object.keys(PLATFORMS);

/* ══════════════════════════════════════════════════════════
   PRESETS
══════════════════════════════════════════════════════════ */

export const PRESETS = {
  minimal:    { label:'Minimal',    colors:{ swatches:[{ hex:'#3b5bdb',locked:false },{ hex:'#868e96',locked:false }] }, typography:{ display:'DM Sans',          body:'DM Sans',        mono:'DM Mono',        scale:1.25,  baseSize:16 }, spacing:{ base:8, scale:'linear'    }, shape:'soft',        shadows:'flat'    },
  corporate:  { label:'Corporate',  colors:{ swatches:[{ hex:'#1971c2',locked:false },{ hex:'#2f9e44',locked:false },{ hex:'#5c7cfa',locked:false }] }, typography:{ display:'Plus Jakarta Sans', body:'Plus Jakarta Sans',mono:'IBM Plex Mono',  scale:1.25,  baseSize:16 }, spacing:{ base:8, scale:'linear'    }, shape:'rounded',     shadows:'soft'    },
  playful:    { label:'Playful',    colors:{ swatches:[{ hex:'#e64980',locked:false },{ hex:'#f76707',locked:false },{ hex:'#74c417',locked:false },{ hex:'#7950f2',locked:false }] }, typography:{ display:'Fraunces',         body:'Nunito',         mono:'Space Mono',     scale:1.414, baseSize:16 }, spacing:{ base:8, scale:'fibonacci' }, shape:'veryRounded', shadows:'hard'    },
  editorial:  { label:'Editorial',  colors:{ swatches:[{ hex:'#212529',locked:false },{ hex:'#c9956a',locked:false }] }, typography:{ display:'Cormorant Garamond',body:'Work Sans',       mono:'DM Mono',        scale:1.618, baseSize:18 }, spacing:{ base:8, scale:'linear'    }, shape:'sharp',       shadows:'flat'    },
  brutalist:  { label:'Brutalist',  colors:{ swatches:[{ hex:'#f08c00',locked:false },{ hex:'#1864ab',locked:false }] }, typography:{ display:'Space Grotesk',    body:'Space Grotesk',  mono:'Space Mono',     scale:1.333, baseSize:16 }, spacing:{ base:4, scale:'linear'    }, shape:'sharp',       shadows:'hard'    },
  glass:      { label:'Glass',      colors:{ swatches:[{ hex:'#0c8599',locked:false },{ hex:'#1864ab',locked:false },{ hex:'#5c7cfa',locked:false }] }, typography:{ display:'Cabinet Grotesk',  body:'Outfit',         mono:'Fira Code',      scale:1.333, baseSize:16 }, spacing:{ base:8, scale:'linear'    }, shape:'veryRounded', shadows:'soft'    },
  editorial2: { label:'Ink',        colors:{ swatches:[{ hex:'#212529',locked:false },{ hex:'#495057',locked:false }] }, typography:{ display:'Libre Baskerville',body:'Lato',           mono:'Courier Prime',  scale:1.414, baseSize:17 }, spacing:{ base:8, scale:'linear'    }, shape:'soft',        shadows:'layered' },
  neon:       { label:'Neon',       colors:{ swatches:[{ hex:'#ae3ec9',locked:false },{ hex:'#2563eb',locked:false },{ hex:'#0ca678',locked:false }] }, typography:{ display:'Syne',             body:'Manrope',        mono:'Share Tech Mono',scale:1.333, baseSize:16 }, spacing:{ base:8, scale:'fibonacci' }, shape:'pill',        shadows:'hard'    },
};

export const PRESET_KEYS = Object.keys(PRESETS);

/* ══════════════════════════════════════════════════════════
   TOKEN COMPUTATION
══════════════════════════════════════════════════════════ */

export const SHAPE_RADIUS = {
  sharp:       '0px',
  soft:        '4px',
  rounded:     '8px',
  veryRounded: '16px',
  pill:        '9999px',
};

export const SCALE_NAMES = { 1.2:'Minor Third', 1.25:'Major Third', 1.333:'Perfect Fourth', 1.414:'Augmented Fourth', 1.618:'Golden Ratio (φ)' };

export function generateTypeScale(baseSize, ratio) {
  return {
    xs:   +(baseSize / ratio / ratio).toFixed(2),
    sm:   +(baseSize / ratio).toFixed(2),
    base: baseSize,
    lg:   +(baseSize * ratio).toFixed(2),
    xl:   +(baseSize * ratio**2).toFixed(2),
    '2xl':+(baseSize * ratio**3).toFixed(2),
    '3xl':+(baseSize * ratio**4).toFixed(2),
    '4xl':+(baseSize * ratio**5).toFixed(2),
  };
}

export function generateSpacing(base, scale) {
  if (scale === 'fibonacci') {
    return [1,1,2,3,5,8,13,21,34,55].map(n => n * base);
  }
  return [0.5,1,1.5,2,3,4,5,6,8,10,12,16].map(m => m * base);
}

export function getShadowDefs(style) {
  switch (style) {
    case 'flat':    return { sm:'none', md:'none', lg:'none' };
    case 'soft':    return { sm:'0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.05)', md:'0 4px 16px rgba(0,0,0,0.10),0 2px 4px rgba(0,0,0,0.06)', lg:'0 10px 40px rgba(0,0,0,0.12),0 4px 10px rgba(0,0,0,0.08)' };
    case 'hard':    return { sm:'2px 2px 0 rgba(0,0,0,0.65)', md:'4px 4px 0 rgba(0,0,0,0.65)', lg:'6px 6px 0 rgba(0,0,0,0.65)' };
    case 'layered': return { sm:'0 1px 1px rgba(0,0,0,0.08),0 2px 2px rgba(0,0,0,0.06),0 4px 4px rgba(0,0,0,0.04)', md:'0 2px 2px rgba(0,0,0,0.08),0 4px 4px rgba(0,0,0,0.06),0 8px 8px rgba(0,0,0,0.04),0 16px 16px rgba(0,0,0,0.02)', lg:'0 2px 2px rgba(0,0,0,0.08),0 4px 4px rgba(0,0,0,0.06),0 8px 8px rgba(0,0,0,0.04),0 16px 16px rgba(0,0,0,0.02),0 32px 32px rgba(0,0,0,0.02)' };
    default:        return { sm:'none', md:'none', lg:'none' };
  }
}

export function computeTokens(tokens) {
  const { colors, typography, spacing, shape, shadows } = tokens;
  let palette;
  if (colors?.swatches?.length) {
    // New swatch-based format: each swatch.hex drives its own shade ramp
    const satBoost = colors?.saturationBoost ?? 0;
    palette = colors.swatches.map(s => {
      const { h, s: sat } = hexToHsl(s?.hex ?? '#4f46e5');
      return generateShades(h, Math.max(5, Math.min(100, sat + satBoost)));
    });
  } else {
    // Legacy HSL format — backward compat for old share URLs
    const hues = getHarmonyHues(colors?.baseHue ?? 220, colors?.harmony ?? 'complementary', colors?.count ?? 3);
    palette = hues.map((hue, i) => {
      const slotHue = (colors?.colorSlotHues?.[i] != null) ? colors.colorSlotHues[i] : hue;
      return generateShades(slotHue, colors?.saturation ?? 70);
    });
  }
  return {
    palette,
    typeScale:    generateTypeScale(typography.baseSize, typography.scale),
    spacingSteps: generateSpacing(spacing.base, spacing.scale),
    shadowDefs:   getShadowDefs(shadows),
  };
}

/* ══════════════════════════════════════════════════════════
   WCAG AUDIT
══════════════════════════════════════════════════════════ */

export function auditTokens(tokens, mode = 'light') {
  const { palette, typeScale, spacingSteps } = computeTokens(tokens);
  const allTok = computeAllTokens(tokens, mode);
  const sem    = allTok.semantic  ?? {};
  const comp   = allTok.component ?? {};
  const mot    = allTok.motion    ?? {};

  const p = palette[0] ?? {};
  const issues = [];

  const { baseHue: _bh, saturation: _bs } = getColorBase(tokens);
  const bg   = sem['color.background.base'] ?? (mode === 'dark' ? hslToHex(_bh, Math.min(_bs*0.14,11), 8) : '#ffffff');
  const fg   = sem['color.text.primary']    ?? (mode === 'dark' ? '#f2efe9' : (p[900] ?? '#111111'));
  const prim = sem['color.action.primary']  ?? (mode === 'dark' ? (p[400] ?? '#60a5fa') : (p[500] ?? '#4f46e5'));
  const surf = sem['color.background.surface'] ?? bg;

  function push(id, category, level, message, suggestion, autoFixKey = null) {
    const status = level === 'error' ? 'fail' : level === 'warning' ? 'warn' : 'pass';
    issues.push({ id, category, level, message, suggestion, status, autoFixKey });
  }

  // ── 1. BODY TEXT CONTRAST ──
  const textOnBg = getContrastRatio(fg, bg);
  if (textOnBg < 4.5)
    push('TEXT_CONTRAST', 'Color', 'error', `Body text contrast ${textOnBg.toFixed(1)}:1 — fails WCAG AA (needs 4.5:1)`, 'Darken text or lighten background', 'fix_text_contrast');
  else
    push('TEXT_CONTRAST', 'Color', 'pass', `Body text ${textOnBg.toFixed(1)}:1 — passes ${textOnBg >= 7 ? 'AAA ✦' : 'AA'}`, '', null);

  // ── 2. PRIMARY ON BACKGROUND ──
  const primOnBg = getContrastRatio(prim, bg);
  if (primOnBg < 3)
    push('PRIMARY_ON_BG', 'Color', 'error', `Primary on background ${primOnBg.toFixed(1)}:1 — fails all levels`, 'Adjust hue/saturation or use a darker shade', 'fix_primary_contrast');
  else if (primOnBg < 4.5)
    push('PRIMARY_ON_BG', 'Color', 'warning', `Primary on background ${primOnBg.toFixed(1)}:1 — AA large text only (18px+)`, 'Use primary-600 for small text', null);
  else
    push('PRIMARY_ON_BG', 'Color', 'pass', `Primary on background ${primOnBg.toFixed(1)}:1 — passes AA`, '', null);

  // ── 3. COMPONENT_BUTTON_CONTRAST — white/black text on primary bg ──
  const btnBg   = sem['color.button.primaryBg']   ?? prim;
  const btnTxt  = sem['color.button.primaryText']  ?? '#ffffff';
  const whiteOnPrim = getContrastRatio(btnTxt, btnBg);
  if (whiteOnPrim < 4.5)
    push('BUTTON_CONTRAST', 'Component', 'warning', `Button text on primary background: ${whiteOnPrim.toFixed(1)}:1 — fails AA`, 'Use darker primary shade (600–700) for button backgrounds', 'fix_button_contrast');
  else
    push('BUTTON_CONTRAST', 'Component', 'pass', `Button text on primary: ${whiteOnPrim.toFixed(1)}:1 — passes AA`, '', null);

  // Danger button contrast
  const dangerBg  = sem['color.action.danger']       ?? '#ef4444';
  const dangerTxt = sem['color.button.dangerText']   ?? '#ffffff';
  const dangerC   = getContrastRatio(dangerTxt, dangerBg);
  if (dangerC < 4.5)
    push('DANGER_BUTTON_CONTRAST', 'Component', 'warning', `Danger button text contrast ${dangerC.toFixed(1)}:1 — fails AA`, 'Darken danger background or use black text', null);
  else
    push('DANGER_BUTTON_CONTRAST', 'Component', 'pass', `Danger button contrast ${dangerC.toFixed(1)}:1 — passes AA`, '', null);

  // ── 4. SEMANTIC_TEXT_CONTRAST — secondary and muted text ──
  const textSec  = sem['color.text.secondary'] ?? fg;
  const textMut  = sem['color.text.muted']     ?? fg;
  const secContrast = getContrastRatio(textSec, bg);
  const mutContrast = getContrastRatio(textMut, bg);
  if (secContrast < 4.5)
    push('SECONDARY_TEXT_CONTRAST', 'Semantic', 'warning', `Secondary text contrast ${secContrast.toFixed(1)}:1 — below AA`, 'Darken secondary text token', null);
  else
    push('SECONDARY_TEXT_CONTRAST', 'Semantic', 'pass', `Secondary text ${secContrast.toFixed(1)}:1 — passes AA`, '', null);
  if (mutContrast < 3)
    push('MUTED_TEXT_CONTRAST', 'Semantic', 'warning', `Muted/placeholder text ${mutContrast.toFixed(1)}:1 — below 3:1 minimum for non-text`, 'Muted text should achieve at least 3:1 (WCAG 1.4.3)', 'fix_placeholder');
  else
    push('MUTED_TEXT_CONTRAST', 'Semantic', 'pass', `Muted text ${mutContrast.toFixed(1)}:1 — meets 3:1 minimum`, '', null);

  // ── 5. COMPONENT_INPUT_PLACEHOLDER — 3:1 required ──
  const inputBg   = sem['color.input.bg']          ?? surf;
  const phColor   = sem['color.input.placeholder'] ?? textMut;
  const phC       = getContrastRatio(phColor, inputBg);
  if (phC < 3)
    push('INPUT_PLACEHOLDER', 'Component', 'warning', `Input placeholder contrast ${phC.toFixed(1)}:1 — fails 3:1 minimum (WCAG 1.4.3)`, 'Darken placeholder text color', 'fix_placeholder');
  else
    push('INPUT_PLACEHOLDER', 'Component', 'pass', `Input placeholder contrast ${phC.toFixed(1)}:1 — passes 3:1`, '', null);

  // ── 6. COMPONENT_BADGE_CONTRAST ──
  const badgePairs = [
    ['info',    sem['color.badge.infoText'],    sem['color.badge.infoBg']],
    ['success', sem['color.badge.successText'], sem['color.badge.successBg']],
    ['warning', sem['color.badge.warningText'], sem['color.badge.warningBg']],
    ['danger',  sem['color.badge.dangerText'],  sem['color.badge.dangerBg']],
  ];
  for (const [name, txt, bgc] of badgePairs) {
    if (!txt || !bgc) continue;
    const r = getContrastRatio(txt, bgc);
    if (r < 4.5)
      push(`BADGE_${name.toUpperCase()}_CONTRAST`, 'Component', 'warning', `${name} badge text ${r.toFixed(1)}:1 — fails AA`, `Darken ${name} badge text or lighten background`, null);
    else
      push(`BADGE_${name.toUpperCase()}_CONTRAST`, 'Component', 'pass', `${name} badge contrast ${r.toFixed(1)}:1 — passes AA`, '', null);
  }

  // ── 7. FOCUS_RING_CONTRAST ──
  const focusColor = sem['color.border.focus'] ?? prim;
  const focusC     = getContrastRatio(focusColor, bg);
  if (focusC < 3)
    push('FOCUS_RING_CONTRAST', 'Interaction', 'error', `Focus ring contrast ${focusC.toFixed(1)}:1 — fails 3:1 minimum (WCAG 2.4.11)`, 'Use a higher-contrast focus ring color', 'fix_focus_ring');
  else
    push('FOCUS_RING_CONTRAST', 'Interaction', 'pass', `Focus ring contrast ${focusC.toFixed(1)}:1 — passes 3:1`, '', null);

  // ── 8. TYPE_SCALE_RATIO — smallest step ──
  if (typeScale.xs < 11)
    push('TYPE_SCALE_MIN', 'Typography', 'error', `Smallest type step ${Math.round(typeScale.xs)}px — below 11px minimum`, 'Increase base size or reduce scale ratio', 'fix_type_scale');
  else if (typeScale.xs < 12)
    push('TYPE_SCALE_MIN', 'Typography', 'warning', `Smallest type step ${Math.round(typeScale.xs)}px — borderline, consider 12px+`, 'Slight increase recommended', null);
  else
    push('TYPE_SCALE_MIN', 'Typography', 'pass', `Smallest type ${Math.round(typeScale.xs)}px — meets minimum`, '', null);

  // ── 9. TYPOGRAPHY BASE SIZE ──
  if (tokens.typography.baseSize < 16)
    push('TYPE_BASE_SIZE', 'Typography', 'warning', `Base size ${tokens.typography.baseSize}px — below recommended 16px`, 'Increase base font size to at least 16px', 'fix_base_size');
  else
    push('TYPE_BASE_SIZE', 'Typography', 'pass', `Base size ${tokens.typography.baseSize}px — meets readability baseline`, '', null);

  // ── 10. SPACING_DENSITY ──
  if (tokens.spacing.base <= 4 && typeScale.xs < 14)
    push('SPACING_DENSITY', 'Spacing', 'warning', `4px base spacing + ${Math.round(typeScale.xs)}px min type — may be too dense`, 'Use 8px spacing base or increase font size', 'fix_spacing');
  else
    push('SPACING_DENSITY', 'Spacing', 'pass', 'Spacing density comfortable', '', null);

  // ── 11. TOUCH_TARGET_SIZE ──
  const plat = PLATFORMS[tokens.platform ?? 'web'];
  if (plat?.minTouchTarget) {
    const btnH = Math.round(tokens.typography.baseSize + tokens.spacing.base * 2 + 3);
    if (btnH < plat.minTouchTarget)
      push('TOUCH_TARGET', 'Spacing', 'warning', `Button ~${btnH}px < ${plat.minTouchTarget}px ${plat.label} touch target`, 'Increase spacing base or base font size', 'fix_touch_target');
    else
      push('TOUCH_TARGET', 'Spacing', 'pass', `Button ~${btnH}px meets ${plat.minTouchTarget}px ${plat.label} target`, '', null);
  }

  // ── 12. MOTION_REDUCED_SUPPORT ──
  const slowDur = parseInt(mot['motion.duration.slow'] ?? '350');
  if (slowDur > 200)
    push('MOTION_REDUCED', 'Motion', 'warning', `Slow motion duration ${slowDur}ms — include prefers-reduced-motion overrides in your CSS export`, 'CSS export includes reduced-motion media query ✓', null);
  else
    push('MOTION_REDUCED', 'Motion', 'pass', `Motion durations ≤ ${slowDur}ms — reduced-motion friendly`, '', null);

  // ── 13. LINE LENGTH ──
  const charsPerLine = Math.round(680 / (tokens.typography.baseSize * 0.55));
  if (charsPerLine > 90)
    push('LINE_LENGTH', 'Typography', 'warning', `~${charsPerLine} chars/line — above 75 recommended`, 'Constrain max-width or increase font size', null);
  else if (charsPerLine < 40)
    push('LINE_LENGTH', 'Typography', 'warning', `~${charsPerLine} chars/line — below 45 recommended`, 'Allow wider content or reduce font size', null);
  else
    push('LINE_LENGTH', 'Typography', 'pass', `~${charsPerLine} chars/line — within 45–75 ideal range`, '', null);

  // ── 14. FOCUS RING SHAPE ──
  if (tokens.shape === 'pill')
    push('FOCUS_SHAPE', 'Interaction', 'warning', 'Pill radius can make focus rings hard to trace', 'Ensure focus ring has 3px+ offset and 2px+ width', null);
  else
    push('FOCUS_SHAPE', 'Interaction', 'pass', 'Border radius compatible with visible focus rings', '', null);

  // ── 15. DENSITY + COMPACT TOUCH TARGET ──
  if (tokens.density === 'compact') {
    const DENSITY_SCALE = 0.75;
    const btnH = Math.round((tokens.typography.baseSize + tokens.spacing.base * 2 + 3) * DENSITY_SCALE);
    if (btnH < 44)
      push('DENSITY_TOUCH_TARGET', 'Spacing', 'warning', `Compact density reduces buttons to ~${btnH}px — below 44px touch target`, 'Use Regular or Comfortable density for touch interfaces', 'fix_touch_target');
    else
      push('DENSITY_TOUCH_TARGET', 'Spacing', 'pass', `Compact density: buttons ~${btnH}px — meets 44px target`, '', null);
  }

  return issues;
}

/* ══════════════════════════════════════════════════════════
   RANDOM REGENERATION
══════════════════════════════════════════════════════════ */

const pick  = arr => arr[Math.floor(Math.random() * arr.length)];
const rInt  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

/* ══════════════════════════════════════════════════════════
   TASK 9.2 — AUDIT AUTO-FIX
   Pure token patches keyed by autoFixKey
══════════════════════════════════════════════════════════ */

/**
 * Given an autoFixKey from an audit issue, return an array of strategy objects.
 * Each strategy: { label, description, apply: (tokens) => patchObject, locked? }
 * Caller shows options UI and applies chosen strategy.
 */
export function getAutoFix(autoFixKey, tokens) {
  const t = tokens;
  const swatches = t.colors?.swatches ?? [];
  const hasLockedPrimary = swatches[0]?.locked;

  switch (autoFixKey) {
    case 'fix_text_contrast':
    case 'fix_primary_contrast': {
      if (hasLockedPrimary) {
        return [{ label: 'Brand color locked', description: 'Primary swatch is locked — unlock it to allow auto-fix.', apply: null, locked: true }];
      }
      if (!swatches.length) return null;
      const { h, s: sat, l } = hexToHsl(swatches[0].hex);
      const darkenedL = Math.max(l - 15, 8);
      const boostSat  = Math.min(sat + 20, 95);
      return [
        {
          label: 'Darken primary',
          description: `Lightness ${l}% → ${darkenedL}% (increases contrast)`,
          apply: (tok) => {
            const ns = tok.colors.swatches.map((s, i) => {
              if (i !== 0) return s;
              const { h: hh, s: ss } = hexToHsl(s.hex);
              return { ...s, hex: hslToHex(hh, ss, darkenedL) };
            });
            return { colors: { ...tok.colors, swatches: ns } };
          },
        },
        {
          label: 'Boost saturation',
          description: `Saturation ${sat}% → ${boostSat}% (richer color)`,
          apply: (tok) => {
            const ns = tok.colors.swatches.map((s, i) => {
              if (i !== 0) return s;
              const { h: hh, l: ll } = hexToHsl(s.hex);
              return { ...s, hex: hslToHex(hh, boostSat, ll) };
            });
            return { colors: { ...tok.colors, swatches: ns } };
          },
        },
      ];
    }

    case 'fix_button_contrast': {
      if (hasLockedPrimary) {
        return [{ label: 'Brand color locked', description: 'Primary swatch is locked — unlock to allow auto-fix.', apply: null, locked: true }];
      }
      if (!swatches.length) return null;
      const { l } = hexToHsl(swatches[0].hex);
      const darkerL = Math.max(l - 12, 8);
      return [{
        label: 'Darken button background',
        description: `Primary lightness ${l}% → ${darkerL}% (improves text on button)`,
        apply: (tok) => {
          const ns = tok.colors.swatches.map((s, i) => {
            if (i !== 0) return s;
            const { h, s: sat } = hexToHsl(s.hex);
            return { ...s, hex: hslToHex(h, sat, darkerL) };
          });
          return { colors: { ...tok.colors, swatches: ns } };
        },
      }];
    }

    case 'fix_placeholder': {
      if (hasLockedPrimary) {
        return [{ label: 'Brand color locked', description: 'Primary is locked — cannot auto-adjust muted text.', apply: null, locked: true }];
      }
      return [{
        label: 'Darken muted text',
        description: 'Boost primary saturation so muted text reaches 3:1',
        apply: (tok) => {
          if (!tok.colors?.swatches?.length) {
            return { colors: { ...tok.colors, saturation: Math.min(95, (tok.colors.saturation ?? 70) + 12) } };
          }
          const ns = tok.colors.swatches.map((s, i) => {
            if (i !== 0) return s;
            const { h, s: sat, l } = hexToHsl(s.hex);
            return { ...s, hex: hslToHex(h, Math.min(95, sat + 12), l) };
          });
          return { colors: { ...tok.colors, swatches: ns } };
        },
      }];
    }

    case 'fix_focus_ring': {
      if (hasLockedPrimary) {
        return [{ label: 'Brand color locked', description: 'Focus ring inherits locked brand color.', apply: null, locked: true }];
      }
      if (!swatches.length) return null;
      const { l } = hexToHsl(swatches[0].hex);
      const targetL = Math.max(30, Math.min(l, 45));
      return [{
        label: 'Adjust focus ring color',
        description: `Set lightness to ${targetL}% for 3:1+ contrast`,
        apply: (tok) => {
          const ns = tok.colors.swatches.map((s, i) => {
            if (i !== 0) return s;
            const { h, s: sat } = hexToHsl(s.hex);
            return { ...s, hex: hslToHex(h, sat, targetL) };
          });
          return { colors: { ...tok.colors, swatches: ns } };
        },
      }];
    }

    case 'fix_type_scale':
      return [{
        label: 'Increase base size',
        description: `${t.typography.baseSize}px → ${Math.max(16, t.typography.baseSize + 2)}px`,
        apply: (tok) => ({ typography: { ...tok.typography, baseSize: Math.max(16, tok.typography.baseSize + 2) } }),
      }];

    case 'fix_base_size':
      return [{
        label: 'Set to 16px',
        description: '16px is the recommended minimum for body text',
        apply: (tok) => ({ typography: { ...tok.typography, baseSize: 16 } }),
      }];

    case 'fix_spacing':
      return [{
        label: '8px base unit',
        description: 'Ensures comfortable component density',
        apply: (tok) => ({ spacing: { ...tok.spacing, base: 8 } }),
      }];

    case 'fix_touch_target':
      return [
        {
          label: 'Increase spacing',
          description: 'Set spacing base to 8px for larger touch targets',
          apply: (tok) => ({ spacing: { ...tok.spacing, base: 8 } }),
        },
        {
          label: 'Increase font size',
          description: `${t.typography.baseSize}px → ${Math.max(16, t.typography.baseSize + 2)}px`,
          apply: (tok) => ({ typography: { ...tok.typography, baseSize: Math.max(16, tok.typography.baseSize + 2) } }),
        },
      ];

    default:
      return null;
  }
}

const ALL_HARMONY  = ['mono','analogous','complementary','triadic','split'];
const ALL_SHAPES   = ['sharp','soft','rounded','veryRounded','pill'];
const ALL_SHADOWS  = ['flat','soft','hard','layered'];
const ALL_SCALES   = [1.2,1.25,1.333,1.414,1.618];

export function regenerateTokens(tokens, locks) {
  const next = { ...tokens };

  if (!locks.colors) {
    // Random base hue each press so primary color covers the full 360° spectrum
    const baseOffset = Math.floor(Math.random() * 360);
    const swatches = (tokens.colors?.swatches ?? []).map((s, i) =>
      s.locked ? s : { hex: generateHarmoniousSwatch(i, baseOffset), locked: false }
    );
    next.colors = {
      swatches: swatches.length ? swatches :
        Array.from({ length: 4 }, (_, i) => ({ hex: generateHarmoniousSwatch(i, baseOffset), locked: false }))
    };
  }

  if (!locks.typography) {
    const displayPool = [...FONT_CATEGORIES.serif.fonts, ...FONT_CATEGORIES.display.fonts];
    next.typography = { display:pick(displayPool), body:pick(BODY_FONTS), mono:pick(MONO_FONTS), scale:pick(ALL_SCALES), baseSize:pick([14,15,16,17,18]) };
  }

  if (!locks.spacing)  next.spacing  = { base:pick([4,8]), scale:pick(['linear','fibonacci']) };
  if (!locks.shape)    next.shape    = pick(ALL_SHAPES);
  if (!locks.shadows)  next.shadows  = pick(ALL_SHADOWS);

  return next;
}

export function applyPreset(presetKey, current, locks) {
  const preset = PRESETS[presetKey];
  if (!preset) return current;
  const next = { ...current, preset: presetKey };
  if (!locks.colors)     next.colors     = { swatches: preset.colors.swatches ?? Array.from({length:4},(_,i) => ({ hex: generateHarmoniousSwatch(i), locked: false })) };
  if (!locks.typography) next.typography = { ...preset.typography };
  if (!locks.spacing)    next.spacing    = { ...preset.spacing };
  if (!locks.shape)      next.shape      = preset.shape;
  if (!locks.shadows)    next.shadows    = preset.shadows;
  return next;
}

/* ══════════════════════════════════════════════════════════
   EXPORT GENERATORS
══════════════════════════════════════════════════════════ */

const ROLE_NAMES  = ['primary','secondary','tertiary','accent','neutral','warning'];
const SHADE_KEYS  = [50,100,200,300,400,500,600,700,800,900];

/* ── Task 6.1: Expanded CSS export with 3 tiers + dark mode ── */
export function exportCSS(tokens) {
  const { palette, typeScale, spacingSteps, shadowDefs } = computeTokens(tokens);
  const semantic   = computeSemanticTokens(tokens, 'light');
  const semDark    = computeSemanticTokens(tokens, 'dark');
  const component  = computeComponentTokens(semantic, tokens);
  const plat       = PLATFORMS[tokens.platform ?? 'web'];
  const name       = tokens.systemName ?? 'Design System';
  const sep = (t) => `\n  /* ── ${t} ── */\n`;

  let out = `/* ${'='.repeat(60)}\n   ${name}\n   Preset: ${PRESETS[tokens.preset]?.label ?? 'Custom'} | Platform: ${plat.label}\n   Generated by Design System Builder\n${'='.repeat(60)} */\n`;

  // 1. PRIMITIVE
  out += `\n/* --- PRIMITIVE TOKENS --- */\n:root {`;
  palette.forEach((shades,i) => {
    const n = ROLE_NAMES[i] ?? `color-${i}`;
    out += sep(n);
    SHADE_KEYS.forEach(k => { out += `  --color-${n}-${k}: ${shades[k]};\n`; });
  });
  out += sep('Typography');
  out += `  --font-display: '${tokens.typography.display}', serif;\n`;
  out += `  --font-body: '${tokens.typography.body}', sans-serif;\n`;
  out += `  --font-mono: '${tokens.typography.mono}', monospace;\n`;
  Object.entries(typeScale).forEach(([k,v]) => { out += `  --text-${k}: ${v}px;\n`; });
  out += sep('Spacing');
  spacingSteps.forEach((v,i) => { out += `  --space-${i+1}: ${v}px;\n`; });
  out += sep('Shape');
  out += `  --radius: ${SHAPE_RADIUS[tokens.shape]};\n`;
  out += `  --radius-sm: ${tokens.shape==='sharp'?'0px':`calc(${SHAPE_RADIUS[tokens.shape]} * 0.5)`};\n`;
  out += `  --radius-lg: ${tokens.shape==='pill'?'9999px':`calc(${SHAPE_RADIUS[tokens.shape]} * 2)`};\n`;
  out += sep('Shadows');
  out += `  --shadow-sm: ${shadowDefs.sm};\n  --shadow-md: ${shadowDefs.md};\n  --shadow-lg: ${shadowDefs.lg};\n`;
  out += '}\n';

  // 2. SEMANTIC
  out += `\n/* --- SEMANTIC TOKENS --- */\n:root {\n`;
  Object.entries(semantic).forEach(([k,v]) => { out += `  --${k.replace(/\./g,'-')}: ${v};\n`; });
  out += '}\n';

  // 3. COMPONENT
  out += `\n/* --- COMPONENT TOKENS --- */\n:root {\n`;
  Object.entries(component).forEach(([k,v]) => { out += `  --${k.replace(/\./g,'-')}: ${v};\n`; });
  out += '}\n';

  // 4. DARK MODE
  out += `\n/* --- DARK MODE --- */\n@media (prefers-color-scheme: dark) {\n  :root {\n`;
  // Only output keys that differ from light
  Object.entries(semDark).forEach(([k,v]) => {
    if (v !== semantic[k]) out += `    --${k.replace(/\./g,'-')}: ${v};\n`;
  });
  out += `  }\n}\n`;

  // 5. Reduced motion
  out += `\n/* --- REDUCED MOTION --- */\n@media (prefers-reduced-motion: reduce) {\n  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }\n}\n`;

  return out;
}

/* ── Task 6.1: Expanded Tailwind export ── */
export function exportTailwind(tokens) {
  const { palette, typeScale, spacingSteps } = computeTokens(tokens);
  const semantic  = computeSemanticTokens(tokens, 'light');
  const colors    = {};
  const spacing   = {};

  palette.forEach((shades,i) => {
    const n = ROLE_NAMES[i] ?? `color-${i}`;
    colors[n] = Object.fromEntries(SHADE_KEYS.map(k => [k, shades[k]]));
  });
  spacingSteps.forEach((v,i) => { spacing[i+1] = `${v}px`; });

  // Semantic color aliases in Tailwind
  colors['background'] = { DEFAULT: semantic['color.background.base'], surface: semantic['color.background.surface'], subtle: semantic['color.background.subtle'] };
  colors['foreground'] = { DEFAULT: semantic['color.text.primary'], muted: semantic['color.text.muted'] };
  colors['brand']      = { DEFAULT: semantic['color.action.primary'], hover: semantic['color.action.primaryHover'], subtle: semantic['color.action.primarySubtle'] };
  colors['danger']     = { DEFAULT: semantic['color.action.danger'] };
  colors['success']    = { DEFAULT: semantic['color.action.success'] };
  colors['warning']    = { DEFAULT: semantic['color.action.warning'] };

  const cfg = { theme:{ extend:{
    colors,
    fontFamily:{ display:[`'${tokens.typography.display}'`,'serif'], body:[`'${tokens.typography.body}'`,'sans-serif'], mono:[`'${tokens.typography.mono}'`,'monospace'] },
    fontSize: Object.fromEntries(Object.entries(typeScale).map(([k,v])=>[k,[`${v}px`,{ lineHeight: v > 24 ? '1.2' : '1.6' }]])),
    spacing,
    borderRadius:{ DEFAULT:SHAPE_RADIUS[tokens.shape], sm:tokens.shape==='sharp'?'0px':`calc(${SHAPE_RADIUS[tokens.shape]} * 0.5)`, lg:tokens.shape==='pill'?'9999px':`calc(${SHAPE_RADIUS[tokens.shape]} * 2)`, full:'9999px' },
    boxShadow:{ sm: semantic['color.card.shadow'] ?? 'none', DEFAULT: 'var(--shadow-md)', lg:'var(--shadow-lg)' },
  }}};
  return `/** @type {import('tailwindcss').Config} */\n// Generated by Design System Builder — ${tokens.systemName ?? 'Design System'}\nmodule.exports = ${JSON.stringify(cfg,null,2)};\n`;
}

/* ── Task 6.1: W3C DTCG format JSON export ── */
export function exportDesignTokensJSON(tokens) {
  const { palette, typeScale, spacingSteps, shadowDefs } = computeTokens(tokens);
  const semantic  = computeSemanticTokens(tokens, 'light');
  const component = computeComponentTokens(semantic, tokens);

  const out = {
    $schema: 'https://tr.designtokens.org/format/',
    $metadata: { name: tokens.systemName ?? 'Design System', preset: tokens.preset, platform: tokens.platform, generator: 'Design System Builder' },
    color:      {},
    semantic:   {},
    component:  {},
    typography: {},
    spacing:    {},
    shape:      {},
    shadow:     {},
  };

  // Primitive palette
  palette.forEach((shades,i) => {
    const n = ROLE_NAMES[i] ?? `color-${i}`;
    out.color[n] = Object.fromEntries(SHADE_KEYS.map(k => [k,{ $value:shades[k], $type:'color', $description:`${n} shade ${k}` }]));
  });

  // Semantic tokens (nested by dot-path)
  Object.entries(semantic).forEach(([k,v]) => {
    const parts = k.split('.');
    let node = out.semantic;
    parts.slice(0,-1).forEach(p => { node[p] = node[p] ?? {}; node = node[p]; });
    node[parts[parts.length-1]] = { $value:v, $type: v.startsWith('#') || v.startsWith('rgb') ? 'color' : 'other' };
  });

  // Component tokens
  Object.entries(component).forEach(([k,v]) => {
    const parts = k.split('.');
    let node = out.component;
    parts.slice(0,-1).forEach(p => { node[p] = node[p] ?? {}; node = node[p]; });
    const isColor = typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb'));
    const isDimension = typeof v === 'string' && v.endsWith('px');
    node[parts[parts.length-1]] = { $value:v, $type: isColor ? 'color' : isDimension ? 'dimension' : 'other' };
  });

  // Typography
  out.typography = {
    fontDisplay:{ $value:tokens.typography.display, $type:'fontFamily' },
    fontBody:   { $value:tokens.typography.body,    $type:'fontFamily' },
    fontMono:   { $value:tokens.typography.mono,    $type:'fontFamily' },
    scale:      { $value:tokens.typography.scale,   $type:'number'     },
    baseSize:   { $value:`${tokens.typography.baseSize}px`, $type:'dimension' },
    ...Object.fromEntries(Object.entries(typeScale).map(([k,v]) => [`size-${k}`,{ $value:`${v}px`, $type:'dimension' }])),
  };

  spacingSteps.forEach((v,i) => { out.spacing[`space-${i+1}`] = { $value:`${v}px`, $type:'dimension' }; });
  out.shape = { radius:{ $value:SHAPE_RADIUS[tokens.shape], $type:'dimension' } };
  out.shadow = { sm:{ $value:shadowDefs.sm,$type:'shadow' }, md:{ $value:shadowDefs.md,$type:'shadow' }, lg:{ $value:shadowDefs.lg,$type:'shadow' } };

  return JSON.stringify(out,null,2);
}

/* ── Task 6.2: React Component Starter export ── */
export function exportReactComponents(tokens) {
  const { palette, typeScale, spacingSteps } = computeTokens(tokens);
  const semantic  = computeSemanticTokens(tokens, 'light');
  const component = computeComponentTokens(semantic, tokens);
  const p = palette[0] ?? {};
  const name = tokens.systemName ?? 'DS';

  const tokensJS = `// tokens.js — ${name}
// Auto-generated by Design System Builder

export const colors = ${JSON.stringify(
  Object.fromEntries(palette.map((shades,i) => [ROLE_NAMES[i]??`color${i}`, Object.fromEntries(SHADE_KEYS.map(k=>[k,shades[k]]))])),
  null, 2)};

export const semantic = ${JSON.stringify(
  Object.fromEntries(Object.entries(semantic).map(([k,v]) => [k.replace(/\./g,'_'),v])),
  null, 2)};

export const typography = {
  display: '${tokens.typography.display}',
  body: '${tokens.typography.body}',
  mono: '${tokens.typography.mono}',
  scale: ${tokens.typography.scale},
  baseSize: ${tokens.typography.baseSize},
};

export const spacing = [${spacingSteps.slice(0,12).map(v=>`${v}px`).join(', ')}];
export const radius  = '${SHAPE_RADIUS[tokens.shape]}';
`;

  const buttonJSX = `// Button.jsx — ${name}
// Supports: primary | secondary | ghost | danger · sm | md | lg · disabled | loading

import { useState } from 'react';

const styles = {
  primary:   { background: '${semantic['color.action.primary']}',      color: '#fff',                border: '1.5px solid ${semantic['color.action.primary']}' },
  secondary: { background: '${semantic['color.action.primarySubtle']}', color: '${semantic['color.text.primary']}',  border: '1.5px solid ${semantic['color.border.default']}' },
  ghost:     { background: 'transparent',                               color: '${semantic['color.text.primary']}',  border: '1.5px solid ${semantic['color.border.default']}' },
  danger:    { background: 'transparent',                               color: '${semantic['color.action.danger']}', border: '1.5px solid ${semantic['color.action.danger']}' },
};
const sizes  = {
  sm: { padding: '${component['button.paddingX.sm']} ${component['button.paddingX.sm']}', fontSize: '${component['button.fontSize.sm']}', height: '${component['button.height.sm']}' },
  md: { padding: '0 ${component['button.paddingX.md']}',              fontSize: '${component['button.fontSize.md']}', height: '${component['button.height.md']}' },
  lg: { padding: '0 ${component['button.paddingX.lg']}',              fontSize: '${component['button.fontSize.lg']}', height: '${component['button.height.lg']}' },
};

export function Button({ variant = 'primary', size = 'md', disabled, loading, onClick, children, style, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: '${component['button.radius']}',
        fontWeight: '${component['button.fontWeight']}',
        fontFamily: '${tokens.typography.body}, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: '${component['button.transition']}',
        boxShadow: '${component['button.shadow']}',
        ...style,
      }}
      {...props}
    >
      {loading && <span style={{ width:12, height:12, border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.6s linear infinite' }}/>}
      {children}
    </button>
  );
}
`;

  const inputJSX = `// Input.jsx — ${name}

export function Input({ label, error, success, disabled, ...props }) {
  const borderColor = error ? '${semantic['color.action.danger']}' : success ? '${semantic['color.action.success']}' : '${semantic['color.border.default']}';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:'${component['form.labelSize']}', fontWeight:'${component['form.labelWeight']}', color:'${semantic['color.text.primary']}', fontFamily:'${tokens.typography.body}' }}>{label}</label>}
      <input disabled={disabled} {...props}
        style={{
          height: '${component['input.height']}', padding: '0 ${component['input.paddingX']}',
          borderRadius: '${component['input.radius']}',
          border: \`${component['input.borderWidth']} solid \${borderColor}\`,
          fontFamily: '${tokens.typography.body}, sans-serif',
          fontSize: '${component['input.fontSize']}',
          background: '${semantic['color.background.base']}',
          color: '${semantic['color.text.primary']}',
          opacity: disabled ? 0.4 : 1,
          outline: 'none',
          transition: '${component['input.transition']}',
          width: '100%', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '${semantic['color.border.focus']}'}
        onBlur={e => e.target.style.borderColor = borderColor}
      />
      {error && <span style={{ fontSize:'${component['form.helperSize']}', color:'${semantic['color.action.danger']}' }}>{error}</span>}
    </div>
  );
}
`;

  const cardJSX = `// Card.jsx — ${name}

export function Card({ children, style }) {
  return (
    <div style={{
      background: '${semantic['color.card.bg']}',
      border: '${component['card.borderWidth']} solid ${semantic['color.card.border']}',
      borderRadius: '${component['card.radius']}',
      padding: '${component['card.padding']}',
      boxShadow: '${component['card.shadow']}',
      ...style,
    }}>
      {children}
    </div>
  );
}
`;

  const selectJSX = `// Select.jsx — ${name}
import { useState } from 'react';

export function Select({ label, options = [], value, onChange, error, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => (o.value ?? o) === value);
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:'${component['form.labelSize']}', fontWeight:'${component['form.labelWeight']}', color:'${semantic['color.text.primary']}', fontFamily:'${tokens.typography.body}' }}>{label}</label>}
      <button onClick={() => !disabled && setOpen(o => !o)}
        style={{ height:'${component['input.height']}', padding:'0 ${component['input.paddingX']}', borderRadius:'${component['input.radius']}',
          border:\`${component['input.borderWidth']} solid \${error ? '${semantic['color.action.danger']}' : '${semantic['color.border.default']}'}\`,
          background:'${semantic['color.background.base']}', color: value ? '${semantic['color.text.primary']}' : '${semantic['color.text.muted']}',
          fontFamily:'${tokens.typography.body}', fontSize:'${component['input.fontSize']}',
          opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', boxSizing:'border-box' }}>
        <span>{selected ? (selected.label ?? selected) : 'Select…'}</span>
        <span style={{ fontSize:10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:50,
          background:'${semantic['color.card.bg']}', border:'1px solid ${semantic['color.border.default']}',
          borderRadius:'${component['card.radius']}', boxShadow:'${component['card.shadow']}', overflow:'hidden' }}>
          {options.map(o => {
            const v = o.value ?? o, l = o.label ?? o;
            return (
              <button key={v} onClick={() => { onChange?.(v); setOpen(false); }}
                style={{ width:'100%', padding:'8px ${component['input.paddingX']}', border:'none', textAlign:'left', cursor:'pointer',
                  background: v === value ? '${semantic['color.action.primarySubtle']}' : 'transparent',
                  color: v === value ? '${semantic['color.action.primary']}' : '${semantic['color.text.primary']}',
                  fontFamily:'${tokens.typography.body}', fontSize:'${component['input.fontSize']}' }}>
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
`;

  const checkboxJSX = `// Checkbox.jsx — ${name}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
      <div onClick={() => !disabled && onChange?.(!checked)}
        style={{ width:18, height:18, borderRadius:4,
          border:\`2px solid \${checked ? '${semantic['color.action.primary']}' : '${semantic['color.border.default']}'}\`,
          background: checked ? '${semantic['color.action.primary']}' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .12s' }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontFamily:'${tokens.typography.body}', fontSize:'${component['form.labelSize']}', color:'${semantic['color.text.primary']}' }}>{label}</span>
    </label>
  );
}
`;

  const toggleJSX = `// Toggle.jsx — ${name}

export function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
      <div onClick={() => !disabled && onChange?.(!checked)}
        style={{ width:40, height:22, borderRadius:11, padding:2,
          background: checked ? '${semantic['color.action.primary']}' : '${semantic['color.border.default']}',
          display:'flex', alignItems:'center', transition:'background .18s',
          justifyContent: checked ? 'flex-end' : 'flex-start' }}>
        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
      </div>
      {label && <span style={{ fontFamily:'${tokens.typography.body}', fontSize:'${component['form.labelSize']}', color:'${semantic['color.text.primary']}' }}>{label}</span>}
    </label>
  );
}
`;

  const badgeJSX = `// Badge.jsx — ${name}

const BADGE_STYLES = {
  primary: { bg:'${semantic['color.badge.infoBg'] ?? semantic['color.action.primarySubtle']}', text:'${semantic['color.badge.infoText'] ?? semantic['color.action.primary']}' },
  success: { bg:'${semantic['color.badge.successBg'] ?? '#dcfce7'}', text:'${semantic['color.badge.successText'] ?? '#15803d'}' },
  warning: { bg:'${semantic['color.badge.warningBg'] ?? '#fef9c3'}', text:'${semantic['color.badge.warningText'] ?? '#a16207'}' },
  danger:  { bg:'${semantic['color.badge.dangerBg']  ?? '#fee2e2'}', text:'${semantic['color.badge.dangerText']  ?? '#b91c1c'}' },
};

export function Badge({ variant = 'primary', children, dot }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.primary;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      padding:'2px 8px', borderRadius:'9999px',
      background: s.bg, color: s.text,
      fontSize:11, fontWeight:600, fontFamily:'${tokens.typography.body}' }}>
      {dot && <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor' }}/>}
      {children}
    </span>
  );
}
`;

  const alertJSX = `// Alert.jsx — ${name}

const ALERT_STYLES = {
  info:    { bg:'${semantic['color.action.primarySubtle']}', border:'${semantic['color.action.primary']}', text:'${semantic['color.text.primary']}', icon:'ℹ' },
  success: { bg:'#dcfce7', border:'#4ade80', text:'#14532d', icon:'✓' },
  warning: { bg:'#fef9c3', border:'#facc15', text:'#713f12', icon:'⚠' },
  danger:  { bg:'#fee2e2', border:'${semantic['color.action.danger']}', text:'#7f1d1d', icon:'✕' },
};

export function Alert({ variant = 'info', title, children, onDismiss }) {
  const s = ALERT_STYLES[variant] ?? ALERT_STYLES.info;
  return (
    <div role="alert" style={{ display:'flex', gap:10, padding:'12px 14px', borderRadius:'${component['card.radius']}',
      background: s.bg, border:\`1px solid \${s.border}\`, color: s.text }}>
      <span style={{ fontSize:14, lineHeight:1, flexShrink:0, marginTop:1 }}>{s.icon}</span>
      <div style={{ flex:1 }}>
        {title && <div style={{ fontWeight:600, fontSize:13, fontFamily:'${tokens.typography.body}', marginBottom:2 }}>{title}</div>}
        <div style={{ fontSize:12, fontFamily:'${tokens.typography.body}', lineHeight:1.5, opacity:0.85 }}>{children}</div>
      </div>
      {onDismiss && <button onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'currentColor', opacity:0.5, padding:0, flexShrink:0 }}>✕</button>}
    </div>
  );
}
`;

  const modalJSX = `// Modal.jsx — ${name}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      onClick={e => e.target === e.currentTarget && onClose?.()}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.5)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:480, background:'${semantic['color.card.bg']}',
        border:'1px solid ${semantic['color.card.border']}', borderRadius:${parseInt(SHAPE_RADIUS[tokens.shape]) * 2 || 12}px,
        boxShadow:'${component['card.shadow']}', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px', borderBottom:'1px solid ${semantic['color.border.default']}' }}>
          <h2 style={{ margin:0, fontSize:15, fontWeight:600, fontFamily:'${tokens.typography.display}',
            color:'${semantic['color.text.primary']}' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            fontSize:18, color:'${semantic['color.text.muted']}', padding:4 }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding:'20px', fontFamily:'${tokens.typography.body}',
          fontSize:'${component['input.fontSize']}', color:'${semantic['color.text.primary']}', lineHeight:1.6 }}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end',
            padding:'12px 20px', borderTop:'1px solid ${semantic['color.border.default']}' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
`;

  const allFiles = REACT_FILE_ORDER_FULL.reduce((acc, f) => {
    const map = { 'tokens.js': tokensJS, 'Button.jsx': buttonJSX, 'Input.jsx': inputJSX, 'Card.jsx': cardJSX, 'Select.jsx': selectJSX, 'Checkbox.jsx': checkboxJSX, 'Toggle.jsx': toggleJSX, 'Badge.jsx': badgeJSX, 'Alert.jsx': alertJSX, 'Modal.jsx': modalJSX, 'tokens.css': exportCSS(tokens) };
    acc[f] = map[f] ?? '';
    return acc;
  }, {});

  return allFiles;
}

export const REACT_FILE_ORDER_FULL = ['tokens.js', 'tokens.css', 'Button.jsx', 'Input.jsx', 'Card.jsx', 'Select.jsx', 'Checkbox.jsx', 'Toggle.jsx', 'Badge.jsx', 'Alert.jsx', 'Modal.jsx'];

export function encodeTokensToURL(tokens) {
  // Only encode source inputs — never computed layers
  const { colors, typography, spacing, shape, shadows, preset, platform, systemName } = tokens;
  try { return btoa(encodeURIComponent(JSON.stringify({ colors, typography, spacing, shape, shadows, preset, platform, systemName }))); } catch { return null; }
}
export function decodeTokensFromURL(str) {
  try { return JSON.parse(decodeURIComponent(atob(str))); } catch { return null; }
}

/* ══════════════════════════════════════════════════════════
   TASK 1.1 — SEMANTIC TOKEN LAYER
══════════════════════════════════════════════════════════ */

const FALLBACK_DANGER  = hslToHex(4,   86, 50);
const FALLBACK_SUCCESS = hslToHex(142, 71, 45);
const FALLBACK_WARNING = hslToHex(38,  92, 50);

export function computeSemanticTokens(tokens, mode = 'light') {
  const { palette } = computeTokens(tokens);
  const p  = palette[0] ?? {};  // primary
  const p2 = palette[1] ?? palette[0] ?? {};  // secondary

  const dark = mode === 'dark';
  const { baseHue, saturation } = getColorBase(tokens);
  const s = Math.min(saturation * 0.14, 11);

  // Surface
  const bgBase     = dark ? hslToHex(baseHue, s, 8)  : '#ffffff';
  const bgSurface  = dark ? hslToHex(baseHue, s, 13) : (p[50]  ?? '#f9fafb');
  const bgSubtle   = dark ? hslToHex(baseHue, s, 17) : (p[100] ?? '#f3f4f6');
  const bgInverse  = dark ? '#ffffff'                 : (p[900] ?? '#111111');

  // Text
  const textPrimary   = dark ? '#f2efe9'                      : (p[900] ?? '#111111');
  const textSecondary = dark ? 'rgba(242,239,233,0.70)'       : (p[700] ?? '#374151');
  const textMuted     = dark ? 'rgba(242,239,233,0.42)'       : (p[500] ?? '#6b7280');
  const textDisabled  = dark ? 'rgba(242,239,233,0.25)'       : (p[300] ?? '#d1d5db');
  const textInverse   = dark ? (p[900] ?? '#111111')          : '#ffffff';
  const textOnBrand   = '#ffffff';

  // Border
  const borderDefault = dark ? 'rgba(255,255,255,0.09)'  : (p[200] ?? '#e5e7eb');
  const borderSubtle  = dark ? 'rgba(255,255,255,0.05)'  : (p[100] ?? '#f3f4f6');
  const borderStrong  = dark ? 'rgba(255,255,255,0.18)'  : (p[400] ?? '#9ca3af');
  const borderFocus   = dark ? (p[400] ?? '#60a5fa')     : (p[500] ?? '#4f46e5');

  // Action
  const actPrimary        = dark ? (p[400] ?? '#60a5fa')  : (p[500] ?? '#4f46e5');
  const actPrimaryHover   = dark ? (p[300] ?? '#93c5fd')  : (p[600] ?? '#4338ca');
  const actPrimaryActive  = dark ? (p[200] ?? '#bfdbfe')  : (p[700] ?? '#3730a3');
  const actPrimarySubtle  = dark ? hslToHex(baseHue, Math.min(saturation*0.28,32), 19) : (p[50] ?? '#eef2ff');
  const actSecondary      = dark ? (p2[400] ?? '#a78bfa') : (p2[500] ?? '#7c3aed');
  const actSecondaryHover = dark ? (p2[300] ?? '#c4b5fd') : (p2[600] ?? '#6d28d9');

  // Semantic danger/success/warning — custom override (Gap #9) or auto-computed
  const customSem    = tokens.colors?.semantic ?? {};
  const danger       = palette[palette.length > 2 ? 2 : 0];
  const dangerColor  = customSem.error   ?? (danger?.[500] ?? FALLBACK_DANGER);
  const dangerHover  = danger?.[600] ?? hslToHex(4, 86, 40);
  const successColor = customSem.success ?? FALLBACK_SUCCESS;
  const warningColor = customSem.warning ?? FALLBACK_WARNING;
  const infoColor    = customSem.info    ?? (p[400] ?? '#0ea5e9');

  // Badges use [50]/[700] of their role
  const badgeInfo    = { bg: p[50]??'#eff6ff',   text: p[700]??'#1d4ed8'    };
  const badgeSuccess = { bg:'#dcfce7',            text:'#15803d'             };
  const badgeWarning = { bg:'#fef9c3',            text:'#a16207'             };
  const badgeDanger  = { bg:'#fee2e2',            text:'#b91c1c'             };

  return {
    // Surface
    'color.background.base':     bgBase,
    'color.background.surface':  bgSurface,
    'color.background.subtle':   bgSubtle,
    'color.background.inverse':  bgInverse,
    // Text
    'color.text.primary':        textPrimary,
    'color.text.secondary':      textSecondary,
    'color.text.muted':          textMuted,
    'color.text.disabled':       textDisabled,
    'color.text.inverse':        textInverse,
    'color.text.onBrand':        textOnBrand,
    // Border
    'color.border.default':      borderDefault,
    'color.border.subtle':       borderSubtle,
    'color.border.strong':       borderStrong,
    'color.border.focus':        borderFocus,
    // Action
    'color.action.primary':        actPrimary,
    'color.action.primaryHover':   actPrimaryHover,
    'color.action.primaryActive':  actPrimaryActive,
    'color.action.primarySubtle':  actPrimarySubtle,
    'color.action.secondary':      actSecondary,
    'color.action.secondaryHover': actSecondaryHover,
    'color.action.danger':         dangerColor,
    'color.action.dangerHover':    dangerHover,
    'color.action.success':        successColor,
    'color.action.warning':        warningColor,
    'color.action.info':           infoColor,
    // Button
    'color.button.primaryBg':       actPrimary,
    'color.button.primaryText':     textOnBrand,
    'color.button.primaryBorder':   actPrimary,
    'color.button.secondaryBg':     actPrimarySubtle,
    'color.button.secondaryText':   actPrimary,
    'color.button.secondaryBorder': borderDefault,
    'color.button.ghostText':       textPrimary,
    'color.button.ghostHover':      bgSubtle,
    'color.button.dangerBg':        badgeDanger.bg,
    'color.button.dangerText':      badgeDanger.text,
    'color.button.disabledBg':      bgSubtle,
    'color.button.disabledText':    textDisabled,
    // Input
    'color.input.bg':               bgBase,
    'color.input.border':           borderDefault,
    'color.input.borderHover':      borderStrong,
    'color.input.borderFocus':      borderFocus,
    'color.input.borderError':      dangerColor,
    'color.input.text':             textPrimary,
    'color.input.placeholder':      textMuted,
    // Card
    'color.card.bg':                bgBase,
    'color.card.border':            borderDefault,
    'color.card.shadow':            'var(--ds-shadow-md)',
    // Badges
    'color.badge.infoBg':           badgeInfo.bg,
    'color.badge.infoText':         badgeInfo.text,
    'color.badge.successBg':        badgeSuccess.bg,
    'color.badge.successText':      badgeSuccess.text,
    'color.badge.warningBg':        badgeWarning.bg,
    'color.badge.warningText':      badgeWarning.text,
    'color.badge.dangerBg':         badgeDanger.bg,
    'color.badge.dangerText':       badgeDanger.text,
  };
}

/* ══════════════════════════════════════════════════════════
   TASK 1.2 — COMPONENT TOKEN LAYER
══════════════════════════════════════════════════════════ */

export function computeComponentTokens(semanticTokens, tokens) {
  const { typeScale, spacingSteps, shadowDefs } = computeTokens(tokens);
  const sp = spacingSteps;         // shorthand
  const radius = SHAPE_RADIUS[tokens.shape] ?? '4px';
  const plat   = PLATFORMS[tokens.platform ?? 'web'];
  const isMobile = tokens.platform === 'ios' || tokens.platform === 'android';

  // Nav height per platform
  const navHeight = tokens.platform === 'ios' ? '44px' : tokens.platform === 'android' ? '56px' : '64px';

  return {
    // Button
    'button.height.sm':      `${Math.max(sp[4]??28, isMobile ? 44 : 28)}px`,
    'button.height.md':      `${Math.max(sp[5]??36, isMobile ? (plat?.minTouchTarget??44) : 36)}px`,
    'button.height.lg':      `${Math.max(sp[6]??44, isMobile ? (plat?.minTouchTarget??44) : 44)}px`,
    'button.paddingX.sm':    `${sp[2]??12}px`,
    'button.paddingX.md':    `${sp[3]??16}px`,
    'button.paddingX.lg':    `${sp[4]??20}px`,
    'button.radius':         radius,
    'button.fontWeight':     '600',
    'button.fontSize.sm':    `${typeScale.sm}px`,
    'button.fontSize.md':    `${typeScale.base}px`,
    'button.fontSize.lg':    `${typeScale.lg}px`,
    'button.shadow':         shadowDefs.sm,
    'button.transition':     'all 100ms cubic-bezier(0.4,0,0.2,1)',
    // Input
    'input.height':          `${Math.max(sp[5]??36, isMobile ? (plat?.minTouchTarget??44) : 36)}px`,
    'input.paddingX':        `${sp[2]??12}px`,
    'input.radius':          radius,
    'input.fontSize':        `${typeScale.base}px`,
    'input.borderWidth':     '1.5px',
    'input.shadow':          tokens.shadows === 'flat' ? 'none' : shadowDefs.sm,
    'input.transition':      'border 100ms cubic-bezier(0.4,0,0.2,1), box-shadow 100ms cubic-bezier(0.4,0,0.2,1)',
    // Card
    'card.padding':          `${sp[5]??20}px`,
    'card.radius':           tokens.shape === 'pill' ? '24px' : `calc(${radius} * 2)`,
    'card.borderWidth':      '1px',
    'card.shadow':           shadowDefs.md,
    // Badge
    'badge.height':          `${sp[2]??22}px`,
    'badge.paddingX':        `${sp[1]??8}px`,
    'badge.radius':          tokens.shape === 'sharp' ? '2px' : '9999px',
    'badge.fontSize':        `${typeScale.xs}px`,
    'badge.fontWeight':      '500',
    // Nav
    'nav.height':            navHeight,
    'nav.paddingX':          `${sp[3]??16}px`,
    'nav.shadow':            shadowDefs.sm,
    // Form
    'form.labelSize':        `${typeScale.sm}px`,
    'form.labelWeight':      '500',
    'form.gap':              `${sp[3]??16}px`,
    'form.helperSize':       `${typeScale.xs}px`,
  };
}

/* ══════════════════════════════════════════════════════════
   TASK 2.1 — STATE TOKEN LAYER
══════════════════════════════════════════════════════════ */

export function computeStateTokens(semanticTokens) {
  const focus = semanticTokens['color.border.focus'] ?? '#4f46e5';
  const pSubtle = semanticTokens['color.action.primarySubtle'] ?? '#eef2ff';
  const prim    = semanticTokens['color.action.primary'] ?? '#4f46e5';
  const danger  = semanticTokens['color.action.danger'] ?? '#ef4444';
  return {
    'state.focus.ring':        `0 0 0 2px ${focus}`,
    'state.focus.ringOffset':  '2px',
    'state.focus.outline':     `2px solid ${focus}`,
    'state.hover.opacity':     '0.85',
    'state.hover.bgShift':     pSubtle,
    'state.active.scale':      '0.97',
    'state.active.bgShift':    semanticTokens['color.action.primaryActive'] ?? '#3730a3',
    'state.disabled.opacity':  '0.4',
    'state.disabled.cursor':   'not-allowed',
    'state.selected.bg':       pSubtle,
    'state.selected.border':   prim,
    'state.selected.text':     prim,
    'state.error.border':      danger,
    'state.error.bg':          semanticTokens['color.badge.dangerBg'] ?? '#fee2e2',
    'state.error.text':        semanticTokens['color.badge.dangerText'] ?? '#b91c1c',
    'state.loading.opacity':   '0.7',
  };
}

/* ══════════════════════════════════════════════════════════
   TASK 2.4 — MOTION TOKEN LAYER
══════════════════════════════════════════════════════════ */

export function computeMotionTokens(preset) {
  const speedMult = preset === 'minimal' ? 0.8 : preset === 'playful' ? 1.2 : preset === 'brutalist' ? 0.3 : preset === 'glass' ? 1.3 : 1.0;
  const d = ms => `${Math.round(ms * speedMult)}ms`;

  const ease = preset === 'playful'   ? 'cubic-bezier(0.34,1.56,0.64,1)'
             : preset === 'brutalist' ? 'linear'
             : preset === 'glass'     ? 'cubic-bezier(0,0,0.2,1)'
             : 'cubic-bezier(0.4,0,0.2,1)';

  return {
    'motion.duration.instant':    d(50),
    'motion.duration.fast':       d(100),
    'motion.duration.normal':     d(200),
    'motion.duration.slow':       d(350),
    'motion.duration.deliberate': d(500),
    'motion.ease.linear':         'linear',
    'motion.ease.standard':       'cubic-bezier(0.4,0,0.2,1)',
    'motion.ease.decelerate':     'cubic-bezier(0,0,0.2,1)',
    'motion.ease.accelerate':     'cubic-bezier(0.4,0,1,1)',
    'motion.ease.spring':         'cubic-bezier(0.34,1.56,0.64,1)',
    'motion.transition.button':   `all ${d(100)} ${ease}`,
    'motion.transition.input':    `all ${d(100)} ${ease}`,
    'motion.transition.card':     `all ${d(200)} cubic-bezier(0,0,0.2,1)`,
    'motion.transition.modal':    `all ${d(350)} cubic-bezier(0,0,0.2,1)`,
    'motion.transition.page':     `all ${d(500)} cubic-bezier(0,0,0.2,1)`,
  };
}

/* ══════════════════════════════════════════════════════════
   TASK 3.1 — LAYOUT TOKEN LAYER
══════════════════════════════════════════════════════════ */

export function computeLayoutTokens(platform, spacingSteps) {
  const sp = spacingSteps;
  const isMobile = platform === 'ios' || platform === 'android';
  const minTouch  = platform === 'ios' ? 44 : platform === 'android' ? 48 : 32;
  const comfTouch = platform === 'ios' ? 48 : platform === 'android' ? 56 : 40;

  return {
    'layout.grid.columns':    isMobile ? '4'  : '12',
    'layout.grid.gutter':     isMobile ? `${sp[3]??16}px` : `${sp[5]??24}px`,
    'layout.grid.margin':     isMobile ? `${sp[3]??16}px` : `${sp[6]??32}px`,
    'layout.container.sm':    '640px',
    'layout.container.md':    '768px',
    'layout.container.lg':    '1024px',
    'layout.container.xl':    '1280px',
    'layout.container.max':   '1440px',
    'layout.breakpoint.xs':   '375px',
    'layout.breakpoint.sm':   '640px',
    'layout.breakpoint.md':   '768px',
    'layout.breakpoint.lg':   '1024px',
    'layout.breakpoint.xl':   '1280px',
    'layout.breakpoint.2xl':  '1536px',
    'layout.zIndex.base':     '0',
    'layout.zIndex.raised':   '10',
    'layout.zIndex.dropdown': '100',
    'layout.zIndex.sticky':   '200',
    'layout.zIndex.overlay':  '300',
    'layout.zIndex.modal':    '400',
    'layout.zIndex.toast':    '500',
    'layout.touchTarget.min':         `${minTouch}px`,
    'layout.touchTarget.comfortable': `${comfTouch}px`,
  };
}

/* ══════════════════════════════════════════════════════════
   MASTER COMPUTE — all layers in dependency order
══════════════════════════════════════════════════════════ */

export function computeAllTokens(tokens, mode = 'light') {
  const primitive  = computeTokens(tokens);
  const semantic   = computeSemanticTokens(tokens, mode);
  const component  = computeComponentTokens(semantic, tokens);
  const state      = computeStateTokens(semantic);
  const motion     = computeMotionTokens(tokens.preset ?? 'minimal');
  const layout     = computeLayoutTokens(tokens.platform ?? 'web', primitive.spacingSteps);
  return { primitive, semantic, component, state, motion, layout };
}

/** Convert dot.notation.key → --dot-notation-key CSS custom property */
export function tokensToCSSVars(obj) {
  const vars = {};
  for (const [k, v] of Object.entries(obj)) {
    vars[`--${k.replace(/\./g, '-')}`] = v;
  }
  return vars;
}

/* ══════════════════════════════════════════════════════════
   TASK 4.2 — AI PROMPT → TOKEN ADJUSTMENTS (local heuristics)
══════════════════════════════════════════════════════════ */

const AI_BRANDS = {
  stripe:    { colors:{ baseHue:230, saturation:65, harmony:'analogous' }, typography:{ display:'Inter', body:'Inter' }, shape:'soft',         shadows:'soft'    },
  notion:    { colors:{ baseHue:210, saturation:20, harmony:'mono'      }, typography:{ display:'Inter', body:'Inter' }, shape:'soft',         shadows:'flat'    },
  figma:     { colors:{ baseHue:260, saturation:75, harmony:'analogous' }, typography:{ display:'Inter', body:'Inter' }, shape:'soft',         shadows:'soft'    },
  vercel:    { colors:{ baseHue:0,   saturation:0,  harmony:'mono'      }, typography:{ display:'Inter', body:'Inter' }, shape:'sharp',        shadows:'flat'    },
  linear:    { colors:{ baseHue:250, saturation:60, harmony:'analogous' }, typography:{ display:'Inter', body:'Inter' }, shape:'soft',         shadows:'soft'    },
  airbnb:    { colors:{ baseHue:350, saturation:80, harmony:'mono'      }, typography:{ display:'Fraunces',body:'Nunito' }, shape:'rounded',   shadows:'soft'    },
  spotify:   { colors:{ baseHue:140, saturation:90, harmony:'mono'      }, typography:{ display:'DM Sans', body:'DM Sans' }, shape:'pill',     shadows:'hard'    },
  apple:     { colors:{ baseHue:210, saturation:15, harmony:'mono'      }, typography:{ display:'Plus Jakarta Sans',body:'Plus Jakarta Sans' }, shape:'veryRounded', shadows:'soft' },
  google:    { colors:{ baseHue:220, saturation:70, harmony:'complementary' }, typography:{ display:'Work Sans',body:'Work Sans' }, shape:'rounded', shadows:'soft' },
};

const AI_MOODS = {
  playful:      { colors:{ saturation:+20 }, shape:'pill',         shadows:'layered', typography:{ scale:1.333 } },
  minimal:      { colors:{ saturation:-20 }, shadows:'flat',       spacing:{ base:8 } },
  luxury:       { colors:{ saturation:-10 }, shape:'soft',         shadows:'layered', typography:{ display:'Cormorant Garamond' } },
  brutalist:    { colors:{ saturation:+30 }, shape:'sharp',        shadows:'hard'    },
  enterprise:   { colors:{ saturation:-15, harmony:'analogous' },  shape:'soft',     shadows:'soft' },
  editorial:    { typography:{ scale:1.618, display:'Fraunces' },  shape:'sharp'     },
  glassmorphic: { colors:{ saturation:+5  }, shape:'veryRounded',  shadows:'soft'    },
  dark:         { colors:{ saturation:+10 }  },
  retro:        { colors:{ baseHue:30, saturation:60, harmony:'analogous' }, shape:'rounded', typography:{ display:'Fraunces', body:'Lato' } },
  futuristic:   { colors:{ baseHue:200, saturation:85, harmony:'complementary' }, shape:'pill', shadows:'hard' },
};

const AI_COLORS = {
  blue:    200, navy:230, purple:270, violet:280, pink:320, red:0, orange:25, amber:38, yellow:50, green:140, teal:175, cyan:190,
};
const AI_HARMONY = { analogous:'analogous', monochrome:'mono', mono:'mono', complementary:'complementary', triadic:'triadic', split:'split' };
const AI_SHAPE   = { sharp:'sharp', rounded:'rounded', pill:'pill', circular:'pill', soft:'soft', round:'soft' };
const AI_SHADOW  = { flat:'flat', soft:'soft', hard:'hard', layered:'layered', elevated:'layered', deep:'hard' };
const AI_SPACING = { compact:{ base:4 }, spacious:{ base:8 }, dense:{ base:4 }, generous:{ base:8 }, tight:{ base:4 } };
const AI_SCALE   = { 'large headings':{ scale:1.618, baseSize:18 }, 'big text':{ scale:1.414 }, 'tight scale':{ scale:1.2 } };

/**
 * Parse a natural-language prompt into partial token adjustments.
 * All adjustments are additive/merged — locks are respected by the caller.
 * Returns: Partial<tokens> object safe to deep-merge.
 */
export function parseAIPromptToTokenAdjustments(prompt) {
  const p = prompt.toLowerCase();
  let adj = { colors:{}, typography:{}, spacing:{}, shape:undefined, shadows:undefined };

  // Brand match
  for (const [brand, overrides] of Object.entries(AI_BRANDS)) {
    if (p.includes(brand)) {
      if (overrides.colors)     Object.assign(adj.colors, overrides.colors);
      if (overrides.typography) Object.assign(adj.typography, overrides.typography);
      if (overrides.shape)      adj.shape   = overrides.shape;
      if (overrides.shadows)    adj.shadows = overrides.shadows;
      if (overrides.spacing)    Object.assign(adj.spacing, overrides.spacing);
    }
  }

  // Mood match
  for (const [mood, overrides] of Object.entries(AI_MOODS)) {
    if (p.includes(mood)) {
      if (overrides.colors?.saturation != null) {
        adj.colors.saturation = Math.max(0, Math.min(100, (adj.colors.saturation ?? 70) + overrides.colors.saturation));
      }
      if (overrides.colors?.baseHue != null)  adj.colors.baseHue  = overrides.colors.baseHue;
      if (overrides.colors?.harmony  != null)  adj.colors.harmony  = overrides.colors.harmony;
      if (overrides.typography)  Object.assign(adj.typography, overrides.typography);
      if (overrides.shape)       adj.shape   = overrides.shape;
      if (overrides.shadows)     adj.shadows = overrides.shadows;
      if (overrides.spacing)     Object.assign(adj.spacing, overrides.spacing);
    }
  }

  // Color keyword
  for (const [word, hue] of Object.entries(AI_COLORS)) {
    if (p.includes(word)) { adj.colors.baseHue = hue; break; }
  }

  // Harmony keyword
  for (const [word, harmony] of Object.entries(AI_HARMONY)) {
    if (p.includes(word)) { adj.colors.harmony = harmony; break; }
  }

  // Shape keyword
  for (const [word, shape] of Object.entries(AI_SHAPE)) {
    if (p.includes(word)) { adj.shape = shape; break; }
  }

  // Shadow keyword
  for (const [word, shadow] of Object.entries(AI_SHADOW)) {
    if (p.includes(word)) { adj.shadows = shadow; break; }
  }

  // Spacing keyword
  for (const [word, sp] of Object.entries(AI_SPACING)) {
    if (p.includes(word)) { Object.assign(adj.spacing, sp); break; }
  }

  // Scale keyword
  for (const [phrase, typo] of Object.entries(AI_SCALE)) {
    if (p.includes(phrase)) { Object.assign(adj.typography, typo); break; }
  }

  // "dark" keyword — handled by caller (mode switch), but bump saturation slightly
  if (p.includes('dark') || p.includes('night')) adj.colors.saturation = Math.min(100, (adj.colors.saturation ?? 70) + 8);

  // High-saturation keywords
  if (p.includes('vibrant') || p.includes('bold') || p.includes('vivid')) adj.colors.saturation = Math.min(100, (adj.colors.saturation ?? 70) + 18);
  if (p.includes('muted')   || p.includes('subtle') || p.includes('calm')) adj.colors.saturation = Math.max(0, (adj.colors.saturation ?? 70) - 20);

  // Strip empty keys
  if (!Object.keys(adj.colors).length)     delete adj.colors;
  if (!Object.keys(adj.typography).length) delete adj.typography;
  if (!Object.keys(adj.spacing).length)    delete adj.spacing;
  if (adj.shape   === undefined) delete adj.shape;
  if (adj.shadows === undefined) delete adj.shadows;

  return adj;
}

/* ══════════════════════════════════════════════════════════
   TASK 8.3 — VIBE SCORE
   TASK 8.6 — SYSTEM NAME GENERATOR
══════════════════════════════════════════════════════════ */

const VIBE_RULES = [
  {
    label:'Playful', emojis:['🎉','🍬','✨'], tagline:'Energetic, fun, expressive',
    match: t => t.colors.saturation >= 65 && (t.shape === 'pill' || t.shape === 'veryRounded'),
  },
  {
    label:'Brutalist', emojis:['🔩','⚡','🖤'], tagline:'Raw, bold, uncompromising',
    match: t => t.colors.saturation >= 70 && t.shape === 'sharp' && t.shadows === 'hard',
  },
  {
    label:'Editorial', emojis:['📰','🖊','🎭'], tagline:'Refined, structured, type-led',
    match: t => t.colors.saturation <= 30 && t.shadows === 'flat' && t.typography?.scale >= 1.5,
  },
  {
    label:'Luxe', emojis:['💎','🌙','🕯'], tagline:'Elevated, quiet, intentional',
    match: t => t.colors.saturation <= 40 && (t.shadows === 'layered' || t.shadows === 'soft'),
  },
  {
    label:'Tech', emojis:['⚙️','🌐','🔮'], tagline:'Sharp, systematic, precise',
    match: t => t.colors.saturation >= 75 && t.colors.harmony === 'complementary',
  },
  {
    label:'Corporate', emojis:['📊','🏢','✅'], tagline:'Trustworthy, structured, clear',
    match: t => t.colors.saturation >= 40 && t.colors.saturation <= 70 && t.shape !== 'sharp' && t.shape !== 'pill',
  },
  {
    label:'Organic', emojis:['🌿','🍃','☀️'], tagline:'Warm, natural, approachable',
    match: t => t.colors.baseHue >= 20 && t.colors.baseHue <= 160 && t.colors.saturation <= 60,
  },
  {
    label:'Minimal', emojis:['⬜','🤍','—'], tagline:'Calm, restrained, focused',
    match: t => t.colors.saturation <= 30 && t.shadows === 'flat',
  },
];

const VIBE_NAMES = {
  Playful:   ['Candy', 'Spark', 'Bounce', 'Bloom', 'Zest'],
  Brutalist: ['Slab', 'Raw', 'Force', 'Grit', 'Iron'],
  Editorial: ['Atlas', 'Folio', 'Canon', 'Serif', 'Prose'],
  Luxe:      ['Ember', 'Velvet', 'Onyx', 'Noir', 'Sable'],
  Tech:      ['Pulse', 'Neon', 'Cyber', 'Grid', 'Core'],
  Corporate: ['Apex', 'Clarity', 'Prime', 'Nexus', 'Solid'],
  Organic:   ['Grove', 'Terra', 'Moss', 'Dune', 'Stone'],
  Minimal:   ['Void', 'Lumen', 'Pure', 'Bare', 'Still'],
};

export function computeVibeScore(tokens) {
  // Normalise: inject baseHue/saturation/harmony so legacy VIBE_RULES still work
  const { baseHue, saturation } = getColorBase(tokens);
  const tNorm = { ...tokens, colors: { ...tokens.colors, baseHue, saturation, harmony: tokens.colors?.harmony ?? 'complementary' } };
  for (const rule of VIBE_RULES) {
    if (rule.match(tNorm)) {
      return { label: rule.label, emojis: rule.emojis, tagline: rule.tagline };
    }
  }
  return { label:'Balanced', emojis:['🎨','🔧','✦'], tagline:'Versatile, adaptive, clean' };
}

export function generateSystemName(tokens) {
  const vibe = computeVibeScore(tokens);
  const pool = VIBE_NAMES[vibe.label] ?? VIBE_NAMES.Minimal;
  const { baseHue } = getColorBase(tokens);
  const idx = Math.round(baseHue / 72) % pool.length;
  return pool[idx] + ' DS';
}

/* ══════════════════════════════════════════════════════════
   TASK 7.3 — SYSTEM EVOLUTION GENERATOR
══════════════════════════════════════════════════════════ */

const PRESET_PERSONALITY_SHIFTS = {
  minimal:    { saturation: +25, shape: 'rounded',    harmony: 'analogous',     shadows: 'soft'    },
  corporate:  { saturation: +20, shape: 'pill',       harmony: 'triadic',       shadows: 'layered' },
  playful:    { saturation: -25, shape: 'soft',       harmony: 'mono',          shadows: 'flat'    },
  editorial:  { saturation: +30, shape: 'rounded',    harmony: 'complementary', shadows: 'hard'    },
  brutalist:  { saturation: -20, shape: 'soft',       harmony: 'analogous',     shadows: 'soft'    },
  glass:      { saturation: +15, shape: 'pill',       harmony: 'split',         shadows: 'layered' },
};

const HARMONY_CYCLE = {
  mono:          'complementary',
  analogous:     'triadic',
  complementary: 'split',
  triadic:       'analogous',
  split:         'complementary',
};

/**
 * Given current tokens, generate 3 variants:
 *   [0] Original   — untouched clone
 *   [1] Evolved    — same hue, shifted personality
 *   [2] Contrasted — complementary hue + contrasting harmony
 */
export function generateEvolution(tokens) {
  const clone = t => JSON.parse(JSON.stringify(t));

  // v1 — Original
  const v1 = clone(tokens);

  // v2 — Evolved: shift saturation / shape based on current preset
  const v2 = clone(tokens);
  const shift = PRESET_PERSONALITY_SHIFTS[tokens.preset] ?? { saturation: +20, shape: 'rounded', harmony: 'analogous', shadows: 'soft' };
  if (v2.colors?.swatches?.length) {
    // Shift each swatch hue by a fixed offset
    v2.colors = { swatches: v2.colors.swatches.map(s => {
      const { h, s: sat } = hexToHsl(s.hex);
      return { hex: hslToHex(h, Math.min(100,Math.max(10,sat+shift.saturation)), 48), locked: s.locked };
    })};
  } else {
    v2.colors = { ...v2.colors, saturation: Math.min(100, Math.max(10, (v2.colors.saturation??70) + shift.saturation)), harmony: shift.harmony };
  }
  v2.shape   = shift.shape;
  v2.shadows = shift.shadows;

  // v3 — Contrasted: complementary palette
  const v3 = clone(tokens);
  const { baseHue: bh, saturation: bs } = getColorBase(tokens);
  if (v3.colors?.swatches?.length) {
    v3.colors = { swatches: v3.colors.swatches.map(s => {
      const { h, s: sat } = hexToHsl(s.hex);
      const newH = (h + 150) % 360;
      return { hex: hslToHex(newH, Math.max(20,Math.min(90,sat+(sat>50?-15:15))), 48), locked: s.locked };
    })};
  } else {
    v3.colors = {
      ...v3.colors,
      baseHue: (bh + 150 + Math.round(bs / 10)) % 360,
      harmony: HARMONY_CYCLE[tokens.colors?.harmony] ?? 'complementary',
      saturation: Math.max(20, Math.min(90, bs + (bs > 50 ? -15 : +15))),
    };
  }
  const SHAPE_CONTRAST = { sharp:'pill', soft:'sharp', rounded:'pill', veryRounded:'sharp', pill:'sharp' };
  const SHADOW_CONTRAST = { flat:'hard', soft:'layered', hard:'flat', layered:'soft' };
  v3.shape   = SHAPE_CONTRAST[tokens.shape]   ?? 'rounded';
  v3.shadows = SHADOW_CONTRAST[tokens.shadows] ?? 'soft';

  return [v1, v2, v3];
}

/* ══════════════════════════════════════════════════════════
   GAP #12 + #2 — DESIGN QUALITY AUDIT
   10 checks covering typography, color, spacing, motion
══════════════════════════════════════════════════════════ */

/**
 * auditDesignQuality(tokens)
 * Returns { score: 0-100, checks: [{ id, label, pass, severity, message, detail }] }
 * Each check worth 10 points; severity weights adjust partial credit.
 */
export function auditDesignQuality(tokens) {
  const { typography, spacing, colors, motion } = tokens;
  const { typeScale, spacingSteps } = computeTokens(tokens);
  const swatches = colors?.swatches ?? [];

  const checks = [];

  function push(id, label, pass, severity, message, detail = '') {
    checks.push({ id, label, pass, severity, message, detail });
  }

  // 1. TYPE_SCALE_RATIO — ratio >= 1.2 for clear hierarchy
  {
    const ratio = typography.scale ?? 1.25;
    if (ratio >= 1.2) {
      push('TYPE_SCALE_RATIO', 'Type Scale Ratio', true, 'info',
        `Scale ratio ${ratio} creates clear typographic hierarchy.`,
        'A ratio of 1.2 or higher produces readable step distinctions between size levels.'
      );
    } else if (ratio >= 1.1) {
      push('TYPE_SCALE_RATIO', 'Type Scale Ratio', false, 'warning',
        `Scale ratio ${ratio} — steps are too similar (< 1.2).`,
        'Headings and body text may not create enough visual distinction. Try 1.25 or higher.'
      );
    } else {
      push('TYPE_SCALE_RATIO', 'Type Scale Ratio', false, 'error',
        `Scale ratio ${ratio} — virtually no hierarchy (< 1.1).`,
        'Increase scale ratio to at least 1.2 for meaningful typographic levels.'
      );
    }
  }

  // 2. HEADING_WEIGHT — display weight > body weight
  {
    const dispW = typography.displayWeight ?? 700;
    const bodyW = typography.bodyWeight ?? 400;
    if (dispW > bodyW) {
      push('HEADING_WEIGHT', 'Heading vs Body Weight', true, 'info',
        `Display weight ${dispW} > body weight ${bodyW} — correct hierarchy.`,
        'Bold headings against regular body text creates a strong visual hierarchy.'
      );
    } else {
      push('HEADING_WEIGHT', 'Heading vs Body Weight', false, 'error',
        `Display weight (${dispW}) ≤ body weight (${bodyW}) — no weight hierarchy.`,
        'Headings should be heavier than body text. Set display weight to 600 or 700.'
      );
    }
  }

  // 3. BODY_READABILITY — base font size >= 14px
  {
    const base = typography.baseSize ?? 16;
    if (base >= 14) {
      push('BODY_READABILITY', 'Body Font Size', true, 'info',
        `Base size ${base}px meets comfortable reading threshold (≥ 14px).`,
        'Body text at 14px or larger reduces eye strain for long reading sessions.'
      );
    } else {
      push('BODY_READABILITY', 'Body Font Size', false, 'warning',
        `Base size ${base}px — below 14px is straining for body text.`,
        'Consider 14–17px for comfortable body text. Small sizes work for captions only.'
      );
    }
  }

  // 4. SPACING_GRANULARITY — adjacent steps differ by >= 4px
  {
    const steps = spacingSteps.slice(0, 6);
    const minDiff = Math.min(...steps.slice(1).map((v, i) => v - steps[i]));
    if (minDiff >= 4) {
      push('SPACING_GRANULARITY', 'Spacing Granularity', true, 'info',
        `Minimum spacing step gap is ${Math.round(minDiff)}px — well-differentiated.`,
        'Steps with at least 4px difference create visually distinct spatial relationships.'
      );
    } else {
      push('SPACING_GRANULARITY', 'Spacing Granularity', false, 'warning',
        `Minimum spacing gap is ${Math.round(minDiff)}px — may feel cramped.`,
        'Increase the base spacing unit or switch to a fibonacci scale for better step separation.'
      );
    }
  }

  // 5. COLOR_CONTRAST_BRAND — primary + error not in same hue family (within 30°)
  {
    const primHex  = swatches[0]?.hex ?? '#4f46e5';
    const errHex   = colors?.semantic?.error ?? '#ef4444';
    const primHue  = hexToHsl(primHex).h;
    const errHue   = hexToHsl(errHex).h;
    const hueDiff  = Math.min(Math.abs(primHue - errHue), 360 - Math.abs(primHue - errHue));
    if (hueDiff >= 30) {
      push('COLOR_CONTRAST_BRAND', 'Brand vs Error Color Separation', true, 'info',
        `Primary and error colors are ${Math.round(hueDiff)}° apart — clearly distinct.`,
        'Error states use a visually separate hue from your brand color — users can distinguish status easily.'
      );
    } else {
      push('COLOR_CONTRAST_BRAND', 'Brand vs Error Color Separation', false, 'error',
        `Primary and error are only ${Math.round(hueDiff)}° apart — may cause confusion.`,
        'Error colors should differ from your primary by at least 30° on the hue wheel to be unmistakably distinct.'
      );
    }
  }

  // 6. PALETTE_DIVERSITY — not all swatches in same hue family
  {
    if (swatches.length >= 2) {
      const hues      = swatches.map(s => hexToHsl(s?.hex ?? '#4f46e5').h);
      const maxSpread = Math.max(...hues.map(h => Math.min(...hues.filter(hh => hh !== h).map(hh => Math.min(Math.abs(h - hh), 360 - Math.abs(h - hh))))));
      if (maxSpread >= 30) {
        push('PALETTE_DIVERSITY', 'Palette Diversity', true, 'info',
          `Swatches span ${Math.round(maxSpread)}° — good hue variety.`,
          'Diverse hues give you more semantic range (action, status, accent) without visual monotony.'
        );
      } else {
        push('PALETTE_DIVERSITY', 'Palette Diversity', false, 'warning',
          `All swatches within ${Math.round(maxSpread)}° — monotone palette.`,
          'Consider adding a complementary or split-complementary color for better semantic distinction.'
        );
      }
    } else {
      push('PALETTE_DIVERSITY', 'Palette Diversity', true, 'info',
        'Single-swatch palette — monochromatic by design.',
        'A single brand hue applied consistently creates a strong, cohesive identity.'
      );
    }
  }

  // 7. LETTER_SPACING_SMALL — tight tracking with font < 14px = unreadable
  {
    const ls   = typography.letterSpacing ?? 'normal';
    const base = typography.baseSize ?? 16;
    if (ls === 'tight' && base < 14) {
      push('LETTER_SPACING_SMALL', 'Letter Spacing at Small Size', false, 'error',
        `Tight tracking (-0.02em) at ${base}px base — unreadable for body text.`,
        'Tight letter-spacing reduces legibility below 14px. Use "normal" or "wide" for small text.'
      );
    } else {
      push('LETTER_SPACING_SMALL', 'Letter Spacing at Small Size', true, 'info',
        `Letter-spacing "${ls}" at ${base}px — comfortable for reading.`,
        'Tracking is appropriate for the current font size. No legibility issues detected.'
      );
    }
  }

  // 8. MOTION_PERFORMANCE — duration not > 400ms for UI transitions
  {
    const dur = motion?.duration ?? 'balanced';
    const durMs = { instant: 80, snappy: 120, balanced: 200, expressive: 320 }[dur] ?? 200;
    if (durMs > 400) {
      push('MOTION_PERFORMANCE', 'Motion Performance', false, 'warning',
        `UI transition duration ${durMs}ms — too slow for interactive feedback.`,
        'Transitions above 400ms make the UI feel sluggish. Use "balanced" (200ms) or "snappy" (120ms).'
      );
    } else {
      push('MOTION_PERFORMANCE', 'Motion Performance', true, 'info',
        `UI transitions at ${durMs}ms — within performance-friendly range.`,
        'Fast transitions (under 400ms) keep the UI feeling responsive and snappy.'
      );
    }
  }

  // 9. DENSITY_FONT_MATCH — compact density should have smaller font
  {
    const density = tokens.density ?? 'regular';
    const base    = typography.baseSize ?? 16;
    if (density === 'compact' && base > 16) {
      push('DENSITY_FONT_MATCH', 'Density & Font Size Match', false, 'info',
        `Compact density with ${base}px font — content may feel oversized.`,
        'Compact density pairs best with a 14–15px base size to achieve the intended information density.'
      );
    } else if (density === 'spacious' && base < 15) {
      push('DENSITY_FONT_MATCH', 'Density & Font Size Match', false, 'info',
        `Spacious density with ${base}px font — may feel imbalanced.`,
        'Spacious layouts benefit from a 16–18px base to fill the breathing room elegantly.'
      );
    } else {
      push('DENSITY_FONT_MATCH', 'Density & Font Size Match', true, 'info',
        `Density "${density}" and font size ${base}px are well-matched.`,
        'Font size and density setting create a cohesive information rhythm.'
      );
    }
  }

  // 10. BORDER_RADIUS_CONSISTENCY — shape should match brand feel
  {
    const shape   = tokens.shape ?? 'soft';
    const shadows = tokens.shadows ?? 'soft';
    const clashes = (shape === 'sharp' && shadows === 'soft') || (shape === 'pill' && shadows === 'hard');
    push('BORDER_RADIUS_CONSISTENCY', 'Shape & Shadow Consistency', true, 'info',
      clashes
        ? `Shape "${shape}" + shadows "${shadows}" may create a stylistic mismatch.`
        : `Shape "${shape}" + shadows "${shadows}" — consistent visual language.`,
      clashes
        ? 'Sharp shapes typically pair with flat/hard shadows; rounded shapes pair with soft/layered shadows.'
        : 'Your radius and shadow style reinforce the same design personality — geometric and intentional.'
    );
  }

  // Score: passing checks * 10, with severity weight deduction
  const passing  = checks.filter(c => c.pass).length;
  const errors   = checks.filter(c => !c.pass && c.severity === 'error').length;
  const warnings = checks.filter(c => !c.pass && c.severity === 'warning').length;
  const rawScore = (passing / checks.length) * 100;
  // Deduct more for errors than warnings
  const score    = Math.max(0, Math.round(rawScore - errors * 4 - warnings * 1));

  return { score, checks };
}

/* ══════════════════════════════════════════════════════════
   PHASE 3 — ORG ADOPTION: NEW EXPORT FORMATS
══════════════════════════════════════════════════════════ */

/** Gap #17 — SCSS Variables export */
export function exportSCSS(tokens) {
  const { palette, typeScale, spacingSteps, shadowDefs } = computeTokens(tokens);
  const semantic = computeSemanticTokens(tokens, 'light');
  const name = tokens.systemName ?? 'Design System';
  const date = new Date().toISOString().slice(0, 10);

  let out = `// ${'='.repeat(58)}\n// ${name} — SCSS Variables\n// Generated: ${date} · Design System Builder\n// ${'='.repeat(58)}\n\n`;

  out += `// === PRIMITIVE COLORS ===\n`;
  palette.forEach((shades, i) => {
    const n = ROLE_NAMES[i] ?? `color-${i}`;
    SHADE_KEYS.forEach(k => { out += `$color-${n}-${k}: ${shades[k]};\n`; });
    out += '\n';
  });

  out += `// === TYPOGRAPHY ===\n`;
  out += `$font-display: '${tokens.typography.display}', serif;\n`;
  out += `$font-body: '${tokens.typography.body}', sans-serif;\n`;
  out += `$font-mono: '${tokens.typography.mono}', monospace;\n`;
  Object.entries(typeScale).forEach(([k, v]) => { out += `$text-${k}: ${v}px;\n`; });
  out += '\n';

  out += `// === SPACING ===\n`;
  spacingSteps.forEach((v, i) => { out += `$space-${i + 1}: ${v}px;\n`; });
  out += '\n';

  out += `// === SHAPE & SHADOWS ===\n`;
  out += `$radius: ${SHAPE_RADIUS[tokens.shape]};\n`;
  out += `$radius-sm: ${tokens.shape === 'sharp' ? '0px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 0.5)`};\n`;
  out += `$radius-lg: ${tokens.shape === 'pill' ? '9999px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 2)`};\n`;
  out += `$shadow-sm: ${shadowDefs.sm};\n`;
  out += `$shadow-md: ${shadowDefs.md};\n`;
  out += `$shadow-lg: ${shadowDefs.lg};\n\n`;

  out += `// === SEMANTIC TOKENS ===\n`;
  Object.entries(semantic).forEach(([k, v]) => { out += `$${k.replace(/\./g, '-')}: ${v};\n`; });

  out += `\n// === MIXINS ===\n`;
  out += `@mixin card-surface {\n  background: $color-background-base;\n  border: 1px solid $color-border-default;\n  border-radius: $radius;\n  box-shadow: $shadow-sm;\n}\n\n`;
  out += `@mixin focus-ring {\n  outline: 2px solid $color-border-focus;\n  outline-offset: 2px;\n}\n`;

  return out;
}

/** Gap #17 — Figma Variables JSON (Tokens Studio compatible) */
export function exportFigmaVariables(tokens) {
  const { palette, typeScale, spacingSteps, shadowDefs } = computeTokens(tokens);
  const semantic = computeSemanticTokens(tokens, 'light');
  const semDark  = computeSemanticTokens(tokens, 'dark');

  const out = {
    $metadata: { tokenSetOrder: ['global', 'semantic', 'dark'] },
    global: { colors: {}, typography: {}, spacing: {}, shape: {}, shadow: {} },
    semantic: {},
    dark: {},
  };

  palette.forEach((shades, i) => {
    const n = ROLE_NAMES[i] ?? `color-${i}`;
    out.global.colors[n] = {};
    SHADE_KEYS.forEach(k => { out.global.colors[n][k] = { $value: shades[k], $type: 'color' }; });
  });

  out.global.typography = {
    fontDisplay: { $value: tokens.typography.display, $type: 'fontFamilies' },
    fontBody:    { $value: tokens.typography.body,    $type: 'fontFamilies' },
    fontMono:    { $value: tokens.typography.mono,    $type: 'fontFamilies' },
    scaleRatio:  { $value: tokens.typography.scale,   $type: 'other' },
    baseSize:    { $value: `${tokens.typography.baseSize}px`, $type: 'fontSizes' },
    ...Object.fromEntries(Object.entries(typeScale).map(([k, v]) => [`size-${k}`, { $value: `${v}px`, $type: 'fontSizes' }])),
  };

  spacingSteps.forEach((v, i) => { out.global.spacing[`space-${i + 1}`] = { $value: `${v}px`, $type: 'spacing' }; });

  out.global.shape = {
    radius:   { $value: SHAPE_RADIUS[tokens.shape], $type: 'borderRadius' },
    radiusSm: { $value: tokens.shape === 'sharp' ? '0px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 0.5)`, $type: 'borderRadius' },
    radiusLg: { $value: tokens.shape === 'pill' ? '9999px' : `calc(${SHAPE_RADIUS[tokens.shape]} * 2)`, $type: 'borderRadius' },
  };

  out.global.shadow = {
    sm: { $value: shadowDefs.sm, $type: 'boxShadow' },
    md: { $value: shadowDefs.md, $type: 'boxShadow' },
    lg: { $value: shadowDefs.lg, $type: 'boxShadow' },
  };

  Object.entries(semantic).forEach(([k, v]) => {
    const type = typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb')) ? 'color' : 'other';
    out.semantic[k] = { $value: v, $type: type };
  });

  Object.entries(semDark).forEach(([k, v]) => {
    if (v !== semantic[k]) out.dark[k] = { $value: v, $type: 'color' };
  });

  return JSON.stringify(out, null, 2);
}

/** Gap #17 — Style Dictionary config */
export function exportStyleDictionary(tokens) {
  const name = (tokens.systemName ?? 'design-system').toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);

  const config = {
    source: ['tokens/global.json', 'tokens/semantic.json'],
    platforms: {
      css: {
        transformGroup: 'css', prefix: 'ds', buildPath: 'dist/css/',
        files: [
          { destination: 'variables.css', format: 'css/variables', options: { outputReferences: true } },
          { destination: 'dark.css', format: 'css/variables', filter: 'isDark', options: { selector: '[data-theme="dark"]' } },
        ],
      },
      scss: {
        transformGroup: 'scss', prefix: 'ds', buildPath: 'dist/scss/',
        files: [
          { destination: '_variables.scss', format: 'scss/variables' },
          { destination: `_${name}-map.scss`, format: 'scss/map-deep', mapName: `${name}-tokens` },
        ],
      },
      js: {
        transformGroup: 'js', buildPath: 'dist/js/',
        files: [
          { destination: 'tokens.esm.js', format: 'javascript/es6' },
          { destination: 'tokens.cjs.js', format: 'javascript/module' },
        ],
      },
      json: {
        transformGroup: 'js', buildPath: 'dist/',
        files: [{ destination: 'tokens.json', format: 'json/nested' }],
      },
    },
  };

  return `// style-dictionary.config.js — ${tokens.systemName ?? 'Design System'}\n// Generated: ${date}\n// Install: npm install style-dictionary\n// Run: npx style-dictionary build\n\nmodule.exports = ${JSON.stringify(config, null, 2)};\n`;
}

/** Gap #18 — Full documentation export (DESIGN-SYSTEM.md) */
export function exportDocumentation(tokens) {
  const { palette, typeScale, spacingSteps } = computeTokens(tokens);
  const semantic = computeSemanticTokens(tokens, 'light');
  const name     = tokens.systemName ?? 'Design System';
  const date     = new Date().toISOString().slice(0, 10);
  const preset   = PRESETS[tokens.preset]?.label ?? 'Custom';
  const platform = PLATFORMS[tokens.platform ?? 'web']?.label ?? 'Web';
  const roleNames = ['Primary', 'Secondary', 'Tertiary', 'Accent', 'Neutral', 'Warning'];

  let doc = `# ${name}\n\n> Generated: ${date} · Preset: ${preset} · Platform: ${platform}\n\n---\n\n`;
  doc += `## Color System\n\n`;
  palette.forEach((shades, i) => {
    doc += `### ${roleNames[i] ?? `Color ${i + 1}`}\n\n| Shade | Value | Usage |\n|-------|-------|-------|\n`;
    SHADE_KEYS.forEach(k => {
      const use = +k <= 200 ? 'Backgrounds, tints' : +k >= 700 ? 'Text, dark fills' : +k === 500 ? '**Primary** — buttons, icons' : 'Mid fills';
      doc += `| ${k} | \`${shades[k]}\` | ${use} |\n`;
    });
    doc += '\n';
  });

  doc += `## Typography\n\n**Display:** ${tokens.typography.display}  **Body:** ${tokens.typography.body}  **Mono:** ${tokens.typography.mono}\n\n`;
  doc += `**Scale:** ${tokens.typography.scale} (${SCALE_NAMES[tokens.typography.scale] ?? 'Custom'}) · **Base:** ${tokens.typography.baseSize}px\n\n`;
  doc += `| Role | Step | px | rem |\n|------|------|----|-----|\n`;
  [['Display', '4xl'], ['H1', '3xl'], ['H2', '2xl'], ['H3', 'xl'], ['Lead', 'lg'], ['Body', 'base'], ['Label', 'sm'], ['Caption', 'xs']].forEach(([role, step]) => {
    const px = Math.round(typeScale[step]);
    doc += `| ${role} | ${step} | ${px}px | ${(px / 16).toFixed(3)}rem |\n`;
  });
  doc += '\n';

  doc += `## Spacing\n\nBase: **${tokens.spacing.base}px** · Scale: **${tokens.spacing.scale}**\n\n`;
  doc += `| Token | Value |\n|-------|-------|\n`;
  spacingSteps.slice(0, 8).forEach((v, i) => { doc += `| \`--space-${i + 1}\` | \`${v}px\` |\n`; });
  doc += '\n';

  doc += `## Semantic Tokens\n\n| Token | Light | Usage |\n|-------|-------|-------|\n`;
  const keyDesc = { 'color.background.base': 'Page bg', 'color.background.surface': 'Cards', 'color.text.primary': 'Body text', 'color.text.muted': 'Secondary', 'color.action.primary': 'Buttons', 'color.action.danger': 'Errors', 'color.action.success': 'Success', 'color.border.default': 'Borders', 'color.border.focus': 'Focus rings' };
  Object.entries(keyDesc).forEach(([k, desc]) => { if (semantic[k]) doc += `| \`--${k.replace(/\./g, '-')}\` | \`${semantic[k]}\` | ${desc} |\n`; });
  doc += '\n';

  doc += `## Component Guidelines\n\n- **Buttons:** Primary = 1 CTA per view, Ghost = tertiary, Danger = destructive only\n- **Forms:** Visible label on all inputs; error state = color + text\n- **Cards:** Use \`--ds-bg-surface\`, \`--ds-shadow-sm\`, min padding \`--ds-space-4\`\n\n`;
  doc += `## Accessibility\n\n- WCAG 2.1 AA contrast: 4.5:1 normal text, 3:1 large\n- Visible focus ring on all interactive elements\n- Touch targets: 44×44px (iOS) / 48×48dp (Android)\n- Respect \`prefers-reduced-motion\`\n- Never use color as the only differentiator\n\n`;
  doc += `## Usage\n\n\`\`\`css\n@import 'design-system/variables.css';\n.button { background: var(--ds-action-primary); }\n\`\`\`\n\n`;
  doc += `---\n*Generated by Design System Builder · ${date}*\n`;

  return doc;
}

/** Gap #15 — README.md per export format */
export function generateReadme(tokens, format = 'css') {
  const name = tokens.systemName ?? 'Design System';
  const date = new Date().toISOString().slice(0, 10);
  const info = ({
    css:            { install: 'No install needed — pure CSS custom properties', use: `@import './design-system/variables.css';\n\n.button { background: var(--ds-action-primary); }`, files: ['variables.css', 'dark.css'], tip: 'Add [data-theme="dark"] to <html> for dark mode.' },
    scss:           { install: 'Drop into any SCSS project — no install needed', use: `@use './design-system/variables' as ds;\n\n.button { background: ds.$color-action-primary; }`, files: ['_variables.scss'], tip: 'Use @use with a namespace to avoid variable conflicts.' },
    tailwind:       { install: 'npm install -D tailwindcss', use: `const ds = require('./tokens/tailwind-config');\nmodule.exports = { theme: { extend: ds.theme.extend } };`, files: ['tailwind-config.js'], tip: 'Merge into theme.extend, do not replace the entire theme.' },
    json:           { install: 'npm install style-dictionary', use: 'npx style-dictionary build --config style-dictionary.config.js', files: ['tokens.json', 'style-dictionary.config.js'], tip: 'W3C DTCG format — works with Tokens Studio, Theo, and Style Dictionary.' },
    figma:          { install: 'Install Tokens Studio plugin in Figma (free)', use: '1. Tokens Studio → Import → paste JSON\n2. Apply to selection', files: ['tokens.figma.json'], tip: 'Enable "Apply on change" to keep Figma in sync as tokens evolve.' },
    react:          { install: 'Copy files into your project:\ncp *.jsx *.js src/design-system/', use: `import 'design-system/tokens.css'; // once at app root\nimport { Button, Card } from './design-system';\n\n<Button variant="primary">Submit</Button>`, files: ['tokens.js', 'tokens.css', 'Button.jsx', 'Input.jsx', 'Card.jsx', 'Select.jsx', 'Badge.jsx', 'Alert.jsx', 'Checkbox.jsx', 'Toggle.jsx', 'Modal.jsx'], tip: 'Import tokens.css once at the root. All components read CSS custom properties.' },
    styledictionary:{ install: 'npm install style-dictionary', use: 'npx style-dictionary build --config style-dictionary.config.js', files: ['style-dictionary.config.js', 'tokens/global.json'], tip: 'Generates CSS, SCSS, and JS from the same token source.' },
  })[format] ?? { install: 'N/A', use: 'Import the file', files: [], tip: '' };

  let readme = `# ${name}\n\n> Generated: ${date} by Design System Builder\n\n`;
  readme += `## Quick Start\n\n\`\`\`bash\n${info.install}\n\`\`\`\n\n`;
  readme += `## Usage\n\n\`\`\`${['json', 'figma', 'styledictionary'].includes(format) ? 'bash' : format === 'react' ? 'jsx' : format}\n${info.use}\n\`\`\`\n\n`;
  readme += `## Files\n\n` + info.files.map(f => `- \`${f}\``).join('\n') + '\n\n';
  readme += `## Tip\n\n${info.tip}\n\n`;
  readme += `## Token Reference\n\nSee \`DESIGN-SYSTEM.md\` for the full token table, component guidelines, and accessibility notes.\n`;
  return readme;
}

/* ══════════════════════════════════════════════════════════
   PHASE 4 — PRODUCT-MARKET FIT
══════════════════════════════════════════════════════════ */

/** Gap #27 — localStorage analytics (anonymous, no backend) */
export function trackEvent(event, meta = {}) {
  if (typeof window === 'undefined') return;
  try {
    const key  = 'ds-analytics';
    const data = JSON.parse(localStorage.getItem(key) ?? '{}');
    data[event] = (data[event] ?? 0) + 1;
    data._lastSeen = Date.now();
    if (meta.format) data[`export_${meta.format}`] = (data[`export_${meta.format}`] ?? 0) + 1;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function getAnalytics() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('ds-analytics') ?? '{}'); } catch { return {}; }
}

/** Gap #32 — Import tokens from CSS variables or JSON (W3C DTCG / Tokens Studio) */
export function importTokens(input, currentTokens) {
  const text = input.trim();

  try {
    const json = JSON.parse(text);
    const src  = json.global ?? json;
    const colorSrc = src.colors ?? src.color ?? {};
    const typSrc   = src.typography ?? {};
    const spaceSrc = src.spacing ?? {};

    const swatches = [];
    const tryExtract = (obj) => {
      if (!obj) return;
      const v500 = obj['500']?.$value ?? obj['500'];
      if (v500 && typeof v500 === 'string' && v500.startsWith('#')) swatches.push({ hex: v500, locked: false });
    };
    tryExtract(colorSrc.primary ?? colorSrc[Object.keys(colorSrc)[0]]);
    tryExtract(colorSrc.secondary ?? colorSrc[Object.keys(colorSrc)[1]]);

    const display  = typSrc.fontDisplay?.$value  ?? typSrc.fontDisplay  ?? currentTokens.typography.display;
    const body     = typSrc.fontBody?.$value     ?? typSrc.fontBody     ?? currentTokens.typography.body;
    const mono     = typSrc.fontMono?.$value     ?? typSrc.fontMono     ?? currentTokens.typography.mono;
    const baseSize = typSrc.baseSize?.$value     ? parseInt(typSrc.baseSize.$value) : currentTokens.typography.baseSize;
    const scale    = typSrc.scaleRatio?.$value   ?? currentTokens.typography.scale;
    const spaceBase= spaceSrc['space-1']?.$value ? parseInt(spaceSrc['space-1'].$value) : currentTokens.spacing.base;

    return {
      ...currentTokens,
      colors:     { ...currentTokens.colors, swatches: swatches.length ? swatches : currentTokens.colors.swatches },
      typography: { ...currentTokens.typography, display, body, mono, baseSize, scale },
      spacing:    { ...currentTokens.spacing, base: spaceBase },
    };
  } catch {}

  const cssMatches = [...text.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;}\n]+)/g)];
  if (cssMatches.length > 0) {
    const vars = Object.fromEntries(cssMatches.map(([, k, v]) => [k.trim(), v.trim()]));
    const swatches = [];
    const prim = vars['color-primary-500'] ?? vars['ds-primary'] ?? vars['ds-action-primary'];
    if (prim?.startsWith('#')) swatches.push({ hex: prim, locked: false });
    const sec = vars['color-secondary-500'] ?? vars['ds-secondary'];
    if (sec?.startsWith('#')) swatches.push({ hex: sec, locked: false });

    const radiusStr = vars['radius'] ?? vars['ds-radius'];
    let shape = currentTokens.shape;
    if (radiusStr) {
      const r = parseInt(radiusStr);
      shape = !r ? 'sharp' : r <= 4 ? 'soft' : r <= 8 ? 'rounded' : r <= 16 ? 'veryRounded' : 'pill';
    }

    const spaceBase = vars['space-1'] ?? vars['ds-space-1'];

    return {
      ...currentTokens,
      colors:  { ...currentTokens.colors, swatches: swatches.length ? swatches : currentTokens.colors.swatches },
      spacing: { ...currentTokens.spacing, base: spaceBase ? parseInt(spaceBase) : currentTokens.spacing.base },
      shape,
    };
  }

  return null;
}
