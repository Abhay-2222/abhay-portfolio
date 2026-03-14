"use client"

import { useState, useRef } from "react"
import { ChevronRight } from "lucide-react"
import Image from "next/image"

interface OnboardingSplashProps {
  onComplete: (prefs: OnboardingPrefs) => void
}

export interface OnboardingPrefs {
  householdSize: number
  weeklyBudget: number
  dietGoal: string
  hearAboutUs: string
}

const GOALS = [
  { id: "balanced",     label: "Eat balanced",   emoji: "⚖️",  desc: "Variety across all food groups" },
  { id: "save-money",   label: "Save money",      emoji: "💰",  desc: "Budget-friendly weekly plans" },
  { id: "lose-weight",  label: "Lose weight",     emoji: "🥗",  desc: "Lower-calorie, high-satiety meals" },
  { id: "build-muscle", label: "Build muscle",    emoji: "💪",  desc: "High-protein, calorie-dense meals" },
  { id: "save-time",    label: "Save time",       emoji: "⏱️",  desc: "Quick prep, batch cooking" },
  { id: "reduce-waste", label: "Reduce waste",    emoji: "🌱",  desc: "Use every ingredient fully" },
]

const HEAR_OPTIONS = [
  { label: "App Store",           emoji: "📱" },
  { label: "Instagram / Facebook", emoji: "📸" },
  { label: "TikTok",              emoji: "🎵" },
  { label: "Friend or family",    emoji: "👥" },
  { label: "Google search",       emoji: "🔍" },
  { label: "Other",               emoji: "✨" },
]

// Step 0 = welcome, steps 1-4 = questions
const TOTAL = 5

