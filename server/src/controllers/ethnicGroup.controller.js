const EthnicGroup = require('../models/EthnicGroup');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');
const { uploadFile, deleteFile } = require('../utils/cloudinary.util');
const { generateSlug } = require('../utils/slug.util');

// GET /api/ethnic-groups
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip, search, sort } = parseQueryParams(req.query);
  const isAdmin = req.user?.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.status = 'published';
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (req.query.region) filter.region = { $regex: req.query.region, $options: 'i' };

  const [ethnicGroups, total] = await Promise.all([
    EthnicGroup.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    EthnicGroup.countDocuments(filter),
  ]);

  if (ethnicGroups.length > 0) {
    const egIds = ethnicGroups.map((eg) => eg._id);
    const [workCounts, locCounts] = await Promise.all([
      Work.aggregate([
        { $match: { ethnicGroup: { $in: egIds } } },
        { $group: { _id: '$ethnicGroup', count: { $sum: 1 } } },
      ]),
      Location.aggregate([
        { $match: { ethnicGroup: { $in: egIds } } },
        { $group: { _id: '$ethnicGroup', count: { $sum: 1 } } },
      ]),
    ]);

    const workMap = Object.fromEntries(workCounts.map((w) => [w._id.toString(), w.count]));
    const locMap = Object.fromEntries(locCounts.map((l) => [l._id.toString(), l.count]));

    ethnicGroups.forEach((eg) => {
      eg.workCount = workMap[eg._id.toString()] || 0;
      eg.locationCount = locMap[eg._id.toString()] || 0;
    });
  }

  res.json({ success: true, data: { ethnicGroups, pagination: paginate(total, page, limit) } });
});

// GET /api/ethnic-groups/:slug  (public by slug)
const getBySlug = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = { slug: req.params.slug };
  if (!isAdmin) filter.status = 'published';
  const ethnicGroup = await EthnicGroup.findOne(filter);
  if (!ethnicGroup) return res.status(404).json({ success: false, message: 'Dân tộc không tồn tại.' });
  res.json({ success: true, data: { ethnicGroup } });
});

// GET /api/ethnic-groups/id/:id  (admin)
const getById = asyncHandler(async (req, res) => {
  const ethnicGroup = await EthnicGroup.findById(req.params.id);
  if (!ethnicGroup) return res.status(404).json({ success: false, message: 'Dân tộc không tồn tại.' });
  res.json({ success: true, data: { ethnicGroup } });
});

// POST /api/ethnic-groups  (admin)
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, slug: generateSlug(req.body.name) };

  if (req.files?.thumbnail?.[0]) {
    data.thumbnail = await uploadFile(req.files.thumbnail[0].path, 'disanvanhoc/ethnic-groups');
  }
  if (req.files?.coverImage?.[0]) {
    data.coverImage = await uploadFile(req.files.coverImage[0].path, 'disanvanhoc/ethnic-groups');
  }

  const ethnicGroup = await EthnicGroup.create(data);
  res.status(201).json({ success: true, message: 'Tạo dân tộc thành công.', data: { ethnicGroup } });
});

// PUT /api/ethnic-groups/:id  (admin)
const update = asyncHandler(async (req, res) => {
  const ethnicGroup = await EthnicGroup.findById(req.params.id);
  if (!ethnicGroup) return res.status(404).json({ success: false, message: 'Dân tộc không tồn tại.' });

  const data = { ...req.body };
  if (data.name && data.name !== ethnicGroup.name) data.slug = generateSlug(data.name);

  if (req.files?.thumbnail?.[0]) {
    if (ethnicGroup.thumbnail?.publicId) await deleteFile(ethnicGroup.thumbnail.publicId);
    data.thumbnail = await uploadFile(req.files.thumbnail[0].path, 'disanvanhoc/ethnic-groups');
  }
  if (req.files?.coverImage?.[0]) {
    if (ethnicGroup.coverImage?.publicId) await deleteFile(ethnicGroup.coverImage.publicId);
    data.coverImage = await uploadFile(req.files.coverImage[0].path, 'disanvanhoc/ethnic-groups');
  }

  const updated = await EthnicGroup.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  res.json({ success: true, message: 'Cập nhật thành công.', data: { ethnicGroup: updated } });
});

