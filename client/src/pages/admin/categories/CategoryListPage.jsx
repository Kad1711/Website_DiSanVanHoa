import { useState, useEffect } from 'react';
import { categoryService } from '../../../services/category.service';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ea580c', // Orange
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#475569', // Slate
];

const PRESET_ICONS = ['🧚', '🌌', '⚔️', '✨', '📜', '🎵', '💬', '😄', '📚', '🏛️', '🎭', '🌾'];

const CategoryListPage = () => {
  const [data, setData] = useState({ categories: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    icon: '📚',
    color: '#0284c7',
    description: '',
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll(params);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách thể loại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.page, params.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get('search');
    setParams({ ...params, search: query, page: 1 });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormValues({
      name: '',
      icon: '📚',
      color: '#0284c7',
      description: '',
      status: 'published',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormValues({
      name: cat.name || '',
      icon: cat.icon || '📚',
      color: cat.color || '#0284c7',
      description: cat.description || '',
      status: cat.status || 'published',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formValues.name.trim()) {
      toast.error('Vui lòng nhập tên thể loại.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formValues);
        toast.success(`Đã cập nhật thể loại "${formValues.name}"`);
      } else {
        await categoryService.create(formValues);
        toast.success(`Đã thêm thể loại mới "${formValues.name}"`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thể loại.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await categoryService.remove(deleteTarget._id);
      toast.success(`Đã xóa thể loại "${deleteTarget.name}"`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa thể loại.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">Quản lý Thể loại Văn học</h1>
          <p className="text-sm text-gray-500 mt-1">
            Định nghĩa các thể loại văn học dân gian phục vụ học liệu, phân loại tác phẩm và bản đồ số
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm thể loại</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Tìm theo tên thể loại..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Thể loại</th>
                  <th className="px-6 py-4">Mã định danh (Slug)</th>
                  <th className="px-6 py-4">Màu sắc</th>
                  <th className="px-6 py-4 text-center">Số tác phẩm</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.categories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400">
                      Chưa có thể loại nào được tạo.
                    </td>
                  </tr>
                ) : (
                  data.categories.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl flex-shrink-0">{item.icon || '📚'}</span>
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {item.slug}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-xs"
                            style={{ backgroundColor: item.color || '#ea580c' }}
                          />
                          <span className="text-xs text-gray-500 font-mono">{item.color || '#ea580c'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <BookOpenIcon className="w-3.5 h-3.5 text-gray-500" />
                          {item.workCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-500 text-xs">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status === 'published' ? 'Công khai' : 'Nháp'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            title="Xóa thể loại"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={(page) => setParams({ ...params, page })}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa Thể loại */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingCategory ? 'Chỉnh sửa Thể loại' : 'Thêm Thể loại mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Tên thể loại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Truyện cổ tích, Thần thoại, Sử thi..."
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Biểu tượng (Icon/Emoji)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formValues.icon}
                      onChange={(e) => setFormValues({ ...formValues, icon: e.target.value })}
                      className="w-16 text-center text-xl py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {PRESET_ICONS.slice(0, 6).map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setFormValues({ ...formValues, icon: ic })}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-gray-100 ${
                            formValues.icon === ic ? 'bg-primary/10 border border-primary' : 'border border-gray-200'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Màu sắc hiển thị
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formValues.color}
                      onChange={(e) => setFormValues({ ...formValues, color: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {PRESET_COLORS.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormValues({ ...formValues, color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            formValues.color === c ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'border-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mô tả thể loại
                </label>
                <textarea
                  rows="3"
                  placeholder="Mô tả đặc trưng, nội dung phản ánh hoặc ý nghĩa giáo dục của thể loại..."
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Trạng thái
                </label>
                <select
                  value={formValues.status}
                  onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="published">Công khai</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{submitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Tạo mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa thể loại"
        message={`Bạn có chắc muốn xóa thể loại "${deleteTarget?.name}"? Các tác phẩm thuộc thể loại này sẽ được gỡ liên kết thể loại.`}
        confirmText={isDeleting ? 'Đang xóa...' : 'Xóa thể loại'}
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CategoryListPage;
