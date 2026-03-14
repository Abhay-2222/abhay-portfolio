"use client"

import { useState } from "react"
import type { Recipe, WeeklyMealPlans } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Clock, Users, Sparkles, AlertCircle, TrendingUp, ChevronDown, Heart, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSuggestedRecipes, wasRecentlyEaten, getMealEatenCount } from "@/lib/meal-utils"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SortKey = "default" | "price-asc" | "calories-asc" | "time-asc" | "most-eaten"

interface RecipeSelectorSheetProps {
  recipes: Recipe[]
  isOpen: boolean
  onClose: () => void
  onSelectRecipe: (recipe: Recipe) => void
  currentMeal?: string
  allMealPlans: WeeklyMealPlans
  weeklyBudget?: number
  favouriteIds?: string[]
  onToggleFavourite?: (id: string) => void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: "var(--wheat-l)",  text: "var(--wheat-d)" },
  lunch:     { bg: "var(--sky-l)",    text: "var(--sky)" },
  dinner:    { bg: "var(--plum-l)",   text: "var(--plum)" },
  snack:     { bg: "var(--sage-l)",   text: "var(--sage-d)" },
}

const DIETS = ["all", "classic", "low-carb", "keto", "flexitarian", "paleo", "vegetarian", "pescatarian", "vegan"]

const SORT_LABELS: Record<SortKey, string> = {
  "default":      "Default",
  "price-asc":    "Price ↑",
  "calories-asc": "Calories ↑",
  "time-asc":     "Time ↑",
  "most-eaten":   "Most eaten",
}

