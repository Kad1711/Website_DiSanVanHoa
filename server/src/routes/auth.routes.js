const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/register',
  [
    body('displayName').trim().notEmpty().withMessage('Tên hiển thị là bắt buộc.'),
    body('email').isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự.'),
  ],
  validate, register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc.'),
  ],
  validate, login
);

router.get('/me', protect, getMe);

module.exports = router;
