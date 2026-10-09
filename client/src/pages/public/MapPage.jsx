import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { locationService } from '../../services/location.service';
import { workService } from '../../services/work.service';
import {
  BookOpenIcon,
  XMarkIcon,
  MapPinIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

// ─── Coordinate Validator ─────────────────────────────────────────────────────
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

// ─── Tọa độ & Giới hạn Bản Tiệng (Khóa zoom out đúng như ảnh yêu cầu) ──────────
const BAN_TIENG_CENTER = [19.2992, 105.1485];
const BAN_TIENG_MIN_ZOOM = 16.0;      // Khóa zoom out: không thể thu nhỏ quá toàn cảnh khu vực khoanh đỏ
const BAN_TIENG_MAX_ZOOM = 21.0;      // Tự do zoom in tối đa
const BAN_TIENG_DEFAULT_ZOOM = 16.25; // Zoom mặc định hiển thị trọn vẹn làng Bản Tiệng

// Khóa ghim phạm vi di chuyển trong đúng khu vực Bản Tiệng khoanh đỏ
const BAN_TIENG_BOUNDS = [
  [19.2910, 105.1370], // Tây Nam (cánh đồng & Dưa chuột Ngã Ba)
  [19.3075, 105.1600], // Đông Bắc (Trường Tiểu học Châu Thái & Tiệm tạp hoá Lại Khánh)
];

// ─── Numbered Location Pin Marker (1 Location = 1 Marker) ─────────────────────
const createLocationPin = (order, name = '', workCount = 0, isActive = false, hasWorks = true) => {
  const size = isActive ? 44 : 36;
  const pinBg = hasWorks
    ? isActive
      ? 'linear-gradient(135deg, #fbbf24, #d97706)'
      : 'linear-gradient(135deg, #ea580c, #c2410c)'
    : 'linear-gradient(135deg, #64748b, #475569)';

  const glow = isActive
    ? 'rgba(245,158,11,0.65)'
    : hasWorks
    ? 'rgba(234,88,12,0.45)'
    : 'rgba(100,116,139,0.3)';

  return L.divIcon({
    className: 'custom-location-pin',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;transition:transform 0.25s ease;">
        ${isActive ? `<div style="position:absolute;top:0;width:${size}px;height:${size}px;border-radius:50%;background:${glow};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
        
        <!-- Pin Marker Drop -->
        <div style="
          width:${size}px;
          height:${size}px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${pinBg};
          box-shadow:0 6px 16px ${glow}, 0 2px 6px rgba(0,0,0,0.5);
          border:${isActive ? '3px' : '2px'} solid #ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          z-index:10;
        ">
          <!-- Upright Text inside Pin -->
          <div style="
            transform:rotate(45deg);
            color:#ffffff;
            font-size:${isActive ? '16px' : '13px'};
            font-weight:900;
            font-family:system-ui, -apple-system, sans-serif;
            text-shadow:0 1px 3px rgba(0,0,0,0.6);
            line-height:1;
          ">
            ${hasWorks ? order : '🏛️'}
          </div>
        </div>

        <!-- Pin shadow -->
        <div style="width:14px;height:4px;background:rgba(0,0,0,0.5);border-radius:50%;margin-top:-2px;filter:blur(1px);z-index:5;"></div>

        <!-- Location Name Label Badge -->
        <div style="
          margin-top:2px;
          background:rgba(15,23,42,0.92);
          backdrop-filter:blur(4px);
          color:${isActive ? '#fde047' : '#ffffff'};
          border:1px solid ${isActive ? 'rgba(245,158,11,0.85)' : 'rgba(255,255,255,0.25)'};
          box-shadow:0 3px 10px rgba(0,0,0,0.6);
          padding:2px 8px;
          border-radius:999px;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          max-width:160px;
          overflow:hidden;
          text-overflow:ellipsis;
          display:flex;
          align-items:center;
          gap:4px;
          z-index:20;
        ">
          <span>${hasWorks ? `${order}. ` : ''}${name || 'Địa danh'}</span>
          ${
            workCount > 1
              ? `<span style="background:rgba(234,88,12,0.8);color:#fff;font-size:9px;padding:0px 4px;border-radius:4px;font-weight:bold;">${workCount} tác phẩm</span>`
              : ''
          }
          ${
            !hasWorks
              ? `<span style="background:rgba(100,116,139,0.8);color:#e2e8f0;font-size:9px;padding:0px 4px;border-radius:4px;">Chờ sưu tầm</span>`
              : ''
          }
        </div>
      </div>
    `,
    iconSize: [160, size + 32],
    iconAnchor: [80, size],
    popupAnchor: [0, -size],
  });
};

const pinCache = new Map();
const getCachedLocationPin = (order, name = '', workCount = 0, isActive = false, hasWorks = true) => {
  const key = `${order}_${name}_${workCount}_${isActive ? 'active' : 'idle'}_${hasWorks ? 'w' : 'now'}`;
  if (!pinCache.has(key)) {
    pinCache.set(key, createLocationPin(order, name, workCount, isActive, hasWorks));
  }
  return pinCache.get(key);
};

// ─── AI Character Leaflet Marker ──────────────────────────────────────────────
const createAICharacterPin = (type = 'both', isWalking = false, facing = 'right') => {
  const flip = facing === 'left' ? -1 : 1;
  const animClass = isWalking ? 'chibi-anim-walking' : 'chibi-anim-idle';

  let htmlContent = '';
  let size = [160, 250];
  let anchor = [80, 242];

  if (type === 'boy') {
    size = [160, 250];
    anchor = [80, 242];
    htmlContent = `
      <div style="position:relative;width:160px;height:250px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-24px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#fde68a;font-size:12px;font-weight:700;padding:3px 12px;border-radius:999px;border:1.5px solid rgba(245,158,11,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Chàng trai Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}">
            <img src="/characters/boy_chibi.png" alt="" style="width:150px;height:230px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.6)) drop-shadow(0 0 14px rgba(245,158,11,0.5));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:90px;height:14px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
      </div>
    `;
  } else if (type === 'girl') {
    size = [160, 250];
    anchor = [80, 242];
    htmlContent = `
      <div style="position:relative;width:160px;height:250px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-24px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#a7f3d0;font-size:12px;font-weight:700;padding:3px 12px;border-radius:999px;border:1.5px solid rgba(16,185,129,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Cô gái Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}">
            <img src="/characters/girl_chibi.png" alt="" style="width:144px;height:230px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.6)) drop-shadow(0 0 14px rgba(16,185,129,0.5));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:90px;height:14px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
      </div>
    `;
  } else {
    size = [280, 250];
    anchor = [140, 242];
    htmlContent = `
      <div style="position:relative;width:280px;height:250px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-24px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#fde047;font-size:12px;font-weight:700;padding:3px 14px;border-radius:999px;border:1.5px solid rgba(250,204,21,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Đôi bạn người Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;gap:6px;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}" style="${isWalking ? 'animation-delay:0s;' : ''}">
            <img src="/characters/boy_chibi.png" alt="Chàng trai Thái" style="width:136px;height:226px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.6));display:block;" />
          </div>
          <div class="${animClass}" style="${isWalking ? 'animation-delay:0.18s;' : ''}">
            <img src="/characters/girl_chibi.png" alt="Cô gái Thái" style="width:130px;height:226px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.6));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:180px;height:16px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
      </div>
    `;
  }

  return L.divIcon({
    className: 'custom-ai-character-pin',
    html: htmlContent,
    iconSize: size,
    iconAnchor: anchor,
  });
};

// ─── Smooth FlyTo Controller ──────────────────────────────────────────────────
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] && center?.[1] && isValidCoordinate(center[0], center[1])) {
      const targetZoom = zoom || Math.max(map.getZoom(), 16.5);
      map.flyTo(center, targetZoom, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(BAN_TIENG_CENTER);

  // Đang theo dấu hành trình của một tác phẩm cụ thể
  const [focusedWork, setFocusedWork] = useState(null);

  // 🤖 AI Character System State
  const [characterType, setCharacterType] = useState('both');
  const [characterPos, setCharacterPos] = useState(BAN_TIENG_CENTER);
  const [isWalking, setIsWalking] = useState(false);
  const [facing, setFacing] = useState('right');
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);

  const characterPosRef = useRef(BAN_TIENG_CENTER);
  characterPosRef.current = characterPos;

  const isAutoTourRef = useRef(false);
  isAutoTourRef.current = isAutoTour;

  const currentTourIndexRef = useRef(0);
  currentTourIndexRef.current = currentTourIndex;

  const animRef = useRef(null);
  const tourTimerRef = useRef(null);

  // Tải danh sách địa điểm theo nghiệp vụ từ API /api/locations/map
  const fetchMapLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await locationService.getMapLocations();
      setLocations(res.data.data.locations || []);
    } catch (e) {
      console.error('Map fetch error:', e);
      setError('Không thể tải dữ liệu bản đồ di sản.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapLocations();
  }, [fetchMapLocations]);

  // Danh sách địa điểm hiển thị trên bản đồ (1 Location = 1 Marker)
  const displayedLocations = useMemo(() => {
    const valid = locations
      .filter((loc) => loc.coordinates && isValidCoordinate(loc.coordinates.lat, loc.coordinates.lng))
      .map((loc, idx) => ({
        ...loc,
        // Nếu admin cài đặt mapOrder > 0 thì ưu tiên mapOrder, ngược lại lấy idx + 1
        order: loc.mapOrder && loc.mapOrder > 0 ? loc.mapOrder : idx + 1,
        lat: Number(loc.coordinates.lat),
        lng: Number(loc.coordinates.lng),
      }))
      .sort((a, b) => a.order - b.order);

    if (focusedWork) {
      return valid.filter((loc) =>
        loc.relatedWorks.some((w) => w._id === focusedWork._id || w.slug === focusedWork.slug)
      );
    }

    return valid;
  }, [locations, focusedWork]);

  const displayedLocationsRef = useRef(displayedLocations);
  displayedLocationsRef.current = displayedLocations;

  // Tuyến đường nối hành trình (Polyline) 1 -> 2 -> 3...
  const routePositions = useMemo(() => {
    return displayedLocations
      .filter((l) => l.hasWorks)
      .map((item) => [item.lat, item.lng]);
  }, [displayedLocations]);

  // Khởi tạo vị trí ban đầu của nhân vật Chibi
  useEffect(() => {
    if (displayedLocations.length > 0 && characterPos === BAN_TIENG_CENTER) {
      const firstLoc = displayedLocations[0];
      setCharacterPos([firstLoc.lat, firstLoc.lng]);
      setMapCenter([firstLoc.lat, firstLoc.lng]);
      setActiveLocation(firstLoc);
    }
  }, [displayedLocations]);

  // 🚶 Smooth Walk Animation (Lerp)
  const walkCharacterTo = useCallback((targetLat, targetLng, targetLoc, onArrival) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const startLat = characterPosRef.current[0];
    const startLng = characterPosRef.current[1];

    setFacing(targetLng < startLng ? 'left' : 'right');
    setIsWalking(true);

    // Bắt đầu di chuyển camera mượt theo nhân vật
    setMapCenter([targetLat, targetLng]);

    const startTime = performance.now();
    const duration = 1800;

    const animateWalk = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentLat = startLat + (targetLat - startLat) * ease;
      const currentLng = startLng + (targetLng - startLng) * ease;

      setCharacterPos([currentLat, currentLng]);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animateWalk);
      } else {
        setIsWalking(false);
        setCharacterPos([targetLat, targetLng]);
        setMapCenter([targetLat, targetLng]);
        setActiveLocation(targetLoc);
        if (typeof onArrival === 'function') {
          onArrival();
        }
      }
    };

    animRef.current = requestAnimationFrame(animateWalk);
  }, []);

  // 🚌 Dừng trải nghiệm
  const stopAutoTour = useCallback(() => {
    setIsAutoTour(false);
    isAutoTourRef.current = false;
    if (tourTimerRef.current) {
      clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
  }, []);

  // 🚌 Di chuyển đến chặng trải nghiệm thứ index
  const goToTourStop = useCallback((index) => {
    const list = displayedLocationsRef.current;
    if (!list || list.length === 0) return;
    const safeIndex = index % list.length;
    setCurrentTourIndex(safeIndex);
    currentTourIndexRef.current = safeIndex;

    const stop = list[safeIndex];
    if (!stop) return;

    walkCharacterTo(stop.lat, stop.lng, stop, () => {
      // Khi đã tới nơi an toàn:
      if (!isAutoTourRef.current) return;
      // Dừng 6.5 giây cho người xem đọc thông tin rồi tiếp tục sang điểm kế tiếp
      tourTimerRef.current = setTimeout(() => {
        if (!isAutoTourRef.current) return;
        goToTourStop(currentTourIndexRef.current + 1);
      }, 6500);
    });
  }, [walkCharacterTo]);

  // Bật / Tắt nút "Trải nghiệm"
  const handleToggleAutoTour = useCallback(() => {
    if (displayedLocations.length === 0) return;
    if (isAutoTour) {
      stopAutoTour();
    } else {
      setIsAutoTour(true);
      isAutoTourRef.current = true;
      const nextIdx = currentTourIndex >= displayedLocations.length ? 0 : currentTourIndex;
      goToTourStop(nextIdx);
    }
  }, [displayedLocations.length, isAutoTour, currentTourIndex, stopAutoTour, goToTourStop]);

  // Click chọn thủ công điểm đến trên bản đồ
  const handleSelectLocation = useCallback((loc) => {
    stopAutoTour();
    const idx = displayedLocationsRef.current.findIndex((l) => l._id === loc._id);
    if (idx !== -1) {
      setCurrentTourIndex(idx);
      currentTourIndexRef.current = idx;
    }
    walkCharacterTo(loc.lat, loc.lng, loc);
  }, [stopAutoTour, walkCharacterTo]);

  // Dọn dẹp animation & timer khi unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 overflow-hidden font-sans select-none">
      {/* ── LOADING SKELETON / OVERLAY ── */}
      {loading && (
        <div className="absolute inset-0 z-[2000] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
            <MapPinIcon className="w-7 h-7 text-amber-400 absolute animate-pulse" />
          </div>
          <p className="text-amber-200 font-serif font-bold text-base tracking-wide">
            Đang tải dữ liệu Bản đồ Di sản...
          </p>
          <p className="text-slate-400 text-xs mt-1.5">
            Khởi tạo không gian văn hóa & tác phẩm gắn liền
          </p>
        </div>
      )}

      {/* ── TOP CONTROL BAR: BẠN ĐỒNG HÀNH, NÚT TRẢI NGHIỆM & CHẾ ĐỘ MỞ RỘNG ── */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Nhân vật Chibi đồng hành */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => setCharacterType('boy')}
            title="Đồng hành cùng Chàng trai Thái"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              characterType === 'boy'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-amber-200/80 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <img src="/characters/boy_chibi.png" alt="Chàng trai" className="w-5 h-6 object-contain drop-shadow" />
            <span className="hidden sm:inline">Chàng trai</span>
          </button>

          <button
            type="button"
            onClick={() => setCharacterType('girl')}
            title="Đồng hành cùng Cô gái Thái"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              characterType === 'girl'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-emerald-200/80 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <img src="/characters/girl_chibi.png" alt="Cô gái" className="w-5 h-6 object-contain drop-shadow" />
            <span className="hidden sm:inline">Cô gái</span>
          </button>

          <button
            type="button"
            onClick={() => setCharacterType('both')}
            title="Đồng hành cùng cả hai"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              characterType === 'both'
                ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center -space-x-1.5 flex-shrink-0">
              <img src="/characters/boy_chibi.png" alt="Chàng trai" className="w-4 h-5 object-contain" />
              <img src="/characters/girl_chibi.png" alt="Cô gái" className="w-4 h-5 object-contain" />
            </div>
            <span className="hidden sm:inline">Cả hai</span>
          </button>
        </div>

        {/* Nút "Trải nghiệm" */}
        {displayedLocations.length > 0 && (
          <button
            type="button"
            onClick={handleToggleAutoTour}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xl backdrop-blur-xl border cursor-pointer ${
              isAutoTour
                ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-400/50 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-amber-400/50'
            }`}
          >
            {isAutoTour ? (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>Dừng trải nghiệm</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Trải nghiệm</span>
              </>
            )}
          </button>
        )}

        {/* Nút hủy bộ lọc tác phẩm cụ thể nếu đang theo dấu */}
        {focusedWork && (
          <button
            type="button"
            onClick={() => setFocusedWork(null)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-amber-400 text-slate-950 shadow-xl border border-amber-300 cursor-pointer"
          >
            <span>Hành trình: {focusedWork.title}</span>
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── BẢN ĐỒ GHIM KHU VỰC BẢN TIỆNG: TỰ DO ZOOM IN, KHÓA ZOOM OUT ─────── */}
      <div className="w-full h-full">
        <MapContainer
          center={BAN_TIENG_CENTER}
          zoom={BAN_TIENG_DEFAULT_ZOOM}
          zoomSnap={0.25}
          minZoom={BAN_TIENG_MIN_ZOOM}
          maxZoom={BAN_TIENG_MAX_ZOOM}
          maxBounds={BAN_TIENG_BOUNDS}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          dragging={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          boxZoom={true}
          keyboard={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Phím phóng to / thu nhỏ ở góc dưới bên trái */}
          <ZoomControl position="bottomleft" />

          {/* Vệ tinh Google Maps Hybrid (lyrs=y) */}
          <TileLayer
            attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains="0123"
            maxNativeZoom={20}
            maxZoom={21}
          />

          <MapController center={mapCenter} zoom={BAN_TIENG_DEFAULT_ZOOM} />

          {/* Tuyến đường nối hành trình (Polyline) 1 -> 2 -> 3... */}
          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#f59e0b',
                weight: 3.5,
                dashArray: '8, 8',
                opacity: 0.85,
              }}
            />
          )}

          {/* Ghim địa điểm (1 Location = 1 Marker duy nhất) */}
          {displayedLocations.map((loc) => {
            const isSelected = activeLocation?._id === loc._id;
            return (
              <Marker
                key={loc._id}
                position={[loc.lat, loc.lng]}
                icon={getCachedLocationPin(
                  loc.order,
                  loc.name,
                  loc.workCount,
                  isSelected,
                  loc.hasWorks
                )}
                eventHandlers={{ click: () => handleSelectLocation(loc) }}
              />
            );
          })}

          {/* 🏃‍♂️ Nhân vật AI Chibi di chuyển trên bản đồ */}
          {isValidCoordinate(characterPos[0], characterPos[1]) && (
            <Marker
              position={characterPos}
              icon={createAICharacterPin(characterType, isWalking, facing)}
              zIndexOffset={1000}
            />
          )}
        </MapContainer>
      </div>

      {/* ── THẺ CHI TIẾT ĐỊA ĐIỂM & DANH SÁCH TÁC PHẨM GẮN LIỀN ──────────── */}
      {activeLocation && (
        <div className="absolute left-2.5 right-2.5 bottom-3 sm:left-4 sm:right-4 sm:bottom-6 md:left-auto md:right-8 md:bottom-8 md:w-[420px] max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 z-[1010] animate-in fade-in slide-in-from-bottom-6">
          <button
            type="button"
            aria-label="Đóng thông tin"
            onClick={() => setActiveLocation(null)}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-md cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {activeLocation.images?.[0]?.url ? (
            <img
              src={activeLocation.images[0].url}
              alt={activeLocation.name}
              className="w-full h-36 sm:h-44 object-cover rounded-t-2xl sm:rounded-t-3xl"
            />
          ) : (
            <div className="w-full h-20 sm:h-24 bg-gradient-to-r from-amber-900 to-slate-900 flex items-center px-5 sm:px-6 text-white rounded-t-2xl sm:rounded-t-3xl">
              <MapPinIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-amber-400" />
              <span className="font-serif font-bold text-sm sm:text-base">Không Gian Di Sản Văn Học</span>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeLocation.hasWorks ? `Điểm dừng số ${activeLocation.order}` : 'Địa danh văn hóa'}
              </span>
              {activeLocation.ethnicGroup?.name && (
                <span className="text-xs text-amber-400 font-bold">
                  Dân tộc {activeLocation.ethnicGroup.name}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-xl font-serif font-bold text-white mb-1">
              {activeLocation.name}
            </h3>

            {activeLocation.province && (
              <div className="flex items-center gap-1.5 text-xs text-orange-300 font-medium mb-3">
                <MapPinIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="truncate">
                  {activeLocation.district ? `${activeLocation.district}, ` : ''}{activeLocation.province}
                </span>
              </div>
            )}

            {(activeLocation.shortDescription || activeLocation.description) && (
              <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-4">
                {activeLocation.shortDescription || activeLocation.description}
              </p>
            )}

            {/* ── DANH SÁCH CÁC TÁC PHẨM XUẤT HIỆN TẠI ĐỊA ĐIỂM NÀY ── */}
            <div className="mb-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenIcon className="w-4 h-4 text-amber-400" />
                  {activeLocation.workCount > 0
                    ? `Không gian gắn với ${activeLocation.workCount} tác phẩm:`
                    : 'Chưa có tác phẩm gắn liền'}
                </span>
              </div>

              {activeLocation.workCount > 0 ? (
                <div className="flex flex-col gap-2">
                  {activeLocation.relatedWorks.map((work) => (
                    <div
                      key={work._id || work.slug}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link
                          to={`/works/${work.slug}`}
                          className="font-bold text-xs text-amber-200 hover:text-amber-300 transition-colors truncate"
                        >
                          {work.title}
                        </Link>
                        {work.role && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-amber-300">
                            {work.role === 'START'
                              ? 'Khởi đầu'
                              : work.role === 'DEVELOPMENT'
                              ? 'Phát triển'
                              : work.role === 'CLIMAX'
                              ? 'Cao trào'
                              : work.role === 'END'
                              ? 'Kết thúc'
                              : 'Chặng'}
                          </span>
                        )}
                      </div>

                      {work.journeyTitle && (
                        <p className="text-[11px] text-amber-400/90 font-medium mb-1 truncate">
                          Chặng: {work.journeyTitle}
                        </p>
                      )}

                      {work.journeyDescription ? (
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-2">
                          {work.journeyDescription}
                        </p>
                      ) : work.summary ? (
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                          {work.summary}
                        </p>
                      ) : null}

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                        <Link
                          to={`/works/${work.slug}`}
                          className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>Đọc tác phẩm</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setFocusedWork(work)}
                          className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 ml-auto flex items-center gap-1 cursor-pointer"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          <span>Theo dấu hành trình này</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700/80 text-center flex flex-col items-center justify-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-1">
                    🏛️
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Chưa có tác phẩm gắn với địa điểm này
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Địa danh văn hóa đang trong tiến trình khảo sát và sưu tầm tác phẩm văn học dân gian liên quan.
                  </p>
                </div>
              )}
            </div>

            {/* Nút xem trang chi tiết địa danh */}
            {activeLocation.slug ? (
              <Link
                to={`/locations/${activeLocation.slug}`}
                className="btn-primary py-2 text-xs rounded-xl flex items-center justify-center gap-1.5 font-bold w-full"
              >
                <MapPinIcon className="w-4 h-4" />
                Xem trang chi tiết địa danh
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
