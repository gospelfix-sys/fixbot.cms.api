# Swagger 기반 API 레이어 추가

## Context

현재 프로젝트는 Next.js 14 App Router 기반의 관리자 CMS이며, API 라우트가 OAuth 콜백 하나뿐인 상태입니다. 사용자가 Swagger(OpenAPI 3.1) 기반으로 REST API를 만들고 문서화하고 싶다고 요청했습니다.

Zod를 이미 사용 중이므로 `@asteasolutions/zod-to-openapi`를 채택합니다. Zod 스키마에서 OpenAPI 스펙을 자동 생성하므로 타입 안전성이 보장되며, `any` 금지 원칙과 정합성이 높습니다.

---

## 설치할 패키지

```bash
yarn add @asteasolutions/zod-to-openapi swagger-ui-react
yarn add -D @types/swagger-ui-react
```

---

## 수정/생성 파일 목록

| 파일 | 작업 | 역할 |
|------|------|------|
| `next.config.mjs` | **수정** | `transpilePackages`에 `swagger-ui-react` 추가 (CJS 번들링 오류 방지) |
| `src/middleware.ts` | **수정** | `/api-docs` 경로 보호 추가 (matcher + 인증 분기) |
| `src/libs/openapi/registry.ts` | **신규** | OpenAPI Registry 싱글톤 (+ `extendZodWithOpenApi` 호출) |
| `src/libs/openapi/spec.ts` | **신규** | 전체 스펙 빌더 (`buildOpenApiSpec`) |
| `src/libs/openapi/auth.ts` | **신규** | `X-API-Key` 헤더 검증 유틸 |
| `src/libs/openapi/schemas/health.schema.ts` | **신규** | Health 엔드포인트 Zod 스키마 + 라우트 등록 |
| `src/app/api/openapi.json/route.ts` | **신규** | OpenAPI 스펙 JSON 서빙 엔드포인트 |
| `src/app/api/v1/health/route.ts` | **신규** | 첫 번째 예제 API 엔드포인트 |
| `src/components/swagger/SwaggerUI.tsx` | **신규** | `'use client'` + dynamic import(SSR off) Swagger UI 래퍼 |
| `src/app/api-docs/page.tsx` | **신규** | Swagger UI 렌더링 페이지 |
| `src/types/api.ts` | **신규** | 공통 API 응답 타입 |
| `.env.local` | **수정** | `INTERNAL_API_KEY` 추가 |

---

## 구현 순서

### 1. `next.config.mjs` 수정

`swagger-ui-react`는 CJS 패키지이므로 App Router에서 번들링 오류가 발생합니다.

```js
const nextConfig = {
  transpilePackages: ['swagger-ui-react', 'swagger-client', 'react-syntax-highlighter'],
  // 기존 설정 유지
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] },
};
```

### 2. `src/middleware.ts` 수정

현재 `ADMIN_PATHS` 배열과 `matcher`에 `/api-docs`가 없음. 두 곳 모두 추가 필요.

```typescript
// ADMIN_PATHS 아래에 추가 (별도 분기)
if (pathname === '/api-docs' || pathname.startsWith('/api-docs/')) {
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/sign/in', request.url));
  }
  return NextResponse.next();
}

// config.matcher에 추가
'/api-docs/:path*',
```

### 3. `src/libs/openapi/registry.ts`

```typescript
import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z); // 전역 1회 호출

export const registry = new OpenAPIRegistry();
```

### 4. `src/libs/openapi/schemas/health.schema.ts`

```typescript
import { z } from 'zod';
import { registry } from '@/libs/openapi/registry';

export const HealthResponseSchema = z
  .object({
    status: z.enum(['ok', 'error']).openapi({ example: 'ok' }),
    timestamp: z.string().datetime().openapi({ example: '2026-07-18T00:00:00.000Z' }),
    version: z.string().openapi({ example: '1.0.0' }),
  })
  .openapi('HealthResponse');

registry.registerPath({
  method: 'get',
  path: '/api/v1/health',
  summary: 'Health Check',
  security: [{ ApiKeyAuth: [] }],
  responses: {
    200: {
      description: '서버 정상',
      content: { 'application/json': { schema: HealthResponseSchema } },
    },
  },
});
```

### 5. `src/libs/openapi/spec.ts`

```typescript
import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/libs/openapi/registry';
import '@/libs/openapi/schemas/health.schema'; // 부수효과로 등록

export function buildOpenApiSpec() {
  registry.registerComponent('securitySchemes', 'ApiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
  });

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: '3.1.0',
    info: { title: 'GospelFix CMS API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001', description: 'Local' }],
  });
}
```

### 6. `src/libs/openapi/auth.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.INTERNAL_API_KEY;

  if (!validKey && process.env.NODE_ENV === 'development') return null;
  if (!apiKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
```

### 7. `src/app/api/openapi.json/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { buildOpenApiSpec } from '@/libs/openapi/spec';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(buildOpenApiSpec());
}
```

### 8. `src/app/api/v1/health/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/libs/openapi/auth';

export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
```

### 9. `src/components/swagger/SwaggerUI.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUILib = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className="p-8 text-gray-500">API 문서를 불러오는 중...</div>,
});

export default function SwaggerUI() {
  return <SwaggerUILib url="/api/openapi.json" docExpansion="list" persistAuthorization tryItOutEnabled />;
}
```

### 10. `src/app/api-docs/page.tsx`

```typescript
import SwaggerUI from '@/components/swagger/SwaggerUI';

export const metadata = { title: 'API 문서 | GospelFix CMS' };

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">GospelFix CMS API</h1>
        <SwaggerUI />
      </div>
    </div>
  );
}
```

### 11. `src/types/api.ts`

```typescript
export type ApiSuccessResponse<T> = { data: T; message?: string };
export type ApiErrorResponse = { error: string; code?: string };
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### 12. `.env.local`

```
INTERNAL_API_KEY=your-secret-key-here
```

---

## 새 API 추가 워크플로우 (향후)

1. `src/libs/openapi/schemas/[resource].schema.ts` — Zod 스키마 + `registry.registerPath()` 작성
2. `src/libs/openapi/spec.ts` — import 1줄 추가
3. `src/app/api/v1/[resource]/route.ts` — 핸들러 작성
4. Supabase 쿼리가 필요하면 `src/libs/supabase/queries/[resource].ts` 에 추가 (절대 규칙)

---

## 검증 방법

```bash
# 1. 스펙 JSON 확인
curl http://localhost:3001/api/openapi.json

# 2. API Key 없이 호출 → 401
curl -i http://localhost:3001/api/v1/health

# 3. API Key와 함께 호출 → 200
curl -H "X-API-Key: your-secret-key-here" http://localhost:3001/api/v1/health

# 4. TypeScript 체크
yarn tsc --noEmit
```

Swagger UI: `http://localhost:3001/api-docs` (로그인 필요)
