import { notFound } from 'next/navigation';
import { getProductByIdAdmin } from '@/libs/supabase/queries/products.admin';
import EditProductForm from './EditProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductByIdAdmin(id);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">상품 수정</h1>
        <p className="text-sm text-gray-400 mt-0.5">{product.name}</p>
      </div>
      <EditProductForm product={product} />
    </div>
  );
}
