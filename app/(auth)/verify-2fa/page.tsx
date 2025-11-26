'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get user's 2FA secret
      const { data: adminUser, error: userError } = await supabase
        .from('admin_users')
        .select('two_factor_secret')
        .eq('id', user.id)
        .single();

      if (userError || !adminUser) {
        throw new Error('User not found');
      }

      let isValid = false;

      if (useBackupCode) {
        // Verify backup code
        const response = await fetch('/api/auth/2fa/verify-backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: verificationCode,
          }),
        });

        const data = await response.json();
        isValid = data.isValid;

        if (!isValid) {
          throw new Error(data.error || 'Invalid backup code');
        }
      } else {
        // Verify TOTP token
        const response = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: verificationCode,
            secret: adminUser.two_factor_secret,
          }),
        });

        const data = await response.json();
        isValid = data.isValid;

        if (!isValid) {
          throw new Error(data.error || 'Invalid verification code');
        }
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Redirect to dashboard
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={useBackupCode ? 8 : 6}
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '')
                )
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-center text-2xl tracking-widest font-mono"
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              (useBackupCode ? verificationCode.length !== 8 : verificationCode.length !== 6)
            }
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setVerificationCode('');
                setError('');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}
