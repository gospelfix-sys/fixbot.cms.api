import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry'; // ensures extendZodWithOpenApi(z) runs

export const ProductOptionSchema = z
  .object({
    name: z.string().openapi({ example: '고급 플랜' }),
    price: z.number().int().openapi({ example: 29000 }),
    description: z.string().openapi({ example: '소스 파일 + 1년 업데이트 포함' }),
  })
  .openapi('ProductOption');

export const ProductSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    slug: z.string().openapi({ example: 'react-dashboard-starter' }),
    name: z.string().openapi({ example: 'React 대시보드 스타터' }),
    description: z.string().nullable().openapi({ example: '빠르게 시작할 수 있는 React 대시보드 템플릿입니다.' }),
    category: z.string().nullable().openapi({ example: 'template' }),
    thumbnail_url: z.string().nullable().openapi({ example: 'https://example.com/thumbnail.jpg' }),
    demo_url: z.string().nullable().openapi({ example: 'https://demo.example.com' }),
    includes: z.string().nullable().openapi({ example: '소스 파일, 문서, 1년 업데이트' }),
    price_type: z.enum(['free', 'paid']).openapi({ example: 'paid' }),
    base_price: z.number().int().openapi({ example: 19000 }),
    options: z.array(ProductOptionSchema),
    created_at: z.string().datetime().openapi({ example: '2026-07-20T00:00:00.000Z' }),
    updated_at: z.string().datetime().openapi({ example: '2026-07-20T00:00:00.000Z' }),
  })
  .openapi('Product');

export const ProductListResponseSchema = z
  .object({
    data: z.array(ProductSchema),
    total: z.number().int().openapi({ example: 12 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
  })
  .openapi('ProductListResponse');

export const ProductDetailResponseSchema = z
  .object({
    data: ProductSchema,
  })
  .openapi('ProductDetailResponse');

export function registerProductPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/products',
    summary: '활성 상품 목록 조회',
    description: '활성(active) 상태인 상품을 페이지네이션으로 반환합니다. `file_path` 등 내부 필드는 포함되지 않습니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1', description: '페이지 번호 (기본값: 1)' }),
        limit: z.string().optional().openapi({ example: '10', description: '페이지당 건수 (기본값: 10, 최대: 50)' }),
      }),
    },
    responses: {
      200: {
        description: '상품 목록',
        content: { 'application/json': { schema: ProductListResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/v1/products/{id}',
    summary: '상품 단건 조회',
    description: 'UUID로 활성 상품 상세를 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
      }),
    },
    responses: {
      200: {
        description: '상품 상세',
        content: { 'application/json': { schema: ProductDetailResponseSchema } },
      },
      400: {
        description: '유효하지 않은 UUID',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
      404: {
        description: '상품을 찾을 수 없음',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  });
}
