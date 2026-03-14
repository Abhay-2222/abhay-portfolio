"use client"

import type React from "react"

import type { Recipe } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import Image from "next/image"

interface RecipeCardProps {
  recipe: Recipe
  onDragStart?: (e: React.DragEvent, recipe: Recipe) => void
  draggable?: boolean
}

export function RecipeCard({ recipe, onDragStart, draggable = false }: RecipeCardProps) {
  return (
    <Card
      className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, recipe)}
    >
      <CardHeader className="p-0">
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={recipe.image || "/placeholder.svg?height=200&width=300"}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 text-balance">{recipe.name}</CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        <Badge variant="secondary" className="capitalize">
          {recipe.category}
        </Badge>
      </CardContent>
    </Card>
  )
}
