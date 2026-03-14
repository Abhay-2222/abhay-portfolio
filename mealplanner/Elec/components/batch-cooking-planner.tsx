"use client"

import { useMemo } from "react"
import type { Recipe, MealPlan } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Clock, Flame } from "lucide-react"

interface BatchCookingPlannerProps {
  mealPlan: MealPlan
}

export function BatchCookingPlanner({ mealPlan }: BatchCookingPlannerProps) {
  const batchRecipes = useMemo(() => {
    const recipes: Recipe[] = []
    const recipeIds = new Set<string>()

    Object.values(mealPlan).forEach((dayMeals) => {
      Object.values(dayMeals).forEach((recipe) => {
        if (!recipeIds.has(recipe.id)) {
          recipeIds.add(recipe.id)
          recipes.push(recipe)
        }
      })
    })

    return recipes
      .filter((r) => r.prepTime + r.cookTime >= 30)
      .sort((a, b) => b.prepTime + b.cookTime - (a.prepTime + a.cookTime))
  }, [mealPlan])

  const totalPrepTime = batchRecipes.reduce((sum, r) => sum + r.prepTime + r.cookTime, 0)

  if (batchRecipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="text-sm">Add meals to your plan to see batch cooking suggestions</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChefHat className="h-5 w-5" aria-hidden="true" />
          Batch Cooking Planner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {batchRecipes.length} recipes • ~{Math.round(totalPrepTime / 60)}h {totalPrepTime % 60}m total prep time
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {batchRecipes.map((recipe) => (
          <div key={recipe.id} className="p-3 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
              {recipe.image && (
                <img
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{recipe.name}</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {recipe.prepTime + recipe.cookTime}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3" aria-hidden="true" />
                    {recipe.nutrition?.calories || 0} cal
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {recipe.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Makes {recipe.servings} servings • Store for 3-4 days
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
