import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { SparklesIcon } from '@heroicons/react/24/outline';

// ─── Exact Center of Bản Tiệng Village (Châu Thái / Mường Ham, Quỳ Hợp) ───────
const BAN_TIENG_CENTER = [19.3015, 105.1508];
const BAN_TIENG_DEFAULT_ZOOM = 16;

// ─── Detailed Polygon surrounding Bản Tiệng Village ───────────────────────────
const BAN_TIENG_BOUNDARY = {
  type: 'Feature',
  properties: { name: 'Bản Tiệng' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [105.1448, 19.3068], // Gần Minh Hoài Bản Tiệng
        [105.1482, 19.3082], // Rìa đồng ruộng phía bắc
        [105.1528, 19.3075], // Gần Trường Tiểu học xã Châu Thái
        [105.1582, 19.3062], // Phía Đông Bắc gần Nhà Hương Thịnh
        [105.1588, 19.3025], // Phía Đông gần Xóm Hộc Mới
        [105.1572, 19.2982], // Đông Nam
        [105.1538, 19.2938], // Phía Nam gần Lương Hồng Beauty
        [105.1492, 19.2946], // Rìa phía Nam ĐT48C
        [105.1442, 19.2965], // Gần Nhà văn hóa Bản Xàn
        [105.1432, 19.3012], // Tây - Gần Nhà văn hóa Xóm Hưng Long
        [105.1448, 19.3068], // Khép góc
      ],
    ],
  },
};

// ─── Bản Tiệng boundary style (Red dotted line) ───────────────────────────────
const BAN_TIENG_STYLE = {
  color: '#FF2E55',
  weight: 3,
  opacity: 1,
  dashArray: '10, 7',
  lineJoin: 'round',
  lineCap: 'round',
  fillColor: '#FF2E55',
  fillOpacity: 0.08,
};

// ─── Draggable pin icon ────────────────────────────────────────────────────────
const createPickerPin = () =>
  L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:grab;">
        <div style="width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ea580c;box-shadow:0 4px 15px rgba(234,88,12,0.6),0 2px 6px rgba(0,0,0,0.4);border:3px solid #fff;display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);color:#fff;font-size:14px;font-weight:bold;">📍</div>
        </div>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });

// ─── Map click → pick coords ───────────────────────────────────────────────────
const MapClickEvents = ({ onSelectCoords }) => {
  useMapEvents({ click: (e) => onSelectCoords(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ─── Smooth fly-to controller ──────────────────────────────────────────────────
const MiniMapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] && center?.[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Quick preset locations ────────────────────────────────────────────────────
const QUICK_PRESETS = [
  { name: '📍 Bản Tiệng, Quỳ Hợp (Nghệ An)',   lat: 19.3015, lng: 105.1508 },
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
    !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

  const [mapCenter, setMapCenter] = useState(
    hasValidCoords ? [parsedLat, parsedLng] : BAN_TIENG_CENTER
  );
  const [mapZoom, setMapZoom] = useState(
    hasValidCoords ? 16 : BAN_TIENG_DEFAULT_ZOOM
  );
  const [mapLayer, setMapLayer]   = useState('satellite');
  const markerRef = useRef(null);

  // When parent passes valid coords, update map center
  useEffect(() => {
    if (hasValidCoords) {
      setMapCenter([parsedLat, parsedLng]);
    }
  }, [lat, lng]);

  // Click on map or drag marker → update coords
  const handleSelectCoords = (newLat, newLng) => {
    const rLat = Number(newLat.toFixed(6));
    const rLng = Number(newLng.toFixed(6));
    onChange({ lat: String(rLat), lng: String(rLng) });
    setMapCenter([rLat, rLng]);
  };

  const handleMarkerDragEnd = () => {
    const pos = markerRef.current?.getLatLng();
    if (pos) handleSelectCoords(pos.lat, pos.lng);
  };

  const handlePresetSelect = (e) => {
    const preset = QUICK_PRESETS.find((p) => p.name === e.target.value);
    if (preset) {
      handleSelectCoords(preset.lat, preset.lng);
      setMapZoom(16);
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
            className="text-xs py-1.5 px-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 text-gray-700 max-w-[220px] truncate"
          >
            <option value="" disabled>-- Chọn địa phương mẫu --</option>
            {QUICK_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Layer switcher */}
        <div className="flex items-center self-start sm:self-auto bg-gray-100 p-0.5 rounded-xl text-[11px] font-semibold gap-0.5">
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mapLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🛰️ Vệ tinh
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('streets')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mapLayer === 'streets'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗺️ Bản đồ
          </button>
        </div>
      </div>

      {/* Boundary status */}
      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
        Ranh giới Bản Tiệng đang hiển thị
      </p>

      {/* Mini map */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border-2 border-orange-200 shadow-inner">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Tile layers */}
          {mapLayer === 'satellite' ? (
            <TileLayer
              attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains="0123"
              maxZoom={20}
            />
          ) : (
            <TileLayer
              attribution='Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains="0123"
              maxZoom={20}
            />
          )}

          <MiniMapController center={mapCenter} zoom={mapZoom} />
          <MapClickEvents onSelectCoords={handleSelectCoords} />

          {/* Bản Tiệng polygon boundary */}
          <GeoJSON
            key="ban-tieng-picker-boundary"
            data={BAN_TIENG_BOUNDARY}
            style={BAN_TIENG_STYLE}
          />

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

        {/* Tip badge */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[1000] bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] flex items-center gap-1.5 shadow pointer-events-none">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>💡 <strong>Click bản đồ</strong> hoặc <strong>kéo thả ghim</strong> để lấy tọa độ</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCoordinatePicker;
