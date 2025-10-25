// API endpoint to run anomaly detection

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { mlDetector } = await import("@/lib/ml-detector")
    const result = await mlDetector.detectAnomalies()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Detect anomalies error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to detect anomalies" },
      { status: 500 },
    )
  }
}
