// Simple in-memory rate limiter for login attempts
interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up old entries every 15 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) {
        store.delete(key)
      }
    }
  },
  15 * 60 * 1000,
)

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
): boolean {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || entry.resetAt < now) {
    // First attempt or window expired
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return true
  }

  if (entry.count >= maxAttempts) {
    // Rate limit exceeded
    return false
  }

  // Increment counter
  entry.count++
  return true
}

export function getRemainingTime(identifier: string): number {
  const entry = store.get(identifier)
  if (!entry) return 0

  const remaining = entry.resetAt - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000)) // seconds
}
