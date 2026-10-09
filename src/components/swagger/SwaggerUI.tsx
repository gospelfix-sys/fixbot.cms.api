'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUILib = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-gray-500">
      API 문서를 불러오는 중...
    </div>
  ),
});

export default function SwaggerUI() {
  return (
    <SwaggerUILib
      url="/api/openapi.json"
      docExpansion="list"
      persistAuthorization
      tryItOutEnabled
    />
  );
}
