'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { updateProductAction } from '../../actions';
import type { Product, ProductFormInput, ProductStatus } from '@/types/product';

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();

  const handleSubmit = async (input: ProductFormInput, status: ProductStatus) => {
    await updateProductAction(product.id, input, status);
    router.push('/products');
  };

  return (
    <ProductForm
      initialValues={{
        slug: product.slug,
        name: product.name,
        description: product.description ?? '',
        category: product.category ?? '',
        thumbnail_url: product.thumbnail_url ?? '',
        demo_url: product.demo_url ?? '',
        includes: product.includes ?? '',
        file_path: product.file_path ?? '',
        price_type: product.price_type,
        base_price: product.base_price,
        options: product.options,
      }}
      initialStatus={product.status}
      onSubmit={handleSubmit}
      submitLabel="수정 완료"
    />
  );
}
