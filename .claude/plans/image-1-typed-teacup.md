# Plan: "링크 복사" → "복사" (행 복제 — 바로 아래 삽입)

## Context

Portfolio·Blog·Products 테이블의 3점 드롭다운 "링크 복사"를 "복사"로 교체한다.
클릭 시 해당 행 데이터를 DB에 복제하여 **원본 행 바로 아래 위치**에 삽입해야 한다.
기존 드래그 정렬이 `sort_order` 정수 컬럼을 사용하므로, 삽입 후 아래 항목들의 sort_order를 +1씩 밀어내는 방식을 채택한다.

---

## 수정 대상 파일 (총 9개)

### 1. Queries 레이어 — 복제 함수 추가

| 파일 | 추가 함수 |
|------|----------|
| `src/libs/supabase/queries/portfolios.admin.ts` | `duplicatePortfolio(id)` |
| `src/libs/supabase/queries/posts.admin.ts` | `duplicatePost(id)` |
| `src/libs/supabase/queries/products.admin.ts` | `duplicateProduct(id)` |

**각 함수 공통 흐름 (sort_order 기반 "바로 아래" 삽입):**

```typescript
export async function duplicatePortfolio(id: string): Promise<Portfolio> {
  assertValidUUID(id);
  const supabase = createAdminClient();

  // 1. 현재 UI 정렬 순서와 동일하게 모든 항목 조회
  const { data: allItems } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  // 2. 원본 항목 위치 찾기
  const originalIdx = allItems.findIndex(item => item.id === id);
  const original = allItems[originalIdx];

  // 3. 배열에서 원본 바로 뒤에 플레이스홀더 삽입 후 sort_order 재계산
  const reordered = [...allItems];
  reordered.splice(originalIdx + 1, 0, { id: '__new__' });
  const newSortOrder = originalIdx + 2; // 1-based index

  // 4. 기존 항목들 sort_order 업데이트 (원본 포함, 그 아래 항목들 +1)
  await Promise.all(
    reordered
      .filter(item => item.id !== '__new__')
      .map((item, i) =>
        supabase.from(TABLE).update({ sort_order: i + 1 }).eq('id', item.id)
      )
  );

  // 5. 새 항목 삽입 (is_published: false 고정)
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: original.title,
      category: original.category,
      description: original.description,
      tags: original.tags,
      thumbnail_url: original.thumbnail_url,
      site_url: original.site_url,
      images: original.images,
      is_published: false,
      sort_order: newSortOrder,
    })
    .select()
    .single();

  if (error) throw new Error('포트폴리오 복사에 실패했습니다.');
  return toPortfolio(data);
}
```

**테이블별 추가 주의사항:**

| 테이블 | 특이사항 |
|--------|---------|
| Portfolio | 없음 — 모든 필드 직접 복사 가능 |
| Post | `slug` UNIQUE → `${original.slug}-copy-${Date.now()}`, `title: ${original.title} (복사본)`, `is_published: false`. 쿼리 `.order('sort_order', { ascending: true, nullsFirst: false })` |
| Product | `slug` UNIQUE → `${original.slug}-copy-${Date.now()}`, `name: ${original.name} (복사본)`, `status: 'inactive'`, `is_active: false`. 쿼리 `.order('sort_order', { ascending: true, nullsFirst: false })` |

> `id`, `created_at`, `updated_at` 는 항상 제외 (DB 자동 생성)

---

### 2. Actions 레이어 — 액션 추가

| 파일 | 추가 액션 |
|------|----------|
| `src/app/(admin)/portfolio/actions.ts` | `export async function duplicatePortfolioAction(id: string): Promise<Portfolio>` |
| `src/app/(admin)/blog/actions.ts` | `export async function duplicatePostAction(id: string): Promise<Post>` |
| `src/app/(admin)/products/actions.ts` | `export async function duplicateProductAction(id: string): Promise<Product>` |

기존 `deleteXxxAction` 패턴과 동일하게 queries 함수 단순 래핑.

---

### 3. Table 컴포넌트 — UI + 핸들러 교체 (3개 파일 공통)

**Import 변경:**
```diff
- import { ..., Copy, Check } from 'lucide-react';
+ import { ..., Copy } from 'lucide-react';   // Check 아이콘 제거
- import { deleteXxxAction, updateXxxSortOrderAction } from './actions';
+ import { deleteXxxAction, updateXxxSortOrderAction, duplicateXxxAction } from './actions';
```

**State 변경:**
```diff
- const [copiedId, setCopiedId] = useState<string | null>(null);
+ const [duplicating, setDuplicating] = useState<string | null>(null);
```

**함수 교체:**
```diff
- const handleCopyLink = async (url: string, id: string) => { ... };
+ const handleDuplicate = async (id: string) => {
+   setMenuOpenId(null);
+   setDuplicating(id);
+   try {
+     await duplicateXxxAction(id);
+     router.refresh();
+   } catch {
+     setAlertMessage('복사에 실패했습니다.');
+   } finally {
+     setDuplicating(null);
+   }
+ };
```

**드롭다운 버튼 교체:**
```diff
- <button
-   onClick={() => url && handleCopyLink(url, item.id)}
-   disabled={!url}
- >
-   {copiedId === item.id ? <Check .../> : <Copy .../>}
-   {copiedId === item.id ? '복사됨!' : '링크 복사'}
- </button>
+ <button
+   onClick={() => handleDuplicate(item.id)}
+   disabled={duplicating !== null}
+   className="... disabled:opacity-40 disabled:cursor-not-allowed"
+ >
+   <Copy size={14} className="text-gray-400 shrink-0" />
+   복사
+ </button>
```

> URL 유무와 무관한 기능이므로 기존 `disabled={!url}` 조건도 제거

---

## 검증 방법

1. Portfolio/Blog/Products 목록에서 3점 메뉴 클릭 → "복사" 항목 표시 확인
2. "복사" 클릭 → 원본 행 **바로 아래**에 동일한 데이터 행이 나타나는지 확인
3. 복제 항목이 미발행(draft)/비활성 상태인지 확인
4. Blog/Product 복제 항목의 slug에 `-copy-{timestamp}` 포함 확인
5. 복제 후 드래그 정렬이 정상 동작하는지 확인 (sort_order 재배열 검증)
