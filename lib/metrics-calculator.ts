// Calculate metrics from login attempts for ML model

import type { LoginAttempt, IPMetrics } from "./data-store"

export function calculateIPMetrics(
  attempts: LoginAttempt[],
  windowStart: number,
  windowEnd: number,
): Map<string, IPMetrics> {
  const metricsMap = new Map<string, IPMetrics>()

  // Group attempts by IP
  const ipGroups = new Map<string, LoginAttempt[]>()
  attempts.forEach((attempt) => {
    if (attempt.timestamp >= windowStart && attempt.timestamp <= windowEnd) {
      const group = ipGroups.get(attempt.ip) || []
      group.push(attempt)
      ipGroups.set(attempt.ip, group)
    }
  })

  // Calculate metrics for each IP
  ipGroups.forEach((ipAttempts, ip) => {
    const totalRequests = ipAttempts.length
    const failedRequests = ipAttempts.filter((a) => !a.success).length
    const successfulRequests = totalRequests - failedRequests
    const errorRatio = totalRequests > 0 ? failedRequests / totalRequests : 0

    // Calculate average time between requests
    const sortedAttempts = [...ipAttempts].sort((a, b) => a.timestamp - b.timestamp)
    let totalTimeDiff = 0
    for (let i = 1; i < sortedAttempts.length; i++) {
      totalTimeDiff += sortedAttempts[i].timestamp - sortedAttempts[i - 1].timestamp
    }
    const avgTimeBetweenRequests = sortedAttempts.length > 1 ? totalTimeDiff / (sortedAttempts.length - 1) : 0

    // Requests per minute (window is 1 minute)
    const windowDurationMinutes = (windowEnd - windowStart) / (1000 * 60)
    const requestsPerMinute = totalRequests / windowDurationMinutes

    metricsMap.set(ip, {
      ip,
      windowStart,
      windowEnd,
      requestsPerMinute,
      errorRatio,
      avgTimeBetweenRequests,
      totalRequests,
      failedRequests,
      successfulRequests,
    })
  })

  return metricsMap
}

export function prepareMLFeatures(metrics: IPMetrics): number[] {
  return [
    metrics.requestsPerMinute,
    metrics.errorRatio,
    metrics.avgTimeBetweenRequests / 1000, // Convert to seconds
    metrics.totalRequests,
  ]
}
