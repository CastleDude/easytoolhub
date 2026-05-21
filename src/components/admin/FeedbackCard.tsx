interface FeedbackCardProps {
  id: number;
  tool_slug: string;
  rating: number;
  comment: string;
  locale: string;
  created_at: string;
  onDelete: (id: number) => void;
}

export default function FeedbackCard({
  id,
  tool_slug,
  rating,
  comment,
  locale,
  created_at,
  onDelete,
}: FeedbackCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {tool_slug}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{locale}</span>
          <span className="text-yellow-500 text-sm">
            {"★".repeat(rating)}{"☆".repeat(5 - rating)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => onDelete(id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
      {comment && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{comment}</p>
      )}
    </div>
  );
}
