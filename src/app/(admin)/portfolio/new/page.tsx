import NewPortfolioForm from './NewPortfolioForm';

export default function NewPortfolioPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          새 포트폴리오 등록
        </h1>
      </div>
      <NewPortfolioForm />
    </div>
  );
}
