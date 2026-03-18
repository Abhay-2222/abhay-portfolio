export default function DiagramEvolution() {
  /* ─── Shared style helpers ─── */
  const wfLine = (width = '100%', extra = {}) => ({
    height: '5px',
    background: '#f5f5f5',
    borderRadius: '2px',
    width,
    ...extra,
  });

  const wfLineDark = (width = '100%', extra = {}) => ({
    height: '4px',
    background: '#efefef',
    borderRadius: '2px',
    width,
    ...extra,
  });

  const newHighlight = (posStyle, borderColor) => ({
    position: 'absolute',
    border: `1px solid ${borderColor}`,
    borderRadius: '3px',
    opacity: 0.3,
    ...posStyle,
  });

  /* ─── Status badge helper ─── */
  function StatusBadge({ status }) {
    const styles = {
      rejected: {
        color: '#cc3333',
        background: 'rgba(204,51,51,0.08)',
        border: '1px solid rgba(204,51,51,0.2)',
      },
      refined: {
        color: '#cc9944',
        background: 'rgba(180,130,40,0.08)',
        border: '1px solid rgba(180,130,40,0.2)',
      },
      current: {
        color: '#2d7a3a',
        background: 'rgba(45,122,58,0.08)',
        border: '1px solid rgba(45,122,58,0.2)',
      },
    };
    const labels = { rejected: 'Rejected', refined: 'Refined', current: 'Current' };
    return (
      <div
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: '9px',
          letterSpacing: '0.08em',
          padding: '2px 6px',
          borderRadius: '2px',
          ...styles[status],
        }}
      >
        {labels[status]}
      </div>
    );
  }

  /* ─── Arrow connector ─── */
  function Connector() {
    return (
      <div
        style={{
          width: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* horizontal line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.10), rgba(0,0,0,0.08))',
            top: '50%',
          }}
        />
        {/* circle arrow */}
        <div
          style={{
            width: '20px',
            height: '20px',
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.10)',
            fontSize: '10px',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          →
        </div>
      </div>
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
      {/* evolution-container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '44px 60px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              fontFamily: '"Geist Sans", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: '28px',
              color: '#1a1814',
            }}
          >
            Four iterations. Three rejections.
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(0,0,0,0.38)',
              marginTop: '6px',
            }}
          >
            The architectural shift that unlocked the final direction.
          </div>
        </div>

        {/* Evolution track */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            gap: 0,
          }}
        >

          {/* ─── V01: Physician-Centric ─── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                flex: 1,
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(0,0,0,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#efefef',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '10px',
                    color: 'rgba(0,0,0,0.10)',
                    letterSpacing: '0.1em',
                  }}
                >
                  V01
                </div>
                <StatusBadge status="rejected" />
              </div>

              {/* Wireframe */}
              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {/* Top nav bar */}
                <div
                  style={{
                    height: '22px',
                    background: '#f5f5f5',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    gap: '6px',
                  }}
                >
                  <div style={{ width: '30px', height: '5px', background: '#e8e8e8', borderRadius: '2px' }} />
                  <div style={{ width: '25px', height: '5px', background: '#e8e8e8', borderRadius: '2px' }} />
                </div>

                {/* KPI row */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '50px',
                        background: '#efefef',
                        border: '1px solid rgba(0,0,0,0.09)',
                        borderRadius: '3px',
                        padding: '6px',
                      }}
                    >
                      <div style={{ height: '4px', background: '#e8e8e8', borderRadius: '2px', marginBottom: '4px', width: '60%' }} />
                      <div style={{ height: '14px', background: '#e8e8e8', borderRadius: '2px' }} />
                    </div>
                  ))}
                </div>

                {/* Patient list */}
                <div
                  style={{
                    flex: 1,
                    background: '#efefef',
                    border: '1px solid rgba(0,0,0,0.09)',
                    borderRadius: '3px',
                    padding: '8px',
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  <div style={{ height: '4px', background: '#e8e8e8', borderRadius: '2px', width: '40%' }} />
                  <div style={wfLine('100%', { height: '8px', background: '#f5f5f5' })} />
                  <div style={wfLine('100%', { height: '8px', background: '#f5f5f5' })} />
                  <div style={wfLine('100%', { height: '8px', background: '#f5f5f5' })} />
                  <div style={wfLine('100%', { height: '8px', background: '#f5f5f5' })} />
                </div>
              </div>

              {/* Caption */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(0,0,0,0.10)',
                  background: '#f5f5f5',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.55)', marginBottom: '3px' }}>
                  Physician-Centric Dashboard
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                  KPIs, patient list, clinical tools. Wrong user. Wrong entry point.
                </div>
              </div>
            </div>
          </div>

          <Connector />

          {/* ─── V02: Patient-Centered EHR Clone ─── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                flex: 1,
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(0,0,0,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#efefef',
                }}
              >
                <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '10px', color: 'rgba(0,0,0,0.10)', letterSpacing: '0.1em' }}>V02</div>
                <StatusBadge status="rejected" />
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {/* Nav bar */}
                <div
                  style={{
                    height: '22px',
                    background: '#f5f5f5',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.09)',
                  }}
                />

                {/* Body: sidebar + main */}
                <div style={{ display: 'flex', gap: '6px', flex: 1, marginTop: '4px' }}>
                  {/* Sidebar */}
                  <div
                    style={{
                      width: '70px',
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ height: '8px', background: '#e8e8e8', borderRadius: '2px' }} />
                    <div style={{ height: '8px', background: '#efefef', borderRadius: '2px' }} />
                    <div style={{ height: '8px', background: '#efefef', borderRadius: '2px' }} />
                    <div style={{ height: '8px', background: '#efefef', borderRadius: '2px' }} />
                  </div>
                  {/* Main */}
                  <div
                    style={{
                      flex: 1,
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ height: '4px', background: '#e8e8e8', borderRadius: '2px', width: '50%' }} />
                    <div style={{ height: '6px', background: '#f5f5f5', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: '#f5f5f5', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: '#f5f5f5', borderRadius: '2px', width: '70%' }} />
                    {/* Buried AI */}
                    <div
                      style={{
                        marginTop: 'auto',
                        height: '20px',
                        background: '#f5f5f5',
                        border: '1px solid rgba(0,0,0,0.10)',
                        borderRadius: '2px',
                        opacity: 0.4,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px',
                      }}
                    >
                      <div style={{ height: '4px', background: '#efefef', borderRadius: '2px', width: '60%' }} />
                    </div>
                  </div>
                </div>

                {/* Highlight: sidebar */}
                <div style={newHighlight({ left: '14px', top: '36px', width: '82px', height: '120px' }, '#2D6A9F')} />
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.10)', background: '#f5f5f5' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.55)', marginBottom: '3px' }}>
                  Patient-Centered EHR Clone
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                  Added sidebar. Still copied Epic's IA. CareLens buried.
                </div>
              </div>
            </div>
          </div>

          <Connector />

          {/* ─── V03: Work Queue + Case-Centred ─── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                flex: 1,
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(0,0,0,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#efefef',
                }}
              >
                <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '10px', color: 'rgba(0,0,0,0.10)', letterSpacing: '0.1em' }}>V03</div>
                <StatusBadge status="refined" />
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {/* Nav */}
                <div
                  style={{
                    height: '22px',
                    background: '#f5f5f5',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.09)',
                  }}
                />

                <div style={{ display: 'flex', gap: '6px', flex: 1, marginTop: '4px' }}>
                  {/* Queue */}
                  <div
                    style={{
                      width: '80px',
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '6px', background: '#cc3333', borderRadius: '2px', opacity: 0.5 }} />
                    <div style={{ height: '6px', background: '#cc8844', borderRadius: '2px', opacity: 0.5 }} />
                    <div style={{ height: '6px', background: '#e8e8e8', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: '#e8e8e8', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: '#e8e8e8', borderRadius: '2px' }} />
                  </div>
                  {/* Case */}
                  <div
                    style={{
                      flex: 1,
                      background: '#efefef',
                      border: '1px solid rgba(0,0,0,0.09)',
                      borderRadius: '3px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '4px', background: '#e8e8e8', borderRadius: '2px', width: '50%' }} />
                    <div style={{ height: '5px', background: '#f5f5f5', borderRadius: '2px' }} />
                    <div style={{ height: '5px', background: '#f5f5f5', borderRadius: '2px' }} />
                    <div style={{ height: '5px', background: '#f5f5f5', borderRadius: '2px', width: '70%' }} />
                  </div>
                  {/* CareLens */}
                  <div
                    style={{
                      width: '65px',
                      background: '#f5f5f5',
                      border: '1px solid rgba(45,106,159,0.15)',
                      borderRadius: '3px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px', width: '80%' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px', width: '60%' }} />
                  </div>
                </div>

                {/* Highlights: queue + carelens */}
                <div style={newHighlight({ left: '14px', top: '36px', width: '94px', height: '110px' }, '#cc8844')} />
                <div style={newHighlight({ right: '14px', top: '36px', width: '79px', height: '110px' }, '#2d7a3a')} />
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.10)', background: '#f5f5f5' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.55)', marginBottom: '3px' }}>
                  Work Queue + Case-Centred
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                  Right architecture. CareLens visible. Handoffs still informal.
                </div>
              </div>
            </div>
          </div>

          <Connector />

          {/* ─── V04: Stage-Based Workflow (Current) ─── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                flex: 1,
                border: '1px solid rgba(45,106,159,0.15)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(45,106,159,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(45,106,159,0.06)',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '10px',
                    color: '#2D6A9F',
                    letterSpacing: '0.1em',
                  }}
                >
                  V04
                </div>
                <StatusBadge status="current" />
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {/* Stage-based nav */}
                <div
                  style={{
                    height: '22px',
                    background: 'rgba(45,106,159,0.06)',
                    borderRadius: '3px',
                    border: '1px solid rgba(45,106,159,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    gap: '4px',
                  }}
                >
                  <div style={{ width: '20px', height: '5px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                  <div style={{ width: '20px', height: '5px', background: '#2D6A9F', borderRadius: '2px', opacity: 0.4 }} />
                  <div style={{ width: '20px', height: '5px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                  <div style={{ width: '20px', height: '5px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                  <div style={{ width: '20px', height: '5px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px', flex: 1, marginTop: '4px' }}>
                  {/* Queue */}
                  <div
                    style={{
                      width: '75px',
                      background: 'rgba(45,106,159,0.06)',
                      border: '1px solid rgba(45,106,159,0.15)',
                      borderRadius: '3px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '6px', background: '#cc3333', borderRadius: '2px', opacity: 0.6 }} />
                    <div style={{ height: '6px', background: '#cc8844', borderRadius: '2px', opacity: 0.6 }} />
                    <div style={{ height: '6px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '6px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                  </div>
                  {/* Case */}
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(45,106,159,0.06)',
                      border: '1px solid rgba(45,106,159,0.15)',
                      borderRadius: '3px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px', width: '50%' }} />
                    <div style={{ height: '5px', background: '#efefef', borderRadius: '2px' }} />
                    <div style={{ height: '5px', background: '#efefef', borderRadius: '2px' }} />
                    <div style={{ height: '5px', background: '#efefef', borderRadius: '2px', width: '70%' }} />
                    {/* Policy checklist */}
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d7a3a', opacity: 0.6 }} />
                        <div style={{ height: '4px', background: '#efefef', borderRadius: '2px', flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cc3333', opacity: 0.6 }} />
                        <div style={{ height: '4px', background: '#efefef', borderRadius: '2px', flex: 1 }} />
                      </div>
                    </div>
                  </div>
                  {/* CareLens — prominent */}
                  <div
                    style={{
                      width: '70px',
                      background: 'rgba(45,106,159,0.06)',
                      border: '1px solid rgba(45,106,159,0.15)',
                      borderRadius: '3px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div
                      style={{
                        height: '12px',
                        background: '#efefef',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: '"Geist Mono", monospace',
                          fontSize: '7px',
                          color: '#2D6A9F',
                        }}
                      >
                        89%
                      </div>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px', width: '80%' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px', width: '60%' }} />
                    <div style={{ height: '4px', background: 'rgba(45,106,159,0.15)', borderRadius: '2px' }} />
                  </div>
                </div>

                {/* Highlights: stage nav + CareLens */}
                <div style={newHighlight({ left: '14px', top: '14px', right: '14px', height: '26px' }, '#2D6A9F')} />
                <div style={newHighlight({ right: '14px', top: '36px', width: '84px', height: '115px' }, '#2D6A9F')} />
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.10)', background: '#f5f5f5' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2D6A9F', marginBottom: '3px' }}>
                  Stage-Based Workflow + CareLens
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.38)', lineHeight: 1.4 }}>
                  7 stages. Role-based routing. CareLens as persistent governance layer.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
