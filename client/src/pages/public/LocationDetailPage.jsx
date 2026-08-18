import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { locationService } from '../../services/location.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import {
  MapPinIcon,
  BookOpenIcon,
  SparklesIcon,
  VideoCameraIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid';

const pinIcon = L.divIcon({
  className: 'custom-leaflet-pin-detail',
  html: `
    <div style="
      background: #c2410c;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

const LocationDetailPage = () => {
  const { slug } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await locationService.getBySlug(slug);
      setLocation(res.data.data.location);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin địa điểm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loading fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchLocation} />;
  if (!location) return <ErrorState message="Địa điểm không tồn tại." />;

  const hasCoords = location.coordinates?.lat && location.coordinates?.lng;

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container-lg flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/map" className="hover:text-primary transition-colors">Bản đồ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{location.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-950 via-earth to-orange-900 text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs px-3 py-1 font-semibold">
                {location.province}
              </span>
              {location.ethnicGroup && (
                <Link
                  to={`/ethnic-groups/${location.ethnicGroup.slug}`}
                  className="badge bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-1 font-medium transition-colors"
                >
                  Dân tộc {location.ethnicGroup.name}
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4">{location.name}</h1>
            {location.address && (
              <p className="text-orange-200 text-sm flex items-center gap-2 mb-3">
                <MapPinIcon className="w-4 h-4 text-amber-400" />
                {location.address}, {location.district ? `${location.district}, ` : ''}{location.province}
              </p>
            )}
            {location.shortDescription && (
              <p className="text-orange-100 text-sm sm:text-base leading-relaxed font-light mt-2">
                {location.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-lg mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main 2 Cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="font-serif font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-secondary" />
                Giá Trị Văn Hóa & Lịch Sử
              </h2>
              <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {location.description || location.shortDescription || 'Nội dung chi tiết đang được cập nhật.'}
              </div>
            </div>

            {/* Photo Gallery */}
            {location.images && location.images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="font-serif font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-secondary" />
                  Hình Ảnh Không Gian Di Sản
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {location.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer group relative shadow-sm border border-gray-200"
                    >
                      <img
                        src={img.url}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Section */}
            {location.videos && location.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="font-serif font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-red-500" />
                  Video Trực Quan Về Địa Danh
                </h2>
                <div className="space-y-4">
                  {location.videos.map((vid, idx) => (
                    <div key={idx} className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <video src={vid.url} controls className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Literary Works */}
            {location.relatedWorks && location.relatedWorks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="font-serif font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-primary" />
                  Tác Phẩm Văn Học Gắn Liền Với Địa Danh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {location.relatedWorks.map((work) => (
                    <Link
                      key={work._id}
                      to={`/works/${work.slug}`}
                      className="card-hover p-4 rounded-xl border border-gray-100 bg-white group flex gap-3"
                    >
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                        {work.coverImage?.url ? (
                          <img src={work.coverImage.url} alt={work.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                            {work.title[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors truncate">
                          {work.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{work.summary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Interactive Mini Map */}
          <div className="space-y-6">
            {hasCoords && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-serif font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-earth" />
                  Vị Trí Địa Lý
                </h3>
                <div className="h-56 w-full rounded-xl overflow-hidden border border-gray-200 mb-4 z-0">
                  <MapContainer
                    center={[location.coordinates.lat, location.coordinates.lng]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={pinIcon}
                    >
                      <Popup>{location.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p><strong>Vĩ độ (Lat):</strong> {location.coordinates.lat}</p>
                  <p><strong>Kinh độ (Lng):</strong> {location.coordinates.lng}</p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full btn-outline py-2 text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  Mở trên Google Maps <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Back to Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <Link
                to="/map"
                className="w-full btn-primary py-2.5 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Quay lại bản đồ số
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} alt="Phóng to ảnh" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetailPage;
