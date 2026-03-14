export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

export function formatWeekRange(date: Date): string {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)

  const startMonth = start.toLocaleDateString("en-US", { month: "short" })
  const endMonth = end.toLocaleDateString("en-US", { month: "short" })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

export function getWeekKey(date: Date): string {
  const start = getWeekStart(date)
  return start.toISOString().split("T")[0]
}

export function getDaysOfWeek(weekStart: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    days.push(day)
  }
  return days
}

export function formatDayWithDate(date: Date): string {
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
  const dayNum = date.getDate()
  return `${dayName} ${dayNum}`
}

export function getDayKey(date: Date): string {
  // Returns "2026-03-13" — ISO format required by meal-utils date parsing
  return date.toLocaleDateString("en-CA") // en-CA locale produces YYYY-MM-DD
}
