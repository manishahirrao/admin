/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

// Default rate limit: 100 requests per 15 minutes
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests, please try again later',
};

// Endpoint-specific rate limits
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts, please try again later',
  },
  '/api/auth/2fa/verify': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many verification attempts',
  },
  '/api/analytics/export': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Export limit reached, please try again later',
  },
  '/api/users/export': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Export limit reached',
  },
};

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Get rate limit key for request
 */
function getRateLimitKey(request: NextRequest, identifier?: string): string {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const endpoint = request.nextUrl.pathname;
  
  return identifier ? `${identifier}:${endpoint}` : `${ip}:${endpoint}`;
}

/**
 * Get rate limit config for endpoint
 */
function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check for exact match
  if (ENDPOINT_LIMITS[pathname]) {
    return ENDPOINT_LIMITS[pathname];
  }

  // Check for prefix match
  for (const [endpoint, config] of Object.entries(ENDPOINT_LIMITS)) {
    if (pathname.startsWith(endpoint)) {
      return config;
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Check rate limit for request
 */
export function checkRateLimit(
  request: NextRequest,
  identifier?: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(request, identifier);
  const config = getRateLimitConfig(request.nextUrl.pathname);
  const now = Date.now();

  // Get or create request count
  let record = requestCounts.get(key);

  // Reset if window has expired
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count
  record.count++;
  requestCounts.set(key, record);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  return {
    allowed: record.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired entries from memory
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Rate limit middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  identifier?: string
): Promise<NextResponse | null> {
  const { allowed, remaining, resetTime } = checkRateLimit(request, identifier);

  if (!allowed) {
    const config = getRateLimitConfig(request.nextUrl.pathname);
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null; // Rate limit not exceeded
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  identifier?: (request: NextRequest) => string | undefined
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const id = identifier ? identifier(request) : undefined;
    const rateLimitCheck = await rateLimitMiddleware(request, id);

    if (rateLimitCheck) {
      return rateLimitCheck;
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    const { remaining, resetTime } = checkRateLimit(request, id);
    const config = getRateLimitConfig(request.nextUrl.pathname);

    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());

    return response;
  };
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus() {
  return {
    totalKeys: requestCounts.size,
    entries: Array.from(requestCounts.entries()).map(([key, record]) => ({
      key,
      count: record.count,
      resetTime: new Date(record.resetTime).toISOString(),
    })),
  };
}

/**
 * Reset rate limit for specific key (admin function)
 */
export function resetRateLimit(key: string): boolean {
  return requestCounts.delete(key);
}

/**
 * Clear all rate limits (admin function)
 */
export function clearAllRateLimits(): void {
  requestCounts.clear();
}
