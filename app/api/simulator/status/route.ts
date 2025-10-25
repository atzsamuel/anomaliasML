// API endpoint to get simulation status and statistics

import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  try {
    const stats = dataStore.getStats()
    const recentAttempts = dataStore.getLoginAttempts(Date.now() - 60000) // Last minute

    // Calculate current activity
    const ipActivity = new Map<string, number>()
    recentAttempts.forEach((attempt) => {
      ipActivity.set(attempt.ip, (ipActivity.get(attempt.ip) || 0) + 1)
    })

    const activeIPs = Array.from(ipActivity.entries())
      .map(([ip, count]) => ({ ip, requestsLastMinute: count }))
      .sort((a, b) => b.requestsLastMinute - a.requestsLastMinute)

    return NextResponse.json({
      success: true,
      stats,
      activeIPs,
      recentAttempts: recentAttempts.length,
    })
  } catch (error) {
    console.error("[v0] Status error:", error)
    return NextResponse.json({ success: false, message: "Failed to get status" }, { status: 500 })
  }
}
