"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar } from "lucide-react"
import { formatWeekRange } from "@/lib/date-utils"
import type { WeekHistory } from "@/lib/types"

interface WeekHistoryProps {
  history: WeekHistory[]
  onClose: () => void
}

export function WeekHistoryView({ history, onClose }: WeekHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Go back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-serif text-[22px] italic text-foreground">Week History</h2>
        </div>
        <div className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-[var(--cream-400)]" />
          <p className="text-[13px] text-[var(--stone-600)]">No history available yet</p>
          <p className="text-[11px] text-[var(--stone-500)] mt-2">Start planning meals to see your weekly history here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Go back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-serif text-[22px] italic text-foreground">Week History</h2>
      </div>

      <p className="text-[12px] text-[var(--stone-600)]">Your meal planning history from the past 4 weeks</p>

      <div className="space-y-3">
        {history.map((week) => {
          const isOverBudget = week.budget > 0 && week.spent > week.budget
          const percentUsed = week.budget > 0 ? (week.spent / week.budget) * 100 : 0

          return (
            <Card key={week.weekKey} className="shadow-warm-xs border-[var(--cream-300)] overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] text-foreground">{formatWeekRange(week.weekStart)}</CardTitle>
                  {week.mealCount > 0 && (
                    <span className="font-mono text-[11px] text-[var(--stone-600)]">
                      {week.mealCount} meal{week.mealCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--cream-50)] border border-[var(--cream-200)]">
                    <p className="font-mono text-[8px] tracking-[0.12em] uppercase text-[var(--stone-500)]">Meals</p>
                    <p className="text-lg text-foreground mt-1">{week.mealCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--cream-50)] border border-[var(--cream-200)]">
                    <p className="font-mono text-[8px] tracking-[0.12em] uppercase text-[var(--stone-500)]">Spent</p>
                    <p className="text-lg text-foreground mt-1 font-mono">${week.spent.toFixed(2)}</p>
                  </div>
                </div>

                {week.budget > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--stone-600)]">Budget: ${week.budget.toFixed(0)}</span>
                      <span className={isOverBudget ? "text-[var(--terra-d)]" : "text-[var(--sage-d)]"}>
                        {isOverBudget
                          ? `$${(week.spent - week.budget).toFixed(2)} over`
                          : `$${(week.budget - week.spent).toFixed(2)} left`}
                      </span>
                    </div>
                    <div className="h-1 bg-[var(--cream-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? "bg-[var(--terracotta)]" : "bg-[var(--sage)]"
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
