/**
 * TrailAR.jsx
 * SCHT Trail AR App — magazine editorial layout.
 * Deliberately distinct from Healthcare.jsx and MeatInspector.jsx:
 * no card grids, no meta tables, full-width typographic chapters,
 * horizontal process timeline, full-width numbered opportunity strips.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor.jsx';

gsap.registerPlugin(ScrollTrigger);

const A  = '#2D6A45'; // deep forest green (design system)
const A2 = '#4dbe8a'; // green secondary
const A3 = '#d4a853'; // gold
const A4 = '#9b87f5'; // purple

/* ─── Scroll-reveal ─── */
function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
    );
  }, [delay, y]);
  return <div ref={ref} style={{ opacity: 0, ...style }}>{children}</div>;
}

/* ─── Chapter divider with number ─── */
function Chapter({ n, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
      margin: 'var(--space-24) 0 var(--space-12)',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', fontWeight: 500,
        color: A, letterSpacing: 'var(--tracking-widest)',
      }}>{String(n).padStart(2, '0')}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase', color: 'var(--text-tertiary)',
      }}>{label}</span>
    </div>
  );
}

/* ─── Full-width opportunity row ─── */
function OpRow({ n, area, quote, description, badges, color }) {
  return (
    <Reveal>
      <div style={{
        display: 'grid', gridTemplateColumns: '72px 1fr',
        gap: '0 var(--space-12)', padding: 'var(--space-12) 0',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 'var(--text-stat)',
            fontWeight: 300, color: `${color}30`, lineHeight: 'var(--leading-none)',
          }}>{String(n).padStart(2, '0')}</span>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase', color: color, marginBottom: 'var(--space-2)' }}>Opportunity</p>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 2.4vw, 28px)',
            fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-tight)' }}>
            {area}
          </h3>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-base)', fontStyle: 'italic',
            color: 'var(--text-secondary)', lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-4)',
            maxWidth: 540,
            borderLeft: `2px solid ${color}40`, paddingLeft: 'var(--space-4)' }}>
            "{quote}"
          </p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-loose)',
            color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 'var(--space-5)' }}>
            {description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {badges.map(b => (
              <span key={b} style={{
                fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase', padding: '3px var(--space-2)', borderRadius: 'var(--radius-xl)',
                background: `${color}12`, color: color, border: `1px solid ${color}28`,
              }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function TrailARPage() {
  const navigate  = useNavigate();
  const heroRef   = useRef(null);
  const tlRef     = useRef(null);

  /* Unlock scroll */
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.cursor   = 'none';
    return () => { document.body.style.overflow = 'hidden'; };
  }, []);

  /* GSAP — hero words */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const words = el.querySelectorAll('.word');
    gsap.fromTo(words,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.3 }
    );
  }, []);

  /* GSAP — horizontal timeline line draw */
  useEffect(() => {
    const line = tlRef.current;
    if (!line) return;
    gsap.fromTo(line,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: line, start: 'top 80%', once: true } }
    );
  }, []);

  const WORDS = ['Spencer', 'Creek'];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <CustomCursor />

      {/* ── Back nav ── */}
      <motion.button
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        data-cursor-hover
        style={{
          position: 'fixed', top: 28, left: 32, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)',
          background: 'var(--glass-bg)', border: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)', fontFamily: 'var(--sans)',
          fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'none',
        }}
      >← Portfolio</motion.button>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 var(--space-10) 140px' }}>

        {/* ══ HERO — no badge, no meta grid ══ */}
        <div style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-16)' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-10)' }}
          >02 — Product Design &amp; User Research</motion.p>

          {/* Word-split title */}
          <h1 ref={heroRef} style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(52px, 8vw, 108px)',
            fontWeight: 500, lineHeight: 'var(--leading-none)',
            letterSpacing: 'var(--tracking-tightest)',
            marginBottom: 0, overflow: 'hidden',
          }}>
            {WORDS.map((w, i) => (
              <span key={w} className="word" style={{
                display: 'block', opacity: 0,
                color: i === 1 ? A : 'var(--text-primary)',
                fontStyle: i === 1 ? 'italic' : 'normal',
              }}>{w}</span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ marginTop: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-snug)' }}>Jan – Aug 2023</span>
            <span style={{ width: 1, height: 12, background: 'var(--border-default)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-snug)' }}>McMaster University</span>
            <span style={{ width: 1, height: 12, background: 'var(--border-default)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-snug)' }}>AR + Mobile App</span>
          </motion.div>
        </div>

        {/* ══ OPENING — editorial lead paragraph ══ */}
        <Reveal y={16}>
          <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-2)' }}>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.4vw, 24px)',
              fontStyle: 'italic', lineHeight: 'var(--leading-loose)', color: 'var(--text-primary)',
              maxWidth: 700,
            }}>
              Spencer Creek Trail was once a beloved pathway winding through the heart of Dundas — linking forests, bridges, and historical landmarks into a single, living story of the community.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p style={{
            fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)',
            color: 'var(--text-secondary)', maxWidth: 620, marginTop: 'var(--space-6)',
          }}>
            As the town grew, the trail broke apart. What was once a connected route became a scattered series of forgotten paths. Our team at McMaster partnered with the Rotary Club of Dundas to design a digital experience that could bring it back to life.
          </p>
        </Reveal>

        {/* ══ PROBLEM ══ */}
        <Chapter n={1} label="Problem" />

        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
            <div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
                The Problem
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(15px, 1.8vw, 18px)',
                lineHeight: 'var(--leading-loose)', color: 'var(--text-primary)' }}>
                Spencer Creek Trail is physically fragmented and its rich history is slowly being forgotten. The community has become disconnected from a space that once carried shared memories, stories, and a sense of place.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase', color: A, marginBottom: 'var(--space-5)' }}>
                The Objective
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(15px, 1.8vw, 18px)',
                lineHeight: 'var(--leading-loose)', color: 'var(--text-primary)' }}>
                Design a digital experience that reconnects the trail while restoring its historical and cultural meaning — so every visitor can explore with a deeper sense of context, belonging, and discovery.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div style={{
            marginTop: 'var(--space-12)', padding: 'var(--space-8) var(--space-10)',
            borderLeft: `3px solid ${A}`, background: `${A}07`,
          }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase', color: A, marginBottom: 'var(--space-3)' }}>How might we</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(16px, 2vw, 22px)',
              fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 'var(--leading-normal)' }}>
              Use design to restore awareness, connection, and pride in a forgotten landmark?
            </p>
          </div>
        </Reveal>

        {/* ══ RESEARCH PROCESS — horizontal timeline ══ */}
        <Chapter n={2} label="Research" />

        <Reveal>
          {/* Timeline */}
          <div style={{ position: 'relative', marginBottom: 'var(--space-16)' }}>
            {/* The line */}
            <div
              ref={tlRef}
              style={{
                position: 'absolute', top: 10, left: 0, right: 0, height: 1,
                background: 'var(--border-default)',
                transformOrigin: 'left center',
              }}
            />
            {/* Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { phase: 'Discover', title: 'Field Research', detail: 'Trail walks · museum archives · Facebook sentiment', color: A },
                { phase: 'Primary', title: 'Stakeholder Interviews', detail: 'Dundas Museum historians · guided trail walk', color: A3 },
                { phase: 'Secondary', title: 'Community Sentiment', detail: 'Online forums · nostalgia · shared memory patterns', color: A2 },
                { phase: 'Co-create', title: 'Workshops', detail: 'Rotary Club · service blueprinting · journey mapping', color: A4 },
              ].map((s, i) => (
                <div key={s.phase} style={{ paddingTop: 'var(--space-7)', paddingRight: 'var(--space-5)' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: s.color, marginBottom: 'var(--space-5)',
                    boxShadow: `0 0 0 3px var(--bg), 0 0 0 4px ${s.color}60`,
                  }} />
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-wide)',
                    textTransform: 'uppercase', color: s.color, marginBottom: 'var(--space-2)' }}>{s.phase}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-snug)' }}>{s.title}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Research detail — two-col narrative */}
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', marginBottom: 'var(--space-12)' }}>
            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-loose)',
                color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                We began by walking every section of the trail, observing how bird watchers, cyclists, and families each used the space differently. The Dundas Museum provided historical maps and archival photographs tracing the trail's industrial-to-ecological evolution.
              </p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-loose)',
                color: 'var(--text-secondary)' }}>
                Online community forums became an unexpected archive — residents shared memories of old bridges, mills, and childhood routes. Three emotional themes emerged across every data source.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Nostalgia', desc: '"I wish people still knew what this place meant."', color: A3 },
                { label: 'Frustration', desc: '"You cannot even tell where the trail starts."', color: '#e87878' },
                { label: 'Hope', desc: '"It could be revived instead of forgotten."', color: A2 },
              ].map((t, i, arr) => (
                <div key={t.label} style={{
                  padding: 'var(--space-5) 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase', color: t.color, flexShrink: 0, paddingTop: 2,
                    minWidth: 90,
                  }}>{t.label}</span>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
                    color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Stakeholder voices */}
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
            {[
              {
                quote: "Designing the trail's digital layer isn't just about technology — it's about accessibility, storytelling, and community pride.",
                who: 'Prof. Brian Baetz, Dean, McMaster University',
                color: A4,
              },
              {
                quote: "Our goal is to make it accessible and enjoyable for all ages while preserving what makes it special.",
                who: 'Fraser Forrest, Rotary Club of Dundas',
                color: A,
              },
            ].map(v => (
              <div key={v.who} style={{ paddingLeft: 'var(--space-5)', borderLeft: `2px solid ${v.color}50` }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--text-base)', fontStyle: 'italic',
                  color: 'var(--text-secondary)', lineHeight: 'var(--leading-loose)', marginBottom: 'var(--space-3)' }}>"{v.quote}"</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-caption)', color: v.color,
                  letterSpacing: 'var(--tracking-snug)' }}>— {v.who}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ KEY INSIGHT — full-width tint block ══ */}
        <Chapter n={3} label="Key Insight" />

        <Reveal y={12}>
          <div style={{
            padding: 'var(--space-20) var(--space-16)',
            background: `${A}08`,
            borderTop: `1px solid ${A}20`,
            borderBottom: `1px solid ${A}20`,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(22px, 3.2vw, 38px)',
              fontStyle: 'italic',
              fontWeight: 500,
              color: A,
              lineHeight: 'var(--leading-snug)',
              maxWidth: 640,
              margin: '0 auto',
            }}>
              "The trail's disconnection<br />was as much cultural as physical."
            </p>
          </div>
        </Reveal>

        {/* ══ OPPORTUNITY AREAS — full-width numbered rows ══ */}
        <Chapter n={4} label="Opportunity Areas" />

        <Reveal>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)',
            color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 'var(--space-2)' }}>
            Four community needs shaped our design directions. Each rooted in real problems, supported by resident voices.
          </p>
        </Reveal>

        <OpRow
          n={1} color={A}
          area="Interactive Trail Map"
          quote="I have lived here 20 years and still do not know where the trail actually starts."
          description="Reconnect fragmented sections with a single, navigable map. Reduce confusion and improve accessibility — especially for elderly users and first-time visitors."
          badges={['Reduces Confusion', 'Improves Accessibility', 'Supports Elderly']}
        />
        <OpRow
          n={2} color={A3}
          area="AR Story Stops"
          quote="We used to cross the old stone bridge as kids. I wish people still knew what it meant to this town."
          description="Heritage points overlaid directly onto the landscape via AR — turning the trail into a living museum. Builds cultural pride and emotional connection across generations."
          badges={['Living Museum', 'Cultural Pride', 'Emotional Connection']}
        />
        <OpRow
          n={3} color={A2}
          area="Eco Discovery Mode"
          quote="I walk the trail all the time, but I never knew what wildlife actually lives here."
          description="Wildlife identification, ecological storytelling, and gamified challenges. Supports school trips and raises environmental awareness through play."
          badges={['Environmental Awareness', 'School Trips', 'Gamification']}
        />
        <OpRow
          n={4} color={A4}
          area="Community Hub"
          quote="The trail should feel like part of the town, not something hidden behind it."
          description="Local events, vendors, and community-driven content integrated into the trail experience. Boosts footfall and economic activity for surrounding businesses."
          badges={['Community Economy', 'Boosts Footfall', 'Social Connection']}
        />

        {/* ══ DESIGN EVOLUTION ══ */}
        <Chapter n={5} label="Design Evolution" />

        <Reveal>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)',
            color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 'var(--space-10)' }}>
            User feedback reshaped broad early concepts into place-specific features. Each evolution reflects a shift from generic utility to community-first meaning.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[
              { before: 'Panic button + Emergency contacts + Location sharing', after: 'Emergency Beacon', desc: 'One-tap safety, no panic', color: '#e87878' },
              { before: 'General event listing', after: 'Community Events', desc: 'Connection in place', color: A3 },
              { before: 'Achievement badges', after: 'Trail Rewards', desc: 'Return-visit motivation', color: A2 },
              { before: 'Account settings', after: 'Profile Page', desc: 'Personal trail story', color: A4 },
            ].map((row, i) => (
              <div key={row.after} style={{
                display: 'grid', gridTemplateColumns: '1fr 24px 1fr',
                padding: 'var(--space-7) 0', alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)', lineHeight: 'var(--leading-normal)', paddingRight: 'var(--space-6)' }}>
                  {row.before}
                </p>
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>→</p>
                <div style={{ paddingLeft: 'var(--space-6)' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', fontWeight: 500,
                    color: row.color, marginBottom: 'var(--space-1)' }}>{row.after}</p>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)' }}>{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ REFLECTION ══ */}
        <Chapter n={6} label="Reflection" />

        <Reveal>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-loose)',
            color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 'var(--space-12)' }}>
            This project taught me that designing for outdoor spaces is not the same as designing for screens. It requires understanding history, ecology, community pride, and the emotional role a place holds over time. Working with historians, city staff, Rotary members, and long-time residents showed me how design can help reconnect people to something they thought they had already lost.
          </p>
        </Reveal>

        <Reveal>
          <div style={{ borderLeft: `3px solid ${A}`, paddingLeft: 'var(--space-7)' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.4vw, 26px)',
              fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 'var(--leading-loose)' }}>
              "Good design does not replace human experience — it amplifies it. The digital layer is not the destination. The trail is."
            </p>
          </div>
        </Reveal>

        {/* ══ CTA ══ */}
        <div style={{ marginTop: 'var(--space-20)' }}>
          <Reveal>
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              data-cursor-hover
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-6)', background: A,
                color: '#fff', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--sans)',
                fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'none', border: 'none',
              }}
            >← Back to Portfolio</motion.button>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
