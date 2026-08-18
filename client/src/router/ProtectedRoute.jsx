import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/ui/Loading';

// Requires authenticated user
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
