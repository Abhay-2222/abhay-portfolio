"use client"

import type * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Unchecked state - light gray background with subtle shadow
        "data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
        "data-[state=unchecked]:shadow-inner",
        // Checked state - primary color with better shadow
        "data-[state=checked]:bg-primary data-[state=checked]:shadow-md",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg transition-transform duration-200",
          "ring-0",
          // Unchecked state - white thumb on left
          "data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-white",
          // Checked state - white thumb on right with slight scale effect
          "data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:bg-white",
          "dark:data-[state=unchecked]:bg-gray-100",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
