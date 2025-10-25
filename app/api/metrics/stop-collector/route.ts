// API endpoint to stop the automatic metrics collector

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { metricsCollector } = await import("@/lib/metrics-collector")
    metricsCollector.stop()

    return NextResponse.json({
      success: true,
      message: "Metrics collector stopped",
      status: metricsCollector.getStatus(),
    })
  } catch (error: any) {
    console.error("[v0] Stop collector error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to stop metrics collector" },
      { status: 500 },
    )
  }
}
