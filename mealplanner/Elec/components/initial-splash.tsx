"use client"

import { useEffect, useState } from "react"

interface InitialSplashProps {
  onComplete: () => void
}

export function InitialSplash({ onComplete }: InitialSplashProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600)
    const t2 = setTimeout(() => setPhase("out"), 2400)
    const t3 = setTimeout(() => onComplete(), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: "var(--stone-900)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 500ms ease-in-out",
      }}
    >
      {/* Background image grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-0 opacity-25">
        {[
          "/grilled-chicken-salad.png",
          "/avocado-toast.png",
          "/spaghetti-bolognese-pasta.jpg",
          "/greek-yogurt-berries.png",
          "/grilled-salmon-asparagus.png",
          "/beef-tacos-with-toppings.jpg",
          "/fluffy-pancakes-with-maple-syrup.jpg",
          "/roast-chicken-vegetables.png",
          "/zucchini-noodles-with-pesto.jpg",
          "/baked-cod-with-green-beans.jpg",
          "/protein-smoothie-bowl-with-toppings.jpg",
          "/grilled-steak-with-broccoli.jpg",
        ].map((src, i) => (
          <div key={i} className="relative overflow-hidden">
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              style={{
                transform: phase === "in" ? "scale(1.08)" : "scale(1)",
                transition: "transform 2400ms ease-out",
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark radial overlay — heavy at center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(22,18,14,0.96) 0%, rgba(22,18,14,0.82) 45%, rgba(22,18,14,0.55) 100%)",
        }}
      />

      {/* Wordmark */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 700ms ease-out, transform 700ms ease-out",
        }}
      >
        {/* Leaf icon */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"
          style={{
            opacity: phase === "in" ? 0 : 0.7,
            transition: "opacity 700ms ease-out 200ms",
          }}
        >
          <path d="M14 4C14 4 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 4 14 4Z"
            fill="#7aaa7f" opacity="0.9"/>
          <path d="M14 24V12" stroke="#fdfaf6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        </svg>

        <h1
          className="font-serif italic"
          style={{
            fontSize: "clamp(40px, 10vw, 56px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: "#fdfaf6",
            textShadow: "0 2px 24px rgba(0,0,0,0.4)",
          }}
        >
          MealPlan
        </h1>
        <p
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.24em",
            color: "rgba(253,250,246,0.55)",
          }}
        >
          Plan smart · eat well
        </p>
      </div>
    </div>
  )
}
