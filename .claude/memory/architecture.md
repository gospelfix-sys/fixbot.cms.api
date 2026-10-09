---
name: 아키텍처
description: 인증 3중 레이어, Recoil 상태 구조, Supabase 클라이언트 분리, Path Alias
type: project
---

# 아키텍처

## 인증 3중 레이어 (⚠️ 현재 1·2번은 mock-auth, 실 Supabase 세션 아님)

인증 상태는 세 곳에서 독립적으로 처리된다:

1. **Edge Middleware** (`src/middleware.ts`): 현재는 `mock-auth` 쿠키(`request.cookies.get('mock-auth')?.value === 'true'`)만으로 로그인 여부를 판단한다. `ADMIN_PATHS`에 해당하는 경로는 비인증 시 `/sign/in`으로, 로그인 상태에서 `/sign/in` 접근 시 `/users`로 리다이렉트. `src/libs/supabase/middleware.ts`의 `updateSession()`(실제 Supabase 쿠키 세션 갱신 로직)은 **정의만 되어 있고 미들웨어에 연결되지 않은 상태** — 실서비스 전환 시 이 mock 체크를 `updateSession()` 호출로 교체해야 한다.

2. **Server Component** (`src/app/page.tsx`): 마찬가지로 `cookies().get('mock-auth')`로 판단 후 `/users` 또는 `/sign/in`으로 리다이렉트만 수행 — 아직 `createClient()`(server)로 실제 세션을 확인하지 않는다.

3. **Client AuthProvider** (`src/components/auth/AuthProvider/index.tsx`): `onAuthStateChange`를 구독하여 Recoil atoms을 동기화. 앱 전체에서 클라이언트 인증 상태의 단일 진실 공급원 — 이 레이어는 실제 Supabase Auth를 사용한다.

> mock-auth와 [[project_context]]의 `profile.id === 'mock-user-id'` isMock 패턴은 별개다. 전자는 라우트 접근 제어(미들웨어), 후자는 Supabase 쓰기 작업 스킵(RLS 우회 불가 시)이다. 실 Supabase 인증 연결 시 **둘 다** 교체 대상.

## Recoil 상태 구조

```
src/store/
├── atoms/
│   ├── authAtom.ts    # sessionAtom, authUserAtom, authLoadingAtom
│   ├── userAtom.ts    # userProfileAtom (profiles 테이블 데이터)
│   └── uiAtom.ts
└── selectors/
    └── authSelector.ts  # isAuthenticatedSelector, isAdminSelector
```

컴포넌트에서는 atoms/selectors를 직접 구독하지 말고 `useAuth()` / `useUser()` 훅을 사용할 것.

## Supabase 클라이언트 분리

| 파일 | 키 | 용도 |
|------|-----|------|
| `src/libs/supabase/client.ts` | anon key | `'use client'` 컴포넌트, 클라이언트 사이드 훅 |
| `src/libs/supabase/server.ts` | anon key | Server Component, API Route (공개 읽기) |
| `src/libs/supabase/admin.ts` | service_role key | Server Action 뮤테이션, RLS 우회 필요한 admin 작업 |
| `src/libs/supabase/middleware.ts` | — | `updateSession()` 정의만 존재, **현재 `src/middleware.ts`에서 호출되지 않음** (위 인증 3중 레이어 참고) |

- `admin.ts`는 `SUPABASE_SERVICE_ROLE_KEY`(서버 전용, `NEXT_PUBLIC_` 접두사 없음)를 사용하며 RLS를 완전히 우회한다.
- 쓰기 작업(insert/update/delete)은 항상 `admin.ts`를 통해야 한다 — anon key는 RLS에 의해 차단된다.
- 단, Public API의 **읽기**에 `admin.ts`를 쓰면 RLS가 우회되어 비공개 데이터까지 노출될 수 있다 — 자세한 기준은 [`feedback_admin_client_usage.md`](feedback_admin_client_usage.md) 참고.

## Path Alias

`@/` → `src/` (tsconfig paths)

shadcn/ui의 utils 경로는 기본값(`@/lib/utils`)이 아닌 **`@/libs/utils`**임에 주의. 새 shadcn 컴포넌트 추가 후 import 경로를 확인할 것.
