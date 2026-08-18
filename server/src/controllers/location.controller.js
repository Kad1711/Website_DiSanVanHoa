const Location = require('../models/Location');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');
const { uploadFile, deleteFile } = require('../utils/cloudinary.util');
const { generateSlug } = require('../utils/slug.util');

const populateOptions = [
  { path: 'ethnicGroup', select: 'name slug thumbnail region' },
  { path: 'relatedWorks', select: 'title slug coverImage summary author category' },
];

// GET /api/locations
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip, search, sort } = parseQueryParams(req.query);
  const isAdmin = req.user?.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.status = 'published';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { province: { $regex: search, $options: 'i' } },
  ];
  if (req.query.ethnicGroup) filter.ethnicGroup = req.query.ethnicGroup;
  if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
  if (req.query.status && isAdmin) filter.status = req.query.status;

  const [locations, total] = await Promise.all([
    Location.find(filter).populate(populateOptions).sort(sort).skip(skip).limit(limit),
    Location.countDocuments(filter),
  ]);
  res.json({ success: true, data: { locations, pagination: paginate(total, page, limit) } });
});

// GET /api/locations/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = { slug: req.params.slug };
  if (!isAdmin) filter.status = 'published';
  const location = await Location.findOne(filter).populate(populateOptions);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });
  res.json({ success: true, data: { location } });
});

// GET /api/locations/id/:id  (admin)
const getById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id).populate(populateOptions);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });
  res.json({ success: true, data: { location } });
});

// POST /api/locations  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id, slug: generateSlug(req.body.name) };

  // Parse coordinates from flat lat/lng fields
  if (req.body.lat && req.body.lng) {
    data.coordinates = { lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng) };
    delete data.lat; delete data.lng;
  }

  // Parse relatedWorks JSON string
  if (typeof data.relatedWorks === 'string') {
    try { data.relatedWorks = JSON.parse(data.relatedWorks); } catch { data.relatedWorks = []; }
  }

  // Upload images
  if (req.files?.images?.length) {
    data.images = [];
    for (const file of req.files.images) {
      const meta = await uploadFile(file.path, 'disanvanhoc/locations', 'image');
      data.images.push(meta);
    }
  }

  const location = await Location.create(data);
  res.status(201).json({ success: true, message: 'Tạo địa điểm thành công.', data: { location } });
});

// PUT /api/locations/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  const data = { ...req.body };
  if (data.name && data.name !== location.name) data.slug = generateSlug(data.name);
  if (data.lat && data.lng) {
    data.coordinates = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
    delete data.lat; delete data.lng;
  }
  if (typeof data.relatedWorks === 'string') {
    try { data.relatedWorks = JSON.parse(data.relatedWorks); } catch { data.relatedWorks = []; }
  }

  // Append new images (keep existing)
  if (req.files?.images?.length) {
    const newImages = [];
    for (const file of req.files.images) {
      newImages.push(await uploadFile(file.path, 'disanvanhoc/locations', 'image'));
    }
    data.images = [...location.images, ...newImages];
  }

  const updated = await Location.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    .populate(populateOptions);
  res.json({ success: true, message: 'Cập nhật thành công.', data: { location: updated } });
});

const Work = require('../models/Work');

// DELETE /api/locations/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  // Clean up references in all related Works
  await Work.updateMany(
    { relatedLocations: location._id },
    { $pull: { relatedLocations: location._id } }
  );

  for (const img of location.images || []) await deleteFile(img.publicId, 'image');
  for (const vid of location.videos || []) {
    if (vid.resourceType !== 'external') await deleteFile(vid.publicId, 'video');
  }

  await location.deleteOne();
  res.json({ success: true, message: 'Đã xóa địa điểm và dọn dẹp liên kết tác phẩm liên quan.' });
});

// DELETE /api/locations/:id/images (remove single image)
const removeImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });
  await deleteFile(publicId, 'image');
  location.images = location.images.filter((img) => img.publicId !== publicId);
  await location.save();
  res.json({ success: true, message: 'Đã xóa ảnh.', data: { location } });
});

// POST /api/locations/:id/videos (add video)
const addVideo = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  let videoMeta;
  if (req.file) {
    const uploaded = await uploadFile(req.file.path, 'disanvanhoc/locations/videos', 'video');
    videoMeta = { ...uploaded, title: req.body.title || '', type: req.body.type || 'normal-video' };
  } else if (req.body.url) {
    videoMeta = { url: req.body.url, publicId: req.body.url, title: req.body.title || '', type: req.body.type || 'normal-video', resourceType: 'external' };
  } else {
    return res.status(400).json({ success: false, message: 'Cần file video hoặc URL.' });
  }

  location.videos.push(videoMeta);
  await location.save();
  res.json({ success: true, message: 'Đã thêm video.', data: { location } });
});

// DELETE /api/locations/:id/videos/:videoId
const removeVideo = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });
  const video = location.videos.id(req.params.videoId);
  if (video && video.resourceType !== 'external') await deleteFile(video.publicId, 'video');
  location.videos.pull(req.params.videoId);
  await location.save();
  res.json({ success: true, message: 'Đã xóa video.', data: { location } });
});

module.exports = { getAll, getBySlug, getById, create, update, remove, removeImage, addVideo, removeVideo };
