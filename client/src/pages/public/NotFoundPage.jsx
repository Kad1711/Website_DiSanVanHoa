import { Link } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, MapIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center card p-8 sm:p-10 shadow-xl border border-gray-100">
      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center font-serif text-3xl font-bold mb-4">
        404
      </div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">Trang Không Tồn Tại</h1>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Địa chỉ bạn đang tìm kiếm có thể đã được di chuyển hoặc không còn tồn tại trong hệ thống di sản số.
      </p>

      <div className="space-y-3">
        <Link to="/" className="btn-primary w-full py-2.5 text-sm rounded-xl">
          <HomeIcon className="w-4 h-4" /> Về Trang Chủ
        </Link>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link to="/works" className="btn-outline py-2 text-xs rounded-xl flex items-center justify-center gap-1.5">
            <BookOpenIcon className="w-4 h-4" /> Tác Phẩm
          </Link>
          <Link to="/map" className="btn-outline py-2 text-xs rounded-xl flex items-center justify-center gap-1.5">
            <MapIcon className="w-4 h-4" /> Bản Đồ
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
