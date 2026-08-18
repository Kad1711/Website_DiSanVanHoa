import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workService } from '../../../services/work.service';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../../constants';

const WorkListPage = () => {
  const [data, setData] = useState({ works: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await workService.getAll(params);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách tác phẩm.');
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

  const handleDelete = async () => {
    try {
      await workService.remove(deleteModal.id);
      toast.success(`Đã xóa ${deleteModal.title}`);
      setDeleteModal({ isOpen: false, id: null, title: '' });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa tác phẩm.');
    }
  };

  const getCategoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý Tác Phẩm</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Danh sách tác phẩm văn học số</p>
        </div>
        <Link to="/admin/works/create" className="btn-primary text-xs sm:text-sm py-2.5 w-full sm:w-auto">
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Thêm tác phẩm
        </Link>
      </div>

      <div className="card rounded-2xl">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex gap-3 sm:gap-4 bg-gray-50/50">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
              defaultValue={params.search}
              className="input pl-9 sm:pl-10 text-xs sm:text-sm"
            />
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : (
            <table className="table-admin min-w-[700px]">
              <thead>
                <tr>
                  <th>Tác phẩm</th>
                  <th>Dân tộc</th>
                  <th>Thể loại</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.works.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {item.coverImage?.url ? (
                          <img src={item.coverImage.url} alt={item.title} className="w-10 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-base flex-shrink-0">
                            {item.title[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{item.author || 'Dân gian'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.ethnicGroup?.name || '—'}</td>
                    <td>{getCategoryLabel(item.category)}</td>
                    <td>
                      <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status === 'published' ? 'Công khai' : 'Nháp'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/admin/works/${item._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-100">
                          <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item._id, title: item.title })}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.works.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 text-xs sm:text-sm">Không tìm thấy tác phẩm nào.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && data.pagination && (
          <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500">
              Tổng số: <span className="font-medium text-gray-800">{data.pagination.totalItems}</span>
            </span>
            <Pagination
              pagination={data.pagination}
              onPageChange={(page) => setParams({ ...params, page })}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Xóa tác phẩm"
        message={`Bạn có chắc chắn muốn xóa "${deleteModal.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
};

export default WorkListPage;
