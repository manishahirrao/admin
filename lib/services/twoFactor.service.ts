import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  error?: string;
}

/**
 * Generate a new 2FA secret and QR code for user setup
 */
export async function generateTwoFactorSecret(
  userId: string,
  email: string
): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Mandir Mitra Admin (${email})`,
    issuer: 'Mandir Mitra',
    length: 32,
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify a 2FA token against the user's secret
 */
export async function verifyTwoFactorToken(
  secret: string,
  token: string
): Promise<TwoFactorVerification> {
  try {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock drift
    });

    return {
      isValid,
      error: isValid ? undefined : 'Invalid verification code',
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to verify token',
    };
  }
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map((code) =>
      hashBackupCode(code)
    );

    const { error } = await supabase
      .from('admin_users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        backup_codes: hashedBackupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to enable two-factor authentication',
    };
  }
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('admin_users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to disable two-factor authentication',
    };
  }
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  userId: string,
  code: string
): Promise<TwoFactorVerification> {
  try {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('backup_codes')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { isValid: false, error: 'User not found' };
    }

    const hashedCode = hashBackupCode(code);
    const backupCodes = user.backup_codes || [];

    if (!backupCodes.includes(hashedCode)) {
      return { isValid: false, error: 'Invalid backup code' };
    }

    // Remove used backup code
    const updatedCodes = backupCodes.filter((c: string) => c !== hashedCode);

    await supabase
      .from('admin_users')
      .update({ backup_codes: updatedCodes })
      .eq('id', userId);

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Failed to verify backup code' };
  }
}

/**
 * Generate random backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a backup code for secure storage
 */
function hashBackupCode(code: string): string {
  // Simple hash for demo - in production use bcrypt or similar
  return Buffer.from(code).toString('base64');
}
