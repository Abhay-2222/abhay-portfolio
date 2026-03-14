"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface BudgetTrackerProps {
  actualSpending: number
  weeklyBudget: number
  onBudgetChange: (budget: number) => void
}

export function BudgetTracker({ actualSpending, weeklyBudget, onBudgetChange }: BudgetTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalCost = actualSpending
  const remaining = weeklyBudget - totalCost
  const percentUsed = weeklyBudget > 0 ? (totalCost / weeklyBudget) * 100 : 0
  const isOverBudget = remaining < 0

  if (weeklyBudget > 0 && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full text-left group"
        aria-label="Expand budget details"
      >
        <div className="bg-card border border-[var(--cream-300)] rounded-xl p-4 shadow-warm-xs transition-all hover:border-[var(--cream-400)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[var(--stone-700)]">Weekly grocery estimate</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[13px] ${isOverBudget ? "text-[var(--terra-d)]" : "text-foreground"}`}>
                ${totalCost.toFixed(2)} / ${weeklyBudget.toFixed(0)}
              </span>
              <ChevronDown className="h-4 w-4 text-[var(--stone-500)] group-hover:text-foreground transition-colors" aria-hidden="true" />
            </div>
          </div>
          <div className="w-full h-1 bg-[var(--cream-200)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOverBudget ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
              role="progressbar"
              aria-valuenow={percentUsed}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${percentUsed.toFixed(0)}% of budget used`}
            />
          </div>
          <p className={`text-[11px] mt-1.5 ${isOverBudget ? "text-[var(--terra-d)]" : "text-[var(--stone-600)]"}`}>
            {isOverBudget
              ? `$${Math.abs(remaining).toFixed(2)} over — consider swapping a meal`
              : `$${remaining.toFixed(2)} remaining this week`}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-card border border-[var(--cream-300)] rounded-xl p-4 shadow-warm-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-foreground">Weekly Budget</span>
        {weeklyBudget > 0 && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[var(--stone-500)] hover:text-foreground transition-colors"
            aria-label="Collapse budget details"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget-input" className="text-[11px] text-[var(--stone-600)]">
            Set your weekly budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--stone-500)]">$</span>
            <Input
              id="budget-input"
              type="number"
              min="0"
              step="5"
              value={weeklyBudget || ""}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="pl-7 h-9 border-[var(--cream-300)] bg-card focus:border-[var(--sage)] text-[13px]"
              placeholder="0.00"
              aria-label="Weekly budget amount"
            />
          </div>
        </div>

        {weeklyBudget > 0 && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--stone-700)]">Spent</span>
                <span className="font-mono">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--stone-700)]">Remaining</span>
                <span className={`font-mono ${isOverBudget ? "text-[var(--terra-d)]" : "text-[var(--sage-d)]"}`}>
                  ${Math.abs(remaining).toFixed(2)}{isOverBudget ? " over" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full h-1 bg-[var(--cream-200)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"}`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={percentUsed}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${percentUsed.toFixed(0)}% of budget used`}
                />
              </div>
              <p className="text-[10px] text-[var(--stone-600)] text-center">{percentUsed.toFixed(0)}% of budget used</p>
            </div>

            {isOverBudget && (
              <p className="text-[11px] text-[var(--terra-d)] bg-[var(--terra-l)] p-2.5 rounded-lg" role="alert">
                Over budget — consider swapping a meal this week
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
