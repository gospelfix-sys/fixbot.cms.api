import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry';

export const UserSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    email: z.string().openapi({ example: 'user@example.com' }),
    full_name: z.string().nullable().openapi({ example: '홍길동' }),
    avatar_url: z.string().nullable().openapi({ example: 'https://example.com/avatar.jpg' }),
    role: z.enum(['user', 'admin']).openapi({ example: 'user' }),
    created_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
    updated_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
  })
  .openapi('User');

export const UserListResponseSchema = z
  .object({
    data: z.array(UserSchema),
    total: z.number().int().openapi({ example: 100 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
  })
  .openapi('UserListResponse');

export const UserDetailResponseSchema = z
  .object({ data: UserSchema })
  .openapi('UserDetailResponse');

export function registerUserPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/users',
    summary: '유저 목록 조회',
    description: '전체 유저(profiles) 목록을 페이지네이션으로 반환합니다. X-API-Key 인증이 필요한 어드민 전용 엔드포인트입니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1', description: '페이지 번호 (기본값: 1)' }),
        limit: z.string().optional().openapi({ example: '10', description: '페이지당 건수 (기본값: 10)' }),
      }),
    },
    responses: {
      200: { description: '유저 목록', content: { 'application/json': { schema: UserListResponseSchema } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/v1/users/{id}',
    summary: '유저 단건 조회',
    description: 'UUID로 유저 상세를 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) }),
    },
    responses: {
      200: { description: '유저 상세', content: { 'application/json': { schema: UserDetailResponseSchema } } },
      400: { description: '유효하지 않은 UUID', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      404: { description: '유저를 찾을 수 없음', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });
}
