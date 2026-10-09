---
name: 데이터 접근 규칙
description: Supabase 쿼리 작성 위치 및 도메인 분리 규칙 (절대 규칙)
type: project
---

# 데이터 접근 규칙

> **절대 규칙**: Supabase 쿼리(`select`, `insert`, `update`, `delete`)는 반드시 `src/libs/supabase/queries/` 디렉토리 내 파일에서만 작성한다.

## 세부 규칙

1. **인라인 쿼리 금지**: 컴포넌트(`.tsx`), 페이지(`page.tsx`) 안에서 `createClient()`를 직접 호출해 쿼리를 작성하지 않는다.
2. **도메인 단위 파일 분리**: 쿼리 함수는 리소스(도메인)별로 파일을 분리한다.
3. **컴포넌트는 import 후 호출만 허용**: 컴포넌트·페이지는 `queries/` 함수를 import해서 호출하는 것만 허용한다.

## Server Action 규칙 (절대 규칙)

`'use server'` 파일(actions.ts)에는 **뮤테이션 전용 함수만** 정의한다.

- **허용**: `createXxx`, `updateXxx`, `deleteXxx` — DB 쓰기 작업
- **금지**: `getAllXxx`, `getXxxById` — DB 읽기 작업

읽기는 Server Component에서 `queries/` 레이어를 직접 import해 호출한다. Server Action으로 읽기를 노출하면 HTTP POST 엔드포인트가 생성되어 불필요한 네트워크 왕복이 발생한다.

```ts
// actions.ts — 올바른 패턴
'use server';
export async function createPostAction(...) { return createPost(...); }

// page.tsx (Server Component) — 읽기는 직접 import
import { getAllPosts } from '@/libs/supabase/queries/posts.admin';
const posts = await getAllPosts();
```

## 디렉토리 구조

```
src/libs/supabase/
├── client.ts              # 브라우저 클라이언트 (anon key)
├── server.ts              # 서버 클라이언트 (anon key, 공개 읽기)
├── admin.ts               # 서버 admin 클라이언트 (service_role key, RLS 우회)
├── middleware.ts          # updateSession (미들웨어 전용)
└── queries/               # 실제 쿼리 함수 — 도메인별 파일 분리
    ├── profile.ts         # 프로필 관련
    ├── users.ts           # 유저 관련
    ├── orders.ts          # 주문 관련
    ├── products.ts        # 상품 관련
    ├── reviews.ts         # 리뷰 관련
    ├── posts.ts           # 포스트 (브라우저 anon key — 공개 읽기용)
    ├── posts.server.ts    # 포스트 (서버 anon key — 공개 API용)
    └── posts.admin.ts     # 포스트 admin (service_role key — CMS 쓰기용)
```

## 예시

**올바른 예:**
```ts
// page.tsx
import { updateProfile } from '@/libs/supabase/queries/profile';
await updateProfile(id, full_name);
```

**잘못된 예:**
```ts
// page.tsx ← 금지
import { createClient } from '@/libs/supabase/client';
const supabase = createClient();
await supabase.from('profiles').update({ full_name }).eq('id', id);
```
