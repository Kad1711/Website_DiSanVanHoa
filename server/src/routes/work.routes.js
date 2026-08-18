const express = require('express');
const { body } = require('express-validator');
const {
  getAll, getBySlug, getById, create, update, remove,
  addVideo, removeVideo, removeGalleryImage,
  toggleLike, addComment, deleteComment,
} = require('../controllers/work.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadImage, uploadVideo } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

const workValidation = [
  body('title').trim().notEmpty().withMessage('Tiêu đề tác phẩm là bắt buộc.'),
  body('category').optional().isIn(['tho','truyen-ngan','su-thi','dan-ca','truyen-thuyet','khac'])
    .withMessage('Thể loại không hợp lệ.'),
];

// Public / Auth-Aware
router.get('/', optionalAuth, getAll);
router.get('/slug/:slug', optionalAuth, getBySlug);

// User/Admin Interaction: Like & Comment
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Admin Management
router.get('/id/:id', protect, authorize('admin'), getById);
router.post('/',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]),
  workValidation, validate, create
);
router.put('/:id',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]),
  workValidation, validate, update
);
router.delete('/:id', protect, authorize('admin'), remove);
router.post('/:id/videos', protect, authorize('admin'), uploadVideo.single('video'), addVideo);
router.delete('/:id/videos/:videoId', protect, authorize('admin'), removeVideo);
router.delete('/:id/gallery', protect, authorize('admin'), removeGalleryImage);

module.exports = router;
