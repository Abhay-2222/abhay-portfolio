interface CaseStudySectionProps {
  label: string
  title: string
  children: React.ReactNode
  id?: string
}

export function CaseStudySection({ label, title, children, id }: CaseStudySectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-8">
        <span className="text-xs text-primary tracking-widest uppercase block mb-3">
          {label}
        </span>
        <h2 className="text-2xl md:text-3xl text-foreground tracking-tight text-balance">
          {title}
        </h2>
      </div>
      <div className="space-y-6 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}
