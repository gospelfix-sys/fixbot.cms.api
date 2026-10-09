'use server';

import { cookies } from 'next/headers';
import { toggleApiConfig } from '@/libs/supabase/queries/content-api-configs';

export async function toggleApiConfigAction(id: string, isEnabled: boolean): Promise<void> {
  // 미들웨어와 동일한 mock-auth 쿠키 기반 인가 검증. 실 Supabase 인증 전환 시 함께 교체.
  const isAuthenticated = cookies().get('mock-auth')?.value === 'true';
  if (!isAuthenticated) throw new Error('Unauthorized');

  await toggleApiConfig(id, isEnabled);
}
