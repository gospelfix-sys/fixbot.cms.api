import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/libs/openapi/auth';

export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
