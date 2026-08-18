import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethnicGroupService } from '../../services/ethnicGroup.service';
import { workService } from '../../services/work.service';
import { locationService } from '../../services/location.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import {
  UsersIcon,
  BookOpenIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowLeftIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/solid';
import { CATEGORIES } from '../../constants';

const EthnicGroupDetailPage = () => {
  const { slug } = useParams();
  const [ethnicGroup, setEthnicGroup] = useState(null);
  const [works, setWorks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ethnicGroupService.getBySlug(slug);
      const eg = res.data.data.ethnicGroup;
      setEthnicGroup(eg);

      if (eg?._id) {
        const [worksRes, locsRes] = await Promise.all([
          workService.getAll({ ethnicGroup: eg._id, status: 'published', limit: 20 }),
          locationService.getAll({ ethnicGroup: eg._id, status: 'published', limit: 20 }),
        ]);
        setWorks(worksRes.data.data.works || []);
        setLocations(locsRes.data.data.locations || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin dân tộc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loading fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!ethnicGroup) return <ErrorState message="Dân tộc không tồn tại." />;

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container-lg flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/ethnic-groups" className="hover:text-primary transition-colors">Dân tộc</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{ethnicGroup.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-earth via-orange-800 to-amber-900 text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/40 shadow-2xl bg-orange-100 flex-shrink-0">
              {ethnicGroup.thumbnail?.url ? (
                <img
                  src={ethnicGroup.thumbnail.url}
                  alt={ethnicGroup.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth">
                  <UsersIcon className="w-16 h-16 opacity-70" />
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-3">
                <GlobeAmericasIcon className="w-3.5 h-3.5" />
                <span>{ethnicGroup.region || 'Việt Nam'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-3">{ethnicGroup.name}</h1>
              <p className="text-orange-100 text-sm sm:text-base max-w-2xl font-light">
                {ethnicGroup.description || 'Không gian văn hóa và kho tàng văn học dân gian truyền thống.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-lg mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Culture info + Works */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cultural Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="font-serif font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-secondary" />
                Đặc Trưng Văn Hóa & Phong Tục
              </h2>
              <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {ethnicGroup.cultureSummary ||
                  ethnicGroup.description ||
                  'Nội dung văn hóa đang tiếp tục được sưu tầm và số hóa.'}
              </div>
            </div>

            {/* Works List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif font-bold text-xl text-gray-800 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-primary" />
                  Kho Tàng Tác Phẩm ({works.length})
                </h2>
                <Link to={`/works`} className="text-xs text-primary font-semibold hover:underline">
                  Xem tất cả tác phẩm →
                </Link>
              </div>

              {works.length === 0 ? (
                <p className="text-gray-500 italic py-6 text-center text-sm">
                  Chưa có tác phẩm nào được liên kết với dân tộc này.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {works.map((work) => (
                    <Link
                      key={work._id}
                      to={`/works/${work.slug}`}
                      className="card-hover p-4 flex gap-3 border border-gray-100 bg-white group"
                    >
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {work.coverImage?.url ? (
                          <img
                            src={work.coverImage.url}
                            alt={work.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-lg text-primary/40 font-bold bg-primary/5">
                            {work.title[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="inline-block text-[10px] uppercase font-bold text-secondary tracking-wider mb-1">
                            {CATEGORIES.find((c) => c.value === work.category)?.label || work.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                            {work.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{work.summary}</p>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-2">{work.author || 'Dân gian'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Geographic Locations & Quick Navigation */}
          <div className="space-y-6">
            {/* Locations Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-gray-800 text-base flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-earth" />
                  Địa Danh Phân Bố ({locations.length})
                </h3>
              </div>

              {locations.length === 0 ? (
                <p className="text-gray-500 text-xs italic">Chưa có địa danh nào được ghi nhận.</p>
              ) : (
                <div className="space-y-3">
                  {locations.map((loc) => (
                    <Link
                      key={loc._id}
                      to={`/locations/${loc.slug}`}
                      className="p-3 rounded-xl bg-orange-50/50 hover:bg-orange-100/60 border border-orange-100 flex items-start gap-3 transition-colors group block"
                    >
                      <div className="p-2 rounded-lg bg-earth text-white mt-0.5">
                        <MapPinIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-earth transition-colors truncate">
                          {loc.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">{loc.province}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                to="/map"
                className="mt-4 block text-center py-2 bg-orange-50 text-earth font-semibold text-xs rounded-xl hover:bg-orange-100 transition-colors"
              >
                Khám phá trên bản đồ tương tác
              </Link>
            </div>

            {/* Back Button */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <Link
                to="/ethnic-groups"
                className="w-full btn-ghost border border-gray-200 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Danh sách các dân tộc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EthnicGroupDetailPage;
