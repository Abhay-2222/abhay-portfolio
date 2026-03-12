/**
 * About.jsx — Editorial about page.
 * Left 50%: bio + experience/education/tools stacked.
 * Right 50%: sticky full-height photo carousel with padding.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─── Data ───────────────────────────────────────────────────────────── */
const EXPERIENCE = [
  { company: 'Vosyn AI',                       title: 'Team Lead and Designer, Product Experience', meta: 'AI SaaS, Multilingual Media',               period: 'Apr 2025 to Present'  },
  { company: 'McMaster University',            title: 'Sessional Faculty / Instructor',             meta: 'Digital Media and Interactive Storytelling', period: 'Jan 2025 to Present'  },
  { company: 'Ontario Public Service, OMAFRA', title: 'UX Designer',                                meta: 'Government SaaS',                             period: 'Sep 2023 to Apr 2024' },
  { company: 'Accenture (Kaiser Permanente)',  title: 'UX Developer and Analyst',                   meta: 'Healthcare, EMR Platform',                    period: 'Aug 2019 to Aug 2022' },
];

const EDUCATION = [
  { school: 'McMaster University', degree: 'MEng Design, Product Design',   period: '2022 – 2024' },
  { school: 'GGSIPU',              degree: 'B.Tech, Information Technology', period: '2015 – 2019' },
];

const SKILLS = ['Figma', 'Salesforce', 'Unity', 'Jira', 'Maze', 'Miro', 'v0', 'Lovable', 'HTML/CSS', 'JavaScript'];

/* ─── Gallery: auto-detect all images ────────────────────────────────
 * Drop any jpg / png / webp into  src/assets/gallery/
 * No naming convention needed — all files are picked up automatically.
 * ──────────────────────────────────────────────────────────────────── */
const _galleryModules = import.meta.glob(
  '../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);
const GALLERY_SRCS = Object.values(_galleryModules).map((m) => m.default);

const SLIDES = [
  { src: '/about/photo-me.jpg',      label: 'Me',            grad: 'linear-gradient(160deg,#c8bdb0 0%,#907060 100%)' },
  { src: '/about/photo-toronto.jpg', label: 'Toronto',       grad: 'linear-gradient(160deg,#b0becb 0%,#6880a0 100%)' },
  { src: '/about/photo-camera.jpg',  label: 'Camera Roll',   grad: 'linear-gradient(160deg,#c8bea0 0%,#988050 100%)' },
  { src: '/about/photo-gaming.jpg',  label: 'Off the Clock', grad: 'linear-gradient(160deg,#a8c0b2 0%,#608878 100%)' },
];

/* ─── Animation ─────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Photo carousel ─────────────────────────────────────────────────── */
function PhotoCarousel() {
  const [idx,    setIdx]    = useState(0);
  const [failed, setFailed] = useState({});

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="ap-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="ap-carousel-slide"
          style={{ background: slide.grad }}
        >
          {!failed[idx] && (
            <img
              src={slide.src}
              alt={slide.label}
              onError={() => setFailed(f => ({ ...f, [idx]: true }))}
            />
          )}
          <div className="ap-carousel-overlay" />
          <span className="ap-carousel-label">{slide.label}</span>
        </motion.div>
      </AnimatePresence>

      <div className="ap-carousel-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={'ap-carousel-dot' + (i === idx ? ' active' : '')}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Gallery image ──────────────────────────────────────────────────── */
function GalleryImage({ src, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -32px 0px' });
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.045, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.015, transition: { duration: 0.3, ease: [0.22,1,0.36,1] } }}
      style={{
        breakInside: 'avoid',
        marginBottom: 14,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#ede8e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.06)',
        cursor: 'zoom-in',
        willChange: 'transform',
      }}
    >
      {/* Shimmer while loading */}
      {!loaded && (
        <div style={{
          minHeight: 180,
          background: 'linear-gradient(90deg, #ede8e0 25%, #e4ddd4 50%, #ede8e0 75%)',
          backgroundSize: '200% 100%',
          animation: 'gal-shimmer 1.5s ease-in-out infinite',
        }} />
      )}
      <img
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: loaded ? 'block' : 'none',
        }}
      />
    </motion.div>
  );
}

