import SwaggerUI from '@/components/swagger/SwaggerUI';

export const metadata = {
  title: 'API 문서 | GospelFix CMS',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">GospelFix CMS API</h1>
        <p className="text-sm text-gray-500 mb-6">
          GospelFix 관리자 CMS의 REST API 명세입니다.
        </p>
        <SwaggerUI />
      </div>
    </div>
  );
}
