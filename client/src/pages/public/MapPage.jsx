import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  MapPinIcon,
  EyeIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';

// ─── Category Color Palettes & Icons ──────────────────────────────────────────
const CATEGORY_STYLE_MAP = {
  'truyen-co-tich': { hex: '#0284c7', glow: 'rgba(2,132,199,0.55)',  badge: 'bg-sky-100 text-sky-800',        icon: '🧚',  label: 'Truyền cổ tích' },
  'than-thoai':     { hex: '#6366f1', glow: 'rgba(99,102,241,0.55)',  badge: 'bg-indigo-100 text-indigo-800',  icon: '🌌',  label: 'Thần thoại' },
  'su-thi':        { hex: '#dc2626', glow: 'rgba(220,38,38,0.55)',    badge: 'bg-red-100 text-red-800',       icon: '⚔️',  label: 'Sử thi' },
  'truyen-thuyet': { hex: '#7c3aed', glow: 'rgba(124,58,237,0.55)',   badge: 'bg-purple-100 text-purple-800',  icon: '✨',  label: 'Truyền thuyết' },
  'truyen-tho':     { hex: '#059669', glow: 'rgba(5,150,105,0.55)',    badge: 'bg-emerald-100 text-emerald-800', icon: '📜', label: 'Truyện thơ' },
  'dan-ca':        { hex: '#d97706', glow: 'rgba(217,119,6,0.55)',    badge: 'bg-amber-100 text-amber-800',    icon: '🎵',  label: 'Dân ca' },
  'ca-dao-tuc-ngu': { hex: '#10b981', glow: 'rgba(16,185,129,0.55)',  badge: 'bg-teal-100 text-teal-800',      icon: '💬',  label: 'Tục ngữ - Ca dao' },
  'ngu-ngon-cuoi':  { hex: '#f59e0b', glow: 'rgba(245,158,11,0.55)',  badge: 'bg-yellow-100 text-yellow-800',  icon: '😄',  label: 'Ngụ ngôn - Cười' },
  'tho':           { hex: '#059669', glow: 'rgba(5,150,105,0.55)',    badge: 'bg-emerald-100 text-emerald-800', icon: '📜', label: 'Thơ ca' },
  'truyen-ngan':   { hex: '#0284c7', glow: 'rgba(2,132,199,0.55)',    badge: 'bg-sky-100 text-sky-800',        icon: '📖',  label: 'Truyện ngắn' },
  'khac':          { hex: '#ea580c', glow: 'rgba(234,88,12,0.55)',    badge: 'bg-orange-100 text-orange-800',  icon: '📚',  label: 'Tác phẩm' },
};

const getCategoryStyle = (cat = '') => {
  if (cat && typeof cat === 'object') {
    const slug = cat.slug || '';
    const preset = CATEGORY_STYLE_MAP[slug];
    const hex = cat.color || preset?.hex || '#ea580c';
    return {
      hex,
      glow: `${hex}88`,
      badge: preset?.badge || 'bg-orange-100 text-orange-800',
      icon: cat.icon || preset?.icon || '📚',
      label: cat.name || preset?.label || 'Tác phẩm',
    };
  }
  return CATEGORY_STYLE_MAP[cat] || CATEGORY_STYLE_MAP['khac'];
};

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

