/**
 * IsometricCanvas.jsx — "A map of Abhay" hero backdrop
 *
 * Constellation layout:
 *   RIGHT  — landmark identity objects (CN Tower, India Gate) — LARGE
 *   CENTER — professional tools (VR, Laptop, Phone) — MEDIUM
 *   LEFT   — personality items (chai, hat, batman) — SMALL/EDGE
 *
 * Nested group pattern (no transform conflicts):
 *   <g transform="translate(x,y) scale(s)">  ← SVG position + size
 *     <motion.g animate={float} whileHover>  ← Framer Motion float + hover
 *       <DrawingComponent />
 *     </motion.g>
 *   </g>
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Tooltip text ─── */
const ITEMS = {
  'cn-tower':   'Based in Toronto',
  'india-gate': 'Roots in New Delhi',
  'vr-headset': 'Teaching XR & immersive design',
  'laptop':     'Figma, every day',
  'phone':      'Product at its smallest form',
  'chai-cup':   'Chai > coffee, always',
  'football':   'Playing football to reset',
  'luffy-hat':  'One Piece — nakama energy in everything',
  'batman':     'Dark Knight loyalist',
};

/* ─── Tooltip anchor positions (% of container) ─── */
const ANCHORS = {
  'cn-tower':   { x: 76, y: 8  },
  'india-gate': { x: 62, y: 34 },
  'vr-headset': { x: 42, y: 16 },
  'laptop':     { x: 48, y: 38 },
  'phone':      { x: 36, y: 26 },
  'chai-cup':   { x: 26, y: 42 },
  'football':   { x: 80, y: 48 },
  'luffy-hat':  { x: 12, y: 44 },
  'batman':     { x: 4,  y: 30 },
};

/* ─── Constellation layout config ─── */
// opacity: primary=1.0, secondary=0.85, tertiary=0.72, edge=0.55
// scale: large=1.0, medium=0.75, small=0.62, edge=0.50
// motionY: amplitude in px (gentle float up/down)
const OBJECTS = [
  { id: 'cn-tower',   tx: 1115, ty: 450, scale: 1.00, opacity: 1.00, yAmp: 10, dur: 4.2, delay: 0    },
  { id: 'india-gate', tx: 940,  ty: 580, scale: 0.90, opacity: 0.92, yAmp: -8, dur: 3.8, delay: 0.6  },
  { id: 'vr-headset', tx: 650,  ty: 345, scale: 0.78, opacity: 0.85, yAmp: 8,  dur: 3.3, delay: 0.3  },
  { id: 'laptop',     tx: 760,  ty: 565, scale: 0.78, opacity: 0.85, yAmp: -9, dur: 4.5, delay: 0.9  },
  { id: 'phone',      tx: 575,  ty: 465, scale: 0.65, opacity: 0.75, yAmp: 6,  dur: 3.0, delay: 0.2  },
  { id: 'chai-cup',   tx: 455,  ty: 580, scale: 0.65, opacity: 0.72, yAmp: -5, dur: 3.5, delay: 0.7  },
  { id: 'football',   tx: 1240, ty: 615, scale: 0.65, opacity: 0.70, yAmp: 5,  dur: 2.9, delay: 1.1  },
  { id: 'luffy-hat',  tx: 248,  ty: 565, scale: 0.60, opacity: 0.62, yAmp: -4, dur: 3.2, delay: 0.4  },
  { id: 'batman',     tx: 118,  ty: 445, scale: 0.52, opacity: 0.55, yAmp: 3,  dur: 2.6, delay: 0.8  },
];

