import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { workService } from '../../../services/work.service';
import { ethnicGroupService } from '../../../services/ethnicGroup.service';
import { locationService } from '../../../services/location.service';
import { CATEGORIES, STATUSES, VIDEO_TYPES } from '../../../constants';
import {
  ArrowLeftIcon,
  PhotoIcon,
  SparklesIcon,
  VideoCameraIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const WorkCreatePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [ethnicGroups, setEthnicGroups] = useState([]);
  const [locations, setLocations] = useState([]);
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
    relatedLocations: [],
  });

  // Video Upload mode: 'file' or 'url'
  const [videoMode, setVideoMode] = useState('file');
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoFilePreview, setVideoFilePreview] = useState('');

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [egRes, locRes] = await Promise.all([
          ethnicGroupService.getAll({ limit: 100 }),
          locationService.getAll({ limit: 100 }),
        ]);
        setEthnicGroups(egRes.data.data.ethnicGroups || []);
        setLocations(locRes.data.data.locations || []);
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

  const handleLocationsToggle = (locId) => {
    setFormData((prev) => {
      const exists = prev.relatedLocations.includes(locId);
      return {
        ...prev,
        relatedLocations: exists
          ? prev.relatedLocations.filter((id) => id !== locId)
          : [...prev.relatedLocations, locId],
      };
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGallery((prev) => [...prev, ...files]);
      const previews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveGallery = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🎬 Video File Validation & Duration Check (Max 15 minutes = 900 seconds)
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Check size limit (< 300MB)
    if (file.size > 300 * 1024 * 1024) {
      toast.error('Dung lượng video vượt quá 300MB. Vui lòng nén video trước khi tải lên.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Read metadata to validate duration <= 15 minutes (900 seconds)
    const previewUrl = URL.createObjectURL(file);
    const videoObj = document.createElement('video');
    videoObj.preload = 'metadata';

    const cleanUp = () => {
      videoObj.onloadedmetadata = null;
      videoObj.onerror = null;
    };

    videoObj.onloadedmetadata = () => {
      const durationSec = videoObj.duration;
      cleanUp();
      const MAX_DURATION = 15 * 60; // 900 seconds (15 minutes)

      if (durationSec > MAX_DURATION) {
        const mins = Math.floor(durationSec / 60);
        const secs = Math.floor(durationSec % 60);
        toast.error(
          `Video dài ${mins} phút ${secs} giây (vượt quá giới hạn 15 phút)! Vui lòng chọn hoặc cắt video dưới 15 phút để đảm bảo hiệu năng.`,
          { duration: 6000 }
        );
        setVideoFile(null);
        setVideoFilePreview('');
        setVideoDuration(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setVideoFile(file);
      setVideoDuration(durationSec);
      setVideoFilePreview(previewUrl);
      toast.success(`Đã chọn video: ${formatDuration(durationSec)} (Hợp lệ ≤ 15 phút)`);
    };

    videoObj.onerror = () => {
      cleanUp();
      setVideoFile(file);
      setVideoFilePreview(previewUrl);
      setVideoDuration(0);
      toast.success(`Đã chọn tệp: ${file.name}`);
    };

    videoObj.src = previewUrl;
  };

  const handleClearSelectedVideoFile = () => {
    setVideoFile(null);
    setVideoFilePreview('');
    setVideoDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openNativeFilePicker = () => {
    setVideoMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error('Vui lòng nhập tiêu đề tác phẩm.');
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('category', formData.category);
      data.append('summary', formData.summary);
      data.append('content', formData.content);
      data.append('status', formData.status);

      if (formData.ethnicGroup) data.append('ethnicGroup', formData.ethnicGroup);
      if (formData.relatedLocations.length > 0) {
        data.append('relatedLocations', JSON.stringify(formData.relatedLocations));
      }

      if (coverImage) data.append('coverImage', coverImage);
      gallery.forEach((img) => data.append('gallery', img));

      const res = await workService.create(data);
      const createdWorkId = res.data.data.work?._id;

      if (createdWorkId) {
        // Upload video file if provided
        if (videoMode === 'file' && videoFile) {
          try {
            toast.loading('Đang tải video lên hệ thống...', { id: 'upload-vid' });
            const vData = new FormData();
            vData.append('video', videoFile);
            vData.append('title', formData.videoTitle.trim() || `Video tác phẩm ${formData.title}`);
            vData.append('type', formData.videoType);
            await workService.addVideo(createdWorkId, vData);
            toast.success('Đã tải video lên thành công!', { id: 'upload-vid' });
          } catch (vidErr) {
            console.error('Failed to attach video file', vidErr);
          }
        } else if (videoMode === 'url' && formData.videoUrl.trim()) {
          try {
            await workService.addVideo(createdWorkId, {
              url: formData.videoUrl.trim(),
              title: formData.videoTitle.trim() || `Video tác phẩm ${formData.title}`,
              type: formData.videoType,
            });
          } catch (vidErr) {
            console.error('Failed to attach video URL', vidErr);
          }
        }
      }

      toast.success('Tạo tác phẩm thành công!');
      navigate('/admin/works');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tác phẩm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl font-sans">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/admin/works" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0 shadow-sm">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-800">Thêm Tác Phẩm Văn Học Mới</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Nhập nội dung, thể loại và đa phương tiện cho tác phẩm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-8 space-y-4 sm:space-y-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="label">Tiêu đề tác phẩm <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: Chiếc khăn Piêu, Sử thi Đam San..."
              className="input"
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
              placeholder="Ví dụ: Dân gian, Doãn Nho sưu tầm..."
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Thể loại văn học</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
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
                <option key={eg._id} value={eg._id}>{eg.name} ({eg.region || 'VN'})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Tóm tắt tác phẩm</label>
          <textarea
            name="summary"
            rows="3"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Tóm tắt ngắn gọn cốt truyện, ý nghĩa biểu tượng..."
            className="input"
          ></textarea>
        </div>

        <div>
          <label className="label">Nội dung đầy đủ của tác phẩm</label>
          <textarea
            name="content"
            rows="8"
            value={formData.content}
            onChange={handleChange}
            placeholder="Nhập toàn bộ văn bản câu chuyện, bài thơ, lời ca dân gian..."
            className="input font-serif text-sm leading-relaxed"
          ></textarea>
        </div>

        {/* Cover image */}
        <div>
          <label className="label">Ảnh bìa tác phẩm</label>
          <div className="mt-1 flex items-center gap-4">
            {coverPreview ? (
              <img src={coverPreview} alt="Preview" className="w-20 h-24 rounded-xl object-cover border-2 border-primary shadow-sm" />
            ) : (
              <div className="w-20 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                <PhotoIcon className="w-8 h-8" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="label">Ảnh minh họa / Bộ sưu tập hình ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGalleryChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />

          {galleryPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryPreviews.map((preview, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
                  <img src={preview} alt="Gallery preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGallery(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 🎬 VIDEO / AI VISUALIZATION SECTION (WITH 15-MIN CHECK)   */}
        {/* ======================================================== */}
        <div className="p-6 bg-gradient-to-br from-purple-50 via-indigo-50/40 to-pink-50/30 rounded-3xl border border-purple-100 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
                <VideoCameraIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-purple-950">Tích hợp Video / AI Visualization</h3>
                <p className="text-xs text-purple-700">Tải tệp video trực tiếp từ máy (≤ 15 phút) hoặc nhúng link YouTube</p>
              </div>
            </div>

            {/* Switch Mode Buttons */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-purple-200 shadow-sm text-xs font-semibold">
              <button
                type="button"
                onClick={openNativeFilePicker}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  videoMode === 'file'
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
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
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Nhúng link URL</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input for Direct Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            onChange={handleVideoFileChange}
            className="hidden"
          />

          {/* Mode 1: Upload File directly with 15-minute validation */}
          {videoMode === 'file' ? (
            <div className="space-y-3">
              {!videoFile ? (
                /* Big Clickable Dropzone Area */
                <div
                  onClick={openNativeFilePicker}
                  className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white/80 hover:bg-white rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 shadow-sm group hover:shadow-md"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 group-hover:bg-purple-200 text-purple-600 flex items-center justify-center mb-3 transition-colors">
                    <ArrowUpTrayIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-bold text-sm text-purple-950 mb-1">
                    Bấm vào đây để chọn tệp Video từ máy tính
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mb-3 leading-relaxed">
                    Hỗ trợ định dạng MP4, WebM, MOV. Tự động kiểm tra thời lượng đảm bảo không vượt quá giới hạn hệ thống.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                    <ClockIcon className="w-4 h-4" />
                    <span>Giới hạn tối đa: 15 phút (900 giây) • Dung lượng &lt; 300MB</span>
                  </div>
                </div>
              ) : (
                /* Selected Video Preview Card */
                <div className="p-4 bg-white rounded-2xl border border-purple-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Đã chọn video hợp lệ:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openNativeFilePicker}
                        className="text-xs text-purple-700 hover:text-purple-900 font-semibold px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                      >
                        Đổi video khác
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelectedVideoFile}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <p className="font-bold text-gray-800 truncate">{videoFile.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Dung lượng: {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{formatDuration(videoDuration)} / 15:00</span>
                      </span>
                    </div>
                  </div>

                  {/* Video Player Preview */}
                  {videoFilePreview && (
                    <div className="rounded-xl overflow-hidden bg-black max-h-56">
                      <video src={videoFilePreview} controls className="w-full max-h-56 object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: URL embed */
            <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-2">
              <label className="label text-xs font-bold text-gray-800">Đường dẫn Video URL (YouTube hoặc MP4 trực tuyến)</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=... hoặc link video MP4"
                className="input text-sm"
              />
              <p className="text-[11px] text-gray-500">
                Nhập link YouTube để tự động nhúng trình phát video trực quan cho người đọc.
              </p>
            </div>
          )}

          {/* Video Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="sm:col-span-2">
              <label className="label text-xs">Tiêu đề video</label>
              <input
                type="text"
                name="videoTitle"
                value={formData.videoTitle}
                onChange={handleChange}
                placeholder="Ví dụ: Tái hiện cảnh săn bắt voi rừng - AI animation"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label text-xs">Phân loại video</label>
              <select
                name="videoType"
                value={formData.videoType}
                onChange={handleChange}
                className="input text-sm"
              >
                {VIDEO_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>{vt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Related Locations */}
        {locations.length > 0 && (
          <div>
            <label className="label">Địa danh liên quan trên bản đồ</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50">
              {locations.map((loc) => (
                <label key={loc._id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1.5 rounded hover:bg-white">
                  <input
                    type="checkbox"
                    checked={formData.relatedLocations.includes(loc._id)}
                    onChange={() => handleLocationsToggle(loc._id)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="truncate">{loc.name} ({loc.province})</span>
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

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100">
          <Link to="/admin/works" className="btn-ghost text-center text-xs sm:text-sm py-2.5">Hủy</Link>
          <button type="submit" disabled={loading} className="btn-primary text-xs sm:text-sm py-2.5">
            {loading ? 'Đang lưu...' : 'Lưu tác phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkCreatePage;
