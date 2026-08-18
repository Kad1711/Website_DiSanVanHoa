import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ErrorState = ({ message = 'Đã xảy ra lỗi.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <XCircleIcon className="w-12 h-12 text-red-400 mb-3" />
    <p className="text-gray-700 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-outline flex items-center gap-2 text-sm">
        <ArrowPathIcon className="w-4 h-4" /> Thử lại
      </button>
    )}
  </div>
);

export default ErrorState;
