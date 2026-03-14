"use client"

import { useState } from "react"
import type { PantryItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash2, Search, Plus, AlertCircle, Package, ChevronsUpDown, Check } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ingredientPrices } from "@/lib/ingredient-prices"
import { cn } from "@/lib/utils"

interface PantryInventoryProps {
  onPantryChange?: (items: PantryItem[]) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  produce: "🥦", meat: "🥩", dairy: "🧀", pantry: "🫙", frozen: "🧊", other: "📦",
}

const isExpired = (date?: string) => date ? new Date(date) < new Date() : false
const isExpiringSoon = (date?: string) => {
  if (!date) return false
  const d = new Date(date)
  const soon = new Date(); soon.setDate(soon.getDate() + 7)
  return d >= new Date() && d <= soon
}
const isLowStock = (item: PantryItem) =>
  item.lowStockThreshold != null && item.amount <= item.lowStockThreshold

export function PantryInventory({ onPantryChange }: PantryInventoryProps) {
  const [pantryItems, setPantryItems] = useLocalStorage<PantryItem[]>("pantry-inventory", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [ingredientOpen, setIngredientOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "", amount: "", unit: "",
    category: "pantry" as const,
    expirationDate: "", lowStockThreshold: "",
  })

  const availableIngredients = Object.keys(ingredientPrices).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    unit: ingredientPrices[key].unit,
  }))

  const handleIngredientSelect = (key: string) => {
    const ing = availableIngredients.find((i) => i.value === key)
    if (ing) setNewItem({ ...newItem, name: ing.label, unit: ing.unit })
    setIngredientOpen(false)
  }

  const handleAddItem = () => {
    const name = newItem.name.trim()
    const unit = newItem.unit.trim()
    const amount = parseFloat(newItem.amount)
    if (!name || !unit || !amount || isNaN(amount)) return

    const item: PantryItem = {
      id: `pantry-${Date.now()}`,
      name, amount, unit,
      category: newItem.category,
      addedDate: new Date().toISOString(),
      ...(newItem.expirationDate && { expirationDate: newItem.expirationDate }),
      ...(newItem.lowStockThreshold && { lowStockThreshold: parseFloat(newItem.lowStockThreshold) }),
    }
    const updated = [...pantryItems, item]
    setPantryItems(updated)
    onPantryChange?.(updated)
    setNewItem({ name: "", amount: "", unit: "", category: "pantry", expirationDate: "", lowStockThreshold: "" })
    setDialogOpen(false)
  }

  const handleRemove = (id: string) => {
    const updated = pantryItems.filter((i) => i.id !== id)
    setPantryItems(updated)
    onPantryChange?.(updated)
  }

  const filtered = pantryItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, PantryItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const alerts = pantryItems.filter((i) => isExpired(i.expirationDate) || isExpiringSoon(i.expirationDate) || isLowStock(i))

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif italic text-foreground" style={{ fontSize: 24 }}>Pantry</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl transition-all"
          style={{
            fontSize: 13,
            background: "var(--sage-d)",
            color: "#fff",
            border: "none",
          }}
          aria-label="Add pantry item"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: "var(--terra-l)", border: "1.5px solid rgba(193,127,90,0.3)" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--terra-d)" }} />
          <div>
            <p style={{ fontSize: 13, color: "var(--terra-d)" }}>
              {alerts.length} item{alerts.length > 1 ? "s" : ""} need attention
            </p>
            <p style={{ fontSize: 11, color: "var(--terracotta)", marginTop: 2 }}>
              {alerts.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {pantryItems.length === 0 ? (
        /* Empty state */
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--cream-100)" }}
          >
            <Package className="h-8 w-8" style={{ color: "var(--cream-400)" }} />
          </div>
          <div>
            <p style={{ fontSize: 15, color: "var(--stone-700)" }}>No items in your pantry</p>
            <p style={{ fontSize: 12, color: "var(--stone-400)", marginTop: 4, lineHeight: 1.6 }}>
              Track what you have at home and we'll<br />automatically remove it from your grocery list.
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="px-5 h-10 rounded-xl transition-all"
            style={{
              fontSize: 13,
              background: "var(--sage-l)",
              color: "var(--sage-d)",
              border: "1.5px solid var(--sage)",
            }}
          >
            Add your first item
          </button>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
              style={{ color: "var(--stone-400)" }} aria-hidden="true" />
            <Input
              placeholder="Search pantry items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl"
              style={{ fontSize: 13 }}
              aria-label="Search pantry"
            />
          </div>

          {/* Groups */}
          <div className="space-y-5">
            {filtered.length === 0 ? (
              <p className="text-center py-8" style={{ fontSize: 13, color: "var(--stone-500)" }}>
                No items match your search
              </p>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div
                    className="flex items-center gap-2 mb-2 pb-2"
                    style={{ borderBottom: "1px solid var(--cream-200)" }}
                  >
                    <span style={{ fontSize: 16 }} aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                    <span
                      className="font-mono uppercase"
                      style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--stone-500)" }}
                    >
                      {category}
                    </span>
                    <span className="font-mono ml-auto" style={{ fontSize: 9, color: "var(--stone-400)" }}>
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const expired = isExpired(item.expirationDate)
                      const expiringSoon = isExpiringSoon(item.expirationDate)
                      const lowStock = isLowStock(item)
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl px-3 transition-all"
                          style={{
                            height: 52,
                            background: expired ? "var(--terra-l)" : expiringSoon ? "var(--wheat-l)" : "var(--card)",
                            border: `1px solid ${expired ? "rgba(193,127,90,0.3)" : expiringSoon ? "rgba(212,168,75,0.3)" : "var(--cream-300)"}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: 13, color: "var(--foreground)" }}>{item.name}</span>
                              {expired && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md"
                                  style={{ fontSize: 9, background: "var(--terracotta)", color: "#fff" }}
                                >
                                  Expired
                                </span>
                              )}
                              {!expired && expiringSoon && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md"
                                  style={{ fontSize: 9, background: "var(--wheat-l)", color: "var(--wheat-d)", border: "1px solid var(--wheat)" }}
                                >
                                  Soon
                                </span>
                              )}
                              {lowStock && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md"
                                  style={{ fontSize: 9, background: "var(--sky-l)", color: "var(--sky)" }}
                                >
                                  Low
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: "var(--stone-500)", marginTop: 1 }}>
                              {item.amount} {item.unit}
                              {item.expirationDate && ` · exp ${new Date(item.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ml-2"
                            style={{ color: "var(--stone-400)" }}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add item dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif italic" style={{ fontSize: 18 }}>Add pantry item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Ingredient selector */}
            <div className="space-y-1.5">
              <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>Item name *</Label>
              <Popover open={ingredientOpen} onOpenChange={setIngredientOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between px-3 h-10 rounded-xl transition-all"
                    style={{
                      fontSize: 13,
                      border: "1.5px solid var(--cream-300)",
                      background: "var(--card)",
                      color: newItem.name ? "var(--foreground)" : "var(--stone-400)",
                    }}
                    aria-label="Select ingredient"
                  >
                    {newItem.name || "Search ingredients..."}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 rounded-2xl" align="start">
                  <Command>
                    <CommandInput placeholder="Search ingredients..." />
                    <CommandList>
                      <CommandEmpty>No results.</CommandEmpty>
                      <CommandGroup>
                        {availableIngredients.map((ing) => (
                          <CommandItem key={ing.value} value={ing.value} onSelect={handleIngredientSelect}>
                            <Check className={cn("mr-2 h-4 w-4", newItem.name === ing.label ? "opacity-100" : "opacity-0")} />
                            {ing.label}
                            <span className="ml-auto text-xs opacity-50">{ing.unit}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Or enter custom name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="h-10 rounded-xl"
                style={{ fontSize: 13 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>Amount *</Label>
                <Input
                  type="number" min="0" step="0.1"
                  placeholder="2"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  className="h-10 rounded-xl"
                  style={{ fontSize: 13 }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>Unit *</Label>
                <Input
                  placeholder="lbs"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="h-10 rounded-xl"
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>Category</Label>
              <Select value={newItem.category} onValueChange={(v: any) => setNewItem({ ...newItem, category: v })}>
                <SelectTrigger className="h-10 rounded-xl" style={{ fontSize: 13 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["produce","dairy","meat","pantry","frozen","other"].map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>
                Expiration date <span style={{ color: "var(--stone-400)" }}>(optional)</span>
              </Label>
              <Input
                type="date"
                value={newItem.expirationDate}
                onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
                className="h-10 rounded-xl"
                style={{ fontSize: 13 }}
              />
            </div>

            <div className="space-y-1.5">
              <Label style={{ fontSize: 12, color: "var(--stone-600)" }}>
                Low stock alert <span style={{ color: "var(--stone-400)" }}>(optional)</span>
              </Label>
              <Input
                type="number" min="0" step="0.1"
                placeholder="Alert when below this amount"
                value={newItem.lowStockThreshold}
                onChange={(e) => setNewItem({ ...newItem, lowStockThreshold: e.target.value })}
                className="h-10 rounded-xl"
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <button
              onClick={handleAddItem}
              className="flex-1 h-10 rounded-xl transition-all"
              style={{
                fontSize: 13,
                background: "var(--sage-d)",
                color: "#fff",
                border: "none",
              }}
            >
              Add to pantry
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
