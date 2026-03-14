"use client"

import type { MealPlan } from "@/lib/types"

interface DailyGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DailyNutritionProps {
  mealPlan: MealPlan
  currentDay: string
  dailyGoals?: DailyGoals
}

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
}

const MACRO_COLORS = {
  calories: "var(--wheat)",
  protein:  "var(--sage)",
  carbs:    "var(--sky)",
  fat:      "var(--terracotta)",
}

export function DailyNutrition({ mealPlan, currentDay, dailyGoals }: DailyNutritionProps) {
  const dayMeals = mealPlan[currentDay] || {}
  const meals = Object.values(dayMeals)

  const totals = meals.reduce(
    (acc, meal) => {
      if (meal.nutrition) {
        const servings = Math.max(1, meal.servings ?? 1)
        acc.calories += meal.nutrition.calories / servings
        acc.protein  += meal.nutrition.protein  / servings
        acc.carbs    += meal.nutrition.carbs    / servings
        acc.fat      += meal.nutrition.fat      / servings
      }
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  if (meals.length === 0) return null

  const goals = dailyGoals ?? DEFAULT_GOALS

  const macros = [
    {
      key: "calories" as const,
      label: "Calories",
      value: Math.round(totals.calories),
      goal: goals.calories,
      unit: "kcal",
      display: Math.round(totals.calories).toLocaleString(),
    },
    {
      key: "protein" as const,
      label: "Protein",
      value: Math.round(totals.protein),
      goal: goals.protein,
      unit: "g",
      display: `${Math.round(totals.protein)}g`,
    },
    {
      key: "carbs" as const,
      label: "Carbs",
      value: Math.round(totals.carbs),
      goal: goals.carbs,
      unit: "g",
      display: `${Math.round(totals.carbs)}g`,
    },
    {
      key: "fat" as const,
      label: "Fat",
      value: Math.round(totals.fat),
      goal: goals.fat,
      unit: "g",
      display: `${Math.round(totals.fat)}g`,
    },
  ]

  return (
    <div>
      <p className="font-mono text-[8px] tracking-[0.14em] uppercase text-[var(--stone-500)] mb-2.5">
        Daily total — {meals.length} meal{meals.length > 1 ? "s" : ""} planned
      </p>

      {/* Totals row */}
      <div
        className="flex bg-card border border-[var(--cream-300)] rounded-xl overflow-hidden mb-3"
        style={{ boxShadow: "var(--sh-xs)" }}
        role="list"
        aria-label="Daily nutrition totals"
      >
        {macros.map((item, index) => (
          <div
            key={item.key}
            className={`flex-1 py-3 px-2 flex flex-col gap-0.5 items-center ${
              index < macros.length - 1 ? "border-r border-[var(--cream-200)]" : ""
            }`}
            role="listitem"
          >
            <span className="font-mono text-[16px] text-foreground leading-none">{item.display}</span>
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-[var(--stone-500)] mt-1.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress vs goals */}
      <div
        className="rounded-xl p-3 space-y-2.5"
        style={{ background: "var(--card)", border: "1px solid var(--cream-200)" }}
        aria-label="Progress toward daily goals"
      >
        <p className="font-mono text-[8px] tracking-[0.14em] uppercase text-[var(--stone-500)]">
          vs. daily goals
        </p>
        {macros.map((item) => {
          const pct = item.goal > 0 ? Math.min((item.value / item.goal) * 100, 100) : 0
          const over = item.value > item.goal
          const color = MACRO_COLORS[item.key]
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 11, color: "var(--stone-700)" }}>{item.label}</span>
                <span className="font-mono" style={{ fontSize: 10, color: over ? "var(--terra-d)" : "var(--stone-500)" }}>
                  {item.display} / {item.key === "calories" ? item.goal.toLocaleString() : item.goal}{item.unit}
                </span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "var(--cream-200)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: over ? "var(--terracotta)" : color,
                  }}
                  role="progressbar"
                  aria-label={`${item.label} ${Math.round(pct)}% of goal`}
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
