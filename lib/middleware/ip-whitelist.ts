/**
 * IP Whitelisting Middleware
 * Restricts access to sensitive operations based on IP address
 */

import { NextRequest, NextResponse } from 'next/server';

// Load IP whitelist from environment variable
const WHITELISTED_IPS = (process.env.WHITELISTED_IPS || '').split(',').filter(Boolean);

// Sensitive endpoints that require IP whitelisting
const SENSITIVE_ENDPOINTS = [
  '/api/analytics/export',
  '/api/reports/financial',
  '/api/users/export',
  '/api/admin/settings',
];

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string | null {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

/**
 * Check if IP is whitelisted
 */
export function isIPWhitelisted(ip: string | null): boolean {
  if (!ip) return false;

  // If no whitelist is configured, allow all (development mode)
  if (WHITELISTED_IPS.length === 0) {
    console.warn('No IP whitelist configured. All IPs allowed.');
    return true;
  }

  // Check if IP is in whitelist
  return WHITELISTED_IPS.some((whitelistedIP) => {
    // Support CIDR notation (basic implementation)
    if (whitelistedIP.includes('/')) {
      return isIPInCIDR(ip, whitelistedIP);
    }

    // Exact match
    return ip === whitelistedIP;
  });
}

/**
 * Check if IP is in CIDR range (basic implementation)
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Convert IP address to number
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Log unauthorized access attempt
 */
async function logUnauthorizedAccess(
  ip: string | null,
  endpoint: string,
  userId?: string
): Promise<void> {
  try {
    // Log to database or external service
    console.error('Unauthorized IP access attempt:', {
      ip,
      endpoint,
      userId,
      timestamp: new Date().toISOString(),
    });

    // In production, send alert to administrators
    // await sendSecurityAlert({ ip, endpoint, userId });
  } catch (error) {
    console.error('Failed to log unauthorized access:', error);
  }
}

/**
 * IP whitelist middleware
 */
export async function ipWhitelistMiddleware(
  request: NextRequest,
  userId?: string
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  // Check if endpoint requires IP whitelisting
  const requiresWhitelist = SENSITIVE_ENDPOINTS.some((endpoint) =>
    pathname.startsWith(endpoint)
  );

  if (!requiresWhitelist) {
    return null; // Continue to next middleware
  }

  // Get client IP
  const clientIP = getClientIP(request);

  // Check if IP is whitelisted
  if (!isIPWhitelisted(clientIP)) {
    await logUnauthorizedAccess(clientIP, pathname, userId);

    return NextResponse.json(
      {
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this resource',
        code: 'IP_NOT_WHITELISTED',
      },
      { status: 403 }
    );
  }

  return null; // IP is whitelisted, continue
}

/**
 * Higher-order function to wrap API routes with IP whitelist check
 */
export function withIPWhitelist(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const whitelistCheck = await ipWhitelistMiddleware(request);

    if (whitelistCheck) {
      return whitelistCheck;
    }

    return handler(request);
  };
}

/**
 * Configuration helper
 */
export function getWhitelistConfig() {
  return {
    enabled: WHITELISTED_IPS.length > 0,
    count: WHITELISTED_IPS.length,
    ips: WHITELISTED_IPS,
  };
}
