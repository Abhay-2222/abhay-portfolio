import { NextResponse } from "next/server"

// Supported units per Instacart docs — anything else falls back to "each"
const VALID_UNITS = new Set([
  "each", "package", "tablespoon", "teaspoon", "ounce", "fluid ounce",
  "pound", "gram", "kilogram", "cup", "pint", "quart", "gallon",
  "liter", "milliliter", "bunch", "slice", "piece", "clove", "head",
  "stalk", "sprig", "can", "jar", "bag", "box", "bottle", "container",
])

function normalizeUnit(unit: string | undefined): string {
  if (!unit) return "each"
  const lower = unit.toLowerCase().trim()
  if (VALID_UNITS.has(lower)) return lower
  // Common abbreviation mappings
  const map: Record<string, string> = {
    tbsp: "tablespoon", tbs: "tablespoon", tsp: "teaspoon",
    oz: "ounce", "fl oz": "fluid ounce", lb: "pound", lbs: "pound",
    g: "gram", kg: "kilogram", ml: "milliliter", l: "liter",
    pkg: "package", pkt: "package", cnt: "each", ct: "each",
  }
  return map[lower] ?? "each"
}

export async function POST(request: Request) {
  const rawKey = process.env.INSTACART_API_KEY ?? ""
  // Strip any accidental whitespace or quotes from the env value
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "")

  if (!apiKey) {
    // No API key — build a regional Instacart search URL based on the user's timezone
    try {
      const { items, timezone } = await request.json()
      const q = Array.isArray(items)
        ? items.slice(0, 6).map((i: { name: string }) => i.name).join(" ")
        : ""

      // Detect country from browser timezone sent by the client
      const tz = typeof timezone === "string" ? timezone : ""
      const isCanada = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Regina|Halifax|St_Johns|Whitehorse|Yellowknife|Iqaluit|Moncton|Glace_Bay|Goose_Bay|Blanc-Sablon|Creston|Dawson|Dawson_Creek|Fort_Nelson|Cambridge_Bay|Rankin_Inlet|Resolute|Pangnirtung)$/i.test(tz)

      // Use regional homepage — the /store/s search path only works in the US
      // With a real API key this is bypassed and a proper cart link is returned instead
      const url = isCanada ? "https://www.instacart.com/canada" : "https://www.instacart.com"
      return NextResponse.json({ url })
    } catch {
      return NextResponse.json({ url: "https://www.instacart.com" })
    }
  }

  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    const lineItems = items.map((item: { name: string; amount: number; unit: string }) => ({
      name: String(item.name),
      quantity: Math.max(1, Math.ceil(Number(item.amount) || 1)),
      unit: normalizeUnit(item.unit),
    }))

    const body = {
      title: "My Meal Plan Grocery List",
      link_type: "shopping_list",
      line_items: lineItems,
    }

    const response = await fetch("https://connect.instacart.com/idp/v1/products/products_link", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()

    if (!response.ok) {
      // Surface a clear message — key likely wrong or not yet activated
      const hint =
        response.status === 401
          ? "Your Instacart API key is invalid or has not been activated. Check the INSTACART_API_KEY environment variable in your Vercel project settings."
          : `Instacart returned ${response.status}: ${responseText}`
      return NextResponse.json({ error: hint }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    const url = data.products_link_url ?? data.url ?? data.link
    if (!url) {
      return NextResponse.json({ error: "Instacart did not return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create Instacart list" }, { status: 500 })
  }
}
