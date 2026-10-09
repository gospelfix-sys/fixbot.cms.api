# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@docs/TECH-STACK-PRIORITY.md

> 상세 내용은 `.claude/memory/` 디렉토리의 각 파일을 참조한다. 단, `architecture.md`/`project-overview.md`/`conversation-insights.md`는 Recoil 기반 인증을 전제로 쓰여 있어 부분적으로 낡았다 — 아래 "아키텍처 개요"가 우선한다.

## 프로젝트 정의

이 저장소는 방문자용 홈페이지가 아니라, 별도로 운영되는 일반 홈페이지(고객용 프론트엔드)에 노출할 콘텐츠를 관리하는 **헤드리스 CMS 관리자(Admin) 서비스**다.

- 관리자가 `(admin)` 라우트 그룹(블로그·상품·포트폴리오·주문·견적·회원)에서 콘텐츠를 CRUD한다.
- `/settings`에서 리소스별로 `/api/v1/{resource}` REST API 노출 여부를 토글한다 (`statkit_content_api_configs` 테이블 한 행 = 노출 설정 하나, 코드 배포 불필요).
- 활성화된 콘텐츠는 `X-API-Key` 인증 기반 공개 REST API(`/api/v1/*`)로 노출되고, 외부의 일반 홈페이지가 이를 호출해 화면에 표시한다.
- 새 기능을 만들 때는 이 정의를 기준으로 판단한다: 관리자 화면 기능인가, 공개 API 기능인가에 따라 인증·클라이언트·RLS 취급이 달라진다.

**이름 관련 주의**: Supabase 프로젝트 정식 명칭은 `fixchat.cms.api`(ref `cvrrhpeuoteudofopvwq`, org `jaeheng-dev`)이고 `package.json`의 `name`은 `gospelfix-admin-v2`이지만, 코드 내 테이블/변수 명명은 여전히 `statkit_` 접두사를 쓴다(`statkit_posts`, `statkit_products`, `statkit_portfolios`, `statkit_content_api_configs`). 이 셋은 같은 프로젝트를 가리키는 서로 다른 이름이다 — 새 테이블도 기존 관례를 따라 `statkit_` 접두사를 유지한다. 이 Supabase 프로젝트는 fixchat 전용이 아니라 GospelFix 산하 여러 서비스(`deartintsanta_*`, `franchise_*`, `holywin_*` 등)가 공유한다.

## 자주 쓰는 명령어

```bash
yarn install                  # 의존성 설치 (yarn 전용, npm/npm-lock 절대 금지)
yarn dev                      # 개발 서버 (http://localhost:3001)
yarn build                    # 프로덕션 빌드
yarn start                    # 프로덕션 서버 (포트 3001)
yarn lint                     # ESLint (.eslintrc.json → next/core-web-vitals)
yarn tsc --noEmit             # 타입 체크 (전용 스크립트 없음, 직접 실행)
yarn pretty                   # Prettier로 src/**/*.{ts,js,tsx,jsx} 포맷
yarn shadcn add <component>   # shadcn/ui 컴포넌트 추가
```

테스트 러너는 아직 구성되어 있지 않다(`package.json`에 `test` 스크립트 없음). 단일 파일/기능을 검증할 자동 테스트가 없으므로, 변경 후에는 `yarn tsc --noEmit && yarn lint && yarn build`를 직접 돌려 회귀를 확인할 것.

`.husky/pre-commit`, `.husky/pre-push`가 저장소에 존재하지만 **실제로는 동작하지 않는다** — `husky`/`lint-staged`가 `package.json`에 설치되어 있지 않고 `git config core.hooksPath`도 비어 있다. `git commit`/`git push`가 알아서 lint·빌드를 검증해줄 것이라 가정하지 말 것.

CI(`.github/workflows/ci.yml`)는 `main` 브랜치 push/PR에서 `yarn --frozen-lockfile` → `yarn tsc --noEmit` → `yarn lint` → `yarn build` 순서로 실행되며, 빌드 시 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 GitHub Secrets에서 주입받는다.

## 아키텍처 개요

### 인증 — 아직 mock 상태 (실 Supabase 세션 미연결)

프로덕션용 Supabase 세션 인증은 아직 미들웨어에 연결되지 않았다. 현재는 개발용 `mock-auth` 쿠키로만 로그인 상태를 판단하며, 이 쿠키를 검사하는 지점이 4곳 있다:

- `src/middleware.ts` — 라우트 접근 게이트 (`ADMIN_PATHS` 배열 기준)
- `src/app/(admin)/layout.tsx` — 관리자 레이아웃 게이트
- `src/app/api/auth/me/route.ts` — 클라이언트가 로그인 상태를 조회하는 API
- `src/app/sign/in/actions.ts` — `MOCK_EMAIL`/`MOCK_PASSWORD` 환경변수와 대조해 쿠키 발급

네 곳 모두 `process.env.NODE_ENV !== 'production'`과 AND로 결합되어 있어 **프로덕션 빌드에서는 mock-auth가 항상 비활성화**된다 — 즉 실 Supabase 세션 인증(`src/libs/supabase/middleware.ts`의 `updateSession()`, 정의만 되어 있고 아직 미들웨어에서 호출되지 않음)이 붙기 전까지 프로덕션 관리자 화면에는 아무도 로그인할 수 없다. 이는 버그가 아니라 의도된 안전장치다. 새 관리자 라우트를 추가할 때 이 4곳 중 하나라도 누락하면 인증 우회 구멍이 다시 열릴 수 있으니 항상 함께 확인할 것.

