"use client"

import type React from "react"

import { useState } from "react"
import type { Recipe } from "@/lib/types"
import { RecipeCard } from "./recipe-card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface RecipeLibraryProps {
  recipes: Recipe[]
  onDragStart: (e: React.DragEvent, recipe: Recipe) => void
}

export function RecipeLibrary({ recipes, onDragStart }: RecipeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || recipe.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
            <TabsTrigger value="snack">Snack</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value={activeCategory} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDragStart={onDragStart} draggable />
            ))}
          </div>
          {filteredRecipes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No recipes found. Try a different search or category.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
