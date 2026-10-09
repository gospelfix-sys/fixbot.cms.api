import Link from 'next/link';
import { Plus } from 'lucide-react';
import EmptyState from '@/components/admin/EmptyState';
import ProductsTable from './ProductsTable';
import { getAllProducts } from '@/libs/supabase/queries/products.admin';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">상품 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {products.length}건</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus size={15} />
          새 상품
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState message="등록된 상품이 없습니다" />
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
