export default function DiagramMistakes() {
  /* ── Reusable sub-components (plain functions, not exported) ── */

  function BrowserChrome() {
    return (
      <div
        style={{
          height: '28px',
          background: '#f5f5f5',
          borderRadius: '3px',
          border: '1px solid rgba(0,0,0,0.09)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '8px',
        }}
      >
        <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
        <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
        <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
        <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
      </div>
    );
  }

  function RejectedStamp({ label = 'REJECTED', fontSize = 18 }) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-12deg)',
          border: '3px solid rgba(180,40,40,0.7)',
          color: 'rgba(180,40,40,0.7)',
          fontFamily: '"Geist Mono", monospace',
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          letterSpacing: '0.15em',
          padding: '8px 20px',
          borderRadius: '4px',
          pointerEvents: 'none',
          textShadow: '0 0 20px rgba(180,40,40,0.3)',
        }}
      >
        {label}
      </div>
    );
  }

  /* ── Common wireframe line ── */
  function WfLine({ width = '100%', style: extra }) {
    return (
      <div
        style={{
          height: '6px',
          background: '#e8e8e8',
          borderRadius: '2px',
          width,
          ...extra,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: '1600px',
        height: '900px',
        background: '#ffffff',
        display: 'block',
        overflow: 'hidden',
        fontFamily: '"Geist Sans", system-ui, sans-serif',
        color: '#1a1814',
        boxSizing: 'border-box',
      }}
    >
      {/* mistakes-container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '44px 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: '"Geist Sans", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: '28px',
              color: '#1a1814',
            }}
          >
            I built the wrong thing twice.
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(0,0,0,0.38)',
              marginTop: '6px',
            }}
          >
            Three rejected versions. What each one taught me.
          </div>
        </div>

        {/* Three panels */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '24px',
          }}
        >

          {/* ─── V01: Physician-Centric Dashboard ─── */}
          <div
            style={{
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: '#f5f5f5',
            }}
          >
            {/* Version header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.09)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '10px',
                  color: 'rgba(0,0,0,0.08)',
                  letterSpacing: '0.1em',
                  background: '#f5f5f5',
                  border: '1px solid rgba(0,0,0,0.09)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                }}
              >
                V01
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>Physician-Centric Dashboard</div>
            </div>

            {/* Wireframe area */}
            <div
              style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
              }}
            >
              {/* Nav bar */}
              <div
                style={{
                  height: '28px',
                  background: '#f5f5f5',
                  borderRadius: '3px',
                  border: '1px solid rgba(0,0,0,0.09)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  gap: '8px',
                }}
              >
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
              </div>

              {/* Body */}
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                {/* Main area only — no sidebar for V01 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* KPI row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        background: '#efefef',
                        border: '1px solid rgba(0,0,0,0.09)',
                        borderRadius: '3px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <WfLine width="60%" />
                      <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px', marginTop: '4px' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: '#efefef',
                        border: '1px solid rgba(0,0,0,0.09)',
                        borderRadius: '3px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <WfLine width="60%" />
                      <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px', marginTop: '4px' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: '#efefef',
                        border: '1px solid rgba(0,0,0,0.09)',
                        borderRadius: '3px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <WfLine width="60%" />
                      <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px', marginTop: '4px' }} />
                    </div>
                  </div>

                  {/* Patient list */}
                  <div
                    style={{
                      flex: 1,
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <WfLine width="80%" />
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <RejectedStamp />
            </div>

            {/* Caption */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(0,0,0,0.09)',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '9px',
                  color: '#cc3333',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Mistake 1 + 2
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                Built for the wrong user. Physicians approve 20% of cases. Nurses do 80% of the work — and had no view.
              </div>
            </div>
          </div>

          {/* ─── V02: Patient-Centered EHR Clone ─── */}
          <div
            style={{
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: '#f5f5f5',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.09)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '10px',
                  color: 'rgba(0,0,0,0.08)',
                  letterSpacing: '0.1em',
                  background: '#f5f5f5',
                  border: '1px solid rgba(0,0,0,0.09)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                }}
              >
                V02
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>Patient-Centered EHR Clone</div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
              }}
            >
              {/* Nav bar with 2 active dots */}
              <div
                style={{
                  height: '28px',
                  background: '#f5f5f5',
                  borderRadius: '3px',
                  border: '1px solid rgba(0,0,0,0.09)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  gap: '8px',
                }}
              >
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                {/* Sidebar */}
                <div
                  style={{
                    width: '80px',
                    background: '#efefef',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.09)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ height: '20px', background: '#2D6A9F', borderRadius: '2px', opacity: 0.12 }} />
                  <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px' }} />
                  <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px' }} />
                  <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px' }} />
                  <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px' }} />
                </div>

                {/* Main */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      flex: 1,
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <WfLine width="80%" />
                    <WfLine width="60%" />
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '2px', width: '70%' }} />
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      opacity: 0.4,
                    }}
                  >
                    <WfLine width="60%" />
                    <div style={{ height: '8px', background: '#e8e8e8', borderRadius: '2px', marginTop: '4px' }} />
                  </div>
                </div>
              </div>

              <RejectedStamp />
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(0,0,0,0.09)',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '9px',
                  color: '#cc3333',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Mistake 3 + 6
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                Replicated Epic — the tool nurses already dislike. CareLens buried as an afterthought. Core value invisible.
              </div>
            </div>
          </div>

          {/* ─── V03: Work Queue + Overloaded AI ─── */}
          <div
            style={{
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: '#f5f5f5',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.09)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '10px',
                  color: 'rgba(0,0,0,0.08)',
                  letterSpacing: '0.1em',
                  background: '#f5f5f5',
                  border: '1px solid rgba(0,0,0,0.09)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                }}
              >
                V03
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>Work Queue + Overloaded AI</div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
              }}
            >
              {/* Nav bar — 3 active */}
              <div
                style={{
                  height: '28px',
                  background: '#f5f5f5',
                  borderRadius: '3px',
                  border: '1px solid rgba(0,0,0,0.09)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  gap: '8px',
                }}
              >
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#2D6A9F', opacity: 0.3 }} />
                <div style={{ width: '40px', height: '6px', borderRadius: '2px', background: '#e8e8e8' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                {/* Sidebar — wider */}
                <div
                  style={{
                    width: '100px',
                    background: '#efefef',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.09)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ height: '20px', background: '#2D6A9F', borderRadius: '2px', opacity: 0.12 }} />
                  <div style={{ height: '20px', background: '#2D6A9F', borderRadius: '2px', opacity: 0.12 }} />
                  <div style={{ height: '20px', background: '#e8e8e8', borderRadius: '2px' }} />
                </div>

                {/* Main */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      flex: 1,
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <WfLine width="80%" />
                    <WfLine width="60%" />
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ height: '8px', background: '#e8e8e8', borderRadius: '2px' }} />
                      <div style={{ height: '8px', background: '#e8e8e8', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>

                {/* Oversized AI panel */}
                <div
                  style={{
                    width: '140px',
                    background: '#f5f5f5',
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: '3px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px', width: '80%' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px', width: '60%' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px', width: '90%' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px', width: '70%' }} />
                  <div style={{ height: '6px', background: '#efefef', borderRadius: '2px' }} />
                </div>
              </div>

              <RejectedStamp label="REFINED" fontSize={15} />
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(0,0,0,0.09)',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '9px',
                  color: '#cc3333',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Mistake 4 + 5
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                Right direction, wrong balance. AI panel overwhelmed the workflow. Handoffs still informal. Roles undefined.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
