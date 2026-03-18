/**
 * MinesweeperHUD.jsx — top strip + win/loss overlays
 */

function pad2(n) { return String(n).padStart(2, '0'); }

function fmtTime(s) { return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; }

const FACE = { idle: '▷', playing: '◦', won: '☻', lost: '×' };

const HUD_STYLE = {
  position: 'absolute', top: 0, left: 0, right: 0,
  height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 16px',
  background: 'rgba(247,245,240,0.82)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  zIndex: 10,
  fontFamily: '"DM Mono", monospace',
  userSelect: 'none',
};

const NUM_STYLE = {
  fontSize: 13, color: '#6b6560',
  display: 'flex', alignItems: 'center', gap: 6,
  minWidth: 72,
};

const CENTER_STYLE = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flex: 1,
};

const BTN_STYLE = {
  width: 30, height: 30,
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.07)',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 16, lineHeight: '30px',
  textAlign: 'center',
  color: '#4a4540',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};

const OVERLAY_STYLE = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 20,
  pointerEvents: 'auto',
};

const CARD_STYLE = {
  background: 'rgba(247,245,240,0.96)',
  border: '1px solid rgba(0,0,0,0.09)',
  borderRadius: 16,
  padding: '32px 40px',
  textAlign: 'center',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
  minWidth: 280,
};

export default function MinesweeperHUD({
  phase, minesRemaining, elapsed, score, onRestart,
}) {
  return (
    <>
      {/* HUD strip */}
      <div style={HUD_STYLE} data-signal-ui="hud">
        <div style={NUM_STYLE}>
          <span style={{ color: '#c8602a' }}>⚑</span>
          {minesRemaining}
        </div>

        <div style={CENTER_STYLE}>
          {phase === 'idle' ? (
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 10, letterSpacing: '0.08em',
              color: '#a89e8c',
            }}>
              click the grid to begin
            </span>
          ) : (
            <button
              style={BTN_STYLE}
              onClick={onRestart}
              title="Restart"
            >
              {FACE[phase] ?? '◦'}
            </button>
          )}
        </div>

        <div style={{ ...NUM_STYLE, justifyContent: 'flex-end', minWidth: 72 }}>
          {fmtTime(elapsed)}
        </div>
      </div>

      {/* Win overlay */}
      {phase === 'won' && (
        <div style={OVERLAY_STYLE}>
          <div style={CARD_STYLE}>
            <p style={{
              fontFamily: 'new-spirit, "Playfair Display", serif',
              fontSize: 32, fontWeight: 600,
              color: 'rgba(26,24,20,0.9)',
              margin: '0 0 18px',
            }}>
              you cleared it.
            </p>

            <div style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 12, color: '#8c8480',
              lineHeight: 1.8, marginBottom: 14,
            }}>
              <div>base score &nbsp;&nbsp;{Math.round(score * 0.6)}</div>
              <div>time bonus &nbsp;&nbsp;{Math.round(score * 0.25)}</div>
              <div>signal bonus {Math.round(score * 0.15)}</div>
            </div>

            <p style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 26, fontWeight: 600,
              color: '#c8602a', margin: '0 0 22px',
            }}>
              {score.toLocaleString()}
            </p>

            <button
              onClick={onRestart}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 12, letterSpacing: '0.06em',
                color: '#6b6560',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              play again
            </button>
          </div>
        </div>
      )}

      {/* Loss overlay */}
      {phase === 'lost' && (
        <div style={OVERLAY_STYLE}>
          <div style={CARD_STYLE}>
            <p style={{
              fontFamily: 'new-spirit, "Playfair Display", serif',
              fontSize: 32, fontWeight: 600,
              color: 'rgba(26,24,20,0.9)',
              margin: '0 0 14px',
            }}>
              mine.
            </p>

            {score > 0 && (
              <p style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 13, color: '#a89e8c',
                margin: '0 0 16px',
              }}>
                signal bonus &nbsp;{score}
              </p>
            )}

            <button
              onClick={onRestart}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 12, letterSpacing: '0.06em',
                color: '#6b6560',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              try again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
