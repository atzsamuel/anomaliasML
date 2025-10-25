// API endpoint to get ML detector status

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { mlDetector } = await import("@/lib/ml-detector")
    const status = mlDetector.getStatus()

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error: any) {
    console.error("[v0] Detector status error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to get detector status",
        status: {
          isRunning: false,
          modelTrained: false,
          detectionIntervalMs: 60000,
        },
      },
      { status: 500 },
    )
  }
}
