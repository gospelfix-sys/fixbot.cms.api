import { NextResponse } from 'next/server';

import { createClient } from '@/libs/supabase/server';

/**
 * OAuth 로그인 콜백 라우트
 * Google / Kakao 로그인 후 Supabase가 이 URL로 code를 전달함
 * code를 세션으로 교환하고 홈으로 리다이렉트
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') ? rawNext : '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/sign/in?error=${encodeURIComponent(error.message)}`,
    );
  }

  // code가 없는 경우
  return NextResponse.redirect(
    `${origin}/sign/in?error=${encodeURIComponent('인증 코드가 없습니다.')}`,
  );
}
