import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workService } from '../../services/work.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import Pagination from '../../components/ui/Pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../../constants';

const WorksPage = () => {
  const [data, setData] = useState({ works: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, search: '', category: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await workService.getAll({ ...params, status: 'published' });
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải danh sách tác phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.page, params.search, params.category]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get('search');
    setParams({ ...params, search: query, page: 1 });
  };

  return (
    <div className="bg-cream min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-10"></div>
        <div className="container-lg relative z-10 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Kho Tàng Tác Phẩm</h1>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Khám phá và đắm chìm vào những câu chuyện cổ tích, truyền thuyết, sử thi hào hùng của 54 dân tộc anh em.
          </p>
        </div>
      </div>

      <div className="container-lg mt-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${params.category === '' ? 'bg-secondary text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setParams({ ...params, category: '', page: 1 })}
            >
              Tất cả
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.value}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${params.category === cat.value ? 'bg-secondary text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setParams({ ...params, category: cat.value, page: 1 })}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm tác phẩm..."
              defaultValue={params.search}
              className="w-full bg-gray-50 border border-transparent focus:border-primary focus:bg-white focus:ring-0 rounded-full pl-11 pr-4 py-2.5 transition-all outline-none"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.works.map(work => (
                <Link to={`/works/${work.slug}`} key={work._id} className="card-hover group flex flex-col h-full bg-white">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                    {work.coverImage?.url ? (
                      <img 
                        src={work.coverImage.url} 
                        alt={work.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="font-serif text-4xl opacity-50">{work.title[0]}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded-md text-primary shadow-sm">
                      {CATEGORIES.find(c => c.value === work.category)?.label || work.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{work.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{work.summary}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        {work.ethnicGroup?.name || 'Không rõ'}
                      </span>
                      <span>{work.author || 'Dân gian'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {data.works.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-gray-600">Không tìm thấy tác phẩm nào</h3>
                <p className="text-gray-500 mt-2">Hãy thử thay đổi từ khóa hoặc bộ lọc thể loại.</p>
              </div>
            )}

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
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

export default WorksPage;
