'use client';

import { useRouter } from 'next/navigation';
import PortfolioForm from '@/components/admin/PortfolioForm';
import { updatePortfolioAction } from '../../actions';
import type { Portfolio, PortfolioFormInput } from '@/types/portfolio';

export default function EditPortfolioForm({ portfolio }: { portfolio: Portfolio }) {
  const router = useRouter();

  const handleSubmit = async (input: PortfolioFormInput) => {
    await updatePortfolioAction(portfolio.id, input);
    router.push('/portfolio');
    router.refresh();
  };

  const initialValues: Partial<PortfolioFormInput> = {
    title: portfolio.title,
    category: portfolio.category ?? '',
    tags: portfolio.tags,
    thumbnail_url: portfolio.thumbnail_url ?? '',
    images: portfolio.images,
    description: portfolio.description ?? '',
    site_url: portfolio.site_url ?? '',
    is_published: portfolio.is_published,
  };

  return (
    <PortfolioForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="수정 완료"
    />
  );
}
