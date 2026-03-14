"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Palette, Database, Info, Mail, BarChart3, History, Download, Trash2 } from "lucide-react"
import { useState, useMemo } from "react"
import type { WeeklyMealPlans } from "@/lib/types"

interface SettingsProps {
  highContrast: boolean
  onHighContrastChange: (value: boolean) => void
  allMealPlans: WeeklyMealPlans
  weeklyBudget: number
  onViewHistory?: () => void
  showSnack?: boolean
  onShowSnackChange?: (value: boolean) => void
}

export function Settings({
  highContrast,
  onHighContrastChange,
  allMealPlans,
  weeklyBudget,
  onViewHistory,
  showSnack = false,
  onShowSnackChange,
}: SettingsProps) {
  const [notifications, setNotifications] = useState(true)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")

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

  return (
    <div className="space-y-6">

      {/* ── Profile ── */}
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
            <User className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <div>
            <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Profile</p>
            <p className="font-mono" style={{ fontSize: 9, color: "var(--stone-500)", letterSpacing: "0.1em" }}>
              Manage your account
            </p>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="overline">Full name</Label>
            <Input id="fullName" type="text" placeholder="Your name"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="h-9 border-[var(--cream-300)] bg-[var(--cream-50)] focus:border-[var(--sage)]"
              style={{ fontSize: 13 }} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="overline">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-9 border-[var(--cream-300)] bg-[var(--cream-50)] focus:border-[var(--sage)]"
              style={{ fontSize: 13 }} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio" className="overline">About (optional)</Label>
            <Textarea id="bio" placeholder="Your dietary preferences..."
              value={bio} onChange={(e) => setBio(e.target.value)}
              className="min-h-[72px] border-[var(--cream-300)] bg-[var(--cream-50)] focus:border-[var(--sage)] resize-none"
              style={{ fontSize: 13 }} />
          </div>
          <button
            className="w-full h-9 rounded-xl transition-all"
            style={{ fontSize: 13, background: "var(--sage-l)", color: "var(--sage-d)", border: "1.5px solid var(--sage)" }}
          >
            Save changes
          </button>
        </div>
      </section>

      {/* ── Preferences ── */}
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
            <Palette className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Preferences</p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--cream-100)" }}>
          {[
            {
              id: "high-contrast",
              label: "High Contrast Mode",
              desc: "Increase contrast for visibility",
              checked: highContrast,
              onChange: onHighContrastChange,
            },
            {
              id: "show-snack",
              label: "Snack Slot",
              desc: "Add a snack slot to each day in your plan",
              checked: showSnack,
              onChange: onShowSnackChange,
            },
            {
              id: "notifications",
              label: "Meal Reminders",
              desc: "Get notified about upcoming meals",
              checked: notifications,
              onChange: setNotifications,
            },
          ].map((pref) => (
            <div key={pref.id}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div>
                <Label htmlFor={pref.id} className="cursor-pointer" style={{ fontSize: 13, color: "var(--foreground)" }}>
                  {pref.label}
                </Label>
                <p style={{ fontSize: 11, color: "var(--stone-500)", marginTop: 1 }}>{pref.desc}</p>
              </div>
              <Switch
                id={pref.id}
                checked={pref.checked}
                onCheckedChange={pref.onChange}
                aria-label={pref.label}
                className="data-[state=checked]:bg-[var(--sage-d)] scale-90"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Analytics ── */}
      {analytics.totalMeals > 0 && (
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
              <BarChart3 className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Analytics</p>
              <p className="font-mono" style={{ fontSize: 9, color: "var(--stone-500)", letterSpacing: "0.1em" }}>
                Last {analytics.weeksAnalyzed} weeks · {analytics.totalMeals} meals
              </p>
            </div>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Avg Calories", value: analytics.avgCalories.toLocaleString(), unit: "kcal" },
                { label: "Avg Protein", value: `${analytics.avgProtein}`, unit: "g" },
              ].map((stat) => (
                <div key={stat.label}
                  className="rounded-xl p-3 flex flex-col gap-0.5"
                  style={{ background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}
                >
                  <span className="overline">{stat.label}</span>
                  <span className="font-mono" style={{ fontSize: 20, color: "var(--foreground)" }}>
                    {stat.value}<span style={{ fontSize: 11 }}>{stat.unit}</span>
                  </span>
                </div>
              ))}
            </div>
            {weeklyBudget > 0 && (
              <div className="rounded-xl p-3"
                style={{ background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="overline">Avg weekly spend</span>
                  <span className="font-mono" style={{ fontSize: 14, color: "var(--foreground)" }}>
                    ${analytics.avgWeeklySpend.toFixed(2)}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: analytics.budgetAdherence >= 0 ? "var(--sage-d)" : "var(--terra-d)" }}>
                  {analytics.budgetAdherence >= 0
                    ? `$${(weeklyBudget - analytics.avgWeeklySpend).toFixed(2)} under budget`
                    : `$${Math.abs(weeklyBudget - analytics.avgWeeklySpend).toFixed(2)} over budget`}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Data ── */}
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
            <Database className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>Data</p>
        </div>
        <div className="px-4 py-3 space-y-1.5">
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
              style={{ border: "1px solid var(--cream-200)", background: "transparent" }}
            >
              <History className="h-4 w-4 flex-shrink-0" style={{ color: "var(--stone-500)" }} />
              <span style={{ fontSize: 13, color: "var(--foreground)" }}>View week history</span>
            </button>
          )}
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{ border: "1px solid var(--cream-200)", background: "transparent" }}
          >
            <Download className="h-4 w-4 flex-shrink-0" style={{ color: "var(--stone-500)" }} />
            <span style={{ fontSize: 13, color: "var(--foreground)" }}>Export meal plans</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{ border: "1px solid rgba(193,127,90,0.3)", background: "transparent" }}
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" style={{ color: "var(--terracotta)" }} />
            <span style={{ fontSize: 13, color: "var(--terracotta)" }}>Clear all data</span>
          </button>
        </div>
      </section>

      {/* ── About ── */}
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
            <Info className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <p className="font-serif italic" style={{ fontSize: 15, color: "var(--foreground)" }}>About</p>
        </div>
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="overline">Version</span>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--stone-500)" }}>1.0.0</span>
          </div>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{ border: "1px solid var(--cream-200)", background: "transparent" }}
          >
            <Mail className="h-4 w-4 flex-shrink-0" style={{ color: "var(--stone-500)" }} />
            <span style={{ fontSize: 13, color: "var(--foreground)" }}>Contact support</span>
          </button>
        </div>
      </section>

      <div style={{ height: 8 }} />
    </div>
  )
}
