/**
 * ExportModal.jsx — Task 6.3
 * 5-tab export modal: CSS | Tailwind | JSON | React Kit | Share
 * GSAP entrance, Escape to close, focus-trapped
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  exportCSS, exportTailwind, exportDesignTokensJSON,
  exportReactComponents, encodeTokensToURL,
  exportSCSS, exportFigmaVariables, exportStyleDictionary,
  exportDocumentation, generateReadme, trackEvent,
  REACT_FILE_ORDER_FULL,
} from './dsEngine';
import { generateShareCard, downloadShareCard } from './shareCard';

/* ── palette ── */
const M = {
  bg:      '#0d1117',
  bgCard:  '#161b22',
  border:  'rgba(255,255,255,0.1)',
  text:    '#e6edf3',
  muted:   'rgba(230,237,243,0.5)',
  dim:     'rgba(230,237,243,0.25)',
  accent:  '#c8602a',
  accentS: 'rgba(200,96,42,0.15)',
  green:   '#3fb950',
  scrollbar: `
    .em-scroll::-webkit-scrollbar { width:5px; height:5px; }
    .em-scroll::-webkit-scrollbar-track { background:transparent; }
    .em-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
  `,
};

/* inject scrollbar + spinner keyframe once */
let _injected = false;
function injectScrollbar() {
  if (_injected || typeof document === 'undefined') return;
  _injected = true;
  const s = document.createElement('style');
  s.textContent = M.scrollbar + '\n@keyframes pc-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
}

/* ── CopyButton ── */
function CopyBtn({ text, label = 'Copy', style = {} }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy}
      style={{
        padding: '6px 14px', borderRadius: 6, border: `1px solid ${copied ? M.green : M.border}`,
        background: copied ? 'rgba(63,185,80,0.12)' : 'rgba(255,255,255,0.05)',
        color: copied ? M.green : M.muted, fontSize: 11, cursor: 'pointer',
        fontFamily: '"Geist Mono",monospace', transition: 'all .15s',
        display: 'flex', alignItems: 'center', gap: 5, ...style,
      }}>
      {copied ? '✓ Copied' : `⎘ ${label}`}
    </button>
  );
}

/* ── Code block ── */
function CodeBlock({ code, language = 'text' }) {
  return (
    <div className="em-scroll" style={{
      flex: 1, overflow: 'auto', background: M.bg,
      borderRadius: 8, border: `1px solid ${M.border}`,
    }}>
      <pre style={{
        margin: 0, padding: '16px 20px', fontSize: 11, lineHeight: 1.7,
        color: M.text, fontFamily: '"Geist Mono","JetBrains Mono",monospace',
        whiteSpace: 'pre', tabSize: 2,
      }}>
        {code}
      </pre>
    </div>
  );
}

/* ── Download helper ── */
function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── React Kit sub-tabs ── */
const REACT_FILE_ORDER = REACT_FILE_ORDER_FULL ?? ['tokens.js', 'Button.jsx', 'Input.jsx', 'Card.jsx', 'tokens.css'];

