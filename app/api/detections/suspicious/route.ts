// API endpoint to get top suspicious IPs

import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const suspiciousIPs = dataStore.getSuspiciousIPs(limit)

    return NextResponse.json({
      success: true,
      suspiciousIPs,
      count: suspiciousIPs.length,
    })
  } catch (error: any) {
    console.error("[v0] Get suspicious IPs error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
