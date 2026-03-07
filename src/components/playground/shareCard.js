/**
 * shareCard.js — Task 8.5
 * Generates a 1200×630px PNG of the current design system using native Canvas API.
 * No external dependencies — pure canvas drawing.
 */

import { computeTokens, computeAllTokens, SHAPE_RADIUS } from './dsEngine';

const W = 1200;
const H = 630;

/** Convert CSS border-radius string to px number */
function radiusPx(str) {
  if (!str || str === '0') return 0;
  return Math.min(parseInt(str) || 0, 36);
}

/** Draw a rounded rectangle path */
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Hex to rgba string */
function hex2rgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Generate a 1200×630 design system preview card.
 * Returns a Promise<string> (data URL) or throws.
 */
export async function generateShareCard(tokens) {
  const { palette, typeScale } = computeTokens(tokens);
  const allTok = computeAllTokens(tokens, 'light');
  const sem    = allTok.semantic ?? {};

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const p0 = palette[0] ?? {};
  const p1 = palette[1] ?? palette[0] ?? {};
  const bgColor  = p0[50]  ?? '#f8f9fa';
  const primColor = p0[500] ?? '#4f46e5';
  const darkColor = p0[900] ?? '#111111';
  const shapeR   = radiusPx(SHAPE_RADIUS[tokens.shape] ?? '6px');
  const sysName  = tokens.systemName ?? 'Design System';

  // ── Background gradient ──
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, p0[100] ?? '#e8e8f0');
  grad.addColorStop(0.5, p1[100] ?? p0[100] ?? '#f0f0f8');
  grad.addColorStop(1, p0[200] ?? '#d8d8e8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle grid pattern ──
  ctx.strokeStyle = hex2rgba(darkColor, 0.04);
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Left panel: color palette ──
  const PAL_X = 64;
  const PAL_Y = 110;
  const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const SWATCH_W = 70, SWATCH_H = 40, GAP = 4;
  const colorsToShow = Math.min(palette.length, 4);

  for (let ci = 0; ci < colorsToShow; ci++) {
    const shadeMap = palette[ci] ?? {};
    const rowY = PAL_Y + ci * (SWATCH_H + 8);
    for (let si = 0; si < SHADES.length; si++) {
      const shade = shadeMap[SHADES[si]] ?? '#cccccc';
      const sx = PAL_X + si * (SWATCH_W + GAP);
      const r = si === 0 ? Math.min(shapeR, 8) : si === 9 ? Math.min(shapeR, 8) : 3;
      roundRect(ctx, sx, rowY, SWATCH_W, SWATCH_H, r);
      ctx.fillStyle = shade;
      ctx.fill();
      // Shade label on 500
      if (SHADES[si] === 500) {
        ctx.fillStyle = hex2rgba(darkColor, 0.3);
        ctx.font = `bold 9px "Geist Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('500', sx + SWATCH_W / 2, rowY + SWATCH_H + 12);
      }
    }
  }

  // Shade number labels (top row only)
  ctx.font = `8px "Geist Mono", monospace`;
  ctx.fillStyle = hex2rgba(darkColor, 0.25);
  ctx.textAlign = 'center';
  for (let si = 0; si < SHADES.length; si++) {
    if (SHADES[si] === 500) continue;
    ctx.fillText(String(SHADES[si]), PAL_X + si * (SWATCH_W + GAP) + SWATCH_W / 2, PAL_Y - 8);
  }

  // ── Right panel: type + shape examples ──
  const RX = PAL_X + SHADES.length * (SWATCH_W + GAP) + 48;
  const RW = W - RX - 64;

  // Display font name
  const dispFont = tokens.typography?.display ?? 'Playfair Display';
  ctx.font = `bold 48px "${dispFont}", serif`;
  ctx.fillStyle = darkColor;
  ctx.textAlign = 'left';
  ctx.fillText('Aa', RX, PAL_Y + 44);

  // Body font sample
  ctx.font = `16px "${tokens.typography?.body ?? 'DM Sans'}", sans-serif`;
  ctx.fillStyle = hex2rgba(darkColor, 0.55);
  ctx.fillText('The quick brown fox jumps over the lazy dog.', RX, PAL_Y + 76);
  ctx.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ  0123456789', RX, PAL_Y + 96);

  // Mono font
  ctx.font = `12px "${tokens.typography?.mono ?? 'DM Mono'}", monospace`;
  ctx.fillStyle = hex2rgba(darkColor, 0.35);
  ctx.fillText(`const color = "${primColor}"; // primary-500`, RX, PAL_Y + 118);

  // Shape/shadow demos
  const demoY = PAL_Y + 148;
  const shapes = ['sharp', 'soft', 'rounded', 'veryRounded', 'pill'];
  const demoW = 80, demoH = 34, demoGap = 10;
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    const dx = RX + i * (demoW + demoGap);
    const r = radiusPx(SHAPE_RADIUS[s]);
    // Shadow
    if (tokens.shadows !== 'flat') {
      ctx.save();
      ctx.shadowColor = hex2rgba(darkColor, 0.18);
      ctx.shadowBlur = tokens.shadows === 'hard' ? 0 : 8;
      ctx.shadowOffsetX = tokens.shadows === 'hard' ? 3 : 0;
      ctx.shadowOffsetY = tokens.shadows === 'hard' ? 3 : 4;
    }
    roundRect(ctx, dx, demoY, demoW, demoH, r);
    ctx.fillStyle = s === tokens.shape ? primColor : hex2rgba(primColor, 0.18);
    ctx.fill();
    if (tokens.shadows !== 'flat') ctx.restore();
    // Label
    ctx.font = `9px "Geist Sans", sans-serif`;
    ctx.fillStyle = s === tokens.shape ? '#fff' : hex2rgba(darkColor, 0.45);
    ctx.textAlign = 'center';
    ctx.fillText(s === 'veryRounded' ? 'V. Round' : s.charAt(0).toUpperCase() + s.slice(1), dx + demoW / 2, demoY + demoH / 2 + 3);
  }
  ctx.textAlign = 'left';

  // Token pills
  const pillY = demoY + demoH + 24;
  const pillData = [
    `shape: ${tokens.shape}`,
    `shadows: ${tokens.shadows}`,
    `scale: ×${tokens.typography?.scale ?? 1.333}`,
    `spacing: ${tokens.spacing?.base ?? 8}px base`,
    `colors: ${(tokens.colors?.swatches ?? []).length} swatches`,
  ];
  ctx.font = `11px "Geist Mono", monospace`;
  let pillX = RX;
  for (const pill of pillData) {
    const tw = ctx.measureText(pill).width;
    const pw = tw + 18, ph = 22;
    if (pillX + pw > W - 64) break;
    roundRect(ctx, pillX, pillY, pw, ph, 4);
    ctx.fillStyle = hex2rgba(darkColor, 0.07);
    ctx.fill();
    ctx.strokeStyle = hex2rgba(darkColor, 0.12);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = hex2rgba(darkColor, 0.55);
    ctx.fillText(pill, pillX + 9, pillY + 15);
    pillX += pw + 8;
  }

  // ── System name (large) ──
  const nameFont = `bold 72px "${dispFont}", serif`;
  ctx.font = nameFont;
  ctx.fillStyle = darkColor;
  ctx.textAlign = 'left';
  ctx.fillText(sysName, PAL_X, 84);

  // Vibe label next to name
  const nameW = ctx.measureText(sysName).width;
  ctx.font = `11px "Geist Sans", sans-serif`;
  ctx.fillStyle = hex2rgba(primColor, 0.85);
  const swatches = tokens.colors?.swatches ?? [];
  const swatchLabel = swatches.length > 0 ? `${swatches.length} swatches · ${swatches[0].hex}` : 'custom palette';
  ctx.fillText(swatchLabel, PAL_X + nameW + 16, 84);

  // ── Top accent bar ──
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  for (let i = 0; i < palette.length; i++) {
    barGrad.addColorStop(i / (palette.length - 1 || 1), palette[i]?.[500] ?? primColor);
  }
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 5);

  // ── Bottom attribution bar ──
  ctx.fillStyle = hex2rgba(darkColor, 0.06);
  ctx.fillRect(0, H - 48, W, 48);
  ctx.font = `12px "Geist Sans", sans-serif`;
  ctx.fillStyle = hex2rgba(darkColor, 0.4);
  ctx.textAlign = 'left';
  ctx.fillText('Made with Design System Builder', PAL_X, H - 18);
  ctx.textAlign = 'right';
  ctx.fillStyle = hex2rgba(primColor, 0.6);
  ctx.fillText('abhay.design', W - PAL_X, H - 18);

  // ── Preset badge ──
  ctx.font = `bold 10px "Geist Mono", monospace`;
  ctx.textAlign = 'right';
  const preset = (tokens.preset ?? 'custom').toUpperCase();
  const pbw = ctx.measureText(preset).width + 16;
  roundRect(ctx, W - PAL_X - pbw, 20, pbw, 22, 4);
  ctx.fillStyle = hex2rgba(primColor, 0.15);
  ctx.fill();
  ctx.fillStyle = primColor;
  ctx.fillText(preset, W - PAL_X, 36);

  return canvas.toDataURL('image/png');
}

/** Trigger browser download of the share card PNG */
export function downloadShareCard(dataURL, filename = 'design-system.png') {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.click();
}
