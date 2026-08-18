import { useState, useEffect } from 'react';
import { adminService } from '../../../services/admin.service';
import { TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const UserListPage = () => {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState({ users: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(params);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
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
      await adminService.deleteUser(deleteModal.id);
      toast.success(`Đã xóa người dùng ${deleteModal.name}`);
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa người dùng.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người Dùng</h1>
        <p className="text-gray-500 text-sm mt-1">Danh sách thành viên trên hệ thống</p>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm theo tên hoặc email..."
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
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày đăng ký</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {item.displayName[0].toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-800">{item.displayName}</div>
                      </div>
                    </td>
                    <td className="text-gray-600">{item.email}</td>
                    <td>
                      <span className={`badge ${item.role === 'admin' ? 'badge-primary' : 'bg-gray-100 text-gray-700'}`}>
                        {item.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="text-right">
                      {item._id !== currentUser?._id && (
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item._id, name: item.displayName })}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa người dùng"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
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
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteModal.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default UserListPage;
