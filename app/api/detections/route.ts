// API endpoint to get anomaly detections

import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get("ip")
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")

    if (ip) {
      // Get detections for specific IP
      const detections = dataStore.getIPDetectionHistory(ip)
      return NextResponse.json({
        success: true,
        ip,
        detections,
        count: detections.length,
      })
    } else {
      // Get all detections
      const detections = dataStore.getAnomalyDetections(
        startTime ? Number.parseInt(startTime) : undefined,
        endTime ? Number.parseInt(endTime) : undefined,
      )

      return NextResponse.json({
        success: true,
        detections,
        count: detections.length,
      })
    }
  } catch (error: any) {
    console.error("[v0] Get detections error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
