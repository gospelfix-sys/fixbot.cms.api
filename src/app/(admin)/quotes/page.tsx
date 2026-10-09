import EmptyState from '@/components/admin/EmptyState';

const MOCK_QUOTES: unknown[] = [];

export default async function QuotesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">견적 신청</h1>
        <span className="text-sm text-gray-400">총 {MOCK_QUOTES.length}건</span>
      </div>
      {MOCK_QUOTES.length === 0 ? (
        <EmptyState message="접수된 견적 신청이 없습니다" />
      ) : null}
    </div>
  );
}
