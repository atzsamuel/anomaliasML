// API endpoint to get metrics collector status

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { metricsCollector } = await import("@/lib/metrics-collector")
    const status = metricsCollector.getStatus()

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error: any) {
    console.error("[v0] Collector status error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get collector status",
        status: {
          isRunning: false,
          collectionIntervalMs: 60000,
        },
      },
      { status: 500 },
    )
  }
}
