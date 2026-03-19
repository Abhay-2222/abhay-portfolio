/**
 * HeroScatter.jsx
 * Desktop: explicit pctX/pctY positions, hover image on mouseenter.
 * Mobile:  equal-spaced 2-row grid, tap scales image + shows label pill.
 */
import { useState, useEffect } from 'react';
import { HERO_IMAGES } from '../data/heroImages.js';

const STEP   = 44;
const HERO_W = 1440;
const HERO_H = 540;
const IMG_W  = 182;

/* Auto-layout fallback zones (desktop only) */
const SPREAD_W = 860, SPREAD_H = 400;
const SPREAD_X = (HERO_W - SPREAD_W) / 2;
const SPREAD_Y = (HERO_H - SPREAD_H) / 2;
const COLS = 3, ROWS = 2;
const AUTO_ZONES = [
  { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
];
const ZONE_W = SPREAD_W / COLS;
const ZONE_H = SPREAD_H / ROWS;

function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function snapToIso(px, py) {
  return { x: Math.round(px / STEP) * STEP, y: Math.round((py * 2) / STEP) * STEP / 2 };
}

/* Mobile grid: 3 top (row 1), 4 bottom (row 2)
   row 1 images are larger; row 2 smaller to fit 4 across.
   Sizes are dynamic: 27vw capped at 110px (row 1), 22vw capped at 85px (row 2). */
const MOBILE_POSITIONS = [
  { pctX: 17, pctY: 36, row: 1 },
  { pctX: 50, pctY: 36, row: 1 },
  { pctX: 83, pctY: 36, row: 1 },
  { pctX: 12, pctY: 65, row: 2 },
  { pctX: 37, pctY: 65, row: 2 },
  { pctX: 63, pctY: 65, row: 2 },
  { pctX: 88, pctY: 65, row: 2 },
];

export default function HeroScatter() {
  const [activeIdx, setActiveIdx] = useState(null);

  /* Reactive mobile detection — updates on orientation change / resize */
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  const [mobileVW, setMobileVW] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth : 375,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => {
      setIsMobile(mq.matches);
      setMobileVW(window.innerWidth);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!HERO_IMAGES.length) return null;

  /* Per-row dynamic sizes — scale with vw so they fit 320px→428px */
  const mobileRow1Size = Math.min(110, Math.floor(mobileVW * 0.27));
  const mobileRow2Size = Math.min(85,  Math.floor(mobileVW * 0.22));

  /* Desktop scale for tablet */
  const vw    = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const scale = Math.min(1, Math.max(0.55, vw / 1440));

  const items = HERO_IMAGES.map((entry, i) => {
    const src         = typeof entry === 'string' ? entry : entry.file;
    const fixRot      = typeof entry === 'object' && entry.rotation != null ? entry.rotation : null;
    const size        = (typeof entry === 'object' && entry.size) ? entry.size : IMG_W;
    const hoverImage  = (typeof entry === 'object' && entry.hoverImage)  ? entry.hoverImage  : null;
    const hoverVideo  = (typeof entry === 'object' && entry.hoverVideo)  ? entry.hoverVideo  : null;
    const mobileLabel = (typeof entry === 'object' && entry.mobileLabel) ? entry.mobileLabel : null;

    let pctX, pctY, finalSize, rotation;

    if (isMobile) {
      const pos = MOBILE_POSITIONS[i] ?? MOBILE_POSITIONS[MOBILE_POSITIONS.length - 1];
      pctX      = pos.pctX;
      pctY      = pos.pctY;
      finalSize = pos.row === 1 ? mobileRow1Size : mobileRow2Size;
      rotation  = 0;
    } else {
      let rawX, rawY;
      if (typeof entry === 'object' && entry.pctX != null) {
        rawX = (entry.pctX / 100) * HERO_W;
        rawY = (entry.pctY / 100) * HERO_H;
      } else {
        const zone = AUTO_ZONES[i % AUTO_ZONES.length];
        const padX = ZONE_W * 0.18, padY = ZONE_H * 0.18;
        rawX = SPREAD_X + zone.col * ZONE_W + padX + rand(i * 7)     * (ZONE_W - padX * 2);
        rawY = SPREAD_Y + zone.row * ZONE_H + padY + rand(i * 7 + 1) * (ZONE_H - padY * 2);
      }
      const snapped = snapToIso(rawX, rawY);
      pctX      = (snapped.x / HERO_W) * 100;
      pctY      = (snapped.y / HERO_H) * 100;
      finalSize = Math.round(size * scale);
      rotation  = fixRot ?? (rand(i * 7 + 2) - 0.5) * 18;
    }

    return { key: i, src: `/hero/${encodeURIComponent(src)}`, hoverSrc: hoverImage ? `/hero/${encodeURIComponent(hoverImage)}` : null, hoverVideo: hoverVideo ?? null, mobileLabel, pctX, pctY, size: finalSize, rotation };
  });

  return (
    <div
      aria-hidden="true"
      className="hero-scatter"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {items.map(({ key, src, hoverSrc, hoverVideo, mobileLabel, pctX, pctY, size, rotation }) => {
        const isActive = activeIdx === key;
        return (
          <div
            key={key}
            style={{
              position:      'absolute',
              left:          `${pctX}%`,
              top:           `${pctY}%`,
              transform:     'translate(-50%, -50%)',
              width:          size,
              pointerEvents: 'auto',
            }}
          >
            {/* Desktop: hover image */}
            {!isMobile && hoverSrc && (
              <img
                src={hoverSrc}
                alt=""
                draggable={false}
                style={{
                  position:   'absolute',
                  bottom:     '90%',
                  left:       '50%',
                  transform:  `translateX(-50%) translateY(${isActive ? 0 : 8}px)`,
                  width:      Math.max(size * 0.85, 260),
                  height:     'auto',
                  opacity:    isActive ? 1 : 0,
                  transition: 'opacity 0.22s ease, transform 0.22s ease',
                  pointerEvents: 'none',
                  zIndex:     10,
                  filter:     'drop-shadow(0 6px 16px rgba(0,0,0,0.12))',
                }}
              />
            )}

            {/* Desktop: hover video card (replaces hoverImage when hoverVideo is set) */}
            {!isMobile && hoverVideo && (
              <div style={{
                position:   'absolute',
                bottom:     'calc(100% + 10px)',
                left:       '50%',
                transform:  `translateX(-50%) translateY(${isActive ? 0 : 8}px)`,
                opacity:    isActive ? 1 : 0,
                transition: 'opacity 0.22s ease, transform 0.22s ease',
                pointerEvents: 'none',
                zIndex:     10,
                width:      220,
                background: '#0a0a0a',
                borderRadius: 12,
                overflow:   'hidden',
                boxShadow:  '0 12px 40px rgba(0,0,0,0.28)',
                border:     '1px solid rgba(255,255,255,0.08)',
              }}>
                {isActive && (
                  <video
                    src={hoverVideo}
                    autoPlay muted loop playsInline
                    style={{ width: '100%', display: 'block', maxHeight: 130, objectFit: 'cover' }}
                  />
                )}
                <div style={{
                  padding: '7px 11px',
                  display: 'flex', alignItems: 'center', gap: 7,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: '#c8602a', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 11, color: 'rgba(255,255,255,0.55)',
                    whiteSpace: 'nowrap',
                  }}>Unreal Engine explorer</span>
                </div>
              </div>
            )}

            {/* Mobile: label pill on tap */}
            {isMobile && mobileLabel && (
              <div
                style={{
                  position:   'absolute',
                  bottom:     'calc(100% + 6px)',
                  left:       '50%',
                  transform:  `translateX(-50%) translateY(${isActive ? 0 : 6}px)`,
                  opacity:    isActive ? 1 : 0,
                  transition: 'opacity 0.18s ease, transform 0.18s ease',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize:   12,
                  fontWeight: 600,
                  color:      'rgba(26,24,20,0.85)',
                  background: 'rgba(255,255,255,0.96)',
                  border:     '1px solid rgba(0,0,0,0.09)',
                  borderRadius: 20,
                  padding:    '4px 11px',
                  zIndex:     10,
                  backdropFilter: 'blur(12px)',
                  boxShadow:  '0 2px 10px rgba(0,0,0,0.08)',
                }}
              >
                {mobileLabel}
              </div>
            )}

            {/* Main image */}
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width:      '100%',
                height:     'auto',
                transform:  isMobile
                  ? `scale(${isActive ? 1.14 : 1})`
                  : `rotate(${rotation}deg)`,
                filter:     isMobile && isActive
                  ? 'drop-shadow(0 8px 22px rgba(0,0,0,0.18))'
                  : 'drop-shadow(0 4px 14px rgba(0,0,0,0.10))',
                userSelect: 'none',
                transition: 'transform 0.22s ease, filter 0.22s ease',
                display:    'block',
              }}
              onMouseEnter={e => {
                if (isMobile) return;
                setActiveIdx(key);
                e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1.08)`;
                e.currentTarget.style.filter    = 'drop-shadow(0 10px 24px rgba(0,0,0,0.16))';
              }}
              onMouseLeave={e => {
                if (isMobile) return;
                setActiveIdx(null);
                e.currentTarget.style.transform = `rotate(${rotation}deg)`;
                e.currentTarget.style.filter    = 'drop-shadow(0 4px 14px rgba(0,0,0,0.10))';
              }}
              onTouchStart={e => {
                e.stopPropagation();
                setActiveIdx(activeIdx === key ? null : key);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
