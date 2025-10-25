// Metrics collector that runs every minute to calculate IP metrics

import { dataStore } from "./data-store"
import { calculateIPMetrics } from "./metrics-calculator"

export class MetricsCollector {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private collectionIntervalMs = 60000 // 1 minute

  start() {
    if (this.isRunning) {
      console.log("[v0] Metrics collector is already running")
      return
    }

    console.log("[v0] Starting metrics collector...")
    this.isRunning = true

    // Collect metrics immediately
    this.collectMetrics()

    // Then collect every minute
    this.intervalId = setInterval(() => {
      this.collectMetrics()
    }, this.collectionIntervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log("[v0] Metrics collector stopped")
  }

  private collectMetrics() {
    try {
      const now = Date.now()
      const windowStart = now - this.collectionIntervalMs
      const windowEnd = now

      console.log(
        `[v0] Collecting metrics for window: ${new Date(windowStart).toISOString()} to ${new Date(windowEnd).toISOString()}`,
      )

      // Get all login attempts in this window
      const attempts = dataStore.getLoginAttempts(windowStart, windowEnd)

      if (attempts.length === 0) {
        console.log("[v0] No login attempts in this window")
        return
      }

      // Calculate metrics for each IP
      const metricsMap = calculateIPMetrics(attempts, windowStart, windowEnd)

      // Store metrics
      metricsMap.forEach((metrics) => {
        dataStore.addIPMetrics(metrics)
        console.log(
          `[v0] Collected metrics for IP ${metrics.ip}: ${metrics.requestsPerMinute.toFixed(2)} req/min, ${(metrics.errorRatio * 100).toFixed(1)}% error rate`,
        )
      })

      console.log(`[v0] Metrics collection completed: ${metricsMap.size} IPs processed`)
    } catch (error) {
      console.error("[v0] Error collecting metrics:", error)
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      collectionIntervalMs: this.collectionIntervalMs,
    }
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector()
