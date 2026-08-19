import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// ─── Đồng bộ tâm & mức zoom với trang MapPage (Bản Tiệng, Quỳ Hợp) ───────────
const BAN_TIENG_CENTER = [19.2998, 105.1490];
const BAN_TIENG_DEFAULT_ZOOM = 19.5;

// ─── Tùy chỉnh icon ghim kéo thả chọn tọa độ ─────────────────────────────────
const createPickerPin = () =>
  L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:grab;">
        <div style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ea580c;box-shadow:0 4px 15px rgba(234,88,12,0.6),0 2px 6px rgba(0,0,0,0.4);border:3px solid #fff;display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);color:#fff;font-size:16px;font-weight:bold;">📍</div>
        </div>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

// ─── Map click listener để chọn tọa độ ─────────────────────────────────────────
const MapClickEvents = ({ onSelectCoords }) => {
  useMapEvents({
    click: (e) => onSelectCoords(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

// ─── Controller điều khiển chuyển động bay mượt ───────────────────────────────
const MiniMapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] && center?.[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Danh sách địa phương mẫu (Bản Tiệng là mặc định đầu tiên) ────────────────
const QUICK_PRESETS = [
  { name: '📍 Bản Tiệng, Quỳ Hợp (Nghệ An)',   lat: 19.2998, lng: 105.1490 },
  { name: 'Hòa Bình (Mai Châu)',               lat: 20.6593, lng: 104.9866 },
  { name: 'Hà Giang (Đồng Văn)',               lat: 23.2789, lng: 105.3614 },
  { name: 'Bắc Kạn (Hồ Ba Bể)',                lat: 22.4167, lng: 105.6167 },
  { name: 'Đắk Lắk (Buôn Đôn)',               lat: 12.8986, lng: 107.7944 },
  { name: 'Kon Tum (Kon Klor)',                lat: 14.3486, lng: 108.0189 },
  { name: 'Ninh Thuận (Po Klong Garai)',       lat: 11.6028, lng: 108.9464 },
  { name: 'Sóc Trăng (Chùa Dơi)',             lat:  9.5894, lng: 105.9753 },
  { name: 'Hà Nội',                            lat: 21.0285, lng: 105.8542 },
  { name: 'Đà Nẵng',                           lat: 16.0544, lng: 108.2022 },
  { name: 'TP. Hồ Chí Minh',                  lat: 10.8231, lng: 106.6297 },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const LocationCoordinatePicker = ({ lat, lng, onChange }) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const hasValidCoords =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180 &&
    (parsedLat !== 0 || parsedLng !== 0);

  const [mapCenter, setMapCenter] = useState(
    hasValidCoords ? [parsedLat, parsedLng] : BAN_TIENG_CENTER
  );
  const [mapZoom, setMapZoom]     = useState(
    hasValidCoords ? 19.5 : BAN_TIENG_DEFAULT_ZOOM
  );
  const [mapLayer, setMapLayer]   = useState('satellite');
  const markerRef = useRef(null);

  // Đồng bộ tâm khi component cha truyền tọa độ mới
  useEffect(() => {
    if (hasValidCoords) {
      setMapCenter([parsedLat, parsedLng]);
    }
  }, [lat, lng, hasValidCoords, parsedLat, parsedLng]);

  // Click vào map hoặc kéo ghim
  const handleSelectCoords = useCallback((newLat, newLng) => {
    const rLat = Number(newLat.toFixed(6));
    const rLng = Number(newLng.toFixed(6));
    onChange({ lat: String(rLat), lng: String(rLng) });
    setMapCenter([rLat, rLng]);
  }, [onChange]);

  const handleMarkerDragEnd = useCallback(() => {
    const pos = markerRef.current?.getLatLng();
    if (pos) handleSelectCoords(pos.lat, pos.lng);
  }, [handleSelectCoords]);

  const handlePresetSelect = (e) => {
    const preset = QUICK_PRESETS.find((p) => p.name === e.target.value);
    if (preset) {
      handleSelectCoords(preset.lat, preset.lng);
      setMapZoom(preset.name.includes('Bản Tiệng') ? 19.5 : 14);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Quick preset selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-700">Chọn nhanh:</span>
          <select
            onChange={handlePresetSelect}
            defaultValue=""
            aria-label="Chọn địa phương mẫu"
            className="text-xs py-1.5 px-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 max-w-[220px] truncate cursor-pointer"
          >
            <option value="" disabled>-- Chọn địa phương mẫu --</option>
            {QUICK_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          🛰️ Ảnh vệ tinh chi tiết
        </span>
      </div>

      {/* Mini map container */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border-2 border-orange-200 shadow-inner">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomSnap={0.5}
          minZoom={12}
          maxZoom={21}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Google Maps Satellite Hybrid layer */}
          <TileLayer
            attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains="0123"
            maxNativeZoom={20}
            maxZoom={21}
          />

          <MiniMapController center={mapCenter} zoom={mapZoom} />
          <MapClickEvents onSelectCoords={handleSelectCoords} />

          {/* Draggable coordinate pin */}
          {hasValidCoords && (
            <Marker
              draggable={true}
              eventHandlers={{ dragend: handleMarkerDragEnd }}
              position={[parsedLat, parsedLng]}
              icon={createPickerPin()}
              ref={markerRef}
            />
          )}
        </MapContainer>

        {/* Floating guidance badge */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[1000] bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1.5 shadow pointer-events-none">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>💡 <strong>Click bản đồ</strong> hoặc <strong>kéo thả ghim</strong> để lấy tọa độ</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCoordinatePicker;
