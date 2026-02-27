/**
 * IntroSequence.jsx — Typographic loading sequence
 *
 * Cream overlay, enormous mechanical counter (00→100),
 * three scanner lines, hard upward wipe reveal.
 * Total runtime: ~3.7s. No fades, no shaders, no particles.
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function IntroSequence() {
  const overlayRef     = useRef()
  const counterRef     = useRef()
  const counterClipRef = useRef()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const overlay     = overlayRef.current
    const counter     = counterRef.current
    const counterClip = counterClipRef.current
    if (!overlay) return

    let mounted = true

    // Keep portfolio content hidden behind the overlay
    gsap.set('#desktop-content', { opacity: 0 })

    // Scanner line sub-timelines — each sweeps left→right mechanically
    const lines = overlay.querySelectorAll('.scanner-line')
    const scannerTls = Array.from(lines).map((line, i) => {
      const tl = gsap.timeline({ repeat: -1, delay: i * 0.4 })
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'none' })
      tl.set(line, { scaleX: 0 })
      return tl
    })

    // Counter proxy — GSAP ticks the number, onUpdate writes to DOM
    const proxy = { val: 0 }

    const mainTl = gsap.timeline({
      onComplete: () => { if (mounted) setDone(true) },
    })

    // 0 → 100 over 2.8 s
    mainTl.to(proxy, {
      val: 100,
      duration: 2.8,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(proxy.val)
        counter.textContent = v < 10 ? `0${v}` : String(v)
      },
    }, 0)

    // ── Hard reveal at 2.8 s ──────────────────────────────────────────
    // Kill scanner loops first
    mainTl.call(() => scannerTls.forEach(t => t.kill()), [], 2.8)

    // Counter slides up inside its clip container
    mainTl.to(counterClip, {
      yPercent: -105,
      duration: 0.28,
      ease: 'power3.in',
    }, 2.8)

    // Overlay wipes upward (bottom inset 0% → 100%)
    mainTl.to(overlay, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.3,
      ease: 'power3.in',
    }, 2.8)

    // Portfolio snaps in behind the departing overlay
    mainTl.to('#desktop-content', { opacity: 1, duration: 0 }, 3.1)

    return () => {
      mounted = false
      mainTl.kill()
      scannerTls.forEach(t => t.kill())
      gsap.set('#desktop-content', { clearProps: 'opacity' })
    }
  }, [])

  if (done) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        background: '#FFFFFF',
        clipPath: 'inset(0 0 0% 0)',
      }}
    >
      {/* ── Scanner lines ─────────────────────────────────────────── */}
      {[30, 50, 70].map((vh) => (
        <div
          key={vh}
          className="scanner-line"
          style={{
            position: 'absolute',
            top: `${vh}vh`,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'rgba(26,24,20,0.15)',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
          }}
        />
      ))}

      {/* ── Counter + label, centred ───────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Clip wrapper — counter slides up and out through this */}
        <div style={{ overflow: 'hidden' }}>
          <div
            ref={counterClipRef}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Enormous counter */}
            <div
              ref={counterRef}
              style={{
                fontSize: 'clamp(28vw, 35vw, 38vw)',
                fontWeight: 900,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#1a1814',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              00
            </div>

            {/* Static label */}
            <div
              style={{
                marginTop: '1.5vh',
                fontFamily: 'var(--mono, "DM Mono", monospace)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'rgba(26,24,20,0.4)',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}
            >
              LOADING PORTFOLIO
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
