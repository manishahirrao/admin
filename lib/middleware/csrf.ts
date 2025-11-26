/**
 * CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Get CSRF token from request
 */
function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Check body for form submissions
  // Note: This requires parsing the body, which should be done in the API route
  return null;
}

/**
 * Get CSRF token from cookie
 */
function getCSRFTokenFromCookie(request: NextRequest): string | null {
  const cookies = request.cookies;
  return cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  const requestToken = getCSRFTokenFromRequest(request);
  const cookieToken = getCSRFTokenFromCookie(request);

  if (!requestToken || !cookieToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(cookieToken)
  );
}

/**
 * CSRF protection middleware
 */
export async function csrfMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const method = request.method;

  // Only check CSRF for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!verifyCSRFToken(request)) {
      return NextResponse.json(
        {
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token',
        },
        { status: 403 }
      );
    }
  }

  return null; // CSRF check passed
}

/**
 * Add CSRF token to response
 */
export function addCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken();

  // Set cookie with SameSite=Strict
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Also add to response header for client-side access
  response.headers.set(CSRF_HEADER_NAME, token);

  return response;
}

/**
 * Higher-order function to wrap API routes with CSRF protection
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const csrfCheck = await csrfMiddleware(request);

    if (csrfCheck) {
      return csrfCheck;
    }

    const response = await handler(request);
    return addCSRFToken(response);
  };
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFToken(request: NextRequest): string {
  let token = getCSRFTokenFromCookie(request);

  if (!token) {
    token = generateCSRFToken();
  }

  return token;
}
