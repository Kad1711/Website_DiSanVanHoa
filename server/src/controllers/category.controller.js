const Category = require('../models/Category');
const Work = require('../models/Work');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');
const { generateSlug } = require('../utils/slug.util');

// GET /api/categories
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip, search, sort } = parseQueryParams(req.query);
  const isAdmin = req.user?.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.status = 'published';
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [categories, total] = await Promise.all([
    Category.find(filter).sort(sort || { createdAt: -1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  if (categories.length > 0) {
    const catIds = categories.map((c) => c._id);
    const workCounts = await Work.aggregate([
      { $match: { category: { $in: catIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const workMap = Object.fromEntries(workCounts.map((w) => [w._id.toString(), w.count]));
    categories.forEach((c) => {
      c.workCount = workMap[c._id.toString()] || 0;
    });
  }

  res.json({ success: true, data: { categories, pagination: paginate(total, page, limit) } });
});

// GET /api/categories/slug/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = { slug: req.params.slug };
  if (!isAdmin) filter.status = 'published';

  const category = await Category.findOne(filter).lean();
  if (!category) {
    return res.status(404).json({ success: false, message: 'Thể loại không tồn tại.' });
  }

  const workCount = await Work.countDocuments({ category: category._id, ...(isAdmin ? {} : { status: 'published' }) });
  category.workCount = workCount;

  res.json({ success: true, data: { category } });
});

// GET /api/categories/id/:id (admin)
const getById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Thể loại không tồn tại.' });
  }
  res.json({ success: true, data: { category } });
});

// POST /api/categories (admin)
const create = asyncHandler(async (req, res) => {
  const { name, description, icon, color, status } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Tên thể loại là bắt buộc.' });
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Tên thể loại này đã tồn tại.' });
  }

  const slug = generateSlug(name.trim());
  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description || '',
    icon: icon || '📚',
    color: color || '#ea580c',
    status: status || 'published',
  });

  res.status(201).json({ success: true, message: 'Tạo thể loại thành công.', data: { category } });
});

// PUT /api/categories/:id (admin)
const update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Thể loại không tồn tại.' });
  }

  const { name, description, icon, color, status } = req.body;
  if (name && name.trim() !== category.name) {
    const existing = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên thể loại này đã tồn tại.' });
    }
    category.name = name.trim();
    category.slug = generateSlug(name.trim());
  }

  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (color !== undefined) category.color = color;
  if (status !== undefined) category.status = status;

  await category.save();
  res.json({ success: true, message: 'Cập nhật thể loại thành công.', data: { category } });
});

// DELETE /api/categories/:id (admin)
const remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Thể loại không tồn tại.' });
  }

  // Gỡ bỏ liên kết tác phẩm với category này
  await Work.updateMany({ category: category._id }, { $unset: { category: 1 } });
  await category.deleteOne();

  res.json({ success: true, message: 'Đã xóa thể loại thành công.' });
});

module.exports = {
  getAll,
  getBySlug,
  getById,
  create,
  update,
  remove,
};
