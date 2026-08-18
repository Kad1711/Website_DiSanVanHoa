import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import Pagination from '../../../components/ui/Pagination';
import toast from 'react-hot-toast';

const EthnicGroupListPage = () => {
  const [data, setData] = useState({ ethnicGroups: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });

  // Delete Action Modal
  const [targetItem, setTargetItem] = useState(null); // { id, name, workCount, locationCount }
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ethnicGroupService.getAll(params);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách dân tộc.');
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

  const handleExecuteDelete = async (action) => {
    if (!targetItem) return;
    try {
      setIsDeleting(true);
      const res = await ethnicGroupService.remove(targetItem.id, { action });
      toast.success(res.data.message || `Đã xóa thành công ${targetItem.name}`);
      setTargetItem(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa dân tộc.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Dân Tộc</h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách các dân tộc thiểu số và dữ liệu di sản liên kết
          </p>
        </div>
        <Link to="/admin/ethnic-groups/create" className="btn-primary">
          <PlusIcon className="w-5 h-5" /> Thêm dân tộc
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
              placeholder="Tìm kiếm theo tên dân tộc..."
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
            <table className="table-admin min-w-[850px]">
              <thead>
                <tr>
                  <th>Tên dân tộc</th>
                  <th>Vùng miền</th>
                  <th>Tác phẩm</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.ethnicGroups.map((item) => {
                  const workCount = item.workCount || 0;
                  const locationCount = item.locationCount || 0;

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {item.thumbnail?.url ? (
                            <img
                              src={item.thumbnail.url}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[180px]">{item.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.region || '—'}</td>

                      {/* Linked Works Count */}
                      <td>
                        <span className={`badge ${workCount > 0 ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-500'}`}>
                          {workCount} tác phẩm
                        </span>
                      </td>

                      {/* Linked Locations Count */}
                      <td>
                        <span className={`badge ${locationCount > 0 ? 'bg-orange-100 text-orange-800 font-semibold' : 'bg-gray-100 text-gray-500'}`}>
                          {locationCount} địa danh
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {item.status === 'published' ? 'Công khai' : 'Nháp'}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/ethnic-groups/${item._id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                            title="Sửa thông tin"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() =>
                              setTargetItem({
                                id: item._id,
                                name: item.name,
                                workCount,
                                locationCount,
                              })
                            }
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Xóa dân tộc"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.ethnicGroups.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      Không tìm thấy dân tộc nào.
                    </td>
                  </tr>
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

      {/* ======================================================== */}
      {/* 🛡️ PROACTIVE BUSINESS LOGIC DELETION MODAL                */}
      {/* ======================================================== */}
      {targetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 text-left">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                <ExclamationTriangleIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa Dân tộc</h3>
                <p className="text-xs text-gray-500">Kiểm tra ràng buộc dữ liệu tác phẩm & địa danh</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Bạn đang yêu cầu xóa <strong className="text-gray-900 text-base">"{targetItem.name}"</strong>.
            </p>

            {/* Dependency Badges */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-900">{targetItem.workCount}</p>
                  <p className="text-xs text-blue-700 font-medium">Tác phẩm liên kết</p>
                </div>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-600 text-white">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-900">{targetItem.locationCount}</p>
                  <p className="text-xs text-orange-700 font-medium">Địa danh di sản</p>
                </div>
              </div>
            </div>

            {/* Case 1: Ethnic Group has dependencies -> Show smart business choices */}
            {targetItem.workCount > 0 || targetItem.locationCount > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Chọn phương án xử lý liên kết:
                </p>

                {/* Choice 1: Nullify */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleExecuteDelete('nullify')}
                  className="w-full text-left p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between font-bold text-sm text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                      1. Ngắt liên kết an toàn (Khuyên dùng)
                    </span>
                    <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                      Bảo toàn dữ liệu
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                    Xóa bản ghi dân tộc này, <strong>giữ lại nguyên vẹn {targetItem.workCount} tác phẩm và {targetItem.locationCount} địa danh</strong> (chuyển trường dân tộc về Chưa xác định).
                  </p>
                </button>

                {/* Choice 2: Cascade */}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleExecuteDelete('cascade')}
                  className="w-full text-left p-4 rounded-2xl border-2 border-red-300 bg-red-50/50 hover:bg-red-100/70 transition-all flex flex-col gap-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between font-bold text-sm text-red-950">
                    <span className="flex items-center gap-1.5">
                      <TrashIcon className="w-5 h-5 text-red-600" />
                      2. Xóa liên hoàn (Cascade Delete)
                    </span>
                    <span className="text-[11px] bg-red-200 text-red-900 px-2 py-0.5 rounded-full font-semibold">
                      Xóa toàn bộ
                    </span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed mt-0.5">
                    Xóa vĩnh viễn dân tộc này <strong>cùng toàn bộ {targetItem.workCount} tác phẩm và {targetItem.locationCount} địa danh</strong> trực thuộc trên hệ thống.
                  </p>
                </button>
              </div>
            ) : (
              /* Case 2: 0 dependencies -> Simple clean delete button */
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Dân tộc này chưa có tác phẩm hoặc địa danh nào trực thuộc. Hành động xóa sẽ xóa vĩnh viễn bản ghi dân tộc.
                </p>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleExecuteDelete('restrict')}
                  className="btn-danger w-full py-3 rounded-2xl text-sm font-bold"
                >
                  {isDeleting ? 'Đang xóa...' : `Xóa vĩnh viễn dân tộc ${targetItem.name}`}
                </button>
              </div>
            )}

            {/* Cancel Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTargetItem(null)}
                className="btn-ghost text-xs px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                Hủy bỏ (Không xóa)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthnicGroupListPage;
