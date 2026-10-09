---
name: sort_order 일괄 UPDATE — Promise.all N+1 대신 upsert 배치 사용
description: Promise.all + 개별 UPDATE는 N개 독립 트랜잭션. Supabase upsert({onConflict:'id'})로 단일 쿼리 대체 필수
type: feedback
---

`Promise.all` + N개 개별 `.update().eq('id', id)` 호출은 N+1 패턴이다. sort_order 일괄 업데이트처럼 동일 구조를 반복하는 경우 반드시 `upsert(배열, { onConflict: 'id' })`로 단일 쿼리 처리한다.

**Why:** `updatePostsSortOrder`·`updateProductsSortOrder` 두 함수가 Promise.all + N개 UPDATE를 써서 code-reviewer BLOCKED 판정을 받았음. upsert는 `INSERT ... ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order` 단일 SQL로 처리되어 DB 왕복이 1회로 줄어듦.

**How to apply:**
```typescript
// ❌ N+1 패턴 (수정 전)
const results = await Promise.all(
  updates.map(({ id, sort_order }) =>
    supabase.from('posts').update({ sort_order }).eq('id', id),
  ),
);

// ✅ upsert 배치 (수정 후)
const { error } = await supabase
  .from('posts')
  .upsert(updates, { onConflict: 'id' });
```

- `{id, sort_order}`만 전달해도 안전: PostgreSQL ON CONFLICT 감지 시 INSERT 튜플의 NOT NULL 제약 검사 전에 UPDATE 경로로 분기하므로 `slug NOT NULL` 등 다른 컬럼 제약을 위반하지 않음 (기존 행에만 적용하는 전제)
- 적용 파일: `src/libs/supabase/queries/posts.admin.ts`, `src/libs/supabase/queries/products.admin.ts`
- sort_order 외 다른 컬럼 일괄 UPDATE에도 동일 패턴 적용
