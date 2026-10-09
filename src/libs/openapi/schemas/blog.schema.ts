import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry'; // ensures extendZodWithOpenApi(z) runs

export const BlogPostSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: z.string().openapi({ example: '첫 번째 포스트' }),
    slug: z.string().openapi({ example: 'first-post' }),
    excerpt: z.string().nullable().openapi({ example: '이 글은 첫 번째 포스트입니다.' }),
    cover_image_url: z.string().nullable().openapi({ example: 'https://example.com/image.jpg' }),
    content: z.string().nullable().openapi({ example: '<p>본문 내용입니다.</p>' }),
    tags: z.array(z.string()).openapi({ example: ['news', 'update'] }),
    published_at: z.string().datetime().nullable().openapi({ example: '2026-07-18T00:00:00.000Z' }),
    created_at: z.string().datetime().openapi({ example: '2026-07-18T00:00:00.000Z' }),
  })
  .openapi('BlogPost');

export const BlogListResponseSchema = z
  .object({
    data: z.array(BlogPostSchema),
    total: z.number().int().openapi({ example: 42 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
  })
  .openapi('BlogListResponse');

export const BlogDetailResponseSchema = z
  .object({
    data: BlogPostSchema,
  })
  .openapi('BlogDetailResponse');

export function registerBlogPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/blog',
    summary: '발행된 블로그 포스트 목록 조회',
    description: '발행(published) 상태인 포스트를 페이지네이션으로 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1', description: '페이지 번호 (기본값: 1)' }),
        limit: z.string().optional().openapi({ example: '10', description: '페이지당 건수 (기본값: 10)' }),
      }),
    },
    responses: {
      200: {
        description: '포스트 목록',
        content: { 'application/json': { schema: BlogListResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/v1/blog/{slug}',
    summary: '블로그 포스트 단건 조회',
    description: 'slug로 발행된 포스트 상세를 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      params: z.object({
        slug: z.string().openapi({ example: 'first-post' }),
      }),
    },
    responses: {
      200: {
        description: '포스트 상세',
        content: { 'application/json': { schema: BlogDetailResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
      404: {
        description: '포스트를 찾을 수 없음',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  });
}
