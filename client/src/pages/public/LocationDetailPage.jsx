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
    <div className="bg-cream min-h-screen pb-20 font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-2.5 sm:py-3">
        <div className="container-lg flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors flex-shrink-0">Trang chủ</Link>
          <span>/</span>
          <Link to="/map" className="hover:text-primary transition-colors flex-shrink-0">Bản đồ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{location.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-950 via-earth to-orange-900 text-white py-10 sm:py-14 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="badge bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 font-semibold">
                {location.province}
              </span>
              {location.ethnicGroup && (
                <Link
                  to={`/ethnic-groups/${location.ethnicGroup.slug}`}
                  className="badge bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 font-medium transition-colors"
                >
                  Dân tộc {location.ethnicGroup.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4">{location.name}</h1>
            {location.address && (
              <p className="text-orange-200 text-xs sm:text-sm flex items-center gap-1.5 mb-2 sm:mb-3">
                <MapPinIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{location.address}, {location.district ? `${location.district}, ` : ''}{location.province}</span>
              </p>
            )}
            {location.shortDescription && (
              <p className="text-orange-100 text-xs sm:text-base leading-relaxed font-light mt-2">
                {location.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-lg mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left / Main 2 Cols */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-secondary" />
                Giá Trị Văn Hóa & Lịch Sử
              </h2>
              <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed text-xs sm:text-base whitespace-pre-line">
                {location.description || location.shortDescription || 'Nội dung chi tiết đang được cập nhật.'}
              </div>
            </div>

            {/* Gallery images */}
            {location.images && location.images.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
                <div className="flex items-center gap-2 text-base sm:text-lg font-serif font-bold text-gray-800 mb-4 sm:mb-6">
                  <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-earth" />
                  <span>Hình Ảnh Không Gian Di Sản</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
                  {location.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group relative shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || `Hình ảnh ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold bg-black/60 px-2 py-1 rounded-lg">Xem lớn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {location.videos && location.videos.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
                <div className="flex items-center gap-2 text-base sm:text-lg font-serif font-bold text-gray-800 mb-4 sm:mb-6">
                  <VideoCameraIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  <span>Video Khám Phá Địa Điểm</span>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {location.videos.map((vid, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <div className="p-3 bg-gray-900 text-white text-xs sm:text-sm font-medium">
                        {vid.title || `Video #${idx + 1}`}
                      </div>
                      <div className="aspect-video w-full bg-black">
                        {vid.url?.includes('youtube.com') || vid.url?.includes('youtu.be') ? (
                          <iframe
                            src={vid.url.replace('watch?v=', 'embed/')}
                            title={vid.title}
                            className="w-full h-full"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video src={vid.url} controls className="w-full h-full object-contain"></video>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Map & Navigation */}
          <div className="space-y-4 sm:space-y-6">
            {/* Interactive Map Box */}
            {hasCoords && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden">
                <h3 className="font-serif font-bold text-gray-800 text-sm sm:text-base mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-earth" />
                  Vị Trí Bản Đồ
                </h3>
                <div className="h-52 sm:h-64 rounded-xl sm:rounded-2xl overflow-hidden border border-orange-200">
                  <MapContainer
                    center={[location.coordinates.lat, location.coordinates.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={pinIcon}
                    >
                      <Popup>
                        <strong className="text-xs">{location.name}</strong>
                        <p className="text-[11px] text-gray-500">{location.province}</p>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-gray-500">
                    {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </span>
                  <Link to="/map" className="text-primary font-semibold hover:underline">
                    Xem bản đồ đầy đủ →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <Link
                to="/map"
                className="w-full btn-ghost border border-gray-200 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Quay lại bản đồ
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
            <img src={selectedImage} alt="Phóng to ảnh" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
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
