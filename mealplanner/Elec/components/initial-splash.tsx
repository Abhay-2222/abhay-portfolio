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
      {/* Background image grid — subtle, darkened */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-0 opacity-20">
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

      {/* Gradient overlay — heavy at center so wordmark pops */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(44,37,30,0.92) 0%, rgba(44,37,30,0.75) 50%, rgba(44,37,30,0.5) 100%)",
        }}
      />

      {/* Wordmark */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(10px)" : "translateY(0)",
          transition: "opacity 600ms ease-out, transform 600ms ease-out",
        }}
      >
        <h1
          className="font-serif italic"
          style={{ color: "var(--cream-50)" }}
          style={{ fontSize: "clamp(40px, 10vw, 56px)", letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          MealPlan
        </h1>
        <p
          className="font-mono uppercase"
          style={{ color: "var(--cream-50)", opacity: 0.35 }}
          style={{ fontSize: "9px", letterSpacing: "0.22em" }}
        >
          Plan smart · eat well
        </p>
      </div>
    </div>
  )
}
