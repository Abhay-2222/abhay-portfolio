/**
 * FishingScene.jsx
 * Three-layer fishing scene:
 *   Layer 1 (WebGL) — water plane lives in Desktop.jsx canvas behind this
 *   Layer 2 (SVG)   — outlined character + environment, viewBox 0 0 700 420
 *   Layer 3 (GSAP)  — animations wired in this component's useEffect
 *
 * Class groups exposed for GSAP / future targeting:
 *   .bg-layer  .sun-layer  .cloud-left  .cloud-right  .reeds  .rocks
 *   .grass-tufts  .flowers  .pond-surface  .stool  .bucket
 *   .figure-group  .rod-group  .bobber-group
 */

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── sun ray helper ─── */
function SunRay({ angle }) {
  const rad = (angle * Math.PI) / 180;
  return (
    <line
      x1={350 + Math.cos(rad) * 30}
      y1={ 62 + Math.sin(rad) * 30}
      x2={350 + Math.cos(rad) * 40}
      y2={ 62 + Math.sin(rad) * 40}
      stroke="rgba(0,0,0,0.10)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}

/* ─── flower petal helper ─── */
function Petals({ cx, cy, count, r, rx = 5, ry = 3, stroke = 'rgba(0,0,0,0.10)' }) {
  return Array.from({ length: count }, (_, i) => {
    const a   = (360 / count) * i;
    const rad = (a * Math.PI) / 180;
    const px  = cx + Math.cos(rad) * r;
    const py  = cy + Math.sin(rad) * r;
    return (
      <ellipse
        key={i}
        cx={px} cy={py}
        rx={rx} ry={ry}
        transform={`rotate(${a}, ${px}, ${py})`}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />
    );
  });
}

export default function FishingScene({ hoveredProject, waterSceneRef }) {
  const sceneRef     = useRef(null);
  const [biteActive, setBiteActive] = useState(false);
  const biteTimer    = useRef(null);

  /* ── GSAP orchestration ── */
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const sel = (cls) => el.querySelector(cls);
    const figure  = sel('.figure-group');
    const rod     = sel('.rod-group');
    const bobber  = sel('.bobber-group');
    const cloudL  = sel('.cloud-left');
    const cloudR  = sel('.cloud-right');
    const reeds   = sel('.reeds');

    /* 1 — idle breathing */
    gsap.to(figure, {
      y: -2, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });

    /* 2 — rod gentle flex  (svgOrigin = grip point in SVG coords) */
    gsap.to(rod, {
      rotation: 1.2, svgOrigin: '455 218',
      duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });

    /* 3 — bobber bob */
    gsap.to(bobber, {
      y: 5, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });

    /* 4 — cloud drift */
    gsap.to(cloudL, { x:  10, duration: 14, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to(cloudR, { x:  -8, duration: 18, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    /* 5 — reed sway (wind) */
    gsap.to(reeds, {
      rotation: 1, svgOrigin: '68 262',
      duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });

    /* 6 — scroll-reactive rod bend + bobber depth */
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate(self) {
        gsap.to(rod, {
          rotation: 1.2 + self.progress * 3, svgOrigin: '455 218',
          duration: 0.3, overwrite: 'auto',
        });
        gsap.to(bobber, {
          y: 5 + self.progress * 6, duration: 0.3, overwrite: 'auto',
        });
        if (waterSceneRef?.current) {
          waterSceneRef.current.setScrollProgress(self.progress);
        }
      },
    });

    /* 7 — rare fish-bite event */
    let biting = false;

    function triggerBite() {
      if (biting) return;
      biting = true;
      setBiteActive(true);
      setTimeout(() => { setBiteActive(false); biting = false; }, 3000);

      gsap.to(rod, {
        rotation: 7, svgOrigin: '455 218',
        duration: 0.28, ease: 'power2.in',
        yoyo: true, repeat: 3,
        onComplete: () =>
          gsap.to(rod, {
            rotation: 1.2, svgOrigin: '455 218',
            duration: 0.85, ease: 'elastic.out(1,0.5)',
          }),
      });

      gsap.to(bobber, {
        y: 20, duration: 0.22, ease: 'power2.in',
        yoyo: true, repeat: 2,
        onComplete: () =>
          gsap.to(bobber, { y: 5, duration: 1, ease: 'bounce.out' }),
      });

      if (waterSceneRef?.current) waterSceneRef.current.triggerBite();
    }

    function schedule() {
      const delay = 20000 + Math.random() * 10000;
      biteTimer.current = setTimeout(() => { triggerBite(); schedule(); }, delay);
    }
    schedule();

    return () => {
      clearTimeout(biteTimer.current);
      st.kill();
    };
  }, []); // eslint-disable-line

  /* ── dock-hover fade ── */
  useEffect(() => {
    if (!sceneRef.current) return;
    gsap.to(sceneRef.current, { opacity: hoveredProject ? 0 : 1, duration: 0.3 });
  }, [hoveredProject]);

  /* ────────────────────────────────────────────────
     SVG — viewBox 0 0 700 420
     Figure sits at ~70 % from left, facing left.
     Pond fills left ~55 % of scene.
     Rod grip: (455, 218) → tip: (178, 148)
     Bobber: line drops from tip to (178, 274)
  ──────────────────────────────────────────────── */
  return (
    <div ref={sceneRef} className="fishing-scene" aria-hidden="true">
      <svg
        viewBox="0 0 700 420"
        width="700"
        height="420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ══════════════════ BACKGROUND LAYER ══════════════════ */}
        <g className="bg-layer">

          {/* Rolling hills */}
          <path
            d="M0 218 Q80 175 200 202 Q320 182 420 210 Q510 175 615 200 Q658 210 700 196"
            stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" strokeLinecap="round"
          />
          <path
            d="M0 228 Q100 195 220 215 Q340 195 440 220 Q530 196 650 212 Q675 217 700 208"
            stroke="rgba(0,0,0,0.05)" strokeWidth="1.5" strokeLinecap="round"
          />

          {/* Background shrub row — far shore of pond */}
          <path
            d="M118 218 Q130 207 142 218 Q154 207 166 218 Q178 207 190 218 Q202 207 216 218"
            fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" strokeLinecap="round"
          />
          <path
            d="M218 214 Q232 203 246 214 Q260 203 275 214 Q290 203 306 214"
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" strokeLinecap="round"
          />

          {/* ── Pine tree 1 — tall, far left ── */}
          <polygon points="28,202 56,124 84,202"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinejoin="round"/>
          <polygon points="33,170 56,100 79,170"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinejoin="round"/>
          <polygon points="39,142 56,86 73,142"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinejoin="round"/>
          <polygon points="44,118 56,74 68,118"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinejoin="round"/>
          <rect x="52" y="202" width="8" height="24"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>

          {/* ── Pine tree 2 — smaller, right of pine 1 ── */}
          <polygon points="94,202 114,150 134,202"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinejoin="round"/>
          <polygon points="98,175 114,130 130,175"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinejoin="round"/>
          <polygon points="102,155 114,114 126,155"
            fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinejoin="round"/>
          <rect x="110" y="202" width="8" height="18"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>

          {/* ── Round oak tree — far right ── */}
          {/* Main canopy blob */}
          <circle cx="628" cy="172" r="42"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          {/* Sub-clusters for leaf texture */}
          <circle cx="608" cy="180" r="24"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
          <circle cx="645" cy="178" r="22"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
          <circle cx="628" cy="158" r="18"
            fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5"/>
          <circle cx="614" cy="162" r="12"
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
          <circle cx="642" cy="163" r="12"
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
          {/* Trunk */}
          <rect x="624" y="214" width="8" height="30"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
        </g>

        {/* ══════════════════ SUN ══════════════════ */}
        <g className="sun-layer">
          <circle cx="350" cy="62" r="24"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
          {[0,45,90,135,180,225,270,315].map(a => <SunRay key={a} angle={a} />)}
        </g>

        {/* Small birds top-right */}
        <g stroke="rgba(0,0,0,0.08)" strokeWidth="1.2" strokeLinecap="round" fill="none">
          <path d="M572 76 Q576 71 580 76"/>
          <path d="M586 70 Q590 65 594 70"/>
          <path d="M600 74 Q604 69 608 74"/>
        </g>

        {/* ══════════════════ CLOUDS ══════════════════ */}
        <g className="cloud-left">
          <ellipse cx="122" cy="47" rx="34" ry="15"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          <ellipse cx="100" cy="53" rx="22" ry="13"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          <ellipse cx="146" cy="53" rx="23" ry="12"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          <ellipse cx="124" cy="58" rx="32" ry="11"
            fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="1.5"/>
        </g>

        <g className="cloud-right">
          <ellipse cx="558" cy="44" rx="38" ry="15"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
          <ellipse cx="534" cy="51" rx="24" ry="13"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
          <ellipse cx="582" cy="51" rx="25" ry="12"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"/>
          <ellipse cx="558" cy="57" rx="34" ry="10"
            fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5"/>
        </g>

        {/* ══════════════════ REEDS / CATTAILS ══════════════════ */}
        <g className="reeds">
          {/* Stalk 1 */}
          <line x1="52" y1="262" x2="48" y2="218"
            stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="48" cy="215" rx="4.5" ry="11"
            fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
          {/* Leaf */}
          <path d="M50 238 Q40 231 36 240"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Stalk 2 */}
          <line x1="68" y1="260" x2="64" y2="222"
            stroke="rgba(0,0,0,0.13)" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="64" cy="219" rx="4" ry="10"
            fill="rgba(0,0,0,0.10)" stroke="rgba(0,0,0,0.13)" strokeWidth="1"/>
          {/* Leaf */}
          <path d="M66 244 Q78 237 82 246"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Stalk 3 (shorter) */}
          <line x1="82" y1="262" x2="79" y2="230"
            stroke="rgba(0,0,0,0.11)" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="79" cy="228" rx="3" ry="8"
            fill="rgba(0,0,0,0.08)" stroke="rgba(0,0,0,0.11)" strokeWidth="1"/>

          {/* Spare grass blades near reeds */}
          <path d="M58 263 Q55 252 53 262"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M90 262 Q88 250 87 261"
            fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinecap="round"/>
        </g>

        {/* ══════════════════ ROCKS ══════════════════ */}
        <g className="rocks">
          <ellipse cx="96"  cy="265" rx="18" ry="10"
            fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
          <ellipse cx="120" cy="268" rx="13" ry="8"
            fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          <ellipse cx="142" cy="266" rx="15" ry="9"
            fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.11)" strokeWidth="1.5"/>
          <ellipse cx="108" cy="273" rx="9"  ry="5"
            fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
          {/* Center-pond rocks on far shore */}
          <ellipse cx="298" cy="268" rx="11" ry="6"
            fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
          <ellipse cx="318" cy="272" rx="8"  ry="5"
            fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
          <ellipse cx="334" cy="268" rx="10" ry="6"
            fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
        </g>

        {/* ══════════════════ GRASS TUFTS ══════════════════ */}
        <g className="grass-tufts" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* Left of pond */}
          <path d="M30 288 Q28 276 26 286"/>
          <path d="M35 286 Q34 274 32 284"/>
          {/* Right pond edge */}
          <path d="M400 280 Q398 269 396 279"/>
          <path d="M405 282 Q403 270 401 281"/>
          {/* Mid ground */}
          <path d="M162 265 Q160 254 158 264"/>
          <path d="M168 266 Q167 254 165 265"/>
          {/* Near stool / figure ground */}
          <path d="M432 280 Q430 269 428 279"/>
          <path d="M438 281 Q436 270 434 280"/>
          {/* Bottom center */}
          <path d="M352 312 Q350 301 348 311"/>
          <path d="M358 314 Q357 302 355 313"/>
          <path d="M364 312 Q362 300 360 311"/>
          {/* Right side cluster */}
          <path d="M558 312 Q556 301 554 311"/>
          <path d="M563 310 Q561 299 559 309"/>
          <path d="M568 313 Q567 301 565 312"/>
          {/* Near bucket */}
          <path d="M574 298 Q572 287 570 297"/>
          <path d="M579 298 Q577 286 575 297"/>
        </g>

        {/* ══════════════════ POND SURFACE ══════════════════ */}
        <g className="pond-surface">
          {/* Main organic pond shape */}
          <path
            d="M22 292 Q26 240 86 248 Q132 254 168 260
               Q248 268 345 264 Q388 262 392 284
               Q393 312 225 314 Q80 316 22 296 Z"
            fill="rgba(175,210,232,0.14)"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1.5"
          />

          {/* Water surface texture lines */}
          <path d="M46 272 Q96 269 138 272"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M36 282 Q118 278 202 282"
            fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M48 292 Q162 288 284 292"
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M78 300 Q202 296 324 300"
            fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M128 307 Q232 303 352 307"
            fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeLinecap="round"/>

          {/* Ripple rings centered on bobber (178, 276) */}
          <ellipse cx="178" cy="276" rx="11"  ry="3.5"
            fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="1.2"/>
          <ellipse cx="178" cy="276" rx="27"  ry="9"
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
          <ellipse cx="178" cy="276" rx="48"  ry="15"
            fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
        </g>

        {/* ══════════════════ FLOWERS — bottom right ══════════════════ */}
        <g className="flowers">
          {/* Flower 1 — large daisy */}
          <circle cx="610" cy="318" r="6"
            fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
          <Petals cx={610} cy={318} count={9} r={11} rx={5} ry={3}
            stroke="rgba(0,0,0,0.10)"/>
          <line x1="610" y1="324" x2="608" y2="346"
            stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Leaf on stem */}
          <path d="M609 336 Q598 330 600 338"
            fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Flower 2 */}
          <circle cx="640" cy="308" r="5"
            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
          <Petals cx={640} cy={308} count={7} r={9} rx={4} ry={2.5}
            stroke="rgba(0,0,0,0.08)"/>
          <line x1="640" y1="313" x2="638" y2="332"
            stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Flower 3 — small */}
          <circle cx="660" cy="326" r="4"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5"/>
          <Petals cx={660} cy={326} count={6} r={7} rx={3} ry={2}
            stroke="rgba(0,0,0,0.07)"/>
          <line x1="660" y1="330" x2="658" y2="346"
            stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Tulip / bud top-right corner */}
          <path d="M678 296 Q675 280 680 278 Q685 280 682 296"
            fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="680" y1="296" x2="678" y2="322"
            stroke="rgba(0,0,0,0.09)" strokeWidth="1.5" strokeLinecap="round"/>
        </g>

        {/* ══════════════════ STOOL ══════════════════ */}
        <g className="stool">
          {/* Seat */}
          <rect x="462" y="262" width="56" height="10" rx="3"
            fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="2"/>
          {/* Back-left leg (behind) */}
          <line x1="470" y1="272" x2="465" y2="305"
            stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Back-right leg */}
          <line x1="510" y1="272" x2="515" y2="305"
            stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Front-left leg */}
          <line x1="466" y1="272" x2="460" y2="308"
            stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
          {/* Front-right leg */}
          <line x1="514" y1="272" x2="520" y2="308"
            stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
          {/* Cross brace */}
          <line x1="462" y1="288" x2="518" y2="288"
            stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
        </g>

        {/* ══════════════════ BUCKET ══════════════════ */}
        <g className="bucket">
          {/* Tapered body (wider at top) */}
          <path d="M534 272 Q531 300 548 300 Q565 300 562 272 Z"
            fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"/>
          {/* Top rim */}
          <line x1="532" y1="272" x2="564" y2="272"
            stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
          {/* Handle arc */}
          <path d="M534 272 Q548 259 562 272"
            fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Cylinder texture lines */}
          <line x1="533" y1="281" x2="563" y2="281"
            stroke="rgba(0,0,0,0.07)" strokeWidth="1" strokeLinecap="round"/>
          <line x1="533" y1="290" x2="562" y2="290"
            stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeLinecap="round"/>
        </g>

        {/* ══════════════════ FIGURE ══════════════════ */}
        <g className="figure-group">
          {/* Head */}
          <circle cx="488" cy="162" r="21"
            fill="white" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5"/>
          {/* Cap crown */}
          <path d="M468 152 Q488 130 508 152"
            fill="rgba(0,0,0,0.10)" stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
          {/* Cap brim — extends forward (left) */}
          <line x1="462" y1="152" x2="514" y2="152"
            stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Eyes */}
          <circle cx="482" cy="160" r="2.5" fill="rgba(0,0,0,0.32)"/>
          <circle cx="494" cy="160" r="2.5" fill="rgba(0,0,0,0.32)"/>
          {/* Smile */}
          <path d="M481 170 Q488 177 495 170"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Neck */}
          <line x1="488" y1="183" x2="487" y2="192"
            stroke="rgba(0,0,0,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Body — slightly hunched forward */}
          <path d="M487 192 Q483 222 482 262"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3.5" strokeLinecap="round"/>
          {/* Right arm — extends left to grip rod */}
          <path d="M484 210 Q470 215 455 218"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round"/>
          {/* Left arm — rests on thigh */}
          <path d="M485 215 Q503 230 512 250"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round"/>
          {/* Right thigh (extends forward / left as seated) */}
          <path d="M482 262 Q456 270 438 277"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3.5" strokeLinecap="round"/>
          {/* Left thigh */}
          <path d="M482 262 Q508 270 522 278"
            fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="3.5" strokeLinecap="round"/>
          {/* Right calf */}
          <path d="M438 277 Q434 294 436 310"
            fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3" strokeLinecap="round"/>
          {/* Left calf */}
          <path d="M522 278 Q526 295 524 310"
            fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3" strokeLinecap="round"/>
          {/* Right foot */}
          <ellipse cx="436" cy="312" rx="12" ry="5"
            fill="rgba(0,0,0,0.20)" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5"/>
          {/* Left foot */}
          <ellipse cx="524" cy="312" rx="12" ry="5"
            fill="rgba(0,0,0,0.20)" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5"/>
        </g>

        {/* ══════════════════ ROD GROUP ══════════════════ */}
        {/* transformOrigin set via GSAP svgOrigin:"455 218" */}
        <g className="rod-group">
          {/* Main rod — sweeping arc from hand up-left to tip */}
          <path d="M455 218 Q320 108 178 148"
            fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="3" strokeLinecap="round"/>
          {/* Tip section — thinner, final quarter */}
          <path d="M248 140 Q214 142 178 148"
            fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" strokeLinecap="round"/>
        </g>

        {/* ══════════════════ BOBBER GROUP ══════════════════ */}
        {/* transformOrigin set via GSAP svgOrigin:"178 148" */}
        <g className="bobber-group">
          {/* Fishing line — drops from rod tip to water surface */}
          <line x1="178" y1="148" x2="178" y2="272"
            stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/>
          {/* Bobber top — white half (above waterline) */}
          <path d="M172 274 Q178 265 184 274"
            fill="white" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5"/>
          {/* Bobber bottom — dark half */}
          <path d="M172 274 Q178 283 184 274"
            fill="rgba(0,0,0,0.22)" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5"/>
        </g>

      </svg>

      {/* Fish-bite tooltip — Geist Mono, fades in/out */}
      <div className={`bite-tooltip${biteActive ? ' visible' : ''}`}>
        something&apos;s biting...
      </div>
    </div>
  );
}
