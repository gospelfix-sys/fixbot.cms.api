import SettingsClientSection from './SettingsClientSection';
import ApiSettingsSection from './ApiSettingsSection';

interface SettingsPageProps {
  searchParams: { apiPage?: string };
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const page = Number(searchParams.apiPage) || 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">설정</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">계정 관리와 상세 설정을 할 수 있어요.</p>
      </div>
      <div className="flex flex-col gap-4">
        <SettingsClientSection />
        <ApiSettingsSection page={page} />
      </div>
    </div>
  );
}
