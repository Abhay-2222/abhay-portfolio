// Security utilities for input validation and sanitization

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean
  message: string
} {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      isValid: false,
      message: "Password must contain uppercase, lowercase, numbers, and special characters",
    }
  }

  return { isValid: true, message: "Password is strong" }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize data before localStorage
export function sanitizeForStorage<T>(data: T): T {
  if (typeof data === "string") {
    // Remove any script tags or potentially dangerous content
    return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") as T
  }
  return data
}

// Safe JSON parse with validation
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString)
    // Basic validation to prevent prototype pollution
    if (parsed && typeof parsed === "object") {
      // Remove __proto__ and constructor to prevent prototype pollution
      delete parsed.__proto__
      delete parsed.constructor
    }
    return parsed as T
  } catch (error) {
    console.error("JSON parse error:", error)
    return fallback
  }
}

// Generate CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Validate CSRF token
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64
}

// Rate limiting helper (simple client-side implementation)
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now()
  const attemptsKey = `rate_limit_${key}`
  const attempts = JSON.parse(localStorage.getItem(attemptsKey) || "[]") as number[]

  // Filter attempts within the time window
  const recentAttempts = attempts.filter((timestamp) => now - timestamp < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return false // Rate limit exceeded
  }

  // Add current attempt
  recentAttempts.push(now)
  localStorage.setItem(attemptsKey, JSON.stringify(recentAttempts))

  return true // Within rate limit
}
