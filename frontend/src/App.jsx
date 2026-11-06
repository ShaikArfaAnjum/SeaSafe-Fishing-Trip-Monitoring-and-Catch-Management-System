// Main application routing component using React Router v6.
// Organizes public, protected, and role-based routes with DashboardLayout.


import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Components
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Fisherman Pages
import FishermanHome from './pages/fisherman/FishermanHome';
import MyBoats from './pages/fisherman/MyBoats';
import StartTrip from './pages/fisherman/StartTrip';
import ActiveTrips from './pages/fisherman/ActiveTrips';
import AddCatch from './pages/fisherman/AddCatch';
import TripHistory from './pages/fisherman/TripHistory';
import PriceBoard from './pages/fisherman/PriceBoard';

// Officer Pages
import OfficerHome from './pages/officer/OfficerHome';
import BoatsAtSea from './pages/officer/BoatsAtSea';
import OverdueBoats from './pages/officer/OverdueBoats';
import EmergencyContacts from './pages/officer/EmergencyContacts';
import TripMonitoring from './pages/officer/TripMonitoring';
import AlertHistory from './pages/officer/AlertHistory';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBoats from './pages/admin/ManageBoats';
import ManagePrices from './pages/admin/ManagePrices';
import AllTrips from './pages/admin/AllTrips';
import Reports from './pages/admin/Reports';

// Root redirector based on authenticated user's role
function RootRedirect() {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.role === 'fisherman') return <Navigate to="/fisherman" replace />;
  if (user.role === 'officer') return <Navigate to="/officer" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Fisherman Routes */}
      <Route
        path="/fisherman"
        element={
          <ProtectedRoute allowedRoles={['fisherman']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FishermanHome />} />
        <Route path="boats" element={<MyBoats />} />
        <Route path="start-trip" element={<StartTrip />} />
        <Route path="active-trips" element={<ActiveTrips />} />
        <Route path="add-catch" element={<AddCatch />} />
        <Route path="history" element={<TripHistory />} />
        <Route path="prices" element={<PriceBoard />} />
      </Route>

      {/* Harbour Officer Routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={['officer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OfficerHome />} />
        <Route path="at-sea" element={<BoatsAtSea />} />
        <Route path="overdue" element={<OverdueBoats />} />
        <Route path="contacts" element={<EmergencyContacts />} />
        <Route path="monitoring" element={<TripMonitoring />} />
        <Route path="alerts" element={<AlertHistory />} />
      </Route>

      {/* Administrator Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="boats" element={<ManageBoats />} />
        <Route path="prices" element={<ManagePrices />} />
        <Route path="trips" element={<AllTrips />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

