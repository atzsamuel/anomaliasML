// Login endpoint that records attempts

import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Get IP from request
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1"

    // Simulate authentication (simple validation)
    const validCredentials = [
      { username: "admin", password: "admin123" },
      { username: "user1", password: "password1" },
      { username: "user2", password: "password2" },
      { username: "test", password: "test123" },
    ]

    const isValid = validCredentials.some((cred) => cred.username === username && cred.password === password)

    // Simulate response time
    const responseTime = Math.random() * 200 + 50 // 50-250ms

    // Record login attempt
    dataStore.addLoginAttempt({
      id: `${Date.now()}-${Math.random()}`,
      ip,
      timestamp: Date.now(),
      success: isValid,
      username,
      responseTime,
    })

    if (isValid) {
      return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
