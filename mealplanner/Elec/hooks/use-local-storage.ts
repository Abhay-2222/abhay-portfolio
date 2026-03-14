"use client"

import { useState, useEffect, useRef } from "react"
import { sanitizeForStorage, safeJSONParse } from "@/lib/security"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Capture initialValue in a ref so it never changes identity between renders
  const initialValueRef = useRef(initialValue)

  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Load from localStorage on mount only — use ref to avoid re-running on every render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = safeJSONParse<T>(item, initialValueRef.current)
        setStoredValue(parsed)
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
  }, [key]) // key is stable; initialValue intentionally excluded via ref

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T) => {
    try {
      const sanitized = sanitizeForStorage(value)
      setStoredValue(sanitized)
      window.localStorage.setItem(key, JSON.stringify(sanitized))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  return [storedValue, setValue]
}
