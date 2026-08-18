import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  MapIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HeartIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';

const AboutPage = () => {
  return (
    <div className="bg-cream min-h-screen pb-24">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-gray-900 via-primary-950 to-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-15"></div>
        <div className="container-lg relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <SparklesIcon className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              Dự Án Nhân Văn Số • Digital Humanities
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Giới Thiệu Dự Án <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 via-amber-200 to-secondary-500">
              Di Sản Văn Học Dân Tộc Thiểu Số
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-200 font-light leading-relaxed">
            Nền tảng số hóa tương tác đa phương tiện nhằm bảo tồn, lan tỏa và tái hiện sống động kho tàng văn học, sử thi và phong tục tập quán của 54 dân tộc anh em tại Việt Nam.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="container-lg -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 bg-white border border-gray-100 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <HeartIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sứ Mệnh Bảo Tồn</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ngăn ngừa sự mai một của các tác phẩm văn học truyền khẩu, truyện thơ, trường ca và dân ca cổ của đồng bào các dân tộc thiểu số trước làn sóng hiện đại hóa.
              </p>
            </div>
          </div>

          <div className="card p-8 bg-white border border-gray-100 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary-600 flex items-center justify-center mb-6">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ứng Dụng Công Nghệ AI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tái hiện không gian huyền thoại, nhân vật sử thi và cảnh quan văn hóa thông qua công nghệ trí tuệ nhân tạo (AI Visuals, Generative Media) giúp người trẻ tiếp cận sinh động.
              </p>
            </div>
          </div>

          <div className="card p-8 bg-white border border-gray-100 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-earth flex items-center justify-center mb-6">
                <MapIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bản Đồ Không Gian Văn Hóa</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kết nối từng tác phẩm, câu chuyện dân gian với vị trí địa lý thực tế (GIS) trên bản đồ Việt Nam, tạo nên bức tranh toàn cảnh về không gian văn hóa bản địa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pillars */}
      <section className="container-lg mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Trụ Cột Cốt Lõi Của Hệ Thống
          </h2>
          <p className="text-gray-600 text-sm">
            Kết hợp nghiên cứu nhân văn, giáo dục di sản và công nghệ số hiện đại.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Kho Tàng Tác Phẩm Số Hóa</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hệ thống lưu trữ đầy đủ các thể loại: Truyện cổ tích, Thơ ca, Sử thi hào hùng (như Đam San, Đẻ đất đẻ nước), Dân ca, Truyền thuyết dân gian được phân loại và chú thích nguồn gốc xuất xứ cẩn trọng.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex-shrink-0 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hồ Sơ Văn Hóa 54 Dân Tộc</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bách khoa thư tóm lược về phân bố dân cư, trang phục truyền thống, lễ hội tâm linh, kiến trúc nhà sàn, nhà rông và những nét đặc thù về đời sống tinh thần của từng dân tộc.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0 flex items-center justify-center">
              <MapIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Bản Đồ Di Sản Tương Tác</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Trải nghiệm trực quan với bản đồ định vị các địa danh văn hóa, di tích lịch sử và bối cảnh khởi nguồn của các truyền thuyết trên khắp 63 tỉnh thành Việt Nam.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0 flex items-center justify-center">
              <ComputerDesktopIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Công Nghệ & Chuẩn Mực Mở</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Giao diện tối ưu theo chuẩn Responsive Web hiện đại, hệ thống phân quyền Admin CRUD bảo mật, lưu trữ đám mây tốc độ cao và cấu trúc dữ liệu chuẩn RESTful API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container-lg mt-20">
        <div className="bg-gradient-to-r from-primary-900 via-primary to-primary-900 rounded-3xl p-10 sm:p-14 text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Bắt Đầu Cuộc Hành Trình Khám Phá
            </h2>
            <p className="text-primary-100 text-sm sm:text-base mb-8">
              Hãy bước chân vào không gian văn học số để cùng cảm nhận hồn cốt đại ngàn và vẻ đẹp muôn màu của văn hóa Việt Nam.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/works" className="btn-secondary px-8 py-3 rounded-full text-sm font-semibold">
                Đọc các tác phẩm
              </Link>
              <Link
                to="/map"
                className="px-8 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              >
                Khám phá bản đồ di sản
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
