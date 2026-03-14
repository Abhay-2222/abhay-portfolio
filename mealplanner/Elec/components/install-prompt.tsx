"use client"

import { useEffect, useState } from "react"
import { X, Share, Plus } from "lucide-react"

// iOS detection
function isIOS() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Don't show if already installed
    if (isInStandaloneMode()) return

    // Don't show if dismissed before
    if (localStorage.getItem("install-prompt-dismissed")) return

    if (isIOS()) {
      // Show after a short delay so it doesn't pop up immediately
      const t = setTimeout(() => setShowIOSGuide(true), 3000)
      return () => clearTimeout(t)
    }

    // Android / Chrome — capture the install event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem("install-prompt-dismissed", "1")
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIOSGuide(false)
  }

  const installAndroid = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") dismiss()
    else setDeferredPrompt(null)
  }

  if (!mounted || dismissed || isInStandaloneMode()) return null

  // ── Android install banner ──
  if (deferredPrompt) {
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl flex items-center gap-3 px-4 py-3.5 animate-sheet-up"
        style={{
          background: "var(--card)",
          border: "1.5px solid var(--cream-200)",
          boxShadow: "var(--sh-md)",
        }}
        role="dialog"
        aria-label="Install MealPlan app"
      >
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--sage-l)" }}
        >
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 4C14 4 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 4 14 4Z"
              fill="var(--sage)" opacity="0.9"/>
            <path d="M14 24V12" stroke="var(--sage-d)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13, color: "var(--foreground)" }}>Add MealPlan to your home screen</p>
          <p style={{ fontSize: 11, color: "var(--stone-500)" }}>Works offline · Feels like a native app</p>
        </div>
        <button
          onClick={installAndroid}
          className="rounded-xl px-3 py-2 flex-shrink-0 transition-all"
          style={{ fontSize: 12, background: "var(--sage-d)", color: "#fff", border: "none" }}
        >
          Install
        </button>
        <button
          onClick={dismiss}
          className="flex-shrink-0"
          style={{ color: "var(--stone-400)", padding: 4 }}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ── iOS guide ──
  if (showIOSGuide) {
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl px-4 py-4 animate-sheet-up"
        style={{
          background: "var(--card)",
          border: "1.5px solid var(--cream-200)",
          boxShadow: "var(--sh-md)",
        }}
        role="dialog"
        aria-label="How to install MealPlan on iPhone"
      >
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 13, color: "var(--foreground)" }}>Add to Home Screen</p>
          <button onClick={dismiss} style={{ color: "var(--stone-400)", padding: 4 }} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: <Share className="h-4 w-4" />, text: "Tap the Share button in Safari" },
            { icon: <Plus className="h-4 w-4" />,  text: 'Scroll down and tap \u201cAdd to Home Screen\u201d' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--sage-l)", color: "var(--sage-d)" }}
              >
                {step.icon}
              </div>
              <p style={{ fontSize: 12, color: "var(--stone-600)" }}>{step.text}</p>
            </div>
          ))}
        </div>

        {/* Arrow pointing down-center toward Safari bar */}
        <div
          className="absolute left-1/2 -bottom-2"
          style={{
            width: 12, height: 12,
            background: "var(--card)",
            border: "1.5px solid var(--cream-200)",
            borderTop: "none", borderLeft: "none",
            transform: "translateX(-50%) rotate(45deg)",
          }}
        />
      </div>
    )
  }

  return null
}
