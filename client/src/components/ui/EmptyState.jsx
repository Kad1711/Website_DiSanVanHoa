import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ title = 'Không có dữ liệu', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <ExclamationCircleIcon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
