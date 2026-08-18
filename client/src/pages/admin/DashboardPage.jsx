import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { UsersIcon, MapPinIcon, BookOpenIcon, PhotoIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const stats = [
    { label: 'Tác phẩm', value: data.stats.totalWorks, icon: BookOpenIcon, color: 'bg-blue-50 text-blue-600', link: '/admin/works' },
    { label: 'Dân tộc', value: data.stats.totalEthnicGroups, icon: UsersIcon, color: 'bg-green-50 text-green-600', link: '/admin/ethnic-groups' },
    { label: 'Địa điểm', value: data.stats.totalLocations, icon: MapPinIcon, color: 'bg-yellow-50 text-yellow-600', link: '/admin/locations' },
    { label: 'Người dùng', value: data.stats.totalUsers, icon: PhotoIcon, color: 'bg-purple-50 text-purple-600', link: '/admin/users' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-xs sm:text-sm text-gray-500">Chào mừng trở lại, {user?.displayName}!</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <div key={label} className="card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
            <Link to={link} className="text-xs text-primary font-semibold hover:underline mt-1 sm:mt-0 sm:ml-auto">
              Xem →
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Works */}
        <div className="card rounded-2xl">
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Tác phẩm mới nhất</h3>
            <Link to="/admin/works" className="text-xs text-primary font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Tác phẩm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.recentWorks.map(work => (
                  <tr key={work._id}>
                    <td>
                      <div className="font-medium text-gray-800 line-clamp-1">{work.title}</div>
                      <div className="text-[11px] text-gray-400">{new Date(work.createdAt).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td>
                      <span className={`badge ${work.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {work.status === 'published' ? 'Công khai' : 'Nháp'}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentWorks.length === 0 && (
                  <tr><td colSpan="2" className="text-center py-4 text-gray-400 text-xs sm:text-sm">Chưa có tác phẩm nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Locations */}
        <div className="card rounded-2xl">
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Địa điểm mới nhất</h3>
            <Link to="/admin/locations" className="text-xs text-primary font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLocations.map(loc => (
                  <tr key={loc._id}>
                    <td>
                      <div className="font-medium text-gray-800 line-clamp-1">{loc.name}</div>
                      <div className="text-[11px] text-gray-400">{loc.province}</div>
                    </td>
                    <td>
                      <span className={`badge ${loc.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {loc.status === 'published' ? 'Công khai' : 'Nháp'}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentLocations.length === 0 && (
                  <tr><td colSpan="2" className="text-center py-4 text-gray-400 text-xs sm:text-sm">Chưa có địa điểm nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