/* ─── Photo gallery overlay ──────────────────────────────────────────── */
function PhotoGallery({ onClose }) {
  const count = GALLERY_SRCS.length;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#f7f4ef',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        @keyframes gal-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '28px 56px 24px',
        background: '#f7f4ef',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(20px, 2vw, 30px)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Shots
          </span>
          {count > 0 && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              {count} shot{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          data-cursor-hover
          style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            borderRadius: 20, padding: '7px 16px',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Thin rule under header */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 56px' }} />

      {/* Empty state */}
      {count === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)',
          gap: 12,
        }}>
          <span style={{ fontSize: 28, opacity: 0.2 }}>◻</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            Drop photos into src/assets/gallery/
          </span>
        </div>
      )}

      {/* Masonry grid */}
      {count > 0 && (
        <div
          className="ap-gallery-cols"
          style={{
            columns: 3,
            columnGap: 14,
            padding: '32px 56px 80px',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {GALLERY_SRCS.map((src, i) => (
            <GalleryImage key={i} src={src} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function About() {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);

  return (
    <>
      <style>{`
        /* ── Shell ── */
        .ap {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text-primary);
          font-family: var(--sans);
        }

        /* ── Back pill ── */
        .ap-back {
          position: fixed; top: 16px; left: 16px; z-index: 100;
          display: flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 10px; font-weight: 500;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px; padding: 8px 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, color 0.15s;
        }
        .ap-back:hover {
          background: rgba(255,255,255,0.95);
          color: #0A0A0A;
          transform: translateY(-3px);
        }

        /* ── Hero ── */
        .ap-hero {
          padding: 72px 56px 40px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .ap-hero-name {
          font-family: var(--sans);
          font-size: clamp(24px, 2.2vw, 34px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .ap-hero-sub {
          font-family: var(--sans);
          font-size: var(--text-sm);
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.6;
        }

        /* ── Body: 50 / 50 split ── */
        .ap-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
        }

        /* ── Left column ── */
        .ap-left {
          border-right: 1px solid var(--border-subtle);
          padding: 52px 56px 72px;
        }

        /* ── Section label ── */
        .ap-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ap-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        /* ── Bio ── */
        .ap-bio {
          font-size: var(--text-sm);
          line-height: 1.85;
          color: var(--text-secondary);
          margin: 0 0 36px;
        }

        /* ── Hobbies list ── */
        .ap-list {
          list-style: none;
          padding: 0;
          margin: 0 0 36px;
        }
        .ap-list li {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          padding: 5px 0 5px 16px;
          position: relative;
          line-height: 1.6;
          border-bottom: 1px solid var(--border-subtle);
        }
        .ap-list li:first-child { border-top: 1px solid var(--border-subtle); }
        .ap-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--text-muted);
          font-size: 10px;
          top: 7px;
        }

        /* ── Contact ── */
        .ap-contact-line {
          font-size: var(--text-xs);
          color: var(--text-muted);
          line-height: 2;
          margin: 0 0 52px;
        }
        .ap-ilink {
          color: var(--text-secondary);
          text-decoration: none;
          border-bottom: 1px solid var(--border-default);
          padding-bottom: 1px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ap-ilink:hover {
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        /* ── Experience rows ── */
        .ap-section { margin-bottom: 40px; }
        .ap-section:last-child { margin-bottom: 0; }

        .ap-exp-row {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 0 16px;
          align-items: start;
          padding: 14px 0;
          border-bottom: 1px solid var(--border-subtle);
          border-radius: 4px;
          cursor: default;
          transition: background 0.15s;
        }
        .ap-exp-row:first-of-type { border-top: 1px solid var(--border-subtle); }
        .ap-exp-row:hover {
          background: var(--bg-secondary);
          padding-left: 8px; padding-right: 8px;
          margin-left: -8px; margin-right: -8px;
        }
        .ap-exp-num {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-muted);
          padding-top: 2px;
          letter-spacing: 0.04em;
        }
        .ap-exp-company {
          font-size: var(--text-sm);
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          margin-bottom: 2px;
        }
        .ap-exp-title {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .ap-exp-meta {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 4px;
          letter-spacing: 0.02em;
        }
        .ap-exp-period {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
          padding-top: 3px;
          text-align: right;
          letter-spacing: 0.02em;
        }

        /* ── Skills chips ── */
        .ap-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .ap-skill {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-pill);
          padding: 4px 10px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ap-skill:hover {
          color: var(--text-secondary);
          border-color: var(--border-strong);
        }

        /* ── Resume download ── */
        .ap-dl {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 24px;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-primary);
          text-decoration: none;
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-pill);
          padding: 8px 18px;
          transition: background 0.15s, color 0.15s;
        }
        .ap-dl:hover {
          background: var(--text-primary);
          color: var(--bg);
        }

        /* ── Right column: sticky carousel ── */
        .ap-right {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 24px;
        }

        .ap-carousel {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .ap-carousel-slide {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
        }
        .ap-carousel-slide img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .ap-carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.04) 50%);
        }
        .ap-carousel-label {
          position: absolute;
          bottom: 22px;
          left: 22px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.72);
          text-shadow: 0 1px 6px rgba(0,0,0,0.4);
        }
        .ap-carousel-dots {
          position: absolute;
          bottom: 22px;
          right: 20px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }
        .ap-carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          padding: 0;
          background: rgba(255,255,255,0.28);
          transition: background 0.2s, transform 0.2s;
        }
        .ap-carousel-dot.active {
          background: rgba(255,255,255,0.88);
          transform: scale(1.25);
        }

        /* ── Mobile ── */
        @media (max-width: 860px) {
          .ap-hero  { padding: 72px 24px 40px; }
          .ap-body  { grid-template-columns: 1fr; }
          .ap-left  { padding: 40px 24px 48px; border-right: none; }
          .ap-right { position: relative; height: 300px; padding: 16px; }
          .ap-carousel { border-radius: 14px; }
        }
        @media (max-width: 480px) {
          .ap-hero-name { font-size: 22px; }
          .ap-right { height: 260px; }
        }

        /* ── Gallery button ── */
        .ap-gallery-btn {
          position: fixed; top: 16px; right: 16px; z-index: 100;
          display: flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 10px; font-weight: 500;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px; padding: 8px 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, color 0.15s;
        }
        .ap-gallery-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #0A0A0A;
          transform: translateY(-3px);
        }

        /* ── Gallery responsive columns ── */
        @media (max-width: 860px) {
          .ap-gallery-cols { columns: 2 !important; padding: 16px 24px 48px !important; }
        }
        @media (max-width: 480px) {
          .ap-gallery-cols { columns: 1 !important; padding: 12px 16px 40px !important; }
        }
      `}</style>

      <div className="ap">

        {/* Gallery overlay */}
        <AnimatePresence>
          {showGallery && <PhotoGallery onClose={() => setShowGallery(false)} />}
        </AnimatePresence>

        {/* Back pill */}
        <motion.button
          className="ap-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
          data-cursor-hover
          {...fadeUp(0)}
        >
          ← AS
        </motion.button>

        {/* Gallery pill */}
        <motion.button
          className="ap-gallery-btn"
          onClick={() => setShowGallery(true)}
          aria-label="Open gallery"
          data-cursor-hover
          {...fadeUp(0.04)}
        >
          Shots
        </motion.button>

        {/* Hero */}
        <motion.div className="ap-hero" {...fadeUp(0.05)}>
          <h1 className="ap-hero-name">Abhay Sharma</h1>
          <p className="ap-hero-sub">
            Product Designer and Educator based in Toronto, ON.
            5+ years shipping AI, healthcare and government products.
          </p>
        </motion.div>

        {/* 50 / 50 body */}
        <div className="ap-body">

          {/* Left: bio + experience stacked */}
          <motion.div className="ap-left" {...fadeUp(0.10)}>

            <p className="ap-bio">
              I care about the thoughtful details that turn good design into great
              experiences. I love getting into the&nbsp;<em>how</em>: the process, the
              decisions, and the craft behind every pixel.
            </p>

            <p className="ap-label">Outside of design</p>
            <ul className="ap-list">
              <li>Gaming on PC and console</li>
              <li>Staying active, gym and outdoor runs</li>
              <li>Chasing shots with my camera</li>
              <li>Anime series and film marathons</li>
            </ul>

            <p className="ap-label">Say hello</p>
            <p className="ap-contact-line">
              <a href="mailto:sabhay522@gmail.com" className="ap-ilink">sabhay522@gmail.com</a>
              <br />
              <a href="https://www.linkedin.com/in/abhaydesigns/" target="_blank" rel="noopener noreferrer" className="ap-ilink">
                LinkedIn ↗
              </a>
            </p>

            <div className="ap-section">
              <p className="ap-label">Experience</p>
              {EXPERIENCE.map((e, i) => (
                <div key={e.company} className="ap-exp-row">
                  <span className="ap-exp-num">0{i + 1}</span>
                  <div>
                    <div className="ap-exp-company">{e.company}</div>
                    <div className="ap-exp-title">{e.title}</div>
                    <div className="ap-exp-meta">{e.meta}</div>
                  </div>
                  <div className="ap-exp-period">{e.period}</div>
                </div>
              ))}
            </div>

            <div className="ap-section">
              <p className="ap-label">Education</p>
              {EDUCATION.map((e, i) => (
                <div key={e.school} className="ap-exp-row">
                  <span className="ap-exp-num">0{i + 1}</span>
                  <div>
                    <div className="ap-exp-company">{e.school}</div>
                    <div className="ap-exp-title">{e.degree}</div>
                  </div>
                  <div className="ap-exp-period">{e.period}</div>
                </div>
              ))}
            </div>

            <div className="ap-section">
              <p className="ap-label">Tools</p>
              <div className="ap-skills">
                {SKILLS.map((s) => (
                  <span key={s} className="ap-skill">{s}</span>
                ))}
              </div>
            </div>

            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="ap-dl" data-cursor-hover>
              ↓ &nbsp;Full Resume PDF
            </a>

          </motion.div>

          {/* Right: sticky full-height carousel with padding */}
          <motion.div className="ap-right" {...fadeUp(0.18)}>
            <PhotoCarousel />
          </motion.div>

        </div>
      </div>
    </>
  );
}
