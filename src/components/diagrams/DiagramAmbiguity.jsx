export default function DiagramAmbiguity() {
  return (
    <div
      style={{
        width: '1600px',
        height: '900px',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Geist Sans", system-ui, sans-serif',
        color: '#1a1814',
        boxSizing: 'border-box',
        display: 'block',
      }}
    >
      <style>{`
        .da-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-left-color 0.2s ease, background-color 0.2s ease;
          border-left: 3px solid transparent !important;
          cursor: default;
        }
        .da-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(45,106,159,0.14);
          border-left-color: #2D6A9F !important;
          background-color: rgba(45,106,159,0.06) !important;
          z-index: 2;
          position: relative;
        }
      `}</style>
      {/* matrix-container */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '44px 80px 28px', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: '"Geist Sans", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: '28px',
              color: '#1a1814',
            }}
          >
            Four decisions before the first wireframe.
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(0,0,0,0.38)',
              marginTop: '6px',
              fontStyle: 'italic',
            }}
          >
            Structural tensions that had to be resolved before any design could begin.
          </div>
          <div style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: '9px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(45,106,159,0.50)',
            marginTop: '12px',
          }}>
            Hover each quadrant to see the resolution ↗
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '48px 1fr 1fr',
            gridTemplateRows: '1fr 1fr 40px',
            gap: 0,
            padding: '0 80px 40px',
          }}
        >
          {/* Y-axis label */}
          <div
            style={{
              gridColumn: '1',
              gridRow: '1 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '10px',
              color: 'rgba(0,0,0,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              gap: '8px',
            }}
          >
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>Individual Workflow</span>
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>↕</span>
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>Organisational Scale</span>
          </div>

          {/* Q1: Top Left — AI-first vs Clinician-first */}
          <div
            className="da-card"
            style={{
              padding: '36px 40px',
              border: '1px solid rgba(0,0,0,0.09)',
              borderRight: 'none',
              borderBottom: 'none',
              position: 'relative',
              background: 'rgba(45,106,159,0.06)',
              boxSizing: 'border-box',
            }}
          >
            {/* accent dot */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2D6A9F',
                opacity: 0.15,
              }}
            />
            <div
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                opacity: 0.5,
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              01
            </div>
            <div
              style={{
                fontFamily: '"Geist Sans", system-ui, sans-serif',
                fontStyle: 'italic',
                fontSize: '20px',
                fontWeight: 500,
                color: '#1a1814',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              AI-first<br />vs Clinician-first
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.58)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Who drives the decision? Does AI surface the answer, or does the clinician lead with AI assisting?
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                letterSpacing: '0.04em',
                background: 'rgba(45,106,159,0.10)',
                borderRadius: '4px',
                padding: '4px 10px',
                marginTop: '4px',
              }}
            >
              → Resolved: AI prepares context. Clinicians decide.
            </div>
          </div>

          {/* Q2: Top Right — One product vs Role-based */}
          <div
            className="da-card"
            style={{
              padding: '36px 40px',
              border: '1px solid rgba(0,0,0,0.09)',
              borderBottom: 'none',
              position: 'relative',
              background: 'rgba(100,180,120,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#64b478',
                opacity: 0.15,
              }}
            />
            <div
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                opacity: 0.5,
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              02
            </div>
            <div
              style={{
                fontFamily: '"Geist Sans", system-ui, sans-serif',
                fontStyle: 'italic',
                fontSize: '20px',
                fontWeight: 500,
                color: '#1a1814',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              One product<br />vs Role-based views
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.58)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Should nurses, MDs, and auditors share one interface — or does each role need a different product?
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                letterSpacing: '0.04em',
                background: 'rgba(45,106,159,0.10)',
                borderRadius: '4px',
                padding: '4px 10px',
                marginTop: '4px',
              }}
            >
              → Resolved: Shared shell, role-gated views.
            </div>
          </div>

          {/* Q3: Bottom Left — Automate vs Augment */}
          <div
            className="da-card"
            style={{
              padding: '36px 40px',
              border: '1px solid rgba(0,0,0,0.09)',
              borderRight: 'none',
              position: 'relative',
              background: 'rgba(200,120,80,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#c87850',
                opacity: 0.15,
              }}
            />
            <div
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                opacity: 0.5,
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              03
            </div>
            <div
              style={{
                fontFamily: '"Geist Sans", system-ui, sans-serif',
                fontStyle: 'italic',
                fontSize: '20px',
                fontWeight: 500,
                color: '#1a1814',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              Automate<br />vs Augment
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.58)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Does the product replace clinical judgment — or support it? Automation vs. augmentation defines the regulatory and trust posture.
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                letterSpacing: '0.04em',
                background: 'rgba(45,106,159,0.10)',
                borderRadius: '4px',
                padding: '4px 10px',
                marginTop: '4px',
              }}
            >
              → Resolved: Copilot model. AI never auto-approves.
            </div>
          </div>

          {/* Q4: Bottom Right — Speed vs Trust */}
          <div
            className="da-card"
            style={{
              padding: '36px 40px',
              border: '1px solid rgba(0,0,0,0.09)',
              position: 'relative',
              background: 'rgba(160,100,200,0.03)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#a064c8',
                opacity: 0.15,
              }}
            />
            <div
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                opacity: 0.5,
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              04
            </div>
            <div
              style={{
                fontFamily: '"Geist Sans", system-ui, sans-serif',
                fontStyle: 'italic',
                fontSize: '20px',
                fontWeight: 500,
                color: '#1a1814',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              Speed<br />vs Trust
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.58)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Optimise for throughput — or for explainability? In regulated healthcare, a fast answer without a reason is an indefensible answer.
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '10px',
                color: '#2D6A9F',
                letterSpacing: '0.04em',
                background: 'rgba(45,106,159,0.10)',
                borderRadius: '4px',
                padding: '4px 10px',
                marginTop: '4px',
              }}
            >
              → Resolved: Explainability as core infrastructure.
            </div>
          </div>

          {/* X-axis label */}
          <div
            style={{
              gridColumn: '2 / 4',
              gridRow: '3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '10px',
              color: 'rgba(0,0,0,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              gap: '8px',
              borderTop: '1px solid rgba(0,0,0,0.15)',
              paddingTop: '12px',
            }}
          >
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>System Autonomy</span>
            <span style={{ color: 'rgba(0,0,0,0.25)' }}>←————————→</span>
            <span style={{ color: 'rgba(0,0,0,0.35)' }}>Human Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
