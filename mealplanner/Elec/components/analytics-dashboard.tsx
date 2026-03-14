"use client"

import { useMemo } from "react"
import type { WeeklyMealPlans } from "@/lib/types"
import { BarChart3, TrendingUp, DollarSign, Flame, Activity } from "lucide-react"

interface AnalyticsDashboardProps {
  allMealPlans: WeeklyMealPlans
  weeklyBudget: number
}

export function AnalyticsDashboard({ allMealPlans, weeklyBudget }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const weeks = Object.keys(allMealPlans).sort().reverse().slice(0, 4)

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalSpent = 0
    let mealCount = 0
    const recipeCounts: Record<string, number> = {}

    weeks.forEach((weekKey) => {
      const weekPlan = allMealPlans[weekKey]
      Object.values(weekPlan).forEach((dayMeals) => {
        Object.values(dayMeals).forEach((recipe) => {
          mealCount++
          if (recipe.nutrition) {
            totalCalories += recipe.nutrition.calories
            totalProtein += recipe.nutrition.protein
            totalCarbs += recipe.nutrition.carbs
            totalFat += recipe.nutrition.fat
          }
          if (recipe.cost) {
            totalSpent += recipe.cost
          }
          recipeCounts[recipe.name] = (recipeCounts[recipe.name] || 0) + 1
        })
      })
    })

    const avgCalories = mealCount > 0 ? Math.round(totalCalories / mealCount) : 0
    const avgProtein = mealCount > 0 ? Math.round(totalProtein / mealCount) : 0
    const avgCarbs = mealCount > 0 ? Math.round(totalCarbs / mealCount) : 0
    const avgFat = mealCount > 0 ? Math.round(totalFat / mealCount) : 0
    const avgWeeklySpend = weeks.length > 0 ? totalSpent / weeks.length : 0
    const budgetAdherence = weeklyBudget > 0 ? ((weeklyBudget - avgWeeklySpend) / weeklyBudget) * 100 : 0

    const topRecipes = Object.entries(recipeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      avgWeeklySpend,
      budgetAdherence,
      topRecipes,
      weeksAnalyzed: weeks.length,
      totalMeals: mealCount,
    }
  }, [allMealPlans, weeklyBudget])

  if (analytics.totalMeals === 0) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-12 gap-3"
        style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
      >
        <BarChart3 className="h-10 w-10 opacity-20" style={{ color: "var(--stone-600)" }} aria-hidden="true" />
        <p style={{ fontSize: 13, color: "var(--stone-500)" }}>Plan some meals to see your analytics</p>
      </div>
    )
  }

  const macros = [
    { label: "Calories", value: analytics.avgCalories.toLocaleString(), unit: "kcal", color: "var(--wheat)" },
    { label: "Protein",  value: `${analytics.avgProtein}`,              unit: "g",    color: "var(--sage)" },
    { label: "Carbs",    value: `${analytics.avgCarbs}`,                unit: "g",    color: "var(--sky)" },
    { label: "Fat",      value: `${analytics.avgFat}`,                  unit: "g",    color: "var(--terracotta)" },
  ]

  return (
    <div className="space-y-4">

      {/* ── Macro averages ── */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: "1px solid var(--cream-200)" }}
        >
          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--sage-l)" }}>
            <Activity className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <div>
            <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Avg per meal</p>
            <p className="font-mono" style={{ fontSize: 9, color: "var(--stone-500)", letterSpacing: "0.1em" }}>
              Last {analytics.weeksAnalyzed} weeks · {analytics.totalMeals} meals
            </p>
          </div>
        </div>
        <div className="px-4 py-4 grid grid-cols-2 gap-2">
          {macros.map((m) => (
            <div
              key={m.label}
              className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{ background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}
            >
              <span className="overline">{m.label}</span>
              <span className="font-mono" style={{ fontSize: 20, color: "var(--foreground)" }}>
                {m.value}<span style={{ fontSize: 11, color: "var(--stone-500)" }}>{m.unit}</span>
              </span>
              <div
                className="h-0.5 rounded-full mt-1"
                style={{ background: m.color, opacity: 0.5, width: "100%" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Spending ── */}
      {weeklyBudget > 0 && (
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--cream-200)" }}
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--sage-l)" }}>
              <DollarSign className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
            </div>
            <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Spending</p>
          </div>
          <div className="px-4 py-4">
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="overline">Avg weekly spend</span>
                <span className="font-mono" style={{ fontSize: 16, color: "var(--foreground)" }}>
                  ${analytics.avgWeeklySpend.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="h-3 w-3 flex-shrink-0"
                  style={{ color: analytics.budgetAdherence >= 0 ? "var(--sage-d)" : "var(--terra-d)" }}
                  aria-hidden="true"
                />
                <p style={{ fontSize: 11, color: analytics.budgetAdherence >= 0 ? "var(--sage-d)" : "var(--terra-d)" }}>
                  {analytics.budgetAdherence >= 0
                    ? `$${(weeklyBudget - analytics.avgWeeklySpend).toFixed(2)} under budget`
                    : `$${Math.abs(weeklyBudget - analytics.avgWeeklySpend).toFixed(2)} over budget`}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Top recipes ── */}
      {analytics.topRecipes.length > 0 && (
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--cream-200)" }}
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--sage-l)" }}>
              <Flame className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
            </div>
            <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Top recipes</p>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {analytics.topRecipes.map((recipe, index) => (
              <div
                key={recipe.name}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}
              >
                <span
                  className="font-mono flex-shrink-0"
                  style={{ fontSize: 10, color: "var(--stone-500)", width: 18 }}
                >
                  #{index + 1}
                </span>
                <span style={{ fontSize: 13, color: "var(--foreground)", flex: 1 }}>{recipe.name}</span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--stone-500)" }}>
                  {recipe.count}×
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
