/**
 * brandImport.js — pure brand color extraction utilities
 * No React, fully unit-testable
 */

/** Convert hex → { h, s, l } (0-360, 0-100, 0-100) */
export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const l = (max+min)/2;
  if (max === min) return { h:0, s:0, l: Math.round(l*100) };
  const d = max-min;
  const s = l > 0.5 ? d/(2-max-min) : d/(max+min);
  let h;
  switch(max) {
    case r: h = ((g-b)/d + (g<b?6:0))/6; break;
    case g: h = ((b-r)/d + 2)/6; break;
    default:h = ((r-g)/d + 4)/6; break;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

/** Suggest harmony from saturation level */
function suggestHarmony(sat) {
  if (sat > 70) return Math.random() > 0.5 ? 'complementary' : 'split';
  if (sat >= 40) return 'analogous';
  return 'mono';
}

/** Suggest shape from hue/sat — bright warm → pill, cool neutral → soft */
function suggestShape(h, s) {
  if (s < 25) return 'soft';
  if (h >= 350 || h <= 30) return 'rounded';   // warm/red
  if (h >= 200 && h <= 280) return 'soft';      // blue/purple
  return 'soft';
}

/** Suggest shadows from lightness */
function suggestShadows(l) {
  if (l < 20) return 'hard';
  if (l > 70) return 'flat';
  return 'soft';
}

/**
 * Given a brand hex color, return a partial token state to merge.
 * Respects the caller's lock logic — call site should spread into tokens.
 */
export function extractPaletteFromColor(hex) {
  // Validate hex
  const clean = hex.startsWith('#') ? hex : '#' + hex;
  if (!/^#[0-9a-fA-F]{6}$/.test(clean)) return null;

  const { h, s, l } = hexToHsl(clean);

  return {
    colors: {
      baseHue:   h,
      saturation: Math.max(20, Math.min(95, s)),
      harmony:   suggestHarmony(s),
      count:     s > 60 ? 3 : 2,
    },
    shape:   suggestShape(h, s),
    shadows: suggestShadows(l),
    // Pass extracted HSL back for display
    _extracted: { hex: clean, h, s, l },
  };
}
