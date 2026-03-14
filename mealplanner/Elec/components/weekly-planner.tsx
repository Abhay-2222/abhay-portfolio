"use client"

import { useState } from "react"
import type { MealPlan, WeeklyMealPlans, Recipe } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Grid3x3, Calendar, MoreVertical, Trash2, Plus } from "lucide-react"
import Image from "next/image"
import { formatWeekRange, getDaysOfWeek, formatDayWithDate, getDayKey, getWeekStart, getWeekKey } from "@/lib/date-utils"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DailyNutrition } from "./daily-nutrition"
import { RecipeDetailSheet } from "./recipe-detail-sheet"

interface WeeklyPlannerProps {
  mealPlan: MealPlan
  allMealPlans: WeeklyMealPlans
  onUpdateMealPlan: (mealPlan: MealPlan) => void
  onAddMeal: (day: string, mealType: string) => void
  currentWeekStart: Date
  onWeekChange: (date: Date) => void
  weeklyBudget: number
  onBudgetChange: (budget: number) => void
  actualSpending: number
  showSnack?: boolean
  dailyGoals?: { calories: number; protein: number; carbs: number; fat: number }
  favouriteIds?: string[]
  onToggleFavourite?: (id: string) => void
}

const BASE_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const

const getAbbreviatedDay = (date: Date) => ["S","M","T","W","T","F","S"][date.getDay()]
const getDayNumber = (date: Date) => date.getDate().toString()

