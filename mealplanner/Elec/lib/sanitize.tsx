export function sanitizeString(input: string): string {
  if (!input) return ""

  // Remove any HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, "")

  // Escape special characters
  return withoutTags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

export function sanitizeNumber(input: string | number): number {
  const num = typeof input === "string" ? Number.parseFloat(input) : input
  return isNaN(num) ? 0 : Math.max(0, num)
}

export function sanitizeUrl(url: string): string {
  // Only allow http(s) and relative URLs
  const urlPattern = /^(https?:\/\/|\/)/i
  if (!urlPattern.test(url)) {
    return ""
  }

  // Block javascript: and data: URLs
  if (/^(javascript|data|vbscript|file):/i.test(url)) {
    return ""
  }

  return url
}

// Validate and sanitize meal plan inputs
export function sanitizeMealInput(input: string): string {
  if (!input) return ""

  // Trim whitespace
  let sanitized = input.trim()

  // Limit length to prevent DoS
  sanitized = sanitized.slice(0, 200)

  // Remove potentially harmful characters but keep basic punctuation
  sanitized = sanitized.replace(/[<>{}]/g, "")

  return sanitized
}

// Sanitize numeric inputs for budgets and quantities
export function sanitizeBudgetInput(input: string | number): number {
  const num = typeof input === "string" ? Number.parseFloat(input) : input

  if (isNaN(num) || num < 0) return 0

  // Limit to reasonable budget values (0-100000)
  return Math.min(100000, Math.max(0, num))
}
