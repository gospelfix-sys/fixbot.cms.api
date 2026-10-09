import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { getAllApiConfigs } from '@/libs/supabase/queries/content-api-configs';
import { registerHealthPaths } from '@/libs/openapi/schemas/health.schema';
import { registerBlogPaths } from '@/libs/openapi/schemas/blog.schema';
import { registerProductPaths } from '@/libs/openapi/schemas/product.schema';
import { registerUserPaths } from '@/libs/openapi/schemas/user.schema';
import { registerOrderPaths } from '@/libs/openapi/schemas/order.schema';
import { registerQuotePaths } from '@/libs/openapi/schemas/quote.schema';
import { registerPortfolioPaths } from '@/libs/openapi/schemas/portfolio.schema';

const TYPED_SLUGS: Record<string, (reg: OpenAPIRegistry) => void> = {
  blog: registerBlogPaths,
  products: registerProductPaths,
  users: registerUserPaths,
  orders: registerOrderPaths,
  quotes: registerQuotePaths,
  portfolio: registerPortfolioPaths,
};

export async function buildDynamicOpenApiSpec(baseUrl = 'http://localhost:3001') {
  const reg = new OpenAPIRegistry();

  reg.registerComponent('securitySchemes', 'ApiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: '.env.local의 INTERNAL_API_KEY 값',
  });

  registerHealthPaths(reg);

  const configs = await getAllApiConfigs();
  for (const config of configs) {
    if (!config.is_enabled) continue;
    const registerFn = TYPED_SLUGS[config.resource_slug];
    if (registerFn) {
      registerFn(reg);
    }
  }

  const generator = new OpenApiGeneratorV31(reg.definitions);

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
