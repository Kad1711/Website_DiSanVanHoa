const express = require('express');
const { body } = require('express-validator');
const { getAll, getBySlug, getById, create, update, remove } = require('../controllers/ethnicGroup.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

const nameRequired = [body('name').trim().notEmpty().withMessage('Tên dân tộc là bắt buộc.')];

// Public / Auth-Aware
router.get('/', optionalAuth, getAll);
router.get('/slug/:slug', optionalAuth, getBySlug);

// Admin
router.get('/id/:id', protect, authorize('admin'), getById);
router.post('/',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  nameRequired, validate, create
);
router.put('/:id',
  protect, authorize('admin'),
  uploadImage.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  nameRequired, validate, update
);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
