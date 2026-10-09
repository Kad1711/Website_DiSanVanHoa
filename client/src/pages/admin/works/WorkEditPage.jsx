import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { workService } from '../../../services/work.service';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { locationService } from '../../../services/location.service';
import { categoryService } from '../../../services/category.service';
import { CATEGORIES, STATUSES, VIDEO_TYPES } from '../../../constants';
import Loading from '../../../components/ui/Loading';
import ErrorState from '../../../components/ui/ErrorState';
import RichContentEditor from '../../../components/admin/RichContentEditor';
import {
  ArrowLeftIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
  VideoCameraIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  MapPinIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JOURNEY_ROLES = [
  { value: 'START', label: 'Khởi đầu' },
  { value: 'DEVELOPMENT', label: 'Phát triển' },
  { value: 'CLIMAX', label: 'Cao trào' },
  { value: 'END', label: 'Kết thúc' },
  { value: 'OTHER', label: 'Khác' },
];

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const WorkEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [ethnicGroups, setEthnicGroups] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [existingGallery, setExistingGallery] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);

  // 🗺️ Quản lý hành trình Work - Location
  const [journeyLocations, setJourneyLocations] = useState([]);
  const [selectedLocationToAdd, setSelectedLocationToAdd] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: 'Dân gian',
    category: 'truyen-thuyet',
    ethnicGroup: '',
    summary: '',
    content: '',
    status: 'published',
    videoUrl: '',
    videoTitle: '',
    videoType: 'normal-video',
  });

  // Video Upload mode: 'file' or 'url'
  const [videoMode, setVideoMode] = useState('file');
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoFilePreview, setVideoFilePreview] = useState('');

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [newGallery, setNewGallery] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
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
        const [wRes, catRes, egRes, locRes] = await Promise.all([
          workService.getById(id),
          categoryService.getAll({ limit: 100 }),
          ethnicGroupService.getAll({ limit: 100 }),
          locationService.getAll({ limit: 100 }),
        ]);

        const work = wRes.data.data.work;
        const fetchedCats = catRes.data.data.categories || [];
        setCategories(fetchedCats);
        setEthnicGroups(egRes.data.data.ethnicGroups || []);
        const allLocs = locRes.data.data.locations || [];
        setLocations(allLocs);
        setExistingGallery(work.gallery || []);
        setExistingVideos(work.videos || []);

        setFormData({
          title: work.title || '',
          author: work.author || 'Dân gian',
          category: work.category?._id || work.category || '',
          ethnicGroup: work.ethnicGroup?._id || work.ethnicGroup || '',
          summary: work.summary || '',
          content: work.content || '',
          status: work.status || 'published',
          videoUrl: '',
          videoTitle: '',
          videoType: 'normal-video',
        });

        // Nạp danh sách hành trình hiện tại
        let initialJourney = [];
        if (work.journey && work.journey.length > 0) {
          initialJourney = work.journey.map((item, idx) => ({
            locationId: item.location?._id || item.location,
            name: item.location?.name || 'Địa điểm',
            province: item.location?.province || '',
            order: item.order || idx + 1,
            role: item.role || 'DEVELOPMENT',
            journeyTitle: item.journeyTitle || '',
            journeyDescription: item.journeyDescription || '',
          }));
        } else if (work.relatedLocations && work.relatedLocations.length > 0) {
          initialJourney = work.relatedLocations.map((loc, idx) => {
            const locId = typeof loc === 'object' ? loc._id : loc;
            const locObj = allLocs.find((l) => l._id === locId) || (typeof loc === 'object' ? loc : {});
            return {
              locationId: locId,
              name: locObj.name || 'Địa điểm',
              province: locObj.province || '',
              order: idx + 1,
              role: idx === 0 ? 'START' : 'DEVELOPMENT',
              journeyTitle: '',
              journeyDescription: '',
            };
          });
        }
        setJourneyLocations(initialJourney);

        if (work.coverImage?.url) setCoverPreview(work.coverImage.url);
      } catch (err) {
        setError('Không thể tải thông tin tác phẩm.');
      } finally {
        setLocationsLoading(false);
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

  // ── Thao tác Hành trình Work - Location ──
  const handleAddLocationToJourney = () => {
    if (!selectedLocationToAdd) return;
    const loc = locations.find((l) => l._id === selectedLocationToAdd);
    if (!loc) return;
    if (journeyLocations.some((item) => item.locationId === loc._id)) {
      return toast.error('Địa điểm này đã có trong hành trình.');
    }
    const newOrder = journeyLocations.length + 1;
    setJourneyLocations((prev) => [
      ...prev,
      {
        locationId: loc._id,
        name: loc.name,
        province: loc.province,
        order: newOrder,
        role: newOrder === 1 ? 'START' : 'DEVELOPMENT',
        journeyTitle: '',
        journeyDescription: '',
      },
    ]);
    setSelectedLocationToAdd('');
    markDirty();
  };

  const handleMoveJourneyItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= journeyLocations.length) return;
    setJourneyLocations((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
    markDirty();
  };

  const handleRemoveJourneyItem = (index) => {
    setJourneyLocations((prev) =>
      prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, order: idx + 1 }))
    );
    markDirty();
  };

  const handleJourneyFieldChange = (index, field, value) => {
    setJourneyLocations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
    markDirty();
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleNewGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewGallery((prev) => [...prev, ...files]);
      const previews = files.map((f) => URL.createObjectURL(f));
      setNewGalleryPreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveNewGallery = (index) => {
    setNewGallery((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingGallery = async (publicId) => {
    try {
      await workService.removeGalleryImage(id, publicId);
      setExistingGallery((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Đã xóa ảnh thư viện.');
    } catch (err) {
      toast.error('Lỗi khi xóa ảnh.');
    }
  };

  const handleDeleteExistingVideo = async (videoId) => {
    try {
      await workService.removeVideo(id, videoId);
      setExistingVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success('Đã xóa video.');
    } catch (err) {
      toast.error('Lỗi khi xóa video.');
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      return toast.error('Vui lòng chọn tệp định dạng video hợp lệ.');
    }

    if (file.size > 150 * 1024 * 1024) {
      return toast.error('Kích thước video tối đa là 150MB.');
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    videoElement.src = objectUrl;

    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(objectUrl);
      const duration = videoElement.duration;
      if (duration > 900) {
        toast.error(`Thời lượng video (${formatDuration(duration)}) vượt quá giới hạn 15 phút.`);
        setVideoFile(null);
        setVideoFilePreview('');
        setVideoDuration(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setVideoDuration(duration);
      setVideoFile(file);
      setVideoFilePreview(URL.createObjectURL(file));
      toast.success(`Đã chọn video: ${formatDuration(duration)}`);
    };

    videoElement.onerror = () => {
      toast.error('Không thể đọc thông tin tệp video.');
    };
  };

  const openNativeFilePicker = () => {
    setVideoMode('file');
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Vui lòng nhập tiêu đề tác phẩm.');
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('category', formData.category);
      data.append('summary', formData.summary);
      data.append('content', formData.content);
      data.append('status', formData.status);

      if (formData.ethnicGroup) data.append('ethnicGroup', formData.ethnicGroup);

      // Gửi hành trình WorkLocation
      const payload = journeyLocations.map((item, idx) => ({
        location: item.locationId,
        order: idx + 1,
        role: item.role || (idx === 0 ? 'START' : 'DEVELOPMENT'),
        journeyTitle: item.journeyTitle || '',
        journeyDescription: item.journeyDescription || '',
      }));
      data.append('relatedLocations', JSON.stringify(payload));

      if (coverImage) data.append('coverImage', coverImage);
      newGallery.forEach((img) => data.append('gallery', img));

      await workService.update(id, data);

      if (videoMode === 'file' && videoFile) {
        try {
          toast.loading('Đang tải video mới lên...', { id: 'upload-vid' });
          const vData = new FormData();
          vData.append('video', videoFile);
          vData.append('title', formData.videoTitle.trim() || `Video tác phẩm ${formData.title}`);
          vData.append('type', formData.videoType);
          const vidRes = await workService.addVideo(id, vData);
          setExistingVideos(vidRes.data.data.videos || []);
          setVideoFile(null);
          setVideoFilePreview('');
          toast.success('Đã tải video lên thành công!', { id: 'upload-vid' });
        } catch (vidErr) {
          console.error('Failed to attach video file', vidErr);
        }
      } else if (videoMode === 'url' && formData.videoUrl.trim()) {
        try {
          const vidRes = await workService.addVideo(id, {
            url: formData.videoUrl.trim(),
            title: formData.videoTitle.trim() || `Video tác phẩm ${formData.title}`,
            type: formData.videoType,
          });
          setExistingVideos(vidRes.data.data.videos || []);
          setFormData((prev) => ({ ...prev, videoUrl: '' }));
          toast.success('Đã thêm liên kết video!');
        } catch (vidErr) {
          console.error('Failed to attach video URL', vidErr);
        }
      }

      setIsDirty(false);
      toast.success('Cập nhật tác phẩm thành công!');
      navigate('/admin/works');
    } catch (err) {
      const errorDetails = err.response?.data?.errors?.length
        ? err.response.data.errors.join(' | ')
        : (err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tác phẩm.');
      toast.error(errorDetails);
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
        <Link to="/admin/works" onClick={handleCancel} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0 shadow-sm">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chỉnh Sửa Tác Phẩm</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Cập nhật thông tin tác phẩm và hành trình không gian văn học</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <label className="label">Tiêu đề tác phẩm <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input font-medium"
              required
            />
          </div>

          <div>
            <label className="label">Tác giả / Dị bản</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Thể loại văn học</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              {categories.length > 0 ? (
                categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))
              ) : (
                CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="label">Dân tộc</label>
            <select
              name="ethnicGroup"
              value={formData.ethnicGroup}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Chọn dân tộc --</option>
              {ethnicGroups.map((eg) => (
                <option key={eg._id} value={eg._id}>{eg.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Tóm tắt nội dung</label>
            <span className={`text-xs ${(formData.summary || '').length > 3800 ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              {(formData.summary || '').length} / 4.000 ký tự
            </span>
          </div>
          <textarea
            name="summary"
            rows="3"
            maxLength={4000}
            value={formData.summary}
            onChange={handleChange}
            className="input"
          ></textarea>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Nội dung chi tiết / Lời kể văn bản</label>
            <span className="text-xs text-gray-500 font-normal">Hỗ trợ dán trực tiếp từ Word hoặc tải lên file .docx</span>
          </div>
          <RichContentEditor
            value={formData.content}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, content: val }));
              markDirty();
            }}
          />
        </div>

        {/* ── ẢNH BÌA & THƯ VIỆN ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="label">Ảnh bìa tác phẩm</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP (tối đa 35MB)</p>
            {coverPreview && (
              <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-gray-200 w-full sm:w-48 shadow-sm">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="label">Thêm ảnh vào bộ sưu tập</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewGalleryChange}
              className="text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP (tối đa 35MB mỗi ảnh)</p>
            {newGalleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {newGalleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={preview} alt="New preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewGallery(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {existingGallery.length > 0 && (
          <div>
            <label className="label">Ảnh thư viện hiện có</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {existingGallery.map((img) => (
                <div key={img.publicId} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingGallery(img.publicId)}
                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TÍCH HỢP VIDEO ── */}
        <div className="p-4 sm:p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary text-white shadow-md shadow-primary/20">
                <VideoCameraIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Tích hợp Video / AI Visualization</h3>
                <p className="text-xs text-gray-600">Tải video mới (≤ 15 phút) hoặc nhúng link YouTube</p>
              </div>
            </div>

            <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 shadow-sm text-xs font-semibold">
              <button
                type="button"
                onClick={openNativeFilePicker}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  videoMode === 'file'
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                <span>Tải tệp từ máy</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('url')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  videoMode === 'url'
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Nhúng link URL</span>
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            onChange={handleVideoFileChange}
            className="hidden"
          />

          {videoMode === 'file' ? (
            <div className="space-y-3">
              {videoFile ? (
                <div className="p-3 bg-white rounded-xl border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 truncate max-w-xs">{videoFile.name}</p>
                      <p className="text-[11px] text-gray-500">Thời lượng: {formatDuration(videoDuration)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoFilePreview('');
                      setVideoDuration(0);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Hủy chọn
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openNativeFilePicker}
                  className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-center text-xs text-primary hover:bg-primary/5 transition-colors"
                >
                  Bấm để chọn tệp video từ máy tính (tối đa 15 phút, 150MB)
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="Nhập đường dẫn YouTube hoặc video MP4..."
                className="input"
              />
            </div>
          )}

          {existingVideos.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-900 block mb-2">Video hiện có ({existingVideos.length}):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {existingVideos.map((vid) => (
                  <div key={vid._id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${vid.type === 'ai-video' ? 'bg-primary/10 text-primary' : 'bg-secondary/15 text-secondary-800'}`}>
                        {vid.type === 'ai-video' ? 'AI Video' : 'Video thường'}
                      </span>
                      <span className="font-medium text-gray-800 truncate">{vid.title || 'Video tư liệu'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingVideo(vid._id)}
                      className="text-red-600 hover:text-red-800 font-semibold p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                      title="Xóa video này"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── HÀNH TRÌNH VĂN HỌC / DU HÀNH THỜI GIAN THEO DIỄN BIẾN TÁC PHẨM ── */}
        <div className="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                  Hành trình Di sản Văn học (Du hành Thời gian)
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Thiết lập các chặng địa danh theo diễn biến cốt truyện. Nhân vật Chibi sẽ di chuyển theo đúng thứ tự này trên bản đồ.
                </p>
              </div>
            </div>
          </div>

          {/* Chọn địa điểm để thêm vào hành trình */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 p-3 rounded-xl border border-amber-200">
            <select
              value={selectedLocationToAdd}
              onChange={(e) => setSelectedLocationToAdd(e.target.value)}
              className="input text-xs flex-1"
            >
              <option value="">-- Chọn địa điểm muốn thêm vào hành trình --</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.province})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddLocationToJourney}
              disabled={!selectedLocationToAdd}
              className="btn-primary text-xs py-2 px-3.5 flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Thêm chặng</span>
            </button>
          </div>

          {/* Danh sách các chặng đã thiết lập */}
          {journeyLocations.length === 0 ? (
            <p className="text-xs text-amber-800 italic py-2 text-center">
              Chưa có địa điểm nào trong hành trình. Hãy chọn địa điểm ở trên để thêm vào chặng.
            </p>
          ) : (
            <div className="space-y-3">
              {journeyLocations.map((item, index) => (
                <div
                  key={item.locationId}
                  className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-sm space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-500">({item.province})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveJourneyItem(index, -1)}
                        disabled={index === 0}
                        title="Di chuyển lên"
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveJourneyItem(index, 1)}
                        disabled={index === journeyLocations.length - 1}
                        title="Di chuyển xuống"
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveJourneyItem(index)}
                        title="Xóa chặng này"
                        className="p-1 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                        Vai trò diễn biến:
                      </label>
                      <select
                        value={item.role}
                        onChange={(e) => handleJourneyFieldChange(index, 'role', e.target.value)}
                        className="input text-xs py-1.5"
                      >
                        {JOURNEY_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                        Tiêu đề chặng:
                      </label>
                      <input
                        type="text"
                        value={item.journeyTitle}
                        onChange={(e) => handleJourneyFieldChange(index, 'journeyTitle', e.target.value)}
                        placeholder="Ví dụ: Khởi nguồn câu chuyện, Lời hẹn thề bên suối..."
                        className="input text-xs py-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Mô tả bối cảnh chặng này:
                    </label>
                    <textarea
                      rows="2"
                      value={item.journeyDescription}
                      onChange={(e) => handleJourneyFieldChange(index, 'journeyDescription', e.target.value)}
                      placeholder="Mô tả sự kiện diễn ra tại địa danh này trong tác phẩm..."
                      className="input text-xs py-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Link to="/admin/works" onClick={handleCancel} className="btn-ghost text-center text-xs sm:text-sm py-2.5">Hủy</Link>
          <button type="submit" disabled={saving} className="btn-primary text-xs sm:text-sm py-2.5">
            {saving ? 'Đang cập nhật...' : 'Cập nhật thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkEditPage;
