import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { locationService } from '../../../services/location.service';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { workService } from '../../../services/work.service';
import { STATUSES } from '../../../constants';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import LocationCoordinatePicker from '../../../components/ui/LocationCoordinatePicker';
import { ArrowLeftIcon, MapPinIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LocationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ethnicGroups, setEthnicGroups] = useState([]);
  const [availableWorks, setAvailableWorks] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    address: '',
    lat: '',
    lng: '',
    ethnicGroup: '',
    shortDescription: '',
    description: '',
    status: 'published',
    videoUrl: '',
  });
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa lưu.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const [locRes, egRes, workRes] = await Promise.allSettled([
          locationService.getById(id),
          ethnicGroupService.getAll({ limit: 100 }),
          workService.getAll({ limit: 200 }),
        ]);

        if (locRes.status !== 'fulfilled') throw new Error('Không thể tải thông tin địa điểm.');
        const loc = locRes.value.data.data.location;

        if (egRes.status === 'fulfilled') {
          setEthnicGroups(egRes.value.data.data.ethnicGroups || []);
        }
        if (workRes.status === 'fulfilled') {
          setAvailableWorks(workRes.value.data.data.works || []);
        }

        setExistingImages(loc.images || []);

        const initialWorks = (loc.relatedWorks || []).map((w) =>
          typeof w === 'object' && w !== null ? w._id : w
        );
        setSelectedWorks(initialWorks);

        setFormData({
          name: loc.name || '',
          province: loc.province || '',
          district: loc.district || '',
          address: loc.address || '',
          lat: loc.coordinates?.lat !== undefined ? String(loc.coordinates.lat) : '',
          lng: loc.coordinates?.lng !== undefined ? String(loc.coordinates.lng) : '',
          ethnicGroup: loc.ethnicGroup?._id || loc.ethnicGroup || '',
          shortDescription: loc.shortDescription || '',
          description: loc.description || '',
          status: loc.status || 'published',
          videoUrl: '',
        });
      } catch (err) {
        setError('Không thể tải thông tin địa điểm.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    markDirty();
  };

  const handleWorkToggle = (workId) => {
    setSelectedWorks((prev) =>
      prev.includes(workId) ? prev.filter((wid) => wid !== workId) : [...prev, workId]
    );
    markDirty();
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImages((prev) => [...prev, ...files]);
      const previews = files.map((f) => URL.createObjectURL(f));
      setNewImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (publicId) => {
    try {
      await locationService.removeImage(id, publicId);
      setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Đã xóa ảnh.');
    } catch (err) {
      toast.error('Lỗi khi xóa ảnh.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.province.trim()) {
      return toast.error('Vui lòng nhập tên địa điểm và tỉnh/thành phố.');
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return toast.error('Tọa độ vĩ độ (-90 đến 90) hoặc kinh độ (-180 đến 180) không hợp lệ.');
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('province', formData.province.trim());
      data.append('district', formData.district.trim());
      data.append('address', formData.address.trim());
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);
      data.append('status', formData.status);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);

      if (formData.ethnicGroup) data.append('ethnicGroup', formData.ethnicGroup);
      data.append('relatedWorks', JSON.stringify(selectedWorks));

      newImages.forEach((img) => data.append('images', img));

      await locationService.update(id, data);

      if (formData.videoUrl.trim()) {
        try {
          await locationService.addVideo(id, {
            url: formData.videoUrl.trim(),
            title: `Video giới thiệu ${formData.name}`,
            type: 'normal-video',
          });
        } catch (vidErr) {
          console.error('Failed to attach video', vidErr);
        }
      }

      setIsDirty(false);
      toast.success('Cập nhật địa điểm thành công!');
      navigate('/admin/locations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật địa điểm.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (e) => {
    if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?')) {
      e.preventDefault();
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl font-sans">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/admin/locations" onClick={handleCancel} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chỉnh Sửa Địa Điểm</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Cập nhật thông tin, tọa độ và tác phẩm gắn liền</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="label">Tên địa điểm <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Dân tộc gắn liền</label>
            <select
              name="ethnicGroup"
              value={formData.ethnicGroup}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Chọn dân tộc (không bắt buộc) --</option>
              {ethnicGroups.map((eg) => (
                <option key={eg._id} value={eg._id}>{eg.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Quận / Huyện</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Địa chỉ chi tiết</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Địa chỉ cụ thể (thôn, bản, xã...)"
            className="input"
          />
        </div>

        {/* ── BẢN ĐỒ CHỌN TỌA ĐỘ VỊ TRÍ ── */}
        <div className="space-y-2 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
          <div className="flex items-center gap-2 mb-1">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-gray-800">Định vị Tọa độ trên Bản đồ</h3>
            <span className="text-xs text-gray-500">(Bấm trực tiếp lên bản đồ hoặc kéo ghim để lấy tọa độ)</span>
          </div>

          <LocationCoordinatePicker
            lat={formData.lat}
            lng={formData.lng}
            onChange={({ lat, lng }) => {
              setFormData((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="label text-xs">Vĩ độ (Latitude) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="19.2998"
                className="input bg-white"
                required
              />
            </div>
            <div>
              <label className="label text-xs">Kinh độ (Longitude) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="any"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                placeholder="105.1490"
                className="input bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* ── TÁC PHẨM LIÊN QUAN (LIÊN KẾT 2 CHIỀU) ── */}
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">Tác phẩm Di sản gắn liền</h3>
              <p className="text-xs text-amber-700">
                Gắn địa điểm này vào các tác phẩm để hiển thị ngay trên Bản đồ Di sản Văn học.
              </p>
            </div>
          </div>

          {availableWorks.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Chưa có tác phẩm nào trong hệ thống.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-amber-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80">
              {availableWorks.map((work) => {
                const isChecked = selectedWorks.includes(work._id);
                return (
                  <label
                    key={work._id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isChecked ? 'bg-amber-100 text-amber-950 font-semibold' : 'hover:bg-amber-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleWorkToggle(work._id)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="truncate flex-1">{work.title}</span>
                    {work.author && <span className="text-gray-400 text-[11px] truncate">({work.author})</span>}
                  </label>
                );
              })}
            </div>
          )}
          {selectedWorks.length > 0 && (
            <div className="text-xs text-amber-800 font-medium">
              Đã chọn: <span className="font-bold">{selectedWorks.length}</span> tác phẩm liên quan.
            </div>
          )}
        </div>

        <div>
          <label className="label">Mô tả ngắn</label>
          <textarea
            name="shortDescription"
            rows="2"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Tóm tắt về địa danh trong 1-2 câu..."
            className="input"
          ></textarea>
        </div>

        <div>
          <label className="label">Nội dung chi tiết & Giá trị văn hóa lịch sử</label>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả cụ thể về di tích, cảnh quan, câu chuyện sử thi gắn liền..."
            className="input"
          ></textarea>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="label">Ảnh hiện có</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((img) => (
                <div key={img.publicId} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                  <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.publicId)}
                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
                    title="Xóa ảnh này"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Uploads */}
        <div>
          <label className="label">Thêm ảnh mới</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImageChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />

          {newImagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {newImagePreviews.map((preview, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                  <img src={preview} alt="New preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video URL */}
        <div>
          <label className="label">Thêm Video URL mới (YouTube / MP4)</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input"
          />
        </div>

        <div>
          <label className="label">Trạng thái phát hành</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input max-w-xs"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
          <Link to="/admin/locations" onClick={handleCancel} className="btn-ghost text-center text-xs sm:text-sm py-2.5">Hủy</Link>
          <button type="submit" disabled={saving} className="btn-primary text-xs sm:text-sm py-2.5">
            {saving ? 'Đang cập nhật...' : 'Cập nhật thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationEditPage;
