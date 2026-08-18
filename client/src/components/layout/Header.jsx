import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/',               label: 'Trang chủ' },
  { to: '/works',          label: 'Tác phẩm' },
  { to: '/ethnic-groups',  label: 'Dân tộc' },
  { to: '/map',            label: 'Bản đồ' },
  { to: '/about',          label: 'Giới thiệu' },
];

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất.');
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container-lg flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20">
            <span className="text-white font-bold text-xs sm:text-sm tracking-wider">DS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-gray-800 text-base sm:text-lg leading-tight">Di Sản Văn Học</span>
            <span className="text-[10px] text-gray-400 font-medium hidden sm:block">Dân tộc thiểu số Việt Nam</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/10 font-bold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 border border-gray-200/60"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{user.displayName}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 badge badge-primary text-[10px]">Quản trị viên</span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <Cog6ToothIcon className="w-4 h-4 text-primary" /> Trang quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left font-medium"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <XMarkIcon className="w-6 h-6 text-gray-900" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/10 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* User actions in Mobile Menu */}
          {user ? (
            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                </div>
                {isAdmin && <span className="badge badge-primary text-[10px]">Admin</span>}
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10"
                >
                  <Cog6ToothIcon className="w-4 h-4" /> Trang quản trị (Admin)
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 btn-outline text-center text-sm py-2.5"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 btn-primary text-center text-sm py-2.5"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
