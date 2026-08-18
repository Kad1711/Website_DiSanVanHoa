import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { displayName, email, password, confirmPassword } = formData;

    if (!displayName || !email || !password || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ thông tin.');
    }
    if (password !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.');
    }
    if (password.length < 6) {
      return toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    
    try {
      setLoading(true);
      await register({ displayName, email, password });
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-lg section-padding min-h-[calc(100vh-64px)] flex items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto">
        <div className="card p-5 sm:p-8 shadow-xl rounded-2xl sm:rounded-3xl border border-gray-100 bg-white">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center mb-3 font-serif font-bold text-xl">
              DS
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Đăng ký tài khoản</h1>
            <p className="text-xs sm:text-sm text-gray-500">Tham gia cộng đồng Di Sản Văn Học</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="displayName">Tên hiển thị</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className="input"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.displayName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="Ví dụ: email@domain.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-3 text-sm sm:text-base font-bold shadow-md shadow-primary/30"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
