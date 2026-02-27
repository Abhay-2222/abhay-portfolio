/**
 * MenuBar.jsx
 * Fixed top nav bar — always above everything (z-index 1001).
 * Left: 'Abhay Sharma'. Right: 'Resume' link — always visible.
 * Lives outside portfolio-world so overlay blur never affects it.
 */

import { motion } from 'framer-motion';

function MenuBar({ onLogoClick }) {
  return (
    <motion.header
      className="menubar-layer"
      initial={{ y: -44, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height:              44,
        display:             'flex',
        alignItems:          'center',
        justifyContent:      'space-between',
        paddingLeft:         24,
        paddingRight:        24,
        background:          'rgba(255,255,255,0.92)',
        backdropFilter:      'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom:        '1px solid rgba(0,0,0,0.06)',
        userSelect:          'none',
      }}
    >
      {/* Left: name */}
      <span
        onClick={onLogoClick}
        style={{
          fontFamily:    '"Geist Sans", system-ui, sans-serif',
          fontSize:      14,
          fontWeight:    500,
          color:         '#0A0A0A',
          letterSpacing: '-0.01em',
          cursor:        'default',
        }}
      >
        Abhay Sharma
      </span>

      {/* Right: Resume */}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="nav-resume"
      >
        Resume
      </a>

      <style>{`
        .nav-resume {
          font-family: 'Geist Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(0,0,0,0.45);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-resume:hover { color: #0A0A0A; }
        @media (max-width: 600px) {
          .nav-resume { display: none; }
        }
      `}</style>
    </motion.header>
  );
}

export default MenuBar;
