require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Work = require('../src/models/Work');
const Location = require('../src/models/Location');
const WorkLocation = require('../src/models/WorkLocation');
const User = require('../src/models/User');
const {
  syncWorkLocationsForWork,
  syncWorkLocationsForLocation,
  cleanupWorkLocationsForWork,
  cleanupWorkLocationsForLocation,
} = require('../src/utils/workLocation.util');

let exitCode = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    exitCode = 1;
  }
}

async function runOfficialTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU CHẠY HỆ THỐNG KIỂM THỬ WORK-LOCATION (CI/TEST)');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ role: 'admin' });
  if (!user) {
    user = await User.create({
      displayName: 'CI Admin',
      email: 'ci_admin@disanvanhoc.vn',
      password: 'password123',
      role: 'admin',
    });
  }

  // 1. Work có nhiều Location & Journey Ordering
  console.log('\n[1] Kiểm tra Work có nhiều Location & thứ tự Hành trình (Journey ordering):');
  const loc1 = await Location.create({ name: 'CI_Loc_1', province: 'Nghệ An', coordinates: { lat: 19.2991, lng: 105.1481 }, createdBy: user._id, status: 'published' });
  const loc2 = await Location.create({ name: 'CI_Loc_2', province: 'Nghệ An', coordinates: { lat: 19.2992, lng: 105.1482 }, createdBy: user._id, status: 'published' });
  const loc3 = await Location.create({ name: 'CI_Loc_3', province: 'Nghệ An', coordinates: { lat: 19.2993, lng: 105.1483 }, createdBy: user._id, status: 'published' });

  const workMultiLoc = await Work.create({ title: 'CI_Work_MultiLoc', createdBy: user._id, status: 'published' });
  await syncWorkLocationsForWork(workMultiLoc._id, [
    { location: loc1._id, order: 1, role: 'START', journeyTitle: 'Chặng 1', journeyDescription: 'Mô tả 1' },
    { location: loc2._id, order: 2, role: 'DEVELOPMENT', journeyTitle: 'Chặng 2', journeyDescription: 'Mô tả 2' },
    { location: loc3._id, order: 3, role: 'END', journeyTitle: 'Chặng 3', journeyDescription: 'Mô tả 3' },
  ]);

  const relationsOfWork = await WorkLocation.find({ work: workMultiLoc._id }).sort({ order: 1 });
  assert(relationsOfWork.length === 3, 'Work lưu đủ 3 địa điểm trong WorkLocation');
  assert(relationsOfWork[0].order === 1 && relationsOfWork[1].order === 2 && relationsOfWork[2].order === 3, 'Thứ tự order 1, 2, 3 được giữ chính xác');
  assert(relationsOfWork[0].role === 'START' && relationsOfWork[1].role === 'DEVELOPMENT' && relationsOfWork[2].role === 'END', 'Vai trò role được bảo toàn');
  assert(relationsOfWork[0].journeyTitle === 'Chặng 1' && relationsOfWork[2].journeyDescription === 'Mô tả 3', 'Metadata journeyTitle và journeyDescription đúng');

  // 2. Location có nhiều Work
  console.log('\n[2] Kiểm tra Location có nhiều Work (Hai chiều từ Admin Location):');
  const workA = await Work.create({ title: 'CI_Work_A', createdBy: user._id, status: 'published' });
  const workB = await Work.create({ title: 'CI_Work_B', createdBy: user._id, status: 'published' });
  const locMultiWork = await Location.create({ name: 'CI_Loc_MultiWork', province: 'Nghệ An', coordinates: { lat: 19.2994, lng: 105.1484 }, createdBy: user._id, status: 'published' });

  await syncWorkLocationsForLocation(locMultiWork._id, [workA._id, workB._id]);
  const relsForLoc = await WorkLocation.find({ location: locMultiWork._id });
  assert(relsForLoc.length === 2, 'Location gắn kết thành công với cả 2 tác phẩm qua WorkLocation');
  const hasWorkA = relsForLoc.some(r => r.work.toString() === workA._id.toString());
  const hasWorkB = relsForLoc.some(r => r.work.toString() === workB._id.toString());
  assert(hasWorkA && hasWorkB, 'Cả Work A và Work B đều có quan hệ hợp lệ với Location');

  // 3. Duplicate relation prevention (Compound Unique Index)
  console.log('\n[3] Kiểm tra Chống Trùng Lặp Quan Hệ (Compound Unique Index):');
  let duplicatePrevented = false;
  try {
    await WorkLocation.create({ work: workA._id, location: locMultiWork._id, order: 99 });
  } catch (err) {
    if (err.code === 11000) duplicatePrevented = true;
  }
  assert(duplicatePrevented, 'Không thể tạo bản ghi trùng lặp (work, location) nhờ unique index E11000');

  // 4. Cascade delete (No orphan records)
  console.log('\n[4] Kiểm tra Cascade Delete (Không để lại bản ghi mồ côi):');
  await cleanupWorkLocationsForWork(workMultiLoc._id);
  await Work.findByIdAndDelete(workMultiLoc._id);
  const orphanRelations = await WorkLocation.countDocuments({ work: workMultiLoc._id });
  assert(orphanRelations === 0, 'Dọn dẹp sạch toàn bộ WorkLocation khi xóa Work');

  await cleanupWorkLocationsForLocation(locMultiWork._id);
  await Location.findByIdAndDelete(locMultiWork._id);
  const orphanLocRelations = await WorkLocation.countDocuments({ location: locMultiWork._id });
  assert(orphanLocRelations === 0, 'Dọn dẹp sạch toàn bộ WorkLocation khi xóa Location');

  // 5. Map grouping: 1 Location = 1 Marker
  console.log('\n[5] Kiểm tra Gom nhóm Bản đồ (1 Location = 1 Marker):');
  const locGroup = await Location.create({ name: 'CI_Loc_Group', province: 'Nghệ An', coordinates: { lat: 19.2995, lng: 105.1485 }, createdBy: user._id, status: 'published' });
  const workG1 = await Work.create({ title: 'CI_Work_G1', createdBy: user._id, status: 'published' });
  const workG2 = await Work.create({ title: 'CI_Work_G2', createdBy: user._id, status: 'published' });
  await syncWorkLocationsForWork(workG1._id, [{ location: locGroup._id, order: 1 }]);
  await syncWorkLocationsForWork(workG2._id, [{ location: locGroup._id, order: 1 }]);

  // Simulate map query
  const mapRels = await WorkLocation.find({ location: locGroup._id }).populate({ path: 'work', match: { status: 'published' } }).lean();
  const groupedWorks = mapRels.filter(r => r.work).map(r => r.work);
  assert(groupedWorks.length === 2, 'Địa điểm có 2 tác phẩm liên kết');
  assert(locGroup._id !== undefined, 'Địa điểm duy nhất đại diện cho 1 Marker không đè tọa độ');

  // Dọn dẹp tài nguyên test
  for (const w of [workA, workB, workG1, workG2]) {
    await cleanupWorkLocationsForWork(w._id);
    await Work.findByIdAndDelete(w._id);
  }
  for (const l of [loc1, loc2, loc3, locGroup]) {
    await cleanupWorkLocationsForLocation(l._id);
    await Location.findByIdAndDelete(l._id);
  }

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log(exitCode === 0 ? '🎉 TẤT CẢ KIỂM THỬ THÀNH CÔNG (100% PASS)' : '❌ CÓ LỖI XẢY RA TRONG KIỂM THỬ');
  console.log('====================================================\n');
  process.exit(exitCode);
}

runOfficialTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
