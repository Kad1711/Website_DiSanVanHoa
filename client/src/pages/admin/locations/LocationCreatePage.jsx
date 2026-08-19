import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { locationService } from '../../../services/location.service';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { STATUSES } from '../../../constants';
import LocationCoordinatePicker from '../../../components/ui/LocationCoordinatePicker';
import { ArrowLeftIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LocationCreatePage = () => {
  const navigate = useNavigate();
  const [ethnicGroups, setEthnicGroups] = useState([]);
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
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const egRes = await ethnicGroupService.getAll({ limit: 100 });
        setEthnicGroups(egRes.data.data.ethnicGroups || []);
      } catch (err) {
        console.error('Failed to load options', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle flat keys (lat, lng) as well as dot-notation (coordinates.lat)
    if (name === 'coordinates.lat') {
      setFormData((prev) => ({ ...prev, lat: value }));
    } else if (name === 'coordinates.lng') {
      setFormData((prev) => ({ ...prev, lng: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      // relatedWorks is managed from the Work side, not here

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
    <div className="space-y-4 sm:space-y-6 max-w-4xl font-sans">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/admin/locations" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Thêm Địa Điểm Mới</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Điền thông tin và định vị tọa độ địa danh</p>
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
              placeholder="Ví dụ: Đỉnh Mẫu Sơn, Hồ Ba Bể..."
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Dân tộc liên quan</label>
            <select
              name="ethnicGroup"
              value={formData.ethnicGroup}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Không chọn --</option>
              {ethnicGroups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="label">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="Ví dụ: Lạng Sơn, Bắc Kạn..."
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
              placeholder="Ví dụ: Huyện Lộc Bình..."
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
            placeholder="Ví dụ: Xã Mẫu Sơn, huyện Lộc Bình..."
            className="input"
          />
        </div>

        <div className="p-4 sm:p-5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3 sm:space-y-4">
          <div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Tọa độ địa lý (GIS)</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Click trực tiếp trên bản đồ hoặc chọn tỉnh/thành mẫu để tự động điền tọa độ chính xác.
            </p>
          </div>

          <LocationCoordinatePicker
            lat={formData.lat}
            lng={formData.lng}
            onChange={(coords) => setFormData((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div>
              <label className="label text-xs">Vĩ độ (Latitude) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="19.4500"
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
                placeholder="104.9300"
                className="input bg-white"
                required
              />
            </div>
          </div>
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
          <label className="label">Thông tin chi tiết</label>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Lịch sử hình thành, giá trị văn hóa, các truyền thuyết gắn liền..."
            className="input"
          ></textarea>
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="label">Hình ảnh địa danh (tối đa 5 ảnh)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