function ReactKitTab({ tokens }) {
  const files = exportReactComponents(tokens);
  const [activeFile, setActiveFile] = useState('tokens.js');
  const code = files[activeFile] ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
      {/* file tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
        {REACT_FILE_ORDER.map(f => (
          <button key={f} onClick={() => setActiveFile(f)}
            style={{
              padding: '4px 12px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
              fontFamily: '"Geist Mono",monospace',
              border: `1px solid ${activeFile === f ? M.accent : M.border}`,
              background: activeFile === f ? M.accentS : 'transparent',
              color: activeFile === f ? M.accent : M.muted,
              transition: 'all .12s',
            }}>
            {f}
          </button>
        ))}
        <CopyBtn text={code} label={activeFile} style={{ marginLeft: 'auto' }} />
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

/* ── Share tab ── */
function ShareTab({ tokens }) {
  const [shareURL, setShareURL] = useState('');
  const [copied, setCopied] = useState(false);
  const [cardState, setCardState] = useState('idle'); // idle | generating | done | error
  const [cardDataURL, setCardDataURL] = useState(null);

  useEffect(() => {
    const enc = encodeTokensToURL(tokens);
    if (!enc) return;
    const u = new URL(window.location.href);
    u.searchParams.set('pg', '1');
    u.searchParams.set('ds', enc);
    setShareURL(u.toString());
  }, [tokens]);

  const copy = () => {
    navigator.clipboard.writeText(shareURL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const generateCard = async () => {
    setCardState('generating');
    setCardDataURL(null);
    try {
      const dataURL = await generateShareCard(tokens);
      setCardDataURL(dataURL);
      setCardState('done');
    } catch (e) {
      console.warn('Share card generation failed:', e);
      setCardState('error');
    }
  };

  const downloadCard = () => {
    if (cardDataURL) downloadShareCard(cardDataURL, `${tokens.systemName ?? 'design-system'}.png`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', flex: 1 }}>
      {/* URL */}
      <div>
        <div style={{ fontSize: 10, color: M.muted, fontFamily: '"Geist Mono",monospace', marginBottom: 8, letterSpacing: '0.06em' }}>
          SHAREABLE URL
        </div>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 12px', borderRadius: 8,
          border: `1px solid ${M.border}`, background: M.bg,
        }}>
          <span style={{
            flex: 1, fontSize: 11, color: M.muted, fontFamily: '"Geist Mono",monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {shareURL || 'Generating…'}
          </span>
          <button onClick={copy}
            style={{
              padding: '5px 12px', borderRadius: 5,
              border: `1px solid ${copied ? M.green : M.accent}`,
              background: copied ? 'rgba(63,185,80,0.12)' : M.accentS,
              color: copied ? M.green : M.accent,
              fontSize: 11, cursor: 'pointer', fontFamily: '"Geist Mono",monospace',
              transition: 'all .15s', flexShrink: 0,
            }}>
            {copied ? '✓ Copied!' : '⎘ Copy URL'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: M.dim, fontFamily: '"Geist Mono",monospace', marginTop: 6, lineHeight: 1.6 }}>
          Encodes only source inputs. Computed layers are re-derived on load, so URLs stay compact.
        </div>
      </div>

      {/* Share card generator (Task 8.5) */}
      <div style={{ borderTop: `1px solid ${M.border}`, paddingTop: 16 }}>
        <div style={{ fontSize: 10, color: M.muted, fontFamily: '"Geist Mono",monospace', marginBottom: 10, letterSpacing: '0.06em' }}>
          SHARE CARD  1200×630 PNG
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={generateCard} disabled={cardState === 'generating'}
            style={{
              padding: '7px 16px', borderRadius: 6,
              border: `1px solid ${M.accent}`, background: M.accentS,
              color: M.accent, fontSize: 11, cursor: cardState === 'generating' ? 'wait' : 'pointer',
              fontFamily: '"Geist Mono",monospace', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
              opacity: cardState === 'generating' ? 0.7 : 1,
            }}>
            {cardState === 'generating'
              ? <><span style={{ display:'inline-block', width:10, height:10, border:`1.5px solid ${M.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'pc-spin 0.6s linear infinite' }}/> Generating…</>
              : '🎨 Generate Card'
            }
          </button>
          {cardDataURL && (
            <button onClick={downloadCard}
              style={{
                padding: '7px 16px', borderRadius: 6,
                border: `1px solid ${M.green}`, background: 'rgba(63,185,80,0.1)',
                color: M.green, fontSize: 11, cursor: 'pointer',
                fontFamily: '"Geist Mono",monospace', fontWeight: 600,
              }}>
              ⬇ Download PNG
            </button>
          )}
        </div>
        {cardState === 'error' && (
          <div style={{ fontSize: 11, color: '#f87171', fontFamily: '"Geist Mono",monospace' }}>
            Failed to generate card. Try using a different font or check console.
          </div>
        )}
        {cardDataURL && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.3 }}>
            <img src={cardDataURL} alt="Design system share card preview"
              style={{
                width: '100%', borderRadius: 8,
                border: `1px solid ${M.border}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}/>
            <div style={{ fontSize: 9, color: M.dim, fontFamily: '"Geist Mono",monospace', marginTop: 6 }}>
              Right-click → Save image, or click Download PNG above.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORT MODAL
═══════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'css',            label: 'CSS',          icon: '{}' },
  { id: 'scss',           label: 'SCSS',         icon: '$S' },
  { id: 'tailwind',       label: 'Tailwind',     icon: '⚡' },
  { id: 'json',           label: 'JSON',         icon: '[]' },
  { id: 'figma',          label: 'Figma',        icon: '⬡' },
  { id: 'styledictionary',label: 'Style Dict',   icon: '⚙' },
  { id: 'react',          label: 'React Kit',    icon: '⚛' },
  { id: 'docs',           label: 'Docs',         icon: '📝' },
  { id: 'share',          label: 'Share',        icon: '🔗' },
];

const HOW_TO_USE = {
  css:            { step: '1. Copy  →  2. Paste into your global stylesheet (e.g. globals.css)', detail: 'All tokens are CSS custom properties. Use them anywhere: color: var(--ds-primary), padding: var(--ds-space-3).' },
  scss:           { step: '1. Copy  →  2. Drop into your SCSS project as _variables.scss', detail: 'SCSS variables and mixins. Use @use to namespace: ds.$color-action-primary. Includes card-surface and focus-ring mixins.' },
  tailwind:       { step: '1. Copy  →  2. Merge theme.extend into your tailwind.config.js', detail: 'Adds your token values to Tailwind\'s design system. Use class names like text-ds-primary or p-ds-3.' },
  json:           { step: '1. Copy  →  2. Import into Style Dictionary, Tokens Studio, or Theo', detail: 'W3C DTCG format. Compatible with most token pipeline tools. Includes primitive, semantic, and dark-mode sets.' },
  figma:          { step: '1. Copy  →  2. Paste into Tokens Studio plugin → Import', detail: 'Tokens Studio format with global/semantic/dark sets. Enable "Apply on change" to keep Figma variables in sync.' },
  styledictionary:{ step: '1. Copy config  →  2. Run: npx style-dictionary build', detail: 'Generates CSS, SCSS, and JS from the same token JSON. Install: npm install style-dictionary.' },
  react:          { step: '1. Copy files  →  2. Place in src/design-system/', detail: 'Complete React component kit: 9 components + token constants + CSS variables. Import tokens.css once at your app root.' },
  docs:           { step: '1. Download  →  2. Commit to your repo as DESIGN-SYSTEM.md', detail: 'Full documentation: token reference, color system, typography scale, spacing, component guidelines, and accessibility notes.' },
};

function HowToUse({ tab }) {
  const info = HOW_TO_USE[tab];
  if (!info) return null;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 7,
      background: 'rgba(200,96,42,0.08)',
      border: '1px solid rgba(200,96,42,0.2)',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: M.accent, fontFamily: '"Geist Mono",monospace', marginBottom: 4 }}>
        HOW TO USE
      </div>
      <div style={{ fontSize: 11.5, color: M.text, fontFamily: '"Geist Sans",system-ui', marginBottom: 4, fontWeight: 500 }}>
        {info.step}
      </div>
      <div style={{ fontSize: 10.5, color: M.muted, fontFamily: '"Geist Sans",system-ui', lineHeight: 1.55 }}>
        {info.detail}
      </div>
    </div>
  );
}

/* ── Docs tab ── */
function DocsTab({ tokens }) {
  const [downloading, setDownloading] = useState(false);
  const doc = exportDocumentation(tokens);
  const readme = generateReadme(tokens, 'css');
  const name = (tokens.systemName ?? 'design-system').toLowerCase().replace(/\s+/g, '-');

  const handleDownload = () => {
    setDownloading(true);
    downloadText(doc, `${name}-DESIGN-SYSTEM.md`);
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
      <HowToUse tab="docs" />
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={handleDownload}
          style={{
            padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${M.green}`, background: 'rgba(63,185,80,0.1)',
            color: M.green, fontSize: 11, cursor: 'pointer',
            fontFamily: '"Geist Mono",monospace', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
          {downloading ? '✓ Downloaded' : '⬇ DESIGN-SYSTEM.md'}
        </button>
        <button onClick={() => downloadText(readme, `${name}-README.md`)}
          style={{
            padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${M.border}`, background: 'rgba(255,255,255,0.05)',
            color: M.muted, fontSize: 11, cursor: 'pointer',
            fontFamily: '"Geist Mono",monospace',
          }}>
          ⬇ README.md
        </button>
        <CopyBtn text={doc} label="Copy MD" style={{ marginLeft: 'auto' }} />
      </div>
      <CodeBlock code={doc} />
    </div>
  );
}

export default function ExportModal({ tokens, onClose }) {
  injectScrollbar();
  const [activeTab, setActiveTab] = useState('css');
  const backdropRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    firstFocusRef.current?.focus();
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = useCallback(e => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  // Track export opens
  useEffect(() => { trackEvent('export_opened'); }, []);

  const CODE_TABS = new Set(['css', 'scss', 'tailwind', 'json', 'figma', 'styledictionary']);

  const getCode = () => {
    if (activeTab === 'css')            return exportCSS(tokens);
    if (activeTab === 'scss')           return exportSCSS(tokens);
    if (activeTab === 'tailwind')       return exportTailwind(tokens);
    if (activeTab === 'json')           return exportDesignTokensJSON(tokens);
    if (activeTab === 'figma')          return exportFigmaVariables(tokens);
    if (activeTab === 'styledictionary')return exportStyleDictionary(tokens);
    return '';
  };

  const code = CODE_TABS.has(activeTab) ? getCode() : '';
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? '';
  const name = (tokens.systemName ?? 'design-system').toLowerCase().replace(/\s+/g, '-');

  const getDownloadName = () => ({
    css: `${name}-tokens.css`, scss: `${name}-tokens.scss`, tailwind: `${name}-tailwind.config.js`,
    json: `${name}-tokens.json`, figma: `${name}-figma-tokens.json`, styledictionary: `style-dictionary.config.js`,
  })[activeTab] ?? `${name}.txt`;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Export Design System"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        style={{
          width: '100%', maxWidth: 860, height: '82vh', maxHeight: 700,
          background: M.bgCard, borderRadius: 12,
          border: `1px solid ${M.border}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          fontFamily: '"Geist Sans",system-ui',
        }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 20px',
          borderBottom: `1px solid ${M.border}`,
          gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: M.text }}>Export Tokens</span>
          <span style={{ fontSize: 10, color: M.muted, fontFamily: '"Geist Mono",monospace' }}>
            {tokens.systemName ?? 'Design System'} · {new Date().toISOString().slice(0,10)}
          </span>
          <div style={{ flex: 1 }} />
          <button
            ref={firstFocusRef}
            onClick={onClose}
            aria-label="Close export modal"
            style={{
              width: 28, height: 28, borderRadius: 6,
              border: `1px solid ${M.border}`, background: 'transparent',
              color: M.muted, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            ✕
          </button>
        </div>

        {/* Tab bar — scrollable */}
        <div className="em-scroll" style={{
          display: 'flex', gap: 2, padding: '10px 20px 0',
          borderBottom: `1px solid ${M.border}`,
          flexShrink: 0, overflowX: 'auto',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); trackEvent(`export_tab_${t.id}`); }}
              style={{
                padding: '7px 14px', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap',
                border: `1px solid ${activeTab === t.id ? M.border : 'transparent'}`,
                borderBottom: activeTab === t.id ? `1px solid ${M.bgCard}` : '1px solid transparent',
                marginBottom: -1,
                background: activeTab === t.id ? M.bgCard : 'transparent',
                color: activeTab === t.id ? M.text : M.muted,
                fontSize: 11, cursor: 'pointer',
                fontFamily: '"Geist Mono",monospace',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'color .12s', flexShrink: 0,
              }}>
              <span style={{ fontSize: 10 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'react' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
              <HowToUse tab="react" />
              <ReactKitTab tokens={tokens} />
            </div>
          ) : activeTab === 'share' ? (
            <ShareTab tokens={tokens} />
          ) : activeTab === 'docs' ? (
            <DocsTab tokens={tokens} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
              <HowToUse tab={activeTab} />
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => { downloadText(code, getDownloadName()); trackEvent('export_downloaded', { format: activeTab }); }}
                  style={{
                    padding: '6px 14px', borderRadius: 6,
                    border: `1px solid ${M.border}`, background: 'rgba(255,255,255,0.05)',
                    color: M.muted, fontSize: 11, cursor: 'pointer',
                    fontFamily: '"Geist Mono",monospace',
                  }}>
                  ⬇ Download {tabLabel}
                </button>
                <CopyBtn text={code} label={`Copy ${tabLabel}`} style={{ marginLeft: 'auto' }} />
              </div>
              <CodeBlock code={code} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
