# 콘텐츠 유형별 REST API 토글 시스템

## Context

현재 `/api/v1/blog`, `/api/v1/products` 엔드포인트는 각각 별도의 `route.ts` 파일로 하드코딩되어 있다. 새 콘텐츠 유형(portfolio, orders 등)에 REST API를 추가하려면 매번 route 파일과 OpenAPI 스키마를 수동 작성해야 한다. 이를 **Settings 페이지 토글 버튼 하나**로 활성화/비활성화할 수 있는 시스템으로 전환한다.

---

## 핵심 아이디어

1. **`content_api_configs` Supabase 테이블** — 어떤 콘텐츠 유형이 API를 노출하는지, 어떤 DB 테이블을 읽는지, 어떤 컬럼으로 필터링하는지를 저장하는 진실 공급원
2. **단일 동적 라우트** `/api/v1/[resource]` — 하나의 핸들러가 모든 콘텐츠 유형을 처리
3. **Settings 페이지 API 섹션** — 토글 버튼으로 `is_enabled` 업데이트
4. **동적 OpenAPI 스펙** — 활성화된 config 기반으로 런타임에 스펙 생성

---

## Step 1: Supabase DDL

Supabase SQL Editor에서 실행:

```sql
CREATE TABLE public.content_api_configs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_slug     TEXT        NOT NULL UNIQUE,        -- URL 경로: 'blog', 'products'
  label             TEXT        NOT NULL,               -- 한국어 표시명
  table_name        TEXT        NOT NULL,               -- DB 테이블명: 'posts', 'products'
  is_enabled        BOOLEAN     NOT NULL DEFAULT false,
  filter_column     TEXT,                               -- 'status', 'is_active'
  filter_value      TEXT,                               -- 'published', 'true'
  filter_is_bool    BOOLEAN     NOT NULL DEFAULT false, -- true이면 filter_value를 boolean으로 캐스팅
  identifier_column TEXT        NOT NULL DEFAULT 'id',  -- 단건 조회 키: 'slug', 'id'
  identifier_type   TEXT        NOT NULL DEFAULT 'uuid' CHECK (identifier_type IN ('uuid','text')),
  order_column      TEXT        NOT NULL DEFAULT 'created_at',
  order_direction   TEXT        NOT NULL DEFAULT 'desc' CHECK (order_direction IN ('asc','desc')),
  select_columns    TEXT,                               -- null이면 *, 예: 'id,slug,title'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER content_api_configs_updated_at
  BEFORE UPDATE ON public.content_api_configs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.content_api_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin full access" ON public.content_api_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 시드 데이터 (기존 blog, products를 활성 상태로 등록)
INSERT INTO public.content_api_configs
  (resource_slug, label, table_name, is_enabled,
   filter_column, filter_value, filter_is_bool,
   identifier_column, identifier_type,
   order_column, order_direction, select_columns)
VALUES
  ('blog', '블로그', 'posts', true,
   'status', 'published', false,
   'slug', 'text',
   'sort_order', 'asc',
   'id,title,slug,excerpt,cover_image_url,content,tags,published_at,created_at'),
  ('products', '상품', 'products', true,
   'is_active', 'true', true,
   'id', 'uuid',
   'sort_order', 'asc',
   'id,slug,name,description,category,thumbnail_url,demo_url,includes,price_type,base_price,options,created_at,updated_at');
```

---

## Step 2: 쿼리 레이어 신규 생성

**`src/libs/supabase/queries/content-api-configs.ts`** (신규)

```ts
export interface ContentApiConfig { /* 위 테이블 컬럼과 1:1 */ }

export async function getApiConfigBySlug(slug: string): Promise<ContentApiConfig | null>
export async function getAllApiConfigs(): Promise<ContentApiConfig[]>
export async function toggleApiConfig(id: string, isEnabled: boolean): Promise<void>

// 라우트 핸들러에서 직접 DB 접근 금지 규칙을 지키기 위해 동적 쿼리 실행도 여기에 작성
export async function queryConfigList(config, page, limit): Promise<{ data: unknown[]; total: number }>
export async function queryConfigDetail(config, identifier): Promise<unknown | null>
```

- 내부적으로 `createAdminClient()` 사용
- `filter_is_bool === true`이면 `filter_value === 'true'` → JS boolean으로 변환 후 `.eq()` 호출
- `identifier_type === 'uuid'`이면 단건 쿼리 전 UUID 형식 검증, 실패 시 null 반환 대신 에러 throw 구분

---

## Step 3: 동적 라우트 핸들러 신규 생성

**`src/app/api/v1/[resource]/route.ts`** (신규)

```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { resource } = await params;
  const config = await getApiConfigBySlug(resource);
  if (!config || !config.is_enabled) return 404;      // 비활성 = 존재하지 않음으로 처리

  const { page, limit } = parsePagination(request);
  const { data, total } = await queryConfigList(config, page, limit);
  return NextResponse.json({ data, total, page, limit });
}
```

**`src/app/api/v1/[resource]/[identifier]/route.ts`** (신규)

