/**
 * DSPagePreviews.jsx — Full-page templates using live ds-* CSS variables
 * 4 templates: Dashboard | Form | Marketing | Mobile
 */

import { useState } from 'react';

const PAGE_TABS = [
  { id: 'dashboard',   label: 'Dashboard'  },
  { id: 'form-page',   label: 'Form'       },
  { id: 'marketing',   label: 'Marketing'  },
  { id: 'mobile-page', label: 'Mobile'     },
];

/* ─────────────────────────────────────────────────────────
   DASHBOARD TEMPLATE
───────────────────────────────────────────────────────── */
function DashboardTemplate() {
  const stats = [
    { label: 'Total Users',  value: '24,521', delta: '+12%', up: true,  color: 'var(--ds-primary)' },
    { label: 'Revenue',      value: '$84,201', delta: '+8%',  up: true,  color: 'var(--ds-success)' },
    { label: 'Growth Rate',  value: '18.3%',  delta: '+3%',  up: true,  color: 'var(--ds-warning)' },
    { label: 'Error Rate',   value: '0.42%',  delta: '-0.1%',up: false, color: 'var(--ds-error)'   },
  ];
  const rows = [
    { user: 'Alice Kim',    action: 'Published report',  time: '2m ago',  status: 'success' },
    { user: 'Bob Torres',   action: 'Invited 3 members', time: '15m ago', status: 'info'    },
    { user: 'Carla Diaz',   action: 'Deleted project',   time: '1h ago',  status: 'warning' },
    { user: 'David Park',   action: 'Login from new IP', time: '3h ago',  status: 'error'   },
    { user: 'Eva Chen',     action: 'Completed onboard', time: '5h ago',  status: 'success' },
  ];
  const statusColor = { success: 'var(--ds-success)', info: 'var(--ds-info)', warning: 'var(--ds-warning)', error: 'var(--ds-error)' };
  const barHeights  = [55, 78, 42, 91, 63, 48, 82];
  const days        = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div style={{ display: 'flex', height: 560, fontFamily: 'var(--ds-font-body)', fontSize: 13 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'var(--ds-bg-elevated)',
        borderRight: '1px solid var(--ds-border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0',
      }}>
        {/* Logo area */}
        <div style={{ padding: '0 18px 20px', borderBottom: '1px solid var(--ds-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--ds-radius)', background: 'var(--ds-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--ds-fg)', fontSize: 14, letterSpacing: '-0.02em', fontFamily: 'var(--ds-font-display)' }}>Acme DS</span>
          </div>
        </div>
        {/* Nav items */}
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: '⊞', label: 'Home',      active: true  },
            { icon: '◈', label: 'Analytics', active: false },
            { icon: '▦', label: 'Projects',  active: false },
            { icon: '⚙', label: 'Settings',  active: false },
            { icon: '◉', label: 'Team',      active: false },
          ].map(({ icon, label, active }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 'var(--ds-radius)',
              background: active ? 'var(--ds-primary)' : 'transparent',
              color: active ? '#fff' : 'var(--ds-fg-muted)',
              cursor: 'pointer', fontWeight: active ? 600 : 400,
              transition: 'background 0.12s',
            }}>
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.7 }}>{icon}</span>
              <span style={{ fontSize: 13 }}>{label}</span>
            </div>
          ))}
        </div>
        {/* Avatar row */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--ds-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ds-primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--ds-primary)', fontWeight: 700 }}>AK</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Alice Kim</div>
            <div style={{ fontSize: 11, color: 'var(--ds-text-muted)' }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ds-bg)', overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--ds-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ds-bg-elevated)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.02em' }}>Dashboard</div>
            <div style={{ fontSize: 11, color: 'var(--ds-text-muted)', marginTop: 1 }}>Welcome back, Alice</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 14px', borderRadius: 'var(--ds-radius)', border: '1px solid var(--ds-border)', background: 'transparent', color: 'var(--ds-fg-muted)', fontSize: 12, cursor: 'pointer' }}>Export</button>
            <button style={{ padding: '6px 14px', borderRadius: 'var(--ds-radius)', border: 'none', background: 'var(--ds-primary)', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>+ New</button>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {stats.map(({ label, value, delta, up, color }) => (
              <div key={label} style={{
                padding: '16px', borderRadius: 'var(--ds-radius)', background: 'var(--ds-bg-elevated)',
                border: '1px solid var(--ds-border)', boxShadow: 'var(--ds-shadow-sm)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ds-text-muted)', marginBottom: 8, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: up ? 'var(--ds-success)' : 'var(--ds-error)', fontWeight: 700 }}>{delta}</span>
                  <span style={{ fontSize: 10, color: 'var(--ds-text-muted)' }}>vs last month</span>
                </div>
                <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: 'var(--ds-bg-subtle)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '65%', background: color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Activity table + chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
            {/* Table */}
            <div style={{ borderRadius: 'var(--ds-radius)', border: '1px solid var(--ds-border)', background: 'var(--ds-bg-elevated)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ds-border)', fontWeight: 600, color: 'var(--ds-fg)', fontSize: 13 }}>Recent Activity</div>
              <div>
                {rows.map(({ user, action, time, status }, i) => (
                  <div key={user} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1.4fr auto auto',
                    alignItems: 'center', gap: 12, padding: '10px 16px',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--ds-border)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ds-primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--ds-primary)', fontWeight: 700, flexShrink: 0 }}>
                        {user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--ds-fg)', fontWeight: 500 }}>{user}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--ds-fg-muted)' }}>{action}</span>
                    <span style={{ fontSize: 11, color: 'var(--ds-text-muted)' }}>{time}</span>
                    <div style={{ padding: '2px 8px', borderRadius: 'var(--ds-radius-lg)', background: `${statusColor[status]}20`, color: statusColor[status], fontSize: 10, fontWeight: 700 }}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ borderRadius: 'var(--ds-radius)', border: '1px solid var(--ds-border)', background: 'var(--ds-bg-elevated)', padding: 16 }}>
              <div style={{ fontWeight: 600, color: 'var(--ds-fg)', fontSize: 13, marginBottom: 16 }}>Weekly</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 8 }}>
                {barHeights.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: h, borderRadius: 'var(--ds-radius-sm)', background: i === 4 ? 'var(--ds-primary)' : 'var(--ds-primary-l)', transition: 'height 0.3s' }} />
                    <span style={{ fontSize: 9, color: 'var(--ds-text-muted)' }}>{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FORM TEMPLATE
───────────────────────────────────────────────────────── */
function FormTemplate() {
  const strengthColors = ['var(--ds-error)', 'var(--ds-warning)', 'var(--ds-warning)', 'var(--ds-success)', 'var(--ds-success)'];
  const strengthLevel  = 3; // mock medium-strong

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 520, background: 'var(--ds-bg)', fontFamily: 'var(--ds-font-body)', padding: '24px 16px' }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--ds-bg-elevated)',
        borderRadius: 'var(--ds-radius-lg)',
        border: '1px solid var(--ds-border)',
        boxShadow: 'var(--ds-shadow-md)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.03em', marginBottom: 6 }}>Create account</div>
          <div style={{ fontSize: 13, color: 'var(--ds-text-muted)', lineHeight: 1.6 }}>Fill in your details to get started. All fields required.</div>
        </div>

        {/* Form fields */}
        <div style={{ padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full name — normal state */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', display: 'block', marginBottom: 6 }}>Full name</label>
            <input readOnly value="Alice Kim" style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--ds-radius)',
              border: '1.5px solid var(--ds-border)',
              background: 'var(--ds-bg)', color: 'var(--ds-fg)',
              fontSize: 13, fontFamily: 'var(--ds-font-body)',
              boxSizing: 'border-box', outline: 'none',
            }} />
          </div>

          {/* Email — success state */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input readOnly value="alice@example.com" style={{
                width: '100%', padding: '9px 12px', paddingRight: 36, borderRadius: 'var(--ds-radius)',
                border: '1.5px solid var(--ds-success)',
                background: 'var(--ds-bg)', color: 'var(--ds-fg)',
                fontSize: 13, fontFamily: 'var(--ds-font-body)',
                boxSizing: 'border-box', outline: 'none',
              }} />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-success)', fontSize: 14, fontWeight: 700 }}>✓</span>
            </div>
          </div>

          {/* Password — with strength meter */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', display: 'block', marginBottom: 6 }}>Password</label>
            <input readOnly value="••••••••••" type="password" style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--ds-radius)',
              border: '1.5px solid var(--ds-border-strong)',
              background: 'var(--ds-bg)', color: 'var(--ds-fg)',
              fontSize: 13, fontFamily: 'var(--ds-font-body)',
              boxSizing: 'border-box', outline: 'none',
            }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strengthLevel ? strengthColors[strengthLevel - 1] : 'var(--ds-bg-subtle)', transition: 'background 0.3s' }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ds-warning)', marginTop: 3 }}>Medium strength — add symbols to improve</div>
          </div>

          {/* Role — error state */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', display: 'block', marginBottom: 6 }}>Role</label>
            <select defaultValue="" style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--ds-radius)',
              border: '1.5px solid var(--ds-error)',
              background: 'var(--ds-bg)', color: 'var(--ds-fg-muted)',
              fontSize: 13, fontFamily: 'var(--ds-font-body)',
              boxSizing: 'border-box', outline: 'none', cursor: 'pointer',
            }}>
              <option value="" disabled>Select a role...</option>
              <option>Designer</option>
              <option>Engineer</option>
              <option>Product Manager</option>
            </select>
            <div style={{ fontSize: 11, color: 'var(--ds-error)', marginTop: 4 }}>Please select a role to continue</div>
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-fg)', display: 'block', marginBottom: 6 }}>Bio <span style={{ fontSize: 11, color: 'var(--ds-text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea readOnly rows={3} defaultValue="Design systems enthusiast building for the web." style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--ds-radius)',
              border: '1.5px solid var(--ds-border)',
              background: 'var(--ds-bg)', color: 'var(--ds-fg)',
              fontSize: 13, fontFamily: 'var(--ds-font-body)',
              boxSizing: 'border-box', outline: 'none', resize: 'none',
              lineHeight: 1.6,
            }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button style={{
              padding: '9px 20px', borderRadius: 'var(--ds-radius)',
              border: '1.5px solid var(--ds-border)', background: 'transparent',
              color: 'var(--ds-fg-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--ds-font-body)',
            }}>Cancel</button>
            <button style={{
              padding: '9px 24px', borderRadius: 'var(--ds-radius)',
              border: 'none', background: 'var(--ds-primary)',
              color: '#fff', fontSize: 13, cursor: 'pointer',
              fontWeight: 600, fontFamily: 'var(--ds-font-body)',
              boxShadow: 'var(--ds-shadow-sm)',
            }}>Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MARKETING TEMPLATE
