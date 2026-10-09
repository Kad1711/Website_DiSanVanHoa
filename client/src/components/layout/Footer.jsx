import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ChevronUp } from 'lucide-react';

/**
 * Footer:
 * Re-designed per Reference Image 1 & 2:
 * - Upper strip: Newsletter subscription box ("Đăng ký Newsletter để nghe mình kể chuyện nhiều hơn")
 * - Main footer: Deep dark background (#0f1014) matching Image 1:
 *   1. Glowing purple indicator dot
 *   2. Big Logo "MYSPACE" / "PERSONAL WORKSPACE" & bio description
 *   3. MENU navigation links (Trang chủ, Tác phẩm số, Dân tộc thiểu số, Bản đồ di sản)
 *   4. LIÊN HỆ: TikTok, Instagram, Facebook, GitHub, and email nguyenkhaduong17@gmail.com
 *   5. Round pastel lavender scroll-to-top button
 */
export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Newsletter Section (Directly from Reference Image 2) */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-gradient-to-b from-stone-50 via-white to-purple-50/30 border-t border-slate-100 text-center relative overflow-hidden">
        {/* Decorative background light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/60 border border-purple-200/80 text-purple-700 text-xs font-semibold shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>Kết nối & Chia sẻ tri thức</span>
          </div>

          <h3 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Đăng ký Newsletter để nghe mình kể chuyện nhiều hơn
          </h3>

          <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
            Nhận thông báo về những câu chuyện dân gian mới, tư liệu văn hóa quý và trải nghiệm di sản số độc đáo ngay trong hộp thư của bạn.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold shadow-sm transition-all duration-300">
              <span>✦ Cảm ơn bạn! Chúng mình sẽ sớm gửi bản tin hữu ích đến bạn.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="w-full sm:flex-1 px-6 py-3.5 rounded-full border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c499f6] focus:ring-4 focus:ring-purple-100 transition-all font-medium shadow-sm hover:border-slate-300"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#c499f6] hover:bg-[#b585ea] text-white font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 hover:-translate-y-0.5"
              >
                Đăng ký
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 2. Deep Dark Footer (Directly matching Reference Image 1) */}
      <footer className="relative bg-[#0f1014] text-white pt-16 pb-14 px-6 md:px-12 lg:px-16 overflow-hidden border-t border-white/5">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Subtle purple indicator dot (top-left of footer as seen in Image 1) */}
          <div className="mb-6 flex items-center">
            <div className="w-4 h-4 rounded-full border-2 border-[#c499f6]/80 flex items-center justify-center shadow-[0_0_12px_rgba(196,153,246,0.6)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c499f6] animate-ping" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Column 1: Logo & Bio (md:col-span-5) */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-none font-sans">
                  MYSPACE
                </h2>
                <div className="text-[11px] md:text-xs font-bold tracking-[0.28em] text-[#c499f6] mt-2 uppercase">
                  PERSONAL WORKSPACE
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-md pt-2">
                MySpace AI là nơi mình chia sẻ kiến thức, tài liệu, công cụ và kinh nghiệm thực tế về lập kế hoạch &amp; xếp lịch cá nhân hóa - giúp bạn học dễ hơn, làm nhanh hơn và tự tin bắt đầu con đường của mình.
              </p>

              <div className="pt-2 text-xs text-slate-500">
                <span>Dự án Di sản Văn học các Dân tộc Thiểu số Việt Nam • By </span>
                <span className="text-slate-300 font-semibold">[KaD]</span>
              </div>
            </div>

            {/* Column 2: MENU (md:col-span-3) */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                MENU
              </h4>
              <ul className="space-y-3 text-sm font-medium text-slate-300">
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
                    Tác phẩm văn học
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
              </ul>
            </div>

            {/* Column 3: LIÊN HỆ (md:col-span-4) */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                LIÊN HỆ
              </h4>
              <ul className="space-y-3 text-sm font-medium text-slate-300">
                <li>
                  <a
                    href="https://www.tiktok.com/@duongpedri.n17"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-all inline-flex items-center gap-1.5 group hover:translate-x-1"
                  >
                    <span>TikTok</span>
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
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
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
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
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
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
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="mailto:nguyenkhaduong17@gmail.com"
                    className="hover:text-white transition-all flex items-center gap-2 group hover:translate-x-1"
                  >
                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#c499f6] transition-colors flex-shrink-0" />
                    <span className="break-all text-xs sm:text-sm">nguyenkhaduong17@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Floating Scroll To Top Button (Lavender Pill matching Image 1 & 2) */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} MYSPACE • Di Sản Văn Học. All rights reserved.
            </p>

            <button
              onClick={scrollToTop}
              aria-label="Cuộn lên đầu trang"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#c499f6] hover:bg-[#b585ea] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(196,153,246,0.35)] hover:shadow-[0_12px_32px_rgba(196,153,246,0.5)] transition-all duration-300 active:scale-95 group focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 hover:-translate-y-1"
            >
              <ChevronUp className="w-6 h-6 stroke-[3] group-hover:-translate-y-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
