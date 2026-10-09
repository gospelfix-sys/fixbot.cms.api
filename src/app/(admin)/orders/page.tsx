import EmptyState from '@/components/admin/EmptyState';

const MOCK_ORDERS: unknown[] = [];

export default async function OrdersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">주문 관리</h1>
        <span className="text-sm text-gray-400">총 {MOCK_ORDERS.length}건</span>
      </div>
      {MOCK_ORDERS.length === 0 ? (
        <EmptyState message="접수된 주문이 없습니다" />
      ) : null}
    </div>
  );
}
