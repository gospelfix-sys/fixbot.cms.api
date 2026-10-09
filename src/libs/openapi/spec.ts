import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/libs/openapi/registry';
import { registerHealthPaths } from '@/libs/openapi/schemas/health.schema';
import { registerBlogPaths } from '@/libs/openapi/schemas/blog.schema';
import { registerProductPaths } from '@/libs/openapi/schemas/product.schema';

export function buildOpenApiSpec(baseUrl = 'http://localhost:3001') {
  registry.registerComponent('securitySchemes', 'ApiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: '.env.local의 INTERNAL_API_KEY 값',
  });

  registerHealthPaths(registry);
  registerBlogPaths(registry);
  registerProductPaths(registry);

  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'GospelFix CMS API',
      version: '1.0.0',
      description: 'GospelFix 관리자 CMS의 REST API 문서입니다.',
    },
    servers: [
      { url: baseUrl, description: 'API Server' },
    ],
  });
}
