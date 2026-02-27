/**
 * Healthcare.jsx
 * Full case study page — CareSummarizer + CareLens.
 * Designed for scannability: pull quotes, stat chips, card grids,
 * keyword-first lists, no walls of text.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor.jsx';

gsap.registerPlugin(ScrollTrigger);

const A = '#2D6A9F';   // clinical authority blue (design system)
const A2 = '#9b87f5';  // purple
const A3 = '#e87878';  // red/danger
const A4 = '#d4a853';  // gold

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
    );
  }, [delay]);
  return <div ref={ref} style={{ opacity: 0, ...style }}>{children}</div>;
}

/* ─── Mono label ─── */
function Label({ children, color }) {
  return (
    <p style={{
      fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase', color: color || 'var(--text-tertiary)',
      marginBottom: 'var(--space-4)',
    }}>{children}</p>
  );
}

/* ─── Horizontal rule ─── */
function HR() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--space-20) 0' }} />;
}

/* ─── Stat chip — large number + label ─── */
function Stat({ number, label, sub, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'var(--mono)', fontSize: 'var(--text-stat)',
        fontWeight: 500, color: color || A, lineHeight: 'var(--leading-none)', marginBottom: 'var(--space-2)',
      }}>{number}</p>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
        color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{label}</p>
      {sub && <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)',
        color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-wide)' }}>{sub}</p>}
    </div>
  );
}

/* ─── Pull quote ─── */
function PullQuote({ children, color }) {
  return (
    <blockquote style={{
      fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.4vw, 26px)',
      fontStyle: 'italic', lineHeight: 'var(--leading-normal)', color: color || A,
      borderLeft: `3px solid ${color || A}`, paddingLeft: 'var(--space-6)',
      maxWidth: 680,
    }}>
      {children}
    </blockquote>
  );
}

/* ─── Status badge ─── */
function Badge({ label, type }) {
  const colors = {
    complete:    { bg: `${A}18`,    border: `${A}30`,    text: A },
    progress:    { bg: `${A4}18`,   border: `${A4}30`,   text: A4 },
    planned:     { bg: 'var(--border-subtle)', border: 'var(--border-default)', text: 'var(--text-tertiary)' },
    rejected:    { bg: `${A3}18`,   border: `${A3}30`,   text: A3 },
    refined:     { bg: `${A4}18`,   border: `${A4}30`,   text: A4 },
    current:     { bg: `${A}18`,    border: `${A}30`,    text: A },
  };
  const c = colors[type] || colors.planned;
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-xl)',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */

