import React from 'react';
import {
  MapPinIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export const JOURNEY_ROLES = [
  { value: 'START', label: 'Khởi đầu' },
  { value: 'DEVELOPMENT', label: 'Phát triển' },
  { value: 'CLIMAX', label: 'Cao trào' },
  { value: 'END', label: 'Kết thúc' },
  { value: 'OTHER', label: 'Khác' },
];

export const JourneyLocationManager = ({
  locations = [],
  locationsLoading = false,
  journeyLocations = [],
  setJourneyLocations,
  selectedLocationToAdd,
  setSelectedLocationToAdd,
}) => {
  const handleAddLocationToJourney = () => {
    if (!selectedLocationToAdd) return;
    const targetLoc = locations.find((l) => l._id === selectedLocationToAdd);
    if (!targetLoc) return;

    // Prevent duplicate location in the same work journey
    if (journeyLocations.some((jl) => (jl.location?._id || jl.location) === targetLoc._id)) {
      return;
    }

    setJourneyLocations((prev) => [
      ...prev,
      {
        location: targetLoc,
        order: prev.length + 1,
        role: prev.length === 0 ? 'START' : 'DEVELOPMENT',
        journeyTitle: '',
        journeyDescription: '',
      },
    ]);
    setSelectedLocationToAdd('');
  };

  const handleMoveLocation = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= journeyLocations.length) return;

    const list = [...journeyLocations];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Re-index order
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setJourneyLocations(updated);
  };

  const handleRemoveLocation = (index) => {
    const list = journeyLocations.filter((_, idx) => idx !== index);
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setJourneyLocations(updated);
  };

  const handleRoleChange = (index, newRole) => {
    setJourneyLocations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, role: newRole } : item))
    );
  };

  const handleJourneyMetaChange = (index, field, value) => {
    setJourneyLocations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Hành trình Di sản Văn học (Du hành Thời gian)
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Thiết lập các chặng địa danh theo diễn biến cốt truyện. Nhân vật Chibi sẽ di chuyển theo đúng thứ tự này trên bản đồ.
            </p>
          </div>
        </div>
      </div>

      {/* Select Location to add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 p-3 rounded-xl border border-amber-200">
        <select
          value={selectedLocationToAdd}
          onChange={(e) => setSelectedLocationToAdd(e.target.value)}
          disabled={locationsLoading}
          className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">-- Chọn một địa danh để gắn vào hành trình tác phẩm --</option>
          {locations
            .filter((loc) => !journeyLocations.some((jl) => (jl.location?._id || jl.location) === loc._id))
            .map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name} {loc.province ? `(${loc.province})` : ''}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={handleAddLocationToJourney}
          disabled={!selectedLocationToAdd}
          className="btn-primary text-xs sm:text-sm py-2 px-3.5 whitespace-nowrap disabled:opacity-40"
        >
          <PlusIcon className="w-4 h-4" /> Thêm vào hành trình
        </button>
      </div>

      {/* List of stops */}
      {journeyLocations.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-amber-300/80 rounded-xl bg-white/50 text-xs text-amber-800">
          Chưa có địa danh nào trong hành trình tác phẩm này. Hãy chọn một địa danh phía trên để bắt đầu!
        </div>
      ) : (
        <div className="space-y-3">
          {journeyLocations.map((item, idx) => {
            const locObj = item.location && typeof item.location === 'object' ? item.location : null;
            const locName = locObj?.name || 'Địa danh';
            const locProvince = locObj?.province || '';

            return (
              <div
                key={locObj?._id || idx}
                className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-sm space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">{locName}</span>
                      {locProvince && (
                        <span className="text-[11px] text-gray-500 ml-1.5">({locProvince})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Move Up / Down / Remove */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveLocation(idx, -1)}
                      className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-20"
                      title="Lên trên"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === journeyLocations.length - 1}
                      onClick={() => handleMoveLocation(idx, 1)}
                      className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-20"
                      title="Xuống dưới"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(idx)}
                      className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Xóa khỏi hành trình"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-inputs: Role & Journey Step description */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs pt-1 border-t border-gray-100">
                  <div className="sm:col-span-4">
                    <label className="text-[11px] text-gray-500 block mb-1">Giai đoạn cốt truyện:</label>
                    <select
                      value={item.role || 'DEVELOPMENT'}
                      onChange={(e) => handleRoleChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-xs font-medium focus:bg-white"
                    >
                      {JOURNEY_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-8">
                    <label className="text-[11px] text-gray-500 block mb-1">Mô tả sự kiện tại chặng này:</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nơi chàng bắt đầu hành trình tìm nguồn cội..."
                      value={item.journeyTitle || ''}
                      onChange={(e) => handleJourneyMetaChange(idx, 'journeyTitle', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JourneyLocationManager;
