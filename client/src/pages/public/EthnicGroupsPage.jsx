import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethnicGroupService } from '../../services/ethnicGroup.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import Pagination from '../../components/ui/Pagination';
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline';

const EthnicGroupsPage = () => {
  const [data, setData] = useState({ ethnicGroups: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, search: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ethnicGroupService.getAll({ ...params, status: 'published' });
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

  return (
    <div className="bg-cream min-h-screen pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-earth text-white py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-10"></div>
        <div className="container-lg relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4">Các Dân Tộc Thiểu Số</h1>
          <p className="text-orange-100 max-w-2xl mx-auto text-xs sm:text-base font-light px-2">
            Việt Nam là một quốc gia đa sắc tộc với 54 dân tộc anh em. Mỗi dân tộc mang một bản sắc văn hóa, ngôn ngữ và phong tục riêng biệt.
          </p>
        </div>
      </div>

      <div className="container-lg mt-6 sm:mt-8">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm dân tộc (Tày, Thái, Mường...)"
              defaultValue={params.search}
              className="w-full bg-white border border-gray-200 shadow-sm focus:border-earth focus:ring-2 focus:ring-earth/30 rounded-2xl sm:rounded-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base transition-all outline-none"
            />
          </form>
        </div>

        {/* Content */}
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
              {data.ethnicGroups.map(group => (
                <Link to={`/ethnic-groups/${group.slug}`} key={group._id} className="card-hover group flex flex-col items-center text-center p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 overflow-hidden bg-orange-50 border-2 sm:border-4 border-white shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 flex-shrink-0">
                    {group.thumbnail?.url ? (
                      <img 
                        src={group.thumbnail.url} 
                        alt={group.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-earth opacity-50" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-lg group-hover:text-earth transition-colors line-clamp-1">{group.name}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{group.region || 'Việt Nam'}</p>
                </Link>
              ))}
            </div>

            {data.ethnicGroups.length === 0 && (
              <div className="text-center py-16 sm:py-20">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto opacity-40" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-700">Không tìm thấy dân tộc nào</h3>
              </div>
            )}

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex justify-center">
                <Pagination
                  pagination={data.pagination}
                  onPageChange={(page) => setParams({ ...params, page })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EthnicGroupsPage;
