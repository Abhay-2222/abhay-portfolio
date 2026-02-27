/**
 * MeatInspector.jsx
 * Full dedicated case study page for the Salesforce Meat Inspection Scheduler.
 * Uses the same design language as the overlay but as a scrollable full page.
 * Includes: hero, context, users, problem, system comparison, design process,
 * insight callout, design pillars, results metrics, challenges, and reflection.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import projects from '../data/projects.js';
import CustomCursor from '../components/CustomCursor.jsx';

gsap.registerPlugin(ScrollTrigger);

const project = projects.find(p => p.id === 'meatinspector');
const ACCENT = project.accentColor; // #2E6DB4 (institutional government blue)

/* ─── Shared section wrapper with scroll reveal ─── */
function RevealSection({ children, delay = 0, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  }, [delay]);

  return (
    <div ref={ref} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}

/* ─── Section label ─── */
function Label({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--mono)',
      fontSize: 'var(--text-caption)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 'var(--space-4)',
    }}>
      {children}
    </p>
  );
}

/* ─── Full Page ─── */
function MeatInspector() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 320], [1, 0]);
  const heroY = useTransform(scrollY, [0, 320], [0, -60]);

  // Unlock body scroll for this full-page case study
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  // GSAP hero text animation
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const chars = el.querySelectorAll('.hero-char');
    gsap.fromTo(chars,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.025, ease: 'power3.out', delay: 0.3 }
    );
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const maxWidth = 860;
  const containerStyle = {
    maxWidth,
    margin: '0 auto',
    padding: '0 var(--space-6)',
  };

  return (
    <div style={{
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: 'var(--sans)',
    }}>
      <CustomCursor />

      {/* ── Sticky back button ── */}
      <div style={{
        position: 'fixed',
        top: 'var(--space-5)',
        left: 'var(--space-6)',
        zIndex: 100,
      }}>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03, background: 'var(--glass-bg)' }}
          whileTap={{ scale: 0.97 }}
          data-cursor-hover
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--sans)',
            fontSize: 'var(--text-sm)',
            cursor: 'none',
            transition: 'background 0.2s ease',
          }}
        >
          ← Back
        </motion.button>
      </div>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        ref={heroRef}
      >
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--space-24) var(--space-6) var(--space-16)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background accent blob */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            background: `radial-gradient(ellipse, ${ACCENT}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <p className="hero-char" style={{
            fontFamily: 'var(--mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: 'var(--space-5)',
            opacity: 0,
          }}>
            Ontario Public Service · Product Design
          </p>

          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'var(--text-hero)',
            fontWeight: 500,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--text-primary)',
            maxWidth: 780,
            marginBottom: 'var(--space-5)',
          }}>
            {['Salesforce', ' Meat', ' Inspection', ' Scheduler'].map((word, wi) => (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden' }}>
                <span className="hero-char" style={{ display: 'inline-block', opacity: 0 }}>{word}</span>
              </span>
            ))}
          </h1>

          <p className="hero-char" style={{
            fontFamily: 'var(--sans)',
            fontSize: 'var(--text-subhead)',
            color: 'var(--text-muted)',
            maxWidth: 520,
            lineHeight: 'var(--leading-normal)',
            marginBottom: 'var(--space-8)',
            opacity: 0,
          }}>
            Redesigning Ontario's legacy scheduling system for 600+ meat inspectors — from rigid and broken to fast, reliable, and human-centered.
          </p>

          {/* Meta strip */}
          <div className="hero-char" style={{
            display: 'flex',
            gap: 0,
            flexWrap: 'wrap',
            justifyContent: 'center',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            opacity: 0,
          }}>
            {[
              { label: 'Timeline', value: 'Sep 2023 – Apr 2024' },
              { label: 'Platform', value: 'Salesforce FSL' },
              { label: 'Client', value: 'OMAFRA · OPS' },
            ].map((item, i) => (
              <div key={item.label} style={{
                padding: 'var(--space-3) var(--space-6)',
                borderRight: i < 2 ? '1px solid var(--glass-border)' : 'none',
                textAlign: 'center',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
              }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>{item.label}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--glass-border)', maxWidth: maxWidth, margin: '0 auto var(--space-16)', opacity: 0.5 }} />

      {/* ══════════════════════════════════════
          CONTEXT
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>Context</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-loose)', color: 'var(--text-primary)' }}>
                {project.description}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Organisation', value: project.org },
                { label: 'Timeline', value: project.timeline },
                { label: 'Platform', value: project.platform },
                { label: 'Team', value: project.team.join(', ') },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)', width: 96, flexShrink: 0, paddingTop: 2 }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          USERS
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>Users</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {project.users.map(user => (
              <div key={user.title} style={{
                padding: 'var(--space-6)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(12px)',
              }}>
                <span style={{ fontSize: 'var(--text-xl)', display: 'block', marginBottom: 'var(--space-3)' }}>{user.icon}</span>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{user.title}</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>{user.description}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          PROBLEM
      ══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            borderTop: '1px solid var(--glass-border)',
            borderBottom: '1px solid var(--glass-border)',
            padding: 'var(--space-16) var(--space-6)',
          }}>
            <div style={containerStyle}>
              <Label>The Problem</Label>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 'var(--text-heading)',
                fontStyle: 'italic',
                lineHeight: 'var(--leading-snug)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-10)',
                maxWidth: 640,
              }}>
                "Ontario's legacy Siebel system was built for the system, not the person."
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: ACCENT, marginBottom: 'var(--space-3)' }}>Problem</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 'var(--leading-loose)' }}>{project.problem}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: ACCENT, marginBottom: 'var(--space-3)' }}>Objective</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 'var(--leading-loose)' }}>{project.objective}</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          SYSTEM COMPARISON
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>System Transformation</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 0, alignItems: 'start' }}>
            <div style={{
              padding: 'var(--space-7) var(--space-6)',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
            }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Before</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-5)' }}>{project.oldSystem.name}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {project.oldSystem.traits.map(t => (
                  <li key={t} style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', lineHeight: 'var(--leading-snug)' }}>
                    <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 1 }}>✕</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: 'var(--text-lg)' }}>→</div>

            <div style={{
              padding: 'var(--space-7) var(--space-6)',
              background: `${ACCENT}0e`,
              border: `1px solid ${ACCENT}30`,
              borderRadius: '0 var(--radius-xl) var(--radius-xl) 0',
            }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>After</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-md)', fontWeight: 500, color: ACCENT, marginBottom: 'var(--space-5)' }}>{project.newSystem.name}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {project.newSystem.traits.map(t => (
                  <li key={t} style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', lineHeight: 'var(--leading-snug)' }}>
                    <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          DESIGN PROCESS
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>Design Process</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            {project.process.map((step, i) => (
              <RevealSection key={step.step} delay={i * 0.08}>
                <div style={{
                  padding: 'var(--space-6) var(--space-5)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  height: '100%',
                  backdropFilter: 'blur(12px)',
                }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: ACCENT, letterSpacing: 'var(--tracking-snug)', marginBottom: 'var(--space-2)' }}>{step.step}</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{step.phase}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{step.title}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>{step.description}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          INSIGHT CALLOUT
      ══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <div style={{
            background: `${ACCENT}12`,
            borderTop: `1px solid ${ACCENT}25`,
            borderBottom: `1px solid ${ACCENT}25`,
            padding: 'var(--space-16) var(--space-6)',
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: ACCENT, marginBottom: 'var(--space-4)' }}>Key Insight</p>
              <p style={{
                fontFamily: 'var(--serif)',
                fontSize: 'var(--text-heading)',
                fontStyle: 'italic',
                lineHeight: 'var(--leading-snug)',
                color: ACCENT,
              }}>
                "{project.insight}"
              </p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          DESIGN PILLARS
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>Design Pillars</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
            {project.pillars.map((pillar, i) => (
              <RevealSection key={pillar.number} delay={i * 0.07}>
                <div style={{
                  padding: 'var(--space-7) var(--space-6)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  gap: 'var(--space-5)',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 300,
                    color: 'var(--text-faint)',
                    lineHeight: 'var(--leading-none)',
                    flexShrink: 0,
                  }}>{pillar.number}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{pillar.title}</p>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>{pillar.description}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          RESULTS METRICS
      ══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid var(--glass-border)',
            borderBottom: '1px solid var(--glass-border)',
            padding: 'var(--space-16) var(--space-6)',
          }}>
            <div style={containerStyle}>
              <Label>Impact & Results</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }}>
                {project.results.map((result, i) => (
                  <RevealSection key={result.label} delay={i * 0.1}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 'var(--text-stat)', display: 'block', marginBottom: 'var(--space-4)' }}>{result.icon}</span>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{result.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-md)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{result.before}</span>
                        <span style={{ color: 'var(--text-faint)', fontSize: 'var(--text-base)' }}>→</span>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-xl)', fontWeight: 500, color: ACCENT }}>{result.after}</span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        color: ACCENT,
                        letterSpacing: 'var(--tracking-wide)',
                        padding: 'var(--space-1) var(--space-3)',
                        background: `${ACCENT}15`,
                        borderRadius: 'var(--radius-xl)',
                        display: 'inline-block',
                      }}>
                        {result.improvement}
                      </p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          CHALLENGES
      ══════════════════════════════════════ */}
      <section style={{ ...containerStyle, marginBottom: 'var(--space-20)' }}>
        <RevealSection>
          <Label>Challenges</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
            {project.challenges.map((challenge, i) => (
              <RevealSection key={challenge.category} delay={i * 0.08}>
                <div style={{
                  padding: 'var(--space-6) var(--space-5)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  backdropFilter: 'blur(12px)',
                  height: '100%',
                }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: ACCENT, marginBottom: 'var(--space-4)' }}>{challenge.category}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {challenge.items.map(item => (
                      <li key={item} style={{
                        fontFamily: 'var(--sans)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                        lineHeight: 'var(--leading-normal)',
                        display: 'flex',
                        gap: 'var(--space-2)',
                        alignItems: 'flex-start',
                      }}>
                        <span style={{ color: 'var(--text-faint)', flexShrink: 0 }}>—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          REFLECTION
      ══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-24)' }}>
        <RevealSection>
          <div style={{
            ...containerStyle,
            padding: 'var(--space-16) var(--space-6)',
            textAlign: 'center',
          }}>
            <Label>Reflection</Label>
            <blockquote style={{
              fontFamily: 'var(--serif)',
              fontSize: 'var(--text-heading)',
              fontStyle: 'italic',
              lineHeight: 'var(--leading-normal)',
              color: 'var(--text-primary)',
              maxWidth: 680,
              margin: '0 auto var(--space-8)',
            }}>
              "{project.reflection}"
            </blockquote>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-snug)' }}>
              — Abhay Sharma, Product Designer
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: 'var(--space-8) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        maxWidth: maxWidth,
        margin: '0 auto',
      }}>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          data-cursor-hover
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--sans)',
            fontSize: 'var(--text-sm)',
            cursor: 'none',
            backdropFilter: 'blur(12px)',
          }}
        >
          ← Back to Portfolio
        </motion.button>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Abhay Sharma · Product Designer & Educator
        </p>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

export default MeatInspector;
