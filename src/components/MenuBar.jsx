/**
 * MenuBar.jsx
 * Fixed top nav bar — always above everything (z-index 1001).
 * Left: 'Abhay Sharma'. Right: 'Resume' link — always visible.
 * Lives outside portfolio-world so overlay blur never affects it.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
      {/* Left: AS monogram → home */}
      <Link to="/" onClick={onLogoClick} className="nav-monogram">
        AS
      </Link>

      {/* Right: About */}
      <Link to="/about" className="nav-resume">
        About
      </Link>

      <style>{`
        .nav-monogram {
          font-family: 'Geist Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(0,0,0,0.70);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-monogram:hover { color: #0A0A0A; }
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
