import { notFound } from 'next/navigation';
import EditPortfolioForm from './EditPortfolioForm';
import { getPortfolioByIdAdmin } from '@/libs/supabase/queries/portfolios.admin';

export default async function EditPortfolioPage({ params }: { params: { id: string } }) {
  const portfolio = await getPortfolioByIdAdmin(params.id);
  if (!portfolio) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">포트폴리오 편집</h1>
        <p className="text-sm text-gray-400 mt-0.5">{portfolio.title}</p>
      </div>
      <EditPortfolioForm portfolio={portfolio} />
    </div>
  );
}
