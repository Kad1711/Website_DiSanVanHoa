const express = require('express');
const { body } = require('express-validator');
const {
  getAll,
  getBySlug,
  getById,
  create,
  update,
  remove,
} = require('../controllers/category.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Tên thể loại là bắt buộc.'),
];

// Public / Auth-Aware
router.get('/', optionalAuth, getAll);
router.get('/slug/:slug', optionalAuth, getBySlug);

// Admin
router.get('/id/:id', protect, authorize('admin'), getById);
router.post('/', protect, authorize('admin'), categoryValidation, validate, create);
router.put('/:id', protect, authorize('admin'), categoryValidation, validate, update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
