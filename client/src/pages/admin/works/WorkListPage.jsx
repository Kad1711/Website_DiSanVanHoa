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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tác Phẩm</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách tác phẩm văn học số</p>
        </div>
        <Link to="/admin/works/create" className="btn-primary">
          <PlusIcon className="w-5 h-5" /> Thêm tác phẩm
        </Link>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
              defaultValue={params.search}
              className="input pl-10"
            />
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : (
            <table className="table-admin min-w-[800px]">
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
                          <img src={item.coverImage.url} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-lg">
                            {item.title[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{item.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.author}</div>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/works/${item._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                          <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item._id, title: item.title })}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.works.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Không tìm thấy tác phẩm nào.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && data.pagination && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <span className="text-sm text-gray-500">
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