```ts
// identifier_type이 'uuid'이면 UUID 형식 검증 → 400
// config 없거나 is_enabled=false → 404
// DB에 없으면 404
```

---

## Step 4: 기존 하드코딩 라우트 삭제

동적 라우트 동작 검증 후 아래 4개 파일 삭제:
- `src/app/api/v1/blog/route.ts`
- `src/app/api/v1/blog/[slug]/route.ts`
- `src/app/api/v1/products/route.ts`
- `src/app/api/v1/products/[id]/route.ts`

> Next.js는 정적 경로를 동적 경로보다 우선하므로, 이 파일들이 살아있는 동안은 동적 라우트가 blog/products를 처리하지 않는다. 검증 후 삭제해야 완전히 전환된다.

---

## Step 5: Settings 페이지 재편

현재 `settings/page.tsx`는 `'use client'`다. DB를 서버에서 읽어야 하므로 아래 패턴으로 전환 (blog/page.tsx + BlogTable.tsx 패턴과 동일):

```
src/app/(admin)/settings/
  page.tsx                  ← async Server Component (getAllApiConfigs 호출)
  SettingsClientSection.tsx ← 'use client' (기존 테마·계정 코드 이전)
  ApiConfigSection.tsx      ← 'use client' (토글 버튼, router.refresh())
  actions.ts                ← 'use server' (toggleApiConfigAction)
```

**`ApiConfigSection.tsx` 핵심 동작:**
- props로 `configs: ContentApiConfig[]` 수신
- 토글 버튼 클릭 → `toggleApiConfigAction(id, !current)` 호출 → `router.refresh()`
- `useTransition`으로 로딩 상태 관리, 변경 중인 행만 disabled 처리
- 토글 스타일: 프로젝트 메인 컬러(black/white) 준수

---

## Step 6: OpenAPI 동적화

**`src/app/api/openapi.json/route.ts`** 수정:
- `force-static` → `force-dynamic`
- `buildOpenApiSpec` → `buildDynamicOpenApiSpec` 호출

**`src/libs/openapi/dynamic-spec.ts`** 신규 생성:
- `getAllApiConfigs()`로 enabled configs 조회
- `blog`, `products`는 기존 정적 스펙 registry 재사용 (타입 정보 풍부)
- 그 외 새 콘텐츠 유형은 generic schema 자동 생성 (`z.record(z.unknown())`)
- 정적 registry + 동적 registry definitions를 병합해 OpenAPI document 생성

> **한계:** 새 콘텐츠 유형의 OpenAPI 스펙은 generic(`data: object[]`)으로 생성된다. 필드별 타입 문서화가 필요하면 해당 타입의 `xxx.schema.ts`를 추가하고 `STATIC_SLUGS` Set에 등록한다.

---

## 수정·삭제 파일 요약

| 액션 | 파일 |
|------|------|
| 신규 생성 | `src/libs/supabase/queries/content-api-configs.ts` |
| 신규 생성 | `src/app/api/v1/[resource]/route.ts` |
| 신규 생성 | `src/app/api/v1/[resource]/[identifier]/route.ts` |
| 신규 생성 | `src/libs/openapi/dynamic-spec.ts` |
| 신규 생성 | `src/app/(admin)/settings/SettingsClientSection.tsx` |
| 신규 생성 | `src/app/(admin)/settings/ApiConfigSection.tsx` |
| 신규 생성 | `src/app/(admin)/settings/actions.ts` |
| 수정 | `src/app/(admin)/settings/page.tsx` (Server Component 전환) |
| 수정 | `src/app/api/openapi.json/route.ts` (force-dynamic + buildDynamicOpenApiSpec) |
| 삭제 (Step 4) | `src/app/api/v1/blog/route.ts` |
| 삭제 (Step 4) | `src/app/api/v1/blog/[slug]/route.ts` |
| 삭제 (Step 4) | `src/app/api/v1/products/route.ts` |
| 삭제 (Step 4) | `src/app/api/v1/products/[id]/route.ts` |

---

## 검증 방법

1. **토글 비활성화 → 404 확인**: Settings → "블로그" API 비활성화 → `/api/v1/blog` 요청 → 404 반환
2. **토글 활성화 → 정상 응답 확인**: 다시 활성화 → `/api/v1/blog` 요청 → posts 목록 반환
3. **OpenAPI 반영 확인**: `/api-docs` → blog 엔드포인트 비활성 시 경로 사라짐 / 활성 시 다시 표시
4. **새 콘텐츠 유형 즉시 추가**: Supabase에서 `content_api_configs`에 새 행 INSERT + `is_enabled=true` → 코드 변경 없이 `/api/v1/[new-resource]` 즉시 동작 확인

---

## 주요 설계 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| 비활성 API 응답 코드 | 404 | 리소스 존재 자체를 숨기는 것이 보안상 유리 |
| config 조회 캐싱 | 매 요청 DB 조회 | 토글 즉시 반영 필요, 초기에는 단순하게 |
| `select_columns` 타입 | 문자열 ('id,slug,...') | Supabase `.select()` 인자와 직접 호환 |
| Settings page 구조 | Server Component 전환 | blog/page.tsx 패턴과 일관성 유지 |
