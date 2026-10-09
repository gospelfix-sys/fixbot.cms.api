import { z } from 'zod';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import '@/libs/openapi/registry'; // ensures extendZodWithOpenApi(z) runs

export const HealthResponseSchema = z
  .object({
    status: z.enum(['ok', 'error']).openapi({ example: 'ok' }),
    timestamp: z.string().datetime().openapi({ example: '2026-07-18T00:00:00.000Z' }),
    version: z.string().openapi({ example: '1.0.0' }),
  })
  .openapi('HealthResponse');

export function registerHealthPaths(reg: OpenAPIRegistry) {
  reg.registerPath({
    method: 'get',
    path: '/api/v1/health',
    summary: 'Health Check',
    description: 'API 서버 상태를 확인합니다.',
    security: [{ ApiKeyAuth: [] }],
    responses: {
      200: {
        description: '서버 정상',
        content: { 'application/json': { schema: HealthResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  });
}
