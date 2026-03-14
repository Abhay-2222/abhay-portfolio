"use client"

import { useState } from "react"
import { DollarSign, ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react"

interface WeeklyBudgetProps {
  budget?: number
  spent?: number
  onSetBudget?: (amount: number) => void
  onRemoveBudget?: () => void
}

export function WeeklyBudget({ budget, spent = 0, onSetBudget, onRemoveBudget }: WeeklyBudgetProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(!budget)
  const [budgetInput, setBudgetInput] = useState(budget?.toString() || "")

  const handleSaveBudget = () => {
    const amount = Number.parseFloat(budgetInput)
    if (!isNaN(amount) && amount > 0) {
      onSetBudget?.(amount)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    if (budget) {
      setBudgetInput(budget.toString())
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setBudgetInput(budget?.toString() || "")
    setIsEditing(true)
  }

  const handleRemove = () => {
    onRemoveBudget?.()
    setBudgetInput("")
    setIsEditing(true)
  }

  // ── Editing / setting state ──
  if (isEditing) {
    return (
      <div
        className="rounded-2xl"
        style={{
          background: "var(--card)",
          border: "1.5px dashed var(--cream-300)",
          boxShadow: "var(--sh-xs)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--cream-100)" }}>
            <DollarSign className="h-4 w-4" style={{ color: "var(--stone-500)" }} aria-hidden="true" />
          </div>
          <div>
            <p className="overline">Weekly budget</p>
            <p style={{ fontSize: 11, color: "var(--stone-500)" }}>Set your weekly meal spending limit</p>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-mono"
              style={{ fontSize: 13, color: "var(--stone-500)" }}
            >$</span>
            <input
              type="number"
              placeholder="0.00"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveBudget()}
              aria-label="Budget amount"
              className="w-full transition-colors"
              style={{
                height: 40,
                fontSize: 14,
                paddingLeft: 26,
                paddingRight: 12,
                background: "var(--cream-50)",
                border: "1.5px solid var(--cream-300)",
                borderRadius: 10,
                color: "var(--foreground)",
                outline: "none",
                fontFamily: "var(--font-mono)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sage)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cream-300)")}
            />
          </div>
          <button
            onClick={handleSaveBudget}
            disabled={!budgetInput || Number.parseFloat(budgetInput) <= 0}
            aria-label="Save budget"
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40,
              height: 40,
              background: budgetInput && Number.parseFloat(budgetInput) > 0 ? "var(--sage-d)" : "var(--cream-200)",
              color: budgetInput && Number.parseFloat(budgetInput) > 0 ? "#fff" : "var(--stone-500)",
              border: "none",
              flexShrink: 0,
            }}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {budget && (
            <button
              onClick={handleCancelEdit}
              aria-label="Cancel editing"
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 40,
                height: 40,
                background: "var(--cream-100)",
                color: "var(--stone-500)",
                border: "1px solid var(--cream-300)",
                flexShrink: 0,
              }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Display state ──
  const percentUsed = (spent / budget!) * 100
  const remaining = budget! - spent
  const isOverBudget = spent > budget!
  const overAmount = isOverBudget ? spent - budget! : 0
  const progressBarWidth = Math.min(percentUsed, 100)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1.5px solid var(--cream-200)", boxShadow: "var(--sh-xs)" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-left"
          aria-expanded={isExpanded}
          aria-label={`Weekly budget: $${budget}, ${isOverBudget ? "over budget" : `${Math.min(percentUsed, 100).toFixed(0)}% used`}, ${isExpanded ? "collapse" : "expand"} details`}
        >
          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--sage-l)" }}>
            <DollarSign className="h-4 w-4" style={{ color: "var(--sage-d)" }} aria-hidden="true" />
          </div>
          <div>
            <p className="overline">Weekly budget</p>
            <p className="font-mono" style={{ fontSize: 16, color: "var(--foreground)" }}>
              ${budget}
            </p>
          </div>
          <div className="ml-auto">
            {isExpanded
              ? <ChevronUp className="h-4 w-4" style={{ color: "var(--stone-400)" }} aria-hidden="true" />
              : <ChevronDown className="h-4 w-4" style={{ color: "var(--stone-400)" }} aria-hidden="true" />}
          </div>
        </button>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleEdit}
            aria-label="Edit budget"
            className="flex items-center justify-center rounded-lg transition-all"
            style={{ width: 28, height: 28, color: "var(--stone-500)", background: "transparent" }}
          >
            <Edit2 className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            onClick={handleRemove}
            aria-label="Remove budget"
            className="flex items-center justify-center rounded-lg transition-all"
            style={{ width: 28, height: 28, color: "var(--terracotta)", background: "transparent" }}
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          className="px-4 pb-4 space-y-2"
          role="region"
          aria-label="Budget details"
          style={{ borderTop: "1px solid var(--cream-100)" }}
        >
          <div className="relative h-1.5 rounded-full overflow-hidden mt-3" style={{ background: "var(--cream-200)" }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${progressBarWidth}%`,
                background: isOverBudget ? "var(--terracotta)" : "var(--sage)",
              }}
              role="progressbar"
              aria-valuenow={progressBarWidth}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progressBarWidth.toFixed(0)}% of budget used`}
            />
          </div>

          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, color: "var(--stone-500)" }}>
              {percentUsed.toFixed(0)}% used
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                color: isOverBudget ? "var(--terra-d)" : "var(--sage-d)",
              }}
            >
              {isOverBudget ? `$${overAmount.toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
            </span>
          </div>

          {isOverBudget && (
            <div
              className="rounded-xl px-3 py-2"
              style={{ background: "var(--terra-l)", border: "1px solid rgba(147,79,42,0.2)" }}
            >
              <p style={{ fontSize: 11, color: "var(--terra-d)" }}>
                Over budget — consider choosing more affordable meals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