const Work = require('../models/Work');
const Location = require('../models/Location');

// DELETE /api/ethnic-groups/:id  (admin)
// Supports ?action=restrict (default) | nullify | cascade
const remove = asyncHandler(async (req, res) => {
  const ethnicGroup = await EthnicGroup.findById(req.params.id);
  if (!ethnicGroup) return res.status(404).json({ success: false, message: 'Dân tộc không tồn tại.' });

  const { action = 'restrict' } = req.query; // 'restrict', 'nullify', 'cascade'

  const [workCount, locationCount] = await Promise.all([
    Work.countDocuments({ ethnicGroup: ethnicGroup._id }),
    Location.countDocuments({ ethnicGroup: ethnicGroup._id }),
  ]);

  // If there are dependencies and action is restrict (default)
  if ((workCount > 0 || locationCount > 0) && action === 'restrict') {
    return res.status(400).json({
      success: false,
      hasDependencies: true,
      workCount,
      locationCount,
      message: `Không thể xóa trực tiếp: Dân tộc "${ethnicGroup.name}" đang có ${workCount} tác phẩm và ${locationCount} địa điểm trực thuộc. Vui lòng chọn cách xử lý liên kết.`,
    });
  }

  // Handle Cascade delete: delete all associated works, locations & their files
  if (action === 'cascade') {
    const [relatedWorks, relatedLocations] = await Promise.all([
      Work.find({ ethnicGroup: ethnicGroup._id }),
      Location.find({ ethnicGroup: ethnicGroup._id }),
    ]);

    // Clean up work files
    for (const w of relatedWorks) {
      if (w.coverImage?.publicId) await deleteFile(w.coverImage.publicId, 'image');
      for (const img of w.gallery || []) await deleteFile(img.publicId, 'image');
      for (const vid of w.videos || []) {
        if (vid.resourceType !== 'external') await deleteFile(vid.publicId, 'video');
      }
      await Location.updateMany({ relatedWorks: w._id }, { $pull: { relatedWorks: w._id } });
    }

    // Clean up location files
    for (const l of relatedLocations) {
      for (const img of l.images || []) await deleteFile(img.publicId, 'image');
      for (const vid of l.videos || []) {
        if (vid.resourceType !== 'external') await deleteFile(vid.publicId, 'video');
      }
      await Work.updateMany({ relatedLocations: l._id }, { $pull: { relatedLocations: l._id } });
    }

    await Promise.all([
      Work.deleteMany({ ethnicGroup: ethnicGroup._id }),
      Location.deleteMany({ ethnicGroup: ethnicGroup._id }),
    ]);
  }

  // Handle Nullify: keep works & locations, just detach ethnicGroup reference
  if (action === 'nullify') {
    await Promise.all([
      Work.updateMany({ ethnicGroup: ethnicGroup._id }, { $unset: { ethnicGroup: "" } }),
      Location.updateMany({ ethnicGroup: ethnicGroup._id }, { $unset: { ethnicGroup: "" } }),
    ]);
  }

  // Delete ethnic group images
  if (ethnicGroup.thumbnail?.publicId) await deleteFile(ethnicGroup.thumbnail.publicId);
  if (ethnicGroup.coverImage?.publicId) await deleteFile(ethnicGroup.coverImage.publicId);

  await ethnicGroup.deleteOne();

  res.json({
    success: true,
    message: action === 'cascade'
      ? `Đã xóa dân tộc "${ethnicGroup.name}" cùng ${workCount} tác phẩm và ${locationCount} địa điểm liên quan.`
      : action === 'nullify'
      ? `Đã xóa dân tộc "${ethnicGroup.name}" và ngắt liên kết an toàn cho ${workCount} tác phẩm, ${locationCount} địa điểm.`
      : `Đã xóa dân tộc "${ethnicGroup.name}".`,
  });
});

module.exports = { getAll, getBySlug, getById, create, update, remove };
