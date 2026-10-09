const mongoose = require('mongoose');
const WorkLocation = require('../models/WorkLocation');
const Work = require('../models/Work');
const Location = require('../models/Location');
const MigrationLog = require('../models/MigrationLog');

/**
 * Synchronize WorkLocation relations when updating a Work.
 * incomingLocations can be:
 * 1. Array of rich journey objects: [{ location: ObjectId, order: Number, role: String, journeyTitle, journeyDescription, media }]
 * 2. Array of Location ID strings/ObjectIds: ['locId1', 'locId2']
 */
const syncWorkLocationsForWork = async (workId, incomingLocations = []) => {
  if (!mongoose.Types.ObjectId.isValid(workId)) return [];

  // Parse if string
  let list = incomingLocations;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch {
      list = [];
    }
  }
  if (!Array.isArray(list)) list = [];

  // Normalize incoming list and remove duplicates
  const seenLocs = new Set();
  const normalized = [];

  list.forEach((item, index) => {
    let locId = null;
    let order = index + 1;
    let role = index === 0 ? 'START' : 'DEVELOPMENT';
    let journeyTitle = '';
    let journeyDescription = '';
    let media = [];

    if (item && typeof item === 'object') {
      locId = item.location?._id || item.location || item._id;
      if (item.order !== undefined && item.order !== null) {
        const parsedOrder = parseInt(item.order, 10);
        if (!isNaN(parsedOrder) && parsedOrder > 0) order = parsedOrder;
      }
      if (item.role && ['START', 'DEVELOPMENT', 'CLIMAX', 'END', 'OTHER'].includes(item.role)) {
        role = item.role;
      }
      journeyTitle = (item.journeyTitle || '').trim();
      journeyDescription = (item.journeyDescription || '').trim();
      if (Array.isArray(item.media)) media = item.media;
    } else if (typeof item === 'string' && mongoose.Types.ObjectId.isValid(item)) {
      locId = item;
    }

    if (locId && mongoose.Types.ObjectId.isValid(locId)) {
      const locStr = locId.toString();
      if (!seenLocs.has(locStr)) {
        seenLocs.add(locStr);
        normalized.push({
          work: workId,
          location: locId,
          order,
          role,
          journeyTitle,
          journeyDescription,
          media,
        });
      }
    }
  });

  // Find previously linked locations for this work
  const oldRelations = await WorkLocation.find({ work: workId }).select('location');
  const oldLocIds = oldRelations.map((r) => r.location.toString());
  const newLocIds = normalized.map((r) => r.location.toString());

  // Remove existing WorkLocations for this work
  await WorkLocation.deleteMany({ work: workId });

  // Insert new WorkLocations
  let createdWorkLocations = [];
  if (normalized.length > 0) {
    createdWorkLocations = await WorkLocation.insertMany(normalized);
  }

  return createdWorkLocations;
};

/**
 * Synchronize WorkLocation relations when updating a Location.
 * incomingWorkIds is an array of Work IDs: ['workId1', 'workId2']
 */
const syncWorkLocationsForLocation = async (locationId, incomingWorkIds = []) => {
  if (!mongoose.Types.ObjectId.isValid(locationId)) return [];

  let workIds = incomingWorkIds;
  if (typeof workIds === 'string') {
    try {
      workIds = JSON.parse(workIds);
    } catch {
      workIds = [];
    }
  }
  if (!Array.isArray(workIds)) workIds = [];

  const validWorkIds = Array.from(
    new Set(
      workIds
        .map((id) => (id?._id ? id._id.toString() : id?.toString()))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
    )
  );

  // Existing relations for this location
  const existingRelations = await WorkLocation.find({ location: locationId });
  const existingWorkIds = existingRelations.map((r) => r.work.toString());

  // Works to add
  const worksToAdd = validWorkIds.filter((wid) => !existingWorkIds.includes(wid));
  // Works to remove
  const worksToRemove = existingWorkIds.filter((wid) => !validWorkIds.includes(wid));

  // Remove unlinked relations directly from WorkLocation
  if (worksToRemove.length > 0) {
    await WorkLocation.deleteMany({ location: locationId, work: { $in: worksToRemove } });
  }

  // Add new relations into WorkLocation
  for (const wid of worksToAdd) {
    const existingCount = await WorkLocation.countDocuments({ work: wid });
    const order = existingCount + 1;
    await WorkLocation.create({
      work: wid,
      location: locationId,
      order,
      role: order === 1 ? 'START' : 'DEVELOPMENT',
      journeyTitle: '',
      journeyDescription: '',
    });
  }
};

/**
 * Cleanup when a Work is deleted
 */
const cleanupWorkLocationsForWork = async (workId) => {
  if (!workId) return;
  await WorkLocation.deleteMany({ work: workId });
};

/**
 * Cleanup when a Location is deleted
 */
const cleanupWorkLocationsForLocation = async (locationId) => {
  if (!locationId) return;
  await WorkLocation.deleteMany({ location: locationId });
};

/**
 * Auto-migration for legacy documents that have work.relatedLocations
 * but no corresponding WorkLocation records yet.
 */
const autoMigrateLegacyRelations = async () => {
  try {
    // 1. Kiểm tra nếu đã migrate trước đó thì bỏ qua ngay lập tức, không quét database
    const alreadyMigrated = await MigrationLog.findOne({ key: 'migrate_work_locations_v1' });
    if (alreadyMigrated) {
      return;
    }

    const works = await Work.find({
      relatedLocations: { $exists: true, $not: { $size: 0 } },
    }).select('_id relatedLocations');

    let migratedCount = 0;

    for (const work of works) {
      if (!Array.isArray(work.relatedLocations) || work.relatedLocations.length === 0) continue;

      let idx = 1;
      for (const locId of work.relatedLocations) {
        if (!locId || !mongoose.Types.ObjectId.isValid(locId)) continue;

        // Idempotent upsert/check
        const existing = await WorkLocation.findOne({ work: work._id, location: locId });
        if (!existing) {
          try {
            await WorkLocation.create({
              work: work._id,
              location: locId,
              order: idx,
              role: idx === 1 ? 'START' : 'DEVELOPMENT',
              journeyTitle: '',
              journeyDescription: '',
            });
            migratedCount++;
          } catch (e) {
            // Compound unique index prevents any duplicate
          }
        }
        idx++;
      }
    }

    // Đánh dấu migration hoàn tất
    await MigrationLog.create({
      key: 'migrate_work_locations_v1',
      description: 'Chuyển đổi dữ liệu relatedLocations từ Work sang WorkLocation',
      details: {
        totalWorks: works.length,
        migratedRelations: migratedCount,
        executedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('autoMigrateLegacyRelations error:', err);
  }
};

module.exports = {
  syncWorkLocationsForWork,
  syncWorkLocationsForLocation,
  cleanupWorkLocationsForWork,
  cleanupWorkLocationsForLocation,
  autoMigrateLegacyRelations,
};
