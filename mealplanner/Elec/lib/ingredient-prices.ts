// Database of ingredient prices per unit
export const ingredientPrices: Record<string, { pricePerUnit: number; unit: string }> = {
  // Pantry
  bread: { pricePerUnit: 0.3, unit: "slice" },
  spaghetti: { pricePerUnit: 2.5, unit: "lb" },
  rice: { pricePerUnit: 1.5, unit: "cup" },
  "olive oil": { pricePerUnit: 0.5, unit: "tbsp" },
  "tomato sauce": { pricePerUnit: 0.12, unit: "oz" },
  "soy sauce": { pricePerUnit: 0.2, unit: "tbsp" },
  granola: { pricePerUnit: 0.4, unit: "cup" },
  honey: { pricePerUnit: 0.3, unit: "tbsp" },
  mayonnaise: { pricePerUnit: 0.15, unit: "tbsp" },
  salt: { pricePerUnit: 0.01, unit: "pinch" },
  pepper: { pricePerUnit: 0.01, unit: "pinch" },
  flour: { pricePerUnit: 0.1, unit: "cup" },
  cinnamon: { pricePerUnit: 0.05, unit: "tsp" },
  "taco shells": { pricePerUnit: 0.3, unit: "whole" },
  pesto: { pricePerUnit: 0.8, unit: "cup" },
  "nutritional yeast": { pricePerUnit: 0.3, unit: "tbsp" },
  "curry powder": { pricePerUnit: 0.2, unit: "tbsp" },
  tahini: { pricePerUnit: 0.4, unit: "cup" },
  "coconut flakes": { pricePerUnit: 0.3, unit: "cup" },
  "maple syrup": { pricePerUnit: 0.4, unit: "tbsp" },
  hummus: { pricePerUnit: 0.3, unit: "cup" },
  "almond flour": { pricePerUnit: 0.5, unit: "cup" },
  "chia seeds": { pricePerUnit: 0.3, unit: "tbsp" },
  "protein powder": { pricePerUnit: 1.5, unit: "scoop" },
  "mct oil": { pricePerUnit: 0.5, unit: "tbsp" },
  coffee: { pricePerUnit: 0.3, unit: "cup" },
  stevia: { pricePerUnit: 0.05, unit: "tsp" },
  "vanilla extract": { pricePerUnit: 0.2, unit: "tsp" },
  "black beans": { pricePerUnit: 1.2, unit: "cup" },
  chickpeas: { pricePerUnit: 1.5, unit: "can" },
  quinoa: { pricePerUnit: 2.0, unit: "cup" },
  lentils: { pricePerUnit: 1.5, unit: "cup" },
  "vegetable broth": { pricePerUnit: 0.15, unit: "cup" },
  "beef broth": { pricePerUnit: 0.2, unit: "cup" },
  oats: { pricePerUnit: 0.2, unit: "cup" },
  "whole wheat flour": { pricePerUnit: 0.12, unit: "cup" },
  "penne pasta": { pricePerUnit: 2.0, unit: "lb" },
  "lasagna noodles": { pricePerUnit: 3.0, unit: "lb" },
  "arborio rice": { pricePerUnit: 2.5, unit: "cup" },
  "egg noodles": { pricePerUnit: 2.5, unit: "oz" },
  tortilla: { pricePerUnit: 0.4, unit: "whole" },
  "burger buns": { pricePerUnit: 0.5, unit: "whole" },
  "pita bread": { pricePerUnit: 0.6, unit: "whole" },
  "ciabatta bread": { pricePerUnit: 3.0, unit: "loaf" },
  bagel: { pricePerUnit: 0.8, unit: "whole" },
  "english muffin": { pricePerUnit: 0.5, unit: "whole" },
  breadcrumbs: { pricePerUnit: 0.1, unit: "cup" },
  croutons: { pricePerUnit: 0.3, unit: "cup" },
  "canned tuna": { pricePerUnit: 1.5, unit: "can" },
  "coconut aminos": { pricePerUnit: 0.3, unit: "tbsp" },
  "paleo mayo": { pricePerUnit: 0.2, unit: "cup" },
  saffron: { pricePerUnit: 2.0, unit: "pinch" },
  "hollandaise sauce": { pricePerUnit: 1.0, unit: "cup" },
  capers: { pricePerUnit: 0.2, unit: "tbsp" },
  "kidney beans": { pricePerUnit: 1.2, unit: "can" },
  "acai puree": { pricePerUnit: 2.5, unit: "pack" },

  // Produce
  avocado: { pricePerUnit: 1.5, unit: "whole" },
  "mixed greens": { pricePerUnit: 0.3, unit: "cup" },
  "cherry tomatoes": { pricePerUnit: 0.15, unit: "cup" },
  cucumber: { pricePerUnit: 0.8, unit: "whole" },
  lemon: { pricePerUnit: 0.5, unit: "whole" },
  onion: { pricePerUnit: 0.6, unit: "whole" },
  garlic: { pricePerUnit: 0.1, unit: "clove" },
  berries: { pricePerUnit: 0.4, unit: "cup" },
  broccoli: { pricePerUnit: 0.5, unit: "cup" },
  "bell peppers": { pricePerUnit: 1.2, unit: "whole" },
  carrots: { pricePerUnit: 0.3, unit: "whole" },
  ginger: { pricePerUnit: 0.2, unit: "tbsp" },
  lettuce: { pricePerUnit: 0.2, unit: "leaf" },
  tomato: { pricePerUnit: 0.8, unit: "whole" },
  spinach: { pricePerUnit: 0.3, unit: "cup" },
  mushrooms: { pricePerUnit: 0.4, unit: "cup" },
  zucchini: { pricePerUnit: 0.8, unit: "whole" },
  asparagus: { pricePerUnit: 3.0, unit: "lb" },
  cauliflower: { pricePerUnit: 2.5, unit: "head" },
  "green beans": { pricePerUnit: 2.5, unit: "lb" },
  "romaine lettuce": { pricePerUnit: 0.2, unit: "leaf" },
  "sweet potato": { pricePerUnit: 1.5, unit: "lb" },
  potatoes: { pricePerUnit: 1.0, unit: "lb" },
  celery: { pricePerUnit: 0.3, unit: "stalk" },
  cabbage: { pricePerUnit: 1.5, unit: "head" },
  kale: { pricePerUnit: 0.4, unit: "cup" },
  banana: { pricePerUnit: 0.3, unit: "whole" },
  blueberries: { pricePerUnit: 0.5, unit: "cup" },
  basil: { pricePerUnit: 0.1, unit: "leaf" },
  rosemary: { pricePerUnit: 0.2, unit: "sprig" },
  "portobello mushrooms": { pricePerUnit: 1.5, unit: "whole" },
  eggplant: { pricePerUnit: 1.2, unit: "whole" },
  almonds: { pricePerUnit: 0.5, unit: "cup" },

  // Meat & Seafood
  "chicken breast": { pricePerUnit: 3.5, unit: "lb" },
  "ground beef": { pricePerUnit: 4.0, unit: "lb" },
  "turkey slices": { pricePerUnit: 0.3, unit: "slice" },
  bacon: { pricePerUnit: 0.4, unit: "slice" },
  "whole chicken": { pricePerUnit: 8.0, unit: "whole" },
  steak: { pricePerUnit: 8.0, unit: "lb" },
  "ribeye steak": { pricePerUnit: 12.0, unit: "lb" },
  "pork chops": { pricePerUnit: 4.0, unit: "piece" },
  "pork belly": { pricePerUnit: 5.0, unit: "lb" },
  "lamb chops": { pricePerUnit: 8.0, unit: "piece" },
  "chuck roast": { pricePerUnit: 5.0, unit: "lb" },
  "salmon fillet": { pricePerUnit: 10.0, unit: "lb" },
  "cod fillet": { pricePerUnit: 7.0, unit: "lb" },
  "white fish": { pricePerUnit: 6.0, unit: "lb" },
  "swordfish steak": { pricePerUnit: 12.0, unit: "lb" },
  "halibut fillet": { pricePerUnit: 15.0, unit: "lb" },
  shrimp: { pricePerUnit: 8.0, unit: "lb" },
  mussels: { pricePerUnit: 5.0, unit: "lb" },
  "crab meat": { pricePerUnit: 12.0, unit: "lb" },
  "lobster tail": { pricePerUnit: 15.0, unit: "piece" },
  "smoked salmon": { pricePerUnit: 2.0, unit: "oz" },
  "sushi grade tuna": { pricePerUnit: 15.0, unit: "lb" },

  // Dairy & Alternatives
  eggs: { pricePerUnit: 0.4, unit: "whole" },
  "parmesan cheese": { pricePerUnit: 0.25, unit: "cup" },
  "greek yogurt": { pricePerUnit: 1.2, unit: "cup" },
  cheese: { pricePerUnit: 0.4, unit: "slice" },
  butter: { pricePerUnit: 0.2, unit: "tbsp" },
  milk: { pricePerUnit: 0.3, unit: "cup" },
  "heavy cream": { pricePerUnit: 0.5, unit: "cup" },
  "feta cheese": { pricePerUnit: 0.5, unit: "cup" },
  mozzarella: { pricePerUnit: 0.3, unit: "slice" },
  "cottage cheese": { pricePerUnit: 1.5, unit: "cup" },
  "ricotta cheese": { pricePerUnit: 1.5, unit: "cup" },
  "cream cheese": { pricePerUnit: 0.3, unit: "tbsp" },
  "almond milk": { pricePerUnit: 0.3, unit: "cup" },
  "coconut milk": { pricePerUnit: 1.5, unit: "can" },
  "vegan sour cream": { pricePerUnit: 2.0, unit: "cup" },

  // Other
  tofu: { pricePerUnit: 2.5, unit: "oz" },
  edamame: { pricePerUnit: 2.0, unit: "cup" },
}

// Calculate cost for a single ingredient
export function calculateIngredientCost(ingredientName: string, amount: number, unit: string): number {
  const key = ingredientName.toLowerCase()
  const priceData = ingredientPrices[key]

  if (!priceData) {
    // Default fallback price if ingredient not in database
    return 0.5 * amount
  }

  // If units match, simple calculation
  if (priceData.unit === unit) {
    return priceData.pricePerUnit * amount
  }

  // Unit conversion logic (simplified)
  // In a real app, you'd have more sophisticated unit conversion
  return priceData.pricePerUnit * amount
}

// Calculate total cost for a recipe based on its ingredients
export function calculateRecipeCost(ingredients: Array<{ name: string; amount: number; unit: string }>): number {
  return ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(ingredient.name, ingredient.amount, ingredient.unit)
  }, 0)
}
