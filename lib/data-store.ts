// In-memory data store for login attempts and ML results

export interface LoginAttempt {
  id: string
  ip: string
  timestamp: number
  success: boolean
  username: string
  responseTime: number
}

export interface IPMetrics {
  ip: string
  windowStart: number
  windowEnd: number
  requestsPerMinute: number
  errorRatio: number
  avgTimeBetweenRequests: number
  totalRequests: number
  failedRequests: number
  successfulRequests: number
}

export interface AnomalyDetection {
  ip: string
  timestamp: number
  isSuspicious: boolean
  anomalyScore: number
  metrics: IPMetrics
  suspiciousTimeRanges: Array<{ start: number; end: number }>
}

class DataStore {
  private loginAttempts: LoginAttempt[] = []
  private ipMetrics: Map<string, IPMetrics[]> = new Map()
  private anomalyDetections: AnomalyDetection[] = []
  private maxStorageSize = 100000 // Limit storage to prevent memory issues

  // Login Attempts
  addLoginAttempt(attempt: LoginAttempt) {
    this.loginAttempts.push(attempt)
    // Keep only recent attempts
    if (this.loginAttempts.length > this.maxStorageSize) {
      this.loginAttempts = this.loginAttempts.slice(-this.maxStorageSize)
    }
  }

  getLoginAttempts(startTime?: number, endTime?: number, ip?: string): LoginAttempt[] {
    let filtered = this.loginAttempts

    if (ip) {
      filtered = filtered.filter((attempt) => attempt.ip === ip)
    }

    if (startTime !== undefined) {
      filtered = filtered.filter((attempt) => attempt.timestamp >= startTime)
    }

    if (endTime !== undefined) {
      filtered = filtered.filter((attempt) => attempt.timestamp <= endTime)
    }

    return filtered
  }

  getAllLoginAttempts(): LoginAttempt[] {
    return this.loginAttempts
  }

  // IP Metrics
  addIPMetrics(metrics: IPMetrics) {
    const existing = this.ipMetrics.get(metrics.ip) || []
    existing.push(metrics)
    // Keep only last 1440 minutes (24 hours)
    if (existing.length > 1440) {
      existing.shift()
    }
    this.ipMetrics.set(metrics.ip, existing)
  }

  getIPMetrics(ip: string): IPMetrics[] {
    return this.ipMetrics.get(ip) || []
  }

  getAllIPMetrics(): Map<string, IPMetrics[]> {
    return this.ipMetrics
  }

  // Anomaly Detections
  addAnomalyDetection(detection: AnomalyDetection) {
    this.anomalyDetections.push(detection)
    // Keep only recent detections
    if (this.anomalyDetections.length > this.maxStorageSize) {
      this.anomalyDetections = this.anomalyDetections.slice(-this.maxStorageSize)
    }
  }

  getAnomalyDetections(startTime?: number, endTime?: number): AnomalyDetection[] {
    let filtered = this.anomalyDetections

    if (startTime !== undefined) {
      filtered = filtered.filter((detection) => detection.timestamp >= startTime)
    }

    if (endTime !== undefined) {
      filtered = filtered.filter((detection) => detection.timestamp <= endTime)
    }

    return filtered
  }

  getSuspiciousIPs(limit = 10): AnomalyDetection[] {
    const suspiciousDetections = this.anomalyDetections.filter((d) => d.isSuspicious)

    // Group by IP and get the most recent detection for each
    const ipMap = new Map<string, AnomalyDetection>()
    suspiciousDetections.forEach((detection) => {
      const existing = ipMap.get(detection.ip)
      if (!existing || detection.timestamp > existing.timestamp) {
        ipMap.set(detection.ip, detection)
      }
    })

    // Sort by anomaly score and return top N
    return Array.from(ipMap.values())
      .sort((a, b) => b.anomalyScore - a.anomalyScore)
      .slice(0, limit)
  }

  getIPDetectionHistory(ip: string): AnomalyDetection[] {
    return this.anomalyDetections.filter((d) => d.ip === ip).sort((a, b) => b.timestamp - a.timestamp)
  }

  // Clear data
  clearAll() {
    this.loginAttempts = []
    this.ipMetrics.clear()
    this.anomalyDetections = []
  }

  // Get statistics
  getStats() {
    const totalAttempts = this.loginAttempts.length
    const successfulAttempts = this.loginAttempts.filter((a) => a.success).length
    const failedAttempts = totalAttempts - successfulAttempts
    const uniqueIPs = new Set(this.loginAttempts.map((a) => a.ip)).size
    const suspiciousIPs = new Set(this.anomalyDetections.filter((d) => d.isSuspicious).map((d) => d.ip)).size

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      uniqueIPs,
      suspiciousIPs,
      totalDetections: this.anomalyDetections.length,
    }
  }
}

// Singleton instance
export const dataStore = new DataStore()
