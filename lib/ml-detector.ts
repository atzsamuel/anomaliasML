// ML-based anomaly detector using statistical methods (Isolation Forest-like)

import { dataStore } from "./data-store"
import { prepareMLFeatures } from "./metrics-calculator"
import type { IPMetrics, AnomalyDetection } from "./data-store"

interface ModelData {
  means: number[]
  stdDevs: number[]
  sampleCount: number
}

export class MLDetector {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private detectionIntervalMs = 60000 // 1 minute
  private modelTrained = false
  private model: ModelData | null = null
  private readonly anomalyThreshold = 2.5 // Z-score threshold for anomaly detection

  /**
   * Train the model using statistical methods
   * Calculates mean and standard deviation for each feature
   */
  async trainModel(): Promise<{ success: boolean; message: string; samplesTrained?: number }> {
    try {
      console.log("[v0] Training statistical anomaly detection model...")

      // Get all metrics from data store
      const allMetrics = dataStore.getAllIPMetrics()
      const trainingData: number[][] = []

      allMetrics.forEach((metrics) => {
        metrics.forEach((metric) => {
          const features = prepareMLFeatures(metric)
          trainingData.push(features)
        })
      })

      if (trainingData.length < 10) {
        return {
          success: false,
          message: `Insufficient training data. Need at least 10 samples, got ${trainingData.length}`,
        }
      }

      // Calculate mean and standard deviation for each feature
      const numFeatures = trainingData[0].length
      const means: number[] = new Array(numFeatures).fill(0)
      const stdDevs: number[] = new Array(numFeatures).fill(0)

      // Calculate means
      trainingData.forEach((sample) => {
        sample.forEach((value, i) => {
          means[i] += value
        })
      })
      means.forEach((_, i) => {
        means[i] /= trainingData.length
      })

      // Calculate standard deviations
      trainingData.forEach((sample) => {
        sample.forEach((value, i) => {
          stdDevs[i] += Math.pow(value - means[i], 2)
        })
      })
      stdDevs.forEach((_, i) => {
        stdDevs[i] = Math.sqrt(stdDevs[i] / trainingData.length)
        // Prevent division by zero
        if (stdDevs[i] === 0) stdDevs[i] = 1
      })

      this.model = {
        means,
        stdDevs,
        sampleCount: trainingData.length,
      }

      this.modelTrained = true
      console.log(`[v0] Model trained successfully with ${trainingData.length} samples`)

      return {
        success: true,
        message: "Model trained successfully",
        samplesTrained: trainingData.length,
      }
    } catch (error: any) {
      console.error("[v0] Model training error:", error)
      return {
        success: false,
        message: `Training failed: ${error.message}`,
      }
    }
  }

  /**
   * Calculate anomaly score using z-score method
   * Returns a normalized score between 0 and 1 (higher = more anomalous)
   */
  private calculateAnomalyScore(features: number[]): number {
    if (!this.model) return 0

    let totalZScore = 0
    let maxZScore = 0

    features.forEach((value, i) => {
      const zScore = Math.abs((value - this.model!.means[i]) / this.model!.stdDevs[i])
      totalZScore += zScore
      maxZScore = Math.max(maxZScore, zScore)
    })

    // Combine average z-score and max z-score for better detection
    const avgZScore = totalZScore / features.length
    const combinedScore = (avgZScore + maxZScore) / 2

    // Normalize to 0-1 range (using sigmoid-like function)
    const normalizedScore = 1 / (1 + Math.exp(-0.5 * (combinedScore - this.anomalyThreshold)))

    return normalizedScore
  }

  /**
   * Determine if a sample is anomalous based on z-scores
   */
  private isAnomaly(features: number[]): boolean {
    if (!this.model) return false

    // Check if any feature has a z-score above threshold
    for (let i = 0; i < features.length; i++) {
      const zScore = Math.abs((features[i] - this.model.means[i]) / this.model.stdDevs[i])
      if (zScore > this.anomalyThreshold) {
        return true
      }
    }

    return false
  }

  async detectAnomalies(): Promise<{ success: boolean; detectionsCount?: number; message?: string }> {
    try {
      if (!this.modelTrained) {
        console.log("[v0] Model not trained, training now...")
        const trainResult = await this.trainModel()
        if (!trainResult.success) {
          return trainResult
        }
      }

      console.log("[v0] Running anomaly detection...")

      // Get recent metrics (last minute)
      const now = Date.now()
      const windowStart = now - this.detectionIntervalMs

      const allMetrics = dataStore.getAllIPMetrics()
      const testData: { ip: string; metrics: IPMetrics; features: number[] }[] = []

      allMetrics.forEach((metrics, ip) => {
        // Get the most recent metric for each IP
        const recentMetrics = metrics.filter((m) => m.windowEnd >= windowStart)
        if (recentMetrics.length > 0) {
          const latestMetric = recentMetrics[recentMetrics.length - 1]
          const features = prepareMLFeatures(latestMetric)
          testData.push({ ip, metrics: latestMetric, features })
        }
      })

      if (testData.length === 0) {
        console.log("[v0] No recent metrics to analyze")
        return { success: true, detectionsCount: 0 }
      }

      // Detect anomalies
      let detectionsCount = 0
      testData.forEach((data) => {
        const isSuspicious = this.isAnomaly(data.features)
        const anomalyScore = this.calculateAnomalyScore(data.features)

        // Get suspicious time ranges for this IP
        const ipHistory = dataStore.getIPDetectionHistory(data.ip)
        const suspiciousTimeRanges: Array<{ start: number; end: number }> = []

        if (isSuspicious) {
          // Add current time range
          suspiciousTimeRanges.push({
            start: data.metrics.windowStart,
            end: data.metrics.windowEnd,
          })
        }

        // Merge with previous suspicious ranges
        ipHistory
          .filter((h) => h.isSuspicious)
          .forEach((h) => {
            h.suspiciousTimeRanges.forEach((range) => {
              suspiciousTimeRanges.push(range)
            })
          })

        const detection: AnomalyDetection = {
          ip: data.ip,
          timestamp: now,
          isSuspicious,
          anomalyScore,
          metrics: data.metrics,
          suspiciousTimeRanges,
        }

        dataStore.addAnomalyDetection(detection)

        if (isSuspicious) {
          detectionsCount++
          console.log(
            `[v0] Suspicious IP detected: ${data.ip} (score: ${anomalyScore.toFixed(3)}, ${data.metrics.requestsPerMinute.toFixed(1)} req/min, ${(data.metrics.errorRate * 100).toFixed(1)}% errors)`,
          )
        }
      })

      console.log(`[v0] Anomaly detection completed: ${detectionsCount} suspicious IPs found`)
      return { success: true, detectionsCount }
    } catch (error: any) {
      console.error("[v0] Anomaly detection error:", error)
      return {
        success: false,
        message: `Detection failed: ${error.message}`,
      }
    }
  }

  start() {
    if (this.isRunning) {
      console.log("[v0] ML detector is already running")
      return
    }

    console.log("[v0] Starting ML detector...")
    this.isRunning = true

    // Detect anomalies immediately
    this.detectAnomalies()

    // Then detect every minute
    this.intervalId = setInterval(() => {
      this.detectAnomalies()
    }, this.detectionIntervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log("[v0] ML detector stopped")
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      modelTrained: this.modelTrained,
      detectionIntervalMs: this.detectionIntervalMs,
      modelInfo: this.model
        ? {
            sampleCount: this.model.sampleCount,
            featureCount: this.model.means.length,
          }
        : null,
    }
  }
}

// Singleton instance
export const mlDetector = new MLDetector()
