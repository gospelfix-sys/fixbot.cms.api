interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-10 sm:py-16 flex items-center justify-center">
      <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  );
}
