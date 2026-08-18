import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { REGIONS, STATUSES } from '../../../constants';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EthnicGroupEditPage = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ethnicGroupService.getById(id);
      const data = res.data.data.ethnicGroup;
      setFormData({
        name: data.name || '',
        region: data.region || 'Tây Bắc',
        description: data.description || '',
        cultureSummary: data.cultureSummary || '',
        status: data.status || 'published',
      });
      if (data.thumbnail?.url) setThumbnailPreview(data.thumbnail.url);
      if (data.coverImage?.url) setCoverPreview(data.coverImage.url);
    } catch (err) {
      setError('Không thể tải thông tin dân tộc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

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
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('region', formData.region);
      data.append('description', formData.description);
      data.append('cultureSummary', formData.cultureSummary);
      data.append('status', formData.status);

      if (thumbnail) data.append('thumbnail', thumbnail);
      if (coverImage) data.append('coverImage', coverImage);

      await ethnicGroupService.update(id, data);
      toast.success('Cập nhật dân tộc thành công!');
      navigate('/admin/ethnic-groups');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dân tộc.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/ethnic-groups" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Dân Tộc</h1>
          <p className="text-gray-500 text-sm">Cập nhật thông tin và văn hóa của {formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Giới thiệu khái quát về nguồn gốc, địa bàn cư trú..."
            className="input"
          ></textarea>
        </div>

        <div>
          <label className="label">Tóm tắt đặc trưng văn hóa</label>
          <textarea
            name="cultureSummary"
            rows="5"
            value={formData.cultureSummary}
            onChange={handleChange}
            placeholder="Trang phục truyền thống, phong tục, lễ hội, âm nhạc dân gian..."
            className="input"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Thumbnail */}
          <div>
            <label className="label">Ảnh đại diện (Avatar / Thumbnail)</label>
            <div className="mt-1 flex items-center gap-4">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                  <PhotoIcon className="w-8 h-8" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="label">Ảnh bìa (Cover Banner)</label>
            <div className="mt-1 flex items-center gap-4">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-24 h-16 rounded-lg object-cover border-2 border-primary" />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                  <PhotoIcon className="w-8 h-8" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/admin/ethnic-groups" className="btn-ghost">Hủy</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Đang cập nhật...' : 'Cập nhật thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EthnicGroupEditPage;
