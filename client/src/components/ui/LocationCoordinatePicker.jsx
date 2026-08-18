import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  GlobeAmericasIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Custom Pin Icon for Coordinate Picker
const createPickerPin = () => {
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #ea580c;
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.6), 0 2px 6px rgba(0,0,0,0.4);
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
          ">
            📍
          </div>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

// Map click event listener to update coordinates
const MapClickEvents = ({ onSelectCoords }) => {
  useMapEvents({
    click(e) {
      onSelectCoords(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Map controller to fly to selected location
const MiniMapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
};

// Vietnam quick preset regions
const QUICK_PRESETS = [
  { name: 'Hòa Bình (Mai Châu)', lat: 20.6593, lng: 104.9866 },
  { name: 'Hà Giang (Đồng Văn)', lat: 23.2789, lng: 105.3614 },
  { name: 'Bắc Kạn (Hồ Ba Bể)', lat: 22.4167, lng: 105.6167 },
  { name: 'Đắk Lắk (Buôn Đôn)', lat: 12.8986, lng: 107.7944 },
  { name: 'Kon Tum (Kon Klor)', lat: 14.3486, lng: 108.0189 },
  { name: 'Ninh Thuận (Po Klong Garai)', lat: 11.6028, lng: 108.9464 },
  { name: 'Sóc Trăng (Chùa Dơi)', lat: 9.5894, lng: 105.9753 },
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
];

const LocationCoordinatePicker = ({ lat, lng, onChange }) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

  const defaultCenter = hasValidCoords ? [parsedLat, parsedLng] : [16.047079, 107.8];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(hasValidCoords ? 13 : 6);
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' or 'streets'
  const markerRef = useRef(null);

  useEffect(() => {
    if (hasValidCoords) {
      setMapCenter([parsedLat, parsedLng]);
    }
  }, [lat, lng]);

  const handleSelectCoords = (newLat, newLng) => {
    const roundedLat = Number(newLat.toFixed(6));
    const roundedLng = Number(newLng.toFixed(6));
    onChange({ lat: String(roundedLat), lng: String(roundedLng) });
    setMapCenter([roundedLat, roundedLng]);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const position = marker.getLatLng();
      handleSelectCoords(position.lat, position.lng);
    }
  };

  const handlePresetSelect = (e) => {
    const preset = QUICK_PRESETS.find((p) => p.name === e.target.value);
    if (preset) {
      handleSelectCoords(preset.lat, preset.lng);
      setMapZoom(13);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mini Map Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Chọn vị trí nhanh:</span>
          <select
            onChange={handlePresetSelect}
            defaultValue=""
            className="text-xs py-1 px-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-gray-700"
          >
            <option value="" disabled>-- Chọn địa phương mẫu --</option>
            {QUICK_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Layer switch */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🛰️ Vệ tinh
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('streets')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapLayer === 'streets' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗺️ Bản đồ
          </button>
        </div>
      </div>

      {/* Mini Map Container */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border-2 border-orange-200 shadow-inner">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {mapLayer === 'satellite' ? (
            <>
              <TileLayer
                attribution='&copy; Esri World Imagery'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.8}
              />
            </>
          ) : (
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <MiniMapController center={mapCenter} zoom={mapZoom} />
          <MapClickEvents onSelectCoords={handleSelectCoords} />

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

        {/* Tip floating badge */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-[1000] bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 shadow">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>💡 <strong>Click bất kỳ đâu</strong> hoặc <strong>kéo thả ghim</strong> để lấy tọa độ</span>
        </div>
      </div>
    </div>
  );
};

export default LocationCoordinatePicker;
