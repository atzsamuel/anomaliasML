// API endpoint to start automatic anomaly detection

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { mlDetector } = await import("@/lib/ml-detector")
    mlDetector.start()

    return NextResponse.json({
      success: true,
      message: "ML detector started",
      status: mlDetector.getStatus(),
    })
  } catch (error: any) {
    console.error("[v0] Start detector error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Failed to start detector" }, { status: 500 })
  }
}
