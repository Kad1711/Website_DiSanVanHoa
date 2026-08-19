import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { workService } from '../../services/work.service';
import {
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  ArrowPathIcon,
  MapPinIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

// ─── Category Color Palettes & Icons ──────────────────────────────────────────
const CATEGORY_STYLE_MAP = {
  'su-thi':        { hex: '#dc2626', glow: 'rgba(220,38,38,0.55)',    badge: 'bg-red-100 text-red-800',       icon: '⚔️',  label: 'Sử thi' },
  'tho':           { hex: '#059669', glow: 'rgba(5,150,105,0.55)',    badge: 'bg-emerald-100 text-emerald-800', icon: '📜', label: 'Thơ ca' },
  'dan-ca':        { hex: '#d97706', glow: 'rgba(217,119,6,0.55)',    badge: 'bg-amber-100 text-amber-800',    icon: '🎵',  label: 'Dân ca' },
  'truyen-thuyet': { hex: '#7c3aed', glow: 'rgba(124,58,237,0.55)',   badge: 'bg-purple-100 text-purple-800',  icon: '✨',  label: 'Truyền thuyết' },
  'truyen-ngan':   { hex: '#0284c7', glow: 'rgba(2,132,199,0.55)',    badge: 'bg-sky-100 text-sky-800',        icon: '📖',  label: 'Truyện ngắn' },
  'khac':          { hex: '#ea580c', glow: 'rgba(234,88,12,0.55)',    badge: 'bg-orange-100 text-orange-800',  icon: '📚',  label: 'Tác phẩm' },
};

const getCategoryStyle = (cat = '') => CATEGORY_STYLE_MAP[cat] || CATEGORY_STYLE_MAP['khac'];

// ─── Coordinate Validator & Primary Location Extractor ────────────────────────
export const isValidCoordinate = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    Number.isFinite(nLat) &&
    Number.isFinite(nLng) &&
    nLat >= -90 &&
    nLat <= 90 &&
    nLng >= -180 &&
    nLng <= 180 &&
    (nLat !== 0 || nLng !== 0)
  );
};

export const getPrimaryMappedLocation = (work) => {
  if (!work || !Array.isArray(work.relatedLocations)) return null;
  for (const loc of work.relatedLocations) {
    if (typeof loc === 'object' && loc !== null && loc.coordinates) {
      const lat = Number(loc.coordinates.lat);
      const lng = Number(loc.coordinates.lng);
      if (isValidCoordinate(lat, lng)) {
        return {
          _id: loc._id,
          name: loc.name || 'Địa danh',
          province: loc.province || '',
          lat,
          lng,
        };
      }
    }
  }
  return null;
};

// ─── Marker Icon Cache for Performance ────────────────────────────────────────
const createWorkPin = (category = '', isActive = false) => {
  const s = getCategoryStyle(category);
  const size = isActive ? 46 : 34;
  return L.divIcon({
    className: 'custom-work-pin',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);transform:${isActive ? 'scale(1.18)' : 'scale(1)'};">
        ${isActive ? `<div style="position:absolute;inset:-10px;border-radius:50%;background:${s.glow};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
        <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${s.hex};box-shadow:0 6px 20px ${s.glow},0 3px 8px rgba(0,0,0,0.6);border:${isActive ? '3px' : '2px'} solid #fff;display:flex;align-items:center;justify-content:center;position:relative;z-index:10;">
          <div style="transform:rotate(45deg);font-size:${isActive ? '16px' : '13px'};line-height:1;user-select:none;">${s.icon}</div>
        </div>
        <div style="position:absolute;bottom:-4px;width:10px;height:3px;background:rgba(0,0,0,0.6);border-radius:50%;filter:blur(1px);"></div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
};

const iconCache = new Map();
const getCachedWorkPin = (category = '', isActive = false) => {
  const key = `${category}_${isActive ? 'active' : 'idle'}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, createWorkPin(category, isActive));
  }
  return iconCache.get(key);
};