export function RecipeSelectorSheet({
  recipes, isOpen, onClose, onSelectRecipe,
  currentMeal, allMealPlans, weeklyBudget,
  favouriteIds = [], onToggleFavourite,
}: RecipeSelectorSheetProps) {
  const [search, setSearch] = useState("")
  const [selectedDiet, setSelectedDiet] = useState("all")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("default")
  const [showSort, setShowSort] = useState(false)
  const [confirmRecipe, setConfirmRecipe] = useState<{
    recipe: Recipe
    recentInfo: { eaten: boolean; daysAgo?: number }
  } | null>(null)

  const mealType = currentMeal?.split(" ")[0]?.toLowerCase()

  const suggested = getSuggestedRecipes(recipes, allMealPlans, showSuggestions ? mealType : undefined, weeklyBudget)
  const pool = showSuggestions ? suggested : recipes

  const favSet = new Set(favouriteIds)

  const filtered = pool
    .filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
      const matchDiet = selectedDiet === "all" || r.diet === selectedDiet
      const matchFav = !showFavouritesOnly || favSet.has(r.id)
      return matchSearch && matchDiet && matchFav
    })
    .sort((a, b) => {
      if (sortKey === "price-asc") {
        const ac = a.cost ?? 999, bc = b.cost ?? 999
        return ac - bc
      }
      if (sortKey === "calories-asc") {
        const ac = a.nutrition?.calories ?? 999, bc = b.nutrition?.calories ?? 999
        return ac - bc
      }
      if (sortKey === "time-asc") {
        return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime)
      }
      if (sortKey === "most-eaten") {
        return getMealEatenCount(b.id, allMealPlans) - getMealEatenCount(a.id, allMealPlans)
      }
      return 0
    })

  const handleSelect = (recipe: Recipe) => {
    const recent = wasRecentlyEaten(recipe.id, allMealPlans, 3)
    if (recent.eaten) {
      setConfirmRecipe({ recipe, recentInfo: recent })
      return
    }
    onSelectRecipe(recipe)
    onClose()
    setSearch("")
    setShowSuggestions(false)
  }

  const confirmSelect = () => {
    if (confirmRecipe) {
      onSelectRecipe(confirmRecipe.recipe)
      onClose()
      setSearch("")
      setShowSuggestions(false)
      setConfirmRecipe(null)
    }
  }

  const reset = () => {
    setSearch("")
    setShowSuggestions(false)
    setShowFilters(false)
    setShowSort(false)
    setShowFavouritesOnly(false)
    setSortKey("default")
    setSelectedDiet("all")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose() } }}>
        <DialogContent className="max-w-lg h-[88vh] p-0 flex flex-col overflow-hidden rounded-3xl">

          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
            <DialogTitle className="font-serif italic text-[18px] text-foreground">
              {currentMeal ? `Select ${currentMeal}` : "Select recipe"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 space-y-2.5 flex-shrink-0">
            {/* Smart suggestions banner */}
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all text-left"
              style={{
                background: showSuggestions ? "var(--sage-l)" : "var(--cream-100)",
                border: `1.5px solid ${showSuggestions ? "var(--sage)" : "var(--cream-300)"}`,
              }}
            >
              <Sparkles
                className="h-4 w-4 flex-shrink-0"
                style={{ color: showSuggestions ? "var(--sage-d)" : "var(--stone-500)" }}
              />
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 13, color: showSuggestions ? "var(--sage-d)" : "var(--stone-700)" }}>
                  {showSuggestions ? "Showing smart suggestions" : "Show smart suggestions"}
                </span>
                {!showSuggestions && (
                  <span
                    className="block"
                    style={{ fontSize: 10, color: "var(--stone-500)", marginTop: 1 }}
                  >
                    Personalised picks based on your history
                  </span>
                )}
              </div>
            </button>

            {/* Search + filter toggle */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                  style={{ color: "var(--stone-400)" }} aria-hidden="true" />
                <Input
                  placeholder="Search recipes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl"
                  style={{ fontSize: 13 }}
                  aria-label="Search recipes"
                />
              </div>
              {/* Favourites toggle */}
              <button
                onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  border: `1.5px solid ${showFavouritesOnly ? "var(--terracotta)" : "var(--cream-300)"}`,
                  background: showFavouritesOnly ? "var(--terra-l)" : "var(--card)",
                }}
                aria-pressed={showFavouritesOnly}
                aria-label="Show favourites only"
              >
                <Heart
                  className="h-3.5 w-3.5"
                  style={{
                    color: showFavouritesOnly ? "var(--terracotta)" : "var(--stone-500)",
                    fill: showFavouritesOnly ? "var(--terracotta)" : "none",
                  }}
                />
              </button>
              {/* Sort */}
              <button
                onClick={() => setShowSort(!showSort)}
                className="h-10 px-2.5 rounded-xl flex items-center gap-1 transition-all flex-shrink-0"
                style={{
                  border: `1.5px solid ${sortKey !== "default" ? "var(--sage)" : "var(--cream-300)"}`,
                  background: sortKey !== "default" ? "var(--sage-l)" : "var(--card)",
                  fontSize: 11,
                  color: sortKey !== "default" ? "var(--sage-d)" : "var(--stone-600)",
                }}
                aria-expanded={showSort}
                aria-label="Sort recipes"
              >
                <ArrowUpDown className="h-3 w-3" />
              </button>
              {/* Diet filter */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 px-3 rounded-xl flex items-center gap-1.5 transition-all flex-shrink-0"
                style={{
                  border: `1.5px solid ${selectedDiet !== "all" ? "var(--sage)" : "var(--cream-300)"}`,
                  background: selectedDiet !== "all" ? "var(--sage-l)" : "var(--card)",
                  fontSize: 12,
                  color: selectedDiet !== "all" ? "var(--sage-d)" : "var(--stone-600)",
                }}
                aria-expanded={showFilters}
              >
                {selectedDiet === "all" ? "Diet" : selectedDiet}
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform"
                  style={{ transform: showFilters ? "rotate(180deg)" : "none" }}
                />
              </button>
            </div>

            {/* Sort pills */}
            {showSort && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Sort options">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSortKey(key); setShowSort(false) }}
                    className="px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                    style={{
                      fontSize: 12,
                      border: `1.5px solid ${sortKey === key ? "var(--sage)" : "var(--cream-300)"}`,
                      background: sortKey === key ? "var(--sage-l)" : "var(--card)",
                      color: sortKey === key ? "var(--sage-d)" : "var(--stone-600)",
                    }}
                    aria-pressed={sortKey === key}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}

            {/* Diet filter pills — collapsible */}
            {showFilters && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filter by diet">
                {DIETS.map((diet) => (
                  <button
                    key={diet}
                    onClick={() => { setSelectedDiet(diet); if (diet !== "all") setShowFilters(false) }}
                    className="px-3 py-1.5 rounded-full flex-shrink-0 capitalize transition-all"
                    style={{
                      fontSize: 12,
                      border: `1.5px solid ${selectedDiet === diet ? "var(--sage)" : "var(--cream-300)"}`,
                      background: selectedDiet === diet ? "var(--sage-l)" : "var(--card)",
                      color: selectedDiet === diet ? "var(--sage-d)" : "var(--stone-600)",
                    }}
                    aria-pressed={selectedDiet === diet}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            )}

            {/* Count */}
            <p style={{ fontSize: 11, color: "var(--stone-400)" }}>
              {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
              {selectedDiet !== "all" && ` · ${selectedDiet}`}
            </p>
          </div>

          {/* Recipe list */}
          <ScrollArea className="flex-1 px-5 overflow-y-auto">
            <div className="space-y-2.5 py-3" role="list" aria-label="Recipes">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p style={{ fontSize: 13, color: "var(--stone-500)" }}>No recipes match your search</p>
                </div>
              ) : (
                filtered.map((recipe) => {
                  const recent = wasRecentlyEaten(recipe.id, allMealPlans, 3)
                  const count = getMealEatenCount(recipe.id, allMealPlans)
                  const catColor = CATEGORY_COLORS[recipe.category] ?? { bg: "var(--cream-100)", text: "var(--stone-600)" }

                  const isFav = favSet.has(recipe.id)
                  return (
                    <div
                      key={recipe.id}
                      className="rounded-2xl overflow-hidden transition-all relative"
                      style={{
                        border: `1.5px solid ${recent.eaten ? "rgba(193,127,90,0.4)" : "var(--cream-200)"}`,
                        background: recent.eaten ? "rgba(245,232,222,0.5)" : "var(--card)",
                        boxShadow: "var(--sh-xs)",
                      }}
                      role="listitem"
                    >
                    <button
                      onClick={() => handleSelect(recipe)}
                      className="w-full text-left"
                      aria-label={`${recipe.name}, ${recipe.prepTime + recipe.cookTime} min, ${recipe.servings} servings`}
                    >
                      <div className="flex gap-0">
                        {/* Image — larger, square */}
                        <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
                          <Image
                            src={recipe.image || "/placeholder.jpg"}
                            alt={recipe.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p style={{ fontSize: 14, lineHeight: 1.3, color: "var(--foreground)" }}
                                className="line-clamp-2">
                                {recipe.name}
                              </p>
                              {recipe.cost && (
                                <span
                                  className="font-mono flex-shrink-0"
                                  style={{ fontSize: 12, color: "var(--stone-600)" }}
                                >
                                  ${recipe.cost.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{ fontSize: 10, background: catColor.bg, color: catColor.text }}
                              >
                                {recipe.category}
                              </span>
                              {count > 0 && (
                                <span
                                  className="px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ fontSize: 10, background: "var(--cream-100)", color: "var(--stone-600)" }}
                                >
                                  <TrendingUp className="h-2.5 w-2.5" />
                                  {count}x
                                </span>
                              )}
                              {recent.eaten && (
                                <span
                                  className="px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ fontSize: 10, background: "var(--terra-l)", color: "var(--terra-d)" }}
                                >
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {recent.daysAgo === 0 ? "Today" : `${recent.daysAgo}d ago`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3" style={{ color: "var(--stone-500)" }}>
                            <span className="flex items-center gap-1" style={{ fontSize: 11 }}>
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {recipe.prepTime + recipe.cookTime}m
                            </span>
                            <span className="flex items-center gap-1" style={{ fontSize: 11 }}>
                              <Users className="h-3 w-3" aria-hidden="true" />
                              {recipe.servings}
                            </span>
                            {recipe.nutrition && (
                              <span style={{ fontSize: 11 }}>{recipe.nutrition.calories} kcal</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    {/* Favourite button — overlaid top-right */}
                    {onToggleFavourite && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavourite(recipe.id) }}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: isFav ? "var(--terra-l)" : "rgba(253,250,246,0.85)",
                          border: `1px solid ${isFav ? "var(--terracotta)" : "var(--cream-300)"}`,
                        }}
                        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                      >
                        <Heart
                          className="h-3.5 w-3.5"
                          style={{
                            color: isFav ? "var(--terracotta)" : "var(--stone-400)",
                            fill: isFav ? "var(--terracotta)" : "none",
                          }}
                        />
                      </button>
                    )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmRecipe} onOpenChange={() => setConfirmRecipe(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" style={{ color: "var(--terracotta)" }} />
              Recently eaten
            </AlertDialogTitle>
            <AlertDialogDescription>
              You had <strong>{confirmRecipe?.recipe.name}</strong>{" "}
              {confirmRecipe?.recentInfo.daysAgo === 0
                ? "today"
                : `${confirmRecipe?.recentInfo.daysAgo} day${confirmRecipe?.recentInfo.daysAgo === 1 ? "" : "s"} ago`}.
              Adding variety helps with nutrition and keeps meals interesting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Choose different</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSelect}>Add anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
