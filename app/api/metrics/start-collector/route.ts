// API endpoint to start the automatic metrics collector

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { metricsCollector } = await import("@/lib/metrics-collector")
    metricsCollector.start()

    return NextResponse.json({
      success: true,
      message: "Metrics collector started",
      status: metricsCollector.getStatus(),
    })
  } catch (error: any) {
    console.error("[v0] Start collector error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to start metrics collector" },
      { status: 500 },
    )
  }
}