export function WeeklyPlanner({
  mealPlan, allMealPlans, onUpdateMealPlan, onAddMeal,
  currentWeekStart, onWeekChange,
  weeklyBudget, onBudgetChange, actualSpending,
  showSnack = false, dailyGoals, favouriteIds, onToggleFavourite,
}: WeeklyPlannerProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"single" | "grid">("single")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState("")

  const MEAL_TYPES = showSnack
    ? (["breakfast", "lunch", "dinner", "snack"] as const)
    : BASE_MEAL_TYPES

  // Derive last week's plan from persisted allMealPlans instead of volatile useState
  const prevWeekStart = new Date(currentWeekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const lastWeekMealPlan = allMealPlans[getWeekKey(prevWeekStart)] ?? null

  const daysOfWeek = getDaysOfWeek(currentWeekStart)
  const currentDate = daysOfWeek[currentDayIndex]
  const currentDay = getDayKey(currentDate)
  const isCurrentWeek = getWeekStart(new Date()).getTime() === currentWeekStart.getTime()
  const hasMeals = Object.keys(mealPlan).length > 0

  const goToPreviousWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() - 7)
    onWeekChange(d)
    setCurrentDayIndex(0)
  }
  const goToNextWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + 7)
    onWeekChange(d)
    setCurrentDayIndex(0)
  }
  const goToCurrentWeek = () => {
    onWeekChange(getWeekStart(new Date()))
    const dow = new Date().getDay()
    setCurrentDayIndex(dow === 0 ? 6 : dow - 1)
  }
  const handleRemoveMeal = (day: string, mealType: string) => {
    const n = { ...mealPlan }
    if (n[day]) {
      delete n[day][mealType]
      if (Object.keys(n[day]).length === 0) delete n[day]
    }
    onUpdateMealPlan(n)
  }
  const handleClearAll = () => { onUpdateMealPlan({}); setShowClearConfirm(false) }
  const handleCopyLastWeek = () => { if (lastWeekMealPlan) onUpdateMealPlan(lastWeekMealPlan) }

  // Budget ambient bar
  const budgetPct = weeklyBudget > 0 ? Math.min((actualSpending / weeklyBudget) * 100, 100) : 0
  const isOverBudget = weeklyBudget > 0 && actualSpending > weeklyBudget

  return (
    <div className="space-y-0">

      {/* ── Ambient budget strip ── */}
      {weeklyBudget > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontSize: 11, color: "var(--stone-600)" }}>
              Grocery estimate
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 11, color: isOverBudget ? "var(--terra-d)" : "var(--stone-700)" }}
            >
              ${actualSpending.toFixed(2)}
              <span style={{ color: "var(--stone-400)" }}> / ${weeklyBudget.toFixed(0)}</span>
            </span>
          </div>
          <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "var(--cream-200)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${budgetPct}%`,
                background: isOverBudget ? "var(--terracotta)" : "var(--sage)",
              }}
            />
          </div>
        </div>
      )}
      {weeklyBudget === 0 && (
        <div className="mb-4">
          {editingBudget ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const v = parseFloat(budgetDraft)
                if (v > 0) { onBudgetChange(v); setEditingBudget(false); setBudgetDraft("") }
              }}
            >
              <div className="relative flex-1">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-mono"
                  style={{ fontSize: 12, color: "var(--stone-500)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  autoFocus
                  placeholder="0"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="w-full pl-6 pr-3 h-9 rounded-xl outline-none font-mono"
                  style={{
                    fontSize: 13,
                    border: "1.5px solid var(--sage)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                  aria-label="Weekly budget amount"
                />
              </div>
              <button
                type="submit"
                className="h-9 px-4 rounded-xl"
                style={{ fontSize: 12, background: "var(--sage-l)", color: "var(--sage-d)", border: "1.5px solid var(--sage)" }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingBudget(false)}
                className="h-9 px-3 rounded-xl"
                style={{ fontSize: 12, color: "var(--stone-500)", border: "1.5px solid var(--cream-300)", background: "var(--card)" }}
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => { setEditingBudget(true); setBudgetDraft("") }}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              style={{
                fontSize: 12,
                color: "var(--stone-500)",
                border: "1.5px dashed var(--cream-300)",
                background: "transparent",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Set weekly budget
            </button>
          )}
        </div>
      )}

      {/* ── Week nav ── */}
      <div className="flex items-center justify-between gap-1 mb-3">
        <Button variant="ghost" size="icon" onClick={goToPreviousWeek}
          aria-label="Previous week" className="h-8 w-8 flex-shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <p
          className="font-mono text-center flex-1 transition-all"
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            color: isCurrentWeek ? "var(--sage-d)" : "var(--stone-700)",
          }}
          aria-live="polite"
        >
          {formatWeekRange(currentWeekStart)}
        </p>

        <div className="flex gap-0.5 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setViewMode(viewMode === "single" ? "grid" : "single")}
            aria-label={viewMode === "single" ? "Grid view" : "Single day view"}>
            {viewMode === "single"
              ? <Grid3x3 className="h-3.5 w-3.5" />
              : <Calendar className="h-3.5 w-3.5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Options">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCurrentWeek && (
                <>
                  <DropdownMenuItem onClick={goToCurrentWeek}>
                    <Calendar className="h-4 w-4 mr-2" />Go to current week
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleCopyLastWeek} disabled={!lastWeekMealPlan}>
                <Calendar className="h-4 w-4 mr-2" />Copy last week
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowClearConfirm(true)} disabled={!hasMeals}
                className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Clear all meals
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" onClick={goToNextWeek}
          aria-label="Next week" className="h-8 w-8 flex-shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Day selector ── */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide mb-4"
        role="tablist"
        aria-label="Days of the week"
      >
        {daysOfWeek.map((date, index) => {
          const dayKey = getDayKey(date)
          const mealCount = Object.keys(mealPlan[dayKey] || {}).length
          const isActive = index === currentDayIndex
          const isToday = date.toDateString() === new Date().toDateString()
          return (
            <button
              key={index}
              onClick={() => setCurrentDayIndex(index)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${formatDayWithDate(date)}${isToday ? " (today)" : ""}${mealCount > 0 ? `, ${mealCount} meals` : ""}`}
              className="flex flex-col items-center gap-0.5 min-w-[44px] py-2 px-1 rounded-xl transition-all"
              style={{
                border: `1.5px solid ${isActive ? "var(--sage)" : "var(--cream-200)"}`,
                background: isActive ? "var(--sage-l)" : "var(--card)",
                color: isActive ? "var(--sage-d)" : "var(--stone-600)",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {getAbbreviatedDay(date)}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.2 }}>{getDayNumber(date)}</span>
              {isToday && (
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--sage)" }} aria-hidden="true" />
              )}
              {!isToday && mealCount > 0 && (
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--cream-400)" }} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {viewMode === "single" ? (
        <>
          {/* ── Meal cards ── */}
          <div className="space-y-3" role="region" aria-label={`Meals for ${formatDayWithDate(currentDate)}`}>
            {MEAL_TYPES.map((mealType) => {
              const meal = mealPlan[currentDay]?.[mealType]
              return (
                <div key={mealType}>
                  {meal ? (
                    /* Filled meal card — tappable to view recipe detail */
                    <div
                      className="rounded-2xl overflow-hidden transition-all"
                      style={{ border: "1.5px solid var(--cream-200)", background: "var(--card)", boxShadow: "var(--sh-sm)", cursor: "pointer" }}
                      onClick={() => setDetailRecipe(meal)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View recipe: ${meal.name}`}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailRecipe(meal) }}
                    >
                      {/* Cover image */}
                      <div className="relative w-full" style={{ height: 140 }}>
                        <Image
                          src={meal.image || "/placeholder.jpg"}
                          alt={meal.name}
                          fill
                          className="object-cover"
                        />
                        {/* Meal type chip + remove button overlaid */}
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                          <span
                            className="font-mono uppercase px-2 py-1 rounded-lg"
                            style={{
                              fontSize: 8,
                              letterSpacing: "0.12em",
                              background: "rgba(44,37,30,0.55)",
                              backdropFilter: "blur(6px)",
                              color: "rgba(253,250,246,0.9)",
                            }}
                          >
                            {mealType}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveMeal(currentDay, mealType) }}
                            className="h-7 w-7 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: "rgba(44,37,30,0.55)",
                              backdropFilter: "blur(6px)",
                            }}
                            aria-label={`Remove ${meal.name}`}
                          >
                            <X className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                      {/* Info row */}
                      <div className="px-3.5 py-3 flex items-center justify-between">
                        <div>
                          <p style={{ fontSize: 14, color: "var(--foreground)", lineHeight: 1.3 }}>{meal.name}</p>
                          <p style={{ fontSize: 11, color: "var(--stone-500)", marginTop: 2 }}>
                            ~{meal.prepTime + meal.cookTime} min · {meal.servings} servings
                            {meal.nutrition && ` · ${meal.nutrition.calories} kcal`}
                          </p>
                        </div>
                        {meal.cost && (
                          <span
                            className="font-mono"
                            style={{ fontSize: 12, color: "var(--stone-600)" }}
                          >
                            ${meal.cost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty slot */
                    <button
                      onClick={() => onAddMeal(currentDay, mealType)}
                      className="w-full rounded-2xl flex items-center gap-3 px-4 transition-all"
                      style={{
                        height: 64,
                        border: "1.5px dashed var(--cream-300)",
                        background: "transparent",
                      }}
                      aria-label={`Add ${mealType} for ${formatDayWithDate(currentDate)}`}
                    >
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--cream-200)" }}
                      >
                        <Plus className="h-3.5 w-3.5" style={{ color: "var(--stone-500)" }} />
                      </div>
                      <div className="text-left">
                        <span className="overline block mb-0.5">{mealType}</span>
                        <span style={{ fontSize: 12, color: "var(--stone-400)" }}>Add meal</span>
                      </div>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <DailyNutrition mealPlan={mealPlan} currentDay={currentDay} dailyGoals={dailyGoals} />
          </div>
        </>
      ) : (
        /* ── Grid view ── */
        <div className="space-y-3">
          {daysOfWeek.map((date, index) => {
            const dayKey = getDayKey(date)
            const dayMeals = mealPlan[dayKey] || {}
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <div
                key={index}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `1.5px solid ${isToday ? "var(--sage)" : "var(--cream-200)"}`,
                  background: "var(--card)",
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--cream-200)" }}
                >
                  <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                    {formatDayWithDate(date)}
                    {isToday && (
                      <span
                        className="font-mono ml-2 px-1.5 py-0.5 rounded-md"
                        style={{ fontSize: 8, letterSpacing: "0.1em", background: "var(--sage-l)", color: "var(--sage-d)" }}
                      >
                        TODAY
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--stone-500)" }}>
                    {Object.keys(dayMeals).length} / 3
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-0">
                  {MEAL_TYPES.map((mealType) => {
                    const meal = dayMeals[mealType]
                    return (
                      <div key={mealType} className="relative" style={{ aspectRatio: "1/1" }}>
                        {meal ? (
                          <>
                            <Image
                              src={meal.image || "/placeholder.jpg"}
                              alt={meal.name}
                              fill
                              className="object-cover"
                            />
                            <div
                              className="absolute inset-0 flex items-end p-1.5"
                              style={{ background: "linear-gradient(to top, rgba(44,37,30,0.7) 0%, transparent 60%)" }}
                            >
                              <span className="text-white line-clamp-2" style={{ fontSize: 9, lineHeight: 1.3 }}>
                                {meal.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveMeal(dayKey, mealType)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(44,37,30,0.6)" }}
                              aria-label={`Remove ${meal.name}`}
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onAddMeal(dayKey, mealType)}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 transition-all"
                            style={{ background: "var(--cream-50)" }}
                            aria-label={`Add ${mealType} for ${formatDayWithDate(date)}`}
                          >
                            <Plus className="h-4 w-4" style={{ color: "var(--cream-400)" }} />
                            <span className="overline" style={{ color: "var(--cream-400)" }}>{mealType.slice(0, 5)}</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all meals?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all meals from the current week. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RecipeDetailSheet
        recipe={detailRecipe}
        isOpen={!!detailRecipe}
        onClose={() => setDetailRecipe(null)}
        isFavourite={detailRecipe ? (favouriteIds ?? []).includes(detailRecipe.id) : false}
        onToggleFavourite={onToggleFavourite}
      />
    </div>
  )
}
