// API endpoint to stop automatic anomaly detection

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { mlDetector } = await import("@/lib/ml-detector")
    mlDetector.stop()

    return NextResponse.json({
      success: true,
      message: "ML detector stopped",
      status: mlDetector.getStatus(),
    })
  } catch (error: any) {
    console.error("[v0] Stop detector error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Failed to stop detector" }, { status: 500 })
  }
}
