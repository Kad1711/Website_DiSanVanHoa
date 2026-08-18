import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { workService } from '../../services/work.service';
import { locationService } from '../../services/location.service';
import { ethnicGroupService } from '../../services/ethnicGroup.service';
import { CATEGORIES } from '../../constants';
import Loading from '../../components/ui/Loading';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  ChevronLeftIcon,
  GlobeAmericasIcon,
  ArrowPathIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';

// Category color palettes for Works on Map
const CATEGORY_STYLE_MAP = {
  'su-thi':         { bg: 'from-rose-600 to-red-700',      hex: '#dc2626', glow: 'rgba(220, 38, 38, 0.55)', text: 'text-red-700',    badge: 'bg-red-100 text-red-800',    icon: '⚔️', label: 'Sử thi' },
  'tho':            { bg: 'from-emerald-600 to-teal-700',  hex: '#059669', glow: 'rgba(5, 150, 105, 0.55)', text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-800',icon: '📜', label: 'Thơ ca' },
  'dan-ca':         { bg: 'from-amber-500 to-orange-600',  hex: '#d97706', glow: 'rgba(217, 119, 6, 0.55)',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800',  icon: '🎵', label: 'Dân ca' },
  'truyen-thuyet':  { bg: 'from-purple-600 to-indigo-700', hex: '#7c3aed', glow: 'rgba(124, 58, 237, 0.55)', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800', icon: '✨', label: 'Truyền thuyết' },
  'truyen-ngan':    { bg: 'from-sky-600 to-blue-700',      hex: '#0284c7', glow: 'rgba(2, 132, 199, 0.55)', text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-800',    icon: '📖', label: 'Truyện ngắn' },
  'khac':           { bg: 'from-orange-600 to-amber-700',  hex: '#ea580c', glow: 'rgba(234, 88, 12, 0.55)',  text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', icon: '📚', label: 'Tác phẩm' },
};

const getCategoryStyle = (category = '') => {
  return CATEGORY_STYLE_MAP[category] || CATEGORY_STYLE_MAP['khac'];
};

// Rich Glowing Custom Pin for Literary Works on Satellite View
const createWorkPin = (category = '', isActive = false, title = '') => {
  const style = getCategoryStyle(category);
  const size = isActive ? 48 : 36;

  return L.divIcon({
    className: 'custom-work-pin',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: ${isActive ? 'scale(1.18)' : 'scale(1)'};
      ">
        ${isActive ? `
          <div style="
            position: absolute;
            inset: -10px;
            border-radius: 50%;
            background: ${style.glow};
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}

        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${style.hex};
          box-shadow: 0 6px 20px ${style.glow}, 0 3px 8px rgba(0,0,0,0.6);
          border: ${isActive ? '3px solid #ffffff' : '2.5px solid #ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: ${isActive ? '18px' : '14px'};
            line-height: 1;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${style.icon}
          </div>
        </div>

        <div style="
          position: absolute;
          bottom: -5px;
          width: 12px;
          height: 4px;
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          filter: blur(1.5px);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
};

// Map Controller for Smooth FlyTo
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 11, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const [works, setWorks] = useState([]);
  const [ethnicGroups, setEthnicGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWork, setActiveWork] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedEthnic, setSelectedEthnic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Map layer mode: 'satellite' (default as requested) or 'streets'
  const [mapLayer, setMapLayer] = useState('satellite');

  const [mapCenter, setMapCenter] = useState([16.047079, 107.8]); // Central Vietnam
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [wRes, ethRes] = await Promise.all([
          workService.getAll({ status: 'published', limit: 200 }),
          ethnicGroupService.getAll({ status: 'published', limit: 100 }),
        ]);

        const allWorks = wRes.data.data.works || [];
        setWorks(allWorks);
        setEthnicGroups(ethRes.data.data.ethnicGroups || []);
      } catch (err) {
        console.error('Failed to load map works data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter works based on search, ethnic, category
  const filteredWorks = works.filter((work) => {
    const primaryLoc = work.relatedLocations?.[0];
    const locName = typeof primaryLoc === 'object' ? primaryLoc.name : '';
    const locProvince = typeof primaryLoc === 'object' ? primaryLoc.province : '';
    const ethnicName = work.ethnicGroup?.name || '';

    const matchSearch =
      work.title?.toLowerCase().includes(search.toLowerCase()) ||
      work.author?.toLowerCase().includes(search.toLowerCase()) ||
      locName.toLowerCase().includes(search.toLowerCase()) ||
      locProvince.toLowerCase().includes(search.toLowerCase()) ||
      ethnicName.toLowerCase().includes(search.toLowerCase());

    const matchEthnic = selectedEthnic
      ? work.ethnicGroup?._id === selectedEthnic || work.ethnicGroup === selectedEthnic
      : true;

    const matchCategory = selectedCategory
      ? work.category === selectedCategory
      : true;

    return matchSearch && matchEthnic && matchCategory;
  });

  // Handle selecting a work
  const handleSelectWork = (work) => {
    setActiveWork(work);
    const loc = work.relatedLocations?.find((l) => typeof l === 'object' && l.coordinates?.lat);
    if (loc?.coordinates?.lat && loc?.coordinates?.lng) {
      setMapCenter([loc.coordinates.lat, loc.coordinates.lng]);
      setMapZoom(12);
    }
  };

  const handleResetView = () => {
    setMapCenter([16.047079, 107.8]);
    setMapZoom(6);
    setActiveWork(null);
    setSearch('');
    setSelectedEthnic('');
    setSelectedCategory('');
  };

  // Collect all mapped markers (Works with valid coordinates from related locations)
  const mappedWorks = works
    .map((w) => {
      const loc = w.relatedLocations?.find(
        (l) => typeof l === 'object' && l.coordinates?.lat && l.coordinates?.lng
      );
      if (!loc) return null;
      return {
        work: w,
        lat: loc.coordinates.lat,
        lng: loc.coordinates.lng,
        locationName: loc.name,
        locationProvince: loc.province,
      };
    })
    .filter(Boolean);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 overflow-hidden font-sans">
      {/* 1. TOP FLOATING CONTROL BAR (Z-INDEX 2000) */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-[2000] flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-32px)]">
        {/* Toggle Drawer Button */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-2xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all duration-300 cursor-pointer border ${
            isSidebarOpen
              ? 'bg-slate-900/90 text-white border-slate-700 hover:bg-black'
              : 'bg-primary text-white border-primary-500 hover:bg-primary-600 shadow-primary/50 ring-4 ring-primary/20 scale-[1.02] sm:scale-105'
          }`}
        >
          <Bars3BottomLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 flex-shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">
            {isSidebarOpen ? 'Thu gọn' : `Tác phẩm (${filteredWorks.length})`}
          </span>
          <span className="text-[10px] sm:text-xs bg-white/20 px-1.5 py-0.5 rounded-full ml-0.5 sm:ml-1">
            {isSidebarOpen ? '‹' : '›'}
          </span>
        </button>

        {/* Satellite / Street Layer Switcher */}
        <div className="flex items-center bg-slate-900/80 backdrop-blur-md p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-700 shadow-xl text-[11px] sm:text-xs font-semibold text-white">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition-all ${
              mapLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🛰️ Vệ tinh</span>
          </button>
          <button
            onClick={() => setMapLayer('streets')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition-all ${
              mapLayer === 'streets'
                ? 'bg-primary text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🗺️ Bản đồ</span>
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-semibold shadow-xl border border-slate-700 backdrop-blur transition-all"
          title="Toàn cảnh Việt Nam"
        >
          <ArrowPathIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Toàn cảnh 🇻🇳</span>
          <span className="sm:hidden">🇻🇳</span>
        </button>
      </div>

      {/* 2. FLOATING COLLAPSIBLE WORKS DRAWER (Z-INDEX 2010) */}
      <div
        className={`absolute top-0 left-0 bottom-0 z-[2010] w-full sm:w-96 lg:w-[420px] bg-slate-900/95 backdrop-blur-2xl text-white shadow-2xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-serif font-bold truncate">Bản Đồ Văn Học Di Sản</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Đóng danh sách"
            >
              <span>Thu gọn</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 mb-3 leading-relaxed font-light line-clamp-2">
            Không gian nguồn cội và tọa độ gắn liền các kiệt tác văn học dân tộc thiểu số trên ảnh vệ tinh.
          </p>

          {/* Search Bar */}
          <div className="relative mb-2.5">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên tác phẩm, tác giả, địa danh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/90 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 border border-slate-700 shadow-sm"
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-2 gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Thể loại"
              className="w-full bg-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-400 border border-slate-700 cursor-pointer"
            >
              <option value="">Tất cả thể loại</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Ethnic Group Filter */}
            <select
              value={selectedEthnic}
              onChange={(e) => setSelectedEthnic(e.target.value)}
              aria-label="Dân tộc"
              className="w-full bg-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-400 border border-slate-700 cursor-pointer"
            >
              <option value="">Tất cả dân tộc ({ethnicGroups.length})</option>
              {ethnicGroups.map((eg) => (
                <option key={eg._id} value={eg._id}>
                  {eg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Works List Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loading />
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-sm">
              Không tìm thấy tác phẩm nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredWorks.map((work) => {
              const isSelected = activeWork?._id === work._id;
              const catStyle = getCategoryStyle(work.category);
              const primaryLoc = work.relatedLocations?.[0];
              const locName = typeof primaryLoc === 'object' ? primaryLoc.name : '';
              const locProvince = typeof primaryLoc === 'object' ? primaryLoc.province : '';

              return (
                <div
                  key={work._id}
                  onClick={() => handleSelectWork(work)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-slate-800 border-primary ring-2 ring-primary/80 shadow-xl scale-[1.02]'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Work Cover or Category Icon */}
                    {work.coverImage?.url ? (
                      <img
                        src={work.coverImage.url}
                        alt={work.title}
                        className="w-12 h-16 rounded-xl object-cover flex-shrink-0 shadow-md border border-slate-700"
                      />
                    ) : (
                      <div
                        className={`w-12 h-16 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md text-white text-xl bg-gradient-to-br ${catStyle.bg}`}
                      >
                        {catStyle.icon}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {work.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyle.badge}`}>
                          {catStyle.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-1">
                        {work.author || 'Dân gian'} • <span className="text-amber-400 font-semibold">{work.ethnicGroup?.name || 'Dân tộc'}</span>
                      </p>

                      {locName && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                          <MapPinIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{locName} ({locProvince})</span>
                        </div>
                      )}

                      {work.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                          {work.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info in drawer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredWorks.length} tác phẩm di sản</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-amber-400 hover:underline font-bold cursor-pointer"
          >
            Ẩn danh sách ✕
          </button>
        </div>
      </div>

      {/* 3. FULL SCREEN INTERACTIVE LEAFLET SATELLITE MAP */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Tile Layer: Satellite vs Street */}
          {mapLayer === 'satellite' ? (
            <>
              {/* Esri World Imagery (High-Res Satellite) */}
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Reference Boundaries & Place Names Overlay for Satellite */}
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.8}
              />
            </>
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <ZoomControl position="bottomright" />
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Literary Works Markers */}
          {mappedWorks.map(({ work, lat, lng, locationName, locationProvince }) => {
            const isSelected = activeWork?._id === work._id;
            const catStyle = getCategoryStyle(work.category);

            return (
              <Marker
                key={work._id}
                position={[lat, lng]}
                icon={createWorkPin(work.category, isSelected, work.title)}
                eventHandlers={{
                  click: () => {
                    setActiveWork(work);
                  },
                }}
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
                      📍 {locationName} ({locationProvince})
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {work.summary || 'Tác phẩm văn học di sản dân tộc thiểu số.'}
                    </p>

                    <Link
                      to={`/works/${work.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Đọc trọn vẹn tác phẩm <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 4. SELECTED WORK DETAIL CARD (BOTTOM MODAL - Z-INDEX 2020) */}
      {activeWork && (
        <div className="absolute left-2.5 right-2.5 bottom-3 sm:left-4 sm:right-4 sm:bottom-6 md:left-auto md:right-8 md:bottom-8 md:w-[400px] max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 z-[2020] animate-in fade-in slide-in-from-bottom-6">
          <button
            onClick={() => setActiveWork(null)}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-md cursor-pointer"
            title="Đóng chi tiết"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {activeWork.coverImage?.url ? (
            <img
              src={activeWork.coverImage.url}
              alt={activeWork.title}
              className="w-full h-36 sm:h-44 object-cover"
            />
          ) : (
            <div className="w-full h-20 sm:h-24 bg-gradient-to-r from-primary-900 to-slate-900 flex items-center px-5 sm:px-6 text-white">
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

            {activeWork.relatedLocations?.[0] && (
              <div className="flex items-center gap-1.5 text-xs text-orange-300 font-medium mb-3">
                <MapPinIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">
                  Địa danh: {typeof activeWork.relatedLocations[0] === 'object' ? activeWork.relatedLocations[0].name : ''}
                </span>
              </div>
            )}

            {activeWork.summary && (
              <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-4">
                {activeWork.summary}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/works/${activeWork.slug}`}
                className="flex-1 btn-primary py-2 sm:py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 font-bold"
              >
                <EyeIcon className="w-4 h-4" />
                Đọc trọn vẹn tác phẩm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
