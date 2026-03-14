import { CaseStudyContent } from "@/components/case-study/case-study-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MealPlanner Case Study - Design Process & Journey",
  description:
    "A comprehensive case study documenting the design process, research, iterations, and lessons learned building MealPlanner.",
}

export default function CaseStudyPage() {
  return <CaseStudyContent />
}
