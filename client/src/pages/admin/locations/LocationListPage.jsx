import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { locationService } from '../../../services/location.service';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import toast from 'react-hot-toast';

const LocationListPage = () => {
  const [data, setData] = useState({ locations: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await locationService.getAll(params);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách địa điểm.');
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
      await locationService.remove(deleteModal.id);
      toast.success(`Đã xóa ${deleteModal.name}`);
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa địa điểm.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Địa Điểm</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách các địa điểm văn hóa, du lịch</p>
        </div>
        <Link to="/admin/locations/create" className="btn-primary">
          <PlusIcon className="w-5 h-5" /> Thêm địa điểm
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
              placeholder="Tìm kiếm theo tên hoặc tỉnh thành..."
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
                  <th>Tên địa điểm</th>
                  <th>Tỉnh / Thành</th>
                  <th>Tọa độ</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.locations.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0].url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-50 text-earth flex items-center justify-center font-bold text-lg">
                            {item.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.province || '—'}</td>
                    <td className="text-sm font-mono text-gray-500">
                      {item.coordinates?.lat !== undefined && item.coordinates?.lng !== undefined
                        ? `${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}`
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status === 'published' ? 'Công khai' : 'Nháp'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/locations/${item._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                          <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item._id, name: item.name })}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.locations.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Không tìm thấy địa điểm nào.</td></tr>
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
        title="Xóa địa điểm"
        message={`Bạn có chắc chắn muốn xóa "${deleteModal.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default LocationListPage;
