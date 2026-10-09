import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/users', '/orders', '/quotes', '/blog', '/products', '/portfolio', '/profile', '/settings'];

function isPublicApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/v1/') || pathname === '/api/openapi.json';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS Preflight — 공개 API 경로에 한해서만 처리
  if (request.method === 'OPTIONS') {
    if (!isPublicApiPath(pathname)) return new NextResponse(null, { status: 405 });

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Accept',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 개발/목업 환경 전용 인증. 실서비스 전환 시 Supabase 세션 쿠키로 교체 필요.
  // NODE_ENV 가드: 쿠키 값을 임의로 설정해도 프로덕션에서는 인증으로 인정하지 않는다.
  const isAuthenticated =
    process.env.NODE_ENV !== 'production' && request.cookies.get('mock-auth')?.value === 'true';

  // /api/auth/me — 인증된 사용자만 접근 가능
  if (pathname === '/api/auth/me' && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 루트 접속 → 인증 여부에 따라 분기
  if (pathname === '/') {
    const target = isAuthenticated ? '/users' : '/sign/in';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 이미 로그인된 상태에서 /sign/in 접속 → /users로 이동
  if (pathname === '/sign/in' && isAuthenticated) {
    return NextResponse.redirect(new URL('/users', request.url));
  }

  // API 문서 페이지 — 로그인된 관리자만 접근 가능
  if (pathname === '/api-docs' || pathname.startsWith('/api-docs/')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign/in', request.url));
    }
    return NextResponse.next();
  }

  // 어드민 경로 미인증 접근 차단
  const isAdminPath = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isAdminPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign/in', request.url));
  }

  // 공개 API 경로에 CORS 헤더 주입 — X-API-Key 인증이 보안 레이어
  if (isPublicApiPath(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Accept');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/sign/in',
    '/api/auth/me',
    '/api/v1/:path*',
    '/api/openapi.json',
    '/api-docs/:path*',
    '/users/:path*',
    '/orders/:path*',
    '/quotes/:path*',
    '/blog/:path*',
    '/products/:path*',
    '/portfolio/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
