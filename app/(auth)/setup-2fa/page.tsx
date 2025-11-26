'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function Setup2FAPage() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');

  useEffect(() => {
    // Generate 2FA secret on component mount
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      const response = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate 2FA secret');
      }

      const data = await response.json();
      setSetupData(data);
      setStep('verify');
    } catch (err) {
      setError('Failed to generate 2FA setup. Please try again.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: setupData?.secret,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.isValid) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Enable 2FA
      const enableResponse = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: setupData?.secret,
          backupCodes: setupData?.backupCodes,
        }),
      });

      if (!enableResponse.ok) {
        throw new Error('Failed to enable 2FA');
      }

      // Show backup codes
      setStep('backup');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = `Mandir Mitra Admin - Backup Codes\n\nSave these codes in a secure location. Each code can only be used once.\n\n${setupData.backupCodes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mandir-mitra-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    router.push('/');
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating 2FA setup...</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Save Your Backup Codes
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Store these codes securely. You can use them to access your account if you lose your authenticator device.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {setupData?.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-white px-3 py-2 rounded border border-gray-200 text-center font-mono text-sm"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownloadBackupCodes}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Download Backup Codes
            </button>

            <button
              onClick={handleComplete}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Continue to Dashboard
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Each backup code can only be used once. Make sure to save them in a secure location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Set Up Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Scan the QR code with your authenticator app
          </p>
        </div>

        {/* QR Code */}
        {setupData?.qrCodeUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <Image
                src={setupData.qrCodeUrl}
                alt="2FA QR Code"
                width={256}
                height={256}
              />
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Can't scan? Enter this code manually:
              </p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {setupData.secret}
              </code>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter 6-digit code"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify and Enable'}
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Recommended apps:</strong> Google Authenticator, Microsoft Authenticator, or Authy
          </p>
        </div>
      </div>
    </div>
  );
}
