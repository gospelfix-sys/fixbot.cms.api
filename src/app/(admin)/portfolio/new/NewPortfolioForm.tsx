'use client';

import { useRouter } from 'next/navigation';
import PortfolioForm from '@/components/admin/PortfolioForm';
import { createPortfolioAction } from '../actions';
import type { PortfolioFormInput } from '@/types/portfolio';

export default function NewPortfolioForm() {
  const router = useRouter();

  const handleSubmit = async (input: PortfolioFormInput) => {
    await createPortfolioAction(input);
    router.push('/portfolio');
    router.refresh();
  };

  return <PortfolioForm onSubmit={handleSubmit} />;
}
