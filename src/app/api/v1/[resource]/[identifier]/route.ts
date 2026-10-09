import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/libs/openapi/auth';
import {
  getApiConfigBySlug,
  queryConfigDetail,
  InvalidIdentifierError,
} from '@/libs/supabase/queries/content-api-configs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; identifier: string }> },
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { resource, identifier } = await params;
  const config = await getApiConfigBySlug(resource);
  if (!config || !config.is_enabled) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const item = await queryConfigDetail(config, identifier);
    if (!item) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  } catch (err) {
    if (err instanceof InvalidIdentifierError) {
      return NextResponse.json({ error: 'Invalid identifier' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
