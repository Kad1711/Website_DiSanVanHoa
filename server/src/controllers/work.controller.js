const Work = require('../models/Work');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');
const { uploadFile, deleteFile } = require('../utils/cloudinary.util');
const { generateSlug } = require('../utils/slug.util');

const populateOptions = [
  { path: 'ethnicGroup', select: 'name slug thumbnail region' },
  { path: 'relatedLocations', select: 'name slug province coordinates images shortDescription' },
  { path: 'comments.user', select: 'displayName name email role avatar' },
];

// GET /api/works
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip, search, sort } = parseQueryParams(req.query);
  const isAdmin = req.user?.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.status = 'published';
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { author: { $regex: search, $options: 'i' } },
  ];
  if (req.query.ethnicGroup) filter.ethnicGroup = req.query.ethnicGroup;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status && isAdmin) filter.status = req.query.status;

  const [works, total] = await Promise.all([
    Work.find(filter).populate(populateOptions).sort(sort).skip(skip).limit(limit),
    Work.countDocuments(filter),
  ]);
  res.json({ success: true, data: { works, pagination: paginate(total, page, limit) } });
});

// GET /api/works/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = { slug: req.params.slug };
  if (!isAdmin) filter.status = 'published';
  const work = await Work.findOne(filter).populate(populateOptions);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  const isLiked = req.user ? work.likes.some((id) => id.toString() === req.user._id.toString()) : false;
  const likesCount = work.likes ? work.likes.length : 0;

  res.json({ success: true, data: { work, isLiked, likesCount } });
});

// GET /api/works/id/:id  (admin)
const getById = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id).populate(populateOptions);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });
  res.json({ success: true, data: { work } });
});

// POST /api/works  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id, slug: generateSlug(req.body.title) };

  if (typeof data.relatedLocations === 'string') {
    try { data.relatedLocations = JSON.parse(data.relatedLocations); } catch { data.relatedLocations = []; }
  }

  if (req.files?.coverImage?.[0]) {
    data.coverImage = await uploadFile(req.files.coverImage[0].path, 'disanvanhoc/works', 'image');
  }
  if (req.files?.gallery?.length) {
    data.gallery = [];
    for (const file of req.files.gallery) {
      data.gallery.push(await uploadFile(file.path, 'disanvanhoc/works/gallery', 'image'));
    }
  }

  const work = await Work.create(data);
  res.status(201).json({ success: true, message: 'Tạo tác phẩm thành công.', data: { work } });
});

// PUT /api/works/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  const data = { ...req.body };
  if (data.title && data.title !== work.title) data.slug = generateSlug(data.title);
  if (typeof data.relatedLocations === 'string') {
    try { data.relatedLocations = JSON.parse(data.relatedLocations); } catch { data.relatedLocations = []; }
  }

  if (req.files?.coverImage?.[0]) {
    if (work.coverImage?.publicId) await deleteFile(work.coverImage.publicId, 'image');
    data.coverImage = await uploadFile(req.files.coverImage[0].path, 'disanvanhoc/works', 'image');
  }
  if (req.files?.gallery?.length) {
    const newImages = [];
    for (const file of req.files.gallery) {
      newImages.push(await uploadFile(file.path, 'disanvanhoc/works/gallery', 'image'));
    }
    data.gallery = [...work.gallery, ...newImages];
  }

  const updated = await Work.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    .populate(populateOptions);
  res.json({ success: true, message: 'Cập nhật thành công.', data: { work: updated } });
});

const Location = require('../models/Location');

// DELETE /api/works/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  // Clean up references in all related Locations
  await Location.updateMany(
    { relatedWorks: work._id },
    { $pull: { relatedWorks: work._id } }
  );

  if (work.coverImage?.publicId) await deleteFile(work.coverImage.publicId, 'image');
  for (const img of work.gallery || []) await deleteFile(img.publicId, 'image');
  for (const vid of work.videos || []) {
    if (vid.resourceType !== 'external') await deleteFile(vid.publicId, 'video');
  }

  await work.deleteOne();
  res.json({ success: true, message: 'Đã xóa tác phẩm và dọn dẹp liên kết địa danh liên quan.' });
});

// POST /api/works/:id/videos  (admin)
const addVideo = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  let videoMeta;
  if (req.file) {
    const uploaded = await uploadFile(req.file.path, 'disanvanhoc/works/videos', 'video');
    videoMeta = { ...uploaded, title: req.body.title || '', type: req.body.type || 'normal-video' };
  } else if (req.body.url) {
    videoMeta = { url: req.body.url, publicId: req.body.url, title: req.body.title || '', type: req.body.type || 'normal-video', resourceType: 'external' };
  } else {
    return res.status(400).json({ success: false, message: 'Cần file video hoặc URL.' });
  }

  work.videos.push(videoMeta);
  await work.save();
  res.json({ success: true, message: 'Đã thêm video.', data: { work } });
});

// DELETE /api/works/:id/videos/:videoId  (admin)
const removeVideo = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });
  const video = work.videos.id(req.params.videoId);
  if (video && video.resourceType !== 'external') await deleteFile(video.publicId, 'video');
  work.videos.pull(req.params.videoId);
  await work.save();
  res.json({ success: true, message: 'Đã xóa video.', data: { work } });
});

// DELETE /api/works/:id/gallery  (admin – remove single gallery image)
const removeGalleryImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });
  await deleteFile(publicId, 'image');
  work.gallery = work.gallery.filter((img) => img.publicId !== publicId);
  await work.save();
  res.json({ success: true, message: 'Đã xóa ảnh.', data: { work } });
});

// POST /api/works/:id/like  (protect – user/admin)
const toggleLike = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  const userId = req.user._id;
  const alreadyLikedIndex = work.likes.findIndex((id) => id.toString() === userId.toString());

  let isLiked = false;
  if (alreadyLikedIndex > -1) {
    // Unlike
    work.likes.splice(alreadyLikedIndex, 1);
    isLiked = false;
  } else {
    // Like
    work.likes.push(userId);
    isLiked = true;
  }

  await work.save();
  res.json({
    success: true,
    message: isLiked ? 'Đã thả tim yêu thích tác phẩm!' : 'Đã bỏ yêu thích.',
    data: { isLiked, likesCount: work.likes.length },
  });
});

// POST /api/works/:id/comments  (protect – user/admin)
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung bình luận.' });
  }

  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  const newComment = {
    user: req.user._id,
    content: content.trim(),
  };

  work.comments.unshift(newComment);
  await work.save();

  // Populate the newly saved comments
  await work.populate({ path: 'comments.user', select: 'displayName name email role avatar' });

  res.status(201).json({
    success: true,
    message: 'Đã gửi bình luận thành công!',
    data: { comments: work.comments },
  });
});

// DELETE /api/works/:id/comments/:commentId  (protect – owner or admin)
const deleteComment = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ success: false, message: 'Tác phẩm không tồn tại.' });

  const comment = work.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, message: 'Bình luận không tồn tại.' });

  const isOwner = comment.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này.' });
  }

  work.comments.pull(req.params.commentId);
  await work.save();
  await work.populate({ path: 'comments.user', select: 'displayName name email role avatar' });

  res.json({
    success: true,
    message: 'Đã xóa bình luận.',
    data: { comments: work.comments },
  });
});

module.exports = {
  getAll,
  getBySlug,
  getById,
  create,
  update,
  remove,
  addVideo,
  removeVideo,
  removeGalleryImage,
  toggleLike,
  addComment,
  deleteComment,
};