function Healthcare() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 280], [1, 0]);
  const heroY = useTransform(scrollY, [0, 280], [0, -40]);
  const [scrollPct, setScrollPct] = useState(0);

  // Unlock body scroll for this full-page case study
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const chars = el.querySelectorAll('.hc');
    gsap.fromTo(chars,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: 'power3.out', delay: 0.2 }
    );
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)',
      fontFamily: 'var(--sans)', overflowX: 'hidden' }}>

      <CustomCursor />

      {/* ── Sticky Progress Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 2, background: 'var(--border-subtle)' }}>
        <div style={{ height: '100%', background: A, width: `${scrollPct * 100}%`,
          transition: 'width 0.1s linear' }} />
      </div>

      {/* ── Back button ── */}
      <div style={{ position: 'fixed', top: 16, left: 24, zIndex: 199 }}>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ x: -3 }}
          data-cursor-hover
          style={{
            fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-snug)',
            color: 'var(--text-tertiary)', background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)', cursor: 'none',
            backdropFilter: 'blur(12px)',
          }}
        >← Back
        </motion.button>
      </div>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: 'clamp(80px,10vw,140px) 40px 64px',
          textAlign: 'center',
        }}>
          <Label>02 · Product Design &amp; AI</Label>

          {/* Title — char-split for GSAP */}
          <h1 ref={heroRef} style={{
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-6)',
          }}>
            {'CareSummarizer'.split('').map((c, i) => (
              <span key={i} className="hc" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
                {c === ' ' ? '\u00A0' : c}
              </span>
            ))}
            {' + '.split('').map((c, i) => (
              <span key={`p${i}`} className="hc" style={{ display: 'inline-block', color: 'var(--text-tertiary)', willChange: 'transform, opacity' }}>
                {c === ' ' ? '\u00A0' : c}
              </span>
            ))}
            {'CareLens'.split('').map((c, i) => (
              <span key={`b${i}`} className="hc" style={{ display: 'inline-block', color: A, fontStyle: 'italic', willChange: 'transform, opacity' }}>
                {c === ' ' ? '\u00A0' : c}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--text-secondary)',
              maxWidth: 680, margin: '0 auto var(--space-12)', lineHeight: 'var(--leading-normal)',
            }}
          >
            A clinical decision-readiness platform that transforms raw EHR data into
            decision-ready cases — surfacing gaps, policy risks, and explainable AI
            insights before decisions are made.
          </motion.p>

          {/* Meta strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 1, background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}
          >
            {[
              { label: 'Role', value: 'Product Designer · UX Researcher' },
              { label: 'Domain', value: 'Healthcare AI · Utilization Review' },
              { label: 'AI Stack', value: 'Claude 4 Sonnet · React · Vercel' },
              { label: 'Status', value: 'Portfolio & Demo Ready' },
            ].map(m => (
              <div key={m.label} style={{
                padding: 'var(--space-5) var(--space-4)', background: 'var(--bg)', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                  {m.label}
                </p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                  color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)' }}>
                  {m.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ════════════════════════════════
          BODY CONTENT
      ════════════════════════════════ */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 var(--space-10) var(--space-32)' }}>

        {/* ── Mental Model callout ── */}
        <Reveal>
          <div style={{
            background: `${A}0c`, border: `1px solid ${A}28`, borderRadius: 'var(--radius-xl)',
            padding: 'clamp(28px, 4vw, 48px)', textAlign: 'center', marginBottom: 'var(--space-20)',
          }}>
            <Label color={A}>The Mental Model</Label>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2.8vw, 32px)',
              fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)',
            }}>
              The layer between <em style={{ color: A }}>raw clinical data</em> and a final decision.
              <br />AI prepares the context. <strong style={{ fontStyle: 'normal' }}>Humans make the call.</strong>
            </p>
          </div>
        </Reveal>

        <HR />

        {/* ── CONTEXT ── */}
        <Reveal>
          <Label>Context</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 500, marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-tight)' }}>
            Healthcare stores data well.<br />
            It does <em style={{ color: A }}>not</em> prepare decisions well.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                UR nurses spend <strong style={{ color: 'var(--text-primary)' }}>40–60 minutes per case</strong> manually
                hunting through fragmented EHR notes, PDF labs, and payer policy documents — only to discover
                critical gaps <em>after</em> a claim has already been denied.
              </p>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)' }}>
                CareSummarizer automates the clinical narrative. CareLens is the persistent AI sidebar with
                confidence scores, risk flags, and explainable reasoning. Together: a{' '}
                <strong style={{ color: 'var(--text-primary)' }}>clinical decision-readiness platform</strong>.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                The wedge is deliberate: <strong style={{ color: 'var(--text-primary)' }}>decision readiness +
                explainability + auditability</strong> for the UR nurse who prepares the case before any
                approval happens.
              </p>
              <PullQuote color={A}>
                Others optimize for speed. This product optimizes for defensibility.
              </PullQuote>
            </div>
          </div>
        </Reveal>

        {/* ── 3 Users ── */}
        <Reveal delay={0.15}>
          <Label>Who This Is For</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {[
              {
                icon: '👩‍⚕️', role: 'UR Nurses', volume: 'Primary — 80% of volume',
                description: 'Prepare defensible prior authorization cases. Spend 70% of time on data archaeology across 8+ tools.',
                quote: '"I went to nursing school to care for patients, not to be a data archaeologist."',
                color: A,
              },
              {
                icon: '👨‍⚕️', role: 'Physicians', volume: 'Secondary — Escalations only',
                description: 'Make final approval decisions. Currently re-read entire charts because nurse prep is incomplete.',
                quote: '"I don\'t trust the prep, so I re-read everything — which defeats the purpose."',
                color: A2,
              },
              {
                icon: '📊', role: 'Medical Directors', volume: 'Tertiary — Oversight',
                description: 'Ensure team consistency and defend decisions to payers and regulators.',
                quote: '"No visibility into team performance. No audit trail. No defensibility."',
                color: A4,
              },
            ].map(u => (
              <div key={u.role} style={{
                padding: 'var(--space-6) var(--space-5)', background: 'var(--glass-hover)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: 'var(--text-xl)' }}>{u.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: u.color, marginBottom: 'var(--space-1)' }}>{u.role}</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{u.volume}</p>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)',
                  flexGrow: 1 }}>{u.description}</p>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)', lineHeight: 'var(--leading-snug)',
                  borderTop: `1px solid var(--border-subtle)`, paddingTop: 'var(--space-3)' }}>
                  {u.quote}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Critical Finding ── */}
        <Reveal delay={0.1}>
          <div style={{
            padding: 'var(--space-10) var(--space-10)', background: `${A}10`, border: `1px solid ${A}30`,
            borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-4)', textAlign: 'center',
          }}>
            <Label color={A}>Critical Research Finding</Label>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.4vw, 28px)',
              fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)',
            }}>
              The person who <em style={{ color: A }}>prepares</em> the decision matters
              more than the person who <em style={{ color: A }}>approves</em> it.
            </p>
          </div>
        </Reveal>

        <HR />

        {/* ── AMBIGUITY ── */}
        <Reveal>
          <Label>The Ambiguity I Faced</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            This project was non-linear by nature.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 600,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Four structural ambiguities blocked progress until I interrogated each one separately.
            Rushing to resolution would have produced the wrong product entirely.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {[
              {
                n: '01', title: 'Product Definition',
                q: '"What category does this even belong to?"',
                body: 'Without product identity, every design decision was arbitrary. Even "should we have a Home screen?" was unanswerable.',
              },
              {
                n: '02', title: 'Role & Responsibility',
                q: '"Who prepares decisions vs. who makes them?"',
                body: 'I assumed physicians were primary. They are not. Accountability risk is held by the nurse who builds the case.',
              },
              {
                n: '03', title: 'Workflow Boundaries',
                q: '"Where does this product start and end?"',
                body: 'Defining the wedge — prior authorization preparation only — unlocked everything else.',
              },
              {
                n: '04', title: 'AI Trust Scope',
                q: '"How much should AI actually do?"',
                body: 'FDA and ONC mandate explainability. Black box outputs are a legal non-starter. AI suggests, humans decide.',
              },
            ].map(a => (
              <div key={a.n} style={{
                padding: 'var(--space-6) var(--space-6)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)', background: 'var(--glass-hover)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: A, fontWeight: 500 }}>{a.n}</span>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: 'var(--text-primary)' }}>{a.title}</p>
                </div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
                  color: A, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-snug)' }}>{a.q}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{a.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── PROBLEM ── */}
        <Reveal>
          <Label>The Problem</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2.6vw, 32px)',
            fontWeight: 500, marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-tight)', maxWidth: 680 }}>
            The problem is not lack of data. It is data arriving in the
            wrong format, at the wrong time, to the wrong people.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0,
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            marginBottom: 'var(--space-12)' }}>
            {/* Current Reality */}
            <div style={{ padding: 'var(--space-8) var(--space-7)', background: `${A3}06` }}>
              <Label color={A3}>Current Reality</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { k: '8+ tools', v: 'UR nurses cross-reference to prepare a single case' },
                  { k: '30–40%', v: 'Denial rates across the industry' },
                  { k: 'Too late', v: 'Gaps discovered after submission, when they can\'t be fixed' },
                  { k: 'Revenue loss', v: 'Documentation mistakes → denials → lost revenue' },
                ].map(b => (
                  <div key={b.k} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <span style={{ color: A3, flexShrink: 0, marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>✕</span>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--mono)',
                        fontSize: 'var(--text-xs)' }}>{b.k}</strong>{' — '}{b.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--glass-border)', width: 1 }} />
            {/* The Opportunity */}
            <div style={{ padding: 'var(--space-8) var(--space-7)', background: `${A}06` }}>
              <Label color={A}>The Opportunity</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { k: 'Before submission', v: 'Surface documentation gaps when they can still be corrected' },
                  { k: 'AI narrative', v: 'Replace manual cross-referencing with synthesized case summaries' },
                  { k: 'Explainable AI', v: 'Give nurses AI they can trust and defend, not a black box' },
                  { k: 'Compliance first', v: 'Audit trails regulators actually require, built in from day one' },
                ].map(b => (
                  <div key={b.k} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <span style={{ color: A, flexShrink: 0, marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>✓</span>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--mono)',
                        fontSize: 'var(--text-xs)' }}>{b.k}</strong>{' — '}{b.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Competitive Gap ── */}
        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-7) var(--space-6)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)', background: `${A3}05` }}>
              <Label>Epic · Cohere · GPT Wrappers</Label>
              {[
                'Store data well, don\'t prepare decisions',
                'Black box AI — no explainability, no citations',
                'No policy validation before submission',
                'No audit trails for payer scrutiny',
                'Optimize for speed, not defensibility',
              ].map(i => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <span style={{ color: A3, flexShrink: 0, fontSize: 'var(--text-xs)' }}>✕</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-snug)' }}>{i}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: 'var(--space-7) var(--space-6)', border: `1px solid ${A}30`,
              borderRadius: 'var(--radius-lg)', background: `${A}07` }}>
              <Label color={A}>CareSummarizer + CareLens</Label>
              {[
                'AI-synthesized clinical narrative from EHR',
                'Explainable AI — confidence scores + reasoning traces',
                'Policy validation checklist before every submission',
                'Append-only audit trail (HIPAA + ONC compliant)',
                'Optimizes for defensibility — denials prevented upstream',
              ].map(i => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <span style={{ color: A, flexShrink: 0, fontSize: 'var(--text-xs)' }}>✓</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-snug)' }}>{i}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <HR />

        {/* ── DESIGN EVOLUTION ── */}
        <Reveal>
          <Label>Design Evolution</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            Four versions. Three rejected. Here's why.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 560,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Each rejection was as important as the acceptance. The rejections taught what the product actually needed to be.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              {
                v: 'V01', title: 'Physician-Centric Dashboard', status: 'rejected',
                why: 'Wrong primary user. Physicians touch <20% of cases. The accountability risk sits with the nurse who builds the case, not the doctor who approves it.',
              },
              {
                v: 'V02', title: 'Patient-Centered EHR Clone', status: 'rejected',
                why: 'Wrong entry point. UR nurses don\'t browse patients — they work a queue of cases. Browse-first vs. action-first is a product philosophy, not a UX pattern.',
              },
              {
                v: 'V03', title: 'Work Queue + Case-Centered', status: 'refined',
                why: 'Right user, right entry point — but CareLens was optional. Wrong. CareLens is the competitive moat. Making it optional made it invisible.',
              },
              {
                v: 'V04', title: '7-Stage Workflow · Current', status: 'current',
                why: 'Stage-based linear workflow, role-based routing, CareLens as persistent non-optional sidebar, proactive gap resolution, append-only audit trail.',
              },
            ].map((ver, i) => (
              <div key={ver.v} style={{
                display: 'grid', gridTemplateColumns: '72px 1fr auto',
                gap: 'var(--space-5)', alignItems: 'start',
                padding: 'var(--space-5) var(--space-6)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)', background: ver.status === 'current' ? `${A}08` : 'var(--glass-hover)',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-md)', fontWeight: 500,
                    color: ver.status === 'rejected' ? 'var(--text-tertiary)' : A,
                    lineHeight: 'var(--leading-none)' }}>{ver.v}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{ver.title}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{ver.why}</p>
                </div>
                <Badge label={ver.status} type={ver.status} />
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── MISTAKES & REVELATIONS ── */}
        <Reveal>
          <Label>Mistakes &amp; Revelations</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            Six mistakes. Six revelations.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 520,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Documenting mistakes isn't self-criticism — it's the actual design process.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {[
              {
                n: '01',
                mistake: 'Assumed physicians were primary',
                reveal: 'Job title is a bad proxy. Accountability risk is the right signal for product focus.',
              },
              {
                n: '02',
                mistake: 'Started with Home/Patients view',
                reveal: 'The entry point is always a philosophy, not a pattern. Work Queue = "your job is to move cases forward."',
              },
              {
                n: '03',
                mistake: 'Treated CareLens as optional',
                reveal: 'CareLens is the compliance infrastructure. If explainability is optional, it doesn\'t exist.',
              },
              {
                n: '04',
                mistake: 'Overpromised automation',
                reveal: 'Copilot, not autopilot. AI suggests and explains. Humans review and decide. Always.',
              },
              {
                n: '05',
                mistake: 'Underestimated SDOH complexity',
                reveal: 'Social determinants of health are clinical context. A patient without transport changes the clinical picture.',
              },
              {
                n: '06',
                mistake: 'Built screens before defining the product',
                reveal: '"What is this?" must precede "What does it look like?" Screens are outputs, not inputs.',
              },
            ].map(m => (
              <div key={m.n} style={{
                padding: 'var(--space-6) var(--space-5)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)', background: 'var(--glass-hover)',
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                    flexShrink: 0, marginTop: 'var(--space-1)' }}>{m.n}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
                      textTransform: 'uppercase', color: A3, marginBottom: 'var(--space-1)' }}>Mistake</p>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)',
                      lineHeight: 'var(--leading-snug)' }}>{m.mistake}</p>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid var(--border-subtle)`, paddingTop: 'var(--space-3)' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase', color: A, marginBottom: 'var(--space-1)' }}>Revealed</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-normal)' }}>{m.reveal}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── 7-STAGE WORKFLOW ── */}
        <Reveal>
          <Label>The 7-Stage Workflow</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            A system that mirrors how defensible decisions are actually made.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 560,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Each stage corresponds to a real moment in the UR process. Complex regulation
            made to feel like a clear series of decisions.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {[
              {
                n: '01', title: 'Work Queue', status: 'complete',
                desc: 'Prioritized case grid with filters for urgency, payer, and deadline. Role-based routing sends each role to their own view. Eliminates decision fatigue before the shift starts.',
              },
              {
                n: '02', title: 'Case Detail + CareSummarizer', status: 'complete',
                desc: 'Split-screen: patient header left, AI-generated narrative right. Claude 4 Sonnet (200K context) synthesizes the entire patient chart in one pass — no chunking, no information loss.',
              },
              {
                n: '03', title: 'Policy Validation', status: 'complete',
                desc: 'Accordion checklist mapped to InterQual/MCG criteria. Red items block submission and require gap resolution. This is the mechanism that prevents denials.',
              },
              {
                n: '04', title: 'CareLens Sidebar', status: 'complete',
                desc: 'Always visible. Never collapsible. Confidence score 0–100 with color-coded risk bands. Each flag has a "Why?" link that expands full reasoning trace + source citations.',
              },
              {
                n: '05', title: 'Gap Resolution Modal', status: 'progress',
                desc: 'When a policy check fails, AI drafts a justification paragraph from available evidence. Nurse edits and approves. AI writes, human signs. Optimistic UI, silent rollback.',
              },
              {
                n: '06', title: 'Physician Approval Modal', status: 'progress',
                desc: 'Simplified view: narrative + confidence score + resolved gap documentation. Three actions: Approve, Defer, Escalate. Every decision logged with timestamp + AI confidence at time of decision.',
              },
              {
                n: '07', title: 'Submission + Audit Trail', status: 'planned',
                desc: 'PA submission tracking with real-time payer status. Append-only audit log — every state transition, every AI interaction, timestamped. Medical Director dashboard for team performance.',
              },
            ].map((s, i) => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '56px 1fr auto',
                gap: 'var(--space-5)', alignItems: 'center',
                padding: 'var(--space-5) var(--space-6)',
                background: i % 2 === 0 ? 'var(--glass-hover)' : 'transparent',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid transparent',
                borderColor: s.status === 'complete' ? 'transparent' : 'var(--border-subtle)',
              }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-md)', fontWeight: 500,
                  color: s.status === 'complete' ? A : 'var(--text-tertiary)', lineHeight: 'var(--leading-none)' }}>
                  {s.n}
                </p>
                <div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{s.title}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{s.desc}</p>
                </div>
                <Badge label={s.status === 'progress' ? 'in progress' : s.status} type={s.status} />
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── KEY DESIGN DECISIONS ── */}
        <Reveal>
          <Label>Key Design Decisions</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-10)', lineHeight: 'var(--leading-tight)' }}>
            Six decisions. Each one deliberate.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {[
              {
                icon: '🚪', title: 'Work Queue as Entry Point',
                body: 'Not a Home screen. The queue is a declaration that your job is to move cases forward.',
                why: 'Eliminated browse-first mental model entirely',
              },
              {
                icon: '🔒', title: 'CareLens Non-Optional',
                body: 'Persistent, cannot be dismissed. If explainability is optional, it doesn\'t exist for regulators.',
                why: 'FDA/ONC compliance built into the interaction pattern',
              },
              {
                icon: '🤝', title: 'Copilot, Not Autopilot',
                body: 'AI generates. Humans approve. Every time. No exceptions in a regulated clinical environment.',
                why: 'Positions product in defensible regulatory territory',
              },
              {
                icon: '🔴', title: 'Red Items Block Submission',
                body: 'A failed policy check physically prevents PA submission. Soft warnings get ignored. Hard blocks force resolution.',
                why: 'Structural prevention vs. soft nudge',
              },
              {
                icon: '⚡', title: 'Optimistic UI Throughout',
                body: 'Every action updates immediately. The UI never makes a nurse wait for a server response in a 50-case shift.',
                why: 'Clinical pace requires zero perceptible latency',
              },
              {
                icon: '📋', title: 'Append-Only Audit Trail',
                body: 'Every decision, every AI interaction logged with a timestamp. Cannot be edited or deleted.',
                why: 'Non-negotiable compliance infrastructure',
              },
            ].map(d => (
              <div key={d.title} style={{
                padding: 'var(--space-6) var(--space-5)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)', background: 'var(--glass-hover)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: 'var(--text-lg)' }}>{d.icon}</span>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                  color: 'var(--text-primary)' }}>{d.title}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)',
                  flexGrow: 1 }}>{d.body}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: A,
                  letterSpacing: 'var(--tracking-wide)' }}>→ {d.why}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── DESIGN SYSTEM AUDIT ── */}
        <Reveal>
          <Label>Design System Audit</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-tight)' }}>
            The system existed. It had no enforcement mechanism.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 560,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Ran a structured audit using Cursor across six categories. Findings were specific,
            quantified, and prioritized — not general observations.
          </p>
        </Reveal>

        {/* Audit Stats */}
        <Reveal delay={0.1}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', marginBottom: 'var(--space-8)',
          }}>
            {[
              { n: '2', label: 'P0 Critical Issues', color: A3 },
              { n: '5', label: 'P1 High Priority Issues', color: A4 },
              { n: '39', label: 'Files Bypassing Tokens', color: A2 },
              { n: '20%', label: 'Token Adoption Before Audit', color: 'var(--text-tertiary)' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: 'var(--space-7) var(--space-5)', textAlign: 'center',
                borderRight: i < 3 ? '1px solid var(--glass-border)' : 'none',
                background: 'var(--glass-hover)',
              }}>
                <Stat number={s.n} label={s.label} color={s.color} />
              </div>
            ))}
          </div>
        </Reveal>

        {/* Key Findings */}
        <Reveal delay={0.15}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            {[
              {
                tag: 'P0 Critical', color: A3,
                title: 'Three competing color systems in parallel',
                body: 'design-system.ts, app/globals.css, and raw Tailwind classes all active simultaneously. No source of truth — three subsystems looked like three separate products. Fixed by a unified token file forcing every component to reference one source.',
              },
              {
                tag: 'P0 Critical', color: A3,
                title: '15+ WCAG 2.2 form accessibility failures',
                body: 'htmlFor missing on inputs, aria-invalid absent on error states, no focus rings. In a regulated healthcare product, accessibility failures are legal liability, not polish. Fixed before any stakeholder review.',
              },
              {
                tag: 'P1 High', color: A4,
                title: '39 files bypassing the design system entirely',
                body: 'Token adoption was 20%. The design system existed in lib/design-system.ts but had no enforcement. The audit quantified the gap precisely enough to justify the fix.',
              },
              {
                tag: 'P1 High', color: A4,
                title: 'AI was already generating styling errors silently',
                body: 'A file called ai-calibration-test-sheet.tsx documented every styling mistake AI tools were making. The fix: CLAUDE.md — a persistent rules file that Cursor and Claude Code read automatically before every generation.',
              },
            ].map(f => (
              <div key={f.title} style={{
                display: 'grid', gridTemplateColumns: '96px 1fr',
                gap: 'var(--space-5)', padding: 'var(--space-5) var(--space-6)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                background: 'var(--glass-hover)',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
                  textTransform: 'uppercase', color: f.color, alignSelf: 'flex-start',
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-xl)', textAlign: 'center',
                  marginTop: 'var(--space-1)',
                }}>{f.tag}</span>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)',
                    marginBottom: 'var(--space-2)' }}>{f.title}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-loose)' }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Before / After */}
        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-7) var(--space-6)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)', background: `${A3}05` }}>
              <Label>Before Audit — Design System in Name Only</Label>
              {[
                '3 competing color systems active simultaneously',
                '39 non-compliant files bypassing tokens',
                '20% token adoption rate across codebase',
                '15+ WCAG 2.2 accessibility failures',
                'No enforcement mechanism — rules optional',
                'AI generating styling errors silently',
              ].map(i => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <span style={{ color: A3, flexShrink: 0, fontSize: 'var(--text-xs)' }}>✕</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-snug)' }}>{i}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: 'var(--space-7) var(--space-6)', border: `1px solid ${A}30`,
              borderRadius: 'var(--radius-lg)', background: `${A}07` }}>
              <Label color={A}>After Remediation — Governed, Enforced, Compliant</Label>
              {[
                '1 unified token system — single source of truth',
                '0 non-compliant files',
                '100% token adoption target',
                '0 critical WCAG failures',
                'CLAUDE.md enforces rules on every AI generation',
                'Claude Code MCP writes tokens directly into Figma',
              ].map(i => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <span style={{ color: A, flexShrink: 0, fontSize: 'var(--text-xs)' }}>✓</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-snug)' }}>{i}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <HR />

        {/* ── IMPACT METRICS ── */}
        <Reveal>
          <Label>Projected Impact</Label>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: 500, marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-tight)' }}>
            The numbers are not aspirational. They are the design brief.
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 540,
            lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-10)' }}>
            Every metric maps directly to a specific design decision.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', marginBottom: 'var(--space-4)',
          }}>
            {[
              { n: '75%', label: 'Case Prep Reduction', sub: '40 min → 8–12 min' },
              { n: '40%', label: 'Denial Rate Drop', sub: '30–40% targeted to <5%' },
              { n: '2×', label: 'Nurse Throughput', sub: '8–12 cases → 20–25 / shift' },
              { n: '$2.5M', label: 'Annual Revenue Protected', sub: 'Per 200-bed hospital, 4:1 ROI' },
            ].map((m, i) => (
              <div key={m.label} style={{
                padding: 'var(--space-8) var(--space-5)',
                borderRight: i < 3 ? '1px solid var(--glass-border)' : 'none',
                background: 'var(--glass-hover)', textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: 'var(--mono)', fontSize: 'clamp(28px, 3.5vw, 44px)',
                  fontWeight: 500, color: A, lineHeight: 'var(--leading-none)', marginBottom: 'var(--space-2)',
                }}>{m.n}</p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)',
                  marginBottom: 'var(--space-1)' }}>{m.label}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)',
                  letterSpacing: 'var(--tracking-wide)' }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <HR />

        {/* ── REFLECTION ── */}
        <Reveal>
          <Label>Reflection</Label>
          <div style={{ maxWidth: 680 }}>
            <PullQuote color={A}>
              Ambiguity is not a problem to avoid — it is a signal to refine product definition.
            </PullQuote>
            <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)' }}>
                The most important design decision I made was choosing the{' '}
                <strong style={{ color: 'var(--text-primary)' }}>UR nurse over the physician</strong> as
                the primary user. That single choice — driven by understanding who carries accountability
                risk — reoriented the entire product architecture.
              </p>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)' }}>
                Working at the intersection of AI, healthcare regulation, and design systems taught me that{' '}
                <strong style={{ color: 'var(--text-primary)' }}>compliance is differentiation, not overhead</strong>.
                Every HIPAA requirement and FDA explainability mandate is a competitive barrier that protects
                against fast-follower competitors.
              </p>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)', color: 'var(--text-secondary)' }}>
                The CLAUDE.md enforcement mechanism was the most satisfying thing I built — not because
                of the code, but because it solved a systemic problem{' '}
                <strong style={{ color: 'var(--text-primary)' }}>structurally instead of procedurally</strong>.
                You do not fix AI ignoring design tokens by reminding people to follow rules. You make
                rules part of how the tool generates.
              </p>
            </div>
          </div>
        </Reveal>

        <HR />

        {/* ── CLOSING QUOTE ── */}
        <Reveal>
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2.8vw, 32px)',
              fontStyle: 'italic', lineHeight: 'var(--leading-normal)', color: 'var(--text-primary)',
              maxWidth: 620, margin: '0 auto var(--space-5)',
            }}>
              "The product sits between raw clinical data
              and a final clinical decision.
              <em style={{ color: A }}> AI prepares the context. Humans make the call.</em>"
            </p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Core product positioning — CareSummarizer + CareLens
            </p>
          </div>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal delay={0.1}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', paddingBottom: 'var(--space-8)' }}>
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ x: -3 }}
              data-cursor-hover
              style={{
                padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                background: 'transparent', color: 'var(--text-primary)',
                fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'none',
              }}
            >← All Projects</motion.button>
            <motion.a
              href="mailto:sabhay522@gmail.com"
              whileHover={{ scale: 1.02 }}
              data-cursor-hover
              style={{
                padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-lg)',
                background: A, color: '#fff',
                fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}
            >Get in Touch →</motion.a>
          </div>
        </Reveal>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .hc-grid-2 { grid-template-columns: 1fr !important; }
          .hc-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .hc-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Healthcare;
