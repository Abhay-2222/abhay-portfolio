/**
 * HeroIllustration.jsx
 * Isometric hero scene — "A bit about me"
 *
 * Architecture mirrors guochen.design:
 *  - Pure inline SVG, viewBox 0 0 1444 720
 *  - White background + #EDEDED isometric grid (clipped)
 *  - Shadow polygons drawn BEFORE each icon (z-order)
 *  - Icons drawn back-to-front by vertical position
 *  - CSS keyframe float animations per icon
 *  - React state tooltip (reads tooltip text, positions above cursor)
 *
 * Style contract (all shapes inline, no CSS classes):
 *  - Regular face:  fill="white" stroke="#B6B6B6" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"
 *  - Detail line:   fill="none" stroke="#B6B6B6" strokeWidth="0.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"
 *  - Hollow shape:  fillRule="evenodd" clipRule="evenodd" + regular face attrs
 *  - Shadow:        fill="#E8E8E8" stroke="none"
 */

import { useState, useCallback, useRef } from 'react';

/* ── Style shorthand objects ─────────────────────────────── */
const S = {
  fill: 'white',
  stroke: '#B6B6B6',
  strokeWidth: 1.5,
  strokeMiterlimit: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
const SD = { ...S, fill: 'none', strokeWidth: 0.5 };          // detail line
const SE = { ...S, fillRule: 'evenodd', clipRule: 'evenodd' }; // hollow / evenodd

/* ── Tooltip labels ─────────────────────────────────────── */
const LABELS = {
  'cn-tower':   'Based in Toronto',
  'india-gate': 'Roots in New Delhi',
  'luffy-hat':  'One Piece – nakama energy in everything',
  'vr-headset': 'Teaching XR & immersive design',
  'chai-cup':   'Chai > coffee, always',
  'batman':     'Dark Knight loyalist',
  'laptop':     'Figma, every day',
  'phone':      'Product at its smallest form',
  'football':   'Playing football to reset',
};

/* ── Scene layout ────────────────────────────────────────── */
// Objects rendered back-to-front (ascending ty)
const SCENE = [
  { id: 'vr-headset', tx: 590,  ty: 355, sc: 0.82, float: 'hi-f-up',   delay: 0.4 },
  { id: 'batman',     tx: 108,  ty: 430, sc: 0.55, float: 'hi-f-up',   delay: 0.9 },
  { id: 'phone',      tx: 520,  ty: 465, sc: 0.70, float: 'hi-f-down', delay: 0.2 },
  { id: 'cn-tower',   tx: 1105, ty: 490, sc: 1.05, float: 'hi-f-up',   delay: 0.0 },
  { id: 'luffy-hat',  tx: 238,  ty: 535, sc: 0.63, float: 'hi-f-down', delay: 0.5 },
  { id: 'india-gate', tx: 870,  ty: 545, sc: 0.92, float: 'hi-f-up',   delay: 0.7 },
  { id: 'chai-cup',   tx: 398,  ty: 555, sc: 0.68, float: 'hi-f-down', delay: 0.3 },
  { id: 'laptop',     tx: 720,  ty: 580, sc: 0.88, float: 'hi-f-up',   delay: 1.0 },
  { id: 'football',   tx: 1228, ty: 612, sc: 0.65, float: 'hi-f-down', delay: 0.6 },
];

/* ══════════════════════════════════════════════════════════
   ISOMETRIC GRID
══════════════════════════════════════════════════════════ */
function Grid() {
  const lines = [];
  // Right-going diagonals (slope +0.5, from top-left to bottom-right)
  for (let x = -1700; x <= 1500; x += 56) {
    lines.push(
      <path key={`r${x}`}
        d={`M${x},-80 L${x + 1600},720`}
        stroke="#EDEDED" strokeWidth="1"
        strokeMiterlimit="1.5" strokeLinecap="round"
        strokeLinejoin="round" fill="none"
      />
    );
  }
  // Left-going diagonals (slope -0.5, from top-right to bottom-left)
  for (let x = -100; x <= 3200; x += 56) {
    lines.push(
      <path key={`l${x}`}
        d={`M${x},-80 L${x - 1600},720`}
        stroke="#EDEDED" strokeWidth="1"
        strokeMiterlimit="1.5" strokeLinecap="round"
        strokeLinejoin="round" fill="none"
      />
    );
  }
  return <>{lines}</>;
}

/* ══════════════════════════════════════════════════════════
   ICON COMPONENTS — all centered at (0, 0), base at y ≈ 0
══════════════════════════════════════════════════════════ */

/* ── CN Tower ─────────────────────────────────────────── */
function CnTower() {
  return (
    <g>
      {/* Ground ellipse */}
      <ellipse cx="0" cy="6" rx="58" ry="15" {...S} />
      {/* 3 splayed legs */}
      <path d="M -14,-22 C -28,-10 -42,-2 -56,6" {...S} />
      <path d="M  14,-22 C  28,-10  42,-2  56,6" {...S} />
      {/* Center foot */}
      <polygon points="-14,6 14,6 14,-22 -14,-22" {...S} />
      {/* Base horizontal bands */}
      <line x1="-14" y1="-8"  x2="14" y2="-8"  {...SD} />
      <line x1="-14" y1="-16" x2="14" y2="-16" {...SD} />
      {/* Main shaft — slight taper */}
      <polygon points="-14,-22 14,-22 10,-162 -10,-162" {...S} />
      {/* Shaft rib bands */}
      <line x1="-13" y1="-55"  x2="13" y2="-55"  {...SD} />
      <line x1="-12" y1="-88"  x2="12" y2="-88"  {...SD} />
      <line x1="-11" y1="-118" x2="11" y2="-118" {...SD} />
      <line x1="-10" y1="-145" x2="10" y2="-145" {...SD} />
      {/* Lower observation pod — 2 disc ellipses + cylinder */}
      <line x1="-30" y1="-162" x2="-30" y2="-185" {...S} />
      <line x1=" 30" y1="-162" x2=" 30" y2="-185" {...S} />
      <ellipse cx="0" cy="-162" rx="30" ry="9" {...S} />
      {/* Pod horizontal bands */}
      <line x1="-30" y1="-171" x2="30" y2="-171" {...SD} />
      <line x1="-30" y1="-179" x2="30" y2="-179" {...SD} />
      <ellipse cx="0" cy="-185" rx="30" ry="9" {...S} />
      {/* Upper shaft */}
      <polygon points="-10,-185 10,-185 7,-212 -7,-212" {...S} />
      <line x1="-9" y1="-198" x2="9" y2="-198" {...SD} />
      {/* Small upper pod */}
      <line x1="-16" y1="-212" x2="-16" y2="-220" {...S} />
      <line x1=" 16" y1="-212" x2=" 16" y2="-220" {...S} />
      <ellipse cx="0" cy="-212" rx="16" ry="5" {...S} />
      <ellipse cx="0" cy="-220" rx="16" ry="5" {...S} />
      {/* Upper taper to antenna */}
      <polygon points="-7,-220 7,-220 4,-242 -4,-242" {...S} />
      {/* Antenna */}
      <line x1="0" y1="-242" x2="0" y2="-285" {...S} />
      {/* Collar rings on antenna */}
      <ellipse cx="0" cy="-252" rx="5"   ry="1.8" {...S} />
      <ellipse cx="0" cy="-263" rx="4"   ry="1.5" {...S} />
      <ellipse cx="0" cy="-274" rx="3"   ry="1.2" {...S} />
    </g>
  );
}

function CnTowerShadow() {
  return (
    <ellipse cx="6" cy="22" rx="58" ry="14"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── India Gate ───────────────────────────────────────── */
function IndiaGate() {
  return (
    <g>
      {/* Base steps */}
      <polygon points="-65,8  65,8  65,-2  -65,-2"  {...S} />
      <polygon points="-55,-2 55,-2 55,-14 -55,-14" {...S} />
      {/* Left pillar */}
      <polygon points="-38,-14 -22,-14 -22,-118 -38,-118" {...S} />
      <line x1="-38" y1="-42"  x2="-22" y2="-42"  {...SD} />
      <line x1="-38" y1="-70"  x2="-22" y2="-70"  {...SD} />
      <line x1="-38" y1="-96"  x2="-22" y2="-96"  {...SD} />
      {/* Left medallion */}
      <circle cx="-30" cy="-82" r="7" {...SE} />
      {/* Right pillar */}
      <polygon points=" 22,-14  38,-14  38,-118  22,-118" {...S} />
      <line x1="22"  y1="-42"  x2="38"  y2="-42"  {...SD} />
      <line x1="22"  y1="-70"  x2="38"  y2="-70"  {...SD} />
      <line x1="22"  y1="-96"  x2="38"  y2="-96"  {...SD} />
      {/* Right medallion */}
      <circle cx="30" cy="-82" r="7" {...SE} />
      {/* Arch opening (evenodd — hollow interior) */}
      <path
        d="M -22,-118 Q 0,-158 22,-118 Z"
        {...SE}
      />
      {/* Entablature slab */}
      <polygon points="-44,-118 44,-118 44,-132 -44,-132" {...S} />
      {/* "INDIA" text plaque */}
      <rect x="-12" y="-130" width="24" height="6" rx="1" {...SD} />
      {/* Pyramid ornament */}
      <polygon points="-6,-132 0,-148 6,-132" {...S} />
      {/* Arch detail line */}
      <path d="M -18,-118 Q 0,-150 18,-118" {...SD} />
    </g>
  );
}

function IndiaGateShadow() {
  return (
    <polygon
      points="75,20 -75,20 -75,12 75,12"
      fill="#E8E8E8" stroke="none"
    />
  );
}

/* ── Luffy Hat ────────────────────────────────────────── */
function LuffyHat() {
  return (
    <g>
      {/* Brim underside arc */}
      <path d="M -68,5 C -35,-1 35,-1 68,5" {...SD} />
      {/* Brim outer edge — droops at ends */}
      <path d="M -68,5 Q -82,9 -80,12" {...S} />
      <path d="M  68,5 Q  82,9  80,12" {...S} />
      {/* Brim front curve */}
      <path d="M -80,12 Q 0,22 80,12" {...S} />
      {/* Brim left + right extensions */}
      <path d="M -28,0 C -44,1 -62,4 -80,12" {...S} />
      <path d="M  28,0 C  44,1  62,4  80,12" {...S} />
      {/* Crown dome */}
      <path d="M -28,0 C -30,-20 -14,-52 0,-55 C 14,-52 30,-20 28,0" {...S} />
      {/* Hat band — 2 wrap lines */}
      <path d="M -27,-4  Q 0,-12  27,-4"  {...SD} />
      <path d="M -25,-12 Q 0,-20  25,-12" {...SD} />
    </g>
  );
}

function LuffyHatShadow() {
  return (
    <ellipse cx="5" cy="18" rx="70" ry="11"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── VR Headset ───────────────────────────────────────── */
function VrHeadset() {
  return (
    <g>
      {/* Main visor body */}
      <polygon points="-52,-8 52,-8 44,-65 -44,-65" {...S} />
      {/* Left lens (hollow evenodd) */}
      <path
        d="M -30,-40 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0
           M -30,-40 m -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0 Z"
        {...SE}
      />
      {/* Right lens (hollow evenodd) */}
      <path
        d="M 30,-40 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0
           M 30,-40 m -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0 Z"
        {...SE}
      />
      {/* Nose bridge */}
      <line x1="-4" y1="-40" x2="4" y2="-40" {...SD} />
      {/* Side strap arms */}
      <path d="M -52,-40 C -66,-33 -70,-20 -66,-10" {...S} />
      <path d="M  52,-40 C  66,-33  70,-20  66,-10" {...S} />
      {/* Top strap */}
      <path d="M -44,-65 C -22,-76 22,-76 44,-65" {...S} />
      {/* Foam bottom rim */}
      <path d="M -50,-9 Q 0,0 50,-9" {...SD} />
      {/* Upper surface detail */}
      <line x1="-40" y1="-64" x2="40" y2="-64" {...SD} />
    </g>
  );
}

function VrHeadsetShadow() {
  return (
    <ellipse cx="5" cy="5" rx="52" ry="10"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── Chai Cup ─────────────────────────────────────────── */
function ChaiCup() {
  return (
    <g>
      {/* Saucer */}
      <path d="M -28,8 Q 0,18 28,8" {...S} />
      {/* Cup bottom ellipse */}
      <ellipse cx="0" cy="4" rx="22" ry="7" {...S} />
      {/* Cup sides */}
      <line x1="-22" y1="4"  x2="-22" y2="-52" {...S} />
      <line x1=" 22" y1="4"  x2=" 22" y2="-52" {...S} />
      {/* Interior depth ellipse */}
      <ellipse cx="0" cy="-52" rx="18" ry="5.5" {...SE} />
      {/* Top rim back arc */}
      <path d="M -22,-52 Q -26,-60 0,-64 Q 26,-60 22,-52" {...S} />
      {/* Top rim front arc */}
      <ellipse cx="0" cy="-52" rx="22" ry="7" {...S} />
      {/* Handle */}
      <path d="M 22,-42 C 40,-42 48,-30 48,-24 C 48,-18 40,-8 22,-8" {...S} />
      {/* Steam lines */}
      <path d="M -4,-68 C -7,-75 -4,-82 -7,-88"  {...SD} />
      <path d="M  1,-70 C -1,-77  2,-84  0,-91"  {...SD} />
      <path d="M  6,-68 C  9,-75  6,-82  9,-88"  {...SD} />
    </g>
  );
}

function ChaiCupShadow() {
  return (
    <ellipse cx="6" cy="20" rx="32" ry="9"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── Batman ───────────────────────────────────────────── */
function Batman() {
  return (
    <g>
      {/* Bat silhouette with eye cutouts */}
      <path
        d="M 0,-48
           C -6,-54 -20,-54 -20,-46
           C -33,-42 -40,-30 -33,-24
           C -48,-16 -64,-4 -62,10
           C -48,16 -34,10 -25,4
           C -18,0 -10,-3 0,-2
           C 10,-3 18,0 25,4
           C 34,10 48,16 62,10
           C 64,-4 48,-16 33,-24
           C 40,-30 33,-42 20,-46
           C 20,-54 6,-54 0,-48 Z
           M -14,-30 C -18,-36 -24,-32 -20,-27 C -16,-22 -10,-26 -14,-30 Z
           M  14,-30 C  18,-36  24,-32  20,-27 C  16,-22  10,-26  14,-30 Z"
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        stroke="#B6B6B6"
        strokeWidth="1.5"
        strokeMiterlimit="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wing membrane detail lines */}
      <path d="M -20,-46 C -36,-32 -48,-16 -62,10" {...SD} />
      <path d="M  20,-46 C  36,-32  48,-16  62,10" {...SD} />
    </g>
  );
}

function BatmanShadow() {
  return (
    <ellipse cx="4" cy="16" rx="56" ry="9"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── Laptop ───────────────────────────────────────────── */
function Laptop() {
  // Base: w=80, d=52, h=7 — isometric box
  // Right unit: (1, 0.5), Back unit: (-1, 0.5), Up unit: (0,-1)
  // Front-left A=(0,0), Front-right B=(80,40), Back-right C=(28,66), Back-left D=(-52,26)
  // Centered: offset (-14, -33)
  // A=(-14,-33) B=(66,7) C=(14,33) D=(-66,-7)
  // Top: A'=(-14,-40) B'=(66,0) C'=(14,26) D'=(-66,-14)
  // Top face: A' B' C' D'
  // Front face: A B B' A'
  // Right face: B C C' B'
  //
  // Screen (lid open ~105°, hinged at D'A', leaning forward-up):
  // Screen bottom = D'A' = (-66,-14) to (-14,-40)
  // Screen rises in z and leans slightly forward (+x direction)
  // Screen height ~55 in z, tilt gives +12 in x direction
  // Screen top-left: D' + (12,-55) = (-54,-69)
  // Screen top-right: A' + (12,-55) = (-2,-95)
  // Screen face: D' A' A'_top D'_top = (-66,-14) (-14,-40) (-2,-95) (-54,-69)
  return (
    <g>
      {/* ── Base unit ── */}
      {/* Top face (keyboard surface) */}
      <polygon points="-14,-40 66,0 14,26 -66,-14" {...S} />
      {/* Front face (thin edge strip) */}
      <polygon points="-66,-14 14,26 14,33 -66,-7" {...S} />
      {/* Right face (thin edge strip) */}
      <polygon points="66,0 14,26 14,33 66,7" {...S} />

      {/* Keyboard rows (detail lines on top face) */}
      <line x1="-48" y1="-24" x2="36" y2="16"  {...SD} />
      <line x1="-42" y1="-18" x2="42" y2="22"  {...SD} />
      <line x1="-36" y1="-12" x2="48" y2="28"  {...SD} />

      {/* Trackpad */}
      <polygon points="-6,-18 16,-8 16,-1 -6,-11" {...S} />

      {/* ── Screen lid ── */}
      {/* Screen back face (outer panel) */}
      <polygon points="-66,-14 -14,-40 -2,-95 -54,-69" {...S} />
      {/* Screen face (inner display) */}
      <polygon points="-62,-16 -18,-38 -7,-88 -51,-66" {...S} />
      {/* Bezel detail */}
      <polygon points="-59,-18 -21,-37 -11,-84 -49,-65" {...SD} />
      {/* Camera dot */}
      <circle cx="-35" cy="-65" r="2" {...S} />
      {/* Screen hinge line */}
      <line x1="-66" y1="-14" x2="-14" y2="-40" {...SD} />
    </g>
  );
}

function LaptopShadow() {
  return (
    <polygon
      points="-70,-5 70,38 76,50 -64,7"
      fill="#E8E8E8" stroke="none"
    />
  );
}

/* ── Phone ────────────────────────────────────────────── */
function Phone() {
  // Tall isometric box: w=32, d=6, h=72
  // Front-left A=(0,0), Front-right B=(32,16), Back-right C=(26,19), Back-left D=(-6,3)
  // Centered: offset (-13, -9.5) → rounded to (-13,-10)
  // A=(-13,-10) B=(19,6) C=(13,9) D=(-19,-7)
  // At h=72: A'=(-13,-82) B'=(19,-66) C'=(13,-63) D'=(-19,-79)
  return (
    <g>
      {/* Front face */}
      <polygon points="-13,-10 19,6 19,-66 -13,-82" {...S} />
      {/* Top face */}
      <polygon points="-13,-82 19,-66 13,-63 -19,-79" {...S} />
      {/* Left face */}
      <polygon points="-13,-10 -19,-7 -19,-79 -13,-82" {...S} />

      {/* Screen inset (front face inner) */}
      <polygon points="-10,-14 16,2 16,-62 -10,-78" {...S} />

      {/* Camera dot */}
      <circle cx="3" cy="-74" r="1.8" {...S} />
      {/* Speaker slot */}
      <rect x="-3" y="-71" width="10" height="3" rx="1.5" {...SD} />
      {/* Home bar */}
      <rect x="1" y="-3" width="12" height="2.5" rx="1.2" {...SD} />
      {/* Side button bumps */}
      <rect x="-20" y="-58" width="2" height="7" rx="1" {...S} />
      <rect x="-20" y="-48" width="2" height="10" rx="1" {...S} />
    </g>
  );
}

function PhoneShadow() {
  return (
    <ellipse cx="4" cy="14" rx="24" ry="7"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── Football ─────────────────────────────────────────── */
function Football() {
  return (
    <g>
      {/* Outer oval */}
      <path
        d="M 0,-46 C 24,-46 38,-28 38,-8 C 38,12 24,28 0,28 C -24,28 -38,12 -38,-8 C -38,-28 -24,-46 0,-46 Z"
        {...S}
      />
      {/* Panel curve lines */}
      <path d="M -24,-34 C -8,-26 8,-26 24,-34" {...SD} />
      <path d="M -30,12 C -10,2 10,2 30,12"   {...SD} />
      {/* Vertical seam */}
      <path d="M 0,-45 C 4,-24 4,8 0,27" {...S} />
      {/* Lace lines */}
      <path d="M -12,-20 C -4,-12 4,-12 12,-20" {...S} />
      <path d="M -14,-6  C -4,2 4,2 14,-6"    {...S} />
      {/* Stitch marks */}
      <line x1="-3" y1="-25" x2="3" y2="-25" {...SD} />
      <line x1="-3" y1="-18" x2="3" y2="-18" {...SD} />
      <line x1="-3" y1="-11" x2="3" y2="-11" {...SD} />
      <line x1="-3" y1="-4"  x2="3" y2="-4"  {...SD} />
    </g>
  );
}

function FootballShadow() {
  return (
    <ellipse cx="5" cy="32" rx="36" ry="10"
      fill="#E8E8E8" stroke="none" />
  );
}

/* ── Component map ───────────────────────────────────── */
const ICONS = {
  'cn-tower':   { Icon: CnTower,   Shadow: CnTowerShadow   },
  'india-gate': { Icon: IndiaGate, Shadow: IndiaGateShadow },
  'luffy-hat':  { Icon: LuffyHat,  Shadow: LuffyHatShadow  },
  'vr-headset': { Icon: VrHeadset, Shadow: VrHeadsetShadow },
  'chai-cup':   { Icon: ChaiCup,   Shadow: ChaiCupShadow   },
  'batman':     { Icon: Batman,    Shadow: BatmanShadow     },
  'laptop':     { Icon: Laptop,    Shadow: LaptopShadow     },
  'phone':      { Icon: Phone,     Shadow: PhoneShadow      },
  'football':   { Icon: Football,  Shadow: FootballShadow   },
};

/* ══════════════════════════════════════════════════════════
   CSS ANIMATIONS (injected once)
══════════════════════════════════════════════════════════ */
const ANIM_CSS = `
  @keyframes hi-f-up {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes hi-f-down {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(10px); }
  }
  .hi-icon {
    cursor: pointer;
    transition: filter 0.25s ease;
  }
  .hi-icon:hover {
    filter: drop-shadow(0 6px 16px rgba(0,0,0,0.14));
  }
`;

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function HeroIllustration() {
  const [tooltip, setTooltip] = useState(null); // { id, x, y }
  const svgRef = useRef(null);

  const handleEnter = useCallback((e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    setTooltip({
      id,
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top - svgRect.top - 14,
    });
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  return (
    <div style={{
      width: '100%',
      background: 'white',
      position: 'relative',
      borderTop: '1px solid #F0EEEA',
      overflow: 'hidden',
    }}>
      <style>{ANIM_CSS}</style>

      {/* Section label */}
      <span style={{
        position: 'absolute', top: 20, left: 36, zIndex: 10,
        fontFamily: '"DM Mono", monospace', fontSize: 10,
        color: 'rgba(26,24,20,0.35)', letterSpacing: '0.1em',
        textTransform: 'uppercase', pointerEvents: 'none',
        userSelect: 'none',
      }}>
        A Bit About Me
      </span>

      {/* ── SVG Scene ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 1444 720"
        width="100%"
        style={{ display: 'block', height: 'clamp(300px, 20vw + 240px, 520px)' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="hi-grid-clip">
            <rect width="1444" height="720" />
          </clipPath>
        </defs>

        {/* White background */}
        <rect width="1444" height="720" fill="white" />

        {/* Isometric grid (clipped) */}
        <g id="grid-base" clipPath="url(#hi-grid-clip)">
          <Grid />
        </g>

        {/* Icons: shadows first, then icons — back-to-front order */}
        {SCENE.map(({ id, tx, ty, sc, float: anim, delay }) => {
          const { Icon, Shadow } = ICONS[id];
          return (
            <g key={id} transform={`translate(${tx},${ty}) scale(${sc})`}>
              {/* Shadow */}
              <Shadow />
              {/* Icon with float animation */}
              <g
                id={id}
                className="hi-icon"
                style={{
                  animation: `${anim} ${3.2 + delay}s ${delay}s ease-in-out infinite`,
                  transformOrigin: 'center bottom',
                  transformBox: 'fill-box',
                }}
                onMouseEnter={e => handleEnter(e, id)}
                onMouseLeave={handleLeave}
              >
                <Icon />
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── Tooltip card ── */}
      {tooltip && (
        <div
          key={tooltip.id}
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'white',
            border: '1px solid rgba(26,24,20,0.08)',
            borderRadius: 8,
            padding: '8px 13px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            pointerEvents: 'none',
            zIndex: 30,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div style={{
            width: 6, height: 6, borderRadius: 3,
            background: '#c8602a', flexShrink: 0,
          }} />
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 12.5,
            color: 'rgba(26,24,20,0.72)',
            lineHeight: 1.3,
          }}>
            {LABELS[tooltip.id]}
          </span>
        </div>
      )}
    </div>
  );
}