export function OnboardingSplash({ onComplete }: OnboardingSplashProps) {
  const [step, setStep] = useState(0)
  const [householdSize, setHouseholdSize] = useState(2)
  const [weeklyBudget, setWeeklyBudget] = useState(150)
  const [dietGoal, setDietGoal] = useState("balanced")
  const [hearAboutUs, setHearAboutUs] = useState("")
  const [dir, setDir] = useState<1 | -1>(1) // 1 = forward, -1 = back
  const [animKey, setAnimKey] = useState(0)

  const canContinue = step === 4 ? hearAboutUs !== "" : true

  const go = (delta: 1 | -1) => {
    setDir(delta)
    setAnimKey((k) => k + 1)
    setStep((s) => s + delta)
  }

  const next = () => {
    if (step < TOTAL - 1) go(1)
    else onComplete({ householdSize, weeklyBudget, dietGoal, hearAboutUs })
  }
  const back = () => go(-1)

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "var(--cream-50)" }}>

      {/* ── Step 0: Welcome ── */}
      {step === 0 && (
        <div className="flex-1 flex flex-col">
          {/* Full-bleed hero */}
          <div className="relative flex-1">
            <Image
              src="/avocado-toast.png"
              alt=""
              fill
              className="object-cover"
              priority
              aria-hidden="true"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(22,18,14,0.15) 0%, rgba(22,18,14,0.05) 30%, var(--cream-50) 85%)",
              }}
            />
          </div>

          {/* Text card over gradient */}
          <div className="px-6 pb-8 pt-0 flex flex-col gap-4" style={{ marginTop: -80 }}>
            {/* Leaf + wordmark */}
            <div className="flex items-center gap-2 mb-1">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 4C14 4 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 4 14 4Z"
                  fill="var(--sage)" opacity="0.9"/>
                <path d="M14 24V12" stroke="var(--sage-l)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sage-d)" }}>
                MealPlan
              </span>
            </div>

            <h1
              className="font-serif italic"
              style={{ fontSize: "clamp(32px, 8vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--foreground)" }}
            >
              Eat well,<br />every week.
            </h1>
            <p style={{ fontSize: 14, color: "var(--stone-600)", lineHeight: 1.6 }}>
              Plan your meals, track your budget, and order groceries — all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-1">
              {["🗓 Weekly planner", "🛒 Smart grocery", "💰 Budget tracking", "📊 Nutrition"].map((f) => (
                <span
                  key={f}
                  className="rounded-full px-3 py-1.5"
                  style={{ fontSize: 12, background: "var(--sage-l)", color: "var(--sage-d)", border: "1px solid var(--sage)" }}
                >
                  {f}
                </span>
              ))}
            </div>

            <button
              onClick={next}
              className="w-full rounded-2xl flex items-center justify-center gap-2 mt-2 transition-all"
              style={{ height: 54, fontSize: 15, background: "var(--sage-d)", color: "#fff", border: "none" }}
            >
              Get started <ChevronRight className="h-4 w-4" />
            </button>
            <p className="text-center" style={{ fontSize: 11, color: "var(--stone-400)" }}>
              Takes 60 seconds · No account required
            </p>
          </div>
        </div>
      )}

      {/* ── Steps 1–4: Questions ── */}
      {step > 0 && (
        <>
          {/* Progress bar */}
          <div className="h-0.5 w-full" style={{ background: "var(--cream-200)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${((step) / (TOTAL - 1)) * 100}%`, background: "var(--sage)" }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={back}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: "var(--cream-100)", color: "var(--stone-600)" }}
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--stone-400)" }}>
              {step} of {TOTAL - 1}
            </span>
            {step < TOTAL - 1 ? (
              <button
                onClick={next}
                className="px-3 py-1.5 rounded-full transition-all"
                style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "var(--stone-500)", background: "transparent" }}
              >
                SKIP
              </button>
            ) : (
              <div style={{ width: 36 }} />
            )}
          </div>

          {/* Animated content */}
          <div
            key={animKey}
            className="flex-1 flex flex-col px-6 pt-2 pb-6 overflow-y-auto"
            style={{
              animation: `slide-${dir > 0 ? "in" : "in-back"} 320ms cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}
          >
            <style>{`
              @keyframes slide-in      { from { opacity:0; transform: translateX(28px) } to { opacity:1; transform: none } }
              @keyframes slide-in-back { from { opacity:0; transform: translateX(-28px) } to { opacity:1; transform: none } }
            `}</style>

            {/* Step heading */}
            <div className="mb-6">
              {step === 1 && <>
                <p className="overline mb-1.5">Your goal</p>
                <h1 className="font-serif italic" style={{ fontSize: 28, lineHeight: 1.15, color: "var(--foreground)" }}>What brings<br/>you here?</h1>
                <p style={{ fontSize: 13, color: "var(--stone-500)", marginTop: 8 }}>We'll tailor meal suggestions around this.</p>
              </>}
              {step === 2 && <>
                <p className="overline mb-1.5">Household</p>
                <h1 className="font-serif italic" style={{ fontSize: 28, lineHeight: 1.15, color: "var(--foreground)" }}>Cooking for<br/>how many?</h1>
                <p style={{ fontSize: 13, color: "var(--stone-500)", marginTop: 8 }}>We'll scale servings and grocery quantities.</p>
              </>}
              {step === 3 && <>
                <p className="overline mb-1.5">Budget</p>
                <h1 className="font-serif italic" style={{ fontSize: 28, lineHeight: 1.15, color: "var(--foreground)" }}>Weekly grocery<br/>budget?</h1>
                <p style={{ fontSize: 13, color: "var(--stone-500)", marginTop: 8 }}>MealPlan tracks every dollar. Change anytime.</p>
              </>}
              {step === 4 && <>
                <p className="overline mb-1.5">Almost there</p>
                <h1 className="font-serif italic" style={{ fontSize: 28, lineHeight: 1.15, color: "var(--foreground)" }}>One last<br/>question</h1>
                <p style={{ fontSize: 13, color: "var(--stone-500)", marginTop: 8 }}>How did you hear about MealPlan?</p>
              </>}
            </div>

            {/* Step 1 — Goal grid */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-2.5 flex-1">
                {GOALS.map((g) => {
                  const active = dietGoal === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setDietGoal(g.id)}
                      className="py-4 px-3 rounded-2xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${active ? "var(--sage)" : "var(--cream-300)"}`,
                        background: active ? "var(--sage-l)" : "var(--card)",
                        boxShadow: active ? "var(--sh-xs)" : "none",
                        transform: active ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{g.emoji}</span>
                      <span style={{ fontSize: 13, color: active ? "var(--sage-d)" : "var(--foreground)", display: "block" }}>{g.label}</span>
                      <span style={{ fontSize: 10, color: active ? "var(--sage-d)" : "var(--stone-400)", marginTop: 2, display: "block", opacity: 0.8 }}>{g.desc}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2 — Household stepper */}
            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-center gap-10">
                  <button
                    onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                    className="h-16 w-16 rounded-full flex items-center justify-center transition-all"
                    style={{
                      border: "1.5px solid var(--cream-300)",
                      background: "var(--card)",
                      fontSize: 30,
                      color: "var(--stone-700)",
                      boxShadow: "var(--sh-xs)",
                    }}
                    aria-label="Decrease"
                  >−</button>

                  <div className="text-center" style={{ minWidth: 90 }}>
                    <span
                      className="font-serif italic text-foreground block"
                      style={{ fontSize: 72, lineHeight: 1, transition: "all 200ms" }}
                    >
                      {householdSize}
                    </span>
                    <span className="overline mt-2 block">
                      {householdSize === 1 ? "person" : "people"}
                    </span>
                  </div>

                  <button
                    onClick={() => setHouseholdSize(Math.min(10, householdSize + 1))}
                    className="h-16 w-16 rounded-full flex items-center justify-center transition-all"
                    style={{
                      border: "1.5px solid var(--sage)",
                      background: "var(--sage-l)",
                      fontSize: 30,
                      color: "var(--sage-d)",
                      boxShadow: "var(--sh-xs)",
                    }}
                    aria-label="Increase"
                  >+</button>
                </div>

                {/* Household size context */}
                <p style={{ fontSize: 12, color: "var(--stone-400)", textAlign: "center" }}>
                  {householdSize === 1 && "Solo meal prep — perfect for batch cooking"}
                  {householdSize === 2 && "Cooking for two — romantic and practical"}
                  {householdSize === 3 && "Small family — great for variety"}
                  {householdSize >= 4 && householdSize <= 5 && "Family meals — we'll scale servings"}
                  {householdSize >= 6 && "Large household — bulk-friendly recipes ahead"}
                </p>
              </div>
            )}

            {/* Step 3 — Budget */}
            {step === 3 && (
              <div className="space-y-4 flex-1">
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 transition-colors"
                  style={{
                    border: "1.5px solid var(--sage)",
                    background: "var(--card)",
                    height: 68,
                    boxShadow: "var(--sh-sm)",
                  }}
                >
                  <span style={{ fontSize: 30, color: "var(--stone-400)" }}>$</span>
                  <input
                    type="number"
                    value={weeklyBudget}
                    min={0}
                    max={9999}
                    onChange={(e) => setWeeklyBudget(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 30, color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
                    aria-label="Weekly budget"
                  />
                  <span className="overline">/ week</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[75, 100, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWeeklyBudget(preset)}
                      className="py-3 rounded-xl transition-all"
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        border: `1.5px solid ${weeklyBudget === preset ? "var(--sage)" : "var(--cream-300)"}`,
                        background: weeklyBudget === preset ? "var(--sage-l)" : "var(--card)",
                        color: weeklyBudget === preset ? "var(--sage-d)" : "var(--stone-600)",
                      }}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: "var(--stone-400)", textAlign: "center", marginTop: 8 }}>
                  Average Canadian grocery budget is $125–$175/week
                </p>
              </div>
            )}

            {/* Step 4 — Attribution */}
            {step === 4 && (
              <div className="flex flex-col gap-2 flex-1">
                {HEAR_OPTIONS.map((opt) => {
                  const active = hearAboutUs === opt.label
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setHearAboutUs(opt.label)}
                      className="py-3.5 px-4 rounded-2xl text-left flex items-center gap-3 transition-all"
                      style={{
                        fontSize: 13,
                        border: `1.5px solid ${active ? "var(--sage)" : "var(--cream-300)"}`,
                        background: active ? "var(--sage-l)" : "var(--card)",
                        color: active ? "var(--sage-d)" : "var(--foreground)",
                        transform: active ? "scale(1.01)" : "scale(1)",
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                      {opt.label}
                      {active && (
                        <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="var(--sage-d)" opacity="0.15"/>
                          <path d="M5 8L7 10L11 6" stroke="var(--sage-d)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={next}
              disabled={!canContinue}
              className="w-full rounded-2xl flex items-center justify-center gap-2 mt-5 transition-all"
              style={{
                height: 54,
                fontSize: 14,
                background: canContinue ? "var(--sage-d)" : "var(--cream-300)",
                color: canContinue ? "#fff" : "var(--stone-500)",
                border: "none",
                transform: canContinue ? "scale(1)" : "scale(0.98)",
              }}
            >
              {step < TOTAL - 1 ? (
                <>Continue <ChevronRight className="h-4 w-4" /></>
              ) : (
                "Start planning →"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
