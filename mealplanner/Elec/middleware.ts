import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  if (request.method === "POST" || request.method === "PUT") {
    const contentType = request.headers.get("content-type")
    const allowedTypes = ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]

    if (contentType && !allowedTypes.some((type) => contentType.includes(type))) {
      return new NextResponse("Invalid Content-Type", { status: 415 })
    }
  }

  const contentLength = request.headers.get("content-length")
  if (contentLength && Number.parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB limit
    return new NextResponse("Payload Too Large", { status: 413 })
  }

  if (!rateLimit(ip, 100, 60000)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    })
  }

  const response = NextResponse.next()

  // Prevent source code exposure by blocking suspicious requests
  const userAgent = request.headers.get("user-agent") || ""
  const isSuspiciousRequest =
    request.url.includes("/_next/") && (userAgent.includes("curl") || userAgent.includes("wget") || !userAgent)

  if (isSuspiciousRequest) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