───────────────────────────────────────────────────────── */
function MarketingTemplate() {
  const features = [
    { icon: '◈', title: 'Token-driven',    desc: 'Every visual decision is encoded as a design token — color, spacing, type, motion.' },
    { icon: '⊞', title: 'Component-first', desc: 'Build from atoms to organisms. Consistent design at every layer of the stack.'         },
    { icon: '✓', title: 'WCAG compliant',  desc: 'Automated accessibility checks on every contrast ratio, touch target, and focus state.' },
  ];
  const testimonials = [
    { quote: 'Cut our design-to-dev handoff time by 60%. The token system is beautiful.', name: 'M. Torres', role: 'Head of Design' },
    { quote: 'Finally a system that adapts to our brand instead of the other way around.', name: 'J. Park', role: 'Design Lead' },
    { quote: 'The WCAG audit alone saves us hours of manual checking per sprint.', name: 'C. Diaz', role: 'Accessibility Lead' },
  ];

  return (
    <div style={{ background: 'var(--ds-bg)', fontFamily: 'var(--ds-font-body)', overflowY: 'auto', maxHeight: 560 }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 28px', borderBottom: '1px solid var(--ds-border)', background: 'var(--ds-bg-elevated)', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
          <div style={{ width: 24, height: 24, borderRadius: 'var(--ds-radius)', background: 'var(--ds-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.02em' }}>DesignKit</span>
        </div>
        {['Features', 'Pricing', 'Docs', 'Blog'].map(l => (
          <span key={l} style={{ fontSize: 13, color: 'var(--ds-fg-muted)', cursor: 'pointer' }}>{l}</span>
        ))}
        <button style={{ padding: '7px 16px', borderRadius: 'var(--ds-radius)', border: 'none', background: 'var(--ds-primary)', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Get started</button>
      </div>

      {/* Hero */}
      <div style={{ padding: '52px 28px 44px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--ds-radius-lg)', background: 'var(--ds-primary-l)', color: 'var(--ds-primary)', fontSize: 11, fontWeight: 700, marginBottom: 18, letterSpacing: '0.04em' }}>
          NEW — Design System Builder v2
        </div>
        <h1 style={{
          fontSize: 40, fontWeight: 800, color: 'var(--ds-fg)',
          fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.04em', lineHeight: 1.1,
          maxWidth: 560, margin: '0 auto 16px', fontWeight: 'var(--ds-font-weight-display)',
        }}>
          Design tokens that<br />actually scale.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ds-fg-muted)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
          Build a production-ready design system in minutes. Export to CSS, Tailwind, or JSON. Ship consistent UI, every time.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ padding: '12px 28px', borderRadius: 'var(--ds-radius)', border: 'none', background: 'var(--ds-primary)', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--ds-font-body)', boxShadow: 'var(--ds-shadow-md)' }}>Start free →</button>
          <button style={{ padding: '12px 28px', borderRadius: 'var(--ds-radius)', border: '1.5px solid var(--ds-border)', background: 'transparent', color: 'var(--ds-fg)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--ds-font-body)' }}>View docs</button>
        </div>
        {/* Hero image placeholder */}
        <div style={{ marginTop: 36, height: 140, borderRadius: 'var(--ds-radius-lg)', border: '1px solid var(--ds-border)', background: 'linear-gradient(135deg, var(--ds-primary-l) 0%, var(--ds-bg-subtle) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ds-text-muted)', fontFamily: 'var(--ds-font-mono)', letterSpacing: '0.05em' }}>PRODUCT SCREENSHOT</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '0 28px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ds-primary)', letterSpacing: '0.08em', marginBottom: 8 }}>FEATURES</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.03em', margin: 0 }}>Everything you need</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{ padding: 20, borderRadius: 'var(--ds-radius)', border: '1px solid var(--ds-border)', background: 'var(--ds-bg-elevated)', boxShadow: 'var(--ds-shadow-sm)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--ds-radius)', background: 'var(--ds-primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--ds-primary)', marginBottom: 14 }}>{icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--ds-fg)', fontSize: 14, marginBottom: 8, fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ds-fg-muted)', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '0 28px 36px', background: 'var(--ds-bg-subtle)' }}>
        <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.03em', margin: 0 }}>Loved by design teams</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingBottom: 28 }}>
          {testimonials.map(({ quote, name, role }) => (
            <div key={name} style={{ padding: 18, borderRadius: 'var(--ds-radius)', border: '1px solid var(--ds-border)', background: 'var(--ds-bg-elevated)', boxShadow: 'var(--ds-shadow-sm)' }}>
              <div style={{ fontSize: 20, color: 'var(--ds-primary)', marginBottom: 10 }}>"</div>
              <p style={{ fontSize: 12.5, color: 'var(--ds-fg-muted)', lineHeight: 1.65, margin: '0 0 14px', fontStyle: 'italic' }}>{quote}</p>
              <div style={{ fontWeight: 600, color: 'var(--ds-fg)', fontSize: 12 }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--ds-text-muted)', marginTop: 2 }}>{role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MOBILE TEMPLATE
───────────────────────────────────────────────────────── */
function MobileTemplate() {
  const tabs = [
    { icon: '⊞', label: 'Home',    active: true  },
    { icon: '◎', label: 'Search',  active: false },
    { icon: '♡', label: 'Saved',   active: false },
    { icon: '◉', label: 'Profile', active: false },
  ];
  const cards = [
    { title: 'Design Systems 101', meta: 'Course · 24 lessons', time: '2h', color: 'var(--ds-primary)' },
    { title: 'Token Architecture',  meta: 'Article · 8 min read', time: '1d', color: 'var(--ds-warning)' },
    { title: 'WCAG Accessibility',  meta: 'Video · 35 min',       time: '3d', color: 'var(--ds-success)' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 520, background: 'var(--ds-bg-subtle)', fontFamily: 'var(--ds-font-body)', padding: '24px 0' }}>
      {/* Phone shell */}
      <div style={{
        width: 320,
        borderRadius: 40,
        border: '8px solid #1a1a1a',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.05)',
        overflow: 'hidden',
        background: 'var(--ds-bg)',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{ background: '#1a1a1a', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 80, height: 20, borderRadius: 14, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2a2a2a' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1d1d1d' }} />
          </div>
        </div>

        {/* Status bar */}
        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ds-bg)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ds-fg)' }}>9:41</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'var(--ds-fg)' }}>▲▲▲</span>
            <span style={{ fontSize: 9, color: 'var(--ds-fg)' }}>WiFi</span>
            <span style={{ fontSize: 9, color: 'var(--ds-fg)' }}>100%</span>
          </div>
        </div>

        {/* App header */}
        <div style={{ padding: '8px 16px 12px', background: 'var(--ds-bg)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ds-fg)', fontFamily: 'var(--ds-font-display)', letterSpacing: '-0.03em' }}>For You</div>
          <div style={{ fontSize: 12, color: 'var(--ds-text-muted)', marginTop: 2 }}>3 new items · March 2026</div>
        </div>

        {/* Feed cards */}
        <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 300 }}>
          {cards.map(({ title, meta, time, color }) => (
            <div key={title} style={{
              borderRadius: 'var(--ds-radius-lg)', border: '1px solid var(--ds-border)',
              background: 'var(--ds-bg-elevated)', overflow: 'hidden',
              boxShadow: 'var(--ds-shadow-sm)',
            }}>
              {/* Image placeholder */}
              <div style={{ height: 80, background: `linear-gradient(135deg, ${color}33 0%, var(--ds-bg-subtle) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--ds-radius)', background: color, opacity: 0.4 }} />
              </div>
              {/* Content */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ds-fg)', letterSpacing: '-0.01em', marginBottom: 4 }}>{title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--ds-text-muted)' }}>{meta}</span>
                  <span style={{ fontSize: 10, color: 'var(--ds-text-muted)' }}>{time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          display: 'flex', borderTop: '1px solid var(--ds-border)',
          background: 'var(--ds-bg-elevated)',
          padding: '10px 0 14px',
          marginTop: 12,
        }}>
          {tabs.map(({ icon, label, active }) => (
            <div key={label} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? 'var(--ds-primary)' : 'var(--ds-text-muted)',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400 }}>{label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ds-primary)', marginTop: 1 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────── */
const TEMPLATE_MAP = {
  'dashboard':   DashboardTemplate,
  'form-page':   FormTemplate,
  'marketing':   MarketingTemplate,
  'mobile-page': MobileTemplate,
};

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif`;

export default function DSPagePreviews({ tokens, mode, scopedVars, selectedPage, onNavigate }) {
  const activeTab = PAGE_TABS.find(t => t.id === selectedPage) ? selectedPage : 'dashboard';
  const Template  = TEMPLATE_MAP[activeTab] ?? DashboardTemplate;

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: FONT, overflow: 'hidden' }}>
      {/* Page header */}
      <div style={{ padding: '28px 40px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontFamily: '"Geist Mono", monospace', color: '#b85c26', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Pages</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1814', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 8, fontFamily: FONT }}>Page Previews</h1>
        <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, margin: '0 0 20px' }}>
          Full-page templates rendered with your live design tokens. Every color, font, radius, and shadow adapts to your system.
        </p>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)', gap: 0 }}>
          {PAGE_TABS.map(t => {
            const isActive = t.id === activeTab;
            return (
              <button key={t.id}
                onClick={() => onNavigate?.(t.id)}
                style={{
                  padding: '10px 18px', border: 'none',
                  borderBottom: `2px solid ${isActive ? '#1a1814' : 'transparent'}`,
                  background: 'transparent',
                  color: isActive ? '#1a1814' : 'rgba(0,0,0,0.42)',
                  fontSize: 13.5, cursor: 'pointer',
                  fontFamily: FONT, fontWeight: isActive ? 600 : 400,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.12s, border-color 0.12s',
                  whiteSpace: 'nowrap', marginBottom: -1,
                }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template preview — scoped with ds-* vars */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 48px' }}>
        <div style={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="ds-preview" style={{ ...scopedVars }}>
            <Template />
          </div>
        </div>
      </div>
    </div>
  );
}
