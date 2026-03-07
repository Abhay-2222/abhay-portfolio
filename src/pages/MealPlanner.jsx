/**
 * MealPlanner.jsx
 * Case study — MealPlan: A Weekly Operating System for Food.
 *
 * Layout intent: feels like a product page that got a case study injected into it.
 * Mirrors the app's own design philosophy: fontWeight 400 throughout,
 * hierarchy via size and color only — no bold anywhere.
 * Completely different from the other three case studies:
 * competitor matrix, decision log, versioned evolution, confession-style mistakes.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor.jsx';

gsap.registerPlugin(ScrollTrigger);

/* App design language colors */
const SAGE   = '#5a9e6f'; // sage green — secondary/system status
const TERRA  = '#C4782A'; // terracotta — primary accent (design system)
const CREAM  = '#FAF9F6'; // cream — background note
const GOLD   = '#d4a853'; // portfolio gold — secondary highlights

/* ─── Scroll-reveal (400 weight, no bold, gentle) ─── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
    );
  }, [delay]);
  return <div ref={ref} style={{ opacity: 0, ...style }}>{children}</div>;
}

/* ─── Thin rule ─── */
function HR({ top = 80, bottom = 80 }) {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: `${top}px 0 ${bottom}px` }} />;
}

/* ─── Section label — same mono style, no bold ─── */
function Label({ children, color }) {
  return (
    <p style={{
      fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase', fontWeight: 400,
      color: color || 'var(--text-tertiary)', marginBottom: 'var(--space-3)',
    }}>{children}</p>
  );
}

/* ─── Competitor feature check ─── */
function Check({ yes, partial }) {
  if (yes) return <span style={{ color: SAGE, fontSize: 'var(--text-sm)' }}>✓</span>;
  if (partial) return <span style={{ color: GOLD, fontSize: 'var(--text-xs)' }}>~</span>;
  return <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', opacity: 0.4 }}>—</span>;
}

