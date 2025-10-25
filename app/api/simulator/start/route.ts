// API endpoint to start traffic simulation

import { type NextRequest, NextResponse } from "next/server"
import { generateNormalPattern, generateAnomalousPattern, simulateTraffic } from "@/lib/traffic-simulator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { normalIPs = [], anomalousIPs = [], durationMinutes = 5 } = body

    if (normalIPs.length === 0 && anomalousIPs.length === 0) {
      return NextResponse.json({ success: false, message: "At least one IP must be provided" }, { status: 400 })
    }

    // Start simulation in background (non-blocking)
    const durationMs = durationMinutes * 60 * 1000

    // Simulate traffic for all IPs
    const simulations: Promise<void>[] = []

    // Normal IPs
    for (const ip of normalIPs) {
      const pattern = generateNormalPattern()
      simulations.push(
        simulateTraffic(ip, pattern, durationMs).then((count) => {
          console.log(`[v0] Normal traffic simulation completed for IP ${ip}: ${count} attempts`)
        }),
      )
    }

    // Anomalous IPs
    for (const ip of anomalousIPs) {
      const pattern = generateAnomalousPattern()
      simulations.push(
        simulateTraffic(ip, pattern, durationMs).then((count) => {
          console.log(`[v0] Anomalous traffic simulation completed for IP ${ip}: ${count} attempts`)
        }),
      )
    }

    // Don't wait for simulations to complete
    Promise.all(simulations).catch((error) => {
      console.error("[v0] Simulation error:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Traffic simulation started",
      config: {
        normalIPs,
        anomalousIPs,
        durationMinutes,
      },
    })
  } catch (error) {
    console.error("[v0] Simulator start error:", error)
    return NextResponse.json({ success: false, message: "Failed to start simulation" }, { status: 500 })
  }
}
