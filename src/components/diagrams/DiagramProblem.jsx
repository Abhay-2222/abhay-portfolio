export default function DiagramProblem() {
  return (
    <div
      style={{
        width: '1600px',
        height: '1000px',
        background: '#ffffff',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Geist Sans", system-ui, sans-serif',
        color: '#1a1814',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Left side: Chaos ── */}
      <div
        style={{
          width: '50%',
          height: '100%',
          position: 'relative',
          background: '#ffffff',
          borderRight: '1px solid rgba(0,0,0,0.09)',
          boxSizing: 'border-box',
        }}
      >
        {/* Section label */}
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.40)',
            position: 'absolute',
            top: '36px',
            left: '40px',
          }}
        >
          Before CareSummarizer
        </span>

        {/* Browser tab 1 — Epic EHR */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '280px',
            left: '40px',
            top: '70px',
            transform: 'rotate(-2.5deg)',
            zIndex: 1,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>epic.com/EHR/patient/chart</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Epic EHR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '90%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '70%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '80%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '55%' }} />
          </div>
        </div>

        {/* Browser tab 2 — Payer Portal */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '260px',
            left: '120px',
            top: '180px',
            transform: 'rotate(1.8deg)',
            zIndex: 3,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>payer-portal.aetna.com</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payer Portal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '85%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '65%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '75%' }} />
          </div>
        </div>

        {/* Browser tab 3 — Excel */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '300px',
            left: '20px',
            top: '300px',
            transform: 'rotate(-1.2deg)',
            zIndex: 2,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>sharepoint/UR-tracker.xlsx</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Excel Spreadsheet</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '100%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '88%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '92%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '78%' }} />
          </div>
        </div>

        {/* Browser tab 4 — Outlook */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '250px',
            left: '200px',
            top: '420px',
            transform: 'rotate(2.8deg)',
            zIndex: 4,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>outlook.office.com/mail</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outlook Email</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '80%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '60%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '70%' }} />
          </div>
        </div>

        {/* Browser tab 5 — Fax Queue */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '240px',
            left: '30px',
            top: '530px',
            transform: 'rotate(-3.2deg)',
            zIndex: 2,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>fax.internal/queue/pending</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fax Queue</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '75%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '55%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '65%' }} />
          </div>
        </div>

        {/* Browser tab 6 — Medicare LCD */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '290px',
            left: '200px',
            top: '620px',
            transform: 'rotate(1.4deg)',
            zIndex: 3,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>cms.gov/medicare/lcd-lookup</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medicare LCD Lookup</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '90%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '68%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '80%' }} />
          </div>
        </div>

        {/* Browser tab 7 — Insurance Guidelines */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '270px',
            left: '60px',
            top: '720px',
            transform: 'rotate(-1.8deg)',
            zIndex: 2,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>drive/insurance-guidelines.pdf</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insurance Guidelines PDF</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '82%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '64%' }} />
          </div>
        </div>

        {/* Browser tab 8 — Appeal Tracker */}
        <div
          style={{
            position: 'absolute',
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
            width: '240px',
            left: '260px',
            top: '240px',
            transform: 'rotate(-4deg)',
            zIndex: 5,
            opacity: 0.7,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0d8a0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b0d8b0' }} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)', flex: 1, background: '#efefef', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.09)' }}>appeal-tracker.internal</div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.38)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Appeal Tracker</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '70%' }} />
            <div style={{ height: '6px', borderRadius: '2px', background: '#efefef', width: '50%' }} />
          </div>
        </div>

        {/* Bottom label */}
        <div style={{ position: 'absolute', bottom: '36px', left: '40px' }}>
          <div style={{ fontFamily: '"Geist Sans", system-ui, sans-serif', fontStyle: 'italic', fontSize: '18px', color: 'rgba(0,0,0,0.38)' }}>
            8 disconnected tools.
          </div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '11px', color: 'rgba(0,0,0,0.40)', marginTop: '4px', letterSpacing: '0.06em' }}>
            40+ minutes per case.
          </div>
        </div>
      </div>

      {/* ── VS Divider ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.10), transparent)' }} />
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.10)',
            color: 'rgba(0,0,0,0.38)',
            fontFamily: '"Geist Mono", monospace',
            fontSize: '11px',
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: '4px',
            letterSpacing: '0.12em',
          }}
        >
          VS
        </div>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.10), transparent)' }} />
      </div>

      {/* ── Right side: Calm ── */}
      <div
        style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Section label */}
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.40)',
            position: 'absolute',
            top: '36px',
            left: '40px',
          }}
        >
          After
        </span>

        {/* CareSummarizer card */}
        <div
          style={{
            width: '480px',
            background: '#f5f5f5',
            border: '1px solid rgba(45,106,159,0.15)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(45,106,159,0.10), 0 1px 6px rgba(0,0,0,0.05)',
            position: 'relative',
          }}
        >
          {/* Card header */}
          <div
            style={{
              background: '#efefef',
              borderBottom: '1px solid rgba(45,106,159,0.15)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #2a6099, #1a4070)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#7ab0e0',
              }}
            >
              ⚕
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1814', letterSpacing: '0.02em' }}>CareSummarizer</div>
            <div
              style={{
                marginLeft: 'auto',
                background: 'rgba(45,106,159,0.06)',
                border: '1px solid rgba(45,106,159,0.15)',
                color: '#2D6A9F',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '9px',
                padding: '3px 8px',
                borderRadius: '3px',
                letterSpacing: '0.08em',
              }}
            >
              CareLens Active
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(0,0,0,0.38)',
                marginBottom: '14px',
                fontFamily: '"Geist Mono", monospace',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Work Queue — 23 cases
            </div>

            {/* Queue item 1 — red */}
            <div
              style={{
                background: '#efefef',
                border: '1px solid rgba(45,106,159,0.15)',
                borderLeft: '3px solid #cc3333',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cc3333', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1814', flex: 1 }}>Sarah Johnson · CHF · STAT</div>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)' }}>54% complete</div>
            </div>

            {/* Queue item 2 — amber */}
            <div
              style={{
                background: '#efefef',
                border: '1px solid rgba(45,106,159,0.15)',
                borderLeft: '3px solid #cc8844',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cc8844', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1814', flex: 1 }}>Sandra Martinez · Medicaid</div>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)' }}>57% complete</div>
            </div>

            {/* Queue item 3 — blue */}
            <div
              style={{
                background: '#efefef',
                border: '1px solid rgba(45,106,159,0.15)',
                borderLeft: '3px solid #2D6A9F',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D6A9F', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1814', flex: 1 }}>James Sanchez · HIGH RISK</div>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '9px', color: 'rgba(0,0,0,0.38)' }}>30% complete</div>
            </div>
          </div>

          {/* Card footer — metrics */}
          <div
            style={{
              borderTop: '1px solid rgba(45,106,159,0.15)',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '18px', color: '#2D6A9F', fontWeight: 500 }}>
                8<span style={{ fontSize: '12px' }}>min</span>
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Per Case</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(45,106,159,0.15)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '18px', color: '#2D6A9F', fontWeight: 500 }}>
                89<span style={{ fontSize: '12px' }}>%</span>
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Auth Rate</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(45,106,159,0.15)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: '18px', color: '#2D6A9F', fontWeight: 500 }}>1</div>
              <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Platform</div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.38)',
            marginTop: '16px',
            fontFamily: '"Geist Mono", monospace',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          One unified decision-readiness platform.
        </div>
      </div>
    </div>
  );
}