/* ─── Shared stroke style (visible, not ghost) ─── */
const SP = {
  stroke: 'rgba(26,24,20,0.58)',
  strokeWidth: '1.5',
  fill: 'rgba(26,24,20,0.04)',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
/* slightly stronger fill for closed "face" polygons */
const SPF = { ...SP, fill: 'rgba(26,24,20,0.07)' };

/* ══════════════════════════════════════════════════════
   DRAWINGS  (origin at visual base-center of each object)
══════════════════════════════════════════════════════ */

function CnTower() {
  return (
    <g {...SP}>
      {/* 3 splayed legs */}
      <path d="M -52,0 C -36,-5 -22,-28 -8,-58" />
      <path d="M 52,0 C 36,-5 22,-28 8,-58" />
      <line x1="-52" y1="0" x2="52" y2="0" />
      {/* Shaft */}
      <line x1="-8" y1="-58" x2="-7" y2="-185" />
      <line x1="8"  y1="-58" x2="7"  y2="-185" />
      {/* Shaft segment bands */}
      <line x1="-8" y1="-90"  x2="8" y2="-90"  />
      <line x1="-8" y1="-122" x2="8" y2="-122" />
      <line x1="-8" y1="-152" x2="8" y2="-152" />
      <line x1="-7" y1="-170" x2="7" y2="-170" />
      {/* Pod shoulders */}
      <line x1="-7"  y1="-185" x2="-24" y2="-188" />
      <line x1="7"   y1="-185" x2="24"  y2="-188" />
      {/* Pod body */}
      <line x1="-24" y1="-188" x2="-24" y2="-215" />
      <line x1="24"  y1="-188" x2="24"  y2="-215" />
      {/* Pod top + base lines */}
      <line x1="-24" y1="-215" x2="24" y2="-215" />
      <line x1="-24" y1="-188" x2="24" y2="-188" />
      {/* Pod horizontal detail bands */}
      <line x1="-24" y1="-197" x2="24" y2="-197" />
      <line x1="-24" y1="-205" x2="24" y2="-205" />
      {/* Upper shaft tapers */}
      <line x1="-7"  y1="-215" x2="-24" y2="-215" />
      <line x1="7"   y1="-215" x2="24"  y2="-215" />
      <line x1="-7"  y1="-215" x2="-5"  y2="-252" />
      <line x1="7"   y1="-215" x2="5"   y2="-252" />
      <line x1="-5"  y1="-252" x2="5"   y2="-252" />
      {/* Antenna */}
      <line x1="0" y1="-252" x2="0" y2="-278" />
      <line x1="-5" y1="-265" x2="5" y2="-265" />
    </g>
  );
}

function IndiaGate() {
  return (
    <g {...SP}>
      {/* Left pillar — 2 sides + top */}
      <line x1="-40" y1="0" x2="-40" y2="-105" />
      <line x1="-24" y1="0" x2="-24" y2="-105" />
      <line x1="-40" y1="0"   x2="-24" y2="0"   />
      {/* Right pillar */}
      <line x1="40"  y1="0" x2="40"  y2="-105" />
      <line x1="24"  y1="0" x2="24"  y2="-105" />
      <line x1="24"  y1="0" x2="40"  y2="0"   />
      {/* Horizontal detail bands on pillars */}
      <line x1="-40" y1="-32" x2="-24" y2="-32" />
      <line x1="24"  y1="-32" x2="40"  y2="-32" />
      <line x1="-40" y1="-72" x2="-24" y2="-72" />
      <line x1="24"  y1="-72" x2="40"  y2="-72" />
      {/* Arch */}
      <path d="M -24,-105 Q 0,-140 24,-105" />
      {/* Entablature slab */}
      <path d="M -44,-105 L 44,-105 L 44,-118 L -44,-118 Z" {...SPF} />
      {/* Small ornament top */}
      <path d="M -5,-118 L 0,-130 L 5,-118" />
      {/* INDIA text placeholder (3 small horizontal lines) */}
      <line x1="-10" y1="-90" x2="10" y2="-90" strokeWidth="0.8" />
      <line x1="-8"  y1="-84" x2="8"  y2="-84" strokeWidth="0.8" />
      {/* Base steps */}
      <path d="M -52,-7 L 52,-7 L 52,0 L -52,0 Z" {...SPF} />
      <path d="M -58,-14 L 58,-14 L 58,-7 L -58,-7 Z" {...SPF} />
    </g>
  );
}

function LuffyHat() {
  return (
    <g {...SP}>
      {/* Crown dome */}
      <path d="M -28,0 C -30,-22 -12,-52 0,-54 C 12,-52 30,-22 28,0" />
      {/* Left + right brim */}
      <path d="M -28,0 C -42,2 -58,6 -60,6" />
      <path d="M 28,0 C 42,2 58,6 60,6" />
      {/* Front brim curve */}
      <path d="M -60,6 Q 0,16 60,6" />
      {/* Hat band — 2 curves (represents the red band) */}
      <path d="M -28,0 Q 0,-7 28,0" />
      <path d="M -26,-8 Q 0,-15 26,-8" />
      {/* Subtle brim underside line */}
      <path d="M -58,6 C -30,0 30,0 58,6" strokeWidth="0.8" />
    </g>
  );
}

function VrHeadset() {
  return (
    <g {...SP}>
      {/* Visor body */}
      <path d="M -52,-10 L -46,-64 L 46,-64 L 52,-10 Z" {...SPF} />
      {/* Left lens outer + inner */}
      <circle cx="-17" cy="-40" r="14" />
      <circle cx="-17" cy="-40" r="9"  />
      {/* Right lens outer + inner */}
      <circle cx="17"  cy="-40" r="14" />
      <circle cx="17"  cy="-40" r="9"  />
      {/* Nose bridge */}
      <line x1="-3" y1="-40" x2="3" y2="-40" />
      {/* Side straps */}
      <path d="M -52,-38 C -66,-32 -70,-22 -66,-12" />
      <path d="M 52,-38 C 66,-32 70,-22 66,-12" />
      {/* Top strap */}
      <path d="M -46,-64 C -22,-72 22,-72 46,-64" />
      {/* Foam bottom rim */}
      <path d="M -50,-12 Q 0,-4 50,-12" />
    </g>
  );
}

function ChaiCup() {
  return (
    <g {...SP}>
      {/* Cylinder sides */}
      <line x1="-22" y1="0" x2="-22" y2="-52" />
      <line x1="22"  y1="0" x2="22"  y2="-52" />
      {/* Bottom front arc */}
      <path d="M -22,0 Q 0,10 22,0" />
      {/* Top rim front arc */}
      <path d="M -22,-52 Q 0,-42 22,-52" />
      {/* Top rim back arc (shows interior depth) */}
      <path d="M -22,-52 Q -26,-60 0,-64 Q 26,-60 22,-52" />
      {/* Inner rim */}
      <path d="M -18,-52 Q 0,-44 18,-52" strokeWidth="1" />
      {/* Handle */}
      <path d="M 22,-42 C 36,-42 44,-30 44,-24 C 44,-18 36,-8 22,-8" />
      {/* Saucer / base ellipse */}
      <path d="M -26,0 Q 0,8 26,0" />
      {/* Steam lines (3 wavy) */}
      <path d="M -4,-67 C -7,-72 -4,-77 -7,-82" strokeWidth="1.2" />
      <path d="M 1,-68 C -1,-74 2,-79 0,-85" strokeWidth="1.2" />
      <path d="M 6,-67 C 9,-72 6,-77 9,-82" strokeWidth="1.2" />
    </g>
  );
}

function Batman() {
  return (
    <g>
      <path
        d="M 0,-42
           C -6,-48 -17,-48 -17,-42
           C -28,-39 -34,-28 -29,-22
           C -42,-16 -58,-4 -58,8
           C -46,13 -32,8 -23,2
           C -17,-2 -8,-4 0,-2
           C 8,-4 17,-2 23,2
           C 32,8 46,13 58,8
           C 58,-4 42,-16 29,-22
           C 34,-28 28,-39 17,-42
           C 17,-48 6,-48 0,-42 Z"
        fill="rgba(26,24,20,0.06)"
        stroke="rgba(26,24,20,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Laptop() {
  // Pre-calculated isometric 3-face laptop
  // Base w=55, d=38, h=6 — centered at visual midpoint
  return (
    <g {...SP}>
      {/* Keyboard top face */}
      <polygon points="-7.4,-23.25 40.2,4.25 7.3,23.25 -40.3,-4.25" {...SPF} />
      {/* Front-right panel */}
      <polygon points="-7.4,-17.25 40.2,10.25 40.2,4.25 -7.4,-23.25" />
      {/* Screen panel */}
      <polygon points="-40.3,-4.25 7.3,23.25 7.3,-17.75 -40.3,-46.25" {...SPF} />
      {/* Screen inner bezel */}
      <polygon points="-37.2,-2.5 4.5,20.5 4.5,-15.2 -37.2,-43.5" />
      {/* Trackpad */}
      <polygon points="-2,-5.5 8,-0.5 8,5 -2,9.5" />
      {/* Camera dot */}
      <circle cx="-16.5" cy="-11" r="2.5" />
    </g>
  );
}

function Phone() {
  // Pre-calculated isometric 3-face phone (w=30, d=5, h=72)
  return (
    <g {...SP}>
      {/* Front face */}
      <polygon points="0,0 26,15 26,-57 0,-72" {...SPF} />
      {/* Top face */}
      <polygon points="0,-72 26,-57 21.7,-54.5 -4.3,-69.5" />
      {/* Left face */}
      <polygon points="0,0 -4.3,2.5 -4.3,-69.5 0,-72" />
      {/* Screen inset */}
      <polygon points="3.5,1.5 23,13 23,-54 3.5,-68.5" />
      {/* Camera */}
      <circle cx="13" cy="-65" r="2" />
      {/* Home bar */}
      <line x1="9" y1="7" x2="18" y2="13" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Football() {
  return (
    <g {...SP}>
      {/* Outer oval */}
      <path d="M 0,-46 C 22,-46 36,-28 36,-8 C 36,12 22,28 0,28 C -22,28 -36,12 -36,-8 C -36,-28 -22,-46 0,-46 Z" {...SPF} />
      {/* Vertical seam */}
      <path d="M 0,-45 C 5,-24 5,8 0,27" />
      {/* Cross seams */}
      <path d="M -25,-30 C -8,-18 8,-18 25,-30" />
      <path d="M -30,8 C -12,-2 12,-2 30,8" />
      {/* Stitching accents */}
      <path d="M -17,-38 C -4,-30 4,-30 17,-38" strokeWidth="1" />
      <path d="M -20,20 C -4,13 4,13 20,20" strokeWidth="1" />
    </g>
  );
}

function Tree({ r = 12 }) {
  const cy = -(r + 8);
  return (
    <g stroke="rgba(26,24,20,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <line x1="0" y1="0" x2="0" y2={cy + r} />
      <circle cx="0" cy={cy} r={r} />
    </g>
  );
}

/* ══════════════════════════════════════════════════════
   HERO OBJECT WRAPPER
   Outer: SVG position + scale (attribute)
   Inner: Framer Motion float + hover (CSS)
══════════════════════════════════════════════════════ */
function HeroObj({ cfg, hovered, onEnter, onLeave, children }) {
  const isHov = hovered === cfg.id;
  return (
    <g
      transform={`translate(${cfg.tx},${cfg.ty}) scale(${cfg.scale})`}
      style={{ opacity: cfg.opacity }}
    >
      <motion.g
        animate={{ y: [0, cfg.yAmp, 0] }}
        transition={{
          duration: cfg.dur,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: cfg.delay,
          repeatDelay: 0,
        }}
        whileHover={{ scale: 1.06, y: -10 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          cursor: 'pointer',
          transformBox: 'fill-box',
          transformOrigin: 'center bottom',
          opacity: isHov ? 1 : undefined,
        }}
      >
        {children}
      </motion.g>
    </g>
  );
}

/* Component lookup */
const COMPS = {
  'cn-tower':   CnTower,
  'india-gate': IndiaGate,
  'vr-headset': VrHeadset,
  'laptop':     Laptop,
  'phone':      Phone,
  'chai-cup':   ChaiCup,
  'football':   Football,
  'luffy-hat':  LuffyHat,
  'batman':     Batman,
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function IsometricCanvas({ heroMode = false }) {
  const [hovered, setHovered] = useState(null);

  const containerStyle = heroMode
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 0, overflow: 'hidden', pointerEvents: 'auto' }
    : { width: '100%', background: '#f7f5f0', position: 'relative',
        overflow: 'hidden', borderTop: '1px solid rgba(26,24,20,0.06)' };

  return (
    <div style={containerStyle}>

      {/* Section label — standalone mode only */}
      {!heroMode && (
        <span style={{
          position: 'absolute', top: 24, left: 40, zIndex: 10,
          fontFamily: '"DM Mono", monospace', fontSize: 10,
          color: 'rgba(26,24,20,0.35)', letterSpacing: '0.1em',
          textTransform: 'uppercase', pointerEvents: 'none',
        }}>
          A Bit About Me
        </span>
      )}

      {/* ── SVG Canvas ── */}
      <svg
        viewBox="0 0 1400 700"
        width="100%"
        height={heroMode ? '100%' : '480'}
        preserveAspectRatio="xMidYMax meet"
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="iso-grid-bg" width="48" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 48 12 L 24 24 L 0 12 Z"
              fill="none" stroke="rgba(26,24,20,0.07)" strokeWidth="0.6" />
          </pattern>
        </defs>

        <rect width="1400" height="700" fill="url(#iso-grid-bg)" />

        {/* ── Decorative trees ── */}
        <g transform="translate(148, 590)" style={{ opacity: 0.45 }}><Tree r={11} /></g>
        <g transform="translate(342, 490)" style={{ opacity: 0.40 }}><Tree r={9}  /></g>
        <g transform="translate(510, 590)" style={{ opacity: 0.38 }}><Tree r={13} /></g>
        <g transform="translate(840, 505)" style={{ opacity: 0.42 }}><Tree r={10} /></g>
        <g transform="translate(820, 425)" style={{ opacity: 0.35 }}><Tree r={8}  /></g>
        <g transform="translate(1050, 490)" style={{ opacity: 0.40 }}><Tree r={10} /></g>
        <g transform="translate(1310, 485)" style={{ opacity: 0.38 }}><Tree r={9}  /></g>
        <g transform="translate(1360, 580)" style={{ opacity: 0.32 }}><Tree r={12} /></g>

        {/* ── 9 Hero Objects ── */}
        {OBJECTS.map(cfg => {
          const Comp = COMPS[cfg.id];
          return (
            <HeroObj
              key={cfg.id}
              cfg={cfg}
              hovered={hovered}
              onEnter={() => setHovered(cfg.id)}
              onLeave={() => setHovered(null)}
            >
              <Comp />
            </HeroObj>
          );
        })}
      </svg>

      {/* ── Tooltip Cards ── */}
      <AnimatePresence>
        {hovered && ANCHORS[hovered] && (
          <motion.div
            key={hovered}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              left: `${ANCHORS[hovered].x}%`,
              top:  `${ANCHORS[hovered].y}%`,
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(26,24,20,0.08)',
              borderRadius: 10,
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              minWidth: 190,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <div style={{
              width: 7, height: 7, borderRadius: 4,
              background: '#c8602a', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 13,
              color: 'rgba(26,24,20,0.75)',
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
            }}>
              {ITEMS[hovered]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
