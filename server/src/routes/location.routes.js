const express = require('express');
const { body } = require('express-validator');
const {
  getAll, getBySlug, getById, create, update, remove,
  removeImage, addVideo, removeVideo,
} = require('../controllers/location.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadImage, uploadVideo } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

const locationValidation = [
  body('name').trim().notEmpty().withMessage('Tên địa điểm là bắt buộc.'),
  body('province').trim().notEmpty().withMessage('Tỉnh/thành phố là bắt buộc.'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ không hợp lệ.'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Kinh độ không hợp lệ.'),
];

// Public / Auth-Aware
router.get('/', optionalAuth, getAll);
router.get('/slug/:slug', optionalAuth, getBySlug);

// Admin
router.get('/id/:id', protect, authorize('admin'), getById);
router.post('/',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'images', maxCount: 10 }]),
  locationValidation, validate, create
);
router.put('/:id',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'images', maxCount: 10 }]),
  locationValidation, validate, update
);
router.delete('/:id', protect, authorize('admin'), remove);
router.delete('/:id/images', protect, authorize('admin'), removeImage);
router.post('/:id/videos', protect, authorize('admin'), uploadVideo.single('video'), addVideo);
router.delete('/:id/videos/:videoId', protect, authorize('admin'), removeVideo);

module.exports = router;
