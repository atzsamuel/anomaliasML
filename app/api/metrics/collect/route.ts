// API endpoint to manually trigger metrics collection

import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { calculateIPMetrics } from "@/lib/metrics-calculator"

export async function POST() {
  try {
    const now = Date.now()
    const windowStart = now - 60000 // Last minute
    const windowEnd = now

    // Get all login attempts in this window
    const attempts = dataStore.getLoginAttempts(windowStart, windowEnd)

    if (attempts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No login attempts in the last minute",
        metricsCollected: 0,
      })
    }

    // Calculate metrics for each IP
    const metricsMap = calculateIPMetrics(attempts, windowStart, windowEnd)

    // Store metrics
    const metricsArray: any[] = []
    metricsMap.forEach((metrics) => {
      dataStore.addIPMetrics(metrics)
      metricsArray.push(metrics)
    })

    return NextResponse.json({
      success: true,
      message: "Metrics collected successfully",
      metricsCollected: metricsArray.length,
      metrics: metricsArray,
    })
  } catch (error) {
    console.error("[v0] Metrics collection error:", error)
    return NextResponse.json({ success: false, message: "Failed to collect metrics" }, { status: 500 })
  }
}
