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
    <div className="bg-cream min-h-screen pb-20 font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-2.5 sm:py-3">
        <div className="container-lg flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors flex-shrink-0">Trang chủ</Link>
          <span>/</span>
          <Link to="/ethnic-groups" className="hover:text-primary transition-colors flex-shrink-0">Dân tộc</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{ethnicGroup.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-earth via-orange-800 to-amber-900 text-white py-10 sm:py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/40 shadow-2xl bg-orange-100 flex-shrink-0">
              {ethnicGroup.thumbnail?.url ? (
                <img
                  src={ethnicGroup.thumbnail.url}
                  alt={ethnicGroup.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth">
                  <UsersIcon className="w-12 h-12 sm:w-16 sm:h-16 opacity-70" />
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
                <GlobeAmericasIcon className="w-3.5 h-3.5" />
                <span>{ethnicGroup.region || 'Việt Nam'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3">{ethnicGroup.name}</h1>
              <p className="text-orange-100 text-xs sm:text-base max-w-2xl font-light leading-relaxed">
                {ethnicGroup.description || 'Không gian văn hóa và kho tàng văn học dân gian truyền thống.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-lg mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main 2 Cols: Culture info + Works */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Cultural Summary */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-secondary" />
                Đặc Trưng Văn Hóa & Phong Tục
              </h2>
              <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed text-xs sm:text-base whitespace-pre-line">
                {ethnicGroup.cultureSummary ||
                  ethnicGroup.description ||
                  'Nội dung văn hóa đang tiếp tục được sưu tầm và số hóa.'}
              </div>
            </div>

            {/* Works List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-800 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-primary" />
                  Kho Tàng Tác Phẩm ({works.length})
                </h2>
                <Link to={`/works`} className="text-xs text-primary font-semibold hover:underline">
                  Xem tất cả →
                </Link>
              </div>

              {works.length === 0 ? (
                <p className="text-gray-500 italic py-6 text-center text-xs sm:text-sm">
                  Chưa có tác phẩm nào được liên kết với dân tộc này.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {works.map((work) => (
                    <Link
                      to={`/works/${work.slug}`}
                      key={work._id}
                      className="card-hover p-3 sm:p-4 border border-gray-100 flex gap-3 items-center group rounded-xl sm:rounded-2xl"
                    >
                      {work.coverImage?.url ? (
                        <img
                          src={work.coverImage.url}
                          alt={work.title}
                          className="w-12 h-16 sm:w-14 sm:h-18 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {work.title[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                            {CATEGORIES.find((c) => c.value === work.category)?.label || work.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-primary transition-colors truncate">
                          {work.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">{work.author || 'Dân gian'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Geographic Locations */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="font-serif font-bold text-gray-800 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-earth" />
                Địa Danh Gắn Liền ({locations.length})
              </h3>

              {locations.length === 0 ? (
                <p className="text-gray-500 text-xs italic">Chưa có địa danh nào được ghi nhận.</p>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {locations.map((loc) => (
                    <Link
                      to={`/locations/${loc.slug}`}
                      key={loc._id}
                      className="p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100 flex items-start gap-3 transition-colors group block"
                    >
                      <div className="p-2 rounded-xl bg-earth text-white mt-0.5 flex-shrink-0">
                        <MapPinIcon className="w-3.5 h-3.5" />
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
                className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                Khám phá trên bản đồ vệ tinh →
              </Link>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <Link
                to="/ethnic-groups"
                className="w-full btn-ghost border border-gray-200 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Quay lại danh sách dân tộc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EthnicGroupDetailPage;
