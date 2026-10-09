import Link from 'next/link';
import { Plus } from 'lucide-react';
import EmptyState from '@/components/admin/EmptyState';
import PortfolioTable from './PortfolioTable';
import { getAllPortfolios } from '@/libs/supabase/queries/portfolios.admin';

export default async function PortfolioPage() {
  const portfolios = await getAllPortfolios();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">포트폴리오 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {portfolios.length}건</p>
        </div>
        <Link
          href="/portfolio/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-80 transition-opacity"
        >
          <Plus size={15} />
          새 포트폴리오
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <EmptyState message="등록된 포트폴리오가 없습니다" />
      ) : (
        <PortfolioTable portfolios={portfolios} />
      )}
    </div>
  );
}