클라이언트 상태는 Recoil이 아니라 **`@tanstack/react-query`** 기반이다(`package.json`에 `recoil` 의존성 없음). `src/hooks/useAuth.ts`/`useUser.ts`가 `/api/auth/me`를 단일 쿼리 키(`["auth", "me"]`)로 감싸 캐싱한다 — 컴포넌트는 이 두 훅만 사용하고 `useQueryClient()`를 직접 다루지 않는다.

### Supabase 클라이언트 3분리

| 파일 | 키 | 용도 |
|---|---|---|
| `src/libs/supabase/client.ts` | anon | `'use client'` 컴포넌트 |
| `src/libs/supabase/server.ts` | anon | Server Component, 공개 읽기 |
| `src/libs/supabase/admin.ts` | service_role | Server Action 뮤테이션, RLS 우회가 필요한 admin 작업 |

쓰기 작업(insert/update/delete)은 anon key로는 RLS에 막히므로 항상 `admin.ts`를 거쳐야 한다. 단, **공개 API(`/api/v1/*`)의 읽기 경로에 `admin.ts`를 쓰면 RLS가 우회되어 비공개 데이터까지 노출**될 수 있다 — 자세한 판단 기준은 [`feedback_admin_client_usage.md`](.claude/memory/feedback_admin_client_usage.md) 참고.

### 동적 REST API (`/api/v1/[resource]`)

리소스별 라우트 파일을 따로 두지 않는다. `statkit_content_api_configs` 테이블의 행 하나가 리소스 하나를 정의한다(`resource_slug`, 실제 조회할 `table_name`, 필터/정렬/식별자 컬럼, `is_enabled`). `src/app/api/v1/[resource]/route.ts`(목록) + `[resource]/[identifier]/route.ts`(단건) 두 개의 catch-all 핸들러가 이 설정을 읽어 `createAdminClient()`로 동적 쿼리를 실행한다(`src/libs/supabase/queries/content-api-configs.ts`). `/settings` 화면에서 `is_enabled`를 토글하면 코드 배포 없이 API가 즉시 켜지거나 꺼진다. 모든 요청은 `X-API-Key`가 `INTERNAL_API_KEY`와 일치해야 통과한다(`src/libs/openapi/auth.ts`의 `validateApiKey`).

### Path Alias

`@/` → `src/`. shadcn/ui의 utils 경로는 기본값(`@/lib/utils`)이 아니라 **`@/libs/utils`**임에 주의 — 새 shadcn 컴포넌트를 추가하면 import 경로를 직접 고쳐야 한다.

### 코드 작성 전 결정 사다리

새 기능을 구현하기 전에 `.claude/GOSPELFIX.md`의 9단계 결정 사다리(NEED → EXIST → NEXT → SUPA → PKG → PATTERN → INLINE → SHARED → BUILD)를 따른다. 핵심: Supabase가 할 수 있는 일(Auth/RLS/Storage/Realtime)을 앱 코드로 재구현하지 않고, 새 의존성 추가나 새 파일 3개 이상 생성은 마지막 수단으로만 고려한다.

## 핵심 규칙 요약

- **패키지 매니저**: `yarn`만 사용. `npm` 절대 금지.
- **Supabase 쿼리**: `src/libs/supabase/queries/` 파일에서만 작성. 컴포넌트·페이지에 인라인 쿼리 금지.
- **클라이언트 인증 상태**: `@tanstack/react-query` 기반(`AUTH_QUERY_KEY`). 쿼리 캐시를 직접 조작하지 말고 `useAuth()` / `useUser()` 훅만 사용.
- **shadcn utils 경로**: `@/libs/utils` (`@/lib/utils` 아님).
- **목 인증**: `profile.id === 'mock-user-id'` 체크 후 Supabase 호출을 건너뛰는 패턴과, 라우트를 보호하는 `mock-auth` 쿠키 체크(위 "아키텍처 개요 → 인증" 참고)는 별개다. 전자는 쓰기 작업 스킵용, 후자는 라우트 접근 제어용 — 실 Supabase 인증 연결 시 **둘 다** 교체 대상.
- **공개 REST API (`/api/v1/*`)**: 관리자 세션이 아닌 `X-API-Key` 헤더로 인증한다 (`INTERNAL_API_KEY` 환경변수). Public read 함수에는 `createAdminClient()`(RLS 우회) 대신 반드시 `createClient()`(anon key + RLS)를 사용한다.
- **콘텐츠 테이블 명명 규칙**: 신규 콘텐츠 테이블은 `statkit_` 접두사를 따른다 (`statkit_posts`, `statkit_products`, `statkit_portfolios`, `statkit_content_api_configs`).
- **⚠️ 알려진 드리프트**: `statkit_content_api_configs`의 `portfolio` 시드 행은 `table_name = 'portfolios'`(접두사 없음)인데 실제 관리자 CRUD는 `statkit_portfolios`를 쓴다. `portfolio` 리소스의 `is_enabled`를 켜기 전에 `table_name`을 `statkit_portfolios`로 맞춰야 한다.

## 빠른 참조

| 주제 | 파일 |
|------|------|
| Supabase 쿼리 작성 규칙 (절대 규칙) | [`.claude/memory/data-access-rules.md`](.claude/memory/data-access-rules.md) |
| 개발 환경 변수 · Git 훅 상세 | [`.claude/memory/dev-setup.md`](.claude/memory/dev-setup.md) |
| 동적 REST API용 CORS 설정 (`/api/v1/*`) | [`.claude/memory/cors-setup.md`](.claude/memory/cors-setup.md) |
| Supabase 테이블 전체 DDL | [`.claude/memory/supabase_schema.md`](.claude/memory/supabase_schema.md) |
| 코드 리뷰 피드백 (admin client 사용 기준 · upsert 배치) | [`feedback_admin_client_usage.md`](.claude/memory/feedback_admin_client_usage.md), [`feedback_upsert_batch.md`](.claude/memory/feedback_upsert_batch.md) |
