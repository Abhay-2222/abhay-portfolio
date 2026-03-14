"use client"

import { Drawer } from "vaul"
import type { Recipe } from "@/lib/types"
import { Clock, Users, X, Heart } from "lucide-react"
import Image from "next/image"

interface RecipeDetailSheetProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  isFavourite?: boolean
  onToggleFavourite?: (id: string) => void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: "var(--wheat-l)",  text: "var(--wheat-d)" },
  lunch:     { bg: "var(--sky-l)",    text: "var(--sky)" },
  dinner:    { bg: "var(--plum-l)",   text: "var(--plum)" },
  snack:     { bg: "var(--sage-l)",   text: "var(--sage-d)" },
}

export function RecipeDetailSheet({
  recipe, isOpen, onClose, isFavourite = false, onToggleFavourite,
}: RecipeDetailSheetProps) {
  if (!recipe) return null

  const catColor = CATEGORY_COLORS[recipe.category] ?? { bg: "var(--cream-100)", text: "var(--stone-600)" }
  const perServing = recipe.servings > 0 ? recipe.servings : 1

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-40"
          style={{ background: "rgba(44,37,30,0.45)", backdropFilter: "blur(2px)" }}
        />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl outline-none"
          style={{ maxHeight: "92dvh", background: "var(--cream-50)" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--cream-300)" }} />
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Hero image */}
            <div className="relative w-full flex-shrink-0" style={{ height: 220 }}>
              <Image
                src={recipe.image || "/placeholder.jpg"}
                alt={recipe.name}
                fill
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(30,25,20,0.65) 0%, transparent 55%)" }}
              />

              {/* Controls overlaid on image */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span
                  className="px-2.5 py-1 rounded-lg font-mono uppercase"
                  style={{ fontSize: 9, letterSpacing: "0.12em", background: catColor.bg, color: catColor.text }}
                >
                  {recipe.category}
                </span>
                <div className="flex gap-2">
                  {onToggleFavourite && (
                    <button
                      onClick={() => onToggleFavourite(recipe.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: "rgba(44,37,30,0.5)",
                        backdropFilter: "blur(6px)",
                      }}
                      aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                    >
                      <Heart
                        className="h-4 w-4"
                        style={{ color: isFavourite ? "var(--terracotta)" : "rgba(253,250,246,0.85)", fill: isFavourite ? "var(--terracotta)" : "none" }}
                      />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(44,37,30,0.5)", backdropFilter: "blur(6px)" }}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Name + meta pinned to bottom */}
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="font-serif italic text-white" style={{ fontSize: 22, lineHeight: 1.25 }}>
                  {recipe.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-white/80" style={{ fontSize: 12 }}>
                    <Clock className="h-3.5 w-3.5" />
                    {recipe.prepTime + recipe.cookTime} min
                  </span>
                  <span className="flex items-center gap-1 text-white/80" style={{ fontSize: 12 }}>
                    <Users className="h-3.5 w-3.5" />
                    {recipe.servings} servings
                  </span>
                  {recipe.cost != null && (
                    <span className="font-mono text-white/80" style={{ fontSize: 12 }}>
                      ${recipe.cost.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-5 space-y-6">
              {/* Nutrition per serving */}
              {recipe.nutrition && (
                <div>
                  <p className="overline mb-2.5">Nutrition per serving</p>
                  <div
                    className="flex rounded-2xl overflow-hidden"
                    style={{ border: "1.5px solid var(--cream-200)", background: "var(--card)" }}
                  >
                    {[
                      { label: "Calories", value: Math.round(recipe.nutrition.calories / perServing).toLocaleString(), unit: "kcal" },
                      { label: "Protein",  value: Math.round(recipe.nutrition.protein  / perServing).toString(),      unit: "g" },
                      { label: "Carbs",    value: Math.round(recipe.nutrition.carbs    / perServing).toString(),      unit: "g" },
                      { label: "Fat",      value: Math.round(recipe.nutrition.fat      / perServing).toString(),      unit: "g" },
                    ].map((item, i, arr) => (
                      <div
                        key={item.label}
                        className="flex-1 py-3.5 flex flex-col items-center gap-0.5"
                        style={{ borderRight: i < arr.length - 1 ? "1px solid var(--cream-200)" : undefined }}
                      >
                        <span className="font-mono" style={{ fontSize: 18, color: "var(--foreground)", lineHeight: 1 }}>
                          {item.value}
                        </span>
                        <span className="font-mono" style={{ fontSize: 9, color: "var(--stone-500)", marginTop: 1 }}>
                          {item.unit}
                        </span>
                        <span className="overline" style={{ marginTop: 2 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <p className="overline mb-2.5">{recipe.ingredients.length} ingredients</p>
                <div className="space-y-1.5">
                  {recipe.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between rounded-xl px-3"
                      style={{ height: 44, background: "var(--card)", border: "1px solid var(--cream-200)" }}
                    >
                      <span style={{ fontSize: 13, color: "var(--foreground)" }}>{ing.name}</span>
                      <span className="font-mono" style={{ fontSize: 12, color: "var(--stone-500)" }}>
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {recipe.instructions && recipe.instructions.length > 0 && (
                <div>
                  <p className="overline mb-2.5">Instructions</p>
                  <ol className="space-y-3">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="font-mono flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center"
                          style={{ fontSize: 10, background: "var(--sage-l)", color: "var(--sage-d)" }}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--stone-700)", lineHeight: 1.65 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div style={{ height: 24 }} />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
