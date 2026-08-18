require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const EthnicGroup = require('../src/models/EthnicGroup');
const Location = require('../src/models/Location');
const Work = require('../src/models/Work');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    EthnicGroup.deleteMany({}),
    Location.deleteMany({}),
    Work.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing collections');

  // Create Users
  const admin = await User.create({
    displayName: 'Quản trị viên Di Sản',
    email: 'admin@disanvanhoc.vn',
    password: 'admin123456',
    role: 'admin',
  });

  const member = await User.create({
    displayName: 'Nguyễn Văn Đọc',
    email: 'user@disanvanhoc.vn',
    password: 'user123456',
    role: 'user',
  });
  console.log(`👤 Users created: ${admin.email} (Admin), ${member.email} (User)`);

  // 1. Create Ethnic Groups
  const ethnicGroupData = [
    {
      name: 'Dân tộc Thái',
      region: 'Tây Bắc',
      description: 'Dân tộc Thái có mặt lâu đời tại miền núi Tây Bắc Việt Nam, nổi tiếng với nghệ thuật xòe hoa, kiến trúc nhà sàn gỗ thanh thoát và trang phục phụ nữ duyên dáng với áo cóm, khăn Piêu.',
      cultureSummary: 'Văn hóa Thái giàu có về kho tàng dân ca, truyện thơ, tục xòe vòng, lễ hội Then Kin Pang và kiến trúc bản mường truyền thống. Chữ Thái cổ là một trong những hệ thống văn tự bản địa đặc sắc được gìn giữ qua nhiều thế kỷ.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_thai_thumb',
      },
    },
    {
      name: 'Dân tộc Tày',
      region: 'Đông Bắc',
      description: 'Dân tộc Tày là một trong những cộng đồng thiểu số có dân số đông nhất tại vùng núi Đông Bắc. Người Tày cư trú trù phú ở thung lũng ven sông, canh tác lúa nước kết hợp chăn nuôi.',
      cultureSummary: 'Nghệ thuật Hát Then kết hợp đàn Tính của người Tày đã được UNESCO công nhận là Di sản Văn hóa Phi vật thể đại diện của nhân loại. Văn học dân gian Tày phong phú với các thể loại then, lượn, sli và truyền thuyết lập làng dựng bản.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_tay_thumb',
      },
    },
    {
      name: 'Dân tộc Mường',
      region: 'Tây Bắc',
      description: 'Người Mường cư trú tập trung chủ yếu tại tỉnh Hòa Bình, Phú Thọ và Thanh Hóa. Người Mường cùng chung cội nguồn văn hóa tiền sử Đông Sơn với người Việt cổ.',
      cultureSummary: 'Văn hóa Mường gắn liền với Mo Mường (nghi lễ mo ca dân gian kỳ vĩ), không gian văn hóa cồng chiêng Mường, tri thức lịch vạn niên Đoi và đặc biệt là pho sử thi bất hủ "Đẻ đất đẻ nước".',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_muong_thumb',
      },
    },
    {
      name: 'Dân tộc H\'Mông',
      region: 'Tây Bắc',
      description: 'Đồng bào H\'Mông sinh sống chủ yếu trên các sườn núi đá tai mèo hiểm trở từ Hà Giang, Lào Cai, Sơn La đến Yên Bái, với tinh thần quật cường, khéo léo thích nghi với thiên nhiên.',
      cultureSummary: 'Văn hóa H\'Mông nổi bật với nghệ thuật múa Khèn, kỹ thuật vẽ sáp ong trên vải lanh nhuộm chàm, chợ tình Khâu Vai, lễ hội Gầu Tào cầu phúc lộc cùng những trường ca tình yêu tha thiết qua tiếng hát giao duyên.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_hmong_thumb',
      },
    },
    {
      name: 'Dân tộc Ê Đê',
      region: 'Tây Nguyên',
      description: 'Người Ê Đê là cư dân bản địa lâu đời tại vùng đất đỏ bazan Đắk Lắk và Đắk Nông. Xã hội truyền thống Ê Đê vận hành theo chế độ mẫu hệ trang trọng.',
      cultureSummary: 'Không gian văn hóa Cồng chiêng Tây Nguyên, kiến trúc Nhà dài bằng gỗ nguyên khối với cầu thang đực - cái, cùng kho tàng sử thi Khan (như Sử thi Đam San, Xinh Nhã) là biểu tượng thiêng liêng của tinh thần thượng võ và khát vọng chinh phục tự nhiên.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_ede_thumb',
      },
    },
    {
      name: 'Dân tộc Chăm',
      region: 'Nam Trung Bộ',
      description: 'Dân tộc Chăm sở hữu nền văn minh cổ kính rực rỡ với hệ thống đền tháp Champa trầm mặc trải dài từ Quảng Nam đến Ninh Thuận, Bình Thuận và An Giang.',
      cultureSummary: 'Văn hóa Chăm được tôn vinh qua Lễ hội Katê linh thiêng, nghệ thuật múa quạt Apsara, nghề gốm Bàu Trúc nặn tay không bàn xoay (UNESCO ghi danh) và pho sử thi truyền kỳ Akayet.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_cham_thumb',
      },
    },
    {
      name: 'Dân tộc Ba Na',
      region: 'Tây Nguyên',
      description: 'Người Ba Na định cư chủ yếu tại Kon Tum và Gia Lai, nổi tiếng với ngôi Nhà Rông cao vút sừng sững giữa bầu trời đại ngàn như lưỡi rìu thần thoại.',
      cultureSummary: 'Văn hóa Ba Na gắn với kho tàng sử thi H\'mon huyền bí, âm vang cồng chiêng, đàn t\'rưng, klong pút và nghệ thuật tạc tượng gỗ nhà mồ độc đáo đầy triết lý nhân sinh.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_bana_thumb',
      },
    },
    {
      name: 'Dân tộc Khmer',
      region: 'Đồng bằng sông Cửu Long',
      description: 'Đồng bào Khmer sinh sống hòa thuận cùng người Kinh, Hoa tại vùng đồng bằng châu thổ sông Cửu Long (Trà Vinh, Sóc Trăng, An Giang).',
      cultureSummary: 'Phật giáo Nam tông gắn chặt vào từng hơi thở đời sống; hệ thống chùa Khmer chạm khắc hoa văn Angkor tinh xảo, lễ hội Ooc Om Bóc đua ghe Ngo sông nước và nghệ thuật sân khấu Rô-băm, Dù Kê đặc sắc.',
      status: 'published',
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=800&auto=format&fit=crop',
        publicId: 'seed_khmer_thumb',
      },
    },
  ];

  const createdEthnicGroups = await EthnicGroup.create(ethnicGroupData);
  const [egThai, egTay, egMuong, egHmong, egEde, egCham, egBana, egKhmer] = createdEthnicGroups;
  console.log(`🏘️  Created ${createdEthnicGroups.length} Ethnic Groups`);

  // 2. Create Locations
  const locationData = [
    {
      name: 'Bản Lác – Mai Châu',
      province: 'Hòa Bình',
      district: 'Mai Châu',
      address: 'Xã Chiềng Châu, Huyện Mai Châu',
      coordinates: { lat: 20.6593, lng: 104.9866 },
      ethnicGroup: egThai._id,
      shortDescription: 'Thung lũng trù phú nép mình dưới bóng núi mờ sương, cái nôi của văn hóa Thái trắng với nghề dệt thổ cẩm và điệu xòe nồng ấm.',
      description: 'Bản Lác Mai Châu đã có lịch sử tồn tại hơn 700 năm. Nơi đây lưu giữ nguyên vẹn nếp nhà sàn cột gỗ khang trang, các khung cửi dệt khăn Piêu hoa văn sặc sỡ và ẩm thực cơm lam, cá nướng Pa pỉnh tộp nức tiếng vùng Tây Bắc.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_ban_lac_1',
          caption: 'Cảnh quan thung lũng Mai Châu',
        },
        {
          url: 'https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_ban_lac_2',
          caption: 'Nhà sàn truyền thống của người Thái',
        },
      ],
    },
    {
      name: 'Hồ Ba Bể – Vườn Quốc Gia Ba Bể',
      province: 'Bắc Kạn',
      district: 'Ba Bể',
      address: 'Xã Nam Mẫu, Huyện Ba Bể',
      coordinates: { lat: 22.4116, lng: 105.6231 },
      ethnicGroup: egTay._id,
      shortDescription: 'Viên ngọc xanh giữa lòng núi đá vôi Đông Bắc, nơi sản sinh ra truyền thuyết cảm động về lòng nhân ái của bà lão góa.',
      description: 'Hồ Ba Bể là một trong 20 hồ nước ngọt tự nhiên lớn nhất thế giới cần được bảo vệ. Vùng hồ gắn liền với đời sống người Tày sống trong các bản Pác Ngòi, Bó Lù cùng tiếng hát Then và làn điệu đàn Tính ngân vang trên mặt nước xanh biếc.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_ba_be_1',
          caption: 'Mặt nước hồ Ba Bể mù sương sớm',
        },
      ],
    },
    {
      name: 'Thung Lũng Cổ & Xứ Mường Hòa Bình',
      province: 'Hòa Bình',
      district: 'Tân Lạc',
      address: 'Vùng đất Mường Bi, Huyện Tân Lạc',
      coordinates: { lat: 20.6234, lng: 105.2812 },
      ethnicGroup: egMuong._id,
      shortDescription: 'Cái nôi khởi nguyên của thiên sử thi đồ sộ "Đẻ đất đẻ nước" và nghi lễ Mo Mường huyền bí.',
      description: 'Xứ Mường Bi, Mường Vang, Mường Thàng, Mường Động là 4 vùng Mường lớn cổ xưa nhất của người Mường. Nơi đây còn lưu giữ những bộ cồng chiêng gia bảo, trang phục váy cạp dệt rồng phượng và các thầy Mo truyền tụng sử thi ngàn câu chữ.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_muong_1',
          caption: 'Cảnh sắc thung lũng bản Mường',
        },
      ],
    },
    {
      name: 'Đèo Mã Pí Lèng & Cao Nguyên Đá Đồng Văn',
      province: 'Hà Giang',
      district: 'Đồng Văn',
      address: 'Công viên Địa chất Toàn cầu Cao nguyên đá Đồng Văn',
      coordinates: { lat: 23.2384, lng: 105.4187 },
      ethnicGroup: egHmong._id,
      shortDescription: 'Thiên đường đá xám kỳ vĩ bậc nhất thế giới, nơi vang vọng tiếng khèn gọi bạn tình tha thiết của chàng trai H\'Mông.',
      description: 'Nằm ở cực Bắc Tổ quốc, Đồng Văn là vùng đất đá nở hoa, nơi đồng bào H\'Mông qua bao thế hệ đã vạt đá gieo ngô, dệt lanh nhuộm chàm, tạo dựng nên một không gian văn hóa kiên cường và đầy chất thơ lãng mạn bên dòng sông Nho Quế.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_dong_van_1',
          caption: 'Đèo Mã Pí Lèng và dòng sông Nho Quế',
        },
      ],
    },
    {
      name: 'Buôn Đôn & Không Gian Rừng Đại Ngàn',
      province: 'Đắk Lắk',
      district: 'Buôn Đôn',
      address: 'Xã Krông Na, Huyện Buôn Đôn',
      coordinates: { lat: 12.9056, lng: 107.7889 },
      ethnicGroup: egEde._id,
      shortDescription: 'Thủ phủ săn bắt và thuần dưỡng voi rừng huyền thoại, vùng đất khởi phát của thiên sử thi anh hùng ca Đam San.',
      description: 'Buôn Đôn bên dòng sông Sêrêpôk chảy ngược là biểu tượng của tinh thần phóng khoáng Tây Nguyên. Nơi đây lưu giữ kiến trúc nhà sàn dài cổ của người Ê Đê, mộ voi rừng linh thiêng và những đêm kể Khan bất tận bên bếp lửa hồng.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_buon_don_1',
          caption: 'Bình minh trên cao nguyên Đắk Lắk',
        },
      ],
    },
    {
      name: 'Tháp Chàm Po Klong Garai',
      province: 'Ninh Thuận',
      district: 'Phan Rang - Tháp Chàm',
      address: 'Đồi Trầu, Phường Đô Vinh, TP. Phan Rang',
      coordinates: { lat: 11.5975, lng: 108.9567 },
      ethnicGroup: egCham._id,
      shortDescription: 'Quần thể tháp Chăm hùng vĩ và toàn vẹn nhất Việt Nam, chứng tích đỉnh cao của nghệ thuật điêu khắc và tín ngưỡng Champa cổ.',
      description: 'Được xây dựng từ cuối thế kỷ 13, tháp Po Klong Garai là trung tâm diễn ra lễ hội Katê truyền thống hàng năm. Nơi đây thờ vị vua Po Klong Garai có công dẫn thủy nhập điền khai mở nông nghiệp cho đồng bào Chăm vùng Panduranga.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_poklong_1',
          caption: 'Tháp Po Klong Garai trên đồi Trầu',
        },
      ],
    },
    {
      name: 'Nhà Rông Kon Klor & Dòng Sông Đắk Bla',
      province: 'Kon Tum',
      district: 'TP. Kon Tum',
      address: 'Đường Bắc Kạn, Phường Thắng Lợi, TP. Kon Tum',
      coordinates: { lat: 14.3512, lng: 108.0163 },
      ethnicGroup: egBana._id,
      shortDescription: 'Ngôi nhà rông cộng đồng bằng gỗ tre lớn nhất Tây Nguyên, trái tim văn hóa tinh thần của buôn làng Ba Na.',
      description: 'Nhà Rông Kon Klor sừng sững bên bờ sông Đắk Bla thơ mộng với mái nhọn cao vút vươn thẳng lên trời xanh. Đây là nơi hội tụ linh khí của làng, nơi các già làng truyền dạy sử thi H\'mon và biểu diễn cồng chiêng cho lớp trẻ.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_kon_klor_1',
          caption: 'Nhà Rông Kon Klor sừng sững',
        },
      ],
    },
    {
      name: 'Chùa Dơi (Chùa Mahatup)',
      province: 'Sóc Trăng',
      district: 'TP. Sóc Trăng',
      address: 'Đường Văn Ngọc Chính, Phường 3, TP. Sóc Trăng',
      coordinates: { lat: 9.5847, lng: 105.9782 },
      ethnicGroup: egKhmer._id,
      shortDescription: 'Ngôi cổ tự Khmer hơn 400 năm tuổi với hàng vạn cá thể dơi ngựa quý hiếm cư ngụ dưới tán cây cổ thụ.',
      description: 'Chùa Mahatup là đỉnh cao của nghệ thuật kiến trúc Phật giáo Nam tông Khmer tại đồng bằng sông Cửu Long. Mái chùa nhiều tầng uốn cong hình đuôi rắn Naga, tượng Phật uy nghi và kho tàng kinh lá buông cổ lưu giữ giáo lý ngàn đời.',
      status: 'published',
      createdBy: admin._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1200&auto=format&fit=crop',
          publicId: 'loc_chua_doi_1',
          caption: 'Khuôn viên thanh tịnh chùa Dơi',
        },
      ],
    },
  ];

  const createdLocations = await Location.create(locationData);
  const [locMaiChau, locBaBe, locMuong, locDongVan, locBuonDon, locPoKlong, locKonKlor, locChuaDoi] = createdLocations;
  console.log(`📍 Created ${createdLocations.length} Locations`);

  // 3. Create Works
  const workData = [
    {
      title: 'Xống chụ xon xao (Tiễn dặn người yêu)',
      author: 'Dân gian Thái',
      category: 'tho',
      ethnicGroup: egThai._id,
      summary: 'Kiệt tác truyện thơ dân gian dài hơn 1.800 câu thơ, bài ca ngợi ca tình yêu đôi lứa thủy chung son sắt vượt qua định kiến giai cấp ngặt nghèo của xã hội phong kiến bản mường.',
      content: `Không lấy được nhau mùa hạ, ta sẽ lấy nhau mùa đông;
Không lấy được nhau thời trẻ, ta sẽ lấy nhau khi góa bụa về già.

Lời thề son sắt giữa chàng trai và cô gái Thái vượt qua bao giông bão thác ghềnh của cuộc đời. Khi người con gái bị gả ép cho người khác, chàng trai vẫn kiên trù tiễn dặn:
"Đôi ta yêu nhau tình sâu như nước sông Nậm Na,
Dẫu chết đi thành ma, hồn ta vẫn quấn quýt bên nhau như đôi chim én liền cánh."

Tác phẩm phản ánh sâu sắc khát vọng tự do yêu đương, phê phán hủ tục hôn nhân ép gả, và khẳng định vẻ đẹp tâm hồn chung thủy, thanh khiết của người phụ nữ Thái Tây Bắc.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_xong_chu_cover',
      },
      videos: [
        {
          title: 'Tái hiện Trường đoạn Tiễn Dặn - AI Visualized Clip',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          publicId: 'vid_xong_chu_1',
          type: 'ai-video',
          resourceType: 'external',
        },
      ],
      relatedLocations: [locMaiChau._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Chiếc khăn Piêu',
      author: 'Doãn Nho sưu tầm & phát triển',
      category: 'dan-ca',
      ethnicGroup: egThai._id,
      summary: 'Truyền thuyết và bài dân ca nổi tiếng về biểu tượng tình yêu thiêng liêng được thêu dệt tỉ mỉ từ bàn tay khéo léo của người con gái Thái dành tặng chàng trai mình thầm thương.',
      content: `Khăn Piêu là tín vật định tình bất diệt trong văn hóa người Thái. Chiếc khăn được thêu bằng chỉ ngũ sắc với các họa tiết móc câu, hình thoi, mầm cây tượng trưng cho đất trời, tình yêu và sinh sôi nảy nở.

Khi gió mùa đông tràn về trên các ngọn núi cao ngút ngàn, tiếng sáo bè rủ rê chàng trai đi tìm chiếc khăn Piêu người thương vô tình để lại bên bờ suối. Bài ca là tiếng lòng trong sáng, mộc mạc và thiết tha của tình yêu đôi lứa chốn đại ngàn Tây Bắc.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_khan_pieu_cover',
      },
      relatedLocations: [locMaiChau._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Sử thi Đẻ đất đẻ nước (Te tấc te đác)',
      author: 'Dân gian Mường',
      category: 'su-thi',
      ethnicGroup: egMuong._id,
      summary: 'Bản trường ca thần thoại vĩ đại dài hơn 20.000 câu thơ, kể về sự hình thành của vũ trụ, trời đất, muôn loài, con người và cuộc đấu tranh bền bỉ với thiên nhiên của người Mường cổ.',
      content: `Thuở ấy, trời đất còn mịt mùng chưa phân định. Trận mưa đại hồng thủy kéo dài nhiều ngàn ngày đêm đã tạo nên quả đất. Từ cây Si thiêng nghìn tuổi nứt ra, mọc lên các loài chim, cầm thú và thủy tổ của loài người.

Thiên sử thi "Đẻ đất đẻ nước" phản ánh trực quan vũ trụ quan mộc mạc mà uyên bác của người Mường. Con người gắn bó hòa hợp với cỏ cây, tôn trọng sông suối, cùng nhau đúc trống đồng, chế ngự muông thú để dựng xây xóm mường ấm no thịnh vượng.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_de_dat_cover',
      },
      videos: [
        {
          title: 'Diễn xướng Mo Mường & Khởi nguồn Đẻ đất đẻ nước',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          publicId: 'vid_mo_muong_1',
          type: 'normal-video',
          resourceType: 'external',
        },
      ],
      relatedLocations: [locMuong._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Sử thi Đam San (Bài ca chàng Đam San)',
      author: 'Dân gian Ê Đê',
      category: 'su-thi',
      ethnicGroup: egEde._id,
      summary: 'Pho anh hùng ca rực rỡ của đại ngàn Tây Nguyên, ngợi ca thủ lĩnh Đam San dũng mãnh đi săn bắt voi rừng, đánh bại Mtao Mxây để bảo vệ buôn làng và khát vọng chinh phục Nữ thần Mặt Trời.',
      content: `Tiếng chiêng ching ning vang lên giòn giã, chàng Đam San rung khiên xông trận. Khiên chàng vút qua như gió lốc, bắp chân chàng to như cây xà ngang, ánh mắt rực lửa như mặt trời mùa rẫy.

Chàng đã chiến thắng bạo chúa Mtao Mxây để giải cứu người vợ H'Nhị, mở mang bờ cõi buôn làng, tôi luyện nên sự giàu có với chiêng ché tràn đầy buôn thượng buôn hạ. Dù phải gục ngã trước Rừng Sáp Đen trên đường đi cầu hôn Nữ thần Mặt Trời, Đam San Cháu lại tiếp nối tinh thần bất khuất của dòng họ, tiếp tục làm rạng danh con cháu Tây Nguyên.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_dam_san_cover',
      },
      videos: [
        {
          title: 'Hoạt cảnh AI Trận đánh Mtao Mxây - Sử thi Đam San',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          publicId: 'vid_dam_san_1',
          type: 'ai-video',
          resourceType: 'external',
        },
      ],
      relatedLocations: [locBuonDon._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Sự tích Hồ Ba Bể',
      author: 'Dân gian Tày',
      category: 'truyen-thuyet',
      ethnicGroup: egTay._id,
      summary: 'Truyền thuyết dân gian Tày giàu tính nhân văn kể về sự trừng phạt của tự nhiên đối với lòng tham lam và sự cứu rỗi của người mẹ góa nhân từ, giải thích sự ra đời của hồ nước Ba Bể.',
      content: `Ngày xưa ở vùng đất Nam Mẫu, dân làng mở hội cúng Phật linh đình. Bỗng xuất hiện một bà lão ăn xin lở loét gớm ghiếc đến xin ăn, nhưng đi đến đâu cũng bị mọi người xua đuổi mắng nhiếc thậm tệ.

Chỉ có hai mẹ con bà góa nghèo thương tình nhường phần cơm và cho bà lão tá túc qua đêm. Đêm ấy, bà lão hóa thành con Giao Long khổng lồ và cảnh báo tai họa lũ lụt sắp giáng xuống. Bà trao cho mẹ con gói tro bếp rắc quanh nhà và hai mảnh vỏ trấu.

Đúng như lời dặn, đất sụp nước dâng cuồn cuộn dìm ngập cả thung lũng tạo thành 3 nhánh hồ Ba Bể. Riêng căn nhà mẹ con bà góa nổi lên thành Đảo Bà Góa giữa hồ, hai mảnh vỏ trấu biến thành hai chiếc thuyền nan cứu vớt dân làng thoát khỏi nạn chết đuối.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_ho_ba_be_cover',
      },
      relatedLocations: [locBaBe._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Tiếng khèn gọi bạn trên đỉnh Mã Pí Lèng',
      author: 'Dân gian H\'Mông',
      category: 'dan-ca',
      ethnicGroup: egHmong._id,
      summary: 'Bài ca giao duyên nồng thắm qua thanh âm bổng trầm của cây khèn gỗ pơ mu trong các phiên chợ tình mùa xuân của tuổi trẻ vùng cao Hà Giang.',
      content: `Núi cao có ngọn, mây bay có lối, cớ sao em còn ngập ngừng chưa bước xuống chợ phiên?
Tiếng khèn anh thổi xoay tròn như cánh chim rừng, gọi em qua chín con đèo, mười vạt núi đá.

Cây khèn không chỉ là nhạc cụ mà còn là linh hồn của người trai H\'Mông. Khèn dùng để tâm tình trong ngày hội Gầu Tào, khèn đưa tiễn người quá cố về với cội nguồn tổ tiên, và khèn nối nhịp cầu hạnh phúc cho những lứa đôi trọn vẹn yêu thương.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_tieng_khen_cover',
      },
      relatedLocations: [locDongVan._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Trường ca Dam Noi (Dăm Nôi)',
      author: 'Dân gian Ba Na',
      category: 'su-thi',
      ethnicGroup: egBana._id,
      summary: 'Sử thi đồ sộ của người Ba Na kể về người anh hùng Dam Noi dũng cảm vượt qua trùng trùng thử thách để bảo vệ sự yên bình của buôn làng Kon Klor.',
      content: `Dăm Nôi sinh ra từ trứng chim thần, lớn lên nhanh như cây tre gai đâm măng. Khi buôn làng bị quái thú tàn phá, Dăm Nôi đã cầm lao đồng, mang khiên gỗ bước vào rừng thẳm trừ hại cho dân gian.

Tác phẩm thể hiện sâu sắc lòng tự hào dân tộc, tình nghĩa buôn làng thủy chung và khát vọng tự do của đồng bào Ba Na giữa bạt ngàn Trường Sơn hùng vĩ.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_dam_noi_cover',
      },
      relatedLocations: [locKonKlor._id],
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Truyền thuyết Nữ thần Po Nagar (Thiên Y A Na)',
      author: 'Dân gian Chăm',
      category: 'truyen-thuyet',
      ethnicGroup: egCham._id,
      summary: 'Truyền thuyết thiêng liêng của người Chăm về Mẹ Xứ Sở Po Nagar – người đã giáng trần dạy dân cấy lúa, dệt vải, trồng trầm hương và ban phát ấm no.',
      content: `Nữ thần Po Nagar sinh ra từ bọt biển và mây trời ngoài khơi xa. Người giáng thế trên núi Đại An, hóa phép tạo ra cây lúa thơm ngon, dạy phụ nữ cách ươm tơ dệt vải hoa văn tinh xảo và trị bệnh cứu nhân độ thế.

Hàng năm trong mùa lễ hội Katê, tiếng trống Paranưng và kèn Saranai vang vọng dưới chân tháp cổ Po Klong Garai để tưởng nhớ công ơn trời biển của Mẹ Xứ Sở đã chở che cho muôn dân ấm no.`,
      coverImage: {
        url: 'https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=800&auto=format&fit=crop',
        publicId: 'work_po_nagar_cover',
      },
      relatedLocations: [locPoKlong._id],
      status: 'published',
      createdBy: admin._id,
    },
  ];

  const createdWorks = await Work.create(workData);
  console.log(`📚 Created ${createdWorks.length} Works`);

  // Update back cross-references for relatedWorks on Locations
  for (const w of createdWorks) {
    if (w.relatedLocations && w.relatedLocations.length > 0) {
      await Location.updateMany(
        { _id: { $in: w.relatedLocations } },
        { $addToSet: { relatedWorks: w._id } }
      );
    }
  }
  console.log('🔗 Cross-referenced Locations and Works');

  console.log('\n======================================================');
  console.log('🎉 Seed Database Successfully Completed!');
  console.log('   Admin login: admin@disanvanhoc.vn / admin123456');
  console.log('   User login:  user@disanvanhoc.vn  / user123456');
  console.log('======================================================\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
