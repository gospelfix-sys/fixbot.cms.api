---
name: createAdminClient() 사용 기준 — Public read에 사용 금지
description: createAdminClient()는 RLS를 완전히 우회하므로 admin 쓰기 작업에만 허용. Public read는 createClient()(anon key + RLS) 사용 필수
type: feedback
---

`createAdminClient()`는 RLS를 완전히 우회하므로 Public API용 읽기에 사용하면 보안 정책이 무력화된다. Public read에는 반드시 `createClient()` from `@/libs/supabase/server`를 사용한다.

**Why:** `products.server.ts`가 `getActiveProducts` 등 Public API 함수에 `createAdminClient()`를 써서 code-reviewer BLOCKED 판정을 받았음. `products` 테이블의 RLS 정책(`products_public_read: using (is_active = true)`)이 있어도 admin client는 이를 무시하고 전체 데이터를 노출할 수 있음.

**How to apply:**
- **`createAdminClient()` 허용**: 관리자 전용 CRUD (INSERT / UPDATE / DELETE), admin 패널 전용 read, 서비스 롤 권한이 필요한 작업
- **`createClient()` 필수**: `*.server.ts` 파일의 Public API read, 인증 불필요한 공개 데이터 조회
- 기준 파일: `posts.server.ts`(올바른 패턴) vs `products.server.ts`(수정 대상) — 동일 역할 파일은 동일 클라이언트를 써야 함
- 파일 위치: `src/libs/supabase/queries/products.server.ts`
