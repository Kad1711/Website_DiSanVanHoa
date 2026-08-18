import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { REGIONS, STATUSES } from '../../../constants';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EthnicGroupCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    region: 'Tây Bắc',
    description: '',
    cultureSummary: '',
    status: 'published',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Vui lòng nhập tên dân tộc.');
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('region', formData.region);
      data.append('description', formData.description);
      data.append('cultureSummary', formData.cultureSummary);
      data.append('status', formData.status);

      if (thumbnail) data.append('thumbnail', thumbnail);
      if (coverImage) data.append('coverImage', coverImage);

      await ethnicGroupService.create(data);
      toast.success('Tạo dân tộc thành công!');
      navigate('/admin/ethnic-groups');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo dân tộc.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl font-sans">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/admin/ethnic-groups" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Thêm Dân Tộc Mới</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Điền thông tin và hình ảnh đại diện của dân tộc</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="label">Tên dân tộc <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Dân tộc Tày, Thái, Mường..."
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Vùng miền phân bố chính</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="input"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Mô tả tổng quan</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Giới thiệu chung về dân tộc, nguồn gốc lịch sử..."
            className="input"
          ></textarea>
        </div>

        <div>
          <label className="label">Đặc trưng văn hóa & Phong tục tập quán</label>
          <textarea
            name="cultureSummary"
            rows="5"
            value={formData.cultureSummary}
            onChange={handleChange}
            placeholder="Tóm tắt về lễ hội, kiến trúc nhà cửa, trang phục truyền thống, văn hóa dân gian..."
            className="input"
          ></textarea>
        </div>

        {/* Media Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 border-t border-gray-100">
          <div>
            <label className="label">Ảnh đại diện (Thumbnail)</label>
            <div className="mt-1 flex items-center gap-3 sm:gap-4 flex-wrap">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-primary flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 flex-shrink-0">
                  <PhotoIcon className="w-7 h-7" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="label">Ảnh bìa (Cover Banner)</label>
            <div className="mt-1 flex items-center gap-3 sm:gap-4 flex-wrap">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-20 h-14 rounded-xl object-cover border-2 border-primary flex-shrink-0" />
              ) : (
                <div className="w-20 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 flex-shrink-0">
                  <PhotoIcon className="w-7 h-7" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
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

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
          <Link to="/admin/ethnic-groups" className="btn-ghost text-center text-xs sm:text-sm py-2.5">Hủy</Link>
          <button type="submit" disabled={loading} className="btn-primary text-xs sm:text-sm py-2.5">
            {loading ? 'Đang lưu...' : 'Lưu dân tộc'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EthnicGroupCreatePage;
