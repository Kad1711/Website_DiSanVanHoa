require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Work = require('../src/models/Work');
const WorkLocation = require('../src/models/WorkLocation');
const MigrationLog = require('../src/models/MigrationLog');

async function migrate() {
  console.log('🔄 Bắt đầu Migration WorkLocation...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB.');

  const existingLog = await MigrationLog.findOne({ key: 'migrate_work_locations_v1' });
  if (existingLog) {
    console.log(`ℹ️ Migration 'migrate_work_locations_v1' đã được thực hiện trước đó vào: ${existingLog.createdAt}.`);
    console.log('Chi tiết:', existingLog.details);
    await mongoose.disconnect();
    return;
  }

  const works = await Work.find({
    relatedLocations: { $exists: true, $not: { $size: 0 } },
  }).select('_id title relatedLocations');

  console.log(`🔍 Tìm thấy ${works.length} tác phẩm có relatedLocations cần kiểm tra.`);

  let migratedWorksCount = 0;
  let createdRelationsCount = 0;

  for (const work of works) {
    let orderCounter = 1;
    let workMigrated = false;

    for (const locId of work.relatedLocations) {
      if (!locId || !mongoose.Types.ObjectId.isValid(locId)) continue;

      const exists = await WorkLocation.findOne({ work: work._id, location: locId });
      if (!exists) {
        try {
          await WorkLocation.create({
            work: work._id,
            location: locId,
            order: orderCounter,
            role: orderCounter === 1 ? 'START' : 'DEVELOPMENT',
            journeyTitle: '',
            journeyDescription: '',
          });
          createdRelationsCount++;
          workMigrated = true;
        } catch (err) {
          if (err.code !== 11000) {
            console.error(`Lỗi khi tạo quan hệ cho tác phẩm ${work._id}:`, err.message);
          }
        }
      }
      orderCounter++;
    }

    if (workMigrated) migratedWorksCount++;
  }

  // Đánh dấu migration đã hoàn tất để không bao giờ chạy lại
  const log = await MigrationLog.create({
    key: 'migrate_work_locations_v1',
    description: 'Chuyển đổi dữ liệu relatedLocations từ Work sang bảng liên kết WorkLocation',
    details: {
      totalWorksScanned: works.length,
      migratedWorksCount,
      createdRelationsCount,
      completedAt: new Date(),
    },
  });

  console.log('✅ Migration hoàn tất thành công!');
  console.log(`- Số tác phẩm chuyển đổi: ${migratedWorksCount}`);
  console.log(`- Số liên kết WorkLocation đã tạo: ${createdRelationsCount}`);
  console.log(`- Đã lưu MigrationLog ID: ${log._id}`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Lỗi khi thực hiện migration:', err);
  process.exit(1);
});
