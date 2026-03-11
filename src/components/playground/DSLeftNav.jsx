/**
 * DSLeftNav.jsx — Apple-quality left sidebar for Design System Builder docs-site
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_TREE } from './dsNavData';

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Geist Sans', system-ui, sans-serif`;

const TIER_STYLE = {
  P1: { color: 'rgba(21,128,61,0.75)',  bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'  },
  P2: { color: 'rgba(29,78,216,0.75)',  bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  P3: { color: 'rgba(0,0,0,0.3)',       bg: 'rgba(0,0,0,0.04)',      border: 'rgba(0,0,0,0.08)'     },
};

function TierBadge({ tier }) {
  const s = TIER_STYLE[tier] ?? TIER_STYLE.P3;
  return (
    <span style={{
      fontSize: 9, padding: '1px 5px', borderRadius: 4, lineHeight: 1,
      border: `1px solid ${s.border}`, background: s.bg, color: s.color,
      fontFamily: '"Geist Mono", monospace', fontWeight: 700, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>{tier}</span>
  );
}

function NavItem({ item, isActive, onSelect, auditErrorCount }) {
  const [hovered, setHovered] = useState(false);
  const isWcag = item.id === 'wcag';
  const showRedDot = isWcag && auditErrorCount > 0 && !isActive;

  return (
    <button
      key={item.id}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px 5px 14px', border: 'none', textAlign: 'left',
        background: isActive ? 'rgba(0,0,0,0.06)' : hovered ? 'rgba(0,0,0,0.025)' : 'transparent',
        borderRadius: 7, cursor: 'pointer',
        transition: 'background 0.1s',
        margin: '0 6px', width: 'calc(100% - 12px)',
      }}>

      {/* Active indicator dot */}
      {isActive && (
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a1814', flexShrink: 0, marginLeft: -2 }} />
      )}
      {!isActive && showRedDot && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginLeft: -2 }} />
      )}
      {!isActive && !showRedDot && (
        <span style={{ width: 4, height: 4, flexShrink: 0, marginLeft: -2 }} />
      )}

      <span style={{
        flex: 1, fontSize: 13, lineHeight: 1.4,
        color: isActive ? '#1a1814' : hovered ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.52)',
        fontWeight: isActive ? 580 : 400,
        fontFamily: FONT,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        letterSpacing: '-0.01em',
      }}>{item.label ?? item.id}</span>

      {item.tier && <TierBadge tier={item.tier} />}
    </button>
  );
}

function NavGroup({ group, selectedPage, onSelect, auditErrorCount }) {
  const [open, setOpen] = useState(true);
  const hasActive = group.items.some(i => i.id === selectedPage);

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Group header */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 5px 14px', border: 'none', background: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}>
        <span style={{
          fontSize: 10, fontWeight: 650, letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: hasActive ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.32)',
          fontFamily: FONT,
        }}>{group.label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          style={{ display: 'flex', color: 'rgba(0,0,0,0.22)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
              {group.items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  <NavItem
                    item={item}
                    isActive={selectedPage === item.id}
                    onSelect={onSelect}
                    auditErrorCount={auditErrorCount}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DSLeftNav({ selectedPage, onSelect, auditErrorCount = 0, systemName }) {
  const [search, setSearch] = useState('');

  const filteredTree = search.trim()
    ? NAV_TREE.map(g => ({
        ...g,
        items: g.items.filter(i => (i.label ?? i.id).toLowerCase().includes(search.toLowerCase())),
      })).filter(g => g.items.length > 0)
    : NAV_TREE;

  return (
    <div style={{
      width: 232, minWidth: 232, height: '100%',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(0,0,0,0.06)',
      background: '#fafaf9',
      overflow: 'hidden', flexShrink: 0,
      fontFamily: FONT,
    }}>

      {/* Search */}
      <div style={{ padding: '10px 12px 8px', flexShrink: 0, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'relative' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(0,0,0,0.3)' }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search components…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '6px 10px 6px 28px',
              borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)',
              background: '#fff', color: '#1a1814',
              fontSize: 12, fontFamily: FONT,
              outline: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)', fontSize: 14, lineHeight: 1, padding: 0 }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Nav tree */}
      <div className="ds-panel-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '4px 0 20px' }}>
        {filteredTree.length === 0 ? (
          <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
            No results for "{search}"
          </div>
        ) : filteredTree.map(group => (
          <NavGroup
            key={group.id}
            group={group}
            selectedPage={selectedPage}
            onSelect={onSelect}
            auditErrorCount={auditErrorCount}
          />
        ))}
      </div>

      {/* Footer — keyboard hints */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <kbd style={{ fontSize: 9, fontFamily: '"Geist Mono",monospace', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, padding: '1px 5px', color: 'rgba(0,0,0,0.4)' }}>Space</kbd>
          <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', fontFamily: FONT }}>regen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <kbd style={{ fontSize: 9, fontFamily: '"Geist Mono",monospace', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, padding: '1px 5px', color: 'rgba(0,0,0,0.4)' }}>⌘E</kbd>
          <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', fontFamily: FONT }}>export</span>
        </div>
      </div>
    </div>
  );
}
