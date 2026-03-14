"use client"

import { CaseStudyHero } from "./case-study-hero"
import { CaseStudySection } from "./case-study-section"
import { CaseStudyNav } from "./case-study-nav"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  Users,
  ShieldCheck,
  Layers,
} from "lucide-react"
import Link from "next/link"

export function CaseStudyContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
          <CaseStudyNav />
        </div>
      </header>

      <CaseStudyHero />

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">
        {/* ---- 01. THE PROBLEM ---- */}
        <CaseStudySection id="problem" label="01 - The Problem" title="Meal Planning Is Broken for Real People">
          <p>
            Most people know they should plan their meals. Fewer actually do it. The friction is not
            a lack of willpower; it is a lack of tools that match how people actually think about
            food. Existing meal planning apps tend to fall into two traps: they are either
            recipe databases with a calendar bolted on, or they are overly rigid systems that treat
            meal planning like project management.
          </p>

          <p>
            The real workflow is messier. People think in terms of &quot;what do I already have?&quot;,
            &quot;what can I afford this week?&quot;, and &quot;what sounds good for Tuesday?&quot; They do not
            want to browse 10,000 recipes. They want a small, curated set that fits their
            diet, budget, and pantry.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            {[
              { stat: "40%", label: "of groceries wasted weekly by average households" },
              { stat: "$150+", label: "monthly overspend from unplanned shopping" },
              { stat: "8+", label: "apps/tools juggled for meal prep" },
              { stat: "70%", label: "abandon meal plans within the first week" },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-muted/30 rounded-xl">
                <span className="text-2xl text-foreground block mb-1">{item.stat}</span>
                <span className="text-xs text-muted-foreground leading-snug">{item.label}</span>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-primary pl-5 py-2 text-foreground italic">
            &quot;I do not need more recipes. I need someone to tell me what to cook tonight with what
            I already have, and make sure I am not broke by Friday.&quot;
          </blockquote>
        </CaseStudySection>

        {/* ---- 02. RESEARCH ---- */}
        <CaseStudySection id="research" label="02 - Research & Discovery" title="Understanding How People Actually Plan Meals">
          <div className="space-y-8">
            <div>
              <h3 className="text-foreground text-lg mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                User Research
              </h3>
              <p>
                I identified three core user archetypes through synthesized research: the
                Budget-Conscious Planner who shops once a week and needs tight cost control,
                the Health-Focused Cook who tracks macros and filters by dietary restrictions,
                and the Busy Parent who plans meals for a family with minimal cognitive load.
              </p>
              <p className="mt-3">
                The critical finding across all three groups: people do not start meal planning
                from recipes. They start from constraints &mdash; budget, dietary needs, what
                is already in the fridge, and time available to cook. The tool needed to start
                from constraints, not content.
              </p>
            </div>

            <div>
              <h3 className="text-foreground text-lg mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Competitive Analysis
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-muted-foreground font-normal">Competitor</th>
                      <th className="text-left py-3 pr-4 text-muted-foreground font-normal">What They Do</th>
                      <th className="text-left py-3 text-muted-foreground font-normal">Gap Identified</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Mealime</td>
                      <td className="py-3 pr-4">Recipe-first planning</td>
                      <td className="py-3">No budget or pantry awareness</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Eat This Much</td>
                      <td className="py-3 pr-4">Auto-generated plans</td>
                      <td className="py-3">No user control over daily choices</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4">Paprika / Whisk</td>
                      <td className="py-3 pr-4">Recipe management</td>
                      <td className="py-3">No integrated grocery or pantry</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Spreadsheets</td>
                      <td className="py-3 pr-4">Manual planning</td>
                      <td className="py-3">High friction, no intelligence</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-foreground text-lg mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Research Insight
              </h3>
              <div className="p-5 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-foreground">
                  No existing tool treated meal planning as a system. Shopping lists, pantry
                  tracking, budget management, and nutrition all lived in separate apps.
                  The opportunity was to build one unified workflow that connects
                  planning to shopping to cooking &mdash; and makes each step aware of the others.
                </p>
              </div>
            </div>
          </div>
        </CaseStudySection>

        {/* ---- 03. DESIGN EVOLUTION ---- */}
        <CaseStudySection id="evolution" label="03 - Design Evolution" title="From First Wireframe to Final Product">
          <p>
            The design went through multiple iterations, each driven by real feedback and
            self-critique. This was not a linear process; it was a series of wrong turns that
            eventually led to clarity.
          </p>

          <div className="space-y-8 mt-6">
            {/* V1 */}
            <div className="relative pl-8 border-l-2 border-border">
              <div className="absolute left-0 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">1</span>
              </div>
              <h3 className="text-foreground text-lg mb-2">Version 1: Dashboard-First Approach &mdash; Rejected</h3>
              <p>
                The first iteration was a traditional dashboard with analytics up front, a recipe
                browser, and a calendar view. It looked polished but failed the core test: it
                forced users to browse before they could plan. The entry point was
                wrong &mdash; analytics are an output, not an input.
              </p>
              <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10 text-sm">
                <span className="text-destructive font-medium">Why it failed:</span>{" "}
                <span className="text-muted-foreground">
                  Users do not open a meal planner to look at charts. They open it to answer:
                  &quot;What am I eating this week?&quot;
                </span>
              </div>
            </div>

            {/* V2 */}
            <div className="relative pl-8 border-l-2 border-border">
              <div className="absolute left-0 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">2</span>
              </div>
              <h3 className="text-foreground text-lg mb-2">Version 2: Recipe-Centered Grid &mdash; Refined</h3>
              <p>
                Shifted to a recipe grid with filtering by diet type (classic, keto, vegan,
                paleo, etc.). Users could browse and add recipes to a weekly calendar. The
                UI was cleaner, but the mental model was still backwards &mdash; recipe-first
                instead of day-first. Meal cards were also too large, eating up valuable
                screen real estate on mobile.
              </p>
              <div className="mt-3 p-3 bg-warning/5 rounded-lg border border-warning/10 text-sm">
                <span className="text-warning font-medium">Partially worked:</span>{" "}
                <span className="text-muted-foreground">
                  Good recipe filtering, but the grid view was overwhelming on mobile and
                  the oversized cards wasted space.
                </span>
              </div>
            </div>

            {/* V3 */}
            <div className="relative pl-8 border-l-2 border-border">
              <div className="absolute left-0 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">3</span>
              </div>
              <h3 className="text-foreground text-lg mb-2">Version 3: Day-First Weekly Planner &mdash; Breakthrough</h3>
              <p>
                The pivotal shift: making the weekly planner the entry point with a day-selector
                strip at the top. Users pick a day, see three meal slots (breakfast, lunch, dinner),
                and add recipes through a bottom sheet. The mental model finally matched how people
                think: &quot;What day is it? What am I eating?&quot;
              </p>
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                <span className="text-primary font-medium">The breakthrough:</span>{" "}
                <span className="text-muted-foreground">
                  A 7-day strip with single-letter abbreviations, compact meal cards, and an
                  add-meal button with a bottom sheet selector that filters by meal type
                  and diet preference.
                </span>
              </div>
            </div>

            {/* V4 */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute left-0 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-[10px] text-primary-foreground">4</span>
              </div>
              <h3 className="text-foreground text-lg mb-2">Version 4: Integrated System &mdash; Current</h3>
              <p>
                Added budget tracking, daily nutrition display, pantry inventory, smart grocery
                lists that subtract pantry items, and a compact inline budget bar. Each feature
                connects to the planner &mdash; adding a recipe updates the grocery list, the
                nutrition card, and the budget tracker simultaneously. A bottom tab bar
                with four sections provides navigation without cognitive overload.
              </p>
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                <span className="text-primary font-medium">Current state:</span>{" "}
                <span className="text-muted-foreground">
                  Planner, Grocery, Pantry, and Settings tabs. Weekly budget with
                  inline progress. 8 diet categories. Authentication and onboarding flows.
                  High contrast accessibility mode.
                </span>
              </div>
            </div>
          </div>
        </CaseStudySection>

        {/* ---- 04. MISTAKES ---- */}
        <CaseStudySection id="mistakes" label="04 - Mistakes Made" title="What I Got Wrong and What It Taught Me">
          <p>
            Honest reflection on the mistakes that shaped better decisions. Each error carried
            a lesson that directly improved the final product.
          </p>

          <div className="space-y-5 mt-4">
            {[
              {
                mistake: "Started with analytics instead of the planner",
                detail: "The first build had a dashboard with charts and stats up front. Users do not come to plan meals by reviewing their past performance. The planner should be the first screen, always.",
                lesson: "The entry point declares what the product believes the user came to do. Get this wrong and everything else breaks.",
              },
              {
                mistake: "Meal cards were too large on mobile",
                detail: "Early meal cards used large images, full descriptions, and generous padding. They looked beautiful in isolation but on a 375px screen, users could only see one meal at a time. It felt like scrolling through a catalog instead of glancing at a plan.",
                lesson: "Mobile density matters more than desktop aesthetics. Compact does not mean cramped; it means respectful of the user's viewport.",
              },
              {
                mistake: "Overlooked pantry as a first-class feature",
                detail: "Initially treated the pantry as a nice-to-have sidebar feature. But the grocery list was useless without knowing what users already had at home. Users were generating shopping lists full of items they already owned.",
                lesson: "The feature that feels 'extra' is often the one that makes the core feature actually work. Pantry awareness is what makes the grocery list smart.",
              },
              {
                mistake: "Settings page had inconsistent styling",
                detail: "Dark strokes, misaligned inputs, and a profile section that only collected email. The settings page looked like it was designed separately from the rest of the app. Toggle buttons were poorly styled and the email/update button was visually unaligned.",
                lesson: "Every screen is part of the product. Settings pages deserve the same design attention as hero screens. Consistency builds trust.",
              },
              {
                mistake: "Built screens before defining the information architecture",
                detail: "Jumped straight into high-fidelity mockups before deciding what the navigation structure should be. Ended up with orphaned screens and unclear user flows between features.",
                lesson: "Resist the urge to make things look good before knowing what 'it' is. Definition first, design second.",
              },
              {
                mistake: "Onboarding images broke on deployment",
                detail: "Used file paths for splash screen images that did not resolve correctly in the deployment environment. The first thing new users saw was broken image placeholders. Had to refactor to use placeholder SVGs while fixing the asset pipeline.",
                lesson: "Always test the first-run experience. If onboarding is broken, the rest of the app is invisible.",
              },
            ].map((item, index) => (
              <div key={index} className="p-5 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <h3 className="text-foreground text-base">{item.mistake}</h3>
                </div>
                <p className="text-sm mb-4 pl-7">{item.detail}</p>
                <div className="flex items-start gap-3 pl-7">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{item.lesson}</p>
                </div>
              </div>
            ))}
          </div>
        </CaseStudySection>

        {/* ---- 05. KEY DECISIONS ---- */}
        <CaseStudySection id="decisions" label="05 - Strategic Decisions" title="The Choices That Defined the Product">
          <div className="space-y-6">
            {[
              {
                decision: "Weekly Planner as Entry Point",
                rationale: "Users are task-oriented: 'What am I eating this week?' The planner answers this immediately. Analytics, settings, and history are secondary and live behind tabs.",
              },
              {
                decision: "Bottom Sheet for Recipe Selection",
                rationale: "Instead of navigating to a separate recipe page, recipes appear in a bottom sheet that slides up from the current context. The user never loses their place in the weekly plan. The sheet filters by meal type and shows budget impact warnings before selection.",
              },
              {
                decision: "Budget as Inline Context, Not a Separate Page",
                rationale: "The budget tracker sits at the top of the planner as a collapsible card. Users see their spending as they add meals, not after. This makes budget-awareness passive, not effortful.",
              },
              {
                decision: "Pantry-Aware Grocery Lists",
                rationale: "The grocery list automatically subtracts ingredients the user already has in their pantry. No more buying duplicates. The pantry becomes a living inventory that makes every other feature smarter.",
              },
              {
                decision: "8 Diet Categories, Curated Recipes",
                rationale: "Instead of a massive recipe database, the app ships with curated recipes across classic, low-carb, keto, flexitarian, paleo, vegetarian, pescatarian, and vegan diets. Quality over quantity. Each recipe has full nutrition data and dynamic cost calculation.",
              },
              {
                decision: "Mobile-First, Single-Column Layout",
                rationale: "Designed exclusively for mobile viewports first. Single-column layouts, touch-friendly tap targets, bottom navigation, and no hover-dependent interactions. Desktop enhancement came later.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary font-mono">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-foreground text-base mb-1">{item.decision}</h3>
                  <p className="text-sm">{item.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </CaseStudySection>

        {/* ---- 06. PRODUCT ARCHITECTURE ---- */}
        <CaseStudySection id="architecture" label="06 - Product Architecture" title="How the System Fits Together">
          <p>
            The final product is a five-tab mobile app where every feature is aware of the others.
            Adding a recipe to the planner triggers a cascade: the grocery list updates, nutrition
            recalculates, budget adjusts, and pantry items are cross-referenced.
          </p>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-muted-foreground font-normal">Tab</th>
                  <th className="text-left py-3 pr-4 text-muted-foreground font-normal">Purpose</th>
                  <th className="text-left py-3 text-muted-foreground font-normal">Key Features</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Planner</td>
                  <td className="py-3 pr-4">Weekly meal scheduling</td>
                  <td className="py-3">Day strip, meal slots, budget bar, nutrition card, grid/single view toggle</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Grocery</td>
                  <td className="py-3 pr-4">Auto-generated shopping</td>
                  <td className="py-3">Pantry-subtracted list, category grouping, cost estimates, share/export</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Pantry</td>
                  <td className="py-3 pr-4">Inventory management</td>
                  <td className="py-3">Add items, expiry tracking, low-stock alerts, ingredient autocomplete</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Settings</td>
                  <td className="py-3 pr-4">Profile &amp; preferences</td>
                  <td className="py-3">Profile management, high contrast mode, analytics summary, data export</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 bg-primary/5 rounded-xl border border-primary/10">
            <h3 className="text-foreground text-base mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              The Cascade Principle
            </h3>
            <p className="text-sm text-foreground">
              Every user action propagates through the system. Add a recipe: grocery list
              updates, nutrition recalculates, budget adjusts, pantry cross-references. Remove a
              recipe: the reverse cascade fires. This is not a collection of features; it is
              a single system with multiple views.
            </p>
          </div>
        </CaseStudySection>

        {/* ---- 07. TECHNICAL DECISIONS ---- */}
        <CaseStudySection id="technical" label="07 - Technical Decisions" title="Technology Choices and Their Rationale">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-muted-foreground font-normal">Layer</th>
                  <th className="text-left py-3 pr-4 text-muted-foreground font-normal">Choice</th>
                  <th className="text-left py-3 text-muted-foreground font-normal">Rationale</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Framework</td>
                  <td className="py-3 pr-4">Next.js 15</td>
                  <td className="py-3">App Router, server components, Vercel deployment, performance optimizations</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">UI</td>
                  <td className="py-3 pr-4">shadcn/ui + Tailwind CSS v4</td>
                  <td className="py-3">Accessible primitives, design token system, rapid iteration</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Typography</td>
                  <td className="py-3 pr-4">Geist Mono</td>
                  <td className="py-3">Clean, modern, excellent readability at small sizes on mobile</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">Color System</td>
                  <td className="py-3 pr-4">OKLCH tokens</td>
                  <td className="py-3">Sage green primary, cream backgrounds, terracotta accents. Warm, food-appropriate palette</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">State</td>
                  <td className="py-3 pr-4">localStorage + custom hooks</td>
                  <td className="py-3">Offline-first persistence, no backend dependency for demo, instant updates</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Deployment</td>
                  <td className="py-3 pr-4">Vercel</td>
                  <td className="py-3">Serverless, edge functions, analytics, instant preview deployments</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h3 className="text-foreground text-lg mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Security Hardening
            </h3>
            <p>
              The app underwent a comprehensive security audit and hardening process, addressing
              multiple CVEs in the Next.js ecosystem. Changes included upgrading to patched
              Next.js versions (CVE-2025-55182, CVE-2025-55184, CVE-2025-55183, CVE-2025-67779),
              implementing Content Security Policy headers, adding rate limiting for authentication
              attempts, input sanitization, CSRF token generation, safe JSON parsing to prevent
              prototype pollution, and request body size limits to mitigate denial-of-service vectors.
            </p>
          </div>
        </CaseStudySection>

        {/* ---- 08. DESIGN SYSTEM ---- */}
        <CaseStudySection id="design-system" label="08 - Design System" title="Visual Language and Component Philosophy">
          <div className="space-y-6">
            <div>
              <h3 className="text-foreground text-lg mb-3">Color Palette</h3>
              <p className="mb-4">
                The palette was deliberately chosen to evoke warmth and freshness. Food apps
                that use cold blues or stark whites feel clinical. The sage green, cream, and
                terracotta combination signals health, comfort, and approachability.
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Sage Green</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-background border border-border" />
                  <span className="text-[10px] text-muted-foreground">Cream</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-secondary" />
                  <span className="text-[10px] text-muted-foreground">Terracotta</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <span className="text-[10px] text-muted-foreground">Warm Gray</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-foreground" />
                  <span className="text-[10px] text-muted-foreground">Near Black</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-foreground text-lg mb-3">Component Principles</h3>
              <ul className="space-y-3">
                {[
                  "Minimal borders. Cards use subtle shadows and background shifts instead of hard strokes.",
                  "Generous rounding. 2xl border radius on cards, xl on buttons and inputs. Softness signals friendliness.",
                  "Compact density on mobile. Nutrition cards, budget bars, and meal cards are deliberately compressed without feeling cramped.",
                  "Backdrop blur navigation. Both the header and bottom tab bar use glassmorphic blur effects to maintain context while scrolling.",
                  "Accessibility built in. High contrast mode toggleable from settings. ARIA labels on all interactive elements. Screen reader text on icon-only buttons.",
                ].map((principle, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CaseStudySection>

        {/* ---- 09. BREAKTHROUGHS ---- */}
        <CaseStudySection id="breakthroughs" label="09 - Key Breakthroughs" title="The Moments That Changed Everything">
          <div className="space-y-6">
            {[
              {
                title: "The Entry Point Is a Philosophy",
                body: "Choosing 'Weekly Planner' as the first screen was not a UX decision. It was a product philosophy declaration. It says: 'You are here to plan your week. Everything else serves that goal.' The moment this clicked, the entire navigation structure fell into place. Analytics moved to settings. Recipe browsing became a supporting action inside a bottom sheet, not a destination.",
              },
              {
                title: "Constraints Before Content",
                body: "The recipe selector sheet filters by meal type, diet preference, and shows budget impact before selection. This means the user is never browsing freely; they are always making a constrained decision. This is faster, less overwhelming, and produces better outcomes. It mirrors how a good friend would recommend a meal: 'Given your budget and what you like, try this.'",
              },
              {
                title: "The Pantry Unlocks Everything Else",
                body: "When the pantry became a first-class tab instead of a sidebar widget, the entire product transformed. The grocery list became intelligent (subtracting what you have). The budget became accurate (not counting items you already own). Expiry tracking prevented waste. One feature made three others meaningful.",
              },
              {
                title: "Compact Does Not Mean Compromised",
                body: "The daily nutrition card went through three size reductions. Each time, it looked better. The final version uses a 2x2 grid with tiny icons, small numbers, and minimal labels. It communicates more in less space. The lesson extended to meal cards, budget bars, and the day strip. Mobile density, when done right, feels focused rather than cramped.",
              },
            ].map((item, index) => (
              <div key={index} className="p-5 bg-muted/20 rounded-xl border border-border/50">
                <h3 className="text-foreground text-base mb-2">{item.title}</h3>
                <p className="text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </CaseStudySection>

        {/* ---- 10. UX FLOW ---- */}
        <CaseStudySection id="flow" label="10 - User Experience Flow" title="The Journey From First Open to Weekly Habit">
          <div className="space-y-4">
            {[
              {
                stage: "Initial Splash",
                description: "A 5-second branded loading screen with the Leaf icon and app name. Establishes identity and provides a moment of calm before the interface appears.",
              },
              {
                stage: "Authentication",
                description: "Clean sign-in/sign-up form with email and password. Rate-limited to 5 attempts per minute. Social login options for Google and Facebook. Password strength validation enforces uppercase, lowercase, numbers, and special characters.",
              },
              {
                stage: "Onboarding",
                description: "Three-screen carousel introducing core concepts: meal planning, smart grocery shopping, and healthy cooking. Pagination dots and a continue button guide the user through. Designed after studying splash screen patterns from food delivery apps.",
              },
              {
                stage: "Weekly Planning",
                description: "The core loop. User sees the current week, taps a day, taps a meal slot, selects a recipe from the bottom sheet, and the plan builds. Budget and nutrition update in real-time. The day strip provides at-a-glance status with dot indicators for planned meals.",
              },
              {
                stage: "Grocery Shopping",
                description: "Auto-generated list grouped by category (produce, meat, dairy, pantry, frozen). Each item shows quantity, unit, and estimated cost. Checkboxes track progress. Export to text or share via WhatsApp, SMS, or email.",
              },
              {
                stage: "Pantry Management",
                description: "Add items with autocomplete from the ingredient database. Track quantities, categories, and expiry dates. Low-stock alerts surface when items drop below threshold. Pantry data feeds into the grocery list subtraction logic.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] text-primary">{index + 1}</span>
                  </div>
                </div>
                <div className="pb-4 border-b border-border/50 last:border-0 flex-1">
                  <h3 className="text-foreground text-sm mb-1">{item.stage}</h3>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CaseStudySection>

        {/* ---- 11. LESSONS LEARNED ---- */}
        <CaseStudySection id="lessons" label="11 - Lessons Learned" title="What I Would Tell Myself at the Start">
          <div className="space-y-8">
            <div>
              <h3 className="text-foreground text-lg mb-4">On Design Process</h3>
              <div className="space-y-4">
                {[
                  {
                    bold: "The first screen is the product.",
                    rest: "Whatever the user sees first is what they believe the product does. Get the entry point wrong and no amount of feature depth will recover the first impression.",
                  },
                  {
                    bold: "Compact mobile design requires more skill, not less.",
                    rest: "It is easier to spread things out on a large canvas. Making information dense but readable on a 375px screen is a harder design problem than most desktop layouts.",
                  },
                  {
                    bold: "Every screen deserves the same attention.",
                    rest: "Settings pages, error states, empty states, and loading screens are all part of the experience. Neglecting them creates trust gaps that users feel even if they cannot articulate.",
                  },
                ].map((item, index) => (
                  <p key={index} className="text-sm">
                    <span className="text-foreground font-medium">{item.bold}</span>{" "}
                    {item.rest}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-foreground text-lg mb-4">On Product Thinking</h3>
              <div className="space-y-4">
                {[
                  {
                    bold: "Systems beat features.",
                    rest: "A pantry tracker alone is unremarkable. A pantry tracker that makes the grocery list smarter, the budget more accurate, and the meal suggestions more relevant is a system. Build systems, not feature lists.",
                  },
                  {
                    bold: "Constraints are the product.",
                    rest: "Budget limits, dietary restrictions, and pantry contents are not filters to apply after the fact. They are the starting point. The tool should begin with what limits the user, not what overwhelms them.",
                  },
                  {
                    bold: "Ship, then refine.",
                    rest: "Four design iterations happened because the product was shippable at each stage. Shipping early and refining based on real feedback produced a better product than waiting for perfection.",
                  },
                ].map((item, index) => (
                  <p key={index} className="text-sm">
                    <span className="text-foreground font-medium">{item.bold}</span>{" "}
                    {item.rest}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-foreground text-lg mb-4">On Technical Execution</h3>
              <div className="space-y-4">
                {[
                  {
                    bold: "Security is a feature, not a checkbox.",
                    rest: "Patching CVEs, adding CSP headers, implementing rate limiting, and preventing prototype pollution are not post-launch tasks. They are part of the product definition. Users trust products that respect their data.",
                  },
                  {
                    bold: "Test the first-run experience obsessively.",
                    rest: "Broken onboarding images taught me that the first 30 seconds determine whether a user stays. Every deployment should begin by testing the flow a new user experiences.",
                  },
                  {
                    bold: "Design tokens pay compound interest.",
                    rest: "Investing in a proper OKLCH color token system meant that changing the entire visual aesthetic was a one-file change. The upfront cost of systematic theming saved hours of per-component color adjustments.",
                  },
                ].map((item, index) => (
                  <p key={index} className="text-sm">
                    <span className="text-foreground font-medium">{item.bold}</span>{" "}
                    {item.rest}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CaseStudySection>

        {/* ---- CLOSING ---- */}
        <section className="border-t border-border pt-12">
          <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed text-balance italic">
            &quot;The best tools do not add complexity to your life. They absorb it. MealPlanner
            was designed to take the cognitive weight of feeding yourself well and make it feel
            effortless.&quot;
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm">MP</span>
            </div>
            <div>
              <p className="text-sm text-foreground">MealPlanner</p>
              <p className="text-xs text-muted-foreground">
                Plan Smart, Eat Well
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
