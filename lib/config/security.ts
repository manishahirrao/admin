/**
 * Security Configuration
 * Central configuration for all security features
 */

export const securityConfig = {
  // IP Whitelisting
  ipWhitelist: {
    enabled: process.env.IP_WHITELIST_ENABLED === 'true',
    ips: (process.env.WHITELISTED_IPS || '').split(',').filter(Boolean),
    sensitiveEndpoints: [
      '/api/analytics/export',
      '/api/reports/financial',
      '/api/users/export',
      '/api/admin/settings',
    ],
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    default: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    endpoints: {
      '/api/auth/login': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
      },
      '/api/auth/2fa/verify': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 10,
      },
      '/api/analytics/export': {
        windowMs: 60 * 60 * 1000,
        maxRequests: 10,
      },
    },
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltRounds: 12, // for bcrypt
  },

  // CSRF Protection
  csrf: {
    enabled: true,
    tokenLength: 32,
    cookieName: 'csrf_token',
    headerName: 'x-csrf-token',
    sameSite: 'strict' as const,
  },

  // Session Management
  session: {
    inactivityTimeout: 15 * 60 * 1000, // 15 minutes
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },

  // Password Policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Two-Factor Authentication
  twoFactor: {
    required: ['super_admin'],
    optional: ['temple_admin', 'priest_manager', 'content_manager'],
    issuer: 'Mandir Mitra Admin',
    window: 1, // Allow 1 step before/after current time
  },

  // Audit Logging
  audit: {
    enabled: true,
    logSensitiveData: false,
    retentionDays: 365,
    criticalActions: [
      'user_delete',
      'role_change',
      'permission_change',
      'data_export',
      'financial_report',
    ],
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://*.upstash.io'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // File Upload
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    scanForMalware: process.env.NODE_ENV === 'production',
  },

  // API Security
  api: {
    requireApiKey: false,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    maxPayloadSize: '10mb',
  },
};

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY environment variable not set');
  }

  // Check JWT secret
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable not set');
  }

  // Check Supabase configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL environment variable not set');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get security status for monitoring
 */
export function getSecurityStatus() {
  return {
    ipWhitelist: {
      enabled: securityConfig.ipWhitelist.enabled,
      count: securityConfig.ipWhitelist.ips.length,
    },
    rateLimit: {
      enabled: securityConfig.rateLimit.enabled,
    },
    csrf: {
      enabled: securityConfig.csrf.enabled,
    },
    twoFactor: {
      requiredRoles: securityConfig.twoFactor.required,
    },
    audit: {
      enabled: securityConfig.audit.enabled,
      retentionDays: securityConfig.audit.retentionDays,
    },
    environment: process.env.NODE_ENV,
    tlsEnabled: process.env.NODE_ENV === 'production',
  };
}

export default securityConfig;
