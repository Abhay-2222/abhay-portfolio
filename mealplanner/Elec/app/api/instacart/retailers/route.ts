import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postalCode = searchParams.get("postal_code") ?? ""
  const countryCode = searchParams.get("country_code") ?? "CA"

  const apiKey = (process.env.INSTACART_API_KEY ?? "").trim().replace(/^["']|["']$/g, "")

  if (!apiKey) {
    // Return empty list — caller will hide the store picker
    return NextResponse.json({ retailers: [] })
  }

  try {
    const url = new URL("https://connect.instacart.com/v2/retailers")
    if (postalCode) url.searchParams.set("postal_code", postalCode)
    url.searchParams.set("country_code", countryCode)

    const res = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!res.ok) {
      return NextResponse.json({ retailers: [] })
    }

    const data = await res.json()
    // Normalize — Instacart returns { data: [ { id, name, logo_url, ... } ] }
    const retailers = (data.data ?? data.retailers ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      logo: r.logo_url ?? r.logo ?? null,
    }))

    return NextResponse.json({ retailers })
  } catch {
    return NextResponse.json({ retailers: [] })
  }
}
