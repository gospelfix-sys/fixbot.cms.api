import { NextRequest, NextResponse } from 'next/server';

export function validateApiKey(request: NextRequest): NextResponse | null {
  const validKey = process.env.INTERNAL_API_KEY;

  if (!validKey) {
    console.error('[Auth] INTERNAL_API_KEY is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
