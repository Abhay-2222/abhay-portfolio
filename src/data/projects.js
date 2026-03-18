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
    "clientLogo": { "src": "/logos/ontario.jpg", "name": "Ontario Public Service" },
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
    "ia": "SITUATION\n600 Ontario meat inspectors. 5 districts.\nLegacy Siebel system unchanged for over a decade.\nSingle schedule change took 40 minutes.\n\nUSERS\nPrimary: Area Coordinators, daily shift management\nSecondary: Area Managers, district coverage oversight\nTertiary: Meat Inspectors, field execution, no mobile access\n\nPROBLEM\nSiebel was designed for administrative compliance, not for the people doing the work.\nA single schedule change, something that should take 30 seconds, required navigating multiple screens, making phone calls, and manually resolving conflicts the software could not detect.\nInspectors had built their own shadow system: personal spreadsheets, group texts, handwritten notes that management did not know existed.\nThe official workflow and the actual workflow had diverged so far that nobody had a clear picture of what was happening in the field.\nWhen emergencies hit, reassigning inspectors took 40 minutes. Districts absorbed errors in silence because escalating them required even more paperwork.\nThe system was not broken. It was simply never designed for the humans running it.\n\nCONSTRAINTS\nGovernment procurement, FSL licenses already purchased\nAODA compliance required under Ontario law\nMultiple approval chains before any design decision\nSalesforce FSL defaults could not be changed without documented justification\n\nPROCESS\n12 stakeholder interviews across 3 roles\nService blueprinting revealed gap between official and actual schedules\n6 FSL components required custom AODA-compliant overrides\nField testing in slaughterhouse environments\n\nKEY DECISIONS\nMobile-first for field inspectors, single task screens, 48px tap targets\nTreat FSL constraints as creative input not blockers\nDocument every custom component with accessibility rationale\nOffline capability non-negotiable for low-signal facilities\n\nTHE PRODUCT\nDesktop scheduling tool for coordinators and managers\nMobile field app for inspectors\nEmergency override workflow bypassing normal routing\nBulk shift creation across multiple facilities\nReal-time conflict detection\n\nOUTCOME\n93% faster scheduling\n80% faster emergency response\nInspectors described it as the first system built for them",
    "heroColor": "#0a2744",
    "heroTagline": "A schedule change from 40 minutes to 3",
    "heroCategory": "Enterprise · Government",
    "heroYear": "2024",
    "previewMedia": "/projects/meatinspector/Dashboard.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)",
      "light": true,
      "badge": "Case Study · Enterprise Gov",
      "videoUrl": "/projects/meatinspector/overview.mp4",
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
        "teaser": "A single schedule change took 40 minutes. Not because the work was hard. Because the tool was designed for the system, not the person doing the work.",
        "readTime": "4 min",
        "stats": [
          { "number": "40 min", "label": "for one schedule change" },
          { "number": "600+", "label": "inspectors across Ontario" },
          { "number": "5", "label": "districts, no mobile access" }
        ],
        "content": [
          {
            "type": "p",
            "text": "A single schedule change took up to 40 minutes. Not because scheduling an Ontario meat inspector is a complex problem. Because the tool they were using, a legacy Siebel system built for the system rather than the person, made every small task into a multi-screen ordeal."
          },
          {
            "type": "p",
            "text": "No support for part-day shifts. No emergency override flow. No real-time conflict detection. No mobile access for the 600 inspectors who were never at a desk. The system had been in place so long that workarounds had become the workflow."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Stakeholder Complexity",
        "teaser": "Government clients do not have users. They have constituents, bureaucracies, and approval chains. Designing for all three at once is its own discipline.",
        "readTime": "4 min",
        "powerMap": {
          "left": { "role": "Area Coordinators", "detail": "8+ years experience, daily pain points" },
          "right": { "role": "Director Level", "detail": "4 levels up, final sign-off authority" },
          "gap": "The Gap",
          "stats": ["12 interviews", "3 roles", "4 approval levels"]
        },
        "content": [
          {
            "type": "p",
            "text": "We ran 12 interviews across three roles in the first six weeks. What became clear quickly: the people who knew the most about what needed to change had the least authority to approve it. Area coordinators had lived with the pain for years. The sign-off chain ran four levels above them."
          },
          {
            "type": "p",
            "text": "AODA compliance was not a checklist item here, it was a legal obligation. Procurement timelines governed what could be built versus configured. Every design decision needed approval before it could move. We learned to ship nothing we were not prepared to defend in writing."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Design Insights",
        "teaser": "Government design is not just public sector UX. Every decision carries compliance weight, procurement constraints, and the accountability of 600 working people.",
        "readTime": "4 min",
        "quotes": [
          { "text": "The people who knew the most about what needed to change had the least authority to approve it.", "role": "Area Coordinator" },
          { "text": "We learned to ship nothing we were not prepared to defend in writing.", "role": "Design Lead observation" },
          { "text": "Accessibility was a legal obligation, not a nice-to-have.", "role": "AODA requirement" }
        ],
        "content": [
          {
            "type": "p",
            "text": "12 interviews across three roles revealed a consistent pattern: the people with the deepest operational knowledge were never the ones with approval authority. Area coordinators knew exactly what needed to change. The sign-off chain ran four levels above them."
          },
          {
            "type": "p",
            "text": "Government design carries obligations that corporate work does not. AODA compliance is a legal requirement. Scheduling data is accountability data, traceable and auditable. The 600 inspectors depending on this system had no fallback if it failed."
          },
          {
            "type": "p",
            "text": "The key shift: treating accessibility and consistency as design constraints rather than legal checkboxes produced a better product. WCAG 2.1 AA contrast ratios were enforced at component level. Where FSL defaults fell short, they were replaced with custom-built alternatives."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Design System",
        "teaser": "Working within Salesforce Lightning forced precision. Every component had to meet WCAG 2.1 AA, work in gloves on mobile, and stay consistent with a platform 600 inspectors already knew.",
        "readTime": "3 min",
        "auditData": {
          "stats": [
            { "number": "WCAG AA", "label": "Enforced at component level" },
            { "number": "48px", "label": "Min tap target (gloved use)" },
            { "number": "60%", "label": "Built on FSL native components" }
          ],
          "codeSnippet": "ALWAYS use Salesforce Lightning Design System tokens\nNEVER break WCAG 2.1 AA contrast — enforced in component review\nGantt: gold=Scheduled · pink=Unscheduled · purple=InProgress · blue=Completed · slate=Break\nTab nav: ALL CAPS + letter-spacing + lime green active underline\nMobile: 48×48px targets · offline-first sync · single-action screens",
          "designSystem": {
            "cards": ["colors", "typography", "status", "buttons"],
            "colorScale": {
              "label": "Palette / FSL Gantt Blocks + Brand",
              "stops": [
                { "stop": "scheduled",   "hex": "#D4AA50" },
                { "stop": "unscheduled", "hex": "#F08080" },
                { "stop": "in-progress", "hex": "#A67FC4" },
                { "stop": "completed",   "hex": "#42A5F5" },
                { "stop": "break",       "hex": "#546E7A" },
                { "stop": "active-tab",  "hex": "#4CAF50" }
              ]
            },
            "typography": {
              "label": "Foundation / Card & Nav Typography",
              "rows": [
                { "sample": "SA-0542  In Progress", "token": "Sans · 700 · 16px · card header", "size": 16, "weight": 700 },
                { "sample": "Facility · Work Type ID", "token": "Sans · 600 · 13px · field label", "size": 13, "weight": 600 },
                { "sample": "Gord's Abattoir Inc.", "token": "Sans · 400 · 13px · field value", "size": 13, "weight": 400 },
                { "sample": "SKILLS  RESOURCES  UTILIZATION", "token": "Sans · 400 · 11px · tab nav ALL CAPS", "size": 10, "weight": 400, "mono": false }
              ]
            },
            "status": {
              "label": "Status / All Six Appointment States",
              "items": [
                { "label": "Scheduled",    "color": "#A07A20", "bg": "#F5EDD0" },
                { "label": "Unscheduled",  "color": "#C43C3C", "bg": "#FCE8E8" },
                { "label": "In Progress",  "color": "#7B52A8", "bg": "#F0EAF8" },
                { "label": "Completed",    "color": "#1565C0", "bg": "#E3F2FD" },
                { "label": "Break/Holiday","color": "#37474F", "bg": "#ECEFF1" },
                { "label": "Draft",        "color": "#006D77", "bg": "#E0F5F5" }
              ]
            },
            "buttons": {
              "label": "Action Bar / Appointment Context Menu",
              "items": [
                { "label": "Schedule",       "bg": "transparent", "color": "#0070D2", "border": "1.5px solid #0070D2" },
                { "label": "Get Candidates", "bg": "transparent", "color": "#0070D2", "border": "1.5px solid #0070D2" },
                { "label": "Edit",           "bg": "transparent", "color": "#3C3C3C", "border": "1.5px solid #C8C8C8" },
                { "label": "Unschedule",     "bg": "transparent", "color": "#C43C3C", "border": "1.5px solid #C43C3C40", "opacity": 0.85 }
              ]
            }
          }
        },
        "content": [
          {
            "type": "p",
            "text": "Designing within Salesforce FSL forced a discipline that custom tools rarely require. Every component had to meet WCAG 2.1 AA contrast ratios, work under gloved hands on mobile, and feel native to a platform 600 inspectors were learning alongside a legacy migration."
          },
          {
            "type": "p",
            "text": "The gantt chart palette is semantic by rule: gold for scheduled appointments, salmon for unscheduled crew blocks, lavender for in-progress tasks, sky blue for completed, slate for breaks and holidays. A lime green active tab underline carries the navigation state. Color carries status, never decoration. Each SA card surfaces a 13-action context menu — Flag, Reschedule, Check Rules, Get Candidates, Change Status, Reshuffle, Map, Pin, Unschedule — that had to be reachable in two taps on mobile."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Salesforce FSL Constraints",
        "teaser": "Designing within a platform is harder than designing from scratch. Every decision required negotiating with what Salesforce FSL would and would not allow.",
        "readTime": "4 min",
        "content": [
          {
            "type": "p",
            "text": "Designing within a platform is harder than designing from scratch. Every decision required negotiating with what Salesforce Field Service Lightning would and would not allow. The constraint was real and non-negotiable, the client had already purchased FSL licenses and the procurement decision was final."
          },
          {
            "type": "p",
            "text": "What FSL gave us for free: appointment scheduling, resource management, service territory mapping, work order lifecycle, and mobile field service app. These covered roughly 60% of the requirements without custom development."
          }
        ]
      },
      {
        "ep": "06",
        "title": "The Mobile Experience",
        "teaser": "Field inspectors work in slaughterhouses and cold storage, in gloves, on the move. The mobile interface had to work in the most hostile conditions possible.",
        "readTime": "4 min",
        "videoUrl": "/projects/meatinspector/mobile.mp4",
        "videoFit": "contain",
        "layout": "split",
        "hasDashboard": true,
        "mockupGradient": "linear-gradient(160deg, #1a3050 0%, #2E6DB4 100%)",
        "auditData": {
          "stats": [
            { "number": "3", "label": "Bottom nav tabs: Schedule / Notifications / Profile" },
            { "number": "6", "label": "Workflow actions per appointment" },
            { "number": "48px", "label": "Min tap target — gloved field use" }
          ],
          "codeSnippet": "Bottom nav: Schedule · Notifications · Profile — blue underline on active\nInspection tabs: OVERVIEW · DETAILS · FEED · RELATED — dark bar, white underline\nActions sheet: En Route · Running Late · Inspection Complete · Send an Update\nToasts: green=success · orange=warning — stack bottom-right · auto-dismiss",
          "designSystem": {
            "cards": ["colors", "typography", "status", "buttons"],
            "colorScale": {
              "label": "Mobile Palette / App Shell + Feedback",
              "stops": [
                { "stop": "brand",    "hex": "#0070D2" },
                { "stop": "nav-dark", "hex": "#1A1A1A" },
                { "stop": "surface",  "hex": "#FFFFFF" },
                { "stop": "success",  "hex": "#2E7D32" },
                { "stop": "warning",  "hex": "#E65100" },
                { "stop": "overlay",  "hex": "#3C3C3C" }
              ]
            },
            "typography": {
              "label": "Mobile Typography / Nav + Card Hierarchy",
              "rows": [
                { "sample": "⚡ Actions", "token": "Sans · 600 · 15px · actions header", "size": 15, "weight": 600 },
                { "sample": "Schedule   Notifications   Profile", "token": "Sans · 400 · 11px · bottom nav labels", "size": 11, "weight": 400 },
                { "sample": "OVERVIEW  DETAILS  FEED  RELATED", "token": "Sans · 500 · 11px · tab nav ALL CAPS", "size": 10, "weight": 500, "mono": false },
                { "sample": "Inspection Type · 8:00", "token": "Sans · 400 · 13px · agenda row", "size": 13, "weight": 400 }
              ]
            },
            "status": {
              "label": "Workflow States / Inspector Action Sheet",
              "items": [
                { "label": "En Route",            "color": "#0070D2", "bg": "#EBF5FB" },
                { "label": "Running Late",         "color": "#E65100", "bg": "#FBE9E7" },
                { "label": "Inspection Complete",  "color": "#2E7D32", "bg": "#E8F5E9" },
                { "label": "Send an Update",       "color": "#0070D2", "bg": "#EBF5FB" },
                { "label": "Accept Change",        "color": "#5C4A9E", "bg": "#EDE7F6" },
                { "label": "Toast / Must Select",  "color": "#E65100", "bg": "#FFF3E0" }
              ]
            },
            "buttons": {
              "label": "Mobile CTAs / Modals + Feed Actions",
              "items": [
                { "label": "Update",   "bg": "#0070D2",     "color": "#fff",     "border": "none" },
                { "label": "Send",     "bg": "#0070D2",     "color": "#fff",     "border": "none" },
                { "label": "Cancel",   "bg": "transparent", "color": "#0070D2",  "border": "1.5px solid #0070D2" },
                { "label": "Like",     "bg": "transparent", "color": "#54698D",  "border": "1.5px solid #C8C8C8" },
                { "label": "Comment",  "bg": "transparent", "color": "#54698D",  "border": "1.5px solid #C8C8C8" }
              ]
            }
          }
        },
        "content": [
          {
            "type": "p",
            "text": "Field inspectors do not sit at desks. They work in slaughterhouses, processing facilities, and cold storage environments. Designing for people in gloves, on the move, in environments with variable signal required a completely different philosophy from the desktop scheduling tool."
          },
          {
            "type": "p",
            "text": "The mobile component set was built around three navigation layers: a bottom nav (Schedule, Notifications, Profile), inspection-level tabs (Overview, Details, Feed, Related on a dark bar), and notification filters (All, Unread, Read). The actions bottom sheet gives inspectors six workflow steps in sequence — En Route, Running Late, Inspection Complete, Send an Update, Open in Salesforce, Accept Change — each a single tap, no forms. Toast notifications stack bottom-right: green for success, orange for warnings. The calendar view shows the full month with blue dot indicators, tapping a day reveals the day agenda below."
          }
        ]
      },
      {
        "ep": "07",
        "title": "The Outcomes",
        "teaser": "40 minutes down to under 3. Not because the work got simpler. Because the tool finally matched the people doing it.",
        "readTime": "4 min",
        "impactStats": [
          { "before": "40 min", "after": "< 3 min", "label": "Schedule change", "delta": "−93%" },
          { "before": "40 min", "after": "< 5 min", "label": "Emergency response", "delta": "−80%" },
          { "before": "5/day", "after": "2/day", "label": "Scheduling errors", "delta": "−60%" }
        ],
        "content": [
          {
            "type": "p",
            "text": "A schedule change that used to take 40 minutes now takes under 3. That is not a small improvement on a bad process, it is a fundamentally different one. Coordinators gained back hours each day that had previously gone into navigating a tool designed for the system, not for them."
          },
          {
            "type": "p",
            "text": "Emergency coverage is now real-time. When an inspector calls in sick, a coordinator can see who is available, where they are, and what qualifications they hold, and reassign in under 5 minutes. Previously that was a phone call through a contact list. The difference is not just speed. It is the difference between controlled and improvised."
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
    "liveUrl": "https://wisemeals.vercel.app",
    "partnerLogo": {
      "name": "Instacart",
      "src": "/logos/instacart.webp",
      "url": "https://www.instacart.com",
      "context": "Partner · Branded Launch"
    },
    "description": "A mobile-first meal planning app that connects planning, shopping, budget, and nutrition in one interface. Moving toward a branded Instacart launch as a sole partner product.",
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
    "ia": "SITUATION\n200 food-related decisions per person per day.\nMeal planning, grocery, nutrition, pantry, and budget all in separate tools.\nEvery competitor solves one or two of the five jobs. None solve all five.\n\nUSERS\nPrimary: The planner-shopper-cook-budget manager, one person, four hats\nSecondary: Health-conscious users tracking nutrition without clinical obsession\nTertiary: Budget-constrained households managing food costs weekly\n\nPROBLEM\nOn any given Wednesday, figuring out dinner requires a person to be a meal planner, grocery shopper, budget manager, and cook simultaneously.\nEvery existing app is built for exactly one of those roles. The result is five open tabs and a decision that should take two minutes taking twenty.\nEach context switch carries cognitive overhead that most people resolve by abandoning the plan entirely and defaulting to takeout or whatever is already in the fridge.\nMost users ate the same 12 meals on rotation, not because they wanted to, but because planning anything different was genuinely too hard.\nFood waste, unexpected grocery bills, and nutrition gaps were downstream effects of a tooling problem, not a motivation problem.\nThe person wearing all four hats had never been the primary user of any single product.\n\nCONSTRAINTS\n375px screen with a 7-day 3-meal planning grid, unsolved mobile UX problem\nNutrition display must inform without creating anxiety or moralising food\nNo bold text anywhere, eating is calm, the app must feel calm\nSecurity, personal health and budget data requires CVE-level attention\n\nPROCESS\nThree layout approaches tested and rejected before solution found\nNutrition display philosophy established before any screens designed\nCopy last week emerged as most-requested feature in user testing\nThree CVEs discovered and patched during active development\n\nKEY DECISIONS\nHorizontal day selector plus vertical meal list, one axis at a time\nFour nutrition numbers maximum, awareness without obsession\nCopy last week as first-class feature, most people eat 10 to 15 meals on rotation\nWeight 400 typography throughout, no bold, no urgency signals\n\nTHE PRODUCT\nWeekly planning grid with horizontal day navigation\nAuto-generated grocery list aggregated from weekly plan\nNutrition summary row per day, no targets or progress bars\nPantry tracking with expiry awareness\nBudget tracking integrated with grocery list\n\nOUTCOME\n78% reduction in planning time, 45 minutes to 10 minutes\nAll five jobs-to-be-done in one interface\nThree CVEs patched during development\nZero competitors cover all five jobs confirmed post-launch",
    "heroColor": "#3a1f0a",
    "heroTagline": "Five jobs. One interface.",
    "heroCategory": "Consumer · Health",
    "heroYear": "2025",
    "previewMedia": "/projects/mealplanner/Empty States.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 100%)",
      "light": true,
      "badge": "Case Study · Consumer Health",
      "videoUrl": "/projects/mealplanner/mobile.mp4",
      "videoFit": "contain",
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
        "title": "The Five Jobs No App Solves Together",
        "teaser": "On a Wednesday evening trying to figure out dinner, you are planner, shopper, cook, and budget manager at once. Every existing app is built for just one of those people.",
        "readTime": "3 min",
        "stats": [
          { "number": "200+", "label": "food decisions per day" },
          { "number": "5", "label": "tools to manage one week of food" },
          { "number": "30–40%", "label": "avg household grocery waste" }
        ],
        "content": [
          {
            "type": "p",
            "text": "On a Wednesday evening figuring out what to make for dinner tomorrow, you are four people at once: the planner thinking about the week, the shopper wondering what is in the fridge, the cook deciding what is realistic after a long day, and the budget manager checking what is left before payday. Every existing app is built for just one of them."
          },
          {
            "type": "p",
            "text": "Mealime plans. Paprika stores recipes. Cronometer tracks nutrients. YNAB manages budget. Each is excellent at its one job. None of them talk to each other. MealPlan is built for the person who needs all four jobs done in one place, without switching apps between every decision."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Building Toward an Instacart Launch",
        "teaser": "This started as a personal project to scratch a real itch. It is now moving toward a branded launch with Instacart.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "MealPlan started as a personal project because I was genuinely frustrated with the fragmentation. The prototype worked. The loop was tight: plan the week, the grocery list generates automatically, the budget updates in real time. Then the opportunity grew bigger than a side project."
          },
          {
            "type": "p",
            "text": "The app is now in early conversations with Instacart toward a sole branded launch. That integration makes the loop native: a plan generated on Sunday becomes a cart, a cart becomes a delivery, everything stays in one interface. That is not a feature. That is the product becoming what it was always meant to be."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Design System",
        "teaser": "Calm over urgency. No bold, anywhere. A warm neutral palette built around food semantics — sage for fresh, wheat for budget, terracotta for warnings.",
        "readTime": "3 min",
        "auditData": {
          "stats": [
            { "number": "400", "label": "Font weight, always" },
            { "number": "40+", "label": "UI components built" },
            { "number": "3", "label": "CVEs patched in production" }
          ],
          "codeSnippet": "NEVER use font-weight bold — size + color carry hierarchy\nALWAYS use CSS variables — no hardcoded colours\nBorders optional — elevation via warm shadow only\nMotion: t-fast 100ms · t-base 160ms · t-slow 240ms",
          "designSystem": {
            "cards": ["colors", "typography", "tokens", "buttons"],
            "colorScale": {
              "label": "Palette / Warm Cream + Food Semantics",
              "stops": [
                { "stop": "cream", "hex": "#fdfaf6" },
                { "stop": "sage-l", "hex": "#e8f2e9" },
                { "stop": "sage", "hex": "#7a9e7e" },
                { "stop": "wheat", "hex": "#d4a84b" },
                { "stop": "terra", "hex": "#c17f5a" },
                { "stop": "stone", "hex": "#2c251e" }
              ]
            },
            "typography": {
              "label": "Foundation / Typography",
              "rows": [
                { "sample": "Weekly Planner", "token": "Lora · display · 400", "size": 20, "weight": 400, "serif": true },
                { "sample": "Grilled Salmon", "token": "DM Sans · body · 400", "size": 14, "weight": 400 },
                { "sample": "CALORIES 420", "token": "DM Mono · data · 400", "size": 10, "weight": 400, "mono": true }
              ]
            },
            "tokens": {
              "label": "Design Tokens",
              "items": [
                { "name": "--color-sage",      "value": "#7a9e7e",  "dot": "#7a9e7e" },
                { "name": "--color-wheat",     "value": "#d4a84b",  "dot": "#d4a84b" },
                { "name": "--color-terra",     "value": "#c17f5a",  "dot": "#c17f5a" },
                { "name": "--surface-primary", "value": "#fdfaf6",  "dot": "#fdfaf6" },
                { "name": "--text-body",       "value": "DM Sans · 400", "dot": null },
                { "name": "--radius-md",       "value": "12px",     "dot": null },
                { "name": "--t-base",          "value": "160ms",    "dot": null }
              ]
            },
            "buttons": {
              "label": "Components / Buttons",
              "items": [
                { "label": "Add to Plan",    "bg": "#4d7552",     "color": "#fff",     "border": "none" },
                { "label": "Generate List",  "bg": "transparent", "color": "#4d7552",  "border": "1.5px solid #4d7552" },
                { "label": "Skip Week",      "bg": "transparent", "color": "#4d7552",  "border": "1.5px solid transparent", "opacity": 0.7 },
                { "label": "Remove Item",    "bg": "#f5e8de",     "color": "#934f2a",  "border": "1.5px solid #934f2a40" }
              ]
            }
          }
        },
        "content": [
          {
            "type": "p",
            "text": "The design system started from a philosophical constraint: eating is calm, the app must feel calm. That ruled out urgency signals — no bold text, no high-contrast alerts, no progress bars implying you are behind on a target."
          },
          {
            "type": "p",
            "text": "The palette is built around food semantics rather than generic UI conventions. Sage means fresh and healthy. Wheat signals budget and resources. Terracotta marks warnings. Every colour has a food-world meaning the user already understands."
          },
          {
            "type": "p",
            "text": "The typography rule is absolute: weight 400 throughout. Hierarchy comes only from size and colour. This was technically enforced as a global CSS rule and caught in review — not a soft guideline."
          }
        ]
      },
      {
        "ep": "04",
        "title": "The Weekly Planning Interface",
        "teaser": "Fitting 21 meals on a 375px screen is genuinely hard. A calendar felt wrong. A spreadsheet felt worse. Here is what worked.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "You need to see the whole week to plan it effectively. But a 7x3 grid on a phone screen is too dense to read, and a calendar view imports the wrong mental model entirely. Meals are not events. They do not have start times and attendees."
          },
          {
            "type": "p",
            "text": "The solution is a horizontally scrollable week where each day shows its meals collapsed. Everything is visible at a glance. Tap a slot to expand and add a meal. No vertical scrolling to see the full week. The information architecture feels obvious once you see it, which means it took a while to find."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Where We Are Now",
        "teaser": "Live and working. No impact metrics yet because this is still being built. The Instacart path is in early stages. Honest about where we are.",
        "readTime": "2 min",
        "impactStats": [
          { "before": "45 min", "after": "< 10 min", "label": "Weekly planning time", "delta": "−78%" },
          { "before": "5 tools", "after": "1", "label": "Apps needed", "delta": "−80%" },
          { "before": "30–40%", "after": "<15%", "label": "Grocery waste", "delta": "target" }
        ],
        "content": [
          {
            "type": "p",
            "text": "The app is live as a working prototype. Weekly planning, automatic grocery list generation, budget tracking, and nutrition summaries all function. The live demo is real and available."
          },
          {
            "type": "p",
            "text": "There are no impact metrics yet. This is still being built. The Instacart partnership is in early conversations. This case study reflects decisions and process to date, not a finished story. That part is still being written."
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
    "accentColor": "#2044BB",
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
    "ia": "SITUATION\nHealthcare utilization review runs on 8 disconnected tools.\nUR nurses spend 40 minutes per case on data archaeology.\nDenial rates sit at 30 to 40%. Gaps found after submission, not before.\n\nUSERS\nPrimary: UR Nurse, 80% of volume, full accountability risk\nSecondary: Physician, escalations only, under 20% of cases\nTertiary: Medical Director, audit and oversight, under 5%\n\nPROBLEM\nThe toolchain was built around physicians, the least frequent user in the workflow.\nUR nurses handle 80% of cases and carry the full accountability risk, but had the worst tools in the system.\nEvery morning started the same way: 8 browser tabs, patient charts scattered across disconnected portals, 40 minutes of data archaeology per case.\nDenials were discovered after submission, at the point where appeals were expensive and time-consuming to fight.\nThe information needed to prevent every denial already existed somewhere in the system.\nNobody had designed a way to surface it before it was too late.\n\nCONSTRAINTS\nRegulated clinical environment, AI cannot make autonomous decisions\nEvery recommendation must be traceable and citable\nHIPAA compliance non-negotiable\nStakeholder trust in AI was low from day one\n\nPROCESS\n4 structural ambiguities resolved before wireframing\nPrimary user redefined from physician to UR nurse in week 4\n6 design mistakes documented across V1 and V2\n4 full iterations before V4 was accepted\n\nKEY DECISIONS\nWork Queue over Home screen, action-first product stance\nCareLens as mandatory sidebar, explainability is infrastructure\nAudit trail on every AI output, defensibility over convenience\nProactive gap resolution, surface problems before submission not after\n\nTHE PRODUCT\n7-stage workflow: Work Queue, Case Summary, Policy Validation,\nCareLens Sidebar, Gap Resolution, Physician Approval, Submission\nRole-based routing for nurse, physician, and director\nEvery AI output citable, every decision logged\n\nOUTCOME\n75% reduction in case prep time\n40% target denial rate reduction\n108% throughput increase per nurse\n$2.5M annual revenue protection per hospital",
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
      ],
      "videoUrl": "/projects/healthcare/Caresummariser%20Overview.mp4",
      "videoFit": "cover",
      "videoScale": 1
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Problem",
        "teaser": "UR nurses spend 40 or more minutes per case doing data archaeology across 8 or more tools.  The data exists.  The decisi.",
        "readTime": "4 min",
        "diagramKey": "problem",
        "stats": [
          { "number": "40 min", "label": "per case, data archaeology" },
          { "number": "8+", "label": "tools open simultaneously" },
          { "number": "30–40%", "label": "industry denial rate" }
        ],
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
        "title": "Design System Audit",
        "teaser": "We built fast. Then we looked at what we actually built. Three competing color systems, 39 files off-token, and an AI quietly making it worse.",
        "readTime": "4 min",
        "auditData": {
          "stats": [
            { "number": "3", "label": "Competing color systems" },
            { "number": "39", "label": "Files bypassing token system" },
            { "number": "20%", "label": "Token adoption at audit" }
          ],
          "codeSnippet": "# CLAUDE.md — Token Enforcement\nALWAYS use CSS variables from tokens.css\nNEVER hardcode hex colors — use --color-[semantic-name]\nComponents: background → var(--surface-primary), text → var(--text-primary)",
          "designSystem": {
            "colorScale": {
              "label": "Palette / Clinical Blue",
              "stops": [
                { "stop": "50",  "hex": "#EEF2FC" },
                { "stop": "200", "hex": "#9DB8EC" },
                { "stop": "400", "hex": "#4F7BD6" },
                { "stop": "600", "hex": "#2044BB" },
                { "stop": "800", "hex": "#112247" },
                { "stop": "900", "hex": "#0A1836" }
              ]
            },
            "typography": {
              "label": "Foundation / Typography",
              "rows": [
                { "sample": "Patient Summary",   "token": "DM Sans · 600 · 20px", "size": 20, "weight": 600 },
                { "sample": "Clinical overview",  "token": "DM Sans · 400 · 14px", "size": 14, "weight": 400 },
                { "sample": "CASE STATUS",        "token": "DM Mono · 400 · 10px", "size": 10, "weight": 400, "mono": true }
              ]
            },
            "status": {
              "label": "Status / Clinical States",
              "items": [
                { "label": "Authorized", "color": "#287A50", "bg": "#EDF7F2" },
                { "label": "Pending",    "color": "#a07028", "bg": "#FDF4E3" },
                { "label": "Denied",     "color": "#C43C3C", "bg": "#FDF0F0" },
                { "label": "Escalated",  "color": "#6B4FD4", "bg": "#F3F0FD" },
                { "label": "Draft",      "color": "#5a5248", "bg": "#F5F3F0" }
              ]
            },
            "buttons": {
              "label": "Components / Actions",
              "items": [
                { "label": "Authorize Case",  "bg": "#2044BB",     "color": "#fff",     "border": "none" },
                { "label": "Request Info",    "bg": "transparent", "color": "#2044BB",  "border": "1.5px solid #2044BB" },
                { "label": "Escalate",        "bg": "#FDF0F0",     "color": "#C43C3C",  "border": "1.5px solid #C43C3C40" }
              ]
            }
          }
        },
        "content": [
          {
            "type": "p",
            "text": "When you move fast, the codebase tells the story of every shortcut taken. We audited what we had built and found three competing color systems that had drifted in independently. 39 files were bypassing the token system entirely. Total token adoption: 20%."
          },
          {
            "type": "p",
            "text": "The more interesting problem was invisible. AI-assisted development was generating new components that looked fine visually but quietly broke the token contract every time. There was no enforcement layer, so every new feature was a coin flip. We needed guardrails, not just cleanup."
          },
          {
            "type": "p",
            "text": "We built a custom component library with Claude Code and wrote a CLAUDE.md that enforces token usage at the generation layer. Now the AI produces compliant code by default. The design system is still evolving as the product grows, but the floor is solid."
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
        "teaser": "A nurse should never have to wonder what to do next. Seven stages, each with one job, each handing off to the next.",
        "readTime": "4 min",
        "productSteps": [
          { "step": "01", "name": "Work Queue", "description": "Cases ranked by denial risk and time sensitivity" },
          { "step": "02", "name": "CareSummarizer", "description": "Clinical narrative generated from raw EHR data" },
          { "step": "03", "name": "CareLens", "description": "Confidence scores and reasoning at every AI output" },
          { "step": "04", "name": "Policy Validation", "description": "Documentation gaps flagged before submission" },
          { "step": "05", "name": "Gap Resolution", "description": "Nurse resolves gaps inline, not after denial" },
          { "step": "06", "name": "Physician Approval", "description": "Escalation routing for under 20% of cases" },
          { "step": "07", "name": "Submission", "description": "Clean, compliant, complete — first time" }
        ],
        "content": [
          {
            "type": "p",
            "text": "The product is built around one principle: a nurse should never have to wonder what to do next. The work queue tells her which cases need attention and why, ranked by denial risk and time sensitivity. No triage. No archaeology. Just the next case."
          },
          {
            "type": "p",
            "text": "CareSummarizer generates the clinical narrative from raw EHR data. CareLens surfaces confidence scores and reasoning traces at every AI output, so nothing is a black box. Policy validation flags documentation gaps before submission, not after denial. Seven stages, each with one job, each handing off cleanly to the next."
          }
        ]
      },
      {
        "ep": "07",
        "title": "The Impact",
        "teaser": "A nurse used to spend 40 minutes per case just finding the data to make a decision. Not making the decision. Finding the data.",
        "readTime": "4 min",
        "impactStats": [
          { "before": "40 min", "after": "8–12 min", "label": "Case prep time", "delta": "−75%" },
          { "before": "30–40%", "after": "<5%", "label": "Target denial rate", "delta": "target" },
          { "before": "1×", "after": "2.08×", "label": "Throughput per nurse", "delta": "+108%" },
          { "before": "—", "after": "$2.5M", "label": "Revenue protection / hospital", "delta": "annual" }
        ],
        "content": [
          {
            "type": "p",
            "text": "A nurse used to spend 40 minutes per case doing data archaeology across 8 tools. Not making the decision. Not writing the justification. Just finding the information she needed to get started. CareSummarizer brought that down to 8 to 12 minutes. The recovered time goes back to care."
          },
          {
            "type": "p",
            "text": "Denial rates sit at 30 to 40% across the industry. The target is below 5%. That gap is not a data problem, it is a preparation problem. When nurses can surface and resolve documentation gaps before submission, the denial rate has nowhere to hide."
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
    "ia": "SITUATION\nSpencer Creek Historical Trail, 2.5km in Dundas, Ontario.\nPhysically fragmented. Almost no digital presence.\nRich history invisible to anyone who did not already know it.\n\nUSERS\nPrimary: First-time visitors, no context, no discovery tools\nSecondary: Long-time residents, deep emotional connection, no way to share it\nTertiary: Rotary Club and City of Hamilton, community stewardship goals\n\nPROBLEM\nGoogle Maps could route you to the trailhead. It could not tell you the stone bridge ahead was built by Dundas's earliest settlers.\nThe heritage knowledge existed, held by historians, longtime residents, and the Rotary Club, but there was no mechanism to share it with anyone walking the trail for the first time.\nLong-time residents watched the trail fragment without a way to pass on what it meant to them.\nVisitors arrived, walked, and left without encountering any of the history beneath their feet.\nThe disconnection was not physical. It was cultural, and it was accelerating with every year the trail stayed undocumented.\nPeople were not losing a path. They were losing a story, and the window to preserve it was closing.\n\nCONSTRAINTS\nOutdoor UX is hostile, glare, gloves, variable signal, distracted attention\nAR calibration across 3 terrain types: open meadow, dense forest, riverbank\nThe digital layer must not compete with the trail experience\nBudget and timeline ruled out full AR recreation of lost sections\n\nPROCESS\n7 months of research\nWalked every section multiple times across seasons\nInterviewed Dundas Museum historians\nWorkshops with Sunrise Rotary Club stakeholders\nPokemon Go used as reference model for location-based discovery\nField usability testing in January\n\nKEY DECISIONS\nAR for discovery not navigation, the trail is the destination\nOne-handed interaction throughout, users are moving\nOffline fallback for forested signal-dead sections\nEmergency beacon reduced from two taps to one\nAudio over text at historical markers, feels like discovery not Wikipedia\n\nTHE PRODUCT\nAR historical overlay at GPS-triggered locations\nInteractive trail map with points of interest\nCommunity events and local vendor integration\nRewards and challenges tied to distance and discovery\nWildlife AR identification at creek sections\n\nOUTCOME\nField-tested across multiple seasons\nRotary Club and City of Hamilton stakeholder sign-off\nOffline mode supported full 3.4 mile trail",
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
        "title": "The Trail That Was Lost",
        "teaser": "Spencer Creek Trail once connected forests, bridges, and a century of stories into a single walk. Then the town grew, and the trail quietly fell apart.",
        "readTime": "3 min",
        "videoUrl": "/projects/trailar/trail-1.mp4",
        "videoFit": "contain",
        "stats": [
          { "number": "2.5km", "label": "trail, mostly fragmented" },
          { "number": "0", "label": "digital presence" },
          { "number": "100+", "label": "years of history, invisible" }
        ],
        "content": [
          {
            "type": "p",
            "text": "Spencer Creek Trail once wound through the heart of Dundas, connecting forests, bridges, and a century of local history into a single living walk. As the town grew and land changed hands, the trail slowly fell apart. What was once continuous became scattered. What was once remembered became invisible."
          },
          {
            "type": "p",
            "text": "Google Maps can get you to the trailhead. It cannot tell you that the limestone bridge was built by Dundas's first settlers, or that the industrial ruins along the creek were once the engine of an entire regional economy. The disconnection was not just physical. People were not losing a path. They were losing the story of where they came from."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Seven Months in the Field",
        "teaser": "You cannot design a community trail experience from a laptop. So we walked it. In January. In summer. In the rain. Then we listened.",
        "readTime": "4 min",
        "timeline": [
          { "month": "Jan", "phase": "Trail Walks", "activities": "Walked every section across seasons. Mapped physical breaks." },
          { "month": "Feb–Mar", "phase": "Observation", "activities": "Watched movement patterns. Bird watchers, cyclists, families." },
          { "month": "Apr–May", "phase": "Community Research", "activities": "Facebook groups, resident memory collection." },
          { "month": "May–Jun", "phase": "Archive Research", "activities": "Dundas Museum, historical maps, mill records." },
          { "month": "Jun–Jul", "phase": "Co-Creation", "activities": "Workshops with Rotary Club and city partners." },
          { "month": "Aug", "phase": "Synthesis", "activities": "Four opportunities defined. Prototype brief written." }
        ],
        "content": [
          {
            "type": "p",
            "text": "We started in January 2023, walking every section of the trail across seasons, because an experience that has to work in July also has to work in a Canadian winter. We watched how people moved, where they paused, what they ignored. Bird watchers at the creek. Cyclists on the paved stretch. Families who wandered until they found something interesting."
          },
          {
            "type": "p",
            "text": "The research went where field walks could not. Facebook groups full of residents sharing memories of the old stone bridges, the mills, the former railway station. The Dundas Museum opened their archives and walked us through historical maps that showed what the trail used to connect. Their historians knew things no app had ever captured."
          },
          {
            "type": "p",
            "text": "We ran co-creation workshops with the Rotary Club, city partners, and long-time residents. The same thing came up every time: people still felt a deep connection to this place. They just had no way to share it. That gap was the design opportunity."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Four Opportunities",
        "teaser": "Research synthesis revealed four clear gaps, not just for navigation, but for orientation, heritage, ecology, and community life.",
        "readTime": "4 min",
        "layout": "split",
        "mockupGradient": "linear-gradient(160deg, #1a3324 0%, #2D6A45 100%)",
        "pillars": [
          { "number": "01", "title": "Interactive Trail Map", "quote": "I've lived here 20 years and still don't know where the trail actually starts.", "tag": "Navigation" },
          { "number": "02", "title": "AR Story Stops", "quote": "I wish people still knew what the stone bridge meant to this town.", "tag": "Heritage" },
          { "number": "03", "title": "Eco Discovery Mode", "quote": "I never knew what wildlife actually lives here.", "tag": "Ecology" },
          { "number": "04", "title": "Community & Vendors", "quote": "The trail should feel like part of the town.", "tag": "Community" }
        ],
        "content": [
          {
            "type": "p",
            "text": "Co-creation workshops surfaced four distinct needs. Each reflected a real gap shaped by trail users, historians, and local partners."
          },
          {
            "type": "ul",
            "items": [
              "Interactive Trail Map, \"I have lived here 20 years and still do not know where the trail actually starts.\"",
              "AR Story Stops, \"We used to cross the old stone bridge as kids. I wish people still knew what it meant to this town.\"",
              "Eco Discovery Mode, \"I walk the trail all the time, but I never knew what wildlife actually lives here.\"",
              "Community Events & Local Vendors, \"The trail should feel like part of the town, not something hidden behind it.\""
            ]
          },
          {
            "type": "p",
            "text": "These four concepts became the foundation for the prototype. Every feature responds to a need stated by a real person, not a design assumption."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Designing for the Trail, Not the Screen",
        "teaser": "Every decision came down to one question: does this make the trail experience richer, or does it compete with it?",
        "readTime": "4 min",
        "videoUrl": "/projects/trailar/trail-2.mp4",
        "videoFit": "contain",
        "auditData": {
          "stats": [
            { "number": "1-hand", "label": "All interactions operable one-handed" },
            { "number": "5", "label": "Bottom nav tabs · Trail · Rewards · Map · Gallery · Profile" },
            { "number": "48px", "label": "Min tap target · gloves + motion use" }
          ],
          "codeSnippet": "Primary: #1B998B teal — buttons, active nav, progress\nReward/Challenge CTA: #F5A623 orange — claim, join, start\nBottom tracking bar: dark teal surface, white type\nNav: icon + label · active = teal fill · inactive = muted gray\nCards: white surface · 12px radius · soft drop shadow\nAudio-first at AR markers — text as fallback only",
          "designSystem": {
            "cards": ["colors", "typography", "status", "buttons"],
            "colorScale": {
              "label": "Palette / Trail + Reward Brand",
              "stops": [
                { "stop": "teal",      "hex": "#1B998B" },
                { "stop": "teal-light","hex": "#D1F0EC" },
                { "stop": "orange",    "hex": "#F5A623" },
                { "stop": "surface",   "hex": "#FFFFFF" },
                { "stop": "dark-bar",  "hex": "#1A3A38" },
                { "stop": "muted",     "hex": "#9CA3AF" }
              ]
            },
            "typography": {
              "label": "Foundation / App Typography",
              "rows": [
                { "sample": "22.40 Miles", "token": "Sans · 700 · 32px · distance hero", "size": 32, "weight": 700 },
                { "sample": "SCHT 20 Minute Run Challenge", "token": "Sans · 600 · 18px · challenge title", "size": 18, "weight": 600 },
                { "sample": "Desjardins Canal", "token": "Sans · 600 · 16px · POI card title", "size": 16, "weight": 600 },
                { "sample": "TIME  DISTANCE  ELEV. GAIN", "token": "Mono · 400 · 11px · stats bar labels", "size": 11, "weight": 400, "mono": true }
              ]
            },
            "status": {
              "label": "UI States / Trail + Reward Actions",
              "items": [
                { "label": "Active Trail",     "color": "#0F6B5F", "bg": "#D1F0EC" },
                { "label": "Claim Reward",     "color": "#B36A00", "bg": "#FEF3C7" },
                { "label": "Start Challenge",  "color": "#0F6B5F", "bg": "#D1F0EC" },
                { "label": "POI Discovered",   "color": "#1B998B", "bg": "#F0FDFB" },
                { "label": "SOS / Emergency",  "color": "#DC2626", "bg": "#FEE2E2" },
                { "label": "Offline Mode",     "color": "#4B5563", "bg": "#F3F4F6" }
              ]
            },
            "buttons": {
              "label": "Actions / CTA Hierarchy",
              "items": [
                { "label": "Next / Start",    "bg": "#1B998B", "color": "#fff",     "border": "none" },
                { "label": "Join Challenge",  "bg": "#F5A623", "color": "#fff",     "border": "none" },
                { "label": "Claim Voucher",   "bg": "#F5A623", "color": "#fff",     "border": "none" },
                { "label": "Skip",            "bg": "transparent", "color": "#1B998B", "border": "none" }
              ]
            }
          }
        },
        "principles": [
          { "rule": "AR for discovery, not navigation", "why": "The trail is the destination. The phone is the lens." },
          { "rule": "One-handed interaction throughout", "why": "People are moving. Both hands are never available." },
          { "rule": "Audio over text at markers", "why": "Hearing a story feels like discovery. Reading one feels like homework." },
          { "rule": "Emergency beacon in one tap", "why": "Safety cannot have friction. Reduced from two taps." }
        ],
        "content": [
          {
            "type": "p",
            "text": "Outdoor UX is hostile UX. Sunlight washes out screens. Cold hands miss small targets. Attention is split between the phone and the environment. We evaluated every interaction against a single question: does this make the trail experience richer, or does it compete with it? The digital layer is not the destination. The trail is."
          },
          {
            "type": "p",
            "text": "That principle drove concrete decisions. AR for discovery, not navigation. One-handed interaction throughout, because people are walking. Audio at historical markers instead of text, because hearing a story feels like discovery while reading one feels like homework. Emergency beacon reduced from two taps to one."
          },
          {
            "type": "p",
            "text": "AR calibration was harder than expected. Open meadow, dense forest, and riverbank all behave differently with GPS and camera. We sized trigger zones generously to account for camera shake during motion, and built offline fallback for the forested creek sections where signal consistently dropped."
          }
        ]
      },
      {
        "ep": "05",
        "title": "Testing Across Seasons",
        "teaser": "A trail app that only works in good weather is not a trail app. We tested in summer, autumn, and January.",
        "readTime": "3 min",
        "seasons": [
          { "season": "Summer", "finding": "AR markers worked well in open meadow. Signal strong." },
          { "season": "Autumn", "finding": "Trigger zones needed to be generously sized for camera shake." },
          { "season": "January", "finding": "Two-handed gestures failed. Gloves, cold, movement all hostile. Offline mode became a hard requirement." }
        ],
        "content": [
          {
            "type": "p",
            "text": "Lab usability testing and field usability testing are not the same thing. In a lab, users hold phones with both hands, stand still, and read carefully. On a trail in January, none of those things are true. Two-handed gestures were impossible while walking. AR markers that worked on a test bench flickered on a moving body. We made changes we never would have found indoors."
          },
          {
            "type": "p",
            "text": "Offline mode started as an enhancement and became a hard requirement the first time we lost signal in the forested section near the creek. The Rotary Club and City of Hamilton reviewed the final prototype and gave sign-off. Research and prototype are complete across the full 3.4 mile trail."
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
    "title": "Vosyn Co-Watch",
    "type": "Product Design",
    "client": "Vosyn AI",
    "org": "Streaming · Social Features",
    "sub": "Shared Viewing Experience",
    "timeline": "2024",
    "team": [
      "Vosyn AI Team"
    ],
    "platform": "Web + Mobile",
    "icon": "🎙️",
    "accentColor": "#7C4DCC",
    "route": "/vosyn",
    "status": "placeholder",
    "cardBadge": "Under NDA",
    "clientLogo": { "src": "/logos/vosyn.jpg", "name": "Vosyn AI" },
    "liveUrl": null,
    "description": "Designing shared presence for remote co-watching, making two people feel like they are in the same room even when they are not. Under NDA.",
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
    "ia": "SITUATION\nEnglish-only content reaches 17% of the world.\nCreators lose 83% of potential audience to language, not relevance.\nExisting solutions: too slow, too expensive, or strip cultural meaning.\n\nUSERS\nPrimary: Content creators, want language to be invisible to their workflow\nSecondary: Multilingual viewers, want native-quality experience\nTertiary: Platform team, need quality feedback loops to improve the model\n\nPROBLEM\nEvery existing localisation solution asks creators to make a tradeoff: reach more people, or preserve the integrity of your work.\nDubbing changes performance timing, breaks lip sync, and strips the emotional register that made the content worth watching in the first place.\nSubtitles exclude non-literate viewers and require eyes on text instead of on content.\nAI translation output was opaque. Creators received a finished version with no visibility into which segments were confident and which were guesses.\nWithout surfaced quality signals, creators either published blindly or rejected the output entirely, and because no corrections fed back to the model, it could not improve from real-world mistakes.\nThe problem was not that AI could not translate. It was that nothing in the workflow was designed to make AI translation trustworthy.\n\nCONSTRAINTS\nAI output quality is a spectrum, not binary\nCreators are not linguists, cannot assess output technically\nEvery correction must feed back into model improvement\nPublishing workflow cannot add meaningful friction\n\nPROCESS\nCreator workflow mapping, where does language decision happen\nQuality review flow, how much review is appropriate before publishing\nConfidence indicator design, green, yellow, red per segment\nDefault-on multilingual model tested against opt-in model\n\nKEY DECISIONS\nUpload once, configure once, publish everywhere, zero per-language settings\nConfidence indicators surface only what needs review, not everything\nDefault-on multilingual, friction in removing a language not adding one\nShow actionable states not raw confidence scores\n\nTHE PRODUCT\nSingle upload flow with language target configuration\nConfidence indicator review system per segment\nOne-tap flag, regenerate, or manual override\nViewer ratings and creator corrections feed model retraining\nA/B testing on viewer retention across language versions\n\nOUTCOME\n3x average audience growth on multilingual-enabled content\n4x lower creator churn for multilingual publishers\nHigher viewer engagement in native language versus dubbed alternative",
    "heroColor": "#2d1a4a",
    "heroTagline": "Making two people feel like they're in the same room",
    "heroCategory": "Streaming · Social",
    "heroYear": "2024",
    "previewMedia": "/projects/vosyn/MacBook Pro 16_ - 5th Gen - Silver.png",
    "hero": {
      "gradient": "linear-gradient(160deg, #FAF5FF 0%, #EDE9FE 100%)",
      "light": true,
      "badge": "Case Study · NDA · Vosyn AI",
      "tags": [
        "Co-Watching",
        "2024",
        "Vosyn AI · Under NDA"
      ],
      "synopsis": "Designing shared presence for remote co-watching, making two people feel like they are in the same room even when they are not. Details under NDA.",
      "metadata": [
        "2024",
        "Product Designer",
        "Vosyn AI Team"
      ]
    },
    "episodes": [
      {
        "ep": "01",
        "title": "The Co-Watching Opportunity",
        "teaser": "Streaming solved distribution. It did not solve the part where watching something together, even remotely, actually feels like being together.",
        "readTime": "3 min",
        "stats": [
          { "number": "83%", "label": "potential audience lost to language" },
          { "number": "100+", "label": "languages supported by AI" },
          { "number": "3×", "label": "audience reach with localisation" }
        ],
        "content": [
          {
            "type": "p",
            "text": "When you watch a film with someone in the same room, something happens that does not happen on two separate screens. You hear each other laugh. You pause for each other. You share the moment without narrating it. Streaming platforms solved distribution brilliantly. Nobody has solved that."
          },
          {
            "type": "p",
            "text": "The co-watching feature at Vosyn was built to close that gap, creating genuine shared presence for remote viewers without routing around the product into Discord, FaceTime, or a shared screen share running alongside the content."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Designing Shared Presence",
        "teaser": "Synchronised playback is the easy part. The hard part is making someone feel like another person is there without pulling their eyes off the screen.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "Synchronised playback is solved technology. The design problem is softer and harder: how do you make someone feel the presence of another person without breaking their attention? Reactions, shared moments, and presence indicators had to be ambient. Felt, not managed."
          },
          {
            "type": "p",
            "text": "The interaction model was built around the natural rhythms of watching together: collective reaction, comfortable silence, and the ability to pause for conversation without it feeling like an interruption. Specific details are under NDA."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Interaction Patterns",
        "teaser": "Every interaction had to work without taking eyes off the screen. The interface is the background. The content is the foreground.",
        "readTime": "3 min",
        "impactStats": [
          { "before": "17%", "after": "100+", "label": "Language reach", "delta": "6× market" },
          { "before": "disrupted", "after": "unchanged", "label": "Creator workflow", "delta": "zero overhead" }
        ],
        "content": [
          {
            "type": "p",
            "text": "Every co-watch interaction was designed to be eyes-forward. Reactions fire without looking at the screen. Shared pauses need minimal input. Session presence is visible but not distracting. If someone notices the interface more than the content, the interface has failed."
          },
          {
            "type": "p",
            "text": "This work is under active NDA. What is shared here covers design principles and process only. No screenshots, feature specs, or proprietary interaction patterns are disclosed."
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
    "cardBadge": "In Progress",
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
    "ia": "SITUATION\nCanadian millennials and Gen-Z managing finances across multiple apps.\nOne app for trading, another for budgeting, another for credit.\nMost finance apps drive avoidance, not engagement.\n\nUSERS\nPrimary: Financially anxious Canadians 18 to 40, first investments, first savings goals\nSecondary: Credit-building users, want score visibility without anxiety\nTertiary: TFSA and RRSP users, Canadian-specific account management\n\nPROBLEM\nFinance apps were designed by people who understand finance, for people who do not, and the gap was visible in every interaction.\nDashboards surfacing account balances, investment returns, credit utilisation, and spending trends simultaneously overwhelmed the people who needed clarity most.\nThe result was a documented avoidance loop: complexity triggers anxiety, anxiety causes disengagement, disengagement leads to worse financial outcomes.\nFor Canadian users, the problem was compounded. TFSA contribution room, RRSP deadlines, and Interac-linked accounts were scattered across institutions with no unified view.\nThe apps that could have helped the most were the ones people closed fastest.\nAurora's design problem was not about adding features. It was about removing the friction that prevented people from engaging with their own finances at all.\n\nCONSTRAINTS\nCanadian-specific products, TFSA, RRSP, Interac, bureau scale 300 to 900\nConnecting a bank account is a moment of profound trust, onboarding must honour it\nNo red/green colour system, avoid stock market emotional triggers\nProgressive disclosure required, showing everything at once triggers avoidance\n\nPROCESS\nColour system, rejected red/green, chose amber/gold with contextual labels\nChart type evaluation, tested 4 chart types, chose balance trajectory line\nOnboarding copy, describe what Aurora does not store, not what it does\nManual entry built as first-class alternative to bank connection\n\nKEY DECISIONS\nShow what is actionable, hide what is overwhelming\nEvery number has a context label, raw figures mean nothing without comparison\nDefault light mode, aligns with banking conventions, dark mode as preference\nSwipeable dashboard, native mobile feel without nested tabs\n\nTHE PRODUCT\nSwipeable home dashboard, Overview, Accounts, Credit, Activity\nBalance trajectory chart with 12-month projected trend\nCredit score gauge with payment streak and four weighted factors\nGoals with progress tracking and contribution flows\nTFSA and RRSP account types with contribution room tracking\n36 custom components, 15 pages, fully responsive\n\nOUTCOME\nAll five financial jobs consolidated, banking, investing, credit, budgeting, goals\nCanadian-specific throughout, TFSA, RRSP, Interac, local credit bureau scale\nCalm financial experience that informs without alarming",
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
        "title": "What Aurora Does Differently",
        "teaser": "Wealthsimple solved investing. KOHO solved spending. Neither solved financial clarity for the person who does not think of themselves as financially sophisticated.",
        "readTime": "3 min",
        "stats": [
          { "number": "3", "label": "apps needed for one financial picture" },
          { "number": "65%", "label": "of adults feel financial anxiety" },
          { "number": "Daily", "label": "checking vs weekly trust gap" }
        ],
        "content": [
          {
            "type": "p",
            "text": "68% of Canadians feel anxious about their finances. The apps built for them, Wealthsimple, KOHO, Neo Financial, are excellent products. But they were built for people who already feel comfortable thinking about money. Aurora is built for the people who do not."
          },
          {
            "type": "p",
            "text": "The differentiation is not a feature. It is a design stance: show less, reveal more, never alarm. No minimum AUM. No jargon. Credit treated as a daily health signal, not a buried settings page. A dashboard that feels native to a phone, not a web portal shrunk down."
          }
        ]
      },
      {
        "ep": "02",
        "title": "Credit as Part of Daily Financial Health",
        "teaser": "Most finance apps bury credit monitoring three levels deep. Aurora puts it on the dashboard, next to net worth, where it belongs.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "Credit health and financial health are the same thing. A credit score that drops quietly for three months while you are not looking is a financial problem. Most apps treat it as a separate product, buried in a settings menu you open once a year. Aurora treats it as a daily signal."
          },
          {
            "type": "p",
            "text": "The dashboard has four swipeable screens: Overview, Accounts, Credit, and Activity. Horizontal scroll, dot indicators, each screen independently scrollable. Credit sits between accounts and activity because that is where it belongs in your financial picture, not in a submenu."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Progressive Disclosure Architecture",
        "teaser": "When a finance app shows bad news, the most common response is to close it. Show one number first. Everything else only when you reach for it.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "The home screen shows one number: your total balance. Not a breakdown, not a trend, not a comparison to last month. If it looks right, there is nothing to do. If something feels off, one tap opens the detail. The decision to dig is yours, not the app's."
          },
          {
            "type": "p",
            "text": "This is not a limitation. It is the whole point. Data exists behind every surface. It only surfaces when the user reaches for it. 36 custom components, 13 modal flows, and 15 pages are all structured around that one principle: calm by default, detailed on demand."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Where We Are Now",
        "teaser": "Live and fully functional. No production users yet. This is still being built, and this case study is honest about that.",
        "readTime": "2 min",
        "impactStats": [
          { "before": "3 apps", "after": "1", "label": "Financial picture", "delta": "unified" },
          { "before": "daily anxiety", "after": "weekly trust", "label": "Engagement pattern", "delta": "shift" }
        ],
        "content": [
          {
            "type": "p",
            "text": "Aurora is a working prototype, live at the link below. Account overview, transaction history, budget tracking, investment holdings, credit monitoring, goal setting. Fifteen pages, fully responsive across mobile and desktop. It functions."
          },
          {
            "type": "p",
            "text": "There are no production users or impact metrics yet. That is the honest state of where this is. The live demo reflects current design and engineering. This case study covers the decisions and the rationale behind them."
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
    "cardBadge": "In Progress",
    "liveUrl": null,
    "description": "A speculative design project for a near-future that is actively arriving. Passenger and fleet interfaces for autonomous transit that build trust through transparency, not reassurance.",
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
    "ia": "SITUATION\nAutonomous vehicles entering public transit.\nPassengers do not trust them. Fleet managers lack the right decision interface.\nThe interface is the only trust signal when there is no driver.\n\nUSERS\nPrimary: Passengers, boarding a driverless vehicle for the first time\nSecondary: Fleet operators, managing 50 or more vehicles simultaneously\nTertiary: Mobility-impaired users, autonomous transit must exceed human-operated standards\n\nPROBLEM\nA human driver provides dozens of implicit trust signals every minute: eye contact in the mirror, a verbal reassurance, a hand gesture before a lane change.\nRemove the driver and every one of those signals disappears simultaneously, the moment a passenger steps in.\nPassengers boarding for the first time have no framework for deciding whether the vehicle is behaving correctly. A smooth ride looks identical to a vehicle with a silent sensor failure.\nFor fleet operators, the challenge was different but equally unresolved: 50 or more vehicles on a dashboard designed for human-operated transit, where every alert looks like every other alert.\nGenuine emergencies were indistinguishable from routine anomalies until it was too late to respond differently.\nThe design problem was not whether autonomous transit could be safe. It was whether it could be perceived as safe, without a human presence to make it legible.\n\nCONSTRAINTS\nNo driver to exercise human judgment on ambiguous situations\nInterface must work across passenger ages and technical literacy levels\nP1 alerts require immediate human decision, interface cannot bury them\nAccessibility must exceed human-operated transit standards, not match them\n\nPROCESS\nThree trust-building moments identified, boarding, in-transit, edge cases\nAlert triage system designed around P1/P2/P3 priority levels\nEdge case library, GPS loss, sleeping passenger, unexpected stop, route block\nAccessibility features designed for hardest user first principle\n\nKEY DECISIONS\nTransparency over reassurance, show what the vehicle is doing, not just that it is safe\nSingle-screen principle, every critical decision visible without scrolling\nHuman voice not tone for emergency communications\nOne-tap assistance connecting to remote operator within 30 seconds\nDesign for the hardest user first, every accessibility feature improves the experience for all\n\nTHE PRODUCT\nPassenger in-vehicle interface, real-time route, vehicle decisions, next stop\nFleet operations dashboard, fleet map, P1/P2/P3 alerts, 4-hour demand forecast\nBoarding flow, safety signal in first 30 seconds\nEdge case communication system, calm, directive, with clear next steps\nFull accessibility suite, voice interface, large text, automated ramp, multilingual\n\nOUTCOME\nTrust established through transparency not reassurance\nP1 alerts visible without scrolling on primary dashboard view\nFull accessibility compliance, voice, large text, boarding assistance, multilingual\nEdge cases designed with three-question framework: what to know, what to do, what happens next",
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
        "title": "A Near-Future That Is Already Arriving",
        "teaser": "Waymo is operating in San Francisco today. The question is no longer if driverless transit exists. It is what the experience should feel like.",
        "readTime": "3 min",
        "stats": [
          { "number": "30 sec", "label": "window to build passenger trust" },
          { "number": "50+", "label": "vehicles operators manage simultaneously" },
          { "number": "0", "label": "human driver to explain the system" }
        ],
        "content": [
          {
            "type": "p",
            "text": "Waymo operates commercially in San Francisco. Nuro runs last-mile delivery in Houston. BYD autonomous buses are piloting across Southeast Asia. This is not a speculative scenario set decades out. It is something happening now, and the passenger experience design has not caught up."
          },
          {
            "type": "p",
            "text": "This project is a design exploration grounded in current trajectory. The brief: build passenger and fleet interfaces that make driverless transit feel safe, readable, and human. The constraint: do not reassure people with words. Build trust through transparency."
          }
        ]
      },
      {
        "ep": "02",
        "title": "The 30-Second Trust Window",
        "teaser": "A human driver gives you eye contact and a nod. Remove the driver and all of those signals disappear at once. You have 30 seconds.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "The first time a passenger boards a driverless vehicle, they have no reference point. A human driver provides dozens of silent trust signals: eye contact, a nod, the engine responding to acceleration. Remove the driver and every one of those signals goes with it. The interface is what remains. It has 30 seconds to do what a person used to do naturally."
          },
          {
            "type": "p",
            "text": "Safety is a feeling, not a label. It is built through colour, language, timing, and the things you deliberately choose not to show. The route display is not navigation for the passenger. It is the vehicle sharing its decisions in plain language, which turns out to be all most people need."
          }
        ]
      },
      {
        "ep": "03",
        "title": "Fleet Operations at Scale",
        "teaser": "Managing 50 autonomous vehicles simultaneously is not a data problem. It is a triage problem. The design work is in knowing what not to show.",
        "readTime": "3 min",
        "content": [
          {
            "type": "p",
            "text": "A fleet manager overseeing 50 vehicles does not need more data. Every vehicle is generating continuous sensor readings, position updates, and passenger status. The problem is not information. It is knowing what requires action right now versus what can wait. Three alert levels, one decision at a time."
          },
          {
            "type": "p",
            "text": "The edge cases shaped the design more than the normal flows. GPS loss in a tunnel: communicate that the vehicle is operating normally on a cached route, without alarming. Passenger asleep past their stop: surface it gently, never abruptly. Unexpected stop: make it clear the vehicle is making a safe choice, not failing. Each one is a communication problem with a design answer."
          }
        ]
      },
      {
        "ep": "04",
        "title": "Accessibility First, Always",
        "teaser": "Taking the driver out of the vehicle creates new obligations. Everything a human driver did quietly now has to be designed explicitly.",
        "readTime": "2 min",
        "impactStats": [
          { "before": "low", "after": "high", "label": "Passenger trust score", "delta": "+target" },
          { "before": "confusion", "after": "clarity", "label": "Vehicle intent legibility", "delta": "designed" }
        ],
        "content": [
          {
            "type": "p",
            "text": "When the driver is gone, so is the person who noticed you needed help boarding. The person who waited an extra moment when you were moving slowly. The person who answered when you asked a question. The interface and the vehicle design have to carry all of that. Autonomous transit should be more accessible than human-operated transit, not less."
          },
          {
            "type": "p",
            "text": "This is a conceptual project grounded in real research: transit trust studies, autonomous vehicle anxiety data, AODA and ADA accessibility requirements. No production deployment. The designs are a proposal for what the experience should become."
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
