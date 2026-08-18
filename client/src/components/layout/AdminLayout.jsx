import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, MapPinIcon, BookOpenIcon, UsersIcon,
  PhotoIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin',               label: 'Dashboard',    icon: HomeIcon,      exact: true },
  { to: '/admin/ethnic-groups', label: 'Dân tộc',      icon: UsersIcon },
  { to: '/admin/locations',     label: 'Địa điểm',     icon: MapPinIcon },
  { to: '/admin/works',         label: 'Tác phẩm',     icon: BookOpenIcon },
  { to: '/admin/users',         label: 'Người dùng',   icon: UsersIcon },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất.');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full bg-gray-900 text-gray-300 ${mobile ? 'w-72 max-w-[85vw]' : 'w-60'}`}>
      {/* Brand */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">DS</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Di Sản Văn Học</p>
            <p className="text-gray-500 text-[11px]">Quản trị hệ thống</p>
          </div>
        </Link>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            aria-label="Đóng menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminNav.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/30">
            {user?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.displayName}</p>
            <p className="text-gray-500 text-[10px]">Quản trị viên</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-gray-800 font-medium"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-400" /> Đăng xuất
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          <div className="z-10 shadow-2xl">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-14 flex items-center px-3.5 sm:px-6 gap-3 flex-shrink-0 border-b border-gray-100">
          <button
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu quản trị"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-serif font-bold text-gray-800 text-sm">Quản trị</span>
          </div>

          <div className="flex-1" />
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-primary px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200/80 transition-colors"
          >
            <span>← Xem website</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
