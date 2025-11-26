import { NextRequest, NextResponse } from 'next/server';
import { verifyTwoFactorToken } from '@/lib/services/twoFactor.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'Token and secret are required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await verifyTwoFactorToken(secret, token);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
