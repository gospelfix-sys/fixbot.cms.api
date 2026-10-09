# Conventions

**Supabase 쿼리 위치 (절대 규칙)**: select/insert/update/delete는 반드시 `src/libs/supabase/queries/` 내 파일에서만 작성. 컴포넌트/페이지 인라인 쿼리 금지. 도메인별 파일 분리 — 클라이언트/서버(anon)/admin(service_role) 키 조합마다 파일 분리 (예: posts.ts / posts.server.ts / posts.admin.ts).

**Server Action 규칙 (절대 규칙)**: `'use server'` actions.ts에는 뮤테이션(create/update/delete)만 정의. 읽기 함수(getAll/getById)는 Server Component가 queries/를 직접 import — Server Action으로 읽기를 노출하면 불필요한 POST 왕복 발생.

**페이지 구조 패턴**: page.tsx(async Server Component, DB 직접 조회) → XxxTable.tsx/XxxForm.tsx('use client', Server Action 호출 후 router.refresh()/router.push()).

**Path alias**: `@/` → `src/`. shadcn utils는 기본값(`@/lib/utils`)이 아니라 **`@/libs/utils`** — 컴포넌트 추가 시 import 확인 필수.

**콘텐츠 테이블 명명**: 신규 콘텐츠 테이블은 `statkit_` 접두사 (statkit_posts, statkit_products, statkit_portfolios, statkit_content_api_configs).

**Public read 함수**: `createAdminClient()`(service_role, RLS 우회) 대신 반드시 `createClient()`(anon key, RLS 적용) 사용 — admin.ts를 공개 읽기에 쓰면 비공개 데이터 노출 위험.

**isMock 패턴**: 클라이언트에서 anon key로 직접 Supabase를 호출하는 경로에서 `profile.id === 'mock-user-id'`면 DB 호출을 건너뛴다 (해당 프로필 row가 실제로 없어 실패/RLS 차단됨). Server Action + admin.ts(service_role) 조합은 RLS를 우회하므로 이 체크 불필요.

**다크모드**: Tailwind v4 + next-themes. 하드코딩 팔레트 클래스마다 `dark:` 변형 명시 필요 (자동 상속 안 됨). `input` 요소는 배경/텍스트/placeholder 색까지 모두 dark: 명시해야 함. `theme` 값은 SSR에서 undefined이므로 `mounted` state로 guard 후 사용.