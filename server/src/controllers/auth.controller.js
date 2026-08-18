const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { displayName, email, password } = req.body;
  // role is always forced to 'user' – never from client
  const user = await User.create({ displayName, email, password, role: 'user' });
  const token = generateToken(user._id);
  res.status(201).json({ success: true, message: 'Đăng ký thành công.', data: { user, token } });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
  }
  const token = generateToken(user._id);
  res.json({ success: true, message: 'Đăng nhập thành công.', data: { user, token } });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, getMe };
