// API endpoint to clear all stored data

import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function POST() {
  try {
    dataStore.clearAll()
    return NextResponse.json({
      success: true,
      message: "All data cleared successfully",
    })
  } catch (error) {
    console.error("[v0] Clear data error:", error)
    return NextResponse.json({ success: false, message: "Failed to clear data" }, { status: 500 })
  }
}