// ─── Smooth FlyTo Controller ──────────────────────────────────────────────────
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] && center?.[1] && isValidCoordinate(center[0], center[1])) {
      map.flyTo(center, zoom || BAN_TIENG_LOCKED_ZOOM, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Cố định vị trí làng Bản Tiệng ───────────────────────────────────────────
const BAN_TIENG_LOCKED_CENTER = [19.2998, 105.1490];
const BAN_TIENG_LOCKED_ZOOM = 19.5;

const BAN_TIENG_BOUNDS = [
  [19.2970, 105.1450], // Góc Tây Nam
  [19.3030, 105.1530], // Góc Đông Bắc
];

// ─── Main Component ───────────────────────────────────────────────────────────
const MapPage = () => {
  const [works, setWorks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeWork, setActiveWork] = useState(null);
  const [mapLayer, setMapLayer]     = useState('satellite'); // satellite | streets
  const [mapCenter, setMapCenter]   = useState(BAN_TIENG_LOCKED_CENTER);

  // Fetch published works with retry capability
  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workService.getAll({ status: 'published', limit: 200 });
      setWorks(res.data.data.works || []);
    } catch (e) {
      console.error('Works fetch error:', e);
      setError('Không thể tải dữ liệu tác phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // Handle work marker selection (synchronized with getPrimaryMappedLocation)
  const handleSelectWork = useCallback((work) => {
    setActiveWork(work);
    const loc = getPrimaryMappedLocation(work);
    if (loc) {
      setMapCenter([loc.lat, loc.lng]);
    }
  }, []);

  const handleResetView = useCallback(() => {
    setMapCenter(BAN_TIENG_LOCKED_CENTER);
    setActiveWork(null);
  }, []);

  // Standardized mappedWorks with strict validation and useMemo cache
  const mappedWorks = useMemo(() => {
    return works
      .map((w) => {
        const loc = getPrimaryMappedLocation(w);
        if (!loc) return null;
        return {
          work: w,
          lat: loc.lat,
          lng: loc.lng,
          locationName: loc.name,
          locationProvince: loc.province,
        };
      })
      .filter(Boolean);
  }, [works]);

  // Primary location for active work detail card
  const activeWorkLocation = useMemo(() => {
    return activeWork ? getPrimaryMappedLocation(activeWork) : null;
  }, [activeWork]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 overflow-hidden font-sans select-none">
      {/* ── TOP CONTROL BAR ──────────────────────────────────────────── */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-[1000] flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Satellite / Roadmap switcher */}
        <div className="flex items-center bg-slate-900/85 backdrop-blur-md p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-700 shadow-xl text-[11px] sm:text-xs font-semibold text-white">
          <button
            type="button"
            aria-label="Chuyển chế độ xem vệ tinh"
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
              mapLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🛰️ <span>Vệ tinh</span>
          </button>
          <button
            type="button"
            aria-label="Chuyển chế độ xem bản đồ đường"
            onClick={() => setMapLayer('streets')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
              mapLayer === 'streets'
                ? 'bg-primary text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🗺️ <span>Bản đồ</span>
          </button>
        </div>

        {/* Reset view button */}
        <button
          type="button"
          aria-label="Khôi phục vị trí mặc định Bản Tiệng"
          onClick={handleResetView}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-semibold shadow-xl border border-slate-700 backdrop-blur transition-all cursor-pointer"
          title="Khôi phục vị trí Bản Tiệng"
        >
          <ArrowPathIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>Bản Tiệng 📍</span>
        </button>

        {/* Status badges */}
        {loading ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700 text-[11px] text-slate-300 backdrop-blur shadow-lg">
            <span className="animate-spin text-amber-400">⟳</span>
            <span>Đang tải dữ liệu...</span>
          </span>
        ) : error ? (
          <button
            type="button"
            onClick={fetchWorks}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/90 border border-red-700 text-[11px] text-red-300 backdrop-blur shadow-lg hover:bg-red-900 cursor-pointer"
          >
            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" />
            <span>Lỗi tải dữ liệu. Thử lại ⟳</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/85 border border-emerald-500/60 text-[11px] text-emerald-300 backdrop-blur font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Góc nhìn làng Bản Tiệng ({mappedWorks.length} tác phẩm)</span>
          </span>
        )}
      </div>

      {/* ── FULL-SCREEN LEAFLET MAP ───────────────────────────────────── */}
      <div className="w-full h-full">
        <MapContainer
          center={BAN_TIENG_LOCKED_CENTER}
          zoom={BAN_TIENG_LOCKED_ZOOM}
          zoomSnap={0.5}
          minZoom={18.5}
          maxZoom={21}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          maxBounds={BAN_TIENG_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Google Maps tile layers */}
          {mapLayer === 'satellite' ? (
            <TileLayer
              attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains="0123"
              maxNativeZoom={20}
              maxZoom={21}
            />
          ) : (
            <TileLayer
              attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains="0123"
              maxNativeZoom={20}
              maxZoom={21}
            />
          )}

          <MapController center={mapCenter} zoom={BAN_TIENG_LOCKED_ZOOM} />

          {/* Literary work markers */}
          {mappedWorks.map(({ work, lat, lng, locationName, locationProvince }) => {
            const isSelected = activeWork?._id === work._id;
            const catStyle = getCategoryStyle(work.category);
            return (
              <Marker
                key={work._id}
                position={[lat, lng]}
                icon={getCachedWorkPin(work.category, isSelected)}
                eventHandlers={{ click: () => handleSelectWork(work) }}
              >
                <Popup>
                  <div className="p-1 min-w-[220px] max-w-[280px]">
                    {work.coverImage?.url && (
                      <img
                        src={work.coverImage.url}
                        alt={work.title}
                        className="w-full h-28 object-cover rounded-xl mb-2 shadow"
                      />
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyle.badge}`}>
                        {catStyle.label}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {work.ethnicGroup?.name || 'Dân tộc'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-0.5">{work.title}</h4>
                    <p className="text-xs text-orange-600 font-semibold mb-1">
                      📍 {locationName} {locationProvince ? `(${locationProvince})` : ''}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {work.summary || 'Tác phẩm văn học di sản dân tộc thiểu số.'}
                    </p>
                    <Link
                      to={`/works/${work.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Đọc trọn vẹn <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* ── SELECTED WORK DETAIL CARD ─────────────────────────────────── */}
      {activeWork && (
        <div className="absolute left-2.5 right-2.5 bottom-3 sm:left-4 sm:right-4 sm:bottom-6 md:left-auto md:right-8 md:bottom-8 md:w-[400px] max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 z-[1010] animate-in fade-in slide-in-from-bottom-6">
          <button
            type="button"
            aria-label="Đóng chi tiết tác phẩm"
            onClick={() => setActiveWork(null)}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-md cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {activeWork.coverImage?.url ? (
            <img
              src={activeWork.coverImage.url}
              alt={activeWork.title}
              className="w-full h-36 sm:h-44 object-cover rounded-t-2xl sm:rounded-t-3xl"
            />
          ) : (
            <div className="w-full h-20 sm:h-24 bg-gradient-to-r from-primary-900 to-slate-900 flex items-center px-5 sm:px-6 text-white rounded-t-2xl sm:rounded-t-3xl">
              <BookOpenIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-amber-400" />
              <span className="font-serif font-bold text-sm sm:text-base">Tác Phẩm Di Sản</span>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryStyle(activeWork.category).badge}`}>
                {getCategoryStyle(activeWork.category).label}
              </span>
              <span className="text-xs text-amber-400 font-bold">
                {activeWork.ethnicGroup?.name ? `Dân tộc ${activeWork.ethnicGroup.name}` : ''}
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-serif font-bold text-white mb-1">{activeWork.title}</h3>
            <p className="text-xs text-slate-300 mb-2">Tác giả: {activeWork.author || 'Dân gian'}</p>
            {activeWorkLocation && (
              <div className="flex items-center gap-1.5 text-xs text-orange-300 font-medium mb-3">
                <MapPinIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">
                  Địa danh: {activeWorkLocation.name} {activeWorkLocation.province ? `(${activeWorkLocation.province})` : ''}
                </span>
              </div>
            )}
            {activeWork.summary && (
              <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-4">{activeWork.summary}</p>
            )}
            <Link
              to={`/works/${activeWork.slug}`}
              className="flex-1 btn-primary py-2 sm:py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 font-bold w-full"
            >
              <EyeIcon className="w-4 h-4" />
              Đọc trọn vẹn tác phẩm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
