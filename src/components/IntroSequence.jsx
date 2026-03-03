/**
 * IntroSequence.jsx — Gradient bouncing ball loader
 *
 * Ball has a moving internal gradient using the exact
 * sky-blue palette from the Desktop Scene 1 background,
 * so the final expansion blends seamlessly into the homepage.
 *
 * 5 bounces, growing each cycle → expands to fill screen → dissolve.
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// Very light pastel — almost white, barely blue
const GRADIENT = `linear-gradient(
  135deg,
  #FFFFFF  0%,
  #F0F9FF 18%,
  #E0F2FE 36%,
  #BAE6FD 55%,
  #93C5FD 74%,
  #E0F2FE 88%,
  #F0F9FF 100%
)`

// 5 bounces: [diameter px, apex px]
const BOUNCES = [
  [18,  66],
  [26,  80],
  [35,  94],
  [45, 108],
  [56, 122],
]

const UP   = 0.34
const DOWN = 0.26
const REC  = 0.12

export default function IntroSequence() {
  const overlayRef = useRef()
  const sizerRef   = useRef()
  const ballRef    = useRef()
  const shadowRef  = useRef()
  const labelRef   = useRef()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const overlay = overlayRef.current
    const sizer   = sizerRef.current
    const ball    = ballRef.current
    const shadow  = shadowRef.current
    const label   = labelRef.current
    if (!overlay || !ball) return

    let mounted = true
    gsap.set('#desktop-content', { opacity: 0 })
    gsap.set(ball, { transformOrigin: '50% 100%' })

    const main = gsap.timeline({
      onComplete: () => { if (mounted) setDone(true) },
    })

    /* ── 5 bounces, each larger ── */
    let t = 0

    BOUNCES.forEach(([size, apex]) => {
      // Grow to this bounce's diameter
      main.to(sizer, { width: size, height: size, duration: 0.10, ease: 'power1.out' }, t)

      // Rise — stretch
      main.to(ball,   { y: -apex, scaleX: 0.76, scaleY: 1.30, duration: UP,   ease: 'power2.out' }, t)
      main.to(shadow, { scaleX: 0.18, opacity: 0.05,           duration: UP,   ease: 'power2.out' }, t)
      t += UP

      // Land — squash
      main.to(ball,   { y: 0, scaleX: 1.40, scaleY: 0.60, duration: DOWN, ease: 'power3.in'  }, t)
      main.to(shadow, { scaleX: 1,  opacity: 0.55,          duration: DOWN, ease: 'power3.in'  }, t)
      t += DOWN

      // Spring back
      main.to(ball, { scaleX: 1, scaleY: 1, duration: REC, ease: 'back.out(3.5)' }, t)
      t += REC
    })

    /* ── Counter: 0 → 100 over the full bounce phase ── */
    const proxy = { val: 0 }
    main.to(proxy, {
      val: 100,
      duration: t,
      ease: 'power1.inOut',
      onUpdate() { if (label) label.textContent = Math.round(proxy.val) },
    }, 0)

    /* ── Expansion: ball swells to fill viewport ── */
    const fill = Math.max(window.innerWidth, window.innerHeight) * 3.0

    main.set(ball, { scaleX: 1, scaleY: 1 }, t)

    // Fade counter + shadow
    main.to([label, shadow], { opacity: 0, duration: 0.15 }, t)

    // Swell
    main.to(sizer, {
      width:    fill,
      height:   fill,
      duration: 0.72,
      ease:     'power3.in',
    }, t)

    // Dissolve overlay once screen is filled
    main.to(overlay, {
      opacity:  0,
      duration: 0.28,
      ease:     'power2.inOut',
    }, t + 0.56)

    // Reveal homepage
    main.to('#desktop-content', { opacity: 1, duration: 0 }, t + 0.84)

    return () => {
      mounted = false
      main.kill()
      gsap.set('#desktop-content', { clearProps: 'opacity' })
    }
  }, [])

  if (done) return null

  return (
    <>
      {/* Keyframes for the internal gradient shimmer */}
      <style>{`
        @keyframes ballShimmer {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .intro-ball {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${GRADIENT};
          background-size: 300% 300%;
          animation: ballShimmer 1.8s ease-in-out infinite;
          box-shadow:
            0 0 12px rgba(224, 242, 254, 0.90),
            0 0 32px rgba(186, 230, 253, 0.40);
        }
      `}</style>

      <div
        ref={overlayRef}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          background:     '#ffffff',
          overflow:       'hidden',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          paddingTop:    140,
        }}>

          {/* Sizer — only width/height, no visual styles */}
          <div
            ref={sizerRef}
            style={{ width: BOUNCES[0][0], height: BOUNCES[0][0], flexShrink: 0 }}
          >
            {/* Ball — squash/stretch + gradient shimmer */}
            <div ref={ballRef} className="intro-ball" />
          </div>

          {/* Shadow — ground projection */}
          <div
            ref={shadowRef}
            style={{
              width:           BOUNCES[0][0],
              height:          5,
              marginTop:       4,
              borderRadius:    '50%',
              background:      'rgba(30,70,120,0.28)',
              filter:          'blur(4px)',
              transformOrigin: '50% 50%',
            }}
          />

          {/* Counter */}
          <div
            ref={labelRef}
            style={{
              marginTop:     22,
              fontFamily:    'var(--mono, monospace)',
              fontSize:      '12px',
              letterSpacing: '0.08em',
              color:         'rgba(10,10,10,0.35)',
              userSelect:    'none',
              minWidth:      '2ch',
              textAlign:     'center',
            }}
          >
            0
          </div>

        </div>
      </div>
    </>
  )
}
