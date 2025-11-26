/**
 * Data Encryption Utilities
 * Handles encryption/decryption of sensitive data
 */

import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Derive key from password using PBKDF2
  const salt = process.env.ENCRYPTION_SALT || 'mandir-mitra-salt';
  return crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag,
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract IV, encrypted data, and auth tag
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(-AUTH_TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH, -AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt');
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash data using SHA-256
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Encrypt 2FA secret
 */
export function encrypt2FASecret(secret: string): string {
  return encrypt(secret);
}

/**
 * Decrypt 2FA secret
 */
export function decrypt2FASecret(encryptedSecret: string): string {
  return decrypt(encryptedSecret);
}

/**
 * Encrypt sensitive field in object
 */
export function encryptField<T extends Record<string, any>>(
  obj: T,
  field: keyof T
): T {
  if (obj[field] && typeof obj[field] === 'string') {
    return {
      ...obj,
      [field]: encrypt(obj[field] as string),
    };
  }
  return obj;
}

/**
 * Decrypt sensitive field in object
 */
export function decryptField<T extends Record<string, any>>(
  obj: T,
  field: keyof T
): T {
  if (obj[field] && typeof obj[field] === 'string') {
    try {
      return {
        ...obj,
        [field]: decrypt(obj[field] as string),
      };
    } catch (error) {
      console.error(`Failed to decrypt field ${String(field)}:`, error);
      return obj;
    }
  }
  return obj;
}

/**
 * Encrypt multiple fields in object
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  let result = { ...obj };
  for (const field of fields) {
    result = encryptField(result, field);
  }
  return result;
}

/**
 * Decrypt multiple fields in object
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  let result = { ...obj };
  for (const field of fields) {
    result = decryptField(result, field);
  }
  return result;
}

/**
 * Generate encryption key (for initial setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}

/**
 * Sanitize object for logging (remove sensitive fields)
 */
export function sanitizeForLogging<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: (keyof T)[] = ['password', 'token', 'secret', 'apiKey']
): Partial<T> {
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  return sanitized;
}
