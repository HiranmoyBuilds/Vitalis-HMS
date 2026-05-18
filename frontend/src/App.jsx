import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';

// Admin Layouts & Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminBilling from './pages/admin/AdminBilling';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';

// Patient Layouts & Pages
import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientRecords from './pages/patient/PatientRecords';
import PatientTelemedicine from './pages/patient/PatientTelemedicine';
import PatientBilling from './pages/patient/PatientBilling';
import PatientMessages from './pages/patient/PatientMessages';
import Login from './pages/Login';

// Public Layout & Pages
import Home from './pages/Home';

// Protected Route Wrapper for Admin
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login/admin" />;
  if (user.role !== 'admin' && user.role !== 'staff' && user.role !== 'doctor') return <Navigate to="/patient" />;
  return children;
};

// Protected Route Wrapper for Patient
const PatientRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login/patient" />;
  if (user.role !== 'patient') return <Navigate to="/admin" />;
  return children;
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login/admin" element={<Login type="admin" />} />
        <Route path="/login/patient" element={<Login type="patient" />} />
        <Route path="/login" element={<Navigate to="/login/patient" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient" element={<PatientRoute><PatientLayout /></PatientRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="telemedicine" element={<PatientTelemedicine />} />
          <Route path="billing" element={<PatientBilling />} />
          <Route path="messages" element={<PatientMessages />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Toaster richColors position="top-right" />
            <AnimatedRoutes />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
