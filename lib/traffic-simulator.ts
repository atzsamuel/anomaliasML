// Traffic simulator for generating login attempts with different patterns

export interface SimulatorConfig {
  normalIPs: string[]
  anomalousIPs: string[]
  durationMinutes: number
}

export interface TrafficPattern {
  type: "normal" | "anomalous"
  requestsPerMinute: number
  errorRate: number
  usernames: string[]
  passwords: string[]
}

// Common usernames for brute force attacks
const COMMON_USERNAMES = [
  "admin",
  "root",
  "user",
  "test",
  "administrator",
  "guest",
  "info",
  "support",
  "webmaster",
  "sales",
]

// Common passwords for dictionary attacks (similar to Nmap)
const COMMON_PASSWORDS = [
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "baseball",
  "iloveyou",
  "trustno1",
  "1234567890",
  "sunshine",
  "master",
  "welcome",
  "shadow",
  "ashley",
  "football",
  "jesus",
  "michael",
  "ninja",
  "mustang",
  "password1",
  "admin",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "info",
  "adm",
  "mysql",
  "user",
  "administrator",
  "oracle",
  "ftp",
  "pi",
  "puppet",
  "ansible",
  "ec2-user",
  "vagrant",
  "azureuser",
  "changeme",
]

// Valid credentials for legitimate users
const VALID_CREDENTIALS = [
  { username: "admin", password: "admin123" },
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "test", password: "test123" },
]

export function generateNormalPattern(): TrafficPattern {
  // Normal users: 1-9 attempts per minute
  const requestsPerMinute = Math.floor(Math.random() * 9) + 1
  // Low error rate (10-30%)
  const errorRate = Math.random() * 0.2 + 0.1

  // Mix of valid and invalid credentials
  const usernames = [...VALID_CREDENTIALS.map((c) => c.username), "john", "jane", "bob"]
  const passwords = [...VALID_CREDENTIALS.map((c) => c.password), "wrongpass", "incorrect"]

  return {
    type: "normal",
    requestsPerMinute,
    errorRate,
    usernames,
    passwords,
  }
}

export function generateAnomalousPattern(): TrafficPattern {
  // Anomalous: 10-150 attempts per minute (random in range)
  const requestsPerMinute = Math.floor(Math.random() * 141) + 10
  // High error rate (70-100%)
  const errorRate = Math.random() * 0.3 + 0.7

  return {
    type: "anomalous",
    requestsPerMinute,
    errorRate,
    usernames: COMMON_USERNAMES,
    passwords: COMMON_PASSWORDS,
  }
}

export async function simulateTraffic(ip: string, pattern: TrafficPattern, durationMs: number): Promise<number> {
  const startTime = Date.now()
  const endTime = startTime + durationMs
  let attemptCount = 0

  // Calculate total attempts for this duration
  const totalAttempts = Math.floor((pattern.requestsPerMinute * durationMs) / 60000)

  // Generate attempts spread across the duration
  const attempts: Array<{ username: string; password: string; timestamp: number }> = []

  for (let i = 0; i < totalAttempts; i++) {
    // Random timestamp within the duration
    const timestamp = startTime + Math.random() * durationMs

    // Select credentials based on error rate
    let username: string
    let password: string

    if (Math.random() < pattern.errorRate) {
      // Generate failed attempt
      username = pattern.usernames[Math.floor(Math.random() * pattern.usernames.length)]
      password = pattern.passwords[Math.floor(Math.random() * pattern.passwords.length)]

      // Make sure it's actually invalid
      const isValid = VALID_CREDENTIALS.some((c) => c.username === username && c.password === password)
      if (isValid) {
        password = "invalid_" + password
      }
    } else {
      // Generate successful attempt
      const validCred = VALID_CREDENTIALS[Math.floor(Math.random() * VALID_CREDENTIALS.length)]
      username = validCred.username
      password = validCred.password
    }

    attempts.push({ username, password, timestamp })
  }

  // Sort by timestamp
  attempts.sort((a, b) => a.timestamp - b.timestamp)

  // Send requests
  for (const attempt of attempts) {
    try {
      await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": ip,
        },
        body: JSON.stringify({
          username: attempt.username,
          password: attempt.password,
        }),
      })
      attemptCount++
    } catch (error) {
      console.error(`[v0] Failed to send request for IP ${ip}:`, error)
    }

    // Small delay between requests to avoid overwhelming the server
    if (attempts.indexOf(attempt) < attempts.length - 1) {
      const nextAttempt = attempts[attempts.indexOf(attempt) + 1]
      const delay = nextAttempt.timestamp - attempt.timestamp
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 100)))
      }
    }
  }

  return attemptCount
}
