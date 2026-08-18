const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, parseQueryParams } = require('../utils/pagination');

// GET /api/users  (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, search, sort } = parseQueryParams(req.query);
  const filter = {};
  if (search) {
    filter.$or = [
      { displayName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: { users, pagination: paginate(total, page, limit) } });
});

// GET /api/users/:id  (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
  res.json({ success: true, data: { user } });
});

// DELETE /api/users/:id  (admin)
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
  res.json({ success: true, message: 'Đã xóa người dùng.' });
});

module.exports = { getAllUsers, getUserById, deleteUser };
