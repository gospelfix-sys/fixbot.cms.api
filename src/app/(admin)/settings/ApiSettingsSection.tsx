import { getAllApiConfigs } from '@/libs/supabase/queries/content-api-configs';
import ApiConfigCard from '@/components/admin/ApiConfigCard';
import ApiPagination from '@/components/admin/ApiPagination';

const PAGE_SIZE = 5;

interface ApiSettingsSectionProps {
  page: number;
}

export default async function ApiSettingsSection({ page }: ApiSettingsSectionProps) {
  const configs = await getAllApiConfigs();
  const totalPages = Math.ceil(configs.length / PAGE_SIZE);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const sliced = configs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">REST API 설정</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          외부에서 접근 가능한 공개 API 엔드포인트를 활성화 / 비활성화합니다.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {sliced.map((config) => (
          <ApiConfigCard key={config.id} config={config} />
        ))}
      </div>
      {totalPages > 1 && (
        <ApiPagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
