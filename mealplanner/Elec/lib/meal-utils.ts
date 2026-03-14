import type { Recipe, MealPlan, WeeklyMealPlans, PantryItem } from "./types"
import { calculateIngredientCost } from "./ingredient-prices"

export function getRecentlyEatenRecipes(allMealPlans: WeeklyMealPlans, daysBack = 3): Set<string> {
  const recentRecipeIds = new Set<string>()
  const today = new Date()
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

  // Check all weeks in meal plans
  Object.entries(allMealPlans).forEach(([weekKey, mealPlan]) => {
    Object.entries(mealPlan).forEach(([dayKey, meals]) => {
      // Parse the day key to get the actual date
      const [year, month, day] = dayKey.split("-").map(Number)
      const mealDate = new Date(year, month - 1, day)

      // Only include meals from the last N days
      if (mealDate >= cutoffDate && mealDate <= today) {
        Object.values(meals).forEach((recipe) => {
          recentRecipeIds.add(recipe.id)
        })
      }
    })
  })

  return recentRecipeIds
}

export function getSuggestedRecipes(
  allRecipes: Recipe[],
  allMealPlans: WeeklyMealPlans,
  mealType?: string,
  maxCost?: number,
): Recipe[] {
  const recentlyEaten = getRecentlyEatenRecipes(allMealPlans, 3)

  return allRecipes
    .filter((recipe) => {
      // Filter out recently eaten
      if (recentlyEaten.has(recipe.id)) return false

      // Filter by meal type if specified
      if (mealType && recipe.category !== mealType) return false

      // Filter by budget if specified
      if (maxCost && recipe.cost && recipe.cost > maxCost) return false

      return true
    })
    .sort((a, b) => {
      // Sort by cost (cheapest first) if both have cost
      if (a.cost && b.cost) return a.cost - b.cost
      return 0
    })
}

export function calculateMealPlanCost(mealPlan: MealPlan): number {
  let total = 0
  Object.values(mealPlan).forEach((dayMeals) => {
    Object.values(dayMeals).forEach((recipe) => {
      if (recipe.cost) {
        total += recipe.cost
      }
    })
  })
  return total
}

export function wasRecentlyEaten(
  recipeId: string,
  allMealPlans: WeeklyMealPlans,
  daysBack = 3,
): { eaten: boolean; daysAgo?: number } {
  const today = new Date()
  let mostRecentDate: Date | null = null

  Object.entries(allMealPlans).forEach(([weekKey, mealPlan]) => {
    Object.entries(mealPlan).forEach(([dayKey, meals]) => {
      Object.values(meals).forEach((recipe) => {
        if (recipe.id === recipeId) {
          const [year, month, day] = dayKey.split("-").map(Number)
          const mealDate = new Date(year, month - 1, day)

          if (!mostRecentDate || mealDate > mostRecentDate) {
            mostRecentDate = mealDate
          }
        }
      })
    })
  })

  if (mostRecentDate) {
    const diffTime = today.getTime() - mostRecentDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= daysBack) {
      return { eaten: true, daysAgo: diffDays }
    }
  }

  return { eaten: false }
}

export function getMealEatenCount(recipeId: string, allMealPlans: WeeklyMealPlans): number {
  let count = 0

  Object.entries(allMealPlans).forEach(([weekKey, mealPlan]) => {
    Object.entries(mealPlan).forEach(([dayKey, meals]) => {
      Object.values(meals).forEach((recipe) => {
        if (recipe.id === recipeId) {
          count++
        }
      })
    })
  })

  return count
}

export function calculateGroceryListCost(mealPlan: MealPlan, pantryItems: PantryItem[]): number {
  const ingredientMap = new Map<string, { amount: number; name: string; unit: string }>()

  // Consolidate all ingredients from meal plan
  Object.values(mealPlan).forEach((dayMeals) => {
    Object.values(dayMeals).forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`

        // Check if we have this ingredient in pantry
        const pantryItem = pantryItems.find(
          (p) => p.name.toLowerCase() === ingredient.name.toLowerCase() && p.unit === ingredient.unit,
        )

        // Calculate needed amount after pantry deduction
        const neededAmount = pantryItem ? Math.max(0, ingredient.amount - pantryItem.amount) : ingredient.amount

        if (neededAmount > 0) {
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!
            existing.amount += neededAmount
          } else {
            ingredientMap.set(key, {
              amount: neededAmount,
              name: ingredient.name,
              unit: ingredient.unit,
            })
          }
        }
      })
    })
  })

  // Calculate total cost of needed ingredients
  let total = 0
  ingredientMap.forEach((ingredient) => {
    total += calculateIngredientCost(ingredient.name, ingredient.amount, ingredient.unit)
  })

  return total
}
