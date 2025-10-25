// API endpoint to train the ML model

import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { mlDetector } = await import("@/lib/ml-detector")
    const result = await mlDetector.trainModel()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Train model error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Failed to train model" }, { status: 500 })
  }
}
