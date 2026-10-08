const User = require('../models/User');
const EthnicGroup = require('../models/EthnicGroup');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Work = require('../models/Work');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats  (admin)
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalEthnicGroups, totalLocations, totalCategories, totalWorks, recentWorks, recentLocations] =
    await Promise.all([
      User.countDocuments(),
      EthnicGroup.countDocuments(),
      Location.countDocuments(),
      Category.countDocuments(),
      Work.countDocuments(),
      Work.find().sort('-createdAt').limit(5).select('title status createdAt coverImage'),
      Location.find().sort('-createdAt').limit(5).select('name province status createdAt images'),
    ]);

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalEthnicGroups, totalLocations, totalCategories, totalWorks },
      recentWorks,
      recentLocations,
    },
  });
});

module.exports = { getStats };
