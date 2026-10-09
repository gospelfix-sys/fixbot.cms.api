# Next.js 14 내장 기능 목록 (3단계 [NEXT] 참조)

라이브러리 설치 전 이 목록을 먼저 확인한다.

## 라우팅

| 필요 기능 | Next.js 내장 방법 | 외부 라이브러리 불필요 |
|-----------|-------------------|----------------------|
| 페이지 라우팅 | `app/page.tsx` | ✓ |
| 동적 라우트 | `app/[id]/page.tsx` | ✓ |
| 중첩 레이아웃 | `app/layout.tsx` | ✓ |
| 404 페이지 | `app/not-found.tsx` | ✓ |
| 에러 페이지 | `app/error.tsx` | ✓ |
| 로딩 UI | `app/loading.tsx` | ✓ |
| 리다이렉트 | `redirect()` from `next/navigation` | ✓ |
| 프로그래밍 방식 이동 | `useRouter()` from `next/navigation` | ✓ |
| 현재 경로 | `usePathname()` | ✓ |
| 쿼리 파라미터 | `useSearchParams()` | ✓ |

## 데이터 페칭

| 필요 기능 | Next.js 내장 방법 |
|-----------|-------------------|
| 서버에서 데이터 가져오기 | Server Component에서 직접 `async/await` |
| 캐싱 | `fetch()` with `cache` 옵션 |
| 재검증 | `revalidatePath()`, `revalidateTag()` |
| 스트리밍 | `Suspense` + `loading.tsx` |

## 폼 & 뮤테이션

| 필요 기능 | Next.js 내장 방법 |
|-----------|-------------------|
| 폼 제출 | Server Actions (`'use server'`) |
| 낙관적 업데이트 | `useOptimistic()` |
| 폼 상태 | `useFormState()`, `useFormStatus()` |

> **이 프로젝트 표준**: 클라이언트 사이드 폼은 `react-hook-form` + `zod`를 사용한다 (5단계 [PKG]).
> `useFormState` / `useFormStatus`는 Server Actions와 연동할 때만 사용한다.

## 미디어 & 성능

| 필요 기능 | Next.js 내장 방법 |
|-----------|-------------------|
| 이미지 최적화 | `next/image` (`<Image />`) |
| 링크 + 프리페치 | `next/link` (`<Link />`) |
| 폰트 최적화 | `next/font/google` |
| 스크립트 로드 | `next/script` (`<Script />`) |

## API

| 필요 기능 | Next.js 내장 방법 |
|-----------|-------------------|
| REST API 엔드포인트 | `app/api/route.ts` (Route Handlers) |
| 미들웨어 (인증, 리다이렉트) | `middleware.ts` |
| 요청 쿠키/헤더 | `cookies()`, `headers()` from `next/headers` |

## SEO & 메타데이터

| 필요 기능 | Next.js 내장 방법 |
|-----------|-------------------|
| 페이지 제목/설명 | `export const metadata` |
| 동적 메타데이터 | `export async function generateMetadata()` |
| OG 이미지 | `app/opengraph-image.tsx` |
| 사이트맵 | `app/sitemap.ts` |
| robots.txt | `app/robots.ts` |
