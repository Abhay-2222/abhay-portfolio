"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  { id: "balanced",     label: "Eat balanced",   emoji: "⚖️" },
  { id: "save-money",   label: "Save money",      emoji: "💰" },
  { id: "lose-weight",  label: "Lose weight",     emoji: "🥗" },
  { id: "build-muscle", label: "Build muscle",    emoji: "💪" },
  { id: "save-time",    label: "Save time",       emoji: "⏱️" },
  { id: "reduce-waste", label: "Reduce waste",    emoji: "🌱" },
]

const HEAR_OPTIONS = [
  "App Store",
  "Instagram / Facebook",
  "TikTok",
  "Friend or family",
  "Google search",
  "Other",
]

const STEPS = [
  {
    image: "/splash-meal-planning.jpg",
    overline: "Your goal",
    headline: "What brings\nyou here?",
    sub: "We'll tailor suggestions around what matters most to you.",
  },
  {
    image: "/splash-healthy-cooking.jpg",
    overline: "Household",
    headline: "Cooking for\nhow many?",
    sub: "We'll scale servings and grocery quantities to match.",
  },
  {
    image: "/splash-grocery-shopping.jpg",
    overline: "Budget",
    headline: "Weekly\ngrocery budget",
    sub: "MealPlan tracks every dollar. Change this anytime.",
  },
  {
    image: "/splash-meal-planning.jpg",
    overline: "Almost there",
    headline: "One last\nquestion",
    sub: "How did you hear about MealPlan?",
  },
]

export function OnboardingSplash({ onComplete }: OnboardingSplashProps) {
  const [step, setStep] = useState(0)
  const [householdSize, setHouseholdSize] = useState(2)
  const [weeklyBudget, setWeeklyBudget] = useState(150)
  const [dietGoal, setDietGoal] = useState("balanced")
  const [hearAboutUs, setHearAboutUs] = useState("")

  const totalSteps = 4
  const s = STEPS[step]
  const canContinue = step === 3 ? hearAboutUs !== "" : true

  const handleFinish = () => {
    onComplete({ householdSize, weeklyBudget, dietGoal, hearAboutUs })
  }

  const next = () => step < totalSteps - 1 ? setStep(step + 1) : handleFinish()
  const back = () => setStep(step - 1)

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">

      {/* Hero image — fills top 38% of screen */}
      <div className="relative w-full flex-shrink-0" style={{ height: "38svh", minHeight: 220 }}>
        <Image
          key={step}
          src={s.image}
          alt=""
          fill
          className="object-cover"
          style={{ transition: "opacity 400ms ease" }}
          priority
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }}
        />
        {/* Progress dots over image */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                borderRadius: 9999,
                background: i === step ? "var(--sage)" : "rgba(255,255,255,0.4)",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
        {/* Back nav */}
        {step > 0 && (
          <button
            onClick={back}
            className="absolute top-4 left-4 h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(44,37,30,0.45)", backdropFilter: "blur(8px)" }}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        )}
        {/* Skip */}
        {step < totalSteps - 1 && (
          <button
            onClick={next}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white"
            style={{
              background: "rgba(44,37,30,0.45)",
              backdropFilter: "blur(8px)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
            }}
          >
            SKIP
          </button>
        )}
      </div>

      {/* Text + controls */}
      <div className="flex-1 flex flex-col px-6 pt-2 pb-6 overflow-y-auto">

        {/* Heading */}
        <div className="mb-5">
          <p className="overline mb-1.5">{s.overline}</p>
          <h1
            className="font-serif italic text-foreground"
            style={{ fontSize: 28, lineHeight: 1.15, whiteSpace: "pre-line", letterSpacing: "-0.01em" }}
          >
            {s.headline}
          </h1>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--stone-600)" }}>
            {s.sub}
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1">

          {/* Step 0 — Goal */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setDietGoal(g.id)}
                  className="py-3.5 px-3 rounded-2xl text-left transition-all"
                  style={{
                    border: `1.5px solid ${dietGoal === g.id ? "var(--sage)" : "var(--cream-300)"}`,
                    background: dietGoal === g.id ? "var(--sage-l)" : "var(--card)",
                    color: dietGoal === g.id ? "var(--sage-d)" : "var(--foreground)",
                  }}
                >
                  <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{g.emoji}</span>
                  <span style={{ fontSize: 13 }}>{g.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Household */}
          {step === 1 && (
            <div className="flex items-center justify-center gap-8 py-6">
              <button
                onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                className="h-14 w-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  border: "1.5px solid var(--cream-300)",
                  background: "var(--card)",
                  fontSize: 28,
                  color: "var(--stone-700)",
                }}
                aria-label="Decrease"
              >−</button>

              <div className="text-center min-w-[80px]">
                <span
                  className="font-serif italic text-foreground block"
                  style={{ fontSize: 64, lineHeight: 1 }}
                >
                  {householdSize}
                </span>
                <span className="overline mt-1 block">
                  {householdSize === 1 ? "person" : "people"}
                </span>
              </div>

              <button
                onClick={() => setHouseholdSize(Math.min(10, householdSize + 1))}
                className="h-14 w-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  border: "1.5px solid var(--sage)",
                  background: "var(--sage-l)",
                  fontSize: 28,
                  color: "var(--sage-d)",
                }}
                aria-label="Increase"
              >+</button>
            </div>
          )}

          {/* Step 2 — Budget */}
          {step === 2 && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 rounded-2xl px-4 h-16 transition-colors"
                style={{ border: "1.5px solid var(--cream-300)", background: "var(--card)" }}
              >
                <span style={{ fontSize: 28, color: "var(--stone-400)" }}>$</span>
                <input
                  type="number"
                  value={weeklyBudget}
                  min={0}
                  max={9999}
                  onChange={(e) => setWeeklyBudget(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-transparent outline-none text-foreground"
                  style={{ fontSize: 28 }}
                  aria-label="Weekly budget"
                />
                <span className="overline">/ week</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[75, 100, 150, 200].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setWeeklyBudget(preset)}
                    className="py-2.5 rounded-xl transition-all"
                    style={{
                      fontSize: 13,
                      border: `1.5px solid ${weeklyBudget === preset ? "var(--sage)" : "var(--cream-300)"}`,
                      background: weeklyBudget === preset ? "var(--sage-l)" : "var(--card)",
                      color: weeklyBudget === preset ? "var(--sage-d)" : "var(--stone-600)",
                    }}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Attribution */}
          {step === 3 && (
            <div className="flex flex-col gap-2">
              {HEAR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setHearAboutUs(opt)}
                  className="py-4 px-4 rounded-2xl text-left transition-all"
                  style={{
                    fontSize: 13,
                    border: `1.5px solid ${hearAboutUs === opt ? "var(--sage)" : "var(--cream-300)"}`,
                    background: hearAboutUs === opt ? "var(--sage-l)" : "var(--card)",
                    color: hearAboutUs === opt ? "var(--sage-d)" : "var(--foreground)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          disabled={!canContinue}
          className="w-full h-13 rounded-2xl flex items-center justify-center gap-2 mt-5 transition-all"
          style={{
            height: 52,
            fontSize: 14,
            background: canContinue ? "var(--sage-d)" : "var(--cream-300)",
            color: canContinue ? "#fff" : "var(--stone-500)",
            border: "none",
          }}
        >
          {step < totalSteps - 1 ? (
            <>Continue <ChevronRight className="h-4 w-4" /></>
          ) : (
            "Start planning"
          )}
        </button>
      </div>
    </div>
  )
}
