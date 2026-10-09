import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry';

export const OrderSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    user_id: z.string().uuid().nullable().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    product_id: z.string().uuid().nullable().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    order_id: z.string().openapi({ example: 'ORD-20260721-001' }),
    amount: z.number().int().openapi({ example: 29000 }),
    status: z.enum(['pending', 'pending_confirm', 'paid', 'cancelled']).openapi({ example: 'paid' }),
    payment_key: z.string().nullable().openapi({ example: 'toss_payment_key_123' }),
    paid_at: z.string().datetime().nullable().openapi({ example: '2026-07-21T10:00:00.000Z' }),
    created_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
    updated_at: z.string().datetime().openapi({ example: '2026-07-21T00:00:00.000Z' }),
  })
  .openapi('Order');

export const OrderListResponseSchema = z
  .object({
    data: z.array(OrderSchema),
    total: z.number().int().openapi({ example: 50 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 10 }),
  })
  .openapi('OrderListResponse');

export const OrderDetailResponseSchema = z
  .object({ data: OrderSchema })
  .openapi('OrderDetailResponse');

export function registerOrderPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/orders',
    summary: '주문 목록 조회',
    description: '전체 주문 목록을 페이지네이션으로 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1', description: '페이지 번호 (기본값: 1)' }),
        limit: z.string().optional().openapi({ example: '10', description: '페이지당 건수 (기본값: 10)' }),
      }),
    },
    responses: {
      200: { description: '주문 목록', content: { 'application/json': { schema: OrderListResponseSchema } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/v1/orders/{id}',
    summary: '주문 단건 조회',
    description: 'UUID로 주문 상세를 반환합니다.',
    security: [{ ApiKeyAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) }),
    },
    responses: {
      200: { description: '주문 상세', content: { 'application/json': { schema: OrderDetailResponseSchema } } },
      400: { description: '유효하지 않은 UUID', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      401: { description: '인증 실패', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
      404: { description: '주문을 찾을 수 없음', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
    },
  });
}
