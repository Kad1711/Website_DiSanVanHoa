import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xóa', confirmClass = 'btn-danger' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XMarkIcon className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title || 'Xác nhận'}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost">Hủy</button>
          <button onClick={onConfirm} className={confirmClass}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
