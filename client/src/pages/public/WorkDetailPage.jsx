import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workService } from '../../services/work.service';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import {
  BookOpenIcon,
  MapPinIcon,
  SparklesIcon,
  VideoCameraIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  TagIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  TrashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartOutlineIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { CATEGORIES } from '../../constants';
import toast from 'react-hot-toast';

const WorkDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Guest Prompt Modal
  const [showGuestModal, setShowGuestModal] = useState(false);

  const fetchWork = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workService.getBySlug(slug);
      const data = res.data.data;
      setWork(data.work);
      setIsLiked(data.isLiked || false);
      setLikesCount(data.likesCount || data.work?.likes?.length || 0);
      setComments(data.work?.comments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin tác phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
    window.scrollTo(0, 0);
  }, [slug]);

  // ❤️ Handle Like / Unlike
  const handleToggleLike = async () => {
    if (!user) {
      setShowGuestModal(true);
      return;
    }

    if (liking || !work?._id) return;
    try {
      setLiking(true);
      const res = await workService.toggleLike(work._id);
      const { isLiked: newIsLiked, likesCount: newLikesCount } = res.data.data;
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      if (newIsLiked) {
        toast.success('❤️ Đã thả tim yêu thích tác phẩm!');
      } else {
        toast('Đã bỏ yêu thích.', { icon: '🤍' });
      }
    } catch (err) {
      toast.error('Không thể thực hiện thao tác.');
    } finally {
      setLiking(false);
    }
  };

  // 💬 Handle Submit Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowGuestModal(true);
      return;
    }

    if (!commentContent.trim()) {
      return toast.error('Vui lòng nhập nội dung bình luận.');
    }

    try {
      setSubmittingComment(true);
      const res = await workService.addComment(work._id, { content: commentContent });
      setComments(res.data.data.comments || []);
      setCommentContent('');
      toast.success('Đã gửi bình luận của bạn!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 🗑️ Handle Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    try {
      const res = await workService.deleteComment(work._id, commentId);
      setComments(res.data.data.comments || []);
      toast.success('Đã xóa bình luận.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa bình luận.');
    }
  };

  if (loading) return <Loading fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchWork} />;
  if (!work) return <ErrorState message="Tác phẩm không tồn tại." />;

  const categoryObj = CATEGORIES.find((c) => c.value === work.category);
  const categoryLabel = categoryObj?.label || work.category || 'Văn học dân gian';

  return (
    <div className="bg-cream min-h-screen pb-20 font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container-lg flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/works" className="hover:text-primary transition-colors">Tác phẩm</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-md">{work.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-primary-950 to-gray-900 text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Cover image */}
            <div className="w-full sm:w-64 lg:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-800 flex-shrink-0 border-2 border-white/20 relative group">
              {work.coverImage?.url ? (
                <img
                  src={work.coverImage.url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary-800 to-primary-950">
                  <BookOpenIcon className="w-16 h-16 text-amber-300/60 mb-2" />
                  <span className="font-serif text-2xl font-bold text-white/80">{work.title}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-4">
                <span className="badge bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs px-3 py-1 font-semibold">
                  {categoryLabel}
                </span>
                {work.ethnicGroup && (
                  <Link
                    to={`/ethnic-groups/${work.ethnicGroup.slug}`}
                    className="badge bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-1 font-medium transition-colors"
                  >
                    Dân tộc {work.ethnicGroup.name}
                  </Link>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                {work.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-300 mb-6">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span>Tác giả: <strong>{work.author || 'Dân gian'}</strong></span>
                </div>
                {work.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-amber-400" />
                    <span>Lưu trữ: {new Date(work.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              {work.summary && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-3xl text-sm sm:text-base text-gray-200 leading-relaxed font-light italic mb-6">
                  "{work.summary}"
                </div>
              )}

              {/* Action Buttons: Like & Jump to Comments */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={liking}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-lg cursor-pointer ${
                    isLiked
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/40 ring-4 ring-rose-600/20 scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur'
                  }`}
                  title={user ? (isLiked ? 'Bỏ thích' : 'Thả tim yêu thích') : 'Đăng nhập để thả tim'}
                >
                  {isLiked ? (
                    <HeartIcon className="w-5 h-5 text-white animate-bounce" />
                  ) : (
                    <HeartOutlineIcon className="w-5 h-5 text-rose-300" />
                  )}
                  <span>{likesCount} Yêu thích</span>
                </button>

                {/* Jump to comments */}
                <a
                  href="#comments-section"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-amber-300" />
                  <span>{comments.length} Bình luận</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-lg mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Reading Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Story / Content Reading Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2 text-primary font-serif font-bold text-lg">
                  <BookOpenIcon className="w-5 h-5 text-secondary" />
                  <span>Nội Dung Tác Phẩm</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isLiked ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 ${isLiked ? 'text-rose-600' : 'text-gray-400'}`} />
                  <span>{isLiked ? 'Đã yêu thích' : 'Thả tim'}</span>
                </button>
              </div>

              {work.content ? (
                <div className="prose prose-stone max-w-none text-gray-800 leading-relaxed font-serif text-base sm:text-lg whitespace-pre-line">
                  {work.content}
                </div>
              ) : (
                <p className="text-gray-500 italic py-8 text-center">Nội dung chi tiết của tác phẩm đang được cập nhật và biên tập thêm.</p>
              )}
            </div>

            {/* Video Player Section */}
            {work.videos && work.videos.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-800 mb-6">
                  <VideoCameraIcon className="w-6 h-6 text-red-500" />
                  <span>Tái Hiện Đa Phương Tiện & AI Video</span>
                </div>

                <div className="space-y-6">
                  {work.videos.map((vid, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <div className="p-3 bg-gray-900 text-white flex items-center justify-between">
                        <span className="text-sm font-medium">{vid.title || `Video minh họa #${idx + 1}`}</span>
                        {vid.type === 'ai-video' && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                            <SparklesIcon className="w-3.5 h-3.5" /> AI Visualized
                          </span>
                        )}
                      </div>
                      <div className="aspect-video w-full bg-black">
                        {vid.url?.includes('youtube.com') || vid.url?.includes('youtu.be') ? (
                          <iframe
                            src={vid.url.replace('watch?v=', 'embed/')}
                            title={vid.title}
                            className="w-full h-full"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video
                            src={vid.url}
                            controls
                            className="w-full h-full object-contain"
                            poster={work.coverImage?.url}
                          >
                            Trình duyệt của bạn không hỗ trợ phát video.
                          </video>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {work.gallery && work.gallery.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-800 mb-6">
                  <PhotoIcon className="w-6 h-6 text-secondary" />
                  <span>Bộ Sưu Tập Hình Ảnh Di Sản</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {work.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group relative shadow-sm border border-gray-200"
                    >
                      <img
                        src={img.url}
                        alt={`Ảnh minh họa ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 💬 COMMENTS & DISCUSSIONS SECTION                         */}
            {/* ======================================================== */}
            <div id="comments-section" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    Bình Luận & Cảm Nhận Độc Giả ({comments.length})
                  </h3>
                </div>
              </div>

              {/* Case 1: Logged In -> Active Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {((user.displayName || user.name || user.email || 'U')[0]).toUpperCase()}
                    </div>
                    <span>
                      Đang bình luận dưới tên:{' '}
                      <strong className="text-gray-900 font-bold">
                        {user.displayName || user.name || user.email?.split('@')[0]}
                      </strong>
                    </span>
                    {user.role === 'admin' && (
                      <span className="badge bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 font-bold">
                        Quản trị viên
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      rows="3"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ suy nghĩ, cảm nhận hoặc góc nhìn của bạn về tác phẩm này..."
                      className="input py-3 px-4 text-sm resize-none rounded-2xl"
                      maxLength={1000}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>{submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Case 2: Guest Mode -> Prompt to Login */
                <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-earth mx-auto flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Bạn đang ở chế độ Khách</h4>
                    <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                      Vui lòng <strong>Đăng nhập</strong> hoặc <strong>Đăng ký tài khoản</strong> để thả tim yêu thích và tham gia bình luận, chia sẻ cảm nhận về tác phẩm di sản này.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <Link to="/login" className="btn-primary py-2 px-5 text-xs rounded-xl font-bold">
                      Đăng nhập ngay
                    </Link>
                    <Link to="/register" className="btn-outline py-2 px-5 text-xs rounded-xl font-bold">
                      Tạo tài khoản mới
                    </Link>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-xs italic">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận về tác phẩm này!
                  </p>
                ) : (
                  comments.map((cmt) => {
                    const authorName =
                      cmt.user?.displayName ||
                      cmt.user?.name ||
                      (cmt.user?.email ? cmt.user.email.split('@')[0] : 'Bạn đọc');
                    const authorInitial = (authorName?.[0] || 'U').toUpperCase();

                    const isAuthor = user && (cmt.user?._id === user._id || cmt.user === user._id);
                    const canDelete = isAuthor || isAdmin;

                    return (
                      <div
                        key={cmt._id}
                        className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {authorInitial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-gray-900">{authorName}</span>
                                {cmt.user?.role === 'admin' && (
                                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                                    Quản trị viên
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {new Date(cmt.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(cmt._id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
                              title="Xóa bình luận"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line pl-10">
                          {cmt.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="space-y-6">
            {/* Ethnic Group Card */}
            {work.ethnicGroup && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-serif font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-secondary" />
                  Dân Tộc Gốc
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  {work.ethnicGroup.thumbnail?.url ? (
                    <img
                      src={work.ethnicGroup.thumbnail.url}
                      alt={work.ethnicGroup.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-earth flex items-center justify-center font-bold text-xl">
                      {work.ethnicGroup.name[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{work.ethnicGroup.name}</h4>
                    <p className="text-xs text-gray-500">{work.ethnicGroup.region || 'Việt Nam'}</p>
                  </div>
                </div>
                {work.ethnicGroup.cultureSummary && (
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {work.ethnicGroup.cultureSummary}
                  </p>
                )}
                <Link
                  to={`/ethnic-groups/${work.ethnicGroup.slug}`}
                  className="w-full btn-outline py-2 text-xs rounded-xl flex justify-center"
                >
                  Tìm hiểu văn hóa dân tộc {work.ethnicGroup.name}
                </Link>
              </div>
            )}

            {/* Associated Geographic Locations */}
            {work.relatedLocations && work.relatedLocations.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-serif font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-earth" />
                  Địa Danh Gắn Liền
                </h3>
                <div className="space-y-3">
                  {work.relatedLocations.map((loc) => (
                    <Link
                      to={`/locations/${loc.slug}`}
                      key={loc._id}
                      className="p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100 flex items-start gap-3 transition-colors group block"
                    >
                      <div className="p-2 rounded-xl bg-earth text-white mt-0.5">
                        <MapPinIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-earth transition-colors truncate">
                          {loc.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">{loc.province}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/map"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                >
                  Xem trên bản đồ vệ tinh →
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <Link
                to="/works"
                className="w-full btn-ghost border border-gray-200 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Quay lại danh sách tác phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Login Required Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <HeartIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Yêu cầu đăng nhập</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Bạn cần đăng nhập tài khoản để thả tim yêu thích và tham gia bình luận tác phẩm này.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                className="w-full btn-primary py-2.5 text-xs rounded-xl font-bold block"
              >
                Đăng nhập ngay
              </Link>
              <Link
                to="/register"
                className="w-full btn-outline py-2.5 text-xs rounded-xl font-bold block"
              >
                Đăng ký tài khoản
              </Link>
              <button
                type="button"
                onClick={() => setShowGuestModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 pt-1 cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} alt="Phóng to ảnh" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDetailPage;
