require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Work = require('../src/models/Work');

const defaultCategories = [
  {
    name: 'Truyện cổ tích',
    slug: 'truyen-co-tich',
    icon: '🧚',
    color: '#0284c7',
    description: 'Các câu chuyện dân gian phản ánh ước mơ công lý, thế giới quan và sinh hoạt của các dân tộc',
    status: 'published',
  },
  {
    name: 'Thần thoại',
    slug: 'than-thoai',
    icon: '🌌',
    color: '#6366f1',
    description: 'Kể về nguồn gốc vũ trụ, trời đất, muôn loài và các vị thần khởi nguyên của các tộc người',
    status: 'published',
  },
  {
    name: 'Sử thi',
    slug: 'su-thi',
    icon: '⚔️',
    color: '#dc2626',
    description: 'Tác phẩm tự sự dân gian quy mô lớn ca ngợi chiến công của các anh hùng bộ tộc (Khan, Mo, Hơmon)',
    status: 'published',
  },
  {
    name: 'Truyền thuyết',
    slug: 'truyen-thuyet',
    icon: '✨',
    color: '#7c3aed',
    description: 'Kể về các nhân vật, sự kiện lịch sử hoặc địa danh được thiêng hóa trong tâm thức cộng đồng',
    status: 'published',
  },
  {
    name: 'Truyện thơ',
    slug: 'truyen-tho',
    icon: '📜',
    color: '#059669',
    description: 'Thể loại tự sự bằng thơ kể về tình yêu lứa đôi, khát vọng tự do và phong tục tập quán (như Xống chụ xon xao)',
    status: 'published',
  },
  {
    name: 'Dân ca & Hát Then',
    slug: 'dan-ca',
    icon: '🎵',
    color: '#d97706',
    description: 'Các bài hát dân gian, điệu khắp, lượn, sli, hát Then trong lao động và nghi lễ văn hóa',
    status: 'published',
  },
  {
    name: 'Tục ngữ - Ca dao - Câu đố',
    slug: 'ca-dao-tuc-ngu',
    icon: '💬',
    color: '#10b981',
    description: 'Trí tuệ dân gian đúc kết kinh nghiệm sống, ứng xử và lao động sản xuất',
    status: 'published',
  },
  {
    name: 'Truyện ngụ ngôn - Truyện cười',
    slug: 'ngu-ngon-cuoi',
    icon: '😄',
    color: '#f59e0b',
    description: 'Truyện ngụ ngôn mang bài học triết lý và truyện cười trào phúng, lạc quan',
    status: 'published',
  },
  {
    name: 'Khác',
    slug: 'khac',
    icon: '📚',
    color: '#ea580c',
    description: 'Các hình thức học liệu và tác phẩm văn học dân gian khác',
    status: 'published',
  },
];

const seedAndMigrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Upsert Categories
    const categoryMap = {};
    for (const catData of defaultCategories) {
      const category = await Category.findOneAndUpdate(
        { slug: catData.slug },
        catData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap[category.slug] = category._id;
      console.log(`📌 Category ready: ${category.name} (${category.slug}) -> ${category._id}`);
    }

    // Map old keys to new category slugs
    const legacySlugMap = {
      'truyen-thuyet': 'truyen-thuyet',
      'su-thi': 'su-thi',
      'dan-ca': 'dan-ca',
      'tho': 'truyen-tho',
      'truyen-ngan': 'truyen-co-tich',
      'khac': 'khac',
    };

    // 2. Migrate existing works
    const works = await Work.find();
    console.log(`🔍 Found ${works.length} works to inspect/migrate`);

    for (const work of works) {
      let targetCategoryId = null;

      // Special custom mapping based on work title if suitable
      const lowerTitle = (work.title || '').toLowerCase();
      if (lowerTitle.includes('thần thoại') || lowerTitle.includes('cúng mẹ y ke')) {
        targetCategoryId = categoryMap['than-thoai'];
      } else if (lowerTitle.includes('cổ tích')) {
        targetCategoryId = categoryMap['truyen-co-tich'];
      } else if (lowerTitle.includes('khăn piêu')) {
        targetCategoryId = categoryMap['dan-ca'];
      } else if (work.category && typeof work.category === 'string') {
        const targetSlug = legacySlugMap[work.category] || 'khac';
        targetCategoryId = categoryMap[targetSlug] || categoryMap['khac'];
      } else if (!work.category) {
        targetCategoryId = categoryMap['khac'];
      }

      if (targetCategoryId) {
        await Work.updateOne({ _id: work._id }, { $set: { category: targetCategoryId } });
        console.log(`✔️ Updated work "${work.title}" -> Category ObjectId: ${targetCategoryId}`);
      }
    }

    console.log('🎉 Seed & Migration for Categories completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

seedAndMigrate();
