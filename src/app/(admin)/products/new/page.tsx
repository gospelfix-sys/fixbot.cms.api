import NewProductForm from './NewProductForm';

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">새 상품 등록</h1>
        <p className="text-sm text-gray-400 mt-0.5">무료(FREE) 또는 유료 옵션 상품을 등록합니다.</p>
      </div>
      <NewProductForm />
    </div>
  );
}
