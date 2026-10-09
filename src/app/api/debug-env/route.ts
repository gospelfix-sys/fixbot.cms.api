import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json({
    MOCK_EMAIL_set: !!process.env.MOCK_EMAIL,
    MOCK_PASSWORD_set: !!process.env.MOCK_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
  });
}
