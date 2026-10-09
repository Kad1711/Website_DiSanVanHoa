import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AuthModal = () => {
  const { 
    authModalOpen, 
    authModalMode, 
    closeAuthModal, 
    setAuthModalMode, 
    login, 
    register 
  } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  // Lock background scroll when modal open
  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      return toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    try {
      setLoading(true);
      await login(loginForm);
      toast.success('Đăng nhập thành công!');
      closeAuthModal();
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { displayName, email, password, confirmPassword } = registerForm;

    if (!displayName || !email || !password || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ các thông tin.');
    }
    if (password !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.');
    }
    if (password.length < 6) {
      return toast.error('Mật khẩu phải chứa ít nhất 6 ký tự.');
    }

    try {
      setLoading(true);
      await register({ displayName, email, password });
      toast.success('Đăng ký tài khoản thành công!');
      closeAuthModal();
      setRegisterForm({ displayName: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Card - Styled per Reference Image 2 */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Đóng"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Top Branding Badge */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl mx-auto flex items-center justify-center mb-3 font-serif font-bold text-lg shadow-sm">
            DS
          </div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 mb-1">
            {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-sans">
            {isLogin ? 'Chào mừng trở lại Di Sản Văn Học' : 'Khám phá và lưu giữ di sản dân tộc cùng chúng tôi'}
          </p>
        </div>

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="modal-email">Email</label>
              <input
                id="modal-email"
                type="email"
                required
                className="input"
                placeholder="admin@disanvanhoc.vn"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="modal-password">Mật khẩu</label>
              <input
                id="modal-password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm sm:text-base font-bold shadow-md shadow-primary/25"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="label" htmlFor="modal-reg-name">Tên hiển thị</label>
              <input
                id="modal-reg-name"
                type="text"
                required
                className="input"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={registerForm.displayName}
                onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="modal-reg-email">Email</label>
              <input
                id="modal-reg-email"
                type="email"
                required
                className="input"
                placeholder="email@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="modal-reg-pass">Mật khẩu</label>
              <input
                id="modal-reg-pass"
                type="password"
                required
                className="input"
                placeholder="Ít nhất 6 ký tự"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="modal-reg-confirm">Xác nhận mật khẩu</label>
              <input
                id="modal-reg-confirm"
                type="password"
                required
                className="input"
                placeholder="Nhập lại mật khẩu"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm sm:text-base font-bold shadow-md shadow-primary/25"
            >
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}

        {/* Bottom Switcher */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
          {isLogin ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-primary font-bold hover:underline focus:outline-none ml-1"
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-primary font-bold hover:underline focus:outline-none ml-1"
              >
                Đăng nhập ngay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
