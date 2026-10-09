import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminRoute from './AdminRoute';
import Loading from '../components/ui/Loading';

// Public pages (Lazy loaded for optimal code-splitting and performance)
const HomePage              = lazy(() => import('../pages/public/HomePage'));
const WorksPage             = lazy(() => import('../pages/public/WorksPage'));
const WorkDetailPage        = lazy(() => import('../pages/public/WorkDetailPage'));
const EthnicGroupsPage      = lazy(() => import('../pages/public/EthnicGroupsPage'));
const EthnicGroupDetailPage = lazy(() => import('../pages/public/EthnicGroupDetailPage'));
const LocationDetailPage    = lazy(() => import('../pages/public/LocationDetailPage'));
const MapPage               = lazy(() => import('../pages/public/MapPage'));
const AboutPage             = lazy(() => import('../pages/public/AboutPage'));
const LoginPage             = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage          = lazy(() => import('../pages/public/RegisterPage'));
const NotFoundPage          = lazy(() => import('../pages/public/NotFoundPage'));

// Admin pages (Lazy loaded separately)
const DashboardPage         = lazy(() => import('../pages/admin/DashboardPage'));
const EthnicGroupListPage   = lazy(() => import('../pages/admin/ethnic-groups/EthnicGroupListPage'));
const EthnicGroupCreatePage = lazy(() => import('../pages/admin/ethnic-groups/EthnicGroupCreatePage'));
const EthnicGroupEditPage   = lazy(() => import('../pages/admin/ethnic-groups/EthnicGroupEditPage'));
const LocationListPage      = lazy(() => import('../pages/admin/locations/LocationListPage'));
const LocationCreatePage    = lazy(() => import('../pages/admin/locations/LocationCreatePage'));
const LocationEditPage      = lazy(() => import('../pages/admin/locations/LocationEditPage'));
const CategoryListPage      = lazy(() => import('../pages/admin/categories/CategoryListPage'));
const WorkListPage          = lazy(() => import('../pages/admin/works/WorkListPage'));
const WorkCreatePage        = lazy(() => import('../pages/admin/works/WorkCreatePage'));
const WorkEditPage          = lazy(() => import('../pages/admin/works/WorkEditPage'));
const UserListPage          = lazy(() => import('../pages/admin/users/UserListPage'));

const AppRouter = () => (
  <Suspense fallback={<Loading fullPage />}>
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/works"                 element={<WorksPage />} />
        <Route path="/works/:slug"           element={<WorkDetailPage />} />
        <Route path="/ethnic-groups"         element={<EthnicGroupsPage />} />
        <Route path="/ethnic-groups/:slug"   element={<EthnicGroupDetailPage />} />
        <Route path="/locations/:slug"       element={<LocationDetailPage />} />
        <Route path="/map"                   element={<MapPage />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register"             element={<RegisterPage />} />
      </Route>

      {/* Admin routes – protected by AdminRoute */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"                              element={<DashboardPage />} />
          <Route path="/admin/ethnic-groups"               element={<EthnicGroupListPage />} />
          <Route path="/admin/ethnic-groups/create"        element={<EthnicGroupCreatePage />} />
          <Route path="/admin/ethnic-groups/:id/edit"      element={<EthnicGroupEditPage />} />
          <Route path="/admin/locations"                   element={<LocationListPage />} />
          <Route path="/admin/locations/create"            element={<LocationCreatePage />} />
          <Route path="/admin/locations/:id/edit"          element={<LocationEditPage />} />
          <Route path="/admin/categories"                  element={<CategoryListPage />} />
          <Route path="/admin/works"                       element={<WorkListPage />} />
          <Route path="/admin/works/create"                element={<WorkCreatePage />} />
          <Route path="/admin/works/:id/edit"              element={<WorkEditPage />} />
          <Route path="/admin/users"                       element={<UserListPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
