/**
 * Simple in-memory rate limiter for Supabase Edge Functions
 * For production, consider using Upstash Redis or similar distributed cache
 */

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (will reset when function cold starts)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID, IP address, email)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 } // Default: 10 requests per minute
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or entry expired - create new
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Entry exists and not expired
  if (entry.count < config.maxRequests) {
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000), // Seconds until reset
  };
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    ...(result.retryAfter && { 'Retry-After': String(result.retryAfter) }),
  };
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(result: ReturnType<typeof checkRateLimit>, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...getRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Get client identifier from request
 * Tries to get user email, then IP address, then a default
 */
export function getClientIdentifier(req: Request, userEmail?: string): string {
  if (userEmail) return `email:${userEmail}`;

  // Try to get IP from headers (works with Supabase Edge Functions)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim();
    return `ip:${ip}`;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;

  // Fallback to a generic identifier
  return 'anonymous';
}
