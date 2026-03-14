export interface Recipe {
  id: string
  name: string
  category: "breakfast" | "lunch" | "dinner" | "snack"
  diet: "classic" | "low-carb" | "keto" | "flexitarian" | "paleo" | "vegetarian" | "pescatarian" | "vegan"
  prepTime: number
  cookTime: number
  servings: number
  ingredients: Ingredient[]
  instructions: string[]
  image?: string
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  cost?: number
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other"
}

export interface MealPlan {
  [day: string]: {
    [mealType: string]: Recipe
  }
}

export interface GroceryItem {
  id: string
  name: string
  amount: number
  unit: string
  category: string
  checked: boolean
  estimatedCost?: number
}

export interface PantryItem {
  id: string
  name: string
  amount: number
  unit: string
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other"
  expirationDate?: string
  lowStockThreshold?: number
  addedDate: string
}

export interface NutritionStats {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface SpendingStats {
  weekKey: string
  weekStart: string
  totalSpent: number
  budget: number
}

export interface FoodWasteStats {
  expiredItems: number
  unusedIngredients: number
  totalWaste: number
}

export interface WeeklyMealPlans {
  [weekKey: string]: MealPlan
}

export interface WeeklyBudgets {
  [weekKey: string]: number
}

export interface WeekHistory {
  weekKey: string
  weekStart: Date
  weekEnd: Date
  mealPlan: MealPlan
  budget: number
  spent: number
  mealCount: number
}