/* ─── Stat — large number, no bold ─── */
function BigStat({ number, label, sub, color }) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--mono)', fontSize: 'var(--text-stat)',
        fontWeight: 400, color: color || SAGE, lineHeight: 'var(--leading-none)', marginBottom: 'var(--space-2)',
        letterSpacing: 'var(--tracking-tight)',
      }}>{number}</p>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
        color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{label}</p>
      {sub && <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 400,
        color: 'var(--text-tertiary)', lineHeight: 'var(--leading-snug)' }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function MealPlannerPage() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.cursor   = 'none';
    return () => { document.body.style.overflow = 'hidden'; };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    gsap.fromTo(el.querySelectorAll('.hl'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <CustomCursor />

      {/* ── Back nav ── */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        data-cursor-hover
        style={{
          position: 'fixed', top: 28, left: 32, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)',
          background: 'var(--glass-bg)', border: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)', fontFamily: 'var(--sans)',
          fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--text-secondary)', cursor: 'none',
        }}
      >← Portfolio</motion.button>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 var(--space-10) 140px' }}>

        {/* ══ HERO — product identity, not case study template ══ */}
        <div ref={heroRef} style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-20)' }}>
          <div className="hl" style={{ opacity: 0, marginBottom: 'var(--space-4)' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase', fontWeight: 400, color: 'var(--text-tertiary)' }}>
              03 — Product Design + Engineering
            </p>
          </div>

          <div className="hl" style={{ opacity: 0 }}>
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(56px, 8.5vw, 112px)',
              fontWeight: 400,
              letterSpacing: 'var(--tracking-tightest)',
              lineHeight: 'var(--leading-none)',
              color: 'var(--text-primary)',
              marginBottom: 0,
            }}>Meal<span style={{ color: SAGE, fontStyle: 'italic' }}>Plan</span></h1>
          </div>

          <div className="hl" style={{ opacity: 0, marginTop: 'var(--space-6)' }}>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontStyle: 'italic', fontWeight: 400, color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-snug)',
            }}>A weekly operating system for food.</p>
          </div>

          <div className="hl" style={{ opacity: 0, marginTop: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-snug)' }}>Next.js 15 · TypeScript</span>
              <span style={{ width: 1, height: 12, background: 'var(--border-default)' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-snug)' }}>Consumer Mobile · 2025</span>
              <span style={{ width: 1, height: 12, background: 'var(--border-default)' }} />
              <a href="https://v0-electron-js-app-mocha.vercel.app/" target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                  color: SAGE, letterSpacing: 'var(--tracking-snug)', textDecoration: 'none' }}>
                Live project ↗
              </a>
            </div>
          </div>
        </div>

        {/* ── App photo strip ── */}
        <Reveal>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          }}>
            {[
              { src: '/mealplan/splash-meal-planning.jpg', label: 'Plan meals' },
              { src: '/mealplan/splash-grocery-shopping.jpg', label: 'Shop smarter' },
              { src: '/mealplan/splash-healthy-cooking.jpg', label: 'Eat better' },
            ].map(img => (
              <div key={img.label} style={{
                height: 220, position: 'relative', overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
              }}>
                <img src={img.src} alt={img.label} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'brightness(0.75) saturate(0.9)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: 'var(--space-8) var(--space-4) var(--space-4)',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                    letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.8)' }}>{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ PROBLEM NUMBERS ══ */}
        <HR top={80} bottom={64} />

        <Reveal>
          <Label>The Problem in Numbers</Label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-12)', marginBottom: 'var(--space-12)',
          }}>
            <BigStat number="30–40%" label="of groceries wasted" sub="per average household weekly" color={TERRA} />
            <BigStat number="200+" label="food decisions daily" sub="most default to unhealthy, expensive options" color={SAGE} />
            <BigStat number="70/30" label="want to plan vs. do it" sub="the dropout always happens at the same point" color={GOLD} />
          </div>
        </Reveal>

        <Reveal>
          <div style={{
            padding: 'var(--space-7) var(--space-8)', borderLeft: `3px solid ${SAGE}`,
            background: `${SAGE}07`,
          }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase', fontWeight: 400, color: SAGE, marginBottom: 'var(--space-3)' }}>Core Insight</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(16px, 2vw, 20px)',
              fontStyle: 'italic', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 'var(--leading-loose)' }}>
              People don't need another recipe app. They need a weekly operating system for food — one place that connects what they plan, what they buy, what they have, and what they spend.
            </p>
          </div>
        </Reveal>

        {/* ══ COMPETITIVE GAP MATRIX ══ */}
        <HR />

        <Reveal>
          <Label>Competitive Landscape</Label>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
            lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 'var(--space-10)' }}>
            Every competitor solves one or two of the five jobs. None solve all five. That gap is the product.
          </p>
        </Reveal>

        <Reveal>
          <div style={{
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '160px repeat(5, 1fr)',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: 'var(--space-3) var(--space-5)',
            }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Tool</p>
              {['Planner', 'Grocery List', 'Budget', 'Nutrition', 'Pantry'].map(h => (
                <p key={h} style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                  letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                  color: 'var(--text-tertiary)', textAlign: 'center' }}>{h}</p>
              ))}
            </div>

            {[
              { name: 'Mealime',          vals: [true, true, false, false, false] },
              { name: 'Paprika',          vals: [true, true, false, false, false] },
              { name: 'Whisk / Samsung',  vals: [false, true, false, false, false] },
              { name: 'Notion / Sheets',  vals: [true, false, false, false, false] },
              { name: 'Instacart',        vals: [false, true, false, false, false] },
              { name: 'MealPlan',         vals: [true, true, true, true, true], highlight: true },
            ].map((row, i, arr) => (
              <div key={row.name} style={{
                display: 'grid', gridTemplateColumns: '160px repeat(5, 1fr)',
                padding: 'var(--space-4) var(--space-5)', alignItems: 'center',
                background: row.highlight ? `${SAGE}0b` : 'transparent',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                borderLeft: row.highlight ? `3px solid ${SAGE}` : '3px solid transparent',
              }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                  color: row.highlight ? SAGE : 'var(--text-secondary)' }}>{row.name}</p>
                {row.vals.map((v, j) => (
                  <div key={j} style={{ textAlign: 'center' }}>
                    <Check yes={v} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ ONE USER, FOUR ROLES ══ */}
        <HR />

        <Reveal>
          <Label>User Research</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 3vw, 34px)',
            fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-5)', lineHeight: 'var(--leading-tight)' }}>
            One user. Four hats.
          </h2>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
            lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', maxWidth: 580, marginBottom: 'var(--space-10)' }}>
            The critical research finding: the person who plans meals is almost always the person who shops, cooks, and manages the household food budget. This is one user in four modes — not four separate user types.
          </p>
        </Reveal>

        <Reveal>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          }}>
            {[
              { pct: '60%', role: 'Weekly Planner', pain: '"I spend more time planning what to eat than actually cooking."', want: 'Plan 7 days in under 10 min on Sunday', color: SAGE },
              { pct: '25%', role: 'Budget-Conscious Shopper', pain: '"I set a $150 budget and somehow always spend $220."', want: 'Know weekly meal cost before the store', color: TERRA },
              { pct: '15%', role: 'Health-Aware Eater', pain: '"I have no idea if my weekly meals are actually balanced."', want: 'Daily nutrition breakdowns per planned meals', color: GOLD },
              { pct: '—',   role: 'All of the above', pain: 'All three frustrations belong to the same person.', want: 'One app that serves all four modes seamlessly', color: `${SAGE}80` },
            ].map((p, i, arr) => (
              <div key={p.role} style={{
                padding: 'var(--space-7)',
                borderRight: i % 2 === 0 ? '1px solid var(--border-subtle)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-md)', fontWeight: 400,
                    color: p.color, lineHeight: 'var(--leading-none)' }}>{p.pct}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                    color: 'var(--text-primary)' }}>{p.role}</span>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
                  fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-3)',
                  borderLeft: `2px solid ${p.color}40`, paddingLeft: 'var(--space-3)' }}>
                  {p.pain}
                </p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 400,
                  color: 'var(--text-tertiary)', lineHeight: 'var(--leading-normal)' }}>{p.want}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ NAVIGATING AMBIGUITY — Decision Log ══ */}
        <HR />

        <Reveal>
          <Label>Navigating Ambiguity</Label>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
            lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', maxWidth: 520, marginBottom: 'var(--space-10)' }}>
            Four structural questions had to be answered before a single screen was designed. Each decision shaped the entire product.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[
              {
                q: 'What does the user see first?',
                rejected: 'Dashboard with metric tiles',
                chosen: 'Weekly planner as entry point',
                why: 'This is a doing tool, not a viewing tool. "What am I eating this week?" — not "Show me analytics."',
              },
              {
                q: 'How deep should recipe management go?',
                rejected: 'Full recipe editor with custom ingredients',
                chosen: 'Pre-built selections with nutrition baked in',
                why: 'Planning and cooking are separate mental modes. Users assign meals on Sunday — they don\'t write recipes.',
              },
              {
                q: 'How granular should budget tracking be?',
                rejected: 'Per-ingredient manual price entry',
                chosen: 'Estimated per-ingredient pricing that rolls into weekly totals',
                why: 'Per-ingredient is powerful but creates data burden. Weekly totals are easy but not actionable. Both levels, zero manual entry.',
              },
              {
                q: 'How do you fit 7 days × 3 meals on a 375px screen?',
                rejected: 'Full calendar grid (desktop pattern)',
                chosen: 'Horizontally scrollable day selector + vertical meal list per day',
                why: 'Each day feels focused. The full week is one swipe away. Desktop patterns break on mobile — you design for the constraint.',
              },
            ].map((row, i, arr) => (
              <div key={row.q} style={{
                padding: 'var(--space-8) 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                    letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase',
                    color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Question {String(i + 1).padStart(2, '0')}</p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-base)', fontWeight: 400,
                    fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 'var(--leading-normal)', marginBottom: 'var(--space-5)' }}>
                    "{row.q}"
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: '#e87878',
                        letterSpacing: 'var(--tracking-snug)', textTransform: 'uppercase', flexShrink: 0 }}>Rejected</span>
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                        color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{row.rejected}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: SAGE,
                        letterSpacing: 'var(--tracking-snug)', textTransform: 'uppercase', flexShrink: 0 }}>Chosen</span>
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                        color: 'var(--text-primary)' }}>{row.chosen}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                    lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)' }}>{row.why}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ DESIGN EVOLUTION ══ */}
        <HR />

        <Reveal>
          <Label>Design Evolution</Label>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
            lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', maxWidth: 520, marginBottom: 'var(--space-12)' }}>
            Four versions. Three rejections. Each failure pointed directly at the next decision.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                v: 'V1', status: 'Rejected',
                label: 'Dashboard-First with Large Tiles',
                verdict: 'Decorative, not functional. Every action required navigating through a hub.',
                quote: '"Aren\'t these tiles too big? I just want to get to my meals."',
                color: '#e87878',
              },
              {
                v: 'V2', status: 'Iterated',
                label: 'Bottom Navigation with Dark Borders',
                verdict: 'Functionally better but visually heavy. Dark borders made it feel clinical.',
                quote: '"Can we remove those dark strokes and make it feel lighter?"',
                color: GOLD,
              },
              {
                v: 'V3', status: 'Refined',
                label: 'Borderless Cards with Warm Palette',
                verdict: 'Right direction. Introduced sage/cream/terracotta. But inconsistent sizing.',
                quote: '"The Daily Nutrition card is huge. Can we present small values better?"',
                color: `${SAGE}80`,
              },
              {
                v: 'V4', status: 'Current',
                label: 'Compact, Consistent, SF Pro 400',
                verdict: 'Unified under SF Pro Display, weight 400, no bold anywhere. Every component tightened for density without sacrificing readability.',
                quote: 'No user quote needed — this one shipped.',
                color: SAGE,
              },
            ].map((v, i, arr) => (
              <div key={v.v} style={{
                display: 'grid', gridTemplateColumns: '72px 1fr',
                gap: '0 var(--space-10)', padding: 'var(--space-10) 0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: i === arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                    letterSpacing: 'var(--tracking-label)', padding: '3px var(--space-2)',
                    borderRadius: 'var(--radius-sm)', border: `1px solid ${v.color}40`,
                    color: v.color, background: `${v.color}0e`,
                    marginBottom: 'var(--space-1)',
                  }}>{v.v}</span>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                    letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: v.color }}>{v.status}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
                    color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{v.label}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                    lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{v.verdict}</p>
                  {v.v !== 'V4' && (
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
                      fontWeight: 400, color: 'var(--text-tertiary)', lineHeight: 'var(--leading-normal)',
                      paddingLeft: 'var(--space-3)', borderLeft: `2px solid ${v.color}40` }}>{v.quote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ DESIGN SYSTEM ══ */}
        <HR />

        <Reveal>
          <Label>Design System</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 30px)',
            fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-10)', lineHeight: 'var(--leading-tight)' }}>
            Five colors. One weight. No exceptions.
          </h2>
        </Reveal>

        <Reveal>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-10)',
          }}>
            {[
              { hex: '#1B4D2E', name: 'Sage Green', role: 'Primary actions, buttons, active states' },
              { hex: '#FAF9F6', name: 'Cream', role: 'Backgrounds, card surfaces' },
              { hex: '#C4753B', name: 'Terracotta', role: 'Accent highlights, calorie indicators' },
              { hex: '#2D2D2D', name: 'Charcoal', role: 'Primary text' },
              { hex: '#E8E5E0', name: 'Soft Gray', role: 'Borders, dividers, secondary BG' },
            ].map(c => (
              <div key={c.hex}>
                <div style={{
                  height: 56, borderRadius: 'var(--radius-lg)', background: c.hex, marginBottom: 'var(--space-2)',
                  border: c.hex === '#FAF9F6' ? '1px solid var(--border-subtle)' : 'none',
                }} />
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                  color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>{c.hex}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 400,
                  color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 400,
                  color: 'var(--text-tertiary)', lineHeight: 'var(--leading-snug)' }}>{c.role}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div style={{
            padding: 'var(--space-10) var(--space-10)',
            background: `${SAGE}07`, border: `1px solid ${SAGE}20`, borderRadius: 'var(--radius-xl)',
            display: 'flex', gap: 'var(--space-12)', alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
                letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: SAGE, marginBottom: 'var(--space-3)' }}>
                Typography Rule
              </p>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.2vw, 24px)',
                fontStyle: 'italic', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)',
              }}>
                "No bold text. Anywhere in the application."
              </p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>SF Pro Display</p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>weight-400 only</p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 400,
                color: 'var(--text-tertiary)' }}>size + color = hierarchy</p>
            </div>
          </div>
        </Reveal>

        {/* ══ SIX MISTAKES ══ */}
        <HR />

        <Reveal>
          <Label>Mistakes Made</Label>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 400,
            lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', maxWidth: 520, marginBottom: 'var(--space-12)' }}>
            Six decisions that were wrong, why they failed, and what they taught.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[
              {
                n: '01', mistake: 'Started with a Dashboard Hub',
                lesson: 'For high-frequency tools, the entry point should be the primary action, not an overview. "What\'s next?" beats "How am I doing?"',
              },
              {
                n: '02', mistake: 'Over-styled with Heavy Borders',
                lesson: 'On mobile, less visual chrome means more breathing room. Hierarchy comes from spacing and color — not borders.',
              },
              {
                n: '03', mistake: 'Made the Nutrition Card Too Large',
                lesson: 'Data density and visual weight should match the importance of the information. Nutrition data is glanceable — design it for a glance.',
              },
              {
                n: '04', mistake: 'Inconsistent Typography Across Components',
                lesson: 'Typography consistency must be enforced globally. A single rule ("no bold anywhere") is easier to maintain than nuanced per-element decisions.',
              },
              {
                n: '05', mistake: 'Wrong Icon for the Options Menu',
                lesson: 'Icon semantics matter enormously on mobile. A three-dot menu is a universally understood pattern. Don\'t reinvent iconography.',
              },
              {
                n: '06', mistake: 'No Week-to-Week Continuity',
                lesson: 'Continuity is a feature. "Copy last week" and "view 4-week history" transformed a one-shot planner into a system that learns.',
              },
            ].map((m, i, arr) => (
              <div key={m.n} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 1fr', gap: '0 var(--space-12)',
                padding: 'var(--space-7) 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                alignItems: 'start',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-sm)', fontWeight: 400,
                  color: 'rgba(255,255,255,0.12)', paddingTop: 2 }}>{m.n}</span>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                  color: 'var(--text-primary)', lineHeight: 'var(--leading-normal)' }}>{m.mistake}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 400,
                  lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)',
                  borderLeft: `2px solid ${SAGE}30`, paddingLeft: 'var(--space-4)' }}>{m.lesson}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ CORE LESSON ══ */}
        <HR />

        <Reveal y={12}>
          <div style={{
            padding: 'var(--space-20) var(--space-16)',
            background: `${SAGE}08`,
            borderTop: `1px solid ${SAGE}20`,
            borderBottom: `1px solid ${SAGE}20`,
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', fontWeight: 400,
              letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
              color: SAGE, marginBottom: 'var(--space-6)' }}>Core Lesson</p>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(18px, 2.8vw, 30px)',
              fontStyle: 'italic', fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 'var(--leading-normal)',
              maxWidth: 640, margin: '0 auto',
            }}>
              "The best personal tools don't feel like software — they feel like an extension of the user's weekly routine."
            </p>
          </div>
        </Reveal>

        {/* ══ CTA ══ */}
        <div style={{ marginTop: 'var(--space-20)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Reveal>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <motion.a
                href="https://v0-electron-js-app-mocha.vercel.app/"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                data-cursor-hover
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-6)', background: SAGE,
                  color: '#fff', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--sans)',
                  fontSize: 'var(--text-sm)', fontWeight: 400, textDecoration: 'none',
                }}
              >View Live Project ↗</motion.a>
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                data-cursor-hover
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-6)', background: 'transparent',
                  color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--sans)',
                  fontSize: 'var(--text-sm)', fontWeight: 400, cursor: 'none',
                  border: '1px solid var(--border-default)',
                }}
              >← Portfolio</motion.button>
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
