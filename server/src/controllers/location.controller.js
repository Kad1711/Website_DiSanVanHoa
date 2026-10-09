const Location = require('../models/Location');
const WorkLocation = require('../models/WorkLocation');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');
const { uploadFile, deleteFile } = require('../utils/cloudinary.util');
const { generateSlug } = require('../utils/slug.util');
const {
  syncWorkLocationsForLocation,
  cleanupWorkLocationsForLocation,
} = require('../utils/workLocation.util');

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

// GET /api/locations/map
// Trả về danh sách địa điểm phục vụ Bản đồ Di sản Văn học (1 Location = 1 Marker)
const getMapLocations = asyncHandler(async (req, res) => {
  const includeAll = req.query.includeAll === 'true';
  const filter = { status: 'published' };
  if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
  if (req.query.ethnicGroup) filter.ethnicGroup = req.query.ethnicGroup;

  const locations = await Location.find(filter)
    .select('name slug province district address coordinates images videos shortDescription description ethnicGroup')
    .populate({ path: 'ethnicGroup', select: 'name slug thumbnail' })
    .lean();

  const locationIds = locations.map((loc) => loc._id);

  // Lấy các liên kết WorkLocation của các địa điểm này (chỉ lấy tác phẩm published)
  const relations = await WorkLocation.find({ location: { $in: locationIds } })
    .populate({
      path: 'work',
      match: { status: 'published' },
      select: 'title slug coverImage summary author category ethnicGroup',
      populate: { path: 'category', select: 'name slug icon color' },
    })
    .sort({ order: 1 })
    .lean();

  // Nhóm các tác phẩm theo từng địa điểm
  const worksByLocationMap = new Map();
  for (const rel of relations) {
    if (!rel.work) continue; // Bỏ qua nếu tác phẩm không tồn tại hoặc chưa publish
    const locKey = rel.location.toString();
    if (!worksByLocationMap.has(locKey)) {
      worksByLocationMap.set(locKey, []);
    }
    worksByLocationMap.get(locKey).push({
      _id: rel.work._id,
      title: rel.work.title,
      slug: rel.work.slug,
      author: rel.work.author,
      summary: rel.work.summary,
      coverImage: rel.work.coverImage,
      category: rel.work.category,
      order: rel.order,
      role: rel.role,
      journeyTitle: rel.journeyTitle,
      journeyDescription: rel.journeyDescription,
      media: rel.media,
    });
  }

  const result = [];
  for (const loc of locations) {
    const locWorks = worksByLocationMap.get(loc._id.toString()) || [];
    const hasWorks = locWorks.length > 0;

    // Theo nghiệp vụ cốt lõi: mặc định chỉ hiển thị Location có >= 1 Work
    if (!includeAll && !hasWorks) {
      continue;
    }

    result.push({
      _id: loc._id,
      name: loc.name,
      slug: loc.slug,
      province: loc.province,
      district: loc.district,
      address: loc.address,
      coordinates: loc.coordinates,
      images: loc.images,
      videos: loc.videos,
      shortDescription: loc.shortDescription,
      description: loc.description,
      ethnicGroup: loc.ethnicGroup,
      relatedWorks: locWorks,
      workCount: locWorks.length,
      hasWorks,
    });
  }

  res.json({
    success: true,
    data: {
      total: result.length,
      locations: result,
    },
  });
});

// GET /api/locations/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = { slug: req.params.slug };
  if (!isAdmin) filter.status = 'published';
  const location = await Location.findOne(filter).populate(populateOptions);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  const locationObj = location.toObject();
  const relations = await WorkLocation.find({ location: location._id })
    .populate({
      path: 'work',
      match: isAdmin ? {} : { status: 'published' },
      select: 'title slug coverImage summary author category ethnicGroup status',
      populate: { path: 'category', select: 'name slug icon color' },
    })
    .sort({ order: 1 })
    .lean();

  locationObj.relatedWorks = relations.map((r) => r.work).filter(Boolean);

  res.json({ success: true, data: { location: locationObj } });
});

// GET /api/locations/id/:id  (admin)
const getById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id).populate(populateOptions);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  const locationObj = location.toObject();
  const relations = await WorkLocation.find({ location: location._id })
    .populate({
      path: 'work',
      select: 'title slug coverImage summary author category ethnicGroup status',
      populate: { path: 'category', select: 'name slug icon color' },
    })
    .sort({ order: 1 })
    .lean();

  locationObj.relatedWorks = relations.map((r) => r.work).filter(Boolean);

  res.json({ success: true, data: { location: locationObj } });
});

// POST /api/locations  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id, slug: generateSlug(req.body.name) };

  // Parse coordinates from flat lat/lng fields
  if (req.body.lat && req.body.lng) {
    data.coordinates = { lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng) };
    delete data.lat; delete data.lng;
  }

  // Parse relatedWorks
  let rawWorks = null;
  if (data.relatedWorks) {
    rawWorks = typeof data.relatedWorks === 'string'
      ? (() => { try { return JSON.parse(data.relatedWorks); } catch { return []; } })()
      : data.relatedWorks;
  }
  delete data.relatedWorks;

  // Upload images
  if (req.files?.images?.length) {
    data.images = [];
    for (const file of req.files.images) {
      const meta = await uploadFile(file.path, 'disanvanhoc/locations', 'image');
      data.images.push(meta);
    }
  }

  const location = await Location.create(data);

  // Synchronize WorkLocation relations if relatedWorks provided
  if (rawWorks && Array.isArray(rawWorks)) {
    await syncWorkLocationsForLocation(location._id, rawWorks);
  }

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

  let rawWorks = undefined;
  if (data.relatedWorks !== undefined) {
    rawWorks = typeof data.relatedWorks === 'string'
      ? (() => { try { return JSON.parse(data.relatedWorks); } catch { return []; } })()
      : data.relatedWorks;
    delete data.relatedWorks;
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

  // Synchronize WorkLocation relations
  if (rawWorks !== undefined) {
    await syncWorkLocationsForLocation(location._id, rawWorks);
  }

  res.json({ success: true, message: 'Cập nhật thành công.', data: { location: updated } });
});

// DELETE /api/locations/:id  (admin)
const remove = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).json({ success: false, message: 'Địa điểm không tồn tại.' });

  // Clean up all WorkLocation relations and references
  await cleanupWorkLocationsForLocation(location._id);

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

module.exports = {
  getAll,
  getMapLocations,
  getBySlug,
  getById,
  create,
  update,
  remove,
  removeImage,
  addVideo,
  removeVideo,
};
