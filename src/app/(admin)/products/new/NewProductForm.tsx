'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { createProductAction } from '../actions';
import type { ProductFormInput, ProductStatus } from '@/types/product';

export default function NewProductForm() {
  const router = useRouter();

  const handleSubmit = async (input: ProductFormInput, status: ProductStatus) => {
    await createProductAction(input, status);
    router.push('/products');
  };

  return <ProductForm onSubmit={handleSubmit} submitLabel="등록" />;
}
