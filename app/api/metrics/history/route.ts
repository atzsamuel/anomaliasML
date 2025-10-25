// API endpoint to get metrics history for an IP or all IPs

import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get("ip")

    if (ip) {
      // Get metrics for specific IP
      const metrics = dataStore.getIPMetrics(ip)
      return NextResponse.json({
        success: true,
        ip,
        metrics,
        count: metrics.length,
      })
    } else {
      // Get metrics for all IPs
      const allMetrics = dataStore.getAllIPMetrics()
      const metricsArray: any[] = []

      allMetrics.forEach((metrics, ip) => {
        metricsArray.push({
          ip,
          metrics,
          count: metrics.length,
        })
      })

      return NextResponse.json({
        success: true,
        ips: metricsArray,
        totalIPs: metricsArray.length,
      })
    }
  } catch (error) {
    console.error("[v0] Metrics history error:", error)
    return NextResponse.json({ success: false, message: "Failed to get metrics history" }, { status: 500 })
  }
}
