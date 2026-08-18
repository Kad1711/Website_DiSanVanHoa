const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
