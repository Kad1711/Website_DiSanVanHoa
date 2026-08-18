import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { locationService } from '../../../services/location.service';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { workService } from '../../../services/work.service';
import { STATUSES } from '../../../constants';
import LocationCoordinatePicker from '../../../components/ui/LocationCoordinatePicker';
import { ArrowLeftIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LocationCreatePage = () => {
  const navigate = useNavigate();
  const [ethnicGroups, setEthnicGroups] = useState([]);
  const [works, setWorks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    address: '',
    lat: '20.6500',
    lng: '104.9833',
    ethnicGroup: '',
    shortDescription: '',
    description: '',
    status: 'published',
    videoUrl: '',
    relatedWorks: [],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [egRes, wRes] = await Promise.all([
          ethnicGroupService.getAll({ limit: 100 }),
          workService.getAll({ limit: 100 }),
        ]);
        setEthnicGroups(egRes.data.data.ethnicGroups || []);
        setWorks(wRes.data.data.works || []);
      } catch (err) {
        console.error('Failed to load options', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorksToggle = (workId) => {
    setFormData((prev) => {
      const exists = prev.relatedWorks.includes(workId);
      return {
        ...prev,
        relatedWorks: exists
          ? prev.relatedWorks.filter((id) => id !== workId)
          : [...prev.relatedWorks, workId],
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
      setLoading(true);
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
      if (formData.relatedWorks.length > 0) {
        data.append('relatedWorks', JSON.stringify(formData.relatedWorks));
      }

      images.forEach((img) => data.append('images', img));

      const res = await locationService.create(data);

      // If video URL provided, add video
      if (formData.videoUrl.trim() && res.data.data.location?._id) {
        try {
          await locationService.addVideo(res.data.data.location._id, {
            url: formData.videoUrl.trim(),
            title: `Video giới thiệu ${formData.name}`,
            type: 'normal-video',
          });
        } catch (vidErr) {
          console.error('Failed to attach video', vidErr);
        }
      }

      toast.success('Tạo địa điểm thành công!');
      navigate('/admin/locations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo địa điểm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/locations" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thêm Địa Điểm Di Sản Mới</h1>
          <p className="text-gray-500 text-sm">Điền thông tin địa danh và tọa độ bản đồ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Tên địa điểm <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Bản Lác - Mai Châu, Hồ Ba Bể..."
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
              <option value="">-- Chọn dân tộc --</option>
              {ethnicGroups.map((eg) => (
                <option key={eg._id} value={eg._id}>{eg.name} ({eg.region || 'VN'})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="Ví dụ: Hòa Bình, Hà Giang..."
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Quận / Huyện / Thị xã</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Ví dụ: Mai Châu, Đồng Văn..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Địa chỉ chi tiết</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ví dụ: Xã Chiềng Châu..."
              className="input"
            />
          </div>
        </div>

        {/* Coordinates Section with Interactive Mini Map */}
        <div className="p-5 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-orange-50/20 rounded-2xl border border-orange-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-earth">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <span>Tọa độ GPS & Bản đồ chọn vị trí trực quan</span>
            </div>
            <span className="text-xs text-gray-500 font-normal">
              Hỗ trợ xem ảnh Vệ tinh sắc nét
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Vĩ độ (Latitude) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="20.6500"
                className="input text-sm font-mono font-semibold"
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
                placeholder="104.9833"
                className="input text-sm font-mono font-semibold"
                required
              />
            </div>
          </div>

          {/* Mini Interactive Map Picker */}
          <LocationCoordinatePicker
            lat={formData.lat}
            lng={formData.lng}
            onChange={({ lat, lng }) => {
              setFormData((prev) => ({ ...prev, lat, lng }));
            }}
          />
        </div>

        <div>
          <label className="label">Mô tả ngắn</label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Tóm tắt ngắn gọn vị trí hoặc ý nghĩa địa danh..."
            className="input"
          />
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

        {/* Video URL */}
        <div>
          <label className="label">Video URL (YouTube / MP4)</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input"
          />
        </div>

        {/* Multiple Image Uploads */}
        <div>
          <label className="label">Hình ảnh địa danh</label>
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Works Selection */}
        {works.length > 0 && (
          <div>
            <label className="label">Tác phẩm văn học gắn liền</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50">
              {works.map((w) => (
                <label key={w._id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1.5 rounded hover:bg-white">
                  <input
                    type="checkbox"
                    checked={formData.relatedWorks.includes(w._id)}
                    onChange={() => handleWorksToggle(w._id)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="truncate">{w.title} ({w.ethnicGroup?.name || 'Dân tộc'})</span>
                </label>
              ))}
            </div>
          </div>
        )}

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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/admin/locations" className="btn-ghost">Hủy</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang lưu...' : 'Lưu địa điểm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationCreatePage;
