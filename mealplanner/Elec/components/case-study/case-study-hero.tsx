import { Leaf } from "lucide-react"

export function CaseStudyHero() {
  return (
    <section className="relative overflow-hidden bg-primary/5 border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-sm text-muted-foreground tracking-wide uppercase">
            Case Study
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl text-foreground tracking-tight leading-tight text-balance mb-6">
          MealPlanner: Designing a Mobile-First Meal Planning Experience
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty mb-10">
          A comprehensive case study documenting the end-to-end design and development process of a
          meal planning app built with Next.js, from initial research through iterative design
          refinement to a polished, accessible product.
        </p>

        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">Role</span>
            <span className="text-foreground">Product Designer &amp; Developer</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Platform</span>
            <span className="text-foreground">Mobile-First Web App</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Stack</span>
            <span className="text-foreground">Next.js, React, Tailwind CSS</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Status</span>
            <span className="text-foreground">Shipped &amp; Deployed</span>
          </div>
        </div>
      </div>
    </section>
  )
}
