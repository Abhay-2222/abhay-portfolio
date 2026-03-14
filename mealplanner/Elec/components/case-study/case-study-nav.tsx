"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"

const sections = [
  { id: "problem", label: "01 - The Problem" },
  { id: "research", label: "02 - Research" },
  { id: "evolution", label: "03 - Design Evolution" },
  { id: "mistakes", label: "04 - Mistakes" },
  { id: "decisions", label: "05 - Decisions" },
  { id: "architecture", label: "06 - Architecture" },
  { id: "technical", label: "07 - Technical" },
  { id: "design-system", label: "08 - Design System" },
  { id: "breakthroughs", label: "09 - Breakthroughs" },
  { id: "flow", label: "10 - UX Flow" },
  { id: "lessons", label: "11 - Lessons" },
]

export function CaseStudyNav() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Sections</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {sections.map((section) => (
          <DropdownMenuItem
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="text-sm cursor-pointer"
          >
            {section.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
