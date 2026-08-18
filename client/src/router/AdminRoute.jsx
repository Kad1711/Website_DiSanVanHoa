import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/ui/Loading';

// Requires admin role
const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;
