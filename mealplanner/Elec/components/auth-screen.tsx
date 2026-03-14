"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { validatePasswordStrength, validateEmail, checkRateLimit } from "@/lib/security"
import Image from "next/image"

interface AuthScreenProps {
  onComplete: () => void
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [rateLimitError, setRateLimitError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkRateLimit("auth_attempt", 5, 60000)) {
      setRateLimitError("Too many attempts. Please try again in 1 minute.")
      return
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    if (isSignUp) {
      const validation = validatePasswordStrength(password)
      if (!validation.isValid) {
        setPasswordError(validation.message)
        return
      }
    }

    setPasswordError("")
    setEmailError("")
    setRateLimitError("")
    onComplete()
  }

  const handleSocialLogin = (provider: string) => {
    if (!checkRateLimit("social_login", 5, 60000)) {
      setRateLimitError("Too many attempts. Please try again in 1 minute.")
      return
    }
    console.log(`Login with ${provider}`)
    onComplete()
  }

  const canSubmit = !isSignUp || agreedToTerms

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto" style={{ background: "var(--cream-50)" }}>

      {/* ── Hero photo ── */}
      <div className="relative flex-shrink-0" style={{ height: "34svh", minHeight: 220 }}>
        <Image
          src="/avocado-toast.png"
          alt=""
          fill
          className="object-cover"
          priority
          aria-hidden="true"
        />
        {/* Gradient — dark top fading to cream at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(44,37,30,0.55) 0%, rgba(44,37,30,0.4) 45%, var(--cream-50) 100%)",
          }}
        />

        {/* Wordmark centered on photo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-6">
          <h1
            className="font-serif italic"
            style={{ fontSize: "clamp(38px, 9vw, 52px)", color: "#fdfaf6", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            MealPlan
          </h1>
          <p
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(253,250,246,0.45)" }}
          >
            Plan smart · eat well
          </p>
        </div>
      </div>

      {/* ── Form section ── */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-10 max-w-sm w-full mx-auto">

        {/* Sign in / Create account tab switcher */}
        <div
          className="flex rounded-2xl mb-6"
          style={{ background: "var(--cream-200)", padding: 4 }}
          role="tablist"
          aria-label="Account mode"
        >
          {[
            { label: "Sign in",         active: !isSignUp },
            { label: "Create account",  active: isSignUp },
          ].map(({ label, active }, i) => (
            <button
              key={label}
              onClick={() => { setIsSignUp(i === 1); setEmailError(""); setPasswordError("") }}
              role="tab"
              aria-selected={active}
              className="flex-1 rounded-xl transition-all"
              style={{
                height: 38,
                fontSize: 13,
                background: active ? "var(--card)" : "transparent",
                color: active ? "var(--foreground)" : "var(--stone-500)",
                boxShadow: active ? "var(--sh-sm)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Rate limit error */}
        {rateLimitError && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: "var(--terra-l)", border: "1px solid rgba(147,79,42,0.2)" }}
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--terra-d)" }} />
            <span style={{ fontSize: 12, color: "var(--terra-d)" }}>{rateLimitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="overline">Email address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError("") }}
              required
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "auth-email-err" : undefined}
              className="w-full transition-colors"
              style={{
                height: 48,
                fontSize: 14,
                background: "var(--card)",
                border: `1.5px solid ${emailError ? "var(--terra-d)" : "var(--cream-300)"}`,
                borderRadius: 12,
                padding: "0 14px",
                color: "var(--foreground)",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sage)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = emailError ? "var(--terra-d)" : "var(--cream-300)")}
            />
            {emailError && (
              <p id="auth-email-err" className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--terra-d)" }}>
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password" className="overline">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  className="overline"
                  style={{ color: "var(--sage-d)", textTransform: "none", letterSpacing: "normal", fontSize: 11 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Min. 8 characters" : "Enter your password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "auth-pw-err" : undefined}
                className="w-full transition-colors"
                style={{
                  height: 48,
                  fontSize: 14,
                  background: "var(--card)",
                  border: `1.5px solid ${passwordError ? "var(--terra-d)" : "var(--cream-300)"}`,
                  borderRadius: 12,
                  padding: "0 44px 0 14px",
                  color: "var(--foreground)",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sage)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = passwordError ? "var(--terra-d)" : "var(--cream-300)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 min-h-0"
                style={{ color: "var(--stone-400)", padding: 4 }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p id="auth-pw-err" className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--terra-d)" }}>
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {passwordError}
              </p>
            )}
            {isSignUp && !passwordError && (
              <p style={{ fontSize: 11, color: "var(--stone-500)" }}>
                8+ characters with uppercase, lowercase, numbers and symbols
              </p>
            )}
          </div>

          {/* Terms — sign up only */}
          {isSignUp && (
            <div className="flex items-start gap-2.5 pt-1">
              <Checkbox
                id="auth-terms"
                checked={agreedToTerms}
                onCheckedChange={(c) => setAgreedToTerms(c === true)}
                className="mt-0.5 data-[state=checked]:bg-[var(--sage-d)] data-[state=checked]:border-[var(--sage-d)]"
              />
              <label htmlFor="auth-terms" style={{ fontSize: 12, color: "var(--stone-600)", lineHeight: 1.55, cursor: "pointer" }}>
                I agree to the{" "}
                <button type="button" style={{ color: "var(--sage-d)" }}>Terms of service</button>
                {" "}and{" "}
                <button type="button" style={{ color: "var(--sage-d)" }}>Privacy policy</button>
              </label>
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl transition-all mt-2"
            style={{
              height: 52,
              fontSize: 14,
              background: canSubmit ? "var(--sage-d)" : "var(--cream-300)",
              color: canSubmit ? "#fff" : "var(--stone-500)",
              border: "none",
              letterSpacing: "0.01em",
            }}
          >
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--cream-300)" }} />
          <span className="overline">or continue with</span>
          <div className="flex-1 h-px" style={{ background: "var(--cream-300)" }} />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center gap-2 rounded-2xl transition-all"
            style={{
              height: 48,
              border: "1.5px solid var(--cream-300)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              boxShadow: "var(--sh-xs)",
            }}
            aria-label="Continue with Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("Apple")}
            className="flex items-center justify-center gap-2 rounded-2xl transition-all"
            style={{
              height: 48,
              border: "1.5px solid var(--cream-300)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              boxShadow: "var(--sh-xs)",
            }}
            aria-label="Continue with Apple"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center mt-6" style={{ fontSize: 12, color: "var(--stone-500)" }}>
          {isSignUp ? "Already have an account? " : "New to MealPlan? "}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setEmailError(""); setPasswordError("") }}
            style={{ color: "var(--sage-d)" }}
          >
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  )
}
