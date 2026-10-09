import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ChevronUp } from 'lucide-react';

/**
 * Footer:
 * - Chuẩn hóa màu đỏ trầm di sản (#3B0F00 / #240A02) và vàng đồng (#C8973A)
 * - Đã loại bỏ hoàn toàn phần Newsletter theo yêu cầu người dùng
 * - Giữ lại đầy đủ các liên kết điều hướng, thông tin bản quyền và nút cuộn lên đầu trang
 */
export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#240A02] text-white pt-16 pb-12 px-6 md:px-12 lg:px-16 overflow-hidden border-t border-primary-900/60">
      {/* Glow ambient background lights */}
      <div className="absolute top-0 left-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Subtle heritage indicator dot */}
        <div className="mb-6 flex items-center">
          <div className="w-4 h-4 rounded-full border-2 border-secondary/80 flex items-center justify-center shadow-[0_0_12px_rgba(200,151,58,0.5)]">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Column 1: Logo & Bio (md:col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-none font-serif">
                DI SẢN VĂN HỌC
              </h2>
              <div className="text-[11px] md:text-xs font-bold tracking-[0.25em] text-secondary mt-2 uppercase">
                KHÔNG GIAN DI SẢN SỐ
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed max-w-md pt-2">
              Nền tảng số hóa và lưu giữ kho tàng văn học dân gian các dân tộc thiểu số Việt Nam. Ứng dụng công nghệ tương tác trực quan, bản đồ hành trình số và tư liệu bản địa nhằm bảo tồn và lan tỏa tinh hoa văn hóa truyền đời đến thế hệ trẻ.
            </p>

            <div className="pt-2 text-xs text-gray-400 space-y-1">
              <div>
                <span className="text-gray-400">Trường: </span>
                <span className="text-gray-200 font-medium">Trường Đại học Sư phạm - Đại học Đà Nẵng</span>
              </div>
              <div>
                <span className="text-gray-400">Dự án môn học • By: </span>
                <span className="text-gray-200 font-semibold">[KaD]</span>
              </div>
            </div>
          </div>

          {/* Column 2: MENU (md:col-span-3) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-secondary/90">
              MENU
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-300">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/works"
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Kho tàng tác phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/ethnic-groups"
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Dân tộc thiểu số
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Bản đồ di sản số
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Giới thiệu dự án
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LIÊN HỆ (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-secondary/90">
              LIÊN HỆ
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-300">
              <li>
                <a
                  href="https://www.tiktok.com/@duongpedri.n17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all inline-flex items-center gap-1.5 group hover:translate-x-1"
                >
                  <span>TikTok</span>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/kaduowng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all inline-flex items-center gap-1.5 group hover:translate-x-1"
                >
                  <span>Instagram</span>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/nguyenkhaduong.1711/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all inline-flex items-center gap-1.5 group hover:translate-x-1"
                >
                  <span>Facebook</span>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Kad1711"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all inline-flex items-center gap-1.5 group hover:translate-x-1"
                >
                  <span>GitHub</span>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">↗</span>
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="mailto:nguyenkhaduong17@gmail.com"
                  className="hover:text-white transition-all flex items-center gap-2 group hover:translate-x-1"
                >
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors flex-shrink-0" />
                  <span className="break-all text-xs sm:text-sm">nguyenkhaduong17@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Floating Scroll To Top Button (Heritage Red & Gold) */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} Di Sản Văn Học • Thực hiện bởi KaD. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary hover:bg-primary-700 active:bg-primary-900 text-white flex items-center justify-center border border-secondary/30 shadow-[0_8px_24px_rgba(59,15,0,0.5)] hover:shadow-[0_12px_32px_rgba(59,15,0,0.7)] transition-all duration-300 active:scale-95 group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 hover:-translate-y-1"
          >
            <ChevronUp className="w-6 h-6 stroke-[3] group-hover:-translate-y-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
