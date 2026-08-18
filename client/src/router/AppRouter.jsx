import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminRoute from './AdminRoute';

// Public pages
import HomePage              from '../pages/public/HomePage';
import WorksPage             from '../pages/public/WorksPage';
import WorkDetailPage        from '../pages/public/WorkDetailPage';
import EthnicGroupsPage      from '../pages/public/EthnicGroupsPage';
import EthnicGroupDetailPage from '../pages/public/EthnicGroupDetailPage';
import LocationDetailPage    from '../pages/public/LocationDetailPage';
import MapPage               from '../pages/public/MapPage';
import AboutPage             from '../pages/public/AboutPage';
import LoginPage             from '../pages/public/LoginPage';
import RegisterPage          from '../pages/public/RegisterPage';
import NotFoundPage          from '../pages/public/NotFoundPage';

// Admin pages
import DashboardPage            from '../pages/admin/DashboardPage';
import EthnicGroupListPage      from '../pages/admin/ethnic-groups/EthnicGroupListPage';
import EthnicGroupCreatePage    from '../pages/admin/ethnic-groups/EthnicGroupCreatePage';
import EthnicGroupEditPage      from '../pages/admin/ethnic-groups/EthnicGroupEditPage';
import LocationListPage         from '../pages/admin/locations/LocationListPage';
import LocationCreatePage       from '../pages/admin/locations/LocationCreatePage';
import LocationEditPage         from '../pages/admin/locations/LocationEditPage';
import WorkListPage             from '../pages/admin/works/WorkListPage';
import WorkCreatePage           from '../pages/admin/works/WorkCreatePage';
import WorkEditPage             from '../pages/admin/works/WorkEditPage';
import UserListPage             from '../pages/admin/users/UserListPage';

const AppRouter = () => (
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
        <Route path="/admin/works"                       element={<WorkListPage />} />
        <Route path="/admin/works/create"                element={<WorkCreatePage />} />
        <Route path="/admin/works/:id/edit"              element={<WorkEditPage />} />
        <Route path="/admin/users"                       element={<UserListPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;
