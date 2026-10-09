import { NextResponse } from 'next/server';
import { buildDynamicOpenApiSpec } from '@/libs/openapi/dynamic-spec';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  return NextResponse.json(await buildDynamicOpenApiSpec(baseUrl));
}
