# Architecture

**인증 — 2단 구조 (Recoil 아님, `mem:known_drift` 참고)**
1. 서버: `src/middleware.ts`가 `mock-auth` 쿠키만으로 (admin) 경로 접근을 제어 (`ADMIN_PATHS` 배열). 실제 Supabase 세션 검증(`src/libs/supabase/middleware.ts`의 `updateSession()`)은 정의만 되어 있고 미들웨어에 연결 안 됨 — "세션이 이미 검증된다"고 가정한 코드 작성 금지.
2. 클라이언트: `src/hooks/useAuth.ts`/`useUser.ts`가 React Query(`@tanstack/react-query`)로 `/api/auth/me`(`src/app/api/auth/me/route.ts`)를 호출해 `{user, profile}`을 가져옴. queryKey는 `AUTH_QUERY_KEY = ["auth","me"]`. signOut은 mock-auth 쿠키 삭제 + `queryClient.setQueryData` 갱신 + `router.push`. 전역 상태 라이브러리 없이 React Query 캐시가 단일 진실 공급원 — 구독은 항상 `useAuth()`/`useUser()` 훅을 통해서만.

**Supabase 클라이언트 3분리**
| 파일 | 키 | 용도 |
|---|---|---|
| client.ts | anon | 'use client' 컴포넌트 |
| server.ts | anon | Server Component/공개 읽기 (RLS 적용) |
| admin.ts | service_role | Server Action 뮤테이션, RLS 우회 필요 admin 작업 (공개 읽기에 쓰면 안 됨) |

**공개 REST API** (`src/app/api/v1/[resource]/`)
- `X-API-Key` 헤더 인증 (`INTERNAL_API_KEY` env, 없으면 500)
- 노출 여부는 `statkit_content_api_configs` 테이블 1 row = 1 리소스 설정, 토글 시 코드 배포 불필요
- `/api/v1/health` 헬스체크, `/api/openapi.json` + `/api-docs`(swagger-ui-react)로 동적 스펙 노출

**CORS** — `src/middleware.ts` 단일 관리 (next.config.mjs의 headers()는 정적 문자열만 지원해 다중 도메인 제어 불가하므로 미사용)
- `CORS_ALLOWED_ORIGINS` env(콤마 구분)가 단일 진실 공급원, 미설정 시 `http://localhost:3001`만 허용
- OPTIONS는 `isPublicApiPath()` 체크 후에만 처리 (최상단에 두면 admin 경로 preflight도 허용되어 버림). 비API 경로 OPTIONS → 405, 미허용 Origin → 403
- `Authorization` 헤더는 비허용 (X-API-Key만 사용) — Access-Control-Allow-Headers는 `Content-Type, X-API-Key`만
- 모든 응답에 `Vary: Origin` 필수 (CDN 캐시 분리)
- `Access-Control-Max-Age`는 production만 86400, 그 외 0
- `ADMIN_PATHS` 배열과 `config.matcher` 배열이 별도 관리 — 새 admin 경로 추가 시 둘 다 수정해야 미들웨어가 실행됨

**환경변수**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY(서버 전용), INTERNAL_API_KEY(공개 API용), CORS_ALLOWED_ORIGINS