// ─── AI Character Leaflet Marker ──────────────────────────────────────────────
const createAICharacterPin = (type = 'both', isWalking = false, facing = 'right') => {
  const flip = facing === 'left' ? -1 : 1;
  const animClass = isWalking ? 'chibi-anim-walking' : 'chibi-anim-idle';

  let htmlContent = '';
  // Mặc định kích thước lớn, rõ nét
  let size = [84, 136];
  let anchor = [42, 130];

  if (type === 'boy') {
    size = [84, 136];
    anchor = [42, 130];
    htmlContent = `
      <div style="position:relative;width:84px;height:136px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-20px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#fde68a;font-size:11px;font-weight:700;padding:2px 10px;border-radius:999px;border:1.5px solid rgba(245,158,11,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Chàng trai Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}">
            <img src="/characters/boy_chibi.png" alt="Chàng trai Thái" style="width:76px;height:118px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(245,158,11,0.5));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:48px;height:10px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
      </div>
    `;
  } else if (type === 'girl') {
    size = [84, 136];
    anchor = [42, 130];
    htmlContent = `
      <div style="position:relative;width:84px;height:136px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-20px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#a7f3d0;font-size:11px;font-weight:700;padding:2px 10px;border-radius:999px;border:1.5px solid rgba(16,185,129,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Cô gái Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}">
            <img src="/characters/girl_chibi.png" alt="Cô gái Thái" style="width:72px;height:118px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(16,185,129,0.5));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:48px;height:10px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
      </div>
    `;
  } else {
    // Both characters
    size = [142, 136];
    anchor = [71, 130];
    htmlContent = `
      <div style="position:relative;width:142px;height:136px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="position:absolute;top:-20px;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);color:#fde047;font-size:11px;font-weight:700;padding:2px 10px;border-radius:999px;border:1.5px solid rgba(250,204,21,0.7);white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);z-index:3;">Đôi bạn người Thái</div>
        <div style="transform:scaleX(${flip});transition:transform 0.15s ease;display:flex;gap:4px;align-items:flex-end;justify-content:center;z-index:2;">
          <div class="${animClass}" style="${isWalking ? 'animation-delay:0s;' : ''}">
            <img src="/characters/boy_chibi.png" alt="Chàng trai Thái" style="width:68px;height:116px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6));display:block;" />
          </div>
          <div class="${animClass}" style="${isWalking ? 'animation-delay:0.18s;' : ''}">
            <img src="/characters/girl_chibi.png" alt="Cô gái Thái" style="width:65px;height:116px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6));display:block;" />
          </div>
        </div>
        <div style="position:absolute;bottom:0px;width:96px;height:10px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);border-radius:50%;z-index:1;"></div>
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

// ─── Lời thoại thông minh theo tác phẩm ────────────────────────────────────────
const getCharacterDialogue = (work, characterType) => {
  if (!work) return null;
  const title = (work.title || '').toLowerCase();

  if (title.includes('khăn piêu') || title.includes('khan pieu')) {
    if (characterType === 'boy') {
      return {
        speaker: 'Chàng trai Thái Chibi',
        text: 'Tiếng sáo bè réo rắt khắp đỉnh núi mây ngàn gọi người thương... Chiếc khăn Piêu đánh rơi bên bờ suối là lời hẹn thề son sắt!',
        avatar: '/characters/boy_chibi.png',
      };
    }
    return {
      speaker: 'Cô gái Thái Chibi',
      text: 'Chào bạn! Chiếc khăn Piêu mình dệt với chỉ ngũ sắc và hoa văn móc câu hình thoi tượng trưng cho đất trời, tình yêu và sự sống nảy nở của người Thái chúng mình.',
      avatar: '/characters/girl_chibi.png',
    };
  }

  if (title.includes('y ke') || title.includes('thần thoại')) {
    if (characterType === 'boy') {
      return {
        speaker: 'Chàng trai Thái Chibi',
        text: 'Thuở đại hồng thủy xa xưa, chàng Ơi Cặp và nàng Y Ke đã vượt ngàn sóng gió sinh ra các dân tộc anh em trên dải đất Việt Nam cùng chung một cội nguồn!',
        avatar: '/characters/boy_chibi.png',
      };
    }
    return {
      speaker: 'Cô gái Thái Chibi',
      text: 'Những câu chuyện thần thoại sơ khai nhắc nhở người Thái luôn biết ơn đất trời, gắn bó đoàn kết keo sơn giữa các tộc người anh em.',
      avatar: '/characters/girl_chibi.png',
    };
  }

  // Mặc định
  if (characterType === 'boy') {
    return {
      speaker: 'Chàng trai Thái Chibi',
      text: `Chúng ta đã đến địa danh văn hóa của tác phẩm "${work.title}"! Hãy cùng tôi lắng nghe di sản ngàn đời của đồng bào nhé.`,
      avatar: '/characters/boy_chibi.png',
    };
  }

  return {
    speaker: 'Cô gái Thái Chibi',
    text: `Chào bạn! Mình và bạn đã đến với không gian của tác phẩm "${work.title}". Nơi đây lưu giữ bao câu chuyện mộc mạc và ý nghĩa của bản mường.`,
    avatar: '/characters/girl_chibi.png',
  };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MapPage = () => {
  const [works, setWorks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeWork, setActiveWork] = useState(null);
  const [mapCenter, setMapCenter]   = useState(BAN_TIENG_LOCKED_CENTER);

  // 🤖 AI Character System State
  const [characterType, setCharacterType] = useState('both'); // 'boy' | 'girl' | 'both'
  const [characterPos, setCharacterPos]   = useState(BAN_TIENG_LOCKED_CENTER);
  const [isWalking, setIsWalking]         = useState(false);
  const [facing, setFacing]               = useState('right'); // 'left' | 'right'
  const [speechBubble, setSpeechBubble]   = useState(null);
  const [isAutoTour, setIsAutoTour]       = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);

  const animRef = useRef(null);
  const tourTimerRef = useRef(null);

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

  // Standardized mappedWorks with strict validation
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

  // Đặt vị trí ban đầu của nhân vật tại điểm tác phẩm đầu tiên nếu có
  useEffect(() => {
    if (mappedWorks.length > 0 && characterPos === BAN_TIENG_LOCKED_CENTER) {
      setCharacterPos([mappedWorks[0].lat, mappedWorks[0].lng]);
      const initialSpeech = getCharacterDialogue(mappedWorks[0].work, characterType);
      setSpeechBubble(initialSpeech);
    }
  }, [mappedWorks, characterType]);

  // 🚶 Smooth Walk Animation (Lerp)
  const walkCharacterTo = useCallback((targetLat, targetLng, targetWork) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setSpeechBubble(null);

    const startLat = characterPos[0];
    const startLng = characterPos[1];

    setFacing(targetLng < startLng ? 'left' : 'right');
    setIsWalking(true);

    const startTime = performance.now();
    const duration = 1600; // 1.6 giây bước đi mượt mà

    const animateWalk = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing cubic out
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
        setActiveWork(targetWork);

        // Hiển thị lời thoại tương tác AI
        const dialogue = getCharacterDialogue(targetWork, characterType);
        setSpeechBubble(dialogue);
      }
    };

    animRef.current = requestAnimationFrame(animateWalk);
  }, [characterPos, characterType]);

  // Click vào tác phẩm trên bản đồ
  const handleSelectWork = useCallback((work) => {
    setIsAutoTour(false);
    clearTimeout(tourTimerRef.current);
    const loc = getPrimaryMappedLocation(work);
    if (loc) {
      walkCharacterTo(loc.lat, loc.lng, work);
    } else {
      setActiveWork(work);
    }
  }, [walkCharacterTo]);

  // 🚌 Auto Tour Controller
  useEffect(() => {
    if (!isAutoTour || mappedWorks.length === 0) {
      clearTimeout(tourTimerRef.current);
      return;
    }

    const currentItem = mappedWorks[currentTourIndex];
    if (currentItem) {
      walkCharacterTo(currentItem.lat, currentItem.lng, currentItem.work);
    }

    tourTimerRef.current = setTimeout(() => {
      setCurrentTourIndex((prev) => (prev + 1) % mappedWorks.length);
    }, 8500); // Dừng lại 8.5s cho mỗi tác phẩm rồi đi tiếp

    return () => clearTimeout(tourTimerRef.current);
  }, [isAutoTour, currentTourIndex, mappedWorks, walkCharacterTo]);

  // Primary location for active work detail card
  const activeWorkLocation = useMemo(() => {
    return activeWork ? getPrimaryMappedLocation(activeWork) : null;
  }, [activeWork]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 overflow-hidden font-sans select-none">
      {/* ── TOP CONTROL BAR: AI COMPANION SWITCHER & AUTO TOUR ───────────────── */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* AI Character Switcher Badge */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl">
          {/* Boy Option */}
          <button
            type="button"
            onClick={() => {
              setCharacterType('boy');
              if (activeWork) setSpeechBubble(getCharacterDialogue(activeWork, 'boy'));
            }}
            title="Đồng hành cùng Chàng trai Thái"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              characterType === 'boy'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-amber-200/80 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <img
              src="/characters/boy_chibi.png"
              alt="Chàng trai Chibi"
              className="w-5 h-6 object-contain flex-shrink-0 drop-shadow"
            />
            <span className="hidden sm:inline">Chàng trai</span>
          </button>

          {/* Girl Option */}
          <button
            type="button"
            onClick={() => {
              setCharacterType('girl');
              if (activeWork) setSpeechBubble(getCharacterDialogue(activeWork, 'girl'));
            }}
            title="Đồng hành cùng Cô gái Thái"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              characterType === 'girl'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-emerald-200/80 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <img
              src="/characters/girl_chibi.png"
              alt="Cô gái Chibi"
              className="w-5 h-6 object-contain flex-shrink-0 drop-shadow"
            />
            <span className="hidden sm:inline">Cô gái</span>
          </button>

          {/* Both Option */}
          <button
            type="button"
            onClick={() => {
              setCharacterType('both');
              if (activeWork) setSpeechBubble(getCharacterDialogue(activeWork, 'both'));
            }}
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

        {/* Auto Tour Button */}
        {mappedWorks.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAutoTour(!isAutoTour)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xl backdrop-blur-xl border cursor-pointer ${
              isAutoTour
                ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-400/50 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/40'
            }`}
          >
            {isAutoTour ? (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>Dừng tham quan</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Du hành AI tự động</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── INTERACTIVE AI SPEECH BUBBLE OVERLAY ─────────────────────────── */}
      {speechBubble && (
        <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-[1005] max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-2xl border border-amber-500/40 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <img
              src={speechBubble.avatar}
              alt={speechBubble.speaker}
              className="w-12 h-14 object-contain flex-shrink-0 drop-shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                  {speechBubble.speaker}
                </span>
                <button
                  type="button"
                  onClick={() => setSpeechBubble(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {speechBubble.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL-SCREEN LEAFLET MAP ─────────────────────────────────────── */}
      <div className="w-full h-full">
        <MapContainer
          center={BAN_TIENG_LOCKED_CENTER}
          zoom={BAN_TIENG_LOCKED_ZOOM}
          zoomSnap={0.5}
          minZoom={19.5}
          maxZoom={21.5}
          zoomControl={false}
          dragging={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          boxZoom={false}
          keyboard={false}
          maxBounds={BAN_TIENG_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Google Maps Satellite Hybrid (lyrs=y) */}
          <TileLayer
            attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains="0123"
            maxNativeZoom={20}
            maxZoom={21}
          />

          <MapController center={mapCenter} zoom={BAN_TIENG_LOCKED_ZOOM} />

          {/* Literary work markers */}
          {mappedWorks.map(({ work, lat, lng }) => {
            const isSelected = activeWork?._id === work._id;
            return (
              <Marker
                key={work._id}
                position={[lat, lng]}
                icon={getCachedWorkPin(work.category, isSelected)}
                eventHandlers={{ click: () => handleSelectWork(work) }}
              />
            );
          })}

          {/* 🏃‍♂️ AI Character Marker walking on the map */}
          {isValidCoordinate(characterPos[0], characterPos[1]) && (
            <Marker
              position={characterPos}
              icon={createAICharacterPin(characterType, isWalking, facing)}
              zIndexOffset={1000}
            />
          )}
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
