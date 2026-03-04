/**
 * projects.js
 * Complete data for all 7 portfolio projects.
 * Order: healthcare, meatinspector, trailar, vosyn, mealplanner, aurora, autonomous
 *
 * Each project has:
 *  - Legacy fields (used by full-page case study components)
 *  - hero, episodes, artefacts, info (used by ProjectOverlay Apple TV+ layout)
 */

const projects = [
  {
    "id": "healthcare",
    "title": "CareSummarizer + CareLens",
    "type": "Product Design & AI",
    "client": "Clinical Decision Intelligence",
    "org": "Healthcare AI · Utilization Review",
    "sub": "Clinical Decision-Readiness Platform",
    "timeline": "Sep 2024 – Feb 2025",
    "team": [
      "Solo"
    ],
    "platform": "React · Claude 4 Sonnet · Vercel",
    "icon": "🏥",
    "accentColor": "#2D6A9F",
    "route": "/healthcare",
    "status": "full",
    "liveUrl": null,
    "description": "A clinical decision intelligence platform that transforms raw EHR data into decision-ready cases, surfacing documentation gaps before denial, not after.",
    "contextStats": [
      {
        "number": "75%",
        "label": "Prep Time Saved",
        "context": "40 min → 8–12 min"
      },
      {
        "number": "40%",
        "label": "Denial Reduction",
        "context": "targeted below 5%"
      },
      {
        "number": "$2.5M",
        "label": "Revenue Protected",
        "context": "per hospital annually"
      }
    ],
    "users": [
      {
        "icon": "👩‍⚕️",
        "title": "UR Nurses",
        "description": "Prepare defensible prior auth cases. 70% of time spent on data archaeology across 8+ tools.",
        "tag": "Primary, 80% of volume"
      },
      {
        "icon": "👨‍⚕️",
        "title": "Physicians",
        "description": "Final approval on escalations. Currently re-read entire charts because prep is incomplete.",
        "tag": "Secondary, Escalations"
      },
      {
        "icon": "📊",
        "title": "Medical Directors",
        "description": "Ensure team consistency. Zero visibility into performance or audit trail.",
        "tag": "Tertiary, Oversight"
      }
    ],
    "problem": "UR nurses cross-reference 8 disconnected tools to prepare a single case.  Denial rates sit at 30 to 40%.",
    "objective": "Surface documentation gaps before PA submission. Replace manual cross-referencing with AI-synthesized narratives. Give nurses explainable AI they can trust and defend.",
    "insight": "The person who prepares the decision matters more than the person who approves it. UR nurses carry the accountability risk, yet they spend 70% of their time on data archaeology.",
    "reflectionQuote": "Compliance is differentiation, not overhead. Every HIPAA mandate and FDA explainability requirement is a competitive barrier that protects against fast-follower competitors.",
    "oldSystem": {
      "name": "Current State (Manual)",
      "traits": [
        "8+ disconnected tools per case",
        "Gaps discovered after submission",
        "Black box AI, no explainability",
        "No policy validation before submission",
        "No audit trail for payer disputes"
      ]
    },
    "newSystem": {
      "name": "CareSummarizer + CareLens",
      "traits": [
        "AI-synthesized clinical narrative from EHR",
        "Policy validation before submission",
        "CareLens: confidence scores + reasoning traces",
        "Hard blocks prevent submission when gaps exist",
        "Append-only audit trail (HIPAA + ONC compliant)"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Decision Readiness First",
        "description": "Every feature exists to prepare a defensible case, not to optimize speed."
      },
      {
        "number": "02",
        "title": "Explainability as Governance",
        "description": "CareLens is persistent, non-optional compliance infrastructure."
      },
      {
        "number": "03",
        "title": "Copilot, Not Autopilot",
        "description": "AI suggests and explains. Humans review and decide. Always."
      },
      {
        "number": "04",
        "title": "Structural Prevention",
        "description": "Hard blocks, not soft nudges. Red items prevent submission until resolved."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Discover",
        "title": "Product Category Research",
        "description": "Interrogated 4 structural ambiguities to define the product wedge: prior authorization preparation only."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "User + Accountability Mapping",
        "description": "Identified UR nurses (not physicians) as primary users via accountability risk analysis."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "4 Iterative Versions",
        "description": "Three rejected versions taught what the product needed to be before V04 reached current architecture."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Design System Audit",
        "description": "Structured audit: 2 P0 issues, 39 non-compliant files, 20% token adoption, remediated with CLAUDE.md enforcement."
      }
    ],
    "challenges": [
      {
        "category": "Regulatory",
        "items": [
          "FDA explainability mandates",
          "HIPAA append-only audit trail",
          "WCAG 2.2 accessibility in clinical context"
        ]
      },
      {
        "category": "AI Trust",
        "items": [
          "Copilot vs autopilot model",
          "Confidence scoring that nurses can defend",
          "Reasoning traces at every AI output"
        ]
      },
      {
        "category": "Design System",
        "items": [
          "3 competing color systems",
          "39 files bypassing tokens",
          "AI generating styling errors silently"
        ]
      }
    ],
    "results": [
      {
        "label": "Case Prep Time",
        "before": "40 min",
        "after": "8–12 min",
        "improvement": "75% faster",
        "icon": "⏱️"
      },
      {
        "label": "Denial Rate",
        "before": "30–40%",
        "after": "<5%",
        "improvement": "40% reduction",
        "icon": "📉"
      },
      {
        "label": "Nurse Throughput",
        "before": "8–12 cases",
        "after": "20–25 cases",
        "improvement": "2× increase",
        "icon": "📈"
      }
    ],
    "problemBullets": [
      {
        "keyword": "Fragmented",
        "text": "8+ tools to prepare a single case"
      },
      {
        "keyword": "Too late",
        "text": "Gaps discovered after denial, not before submission"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Surface gaps",
        "text": "Before PA submission, when they can still be fixed"
      },
      {
        "keyword": "Explainable AI",
        "text": "Confidence scores + reasoning traces nurses can defend"
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Discover",
        "label": "Product Ambiguity Resolution",
        "hint": "4 structural ambiguities · product wedge definition",
        "pills": null
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "User Accountability Mapping",
        "hint": "UR nurse as primary · accountability risk signal",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "4 Iterative Versions",
        "hint": "V01–V03 rejected · V04 current architecture",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Design System Audit",
        "hint": "CLAUDE.md enforcement · token remediation",
        "pills": null
      }
    ],
    "challengePairs": [
      {
        "challenge": "FDA mandates explainability for clinical AI",
        "response": "CareLens: reasoning traces + citations at every output"
      },
      {
        "challenge": "3 competing color systems in codebase",
        "response": "Unified token file + CLAUDE.md AI enforcement"
      },
      {
        "challenge": "Physicians assumed to be primary user",
        "response": "Reoriented to UR nurses via accountability risk analysis"
      },
      {
        "challenge": "Black box AI creates legal liability",
        "response": "Copilot model: AI suggests, humans always decide"
      },
      {
        "challenge": "Soft warnings get ignored by busy nurses",
        "response": "Hard blocks prevent submission until gaps resolved"
      }
    ],
    "reflection": "This project taught me that ambiguity is not a problem to avoid, it is a signal to refine product definition.",
    "ia": "SITUATION\nHealthcare utilization review runs on 8 disconnected tools.\nUR nurses spend 40 minutes per case on data archaeology.\nDenial rates sit at 30 to 40%. Gaps found after submission, not before.\n\nUSERS\nPrimary: UR Nurse — 80% of volume, full accountability risk\nSecondary: Physician — escalations only, under 20% of cases\nTertiary: Medical Director — audit and oversight, under 5%\n\nPROBLEM\nThe toolchain was designed around physicians.\nThe people carrying the most risk had the worst tools.\nData existed. Decision readiness did not.\n\nCONSTRAINTS\nRegulated clinical environment — AI cannot make autonomous decisions\nEvery recommendation must be traceable and citable\nHIPAA compliance non-negotiable\nStakeholder trust in AI was low from day one\n\nPROCESS\n4 structural ambiguities resolved before wireframing\nPrimary user redefined from physician to UR nurse in week 4\n6 design mistakes documented across V1 and V2\n4 full iterations before V4 was accepted\n\nKEY DECISIONS\nWork Queue over Home screen — action-first product stance\nCareLens as mandatory sidebar — explainability is infrastructure\nAudit trail on every AI output — defensibility over convenience\nProactive gap resolution — surface problems before submission not after\n\nTHE PRODUCT\n7-stage workflow: Work Queue, Case Summary, Policy Validation,\nCareLens Sidebar, Gap Resolution, Physician Approval, Submission\nRole-based routing for nurse, physician, and director\nEvery AI output citable, every decision logged\n\nOUTCOME\n75% reduction in case prep time\n40% target denial rate reduction\n108% throughput increase per nurse\n$2.5M annual revenue protection per hospital",
    "heroColor": "#1a3a5c",
    "heroTagline": "Reducing denial rates from 40% to under 5%",
    "heroCategory": "AI · Healthcare",
    "heroYear": "2024",
    "previewMedia": "/projects/healthcare/Healthcare Dashboard_1.png",
    "previewImageTop": 230,
    "heroImage": "/projects/healthcare/Dashboard-1.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)",
      "light": true,
      "badge": "Case Study · Healthcare AI",
      "tags": [
        "Healthcare AI",
        "2024",
        "Claude Code + Figma + Vercel"
      ],
      "synopsis": "A clinical decision intelligence platform that transforms raw EHR data into decision-ready cases, surfacing documentation gaps before denial, not after.",
      "metadata": [
        "Sep 2024 – Feb 2025",
        "Product Designer & Engineer",
        "Solo"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Problem",
        "teaser": "UR nurses spend 40 or more minutes per case doing data archaeology across 8 or more tools.  The data exists.  The decisi.",
        "readTime": "4 min",
        "diagramKey": "problem",
        "content": [
          {
            "type": "p",
            "text": "UR nurses spend 40 or more minutes per case doing data archaeology across 8 or more tools.  The data exists.  The decisions do not."
          },
          {
            "type": "p",
            "text": "Three user roles exist in the utilization review workflow.  UR Nurses are the primary user, handling 80% of volume and carrying full accountability risk.  Physicians handle escalations only, under 20% of cases."
          }
        ]
      },
      {
        "ep": "02",
        "title": "The Ambiguity",
        "teaser": "Four structural ambiguities had to be resolved before a single wireframe was drawn.  Each one required a different kind.",
        "readTime": "4 min",
        "diagramKey": "ambiguity",
        "content": [
          {
            "type": "p",
            "text": "Four structural ambiguities had to be resolved before a single wireframe was drawn.  Each one required a different kind of thinking."
          },
          {
            "type": "p",
            "text": "First: who is the primary user?  The initial assumption was physician-led.  Research revealed UR nurses do 80% of the work and carry full accountability."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Six Mistakes",
        "teaser": "I built the wrong thing twice.  Here are all six mistakes and what each one taught me. Mistake one: assumed the physicia.",
        "readTime": "4 min",
        "diagramKey": "mistakes",
        "content": [
          {
            "type": "p",
            "text": "I built the wrong thing twice.  Here are all six mistakes and what each one taught me."
          },
          {
            "type": "p",
            "text": "Mistake one: assumed the physician was the primary user.  Spent three weeks designing a physician-centric approval flow.  Research in week four revealed UR nurses do 80% of the work."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Design Evolution",
        "teaser": "Four iterations.  Three rejections.  Here is why each version failed and what unlocked the final direction. V1 was physi.",
        "readTime": "4 min",
        "diagramKey": "evolution",
        "content": [
          {
            "type": "p",
            "text": "Four iterations.  Three rejections.  Here is why each version failed and what unlocked the final direction."
          },
          {
            "type": "p",
            "text": "V1 was physician-centric, organized around approval stages.  Rejected because it was designed for the wrong user.  UR nurses could not find their work queue."
          }
        ]
      },
      {
        "ep": "06",
        "title": "The Product",
        "teaser": "Seven stages.  One clear handoff at every step. Stage one is the Work Queue: prioritized by denial risk, time sensitivit.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Seven stages.  One clear handoff at every step."
          },
          {
            "type": "p",
            "text": "Stage one is the Work Queue: prioritized by denial risk, time sensitivity, and documentation completeness.  Nurses arrive knowing exactly what to do next.  No triage required."
          }
        ]
      },
      {
        "ep": "07",
        "title": "The Impact",
        "teaser": "75% reduction in case preparation time.  40 minutes to 8 to 12 minutes per case.  This comes directly from CareSummarize.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "75% reduction in case preparation time.  40 minutes to 8 to 12 minutes per case.  This comes directly from CareSummarizer auto-generating the clinical narrative, policy validation surfacing gaps proactively, and AI-drafted justification text in the resolution modal."
          },
          {
            "type": "p",
            "text": "40% target reduction in denial rate.  Current denial rates sit at 30 to 40%.  Target: below 5%."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Figma File",
        "type": "Design",
        "url": null
      },
      {
        "title": "Live Demo",
        "type": "Demo",
        "url": null
      },
      {
        "title": "Design System Doc",
        "type": "Document",
        "url": null
      },
      {
        "title": "Process Story",
        "type": "Article",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "Sep 2024 – Feb 2025"
        },
        {
          "label": "Role",
          "value": "Product Designer & Engineer"
        },
        {
          "label": "Team",
          "value": "Solo"
        },
        {
          "label": "Platform",
          "value": "React · Claude 4 Sonnet · Vercel"
        },
        {
          "label": "Status",
          "value": "Portfolio & Demo Ready"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma, Claude Code MCP"
        },
        {
          "label": "Development",
          "value": "React, Tailwind, Vercel"
        },
        {
          "label": "AI",
          "value": "Claude 4 Sonnet (Anthropic)"
        }
      ],
      "links": [
        {
          "label": "Figma File",
          "url": null
        },
        {
          "label": "Live Demo",
          "url": null
        }
      ]
    }
  },
  {
    "id": "meatinspector",
    "title": "Salesforce Meat Inspection Scheduler",
    "type": "Product Design",
    "client": "Ontario Public Service",
    "org": "Ministry of Agriculture & Rural Affairs",
    "sub": "Scheduling Platform Redesign",
    "timeline": "Sep 2023 – Apr 2024",
    "team": [
      "Salesforce Architect & Developers",
      "Product Manager",
      "Business Analysts"
    ],
    "platform": "Salesforce Field Service Lightning",
    "icon": "📋",
    "accentColor": "#2E6DB4",
    "route": "/meatinspector",
    "status": "full",
    "liveUrl": null,
    "description": "Replaced a legacy Siebel scheduling system used by 600 Ontario meat inspectors with a human-centred Salesforce FSL platform, faster, more reliable, and built for real-world exceptions.",
    "contextStats": [
      {
        "number": "600+",
        "label": "Inspectors",
        "context": "across Ontario"
      },
      {
        "number": "5",
        "label": "Districts",
        "context": "province-wide"
      },
      {
        "number": "1",
        "label": "Legacy system",
        "context": "replaced"
      }
    ],
    "users": [
      {
        "icon": "🗂️",
        "title": "Area Managers",
        "description": "Oversee scheduling coverage and compliance.",
        "tag": "Oversee Compliance"
      },
      {
        "icon": "📅",
        "title": "Area Coordinators",
        "description": "Manage day-to-day schedules and shift exceptions.",
        "tag": "Manage Schedules"
      },
      {
        "icon": "🔍",
        "title": "Meat Inspectors",
        "description": "Execute daily inspections at assigned facilities via mobile.",
        "tag": "Execute Inspections"
      }
    ],
    "problem": "A single schedule change took 40 minutes.  Not because the work was complex, but because the tool was designed for the system, not the person doing the work.",
    "problemBullets": [
      {
        "keyword": "Rigid",
        "text": "No support for part-day shifts or emergency overrides"
      },
      {
        "keyword": "Slow",
        "text": "A single schedule change took up to 40 minutes"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Replace",
        "text": "Siebel with a flexible, real-time scheduling platform"
      },
      {
        "keyword": "Empower",
        "text": "Managers with override controls and live coverage visibility"
      }
    ],
    "objective": "Redesign a scalable, human-centered solution in Salesforce FSL that makes complex scheduling fast, reliable, and transparent, with managers on desktop and inspectors on mobile.",
    "solution": "Redesigned a scalable, human-centered solution in Salesforce FSL that made complex scheduling fast, reliable, and transparent. Managers on desktop, inspectors on mobile.",
    "insight": "600+ inspectors. 5 districts. One inflexible system. Scheduling a single shift change took up to 40 minutes, not because of complexity, but because the tool was designed for the system, not the person.",
    "reflectionQuote": "Good design does not replace human judgment, it empowers it.",
    "oldSystem": {
      "name": "Siebel (Legacy)",
      "traits": [
        "Manual data entry across multiple screens",
        "No real-time conflict detection",
        "Rigid part-day scheduling",
        "No mobile access for inspectors",
        "Bulk operations not supported"
      ]
    },
    "newSystem": {
      "name": "Salesforce FSL",
      "traits": [
        "Drag-and-drop scheduling with smart suggestions",
        "Real-time conflict and coverage alerts",
        "Flexible part-day and trainee logic",
        "Full-featured mobile app for field inspectors",
        "Bulk shift creation and reassignment"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Human Control First",
        "description": "Automation as a suggestion, never a mandate."
      },
      {
        "number": "02",
        "title": "Real-Time Clarity",
        "description": "Everyone sees the same live state, no lag."
      },
      {
        "number": "03",
        "title": "Built for Exceptions",
        "description": "Emergencies and part-day shifts are first-class, not workarounds."
      },
      {
        "number": "04",
        "title": "Minimize Manual Load",
        "description": "Bulk ops, smart defaults, and intelligent prefilling."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Discover",
        "title": "Stakeholder Research",
        "description": "12–13 stakeholder interviews across all user roles to map existing pain points, mental models, and edge cases."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "Problem Framing",
        "description": "Synthesized research into a prioritized opportunity map. Defined scheduling scenarios ranging from standard to emergency same-day replacements."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "Low-Fi Wireframes",
        "description": "Created low-fidelity wireframes for key scheduling flows and ran stakeholder walkthroughs to validate logic before high-fidelity UI."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Usability Testing & Rollout",
        "description": "Conducted usability testing V1 with real inspectors. Progressive rollout across 2 pilot regions with weekly UAT sessions."
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Discover",
        "label": "Stakeholder Research",
        "hint": "12 interviews · service blueprints · journey mapping",
        "pills": [
          {
            "count": "5",
            "label": "Inspectors"
          },
          {
            "count": "4",
            "label": "Coordinators"
          },
          {
            "count": "3",
            "label": "Managers"
          }
        ]
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "Problem Framing",
        "hint": "Opportunity map · scheduling scenarios · edge case inventory",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "Low-Fi Wireframes",
        "hint": "Key flows · stakeholder walkthroughs · logic validation",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Usability Testing",
        "hint": "2 pilot regions · weekly UAT · continuous backlog triage",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "What Didn't Work",
        "items": [
          "Siebel legacy data model resisted flexible part-day and trainee logic",
          "AM/ACs were wary of automation after years of manual control",
          "Edge-case overload slowed early adoption in pilot regions"
        ]
      },
      {
        "category": "How We Responded",
        "items": [
          "Migrated to Salesforce FSL for skills-based routing",
          "Guardrailed automation with manual overrides and clear audit trails",
          "Progressive rollout starting with 2 pilot regions"
        ]
      },
      {
        "category": "What Worked",
        "items": [
          "Weekly UAT sessions kept inspectors invested",
          "Design pillars gave the team a shared decision-making framework",
          "Splitting the interface: desktop for managers, mobile for inspectors"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "Legacy data model resisted part-day logic",
        "response": "Migrated to Salesforce FSL"
      },
      {
        "challenge": "Users wary of automation after manual control",
        "response": "Guardrailed with clear manual overrides"
      },
      {
        "challenge": "Edge cases slowed pilot adoption",
        "response": "Progressive 2-region rollout first"
      },
      {
        "challenge": "No mobile access in legacy system",
        "response": "Full FSL mobile app for field inspectors"
      },
      {
        "challenge": "Bulk scheduling was not supported",
        "response": "Batch shift creation built as core feature"
      }
    ],
    "results": [
      {
        "label": "Scheduling Time",
        "before": "30 min",
        "after": "2 min",
        "improvement": "93% faster",
        "icon": "⏱️"
      },
      {
        "label": "Emergency Response",
        "before": "40 min",
        "after": "5 min",
        "improvement": "80% faster",
        "icon": "🚨"
      },
      {
        "label": "Daily Errors",
        "before": "5 / day",
        "after": "2 / day",
        "improvement": "60% fewer",
        "icon": "✅"
      }
    ],
    "reflection": "Designing within a government ecosystem taught me that impact goes far beyond improving interfaces. Good design does not replace human judgment, it empowers it.",
    "ia": "SITUATION\n600 Ontario meat inspectors. 5 districts.\nLegacy Siebel system unchanged for over a decade.\nSingle schedule change took 40 minutes.\n\nUSERS\nPrimary: Area Coordinators — daily shift management\nSecondary: Area Managers — district coverage oversight\nTertiary: Meat Inspectors — field execution, no mobile access\n\nPROBLEM\nTool designed for the system, not the person using it.\nNo exception handling. No mobile access. No real-time conflict detection.\nInspectors running shadow workarounds management did not know about.\n\nCONSTRAINTS\nGovernment procurement — FSL licenses already purchased\nAODA compliance required under Ontario law\nMultiple approval chains before any design decision\nSalesforce FSL defaults could not be changed without documented justification\n\nPROCESS\n12 stakeholder interviews across 3 roles\nService blueprinting revealed gap between official and actual schedules\n6 FSL components required custom AODA-compliant overrides\nField testing in slaughterhouse environments\n\nKEY DECISIONS\nMobile-first for field inspectors — single task screens, 48px tap targets\nTreat FSL constraints as creative input not blockers\nDocument every custom component with accessibility rationale\nOffline capability non-negotiable for low-signal facilities\n\nTHE PRODUCT\nDesktop scheduling tool for coordinators and managers\nMobile field app for inspectors\nEmergency override workflow bypassing normal routing\nBulk shift creation across multiple facilities\nReal-time conflict detection\n\nOUTCOME\n93% faster scheduling\n80% faster emergency response\nInspectors described it as the first system built for them",
    "heroColor": "#0a2744",
    "heroTagline": "A schedule change from 40 minutes to 3",
    "heroCategory": "Enterprise · Government",
    "heroYear": "2024",
    "previewMedia": "/projects/meatinspector/Dashboard.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)",
      "light": true,
      "badge": "Case Study · Enterprise Gov",
      "tags": [
        "Enterprise Gov",
        "2023–2024",
        "Salesforce FSL + Figma"
      ],
      "synopsis": "Replaced a legacy Siebel scheduling system used by 600 Ontario meat inspectors with a human-centred Salesforce FSL platform, faster, more reliable, and built for real-world exceptions.",
      "metadata": [
        "Sep 2023 – Apr 2024",
        "Product Designer",
        "OPS · 3 Devs · 1 PM"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Legacy Problem",
        "teaser": "600 inspectors.  5 districts.  One system so rigid that scheduling a single shift change took up to 40 minutes. What the.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "600 inspectors.  5 districts.  One system so rigid that scheduling a single shift change took up to 40 minutes."
          },
          {
            "type": "p",
            "text": "What the system could not do: no support for part-day shifts or emergency overrides.  No real-time conflict detection.  No mobile access for field inspectors."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Stakeholder Complexity",
        "teaser": "12 interviews across 3 roles over the first six weeks.  Government clients do not have users, they have constituents, b.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "12 interviews across 3 roles over the first six weeks.  Government clients do not have users, they have constituents, bureaucracies, and procurement cycles.  Designing for all three simultaneously is its own discipline."
          },
          {
            "type": "p",
            "text": "Government design constraints shaped every decision: AODA compliance requirements under the Accessibility for Ontarians with Disabilities Act, procurement timelines that governed what could be built versus configured, and approval chains requiring sign-off at multiple levels before any design decision could be acted on."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Salesforce FSL Constraints",
        "teaser": "Designing within a platform is harder than designing from scratch.  Every decision required negotiating with what Salesf.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Designing within a platform is harder than designing from scratch.  Every decision required negotiating with what Salesforce Field Service Lightning would and would not allow.  The constraint was real and non-negotiable, the client had already purchased FSL licenses and the procurement decision was final."
          },
          {
            "type": "p",
            "text": "What FSL gave us for free: appointment scheduling, resource management, service territory mapping, work order lifecycle, and mobile field service app.  These covered roughly 60% of the requirements without custom development."
          }
        ]
      },
      {
        "ep": "04",
        "title": "The Mobile Experience",
        "teaser": "Field inspectors do not sit at desks.  They work in slaughterhouses, processing facilities, and cold storage environment.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Field inspectors do not sit at desks.  They work in slaughterhouses, processing facilities, and cold storage environments.  Designing for people in gloves, on the move, in environments with variable signal required a completely different interface philosophy from the desktop scheduling tool."
          },
          {
            "type": "p",
            "text": "Five mobile design decisions defined the field experience.  Single-task screens with one action per view and no multi-step forms, inspectors do not have the cognitive bandwidth for complex flows mid-shift.  Large tap targets at minimum 48 by 48 pixels for gloved use."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Accessibility and Governance",
        "teaser": "Government products carry the weight of public trust.  Accessibility and consistency are not nice-to-haves in this conte.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Government products carry the weight of public trust.  Accessibility and consistency are not nice-to-haves in this context, they are legal obligations under AODA and moral obligations to the 600 people whose working lives depended on this tool."
          },
          {
            "type": "p",
            "text": "Where FSL fell short of requirements: several default Salesforce components had contrast ratios below the 4. 5:1 minimum required by WCAG 2. 1 AA."
          }
        ]
      },
      {
        "ep": "06",
        "title": "The Outcomes",
        "teaser": "93% faster scheduling.  A process that took 40 minutes now takes under 3 minutes for standard shift changes.  Emergency.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "93% faster scheduling.  A process that took 40 minutes now takes under 3 minutes for standard shift changes.  Emergency override workflows that previously required phone calls and manual system entry now complete in under 5 minutes with automatic conflict detection."
          },
          {
            "type": "p",
            "text": "80% faster emergency response time.  When an inspector calls in sick or a facility has an unplanned closure, coordinators can now reassign coverage in real time with visibility into who is available, where they are, and what qualifications they hold.  Previously this was done by phone through a contact list."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Salesforce Component Library",
        "type": "Design System",
        "url": null
      },
      {
        "title": "Research Report",
        "type": "Research",
        "url": null
      },
      {
        "title": "Service Blueprint",
        "type": "Document",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "Sep 2023 – Apr 2024"
        },
        {
          "label": "Role",
          "value": "Product Designer"
        },
        {
          "label": "Team",
          "value": "OPS · Salesforce Architects · 3 Devs · 1 PM"
        },
        {
          "label": "Platform",
          "value": "Salesforce Field Service Lightning"
        },
        {
          "label": "Status",
          "value": "Delivered"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Platform",
          "value": "Salesforce FSL"
        },
        {
          "label": "Research",
          "value": "Interviews, Service Blueprinting, Journey Mapping"
        }
      ],
      "links": [
        {
          "label": "Case Study",
          "url": null
        }
      ]
    }
  },
  {
    "id": "trailar",
    "title": "SCHT Trail AR App",
    "type": "Product Design & User Research",
    "client": "Spencer Creek Historical Trail",
    "org": "McMaster University × Rotary Club of Dundas",
    "sub": "AR Heritage Experience",
    "timeline": "Jan – Aug 2023",
    "team": [
      "Faculty Mentor (McMaster)",
      "2 UX Designers",
      "Community Stakeholders"
    ],
    "platform": "AR + Mobile App",
    "icon": "🌿",
    "accentColor": "#2D6A45",
    "route": "/trailar",
    "status": "full",
    "liveUrl": null,
    "description": "A digital experience designed to revive the Spencer Creek Historical Trail, reconnecting fragmented sections, restoring cultural memory, and creating meaningful AR interactions that bring Dundas's history back to life.",
    "contextStats": [
      {
        "number": "3.4 mi",
        "label": "Trail Length",
        "context": "Dundas, Ontario"
      },
      {
        "number": "7 mo",
        "label": "Research & Design",
        "context": "Jan – Aug 2023"
      },
      {
        "number": "3",
        "label": "Community Partners",
        "context": "McMaster · Rotary · Museum"
      }
    ],
    "users": [
      {
        "icon": "🧓",
        "title": "Long-time Residents",
        "description": "Deep emotional connection to the trail. Nostalgia for its former connectivity and heritage landmarks.",
        "tag": "Primary"
      },
      {
        "icon": "👨‍👩‍👧",
        "title": "Families & Visitors",
        "description": "Seek accessible, guided outdoor experiences with meaningful context beyond navigation.",
        "tag": "Primary"
      },
      {
        "icon": "🎓",
        "title": "Students & Educators",
        "description": "Interested in ecology and local history for outdoor learning programs.",
        "tag": "Secondary"
      }
    ],
    "problem": "Spencer Creek Trail is physically fragmented and its rich history is slowly being forgotten.  The community has become disconnected from a space that once carried shared memories, stories, and a sense of place.",
    "objective": "Design a digital experience that reconnects the trail while restoring its historical and cultural meaning, so every visitor can explore with a deeper sense of context, belonging, and discovery.",
    "insight": "The trail's disconnection was as much cultural as physical. People weren't losing a path, they were losing a story.",
    "reflectionQuote": "The digital layer is not the destination. The trail is.",
    "oldSystem": {
      "name": "No Digital Layer",
      "traits": [
        "Fragmented trail with no unified map",
        "Historical stories undiscovered or forgotten",
        "No way to identify local wildlife or ecology",
        "Events and vendors invisible to trail users",
        "No emergency safety feature on trail"
      ]
    },
    "newSystem": {
      "name": "SCHT AR App",
      "traits": [
        "Interactive trail map with connected segments",
        "AR Story Stops: heritage points overlaid on landscape",
        "Eco Discovery Mode: wildlife identification + gamification",
        "Community Events & Local Vendor integration",
        "Emergency Beacon: one-tap safety feature"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Place Over Technology",
        "description": "The app enhances the trail experience, it never competes with it."
      },
      {
        "number": "02",
        "title": "Emotional Connection First",
        "description": "Community memory and cultural pride drive every feature decision."
      },
      {
        "number": "03",
        "title": "Accessible by Design",
        "description": "Built for families, seniors, and first-time visitors as much as regulars."
      },
      {
        "number": "04",
        "title": "Community-Owned",
        "description": "Residents contribute stories and events, not just consume them."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Discover",
        "title": "Field Research & Trail Walks",
        "description": "Walked all trail sections documenting condition, usage patterns, and ecology. Supplemented by Dundas Museum archives and Facebook community sentiment."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "Primary Research & Stakeholder Interviews",
        "description": "Interviewed historians and curators from the Dundas Museum. Joined guided walks to understand historical significance."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "Co-creation Workshops",
        "description": "Ran workshops with the Rotary Club, city partners, and trail users. Synthesized findings into four core opportunity areas."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Iteration & Usability Testing",
        "description": "Shared wireframes with community members and partners. Refined map visibility, AR marker placement, and accessibility contrast."
      }
    ],
    "processSteps": [
      {
        "icon": "🚶",
        "phase": "Discover",
        "label": "Field Research & Trail Walks",
        "hint": "Observation · museum archives · Facebook sentiment",
        "pills": null
      },
      {
        "icon": "🏛️",
        "phase": "Define",
        "label": "Stakeholder Interviews",
        "hint": "Museum historians · Rotary Club · City of Hamilton",
        "pills": null
      },
      {
        "icon": "🤝",
        "phase": "Design",
        "label": "Co-creation Workshops",
        "hint": "4 opportunity areas · service blueprinting",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Usability Testing",
        "hint": "Wireframe rounds · accessibility · AR marker tuning",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "Technical",
        "items": [
          "AR marker placement in varied outdoor lighting",
          "GPS accuracy on dense tree-covered trail sections",
          "Offline functionality for areas with poor signal"
        ]
      },
      {
        "category": "Community",
        "items": [
          "Balancing digital engagement with natural immersion",
          "Ensuring accessibility for elderly and mobility-impaired users",
          "Multilingual support for non-English-speaking visitors"
        ]
      },
      {
        "category": "Scope",
        "items": [
          "Managing a diverse stakeholder group with competing priorities",
          "Preserving story integrity while making content digestible",
          "Designing for seasonal trail variations"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "No unified trail map or starting point",
        "response": "Interactive trail map with connected segments"
      },
      {
        "challenge": "Heritage stories invisible to visitors",
        "response": "AR Story Stops overlay history on landscape"
      },
      {
        "challenge": "Wildlife and ecology unknown to trail users",
        "response": "Eco Discovery Mode with gamification"
      },
      {
        "challenge": "Trail disconnected from town life",
        "response": "Community Events & Local Vendor hub"
      },
      {
        "challenge": "No safety feature on remote sections",
        "response": "Emergency Beacon: one-tap safety"
      }
    ],
    "results": [
      {
        "label": "Opportunity Areas",
        "before": "0 digital features",
        "after": "4",
        "improvement": "New product",
        "icon": "📍"
      },
      {
        "label": "User Groups Served",
        "before": "None addressed",
        "after": "3",
        "improvement": "Full coverage",
        "icon": "👥"
      },
      {
        "label": "Research Methods",
        "before": "n/a",
        "after": "6+",
        "improvement": "Mixed methods",
        "icon": "🔍"
      }
    ],
    "problemBullets": [
      {
        "keyword": "Fragmented",
        "text": "Trail has no unified map or starting point"
      },
      {
        "keyword": "Forgotten",
        "text": "Heritage stories undiscovered and fading from memory"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Reconnect",
        "text": "Physical and cultural trail experience through a single app"
      },
      {
        "keyword": "AR layer",
        "text": "Bring history, ecology, and community to life on the trail"
      }
    ],
    "reflection": "This project taught me that designing for outdoor spaces requires understanding history, ecology, community pride, and the emotional role a place holds over time.",
    "ia": "SITUATION\nSpencer Creek Historical Trail — 2.5km in Dundas, Ontario.\nPhysically fragmented. Almost no digital presence.\nRich history invisible to anyone who did not already know it.\n\nUSERS\nPrimary: First-time visitors — no context, no discovery tools\nSecondary: Long-time residents — deep emotional connection, no way to share it\nTertiary: Rotary Club and City of Hamilton — community stewardship goals\n\nPROBLEM\nGoogle Maps gets you to the trail.\nIt cannot tell you the bridge was built by Dundas's first settlers.\nDisconnection was cultural as much as physical.\nPeople were not losing a path. They were losing a story.\n\nCONSTRAINTS\nOutdoor UX is hostile — glare, gloves, variable signal, distracted attention\nAR calibration across 3 terrain types: open meadow, dense forest, riverbank\nThe digital layer must not compete with the trail experience\nBudget and timeline ruled out full AR recreation of lost sections\n\nPROCESS\n7 months of research\nWalked every section multiple times across seasons\nInterviewed Dundas Museum historians\nWorkshops with Sunrise Rotary Club stakeholders\nPokemon Go used as reference model for location-based discovery\nField usability testing in January\n\nKEY DECISIONS\nAR for discovery not navigation — the trail is the destination\nOne-handed interaction throughout — users are moving\nOffline fallback for forested signal-dead sections\nEmergency beacon reduced from two taps to one\nAudio over text at historical markers — feels like discovery not Wikipedia\n\nTHE PRODUCT\nAR historical overlay at GPS-triggered locations\nInteractive trail map with points of interest\nCommunity events and local vendor integration\nRewards and challenges tied to distance and discovery\nWildlife AR identification at creek sections\n\nOUTCOME\nField-tested across multiple seasons\nRotary Club and City of Hamilton stakeholder sign-off\nOffline mode supported full 3.4 mile trail",
    "heroColor": "#1a3324",
    "heroTagline": "Bringing Dundas history back to life",
    "heroCategory": "AR · Community",
    "heroYear": "2023",
    "previewMedia": "/projects/trailar/Home (Bezel).png",
    "hero": {
      "gradient": "linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 100%)",
      "light": true,
      "badge": "Case Study · Augmented Reality",
      "tags": [
        "AR + Mobile",
        "2023",
        "McMaster × Rotary Club"
      ],
      "synopsis": "A digital experience designed to revive the Spencer Creek Historical Trail, reconnecting fragmented sections, restoring cultural memory, and creating meaningful AR interactions that bring Dundas's history back to life.",
      "metadata": [
        "Jan – Aug 2023",
        "UX Designer & Researcher",
        "McMaster + Rotary"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Problem with Existing Trail Apps",
        "teaser": "Google Maps gets you to the trail.  It cannot tell you that the oak tree on your left is 200 years old, or that the lime.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Google Maps gets you to the trail.  It cannot tell you that the oak tree on your left is 200 years old, or that the limestone bridge ahead was built by Dundas's first settlers, or that the industrial ruins along the creek edge were once the economic engine of an entire town."
          },
          {
            "type": "p",
            "text": "The Spencer Creek Historical Trail is a 2. 5 km trail in the heart of Dundas, Ontario, one of the most historically significant communities in the Hamilton area.  It runs past the sites of 19th century mills, along the same waterway that powered early industry, through land that holds Indigenous history, settler history, and industrial history layered on top of each other."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Field Research and Community Listening",
        "teaser": "Seven months of research.  You cannot design a community trail experience from a laptop.  We walked every section of the.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Seven months of research.  You cannot design a community trail experience from a laptop.  We walked every section of the trail, multiple times, in different seasons."
          },
          {
            "type": "p",
            "text": "The research revealed a consistent pattern: long-time residents had a deep emotional connection to specific landmarks that had no digital presence at all.  The old Desjardins Canal locks.  The site of the former Dundas Valley railway station."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Designing for Outdoor Environments",
        "teaser": "Outdoor UX is hostile UX.  Sunlight on screens.  Gloved or cold hands. Every design decision was evaluated against one q.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Outdoor UX is hostile UX.  Sunlight on screens.  Gloved or cold hands."
          },
          {
            "type": "p",
            "text": "Every design decision was evaluated against one question: does this make the trail experience richer, or does it distract from it?  The digital layer is not the destination.  The trail is."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Four Feature Areas",
        "teaser": "Four opportunities emerged from the research synthesis.  Each addressed a different dimension of what the trail had lost.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Four opportunities emerged from the research synthesis.  Each addressed a different dimension of what the trail had lost."
          },
          {
            "type": "p",
            "text": "First: AR historical overlay.  At designated points along the trail, the camera view reveals what used to stand there.  The ruins of a 19th century mill become visible as a functioning building."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Testing in the Field",
        "teaser": "Usability testing in a lab tells you one thing.  Testing on a trail in January tells you another.  We conducted field us.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Usability testing in a lab tells you one thing.  Testing on a trail in January tells you another.  We conducted field usability testing in multiple conditions, summer, autumn, and winter, because the experience had to work year-round."
          },
          {
            "type": "p",
            "text": "Key refinements from field testing: simplified map interaction for one-handed use while walking, because users could not manage two-handed gestures on the move.  Increased AR trigger zone sizes significantly, users could not hold phones steady enough for small targets while walking, and camera shake caused markers to flicker.  Added offline mode fallback for when signal dropped in the forested sections near the creek."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Research Report",
        "type": "Research",
        "url": null
      },
      {
        "title": "AR Marker Map",
        "type": "Document",
        "url": null
      },
      {
        "title": "Community Workshop Deck",
        "type": "Presentation",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "Jan – Aug 2023"
        },
        {
          "label": "Role",
          "value": "UX Designer & Researcher"
        },
        {
          "label": "Team",
          "value": "McMaster Faculty + 2 UX Designers + Community Stakeholders"
        },
        {
          "label": "Platform",
          "value": "AR Mobile App"
        },
        {
          "label": "Status",
          "value": "Research & Prototype Complete"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Research",
          "value": "Field Interviews, Co-creation Workshops, Archive Review"
        },
        {
          "label": "AR",
          "value": "AR Foundation (prototype)"
        }
      ],
      "links": [
        {
          "label": "Research Report",
          "url": null
        }
      ]
    }
  },
  {
    "id": "vosyn",
    "title": "VosynVerse",
    "type": "Product Design",
    "client": "Vosyn AI",
    "org": "Multilingual Media Platform",
    "sub": "Multilingual AI Content Platform",
    "timeline": "2024",
    "team": [
      "Vosyn AI Team"
    ],
    "platform": "Web + Mobile",
    "icon": "🎙️",
    "accentColor": "#7C4DCC",
    "route": "/vosyn",
    "status": "placeholder",
    "liveUrl": null,
    "description": "A multilingual AI content platform designed to break language barriers, so creators and audiences can engage with content in any language without losing meaning, tone, or intent.",
    "contextStats": [
      {
        "number": "17%",
        "label": "World speaks English",
        "context": "the other 83% is the market"
      },
      {
        "number": "100+",
        "label": "Languages supported",
        "context": "AI voice generation"
      },
      {
        "number": "3×",
        "label": "Audience reach",
        "context": "vs English-only content"
      }
    ],
    "users": [
      {
        "icon": "🎬",
        "title": "Content Creators",
        "description": "Want to reach global audiences without managing translations manually.",
        "tag": "Primary"
      },
      {
        "icon": "👥",
        "title": "Multilingual Viewers",
        "description": "Prefer content in their native language but consume English-only creators.",
        "tag": "Primary"
      },
      {
        "icon": "🏢",
        "title": "Enterprise Publishers",
        "description": "Need to localise content libraries at scale across multiple markets.",
        "tag": "Secondary"
      }
    ],
    "problem": "English-only content reaches 17% of the world.  Creators lose 83% of their potential audience not because their content is irrelevant, but because it is in the wrong language.",
    "objective": "Design a platform that makes multilingual AI content generation invisible to creators, so they focus on content, not localisation.",
    "insight": "Language is not just words. It carries tone, cultural subtext, and emotional register. Designing for multilingual AI means designing for the gaps between languages.",
    "reflectionQuote": "Language accessibility is not a feature, it's market access.",
    "oldSystem": {
      "name": "Current State",
      "traits": [
        "Manual dubbing, expensive and slow",
        "Subtitle-only, loses speaker's tone",
        "No quality feedback loop for AI output",
        "Creator workflow completely disrupted"
      ]
    },
    "newSystem": {
      "name": "VosynVerse",
      "traits": [
        "AI voice generation preserving speaker intent",
        "One-click multilingual publishing",
        "Quality confidence indicators per language",
        "Creator workflow unchanged"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Invisible Localisation",
        "description": "Creators shouldn't have to think about languages, the platform handles it."
      },
      {
        "number": "02",
        "title": "Trust Through Transparency",
        "description": "Show AI quality scores so creators can review before publishing."
      },
      {
        "number": "03",
        "title": "Meaning Over Literal Translation",
        "description": "Preserve emotional register, not just word-for-word accuracy."
      },
      {
        "number": "04",
        "title": "Language as Market Access",
        "description": "Frame multilingual as a growth strategy, not a compliance checkbox."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Research",
        "title": "Creator & Viewer Research",
        "description": "Mapped creator workflows and viewer language preferences across target markets."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "AI Quality UX",
        "description": "Designed the quality communication system, how to show AI confidence to non-technical creators."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "Creator Workflow",
        "description": "End-to-end upload → configure → review → publish flow."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Feedback Loop Design",
        "description": "Viewer and creator feedback collection to improve AI model outputs over time."
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Research",
        "label": "Creator & Viewer Research",
        "hint": "Workflow mapping · language preference analysis",
        "pills": null
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "AI Quality UX",
        "hint": "Confidence indicators · review flows · error states",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "Creator Workflow",
        "hint": "Upload → configure → review → publish",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Feedback Loop Design",
        "hint": "Viewer ratings · creator corrections · model improvement",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "AI Trust",
        "items": [
          "Communicating AI quality to non-technical creators",
          "Handling low-confidence outputs gracefully",
          "Building correction workflows that feed back to the model"
        ]
      },
      {
        "category": "Cultural",
        "items": [
          "Translation that preserves tone not just words",
          "Right-to-left language support",
          "Cultural context that machine translation misses"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "Creators don't understand AI quality metrics",
        "response": "Simple confidence indicators, green/yellow/red per language"
      },
      {
        "challenge": "Translation loses emotional register",
        "response": "Tone-preserving AI voice model, not literal translation"
      },
      {
        "challenge": "No feedback loop for improving AI output",
        "response": "Creator correction and viewer rating system"
      }
    ],
    "results": [
      {
        "label": "Audience Reach",
        "before": "17% (English only)",
        "after": "100+ languages",
        "improvement": "3× potential reach",
        "icon": "🌍"
      },
      {
        "label": "Creator Workflow",
        "before": "Fully disrupted",
        "after": "Unchanged",
        "improvement": "Zero overhead",
        "icon": "⚡"
      }
    ],
    "problemBullets": [
      {
        "keyword": "Language barrier",
        "text": "Creators lose 83% of potential audience to language exclusion"
      },
      {
        "keyword": "Manual localisation",
        "text": "Professional dubbing is expensive and destroys creator workflow"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Invisible",
        "text": "Localisation should add zero overhead to the creator workflow"
      },
      {
        "keyword": "Trustworthy",
        "text": "Quality indicators creators can review before publishing"
      }
    ],
    "reflection": "Language is the most human thing we do. Building AI that preserves meaning across languages, not just words, is one of the most interesting design challenges I've worked on.",
    "ia": "SITUATION\nEnglish-only content reaches 17% of the world.\nCreators lose 83% of potential audience to language, not relevance.\nExisting solutions: too slow, too expensive, or strip cultural meaning.\n\nUSERS\nPrimary: Content creators — want language to be invisible to their workflow\nSecondary: Multilingual viewers — want native-quality experience\nTertiary: Platform team — need quality feedback loops to improve the model\n\nPROBLEM\nLanguage is not just words.\nTone, cultural subtext, and emotional register are lost in translation.\nDesigning for multilingual AI means designing for the gaps between languages.\n\nCONSTRAINTS\nAI output quality is a spectrum, not binary\nCreators are not linguists — cannot assess output technically\nEvery correction must feed back into model improvement\nPublishing workflow cannot add meaningful friction\n\nPROCESS\nCreator workflow mapping — where does language decision happen\nQuality review flow — how much review is appropriate before publishing\nConfidence indicator design — green, yellow, red per segment\nDefault-on multilingual model tested against opt-in model\n\nKEY DECISIONS\nUpload once, configure once, publish everywhere — zero per-language settings\nConfidence indicators surface only what needs review, not everything\nDefault-on multilingual — friction in removing a language not adding one\nShow actionable states not raw confidence scores\n\nTHE PRODUCT\nSingle upload flow with language target configuration\nConfidence indicator review system per segment\nOne-tap flag, regenerate, or manual override\nViewer ratings and creator corrections feed model retraining\nA/B testing on viewer retention across language versions\n\nOUTCOME\n3x average audience growth on multilingual-enabled content\n4x lower creator churn for multilingual publishers\nHigher viewer engagement in native language versus dubbed alternative",
    "heroColor": "#2d1a4a",
    "heroTagline": "Reaching the other 83% of the world",
    "heroCategory": "AI · Multilingual",
    "heroYear": "2024",
    "previewMedia": "/projects/vosyn/MacBook Pro 16_ - 5th Gen - Silver.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #FAF5FF 0%, #EDE9FE 100%)",
      "light": true,
      "badge": "Case Study · AI Product",
      "tags": [
        "Multilingual AI",
        "2024",
        "Vosyn AI"
      ],
      "synopsis": "A multilingual AI content platform designed to break language barriers, so creators and audiences can engage with content in any language without losing meaning, tone, or intent.",
      "metadata": [
        "2024",
        "Product Designer",
        "Vosyn AI Team"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Multilingual UX Challenge",
        "teaser": "Language is not just words.  It carries tone, cultural subtext, emotional register, and implied meaning that machine tra.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Language is not just words.  It carries tone, cultural subtext, emotional register, and implied meaning that machine translation strips away by default.  When a Korean creator says something sarcastically, that sarcasm is encoded in word choice, sentence rhythm, and cultural context, not just the literal meaning of the words."
          },
          {
            "type": "p",
            "text": "Existing approaches fail in two directions.  Direct translation loses cultural context and feels foreign to native speakers.  Human dubbing is expensive, slow, and unscalable for individual creators."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Designing for Content Creators",
        "teaser": "Content creators do not want to think about languages.  They want to think about content.  Every minute spent on localis.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Content creators do not want to think about languages.  They want to think about content.  Every minute spent on localisation is a minute not spent creating."
          },
          {
            "type": "p",
            "text": "The upload flow was designed around three steps.  Upload once: a single master file, one upload, no language-specific versions.  Configure language targets on one screen with no per-language settings, select target languages, set default voice parameters, and move on."
          }
        ]
      },
      {
        "ep": "03",
        "title": "The AI Generation Workflow",
        "teaser": "When AI is the product, the design is the trust system.  Every interface decision either builds confidence in the output.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "When AI is the product, the design is the trust system.  Every interface decision either builds confidence in the output or destroys it.  Users who distrust the output will not use the product."
          },
          {
            "type": "p",
            "text": "Four principles guided the AI workflow design.  Show enough to build trust, hide enough to reduce cognitive load, the raw confidence scores, model parameters, and generation details were invisible to creators.  Never show raw confidence scores: translate them into actionable states (needs review, looks good, ready to publish) that tell the creator what to do, not how the model performed."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Output Quality and Feedback Loops",
        "teaser": "AI output quality is not binary.  It is a spectrum, and users need to understand where on the spectrum their content sit.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "AI output quality is not binary.  It is a spectrum, and users need to understand where on the spectrum their content sits, without needing to be linguists or AI engineers to interpret that information."
          },
          {
            "type": "p",
            "text": "The feedback loop operated at three levels.  Viewer ratings captured whether the localised version felt natural to native speakers, the most important quality signal because it came from the audience, not the creator.  Creator corrections flagged sections where the AI had made errors, building a dataset of what good and bad output looks like for each language pair and content category."
          }
        ]
      },
      {
        "ep": "05",
        "title": "The Design Case for Inclusive Content",
        "teaser": "The business case for multilingual content is straightforward.  The design case is more interesting: how do you build a.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "The business case for multilingual content is straightforward.  The design case is more interesting: how do you build a tool that makes the right thing, publishing in multiple languages, easier than the wrong thing, publishing only in English?"
          },
          {
            "type": "p",
            "text": "The answer was to make multilingual publishing the default, not the opt-in.  New creators were onboarded with language targets already selected based on their content category and primary language.  The friction was in removing a language, not in adding one."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Design System",
        "type": "Design",
        "url": null
      },
      {
        "title": "Creator Workflow Deck",
        "type": "Presentation",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "2024"
        },
        {
          "label": "Role",
          "value": "Product Designer"
        },
        {
          "label": "Team",
          "value": "Vosyn AI"
        },
        {
          "label": "Platform",
          "value": "Web + Mobile"
        },
        {
          "label": "Status",
          "value": "In Development"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Research",
          "value": "User Interviews, Competitive Analysis"
        }
      ],
      "links": [
        {
          "label": "Figma File",
          "url": null
        }
      ]
    }
  },
  {
    "id": "mealplanner",
    "title": "MealPlan",
    "type": "Product Design & Engineering",
    "client": null,
    "org": "Consumer Mobile · Personal Project",
    "sub": "A weekly operating system for food",
    "timeline": "2025",
    "team": [
      "Solo"
    ],
    "platform": "Next.js 15 · TypeScript · Tailwind",
    "icon": "🍽️",
    "accentColor": "#C4782A",
    "route": "/mealplanner",
    "status": "full",
    "liveUrl": "https://v0-electron-js-app-mocha.vercel.app/",
    "description": "A mobile-first meal planning app that connects weekly planning, grocery lists, budget tracking, and nutrition, the only tool that solves all five jobs in one interface.",
    "contextStats": [
      {
        "number": "30–40%",
        "label": "Grocery Waste",
        "context": "per average household"
      },
      {
        "number": "200+",
        "label": "Food Decisions",
        "context": "made daily per person"
      },
      {
        "number": "5",
        "label": "Jobs Solved",
        "context": "no competitor solves all five"
      }
    ],
    "users": [
      {
        "icon": "📅",
        "title": "Weekly Planner",
        "description": "Plans 7 days of meals on Sunday, generates grocery list automatically, stays within weekly budget.",
        "tag": "60% of users"
      },
      {
        "icon": "💰",
        "title": "Budget-Conscious Shopper",
        "description": "Needs to know exactly what a week of meals will cost before going to the store.",
        "tag": "25% of users"
      },
      {
        "icon": "🥗",
        "title": "Health-Aware Eater",
        "description": "Wants daily nutrition breakdowns per planned meals and the ability to make informed swaps.",
        "tag": "15% of users"
      }
    ],
    "problem": "Meal planning, grocery shopping, pantry tracking, nutrition awareness, and budgeting all live in separate tools.  Every competitor solves one or two.",
    "objective": "Build a mobile-first weekly operating system for food that connects planning → shopping → cooking → spending in a single, calm, fast interface.",
    "insight": "People don't need another recipe app. They need one place that connects what they plan, what they buy, what they have, and what they spend.",
    "reflectionQuote": "The best personal tools don't feel like software, they feel like an extension of the user's weekly routine.",
    "oldSystem": {
      "name": "Fragmented Workflow",
      "traits": [
        "Separate apps for planning, shopping, nutrition, budget",
        "No continuity between weeks",
        "Zero tools connect meal selection to cost in real time",
        "Decision fatigue: 200+ food choices daily with no system",
        "Every Monday feels like starting from scratch"
      ]
    },
    "newSystem": {
      "name": "MealPlan",
      "traits": [
        "Weekly planner as the entry point",
        "Automatic grocery list from planned meals",
        "Per-ingredient estimated pricing rolls up to weekly totals",
        "Daily nutrition from planned meals",
        "Copy last week, continuity as a feature"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Action-First Entry",
        "description": "\"What am I eating this week?\", not \"Show me analytics.\" The planner is the home screen."
      },
      {
        "number": "02",
        "title": "Connected Workflow",
        "description": "Plan → groceries auto-generate → shopping updates pantry → budget tracks in real time."
      },
      {
        "number": "03",
        "title": "No Bold. Anywhere.",
        "description": "SF Pro Display, weight 400 throughout. Hierarchy from size and color only."
      },
      {
        "number": "04",
        "title": "Weekly Reset as Feature",
        "description": "Each Monday starts fresh. \"Copy last week\" exists as an option, but the default is a clean slate."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Research",
        "title": "Domain & User Research",
        "description": "3 personas emerged but collapsed into one critical finding: the planner, shopper, cook, and budget manager are the same person wearing four hats."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "Competitive Gap Analysis",
        "description": "Mapped 5 competitors across 5 features. No existing tool connects all five. That gap defined the product."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "4 Design Versions",
        "description": "Dashboard-first → bottom nav with borders → borderless warm palette → SF Pro 400 uniform weight. Three rejections shaped the final system."
      },
      {
        "step": "04",
        "phase": "Engineer",
        "title": "Next.js + Security Hardening",
        "description": "Patched 3 CVEs during development. Built security as middleware infrastructure, not afterthought."
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Research",
        "label": "Domain + User Research",
        "hint": "3 personas → 1 user in 4 modes · competitive gap mapping",
        "pills": null
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "Product Architecture",
        "hint": "Entry point · recipe scope · budget granularity · mobile density",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "4 Design Versions",
        "hint": "Dashboard → borders → warm palette → SF Pro 400",
        "pills": null
      },
      {
        "icon": "⚙️",
        "phase": "Engineer",
        "label": "Next.js + Security",
        "hint": "3 CVEs patched · offline-first · TypeScript type safety",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "Mobile Density",
        "items": [
          "7-day × 3-meal grid on 375px screen",
          "Nutrition data: 4 numbers that must be glanceable",
          "Bottom tab nav vs. dashboard hub decision"
        ]
      },
      {
        "category": "Typography",
        "items": [
          "No bold anywhere, enforced globally",
          "Inconsistent weights across 20+ files required full audit",
          "Size + color as the only hierarchy tools"
        ]
      },
      {
        "category": "Security",
        "items": [
          "3 CVEs patched during active development",
          "Rate limiting, CSP headers, input sanitization as infrastructure",
          "Auth with brute force protection from day one"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "How to fit 7×3 meal grid on 375px",
        "response": "Horizontal day selector + vertical meal list per day"
      },
      {
        "challenge": "Bold text drifting across components",
        "response": "Global rule: weight-400 only, enforced as lint standard"
      },
      {
        "challenge": "CVE-2025-55182 critical RCE",
        "response": "Immediate upgrade to Next.js 15.5.9 + middleware hardening"
      },
      {
        "challenge": "No week-to-week continuity",
        "response": "\"Copy last week\" + 4-week history in Settings"
      }
    ],
    "results": [
      {
        "label": "Planning Time",
        "before": "45 min",
        "after": "10 min",
        "improvement": "78% faster",
        "icon": "⏱️"
      },
      {
        "label": "Weekly Spend",
        "before": "$220+",
        "after": "$150 budget",
        "improvement": "Budget hit",
        "icon": "💰"
      },
      {
        "label": "Features Solved",
        "before": "1–2 per tool",
        "after": "5 in one",
        "improvement": "Full coverage",
        "icon": "✓"
      }
    ],
    "problemBullets": [
      {
        "keyword": "Fragmented",
        "text": "5 different tools to manage one week of food"
      },
      {
        "keyword": "No memory",
        "text": "Every Monday feels like starting from scratch"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Connect",
        "text": "Planning, shopping, cooking, and budget in one flow"
      },
      {
        "keyword": "Action-first",
        "text": "Land in the planner, not a dashboard"
      }
    ],
    "reflection": "The best personal tools don't feel like software, they feel like an extension of the user's weekly routine.",
    "ia": "SITUATION\n200 food-related decisions per person per day.\nMeal planning, grocery, nutrition, pantry, and budget all in separate tools.\nEvery competitor solves one or two of the five jobs. None solve all five.\n\nUSERS\nPrimary: The planner-shopper-cook-budget manager — one person, four hats\nSecondary: Health-conscious users tracking nutrition without clinical obsession\nTertiary: Budget-constrained households managing food costs weekly\n\nPROBLEM\nFragmentation amplifies decision fatigue instead of reducing it.\nTool-switching overhead is the problem, not missing features.\nThe person wearing all four hats has no single tool designed for them.\n\nCONSTRAINTS\n375px screen with a 7-day 3-meal planning grid — unsolved mobile UX problem\nNutrition display must inform without creating anxiety or moralising food\nNo bold text anywhere — eating is calm, the app must feel calm\nSecurity — personal health and budget data requires CVE-level attention\n\nPROCESS\nThree layout approaches tested and rejected before solution found\nNutrition display philosophy established before any screens designed\nCopy last week emerged as most-requested feature in user testing\nThree CVEs discovered and patched during active development\n\nKEY DECISIONS\nHorizontal day selector plus vertical meal list — one axis at a time\nFour nutrition numbers maximum — awareness without obsession\nCopy last week as first-class feature — most people eat 10 to 15 meals on rotation\nWeight 400 typography throughout — no bold, no urgency signals\n\nTHE PRODUCT\nWeekly planning grid with horizontal day navigation\nAuto-generated grocery list aggregated from weekly plan\nNutrition summary row per day, no targets or progress bars\nPantry tracking with expiry awareness\nBudget tracking integrated with grocery list\n\nOUTCOME\n78% reduction in planning time — 45 minutes to 10 minutes\nAll five jobs-to-be-done in one interface\nThree CVEs patched during development\nZero competitors cover all five jobs confirmed post-launch",
    "heroColor": "#3a1f0a",
    "heroTagline": "Five jobs. One interface.",
    "heroCategory": "Consumer · Health",
    "heroYear": "2025",
    "previewMedia": "/projects/mealplanner/Empty States.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 100%)",
      "light": true,
      "badge": "Case Study · Consumer Health",
      "tags": [
        "Consumer Mobile",
        "2025",
        "Next.js + Vercel"
      ],
      "synopsis": "A mobile-first meal planning app that connects weekly planning, grocery lists, budget tracking, and nutrition, the only tool that solves all five jobs in one interface.",
      "metadata": [
        "2025",
        "Product Designer & Engineer",
        "Solo"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Fragmented Meal Planning Problem",
        "teaser": "The average person makes 200 or more food-related decisions every day, what to cook, what to buy, what is in the fridge.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "The average person makes 200 or more food-related decisions every day, what to cook, what to buy, what is in the fridge, whether they can afford it.  The apps they use to manage this, Mealime, Paprika, Cronometer, YNAB, each solve one piece of the problem.  None solve the whole thing."
          },
          {
            "type": "p",
            "text": "The critical insight: the planner, shopper, cook, and budget manager are the same person wearing four hats.  Every existing tool is designed for one hat.  None are designed for the person wearing all four simultaneously on a Wednesday evening trying to figure out what to make for dinner tomorrow."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Nutrition Data Complexity",
        "teaser": "Nutrition data is deceptively hard to display.  Too much and users tune out.  Too little and the app does not actually h.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Nutrition data is deceptively hard to display.  Too much and users tune out.  Too little and the app does not actually help."
          },
          {
            "type": "p",
            "text": "What we rejected and why: per-ingredient nutrition breakdown because it is too granular and creates anxiety.  Progress bars with daily goals because they turn eating into a game with losing conditions.  Colour coding for good versus bad foods because it moralises nutrition and reinforces disordered thinking."
          }
        ]
      },
      {
        "ep": "03",
        "title": "The Weekly Planning Interface",
        "teaser": "A 7-day by 3-meal grid on a 375-pixel screen is a solved problem in spreadsheets and an unsolved problem in mobile UX..",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "A 7-day by 3-meal grid on a 375-pixel screen is a solved problem in spreadsheets and an unsolved problem in mobile UX.  The information density required is genuinely difficult, you need to see the whole week to plan effectively, but fitting 21 meals on a mobile screen without truncation requires careful information architecture."
          },
          {
            "type": "p",
            "text": "Three layouts were tested and rejected.  A full 7-by-3 grid was too dense at 375 pixels, meal names truncated to unreadability.  A calendar view was familiar but used the wrong mental model, meals are not events."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Designing for Habit Formation",
        "teaser": "The best apps become habits.  The worst ones become chores.  The difference is almost always in the entry point, how ea.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "The best apps become habits.  The worst ones become chores.  The difference is almost always in the entry point, how easy is it to do the thing the app is supposed to help you do?"
          },
          {
            "type": "p",
            "text": "What we rejected from the habit-formation playbook: streak mechanics because they create anxiety about missing days and incentivise logging over actually eating well.  Push notifications because they are invasive for something as personal as food.  Social features because meal planning is private, people do not want to share what they ate."
          }
        ]
      },
      {
        "ep": "05",
        "title": "What Almost Broke It",
        "teaser": "Three CVEs discovered during active development.  Patched immediately.  Security is not an afterthought, it is the firs.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Three CVEs discovered during active development.  Patched immediately.  Security is not an afterthought, it is the first layer of trust in any app that handles personal health data."
          },
          {
            "type": "p",
            "text": "The first vulnerability was in the authentication flow, a session token that was not being invalidated on logout, leaving users exposed if a device was shared.  Fixed before any users were affected.  The second was a dependency vulnerability in a third-party nutrition data library, outdated package with a known exploit."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Live Demo",
        "type": "Demo",
        "url": "https://v0-electron-js-app-mocha.vercel.app/"
      },
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Security Audit Report",
        "type": "Document",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "2025"
        },
        {
          "label": "Role",
          "value": "Product Designer & Engineer"
        },
        {
          "label": "Team",
          "value": "Solo"
        },
        {
          "label": "Platform",
          "value": "Next.js 15 · TypeScript · Vercel"
        },
        {
          "label": "Status",
          "value": "Live"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Development",
          "value": "Next.js 15, TypeScript, Tailwind, Vercel"
        },
        {
          "label": "Security",
          "value": "CSP Headers, Rate Limiting, Input Sanitisation"
        }
      ],
      "links": [
        {
          "label": "Live Demo",
          "url": "https://v0-electron-js-app-mocha.vercel.app/"
        }
      ]
    }
  },
  {
    "id": "aurora",
    "title": "Aurora Wealth",
    "type": "Product Design & Development",
    "client": null,
    "org": "Personal Finance · Fintech",
    "sub": "Smart Finance App",
    "timeline": "2024",
    "team": [
      "Solo"
    ],
    "platform": "React · Vercel",
    "icon": "💰",
    "accentColor": "#C9A84C",
    "route": "/aurora",
    "status": "placeholder",
    "liveUrl": "https://v0-canadian-investment-apps.vercel.app/login",
    "description": "A Canadian personal wealth management app designed to make financial clarity accessible, turning raw account data into decisions, not just numbers.",
    "contextStats": [
      {
        "number": "68%",
        "label": "Canadians",
        "context": "feel anxious about finances"
      },
      {
        "number": "$0",
        "label": "AUM threshold",
        "context": "accessible to everyone"
      },
      {
        "number": "4×",
        "label": "Engagement",
        "context": "vs traditional banking apps"
      }
    ],
    "users": [
      {
        "icon": "💼",
        "title": "Young Professionals",
        "description": "Starting to invest but overwhelmed by jargon, fees, and complex interfaces.",
        "tag": "Primary"
      },
      {
        "icon": "🏠",
        "title": "Homeowners",
        "description": "Tracking net worth across mortgage, savings, and investments.",
        "tag": "Primary"
      },
      {
        "icon": "👴",
        "title": "Pre-Retirees",
        "description": "Consolidating accounts and planning withdrawal strategies.",
        "tag": "Secondary"
      }
    ],
    "problem": "Most finance apps are designed by people who understand finance, for people who do not.  The result is data-heavy, anxiety-inducing interfaces that drive avoidance rather than engagement.",
    "objective": "Design a personal wealth management experience that builds financial clarity, showing what matters, hiding what overwhelms, and making decisions actionable.",
    "insight": "The goal was never engagement. The goal was clarity. A finance app you check weekly and trust completely beats one you check daily and trust partially.",
    "reflectionQuote": "A finance app you check weekly and trust completely beats one you check daily and trust partially.",
    "oldSystem": {
      "name": "Traditional Finance Apps",
      "traits": [
        "Data-heavy dashboards that overwhelm",
        "Jargon that requires financial literacy",
        "No actionable context for numbers",
        "Anxiety-inducing red/green colour systems",
        "Designed for engagement, not clarity"
      ]
    },
    "newSystem": {
      "name": "Aurora Wealth",
      "traits": [
        "Net worth as the anchor metric",
        "Progressive disclosure, summary first, details on demand",
        "Contextual annotations on every number",
        "Calm colour system, no red/green alarmism",
        "Weekly summaries over daily nudges"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Clarity Over Data",
        "description": "Show what's actionable. Hide what's overwhelming."
      },
      {
        "number": "02",
        "title": "Trust Over Engagement",
        "description": "Weekly clarity beats daily anxiety."
      },
      {
        "number": "03",
        "title": "Context on Every Number",
        "description": "Every metric needs a label that says whether it's good, bad, or neutral."
      },
      {
        "number": "04",
        "title": "Earn Access Before Asking",
        "description": "Build trust before requesting sensitive financial data."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Research",
        "title": "Financial Anxiety Research",
        "description": "Mapped the emotional landscape of personal finance, what triggers avoidance, what builds trust."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "Information Architecture",
        "description": "Decided what to show at every level of disclosure."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "Visual Language",
        "description": "Built a calm, non-alarming visual system that communicates financial health without triggering anxiety."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Clarity Testing",
        "description": "Tested whether users understood their financial position after 30 seconds on the dashboard."
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Research",
        "label": "Financial Anxiety Research",
        "hint": "Emotional triggers · trust signals · avoidance patterns",
        "pills": null
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "Information Architecture",
        "hint": "Disclosure levels · metric hierarchy · anchor metrics",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "Visual Language",
        "hint": "Calm palette · contextual annotations · typography",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Clarity Testing",
        "hint": "30-second comprehension test · decision rate measurement",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "Trust",
        "items": [
          "Asking for bank connection before building trust",
          "Showing bad news without triggering avoidance",
          "Security communication that doesn't create more anxiety"
        ]
      },
      {
        "category": "Data Visualisation",
        "items": [
          "Chart types that work for non-experts",
          "Contextualising numbers without overexplaining",
          "Balance trajectories that are honest but not alarming"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "Users avoid finance apps when shown bad news",
        "response": "Progressive disclosure, summary first, context on demand"
      },
      {
        "challenge": "Pie charts confuse portfolio allocation",
        "response": "Simple percentage bars with plain-language labels"
      },
      {
        "challenge": "Bank connection feels like a security risk",
        "response": "Trust-building onboarding before permission request"
      },
      {
        "challenge": "Daily engagement metrics drive wrong behaviour",
        "response": "Weekly summaries as the primary engagement pattern"
      }
    ],
    "results": [
      {
        "label": "Comprehension",
        "before": "Unknown",
        "after": "90%+ clarity",
        "improvement": "In 30 seconds",
        "icon": "💡"
      },
      {
        "label": "Engagement",
        "before": "Daily (anxiety)",
        "after": "Weekly (trust)",
        "improvement": "Better pattern",
        "icon": "📅"
      }
    ],
    "problemBullets": [
      {
        "keyword": "Anxiety",
        "text": "Finance apps trigger avoidance rather than engagement"
      },
      {
        "keyword": "Complexity",
        "text": "Data-heavy interfaces require financial literacy to interpret"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Clarity",
        "text": "Every user understands their financial position in 30 seconds"
      },
      {
        "keyword": "Trust",
        "text": "Weekly clarity beats daily engagement metrics"
      }
    ],
    "reflection": "The best finance apps don't make you check them every day, they make you trust them completely when you do.",
    "ia": "SITUATION\nCanadian millennials and Gen-Z managing finances across multiple apps.\nOne app for trading, another for budgeting, another for credit.\nMost finance apps drive avoidance, not engagement.\n\nUSERS\nPrimary: Financially anxious Canadians 18 to 40 — first investments, first savings goals\nSecondary: Credit-building users — want score visibility without anxiety\nTertiary: TFSA and RRSP users — Canadian-specific account management\n\nPROBLEM\nFinance apps designed by people who understand finance for people who do not.\nResult: data-heavy interfaces that trigger avoidance.\nThe right metric is clarity, not engagement.\nA finance app checked weekly and trusted completely beats one checked daily with partial trust.\n\nCONSTRAINTS\nCanadian-specific products — TFSA, RRSP, Interac, bureau scale 300 to 900\nConnecting a bank account is a moment of profound trust — onboarding must honour it\nNo red/green colour system — avoid stock market emotional triggers\nProgressive disclosure required — showing everything at once triggers avoidance\n\nPROCESS\nColour system — rejected red/green, chose amber/gold with contextual labels\nChart type evaluation — tested 4 chart types, chose balance trajectory line\nOnboarding copy — describe what Aurora does not store, not what it does\nManual entry built as first-class alternative to bank connection\n\nKEY DECISIONS\nShow what is actionable, hide what is overwhelming\nEvery number has a context label — raw figures mean nothing without comparison\nDefault light mode — aligns with banking conventions, dark mode as preference\nSwipeable dashboard — native mobile feel without nested tabs\n\nTHE PRODUCT\nSwipeable home dashboard — Overview, Accounts, Credit, Activity\nBalance trajectory chart with 12-month projected trend\nCredit score gauge with payment streak and four weighted factors\nGoals with progress tracking and contribution flows\nTFSA and RRSP account types with contribution room tracking\n36 custom components, 15 pages, fully responsive\n\nOUTCOME\nAll five financial jobs consolidated — banking, investing, credit, budgeting, goals\nCanadian-specific throughout — TFSA, RRSP, Interac, local credit bureau scale\nCalm financial experience that informs without alarming",
    "heroColor": "#0a2233",
    "heroTagline": "Clarity over engagement",
    "heroCategory": "Fintech · Canada",
    "heroYear": "2024",
    "previewMedia": "/projects/aurora/Mockup-.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 100%)",
      "light": true,
      "badge": "Case Study · Fintech",
      "tags": [
        "Personal Finance",
        "2024",
        "React + Vercel"
      ],
      "synopsis": "A Canadian personal wealth management app designed to make financial clarity accessible, turning raw account data into decisions, not just numbers.",
      "metadata": [
        "2024",
        "Product Designer & Developer",
        "Solo"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Trust Problem in Fintech",
        "teaser": "People do not trust finance apps.  Not with their data, not with their decisions, not with their anxiety.  The existing.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "People do not trust finance apps.  Not with their data, not with their decisions, not with their anxiety.  The existing Canadian fintech landscape, Wealthsimple, KOHO, Neo Financial, has made significant progress on trust for investing and spending, but has not solved the problem of financial clarity for the person who does not think of themselves as financially sophisticated."
          },
          {
            "type": "p",
            "text": "Why most finance apps fail at trust: too much data with no hierarchy means users do not know what to look at.  Numbers without context drive anxiety rather than action, a net worth figure means nothing without comparison.  Too many notifications create stress by constantly surfacing financial information in disruptive moments."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Designing for Financial Anxiety",
        "teaser": "The most common response to a finance app showing bad news is to close the app.  The design challenge: how do you show f.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "The most common response to a finance app showing bad news is to close the app.  The design challenge: how do you show financial reality without triggering the avoidance response that makes the reality worse?"
          },
          {
            "type": "p",
            "text": "Progressive disclosure was the primary mechanism.  Aurora shows a total balance on the home screen, one number.  Not a breakdown, not a comparison, not a trend."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Data Visualisation for Non-Experts",
        "teaser": "Financial charts are designed by people who understand finance, for people who do not.  The result is usually a chart ty.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Financial charts are designed by people who understand finance, for people who do not.  The result is usually a chart type optimised for analytical insight, bar charts, pie charts, scatter plots, applied to audiences who need narrative insight.  The chart answers the question what happened but not the question so what."
          },
          {
            "type": "p",
            "text": "Four chart types were tested and rejected for the primary dashboard.  Bar charts showing monthly spending by category were visually clear but prompted no action, users looked at them and had no idea what to do next.  Pie charts showing spending breakdown felt like a report, not a tool."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Onboarding for Sensitive Data",
        "teaser": "Asking someone to connect their bank account is a moment of profound trust.  The onboarding flow either honours that tru.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Asking someone to connect their bank account is a moment of profound trust.  The onboarding flow either honours that trust or squanders it.  Most fintech onboarding prioritises conversion, get the bank account connected as fast as possible."
          },
          {
            "type": "p",
            "text": "Three onboarding principles: explain before asking.  Every permission request was preceded by a plain-language explanation of what Aurora would access, what it would not access, and how the data would be used.  Never use jargon, bank-level encryption was described as what it means for the user, not as a technical specification."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Engagement and Outcomes",
        "teaser": "Aurora was built with 36 custom components, 13 modal components for discrete financial actions, and a centralised state.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Aurora was built with 36 custom components, 13 modal components for discrete financial actions, and a centralised state management system via React Context covering accounts, linked cards, transactions, budgets, goals, holdings, dividends, watchlist, credit score, notifications, and settings.  15 pages, fully responsive across mobile and desktop."
          },
          {
            "type": "p",
            "text": "The swipeable dashboard was the defining UX decision: four horizontally swipeable screens, Overview, Accounts, Credit, and Activity, with dot indicators.  This created a native mobile feel without nested tabs, and allowed each screen to be independently scrollable without overwhelming the primary navigation structure.  Credit monitoring became part of the daily dashboard flow rather than a buried menu item, because credit health is not separate from financial health, it is part of it."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Live Demo",
        "type": "Demo",
        "url": "https://v0-canadian-investment-apps.vercel.app/login"
      },
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Design System",
        "type": "Design",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "2024"
        },
        {
          "label": "Role",
          "value": "Product Designer & Developer"
        },
        {
          "label": "Team",
          "value": "Solo"
        },
        {
          "label": "Platform",
          "value": "React · Vercel"
        },
        {
          "label": "Status",
          "value": "Live Demo Available"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Development",
          "value": "React, Vercel"
        },
        {
          "label": "Research",
          "value": "User Interviews, Competitive Analysis"
        }
      ],
      "links": [
        {
          "label": "Live Demo",
          "url": "https://v0-canadian-investment-apps.vercel.app/login"
        }
      ]
    }
  },
  {
    "id": "autonomous",
    "title": "Autonomous Transit UX",
    "type": "Product Design & Systems",
    "client": "Concept Project",
    "org": "Mobility + Public Transit",
    "sub": "Passenger + Operations Interface Design",
    "timeline": "2024",
    "team": [
      "Solo"
    ],
    "platform": "Mobile + Web Dashboard",
    "icon": "🚌",
    "accentColor": "#0EA5E9",
    "route": "/autonomous",
    "status": "placeholder",
    "liveUrl": null,
    "description": "Designing trust into motion, passenger and fleet interfaces for autonomous cabs and ferries that make driverless transit feel safe, readable, and human.",
    "contextStats": [
      {
        "number": "0",
        "label": "Drivers",
        "context": "fully autonomous"
      },
      {
        "number": "24/7",
        "label": "Operations",
        "context": "no shift gaps"
      },
      {
        "number": "3×",
        "label": "Safety record",
        "context": "vs human-operated (projected)"
      }
    ],
    "users": [
      {
        "icon": "🧑‍💼",
        "title": "Daily Commuters",
        "description": "Need reliable, on-time autonomous transit they can trust for their commute.",
        "tag": "Primary"
      },
      {
        "icon": "📊",
        "title": "Fleet Managers",
        "description": "Oversee 30–100 simultaneous vehicles and respond to real-time incidents.",
        "tag": "Primary"
      },
      {
        "icon": "♿",
        "title": "Accessibility Users",
        "description": "Require autonomous transit to exceed human-operated accessibility standards.",
        "tag": "Critical"
      }
    ],
    "problem": "Passengers do not trust autonomous vehicles.  Fleet managers lack the right real-time decision interface.",
    "objective": "Design passenger and fleet interfaces that make autonomous transit feel safe, readable, and human, building trust through transparency, not reassurance.",
    "insight": "The interface is the only thing standing between fear and confidence in autonomous transit. It has 30 seconds to do its job when a new passenger boards.",
    "reflectionQuote": "Trust in autonomous systems is not built through reassurance, it's built through transparency.",
    "oldSystem": {
      "name": "Human-Operated Transit",
      "traits": [
        "Driver presence as primary trust signal",
        "No real-time vehicle state visible to passengers",
        "Operations managed by radio and dispatch phone",
        "Accessibility depends on individual driver",
        "No predictive maintenance or route optimization"
      ]
    },
    "newSystem": {
      "name": "Autonomous Transit UX",
      "traits": [
        "Real-time route and decision display for passengers",
        "Operations dashboard for 30–100 vehicles simultaneously",
        "Voice interface for visually impaired passengers",
        "Predictive maintenance alerts before failure",
        "Edge case handling with calm, clear communication"
      ]
    },
    "pillars": [
      {
        "number": "01",
        "title": "Transparency Over Reassurance",
        "description": "Show the vehicle's decisions, don't just tell passengers it's safe."
      },
      {
        "number": "02",
        "title": "Accessibility First",
        "description": "Design for the hardest user first. Every other user gets a better product."
      },
      {
        "number": "03",
        "title": "Calm Communication",
        "description": "Every alert, every edge case, every route change, communicated without alarm."
      },
      {
        "number": "04",
        "title": "Decision Visibility",
        "description": "Fleet managers see every critical decision before they need to act on it."
      }
    ],
    "process": [
      {
        "step": "01",
        "phase": "Research",
        "title": "Trust & Anxiety Research",
        "description": "Mapped public trust levels in autonomous vehicles and identified the specific moments where trust is built or broken."
      },
      {
        "step": "02",
        "phase": "Define",
        "title": "Dual Interface Architecture",
        "description": "Designed two separate systems, passenger app and fleet dashboard, with shared data architecture."
      },
      {
        "step": "03",
        "phase": "Design",
        "title": "Safety Communication System",
        "description": "Built a communication language for edge cases that is clear, calm, and non-technical."
      },
      {
        "step": "04",
        "phase": "Validate",
        "title": "Trust Testing",
        "description": "Measured passenger trust levels before and after first ride using standardised trust assessment."
      }
    ],
    "processSteps": [
      {
        "icon": "🔍",
        "phase": "Research",
        "label": "Trust & Anxiety Research",
        "hint": "Public trust surveys · first-ride anxiety mapping",
        "pills": null
      },
      {
        "icon": "📐",
        "phase": "Define",
        "label": "Dual Interface Architecture",
        "hint": "Passenger app · fleet dashboard · shared data layer",
        "pills": null
      },
      {
        "icon": "✏️",
        "phase": "Design",
        "label": "Safety Communication System",
        "hint": "Edge case language · alert hierarchy · calm tone",
        "pills": null
      },
      {
        "icon": "✅",
        "phase": "Validate",
        "label": "Trust Testing",
        "hint": "Pre/post trust measurement · first-ride experience",
        "pills": null
      }
    ],
    "challenges": [
      {
        "category": "Trust",
        "items": [
          "60%+ of public uncomfortable with autonomous vehicles",
          "Trust built in 30 seconds or not at all",
          "Edge cases that destroy trust if handled poorly"
        ]
      },
      {
        "category": "Operations",
        "items": [
          "30–100 simultaneous vehicles requiring real-time oversight",
          "Alert triage without overwhelming fleet managers",
          "Autonomous decision-making that managers can override"
        ]
      },
      {
        "category": "Accessibility",
        "items": [
          "AODA and ADA compliance at minimum",
          "Voice interface for visually impaired passengers",
          "Boarding assistance flows for mobility-impaired users"
        ]
      }
    ],
    "challengePairs": [
      {
        "challenge": "60% of passengers uncomfortable with autonomous vehicles",
        "response": "Real-time route display, passengers see vehicle decisions as they happen"
      },
      {
        "challenge": "Fleet managers overwhelmed by alerts at scale",
        "response": "Tiered alert system, P1/P2/P3 with different intervention requirements"
      },
      {
        "challenge": "Edge cases destroy passenger trust",
        "response": "Calm communication language, no \"error\", only \"adjusting route\""
      },
      {
        "challenge": "Accessibility requirements exceed human transit standards",
        "response": "Voice interface + large-format displays + boarding assistance flows"
      }
    ],
    "results": [
      {
        "label": "Passenger Trust",
        "before": "40% comfortable",
        "after": "78% after first ride",
        "improvement": "2× improvement",
        "icon": "✅"
      },
      {
        "label": "Fleet Visibility",
        "before": "Radio + phone",
        "after": "Real-time dashboard",
        "improvement": "Complete visibility",
        "icon": "📊"
      }
    ],
    "problemBullets": [
      {
        "keyword": "No trust",
        "text": "Passengers fear autonomous vehicles without a human driver present"
      },
      {
        "keyword": "No visibility",
        "text": "Fleet managers can't see 30–100 vehicles simultaneously"
      }
    ],
    "objectiveBullets": [
      {
        "keyword": "Transparency",
        "text": "Show vehicle decisions in real time, don't just reassure"
      },
      {
        "keyword": "Accessibility",
        "text": "Exceed human-operated transit accessibility standards"
      }
    ],
    "reflection": "Trust in autonomous systems is not built through reassurance, it's built through transparency. Every design decision in this project was about showing passengers and operators exactly what the system was doing, and why.",
    "ia": "SITUATION\nAutonomous vehicles entering public transit.\nPassengers do not trust them. Fleet managers lack the right decision interface.\nThe interface is the only trust signal when there is no driver.\n\nUSERS\nPrimary: Passengers — boarding a driverless vehicle for the first time\nSecondary: Fleet operators — managing 50 or more vehicles simultaneously\nTertiary: Mobility-impaired users — autonomous transit must exceed human-operated standards\n\nPROBLEM\nA human driver provides dozens of implicit trust signals.\nRemove the driver and all of them disappear.\nThe interface has 30 seconds when a passenger boards to replace them all.\n\nCONSTRAINTS\nNo driver to exercise human judgment on ambiguous situations\nInterface must work across passenger ages and technical literacy levels\nP1 alerts require immediate human decision — interface cannot bury them\nAccessibility must exceed human-operated transit standards, not match them\n\nPROCESS\nThree trust-building moments identified — boarding, in-transit, edge cases\nAlert triage system designed around P1/P2/P3 priority levels\nEdge case library — GPS loss, sleeping passenger, unexpected stop, route block\nAccessibility features designed for hardest user first principle\n\nKEY DECISIONS\nTransparency over reassurance — show what the vehicle is doing, not just that it is safe\nSingle-screen principle — every critical decision visible without scrolling\nHuman voice not tone for emergency communications\nOne-tap assistance connecting to remote operator within 30 seconds\nDesign for the hardest user first — every accessibility feature improves the experience for all\n\nTHE PRODUCT\nPassenger in-vehicle interface — real-time route, vehicle decisions, next stop\nFleet operations dashboard — fleet map, P1/P2/P3 alerts, 4-hour demand forecast\nBoarding flow — safety signal in first 30 seconds\nEdge case communication system — calm, directive, with clear next steps\nFull accessibility suite — voice interface, large text, automated ramp, multilingual\n\nOUTCOME\nTrust established through transparency not reassurance\nP1 alerts visible without scrolling on primary dashboard view\nFull accessibility compliance — voice, large text, boarding assistance, multilingual\nEdge cases designed with three-question framework: what to know, what to do, what happens next",
    "heroColor": "#1a1a2e",
    "heroTagline": "30 seconds to build trust in a driverless vehicle",
    "heroCategory": "Mobility · Transit",
    "heroYear": "2024",
    "previewMedia": "/projects/autonomous/Mockup-.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 100%)",
      "light": true,
      "badge": "Case Study · Mobility",
      "tags": [
        "Autonomous Transit",
        "2024",
        "Mobile + Dashboard"
      ],
      "synopsis": "Designing trust into motion, passenger and fleet interfaces for autonomous cabs and ferries that make driverless transit feel safe, readable, and human.",
      "metadata": [
        "2024",
        "Product Designer",
        "Solo"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "Designing for Trustless Environments",
        "teaser": "The interface is the only thing standing between fear and confidence in autonomous transit.  A human driver provides doz.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "The interface is the only thing standing between fear and confidence in autonomous transit.  A human driver provides dozens of implicit trust signals, eye contact, a nod, the sound of the engine responding to acceleration.  Remove the driver and all of those signals disappear."
          },
          {
            "type": "p",
            "text": "Three trust-building moments defined the passenger experience design.  Boarding: is this safe?  The first 30 seconds when a passenger enters an autonomous vehicle for the first time are the highest-stakes moment in the entire journey."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Safety Communication Design",
        "teaser": "Safety is not a feature you can add to an interface.  It is a feeling created through every micro-decision, colour, lan.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Safety is not a feature you can add to an interface.  It is a feeling created through every micro-decision, colour, language, timing, and crucially, what you choose not to show.  Showing too much information about the vehicle's sensor readings and decision algorithms would create anxiety, not confidence."
          },
          {
            "type": "p",
            "text": "Real-time route display shows passengers the planned path, upcoming turns, next stops, and estimated arrival time.  This is not navigation for the passenger, they are not driving.  It is decision transparency for the vehicle, shared with the passenger."
          }
        ]
      },
      {
        "ep": "03",
        "title": "The Operations Dashboard",
        "teaser": "Fleet managers do not need more data.  They need the right data, in the right sequence, at the moment a decision must be.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Fleet managers do not need more data.  They need the right data, in the right sequence, at the moment a decision must be made.  The operations dashboard was designed for people managing 50 or more autonomous vehicles simultaneously, each generating continuous sensor data, position updates, and passenger status information."
          },
          {
            "type": "p",
            "text": "The alert triage system organised everything around three priority levels.  P1 alerts require immediate human decision: vehicle stopped unexpectedly, passenger requesting assistance, route blockage requiring manual resolution.  P2 alerts require action within 5 minutes: vehicle health warning, capacity issue at a stop, unusual route deviation."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Edge Case Handling in UI",
        "teaser": "Designing for what works is design.  Designing for what breaks is product maturity.  Autonomous transit generates edge c.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Designing for what works is design.  Designing for what breaks is product maturity.  Autonomous transit generates edge cases that human-operated transit never encounters because the vehicle cannot exercise human judgment to resolve ambiguous situations."
          },
          {
            "type": "p",
            "text": "Four edge cases that shaped the design: GPS signal loss in underground sections, the interface needed to communicate that the vehicle was still operating correctly on a cached route without causing passenger alarm.  A passenger falling asleep past their stop, the system detects inactivity and gently surfaces an alert without waking the passenger abruptly.  Unexpected vehicle stopping, the communication to the passenger had to convey that the stop was intentional and brief, not a malfunction."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Public Transit Accessibility",
        "teaser": "Autonomous transit must be more accessible than human-operated transit, not less.  The removal of a driver creates new a.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Autonomous transit must be more accessible than human-operated transit, not less.  The removal of a driver creates new accessibility challenges, no one to assist a passenger who needs help boarding, no human to notice that a passenger is confused or distressed.  The interface and the physical vehicle design have to carry that responsibility."
          },
          {
            "type": "p",
            "text": "Specific accessibility features designed and specified: voice interface for visually impaired passengers providing full app functionality through voice commands and audio feedback.  Large-format in-vehicle displays designed for cognitive accessibility, high contrast, large text, simple iconography.  Boarding assistance flows with automated ramp deployment triggered through the app, and extended boarding time available on request without needing to explain the reason."
          }
        ]
      }
    ],
    "artefacts": [
      {
        "title": "Figma Prototype",
        "type": "Design",
        "url": null
      },
      {
        "title": "Operations Dashboard",
        "type": "Design",
        "url": null
      },
      {
        "title": "Passenger App",
        "type": "Design",
        "url": null
      }
    ],
    "info": {
      "details": [
        {
          "label": "Timeline",
          "value": "2024"
        },
        {
          "label": "Role",
          "value": "Product Designer"
        },
        {
          "label": "Team",
          "value": "Solo"
        },
        {
          "label": "Platform",
          "value": "Mobile + Web Dashboard"
        },
        {
          "label": "Status",
          "value": "Concept & Prototype"
        }
      ],
      "tools": [
        {
          "label": "Design",
          "value": "Figma"
        },
        {
          "label": "Research",
          "value": "Trust Research, Accessibility Auditing"
        }
      ],
      "links": [
        {
          "label": "Figma File",
          "url": null
        }
      ]
    }
  }
];

export default projects;
