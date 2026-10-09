import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry';

export const PortfolioSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: z.string().openapi({ example: '브랜드 쇼핑몰 리뉴얼' }),
    category: z.string().nullable().openapi({ example: '쇼핑몰' }),
    description: z.string().nullable().openapi({ example: '패션 브랜드 공식 쇼핑몰 UI/UX 전면 리뉴얼' }),
    tags: z.array(z.string()).openapi({ example: ['React', 'Next.js', 'Tailwind'] }),
    thumbnail_url: z.string().nullable().openapi({ example: 'https://example.com/thumbnail.jpg' }),
    site_url: z.string().nullable().openapi({ example: 'https://brand.example.com' }),
    images: z.array(z.string()).openapi({ example: ['https://example.com/image1.jpg'] }),
    sort_order: z.number().int().openapi({ example: 1 }),
    created_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
    updated_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
  })
  .openapi('Portfolio');

export const PortfolioListResponseSchema = z
  .object({
    data: z.array(PortfolioSchema),
    total: z.number().int().openapi({ example: 20 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
  })
  .openapi('PortfolioListResponse');

export const PortfolioDetailResponseSchema = z
  .object({ data: PortfolioSchema })
  .openapi('PortfolioDetailResponse');

export function registerPortfolioPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/portfolio',
    summary: '포트폴리오 목록 조회',
    description: 'content_api_configs의 filter_column(is_published=true) 조건으로 필터링된 포트폴리오 목록을 반환합니다. is_published 필드는 응답에 포함되지 않습니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1', description: '페이지 번호 (기본값: 1)' }),
        limit: z.string().optional().openapi({ example: '10', description: '페이지당 건수 (기본값: 10)' }),
      }),
    },
    responses: {
      200: { description: '포트폴리오 목록', content: { 'application/json': { schema: PortfolioListResponseSchema } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/v1/portfolio/{id}',
    summary: '포트폴리오 단건 조회',
    description: 'UUID로 포트폴리오 상세를 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) }),
    },
    responses: {
      200: { description: '포트폴리오 상세', content: { 'application/json': { schema: PortfolioDetailResponseSchema } } },
      400: { description: '유효하지 않은 UUID', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      404: { description: '포트폴리오를 찾을 수 없음', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });
}
