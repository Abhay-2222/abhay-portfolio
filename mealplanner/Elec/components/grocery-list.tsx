"use client"

import { useMemo, useState, useEffect } from "react"
import type { MealPlan, Ingredient, PantryItem } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Download, Share2, MessageCircle, Mail, ExternalLink, Loader2, Store } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { calculateIngredientCost } from "@/lib/ingredient-prices"

interface Retailer { id: string; name: string; logo: string | null }

interface GroceryListProps {
  mealPlan: MealPlan
  pantryItems?: PantryItem[]
  weeklyBudget?: number
}

interface ConsolidatedIngredient extends Ingredient {
  checked: boolean
  estimatedCost: number
  fromPantry?: boolean
}

const CATEGORY_ORDER = ["produce", "meat", "dairy", "pantry", "frozen", "other"]

const CATEGORY_ICONS: Record<string, string> = {
  produce: "🥦",
  meat:    "🥩",
  dairy:   "🧀",
  pantry:  "🫙",
  frozen:  "🧊",
  other:   "📦",
}

export function GroceryList({ mealPlan, pantryItems = [], weeklyBudget = 0 }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useLocalStorage<string[]>("grocery-checked-items", [])
  const checkedSet = useMemo(() => new Set(checkedItems), [checkedItems])
  const [instacartLoading, setInstacartLoading] = useState(false)
  const [instacartError, setInstacartError] = useState<string | null>(null)
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<string>("")
  const [postalCode, setPostalCode] = useLocalStorage("postal-code", "")
  const [editingPostal, setEditingPostal] = useState(false)
  const [postalDraft, setPostalDraft] = useState("")

  // Load nearby retailers when postal code is available
  useEffect(() => {
    if (!postalCode) return
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isCanada = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Regina|Halifax|St_Johns|Whitehorse|Yellowknife|Iqaluit|Moncton|Glace_Bay|Goose_Bay|Blanc-Sablon|Creston|Dawson|Dawson_Creek|Fort_Nelson|Cambridge_Bay|Rankin_Inlet|Resolute|Pangnirtung)$/i.test(tz)
    const countryCode = isCanada ? "CA" : "US"
    fetch(`/api/instacart/retailers?postal_code=${encodeURIComponent(postalCode)}&country_code=${countryCode}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.retailers?.length) {
          setRetailers(d.retailers)
          if (!selectedRetailer) setSelectedRetailer(d.retailers[0].id)
        }
      })
      .catch(() => {})
  }, [postalCode])

  const groceryList = useMemo(() => {
    const ingredientMap = new Map<string, ConsolidatedIngredient>()

    Object.values(mealPlan).forEach((dayMeals) => {
      Object.values(dayMeals).forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`
          const pantryItem = pantryItems.find(
            (p) => p.name.toLowerCase() === ingredient.name.toLowerCase() && p.unit === ingredient.unit,
          )
          const neededAmount = pantryItem ? Math.max(0, ingredient.amount - pantryItem.amount) : ingredient.amount

          if (neededAmount > 0) {
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!
              existing.amount += neededAmount
              existing.estimatedCost = calculateIngredientCost(existing.name, existing.amount, existing.unit)
            } else {
              ingredientMap.set(key, {
                ...ingredient,
                amount: neededAmount,
                checked: checkedSet.has(ingredient.id),
                estimatedCost: calculateIngredientCost(ingredient.name, neededAmount, ingredient.unit),
              })
            }
          }
        })
      })
    })

    const grouped: Record<string, ConsolidatedIngredient[]> = {}
    ingredientMap.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })

    return CATEGORY_ORDER
      .filter((cat) => grouped[cat])
      .map((cat) => ({
        category: cat,
        items: grouped[cat].sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [mealPlan, pantryItems, checkedSet])

  const allItems = groceryList.flatMap((g) => g.items)
  const totalItems = allItems.length
  const checkedCount = allItems.filter((i) => checkedSet.has(i.id)).length
  const completionPct = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0
  const totalEstimatedCost = allItems.reduce((sum, i) => sum + i.estimatedCost, 0)

  const toggleItem = (id: string) => {
    const next = checkedSet.has(id)
      ? checkedItems.filter((x) => x !== id)
      : [...checkedItems, id]
    setCheckedItems(next)
  }

  const generateText = () =>
    groceryList.map((g) => {
      const lines = g.items.map((i) => `  ${checkedSet.has(i.id) ? "✓" : "○"} ${i.amount} ${i.unit} ${i.name}`).join("\n")
      return `${g.category.toUpperCase()}\n${lines}`
    }).join("\n\n")

  const handleExport = () => {
    const blob = new Blob([generateText()], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "grocery-list.txt"; a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = (method: "whatsapp" | "sms" | "email") => {
    const encoded = encodeURIComponent(generateText())
    const urls = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      sms: `sms:?body=${encoded}`,
      email: `mailto:?subject=Grocery List&body=${encoded}`,
    }
    window.open(urls[method], "_blank")
  }

  const handleInstacart = async () => {
    setInstacartLoading(true)
    setInstacartError(null)

    // Open the window synchronously (tied to the click event) so mobile browsers
    // don't block it as a popup. We'll set its location once the URL is ready.
    const newTab = window.open("", "_blank")

    try {
      const items = groceryList.flatMap((g) =>
        g.items.filter((i) => !checkedSet.has(i.id)).map((i) => ({ name: i.name, amount: i.amount, unit: i.unit }))
      )
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await fetch("/api/instacart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, timezone, retailerId: selectedRetailer || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create list")
      if (data.url) {
        if (newTab) {
          newTab.location.href = data.url
        } else {
          // Fallback if the tab was blocked anyway
          window.location.href = data.url
        }
      }
    } catch (err) {
      if (newTab) newTab.close()
      setInstacartError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setInstacartLoading(false)
    }
  }

  if (totalItems === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <ShoppingCart className="h-12 w-12 mx-auto" style={{ color: "var(--cream-300)" }} />
        <p style={{ fontSize: 15, color: "var(--stone-600)" }}>Your grocery list is empty</p>
        <p style={{ fontSize: 12, color: "var(--stone-400)" }}>Add meals to your plan and ingredients will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif italic text-foreground" style={{ fontSize: 24 }}>Grocery List</h2>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "var(--cream-100)", color: "var(--stone-600)" }}
                aria-label="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("sms")}>
                <MessageCircle className="h-4 w-4 mr-2" />SMS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("email")}>
                <Mail className="h-4 w-4 mr-2" />Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={handleExport}
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "var(--cream-100)", color: "var(--stone-600)" }}
            aria-label="Export"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 12, color: "var(--stone-700)" }}>Estimated total</span>
          <span className="font-mono" style={{ fontSize: 14, color: "var(--foreground)" }}>
            ${totalEstimatedCost.toFixed(2)}
            {weeklyBudget > 0 && (
              <span style={{ fontSize: 12, color: "var(--stone-400)" }}> / ${weeklyBudget.toFixed(0)}</span>
            )}
          </span>
        </div>
        {weeklyBudget > 0 && (() => {
          const budgetPct = Math.min((totalEstimatedCost / weeklyBudget) * 100, 100)
          const over = totalEstimatedCost > weeklyBudget
          return (
            <div className="mb-3">
              <div className="w-full rounded-full overflow-hidden mb-1.5" style={{ height: 4, background: "var(--cream-200)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${budgetPct}%`, background: over ? "var(--terracotta)" : "var(--sage)" }}
                  role="progressbar"
                  aria-valuenow={Math.round(budgetPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="font-mono" style={{ fontSize: 10, color: over ? "var(--terra-d)" : "var(--stone-500)" }}>
                {over
                  ? `$${(totalEstimatedCost - weeklyBudget).toFixed(2)} over budget`
                  : `$${(weeklyBudget - totalEstimatedCost).toFixed(2)} remaining`}
              </p>
            </div>
          )
        })()}
        <div
          className="w-full rounded-full overflow-hidden mb-2"
          style={{ height: 5, background: "var(--cream-200)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionPct}%`,
              background: completionPct === 100 ? "var(--sage)" : "var(--sage)",
            }}
            role="progressbar"
            aria-valuenow={Math.round(completionPct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 11, color: "var(--stone-500)" }}>
            {checkedCount} of {totalItems} items
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--stone-500)" }}>
            {Math.round(completionPct)}%
          </span>
        </div>
      </div>

      {/* Store picker — postal code + retailer select */}
      <div className="space-y-2">
        {/* Postal code row */}
        <div className="flex items-center gap-2">
          {editingPostal ? (
            <form
              className="flex-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (postalDraft.trim()) {
                  setPostalCode(postalDraft.trim().toUpperCase())
                }
                setEditingPostal(false)
              }}
            >
              <input
                autoFocus
                value={postalDraft}
                onChange={(e) => setPostalDraft(e.target.value)}
                placeholder="Postal / ZIP code"
                className="flex-1 rounded-xl transition-colors"
                style={{
                  height: 36, fontSize: 13, padding: "0 12px",
                  background: "var(--card)", border: "1.5px solid var(--sage)",
                  color: "var(--foreground)", outline: "none",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <button type="submit"
                className="rounded-xl px-3"
                style={{ height: 36, fontSize: 12, background: "var(--sage-d)", color: "#fff", border: "none" }}
              >Save</button>
              <button type="button" onClick={() => setEditingPostal(false)}
                style={{ fontSize: 12, color: "var(--stone-500)", padding: "0 4px" }}
              >✕</button>
            </form>
          ) : (
            <button
              onClick={() => { setPostalDraft(postalCode); setEditingPostal(true) }}
              className="flex items-center gap-2 rounded-xl px-3 transition-all"
              style={{
                height: 36, fontSize: 12,
                background: "var(--cream-100)", color: "var(--stone-600)",
                border: "1px solid var(--cream-300)",
              }}
            >
              <Store className="h-3.5 w-3.5" />
              {postalCode ? postalCode : "Set postal code for nearby stores"}
            </button>
          )}
        </div>

        {/* Retailer selector */}
        {retailers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {retailers.slice(0, 6).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRetailer(r.id)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all"
                style={{
                  fontSize: 12,
                  border: `1.5px solid ${selectedRetailer === r.id ? "var(--sage)" : "var(--cream-300)"}`,
                  background: selectedRetailer === r.id ? "var(--sage-l)" : "var(--card)",
                  color: selectedRetailer === r.id ? "var(--sage-d)" : "var(--foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                {r.logo && (
                  <img src={r.logo} alt="" className="h-4 w-4 object-contain rounded" aria-hidden="true" />
                )}
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instacart */}
      <button
        onClick={handleInstacart}
        disabled={instacartLoading}
        className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 transition-all"
        style={{
          background: "#009E59",
          color: "#fff",
          fontSize: 13,
          border: "none",
          opacity: instacartLoading ? 0.7 : 1,
        }}
        aria-label="Order on Instacart"
      >
        {instacartLoading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <ShoppingCart className="h-4 w-4" />}
        {instacartLoading ? "Creating list…" : "Order on Instacart"}
        {!instacartLoading && <ExternalLink className="h-3 w-3 opacity-70" />}
      </button>
      {instacartError && (
        <p className="text-center" style={{ fontSize: 11, color: "var(--terra-d)" }} role="alert">
          {instacartError}
        </p>
      )}

      {/* Items by category */}
      <div className="space-y-6" role="region" aria-label="Grocery items">
        {groceryList.map((group) => (
          <div key={group.category}>
            {/* Category header */}
            <div
              className="flex items-center gap-2 mb-2 pb-2"
              style={{ borderBottom: "1px solid var(--cream-200)" }}
            >
              <span style={{ fontSize: 16 }} aria-hidden="true">{CATEGORY_ICONS[group.category]}</span>
              <span
                className="font-mono uppercase"
                style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--stone-500)" }}
              >
                {group.category}
              </span>
              <span className="font-mono ml-auto" style={{ fontSize: 9, color: "var(--stone-400)" }}>
                {group.items.filter((i) => checkedSet.has(i.id)).length}/{group.items.length}
              </span>
            </div>

            <div className="space-y-1" role="group" aria-label={`${group.category} items`}>
              {group.items.map((item) => {
                const isChecked = checkedSet.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl px-3 transition-all"
                    style={{
                      height: 48,
                      background: isChecked ? "var(--cream-50)" : "var(--card)",
                      border: `1px solid ${isChecked ? "var(--cream-200)" : "var(--cream-300)"}`,
                      opacity: isChecked ? 0.55 : 1,
                    }}
                  >
                    <div
                      className="h-5 w-5 rounded flex-shrink-0 border flex items-center justify-center cursor-pointer transition-all"
                      style={{
                        background: isChecked ? "var(--sage)" : "transparent",
                        borderColor: isChecked ? "var(--sage)" : "var(--cream-400)",
                        borderWidth: "1.5px",
                      }}
                      onClick={() => toggleItem(item.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      aria-label={`${isChecked ? "Uncheck" : "Check"} ${item.name}`}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleItem(item.id) }}
                    >
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    <span
                      className="flex-1"
                      style={{
                        fontSize: 13,
                        color: isChecked ? "var(--stone-500)" : "var(--foreground)",
                        textDecoration: isChecked ? "line-through" : "none",
                      }}
                    >
                      {item.name}
                    </span>

                    <span className="font-mono flex-shrink-0" style={{ fontSize: 12, color: "var(--stone-500)" }}>
                      {item.amount} {item.unit}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
