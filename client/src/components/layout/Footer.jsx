import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="container-lg py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="font-serif font-bold text-white text-lg">Di Sản Văn Học</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Không gian văn học số các dân tộc thiểu số Việt Nam – lưu giữ và lan tỏa kho tàng văn hóa phong phú.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-semibold text-white mb-4">Khám phá</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['/works', 'Tác phẩm văn học'],
              ['/ethnic-groups', 'Dân tộc thiểu số'],
              ['/map', 'Bản đồ văn học số'],
              ['/about', 'Giới thiệu dự án'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-secondary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-semibold text-white mb-4">Thông tin</h4>
          <p className="text-sm text-gray-400 mb-1">Dự án môn học</p>
          <p className="text-sm text-gray-400 mb-1">Trường: <span className="text-gray-300">[Trường đại học Sư phạm - Đại học Đà Nẵng]</span></p>
          <p className="text-sm text-gray-400">By: <span className="text-gray-300">[KaD]</span></p>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Di Sản Văn Học. Thực hiện bởi KaD.
      </div>
    </div>
  </footer>
);

export default Footer;
